/**
 * GET /api/builders/templates?builderId=letter
 * Returns all active templates for a given builder, loaded from DB.
 * Requires user session (customer or admin).
 *
 * Response: { success: true, templates: BuilderTemplate[] }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_templates } from '../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';
import type { BuilderTemplate } from '../../../../lib/builder-framework.js';

export default async function handler(req: Request, res: Response) {
  // Require a valid user session (customer OIDC)
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required.', code: 'NOT_AUTHENTICATED' });
  }

  const builderId = req.query.builderId as string | undefined;
  if (!builderId?.trim()) {
    return res.status(400).json({ success: false, error: 'builderId query parameter is required.' });
  }

  try {
    const rows = await db
      .select()
      .from(ja_builder_templates)
      .where(eq(ja_builder_templates.builderId, builderId.trim()))
      .orderBy(asc(ja_builder_templates.sortOrder), asc(ja_builder_templates.id));

    const templates: BuilderTemplate[] = rows.map(row => {
      let fields: BuilderTemplate['fields'] = [];
      let industries: BuilderTemplate['industries'] = [];

      try { fields = row.fields ? JSON.parse(row.fields) : []; } catch { /* ignore */ }
      try { industries = row.industries ? JSON.parse(row.industries) : []; } catch { /* ignore */ }

      return {
        id:               row.templateId,
        builderId:        row.builderId as BuilderTemplate['builderId'],
        name:             row.name,
        description:      row.description ?? '',
        category:         row.category,
        industries:       industries,
        planRequired:     row.planRequired as BuilderTemplate['planRequired'],
        status:           row.status as BuilderTemplate['status'],
        popular:          row.popular ?? false,
        supportsBranding: row.supportsBranding ?? false,
        showDocHeader:    row.showDocHeader ?? false,
        accentColor:      row.accentColor ?? undefined,
        defaultLayout:    row.defaultLayout as BuilderTemplate['defaultLayout'] ?? undefined,
        bodyTemplate:     row.bodyTemplate ?? '',
        fields,
        order:            row.sortOrder ?? 0,
      };
    });

    return res.json({ success: true, templates });
  } catch (err) {
    console.error('GET /api/builders/templates error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load templates.' });
  }
}
