/**
 * GET /api/admin/page-content
 * Returns all CMS content blocks. Admin auth required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_page_content } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';
import { desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db.select().from(ja_page_content).orderBy(desc(ja_page_content.updatedAt));
    return res.json({ success: true, items: rows });
  } catch (err) {
    console.error('admin.page-content.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
