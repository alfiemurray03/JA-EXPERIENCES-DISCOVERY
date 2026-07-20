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

  const normalisedSettings = { ...settings };
  if (Object.prototype.hasOwnProperty.call(normalisedSettings, 'google_analytics_id')) {
    const measurementId = String(normalisedSettings.google_analytics_id ?? '').trim().toUpperCase();
    if (measurementId && !/^G-[A-Z0-9]{4,20}$/.test(measurementId)) {
      return res.status(400).json({
        success: false,
        error: 'Google Analytics ID must be a valid GA4 Measurement ID beginning with G-.',
        code: 'INVALID_GOOGLE_ANALYTICS_ID',
      });
    }
    normalisedSettings.google_analytics_id = measurementId;
  }

  try {
    for (const [key, value] of Object.entries(normalisedSettings)) {
      await db.execute(
        sql`INSERT INTO ja_site_settings (setting_key, value, updated_by, updated_at)
            VALUES (${key}, ${String(value)}, ${identity.email}, NOW())
            ON DUPLICATE KEY UPDATE value = ${String(value)}, updated_by = ${identity.email}, updated_at = NOW()`
      );
    }
    await logAdminAction(identity.email, 'site_settings_update', `Updated ${Object.keys(normalisedSettings).length} site setting(s)`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin.site-settings.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
