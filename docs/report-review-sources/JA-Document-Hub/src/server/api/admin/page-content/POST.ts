/**
 * POST /api/admin/page-content
 * Create or update (upsert by slug) a CMS content block.
 * Body: { slug, title, type, status, bodyHtml, bodyText, metaTitle, metaDesc }
 */
import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_page_content } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';
import { logAdminAction } from '../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  const { slug, title, type, status, bodyHtml, bodyText, metaTitle, metaDesc } = req.body as {
    slug: string; title: string; type?: string; status?: string;
    bodyHtml?: string; bodyText?: string; metaTitle?: string; metaDesc?: string;
  };

  if (!slug || !title) return res.status(400).json({ success: false, error: 'slug and title are required.' });

  try {
    // Check if exists
    const existing = await db.select({ id: ja_page_content.id, version: ja_page_content.version })
      .from(ja_page_content).where(eq(ja_page_content.slug, slug)).limit(1);

    if (existing.length > 0) {
      // Update
      await db.update(ja_page_content).set({
        title,
        type: type ?? 'marketing',
        status: (status ?? 'draft') as 'published' | 'draft' | 'archived',
        bodyHtml: bodyHtml ?? null,
        bodyText: bodyText ?? null,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        updatedBy: identity.email,
        version: (existing[0].version ?? 1) + 1,
        updatedAt: new Date(),
      }).where(eq(ja_page_content.slug, slug));
    } else {
      // Insert
      await db.insert(ja_page_content).values({
        slug, title,
        type: type ?? 'marketing',
        status: (status ?? 'draft') as 'published' | 'draft' | 'archived',
        bodyHtml: bodyHtml ?? null,
        bodyText: bodyText ?? null,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        updatedBy: identity.email,
        version: 1,
      });
    }

    await logAdminAction(identity.email, 'content_edit', `Content block "${slug}" saved`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin.page-content.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
