/**
 * GET /api/signing/requests
 * List the authenticated user's signing requests.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_signing_requests, ja_signing_signers } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  try {
    const requests = await db
      .select()
      .from(ja_signing_requests)
      .where(eq(ja_signing_requests.userId, userId as number))
      .orderBy(desc(ja_signing_requests.createdAt))
      .limit(200);

    // Attach signer counts
    const enriched = await Promise.all(requests.map(async (r) => {
      const signers = await db
        .select({ id: ja_signing_signers.id, status: ja_signing_signers.status })
        .from(ja_signing_signers)
        .where(eq(ja_signing_signers.requestId, r.id));
      return {
        ...r,
        signerCount: signers.length,
        signedCount: signers.filter(s => s.status === 'signed').length,
      };
    }));

    return res.json({ success: true, requests: enriched });
  } catch (err) {
    console.error('signing.requests.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load signing requests.' });
  }
}
