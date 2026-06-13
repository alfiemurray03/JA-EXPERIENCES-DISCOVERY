/**
 * DELETE /api/admin/templates/:id
 * Permanently delete a DB-driven template.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_custom_templates } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminSession } from '../../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const id = parseInt(String(req.params.id ?? ''), 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id.' });

    await db.delete(ja_custom_templates).where(eq(ja_custom_templates.id, id));

    return res.json({ success: true, message: 'Template deleted.' });
  } catch (err) {
    console.error('DELETE /api/admin/templates/:id error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
