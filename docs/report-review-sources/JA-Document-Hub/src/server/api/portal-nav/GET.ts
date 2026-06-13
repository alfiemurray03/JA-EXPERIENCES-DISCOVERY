/**
 * GET /api/portal-nav
 *
 * Returns the effective portal nav config — default structure merged with
 * any admin overrides stored in ja_system_config under key "portal_nav_config".
 *
 * No auth required: the sidebar structure itself is not sensitive.
 * Visibility overrides are applied server-side before responding.
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_system_config } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_PORTAL_NAV,
  applyPortalNavOverrides,
  type PortalNavOverrides,
} from '../../../lib/portal-nav.js';

export default async function handler(_req: Request, res: Response) {
  try {
    // Load overrides from DB (may not exist yet)
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

    const sections = applyPortalNavOverrides(DEFAULT_PORTAL_NAV, overrides);

    res.json({
      success: true,
      sections,
      overrides,
    });
  } catch (err) {
    console.error('[portal-nav GET]', err);
    // On error, return defaults so the sidebar still renders
    res.json({
      success: true,
      sections: DEFAULT_PORTAL_NAV,
      overrides: { visibility: {} },
    });
  }
}
