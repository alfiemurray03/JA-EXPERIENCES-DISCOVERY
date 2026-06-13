/**
 * DELETE /api/admin/page-content/:slug
 * Archive (soft-delete) a CMS content block.
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_page_content } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  const { slug } = req.params;
  try {
    await db.update(ja_page_content)
      .set({ status: 'archived', updatedBy: identity.email, updatedAt: new Date() })
      .where(eq(ja_page_content.slug, slug));
    await logAdminAction(identity.email, 'content_delete', `Content block "${slug}" archived`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin.page-content.delete.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
