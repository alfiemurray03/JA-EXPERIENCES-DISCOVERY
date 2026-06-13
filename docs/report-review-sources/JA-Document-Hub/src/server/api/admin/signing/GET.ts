/**
 * GET /api/admin/signing
 * Admin: list all signing requests with signer counts and status.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_users } from '../../../db/schema.js';
import { eq, desc, like, or } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const admin = await requireAdminRole(req, res, []);
  if (!admin) return;

  const { search, status, limit = '100', offset = '0' } = req.query as Record<string, string>;

  try {
    let requests = await db
      .select({
        id: ja_signing_requests.id,
        uuid: ja_signing_requests.uuid,
        userId: ja_signing_requests.userId,
        title: ja_signing_requests.title,
        status: ja_signing_requests.status,
        signerOrder: ja_signing_requests.signerOrder,
        expiresAt: ja_signing_requests.expiresAt,
        completedAt: ja_signing_requests.completedAt,
        createdAt: ja_signing_requests.createdAt,
        updatedAt: ja_signing_requests.updatedAt,
        documentName: ja_signing_requests.documentName,
      })
      .from(ja_signing_requests)
      .orderBy(desc(ja_signing_requests.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Filter by status
    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status);
    }

    // Enrich with owner and signer counts
    const enriched = await Promise.all(requests.map(async (r) => {
      const [owner] = await db.select({ firstName: ja_users.firstName, lastName: ja_users.lastName, email: ja_users.email })
        .from(ja_users).where(eq(ja_users.id, r.userId)).limit(1);
      const signers = await db.select({ status: ja_signing_signers.status })
        .from(ja_signing_signers).where(eq(ja_signing_signers.requestId, r.id));
      return {
        ...r,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
        ownerEmail: owner?.email ?? '',
        signerCount: signers.length,
        signedCount: signers.filter(s => s.status === 'signed').length,
      };
    }));

    // Search filter
    const filtered = search
      ? enriched.filter(r =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
          r.ownerName.toLowerCase().includes(search.toLowerCase()),
        )
      : enriched;

    return res.json({ success: true, requests: filtered, total: filtered.length });
  } catch (err) {
    console.error('admin.signing.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load signing requests.' });
  }
}
