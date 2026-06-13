/**
 * DELETE /api/admin/builder-templates/:id
 * Hard-delete a template from ja_builder_templates.
 * Admin session required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_builder_templates } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid template ID.' });

  try {
    const [existing] = await db.select({ id: ja_builder_templates.id }).from(ja_builder_templates).where(eq(ja_builder_templates.id, id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, error: 'Template not found.' });

    await db.delete(ja_builder_templates).where(eq(ja_builder_templates.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/builder-templates/:id error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
