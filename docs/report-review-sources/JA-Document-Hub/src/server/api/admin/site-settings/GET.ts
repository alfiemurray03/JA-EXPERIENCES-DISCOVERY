/**
 * GET /api/admin/site-settings
 * Returns all site settings as a key-value map. Admin auth required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_site_settings } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db.select().from(ja_site_settings);
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.settingKey] = row.value;
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('admin.site-settings.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
