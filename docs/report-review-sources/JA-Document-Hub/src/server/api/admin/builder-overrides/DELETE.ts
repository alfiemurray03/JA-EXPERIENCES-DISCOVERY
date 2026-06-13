/**
 * DELETE /api/admin/builder-overrides
 * Remove a template override (resets to code default).
 * Body: { builderId, templateId }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_template_overrides } from '../../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';
import { logAdminAction } from '../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const { builderId, templateId } = req.body as { builderId?: string; templateId?: string };
  if (!builderId || !templateId) {
    return res.status(400).json({ success: false, error: 'builderId and templateId are required.' });
  }

  try {
    await db.delete(ja_builder_template_overrides).where(
      and(
        eq(ja_builder_template_overrides.builderId, builderId),
        eq(ja_builder_template_overrides.templateId, templateId),
      )
    );
    await logAdminAction(adminEmail, 'builder_template_reset', `${builderId}/${templateId}`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/builder-overrides error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
