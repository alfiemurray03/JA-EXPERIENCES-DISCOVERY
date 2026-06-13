/**
 * PATCH /api/admin/signing/:id
 * Admin: cancel a signing request or update its status.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_signing_requests } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';
import { logSigningAudit } from '../../../signing/_email-helpers.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const admin = await requireAdminRole(req, res, []);
  if (!admin) return;

  const { id } = req.params;
  const [request] = await db.select().from(ja_signing_requests).where(eq(ja_signing_requests.uuid, id)).limit(1);
  if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

  const { action } = req.body as { action?: string };

  if (action === 'cancel') {
    if (request.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Completed documents cannot be cancelled.' });
    }
    await db.update(ja_signing_requests)
      .set({ status: 'cancelled', cancelledAt: new Date(), cancelledBy: -1, updatedAt: new Date() })
      .where(eq(ja_signing_requests.id, request.id));
    await logSigningAudit(request.id, null, null, null, 'cancelled', `Cancelled by admin ${admin.email}`, req.ip ?? null, req.headers['user-agent'] ?? null, null, null);
    await logAdminAction(admin.email, 'signing.cancel', `Cancelled signing request ${request.uuid} ("${request.title}")`, req);
    return res.json({ success: true, message: 'Signing request cancelled.' });
  }

  return res.status(400).json({ success: false, error: 'Invalid action.' });
}
