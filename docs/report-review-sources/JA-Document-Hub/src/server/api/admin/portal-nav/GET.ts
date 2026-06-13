/**
 * GET /api/admin/portal-nav
 *
 * Returns the full default nav structure plus current admin overrides.
 * Used by the admin portal-nav management page.
 * Requires admin session.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { guardAdminSession } from '../_admin-session.js';
import {
  DEFAULT_PORTAL_NAV,
  type PortalNavOverrides,
} from '../../../../lib/portal-nav.js';

export default async function handler(req: Request, res: Response) {
  const identity = await guardAdminSession(req, res);
  if (!identity) return;

  try {
    const rows = await db
      .select()
      .from(ja_system_config)
      .where(eq(ja_system_config.configKey, 'portal_nav_config'))
      .limit(1);

    let overrides: PortalNavOverrides = { visibility: {} };
    if (rows.length > 0 && rows[0].value) {
      try {
        overrides = JSON.parse(rows[0].value) as PortalNavOverrides;
      } catch {
        // Malformed — use defaults
      }
    }

    res.json({
      success: true,
      sections: DEFAULT_PORTAL_NAV,
      overrides,
    });
  } catch (err) {
    console.error('[admin portal-nav GET]', err);
    res.status(500).json({ success: false, error: 'Failed to load portal nav config.' });
  }
}
