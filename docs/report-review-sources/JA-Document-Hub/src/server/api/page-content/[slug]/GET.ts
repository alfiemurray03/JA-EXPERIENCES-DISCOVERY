/**
 * GET /api/page-content/:slug
 * Public endpoint — returns a single published CMS content block by slug.
 * No auth required. Returns 404 if not found or not published.
 */
import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_page_content } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  const { slug } = req.params;
  try {
    const rows = await db.select().from(ja_page_content)
      .where(and(eq(ja_page_content.slug, slug), eq(ja_page_content.status, 'published')))
      .limit(1);

    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found.' });
    return res.json({ success: true, item: rows[0] });
  } catch (err) {
    console.error('page-content.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
