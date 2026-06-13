/**
 * GET /api/legal?slug=privacy-policy
 * Returns the published content for a legal document.
 * Public endpoint — no auth required.
 * Returns { success, body, effectiveDate, version, updatedAt } or { success: false } if not found/not published.
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_system_config } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const slug = req.query.slug as string | undefined;
  if (!slug) return res.status(400).json({ success: false, error: 'slug is required.' });

  const slugKey = slug.replace(/-/g, '_');

  try {
    // Check status first
    const statusRow = await db.select().from(ja_system_config)
      .where(eq(ja_system_config.configKey, `legal_${slugKey}_status`));
    const status = String(statusRow[0]?.value ?? 'draft');

    if (status !== 'published') {
      return res.json({ success: false, reason: 'not_published' });
    }

    // Load all fields
    const keys = ['body', 'effectiveDate', 'version', 'updatedAt', 'publishedAt', 'title'];
    const rows = await Promise.all(
      keys.map(k => db.select().from(ja_system_config).where(eq(ja_system_config.configKey, `legal_${slugKey}_${k}`)))
    );

    const data: Record<string, string> = {};
    keys.forEach((k, i) => {
      if (rows[i][0]?.value) data[k] = String(rows[i][0].value);
    });

    if (!data.body) return res.json({ success: false, reason: 'no_content' });

    return res.json({
      success: true,
      slug,
      body: data.body,
      title: data.title ?? slug,
      effectiveDate: data.effectiveDate ?? '',
      version: parseInt(data.version ?? '1', 10),
      updatedAt: data.updatedAt ?? '',
      publishedAt: data.publishedAt ?? '',
    });
  } catch (err) {
    console.error('legal.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load legal document.' });
  }
}
