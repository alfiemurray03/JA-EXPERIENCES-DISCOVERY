/**
 * POST /api/admin/site-settings
 * Upsert one or more site settings.
 * Body: { settings: Record<string, string> }
 */
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { requireAdminSession } from '../_admin-session.js';
import { logAdminAction } from '../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  const { settings } = req.body as { settings: Record<string, string> };
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, error: 'settings object required.' });
  }

  try {
    for (const [key, value] of Object.entries(settings)) {
      await db.execute(
        sql`INSERT INTO ja_site_settings (setting_key, value, updated_by, updated_at)
            VALUES (${key}, ${String(value)}, ${identity.email}, NOW())
            ON DUPLICATE KEY UPDATE value = ${String(value)}, updated_by = ${identity.email}, updated_at = NOW()`
      );
    }
    await logAdminAction(identity.email, 'site_settings_update', `Updated ${Object.keys(settings).length} site setting(s)`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin.site-settings.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
