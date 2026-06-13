/**
 * GET /api/admin/builder-overrides?builderId=letter
 * Returns all DB-persisted overrides for a given builder (or all builders).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_template_overrides } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const builderId = req.query.builderId as string | undefined;
    const rows = builderId
      ? await db.select().from(ja_builder_template_overrides).where(eq(ja_builder_template_overrides.builderId, builderId))
      : await db.select().from(ja_builder_template_overrides);

    // Return as a map: templateId -> override object
    const overrides: Record<string, Record<string, unknown>> = {};
    for (const row of rows) {
      const key = row.templateId;
      const entry: Record<string, unknown> = {};
      if (row.name         !== null) entry.name         = row.name;
      if (row.description  !== null) entry.description  = row.description;
      if (row.category     !== null) entry.category     = row.category;
      if (row.status       !== null) entry.status       = row.status;
      if (row.planRequired !== null) entry.planRequired = row.planRequired;
      if (row.accentColor  !== null) entry.accentColor  = row.accentColor;
      if (row.defaultLayout !== null) entry.defaultLayout = row.defaultLayout;
      if (row.bodyTemplate !== null) entry.bodyTemplate = row.bodyTemplate;
      if (row.fieldsOverride !== null) {
        try { entry.fields = JSON.parse(row.fieldsOverride); } catch { /* ignore */ }
      }
      if (row.popular      !== null) entry.popular      = row.popular;
      overrides[key] = entry;
    }

    return res.json({ success: true, overrides });
  } catch (err) {
    console.error('GET /api/admin/builder-overrides error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
