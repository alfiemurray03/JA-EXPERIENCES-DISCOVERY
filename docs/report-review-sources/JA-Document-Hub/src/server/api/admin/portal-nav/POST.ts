/**
 * POST /api/admin/portal-nav
 *
 * Saves admin overrides for the customer portal sidebar.
 * Body: { visibility: Record<string, boolean> }
 * Requires admin session.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { sql } from 'drizzle-orm';
import { guardAdminSession } from '../_admin-session.js';
import type { PortalNavOverrides } from '../../../../lib/portal-nav.js';

export default async function handler(req: Request, res: Response) {
  const identity = await guardAdminSession(req, res);
  if (!identity) return;

  try {
    const body = req.body as { visibility?: Record<string, boolean> };

    if (!body || typeof body.visibility !== 'object' || Array.isArray(body.visibility)) {
      return res.status(400).json({ success: false, error: 'Invalid payload. Expected { visibility: Record<string, boolean> }.' });
    }

    const overrides: PortalNavOverrides = { visibility: body.visibility };
    const value = JSON.stringify(overrides);

    // Upsert into ja_system_config
    await db.execute(sql`
      INSERT INTO ja_system_config (config_key, value, updated_at)
      VALUES ('portal_nav_config', ${value}, NOW())
      ON DUPLICATE KEY UPDATE value = ${value}, updated_at = NOW()
    `);

    res.json({ success: true, message: 'Portal nav config saved.' });
  } catch (err) {
    console.error('[admin portal-nav POST]', err);
    res.status(500).json({ success: false, error: 'Failed to save portal nav config.' });
  }
}
