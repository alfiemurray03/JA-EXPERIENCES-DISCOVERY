/**
 * GET /api/admin/builder-meta
 * Returns all builder-level meta overrides (label, description, accentColor).
 * Admin session required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_meta_overrides } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db.select().from(ja_builder_meta_overrides);
    // Return as map: builderId -> { label, description, accentColor }
    const meta: Record<string, { label?: string; description?: string; accentColor?: string }> = {};
    for (const row of rows) {
      meta[row.builderId] = {
        label:       row.label       ?? undefined,
        description: row.description ?? undefined,
        accentColor: row.accentColor ?? undefined,
      };
    }
    return res.json({ success: true, meta });
  } catch (err) {
    console.error('GET /api/admin/builder-meta error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
