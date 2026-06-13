/**
 * PATCH /api/admin/gdpr/:id
 * Update a GDPR request status.
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_gdpr_requests } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  const { id } = req.params;
  const { status, adminNotes } = req.body as { status?: string; adminNotes?: string };

  const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Valid status required.' });
  }

  try {
    const rows = await db.select().from(ja_gdpr_requests).where(eq(ja_gdpr_requests.id, Number(id))).limit(1);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Request not found.' });

    await db.update(ja_gdpr_requests).set({
      status: status as 'pending' | 'processing' | 'completed' | 'rejected',
      adminNotes: adminNotes?.trim() || null,
      processedBy: identity.email,
      processedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(ja_gdpr_requests.id, Number(id)));

    await logAdminAction(identity.email, 'gdpr.update', `Updated GDPR request #${id} to ${status}`, req);
    return res.json({ success: true, message: 'GDPR request updated.' });
  } catch (err) {
    console.error('admin.gdpr.patch.error', err);
    return res.status(500).json({ success: false, error: 'Failed to update request.' });
  }
}
