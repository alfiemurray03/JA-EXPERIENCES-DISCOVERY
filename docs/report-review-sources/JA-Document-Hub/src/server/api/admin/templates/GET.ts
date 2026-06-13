/**
 * GET /api/admin/templates
 * Returns all DB-stored custom/overridden templates.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_custom_templates } from '../../../db/schema.js';
import { desc } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db
      .select()
      .from(ja_custom_templates)
      .orderBy(desc(ja_custom_templates.createdAt));

    const templates = rows.map(r => ({
      ...r,
      tags: r.tags ? (JSON.parse(r.tags) as string[]) : [],
      sections: JSON.parse(r.sections) as unknown[],
    }));

    return res.json({ success: true, templates });
  } catch (err) {
    console.error('GET /api/admin/templates error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
