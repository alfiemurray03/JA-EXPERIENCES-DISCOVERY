/**
 * GET /api/admin/builder-templates
 * Returns all templates (or filtered by builderId) from ja_builder_templates.
 * Admin session required.
 * Query params: builderId, status, search, page, limit
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_templates } from '../../../db/schema.js';
import { eq, asc, like, and, or } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const builderId = req.query.builderId as string | undefined;
  const status    = req.query.status    as string | undefined;
  const search    = req.query.search    as string | undefined;

  try {
    let query = db.select().from(ja_builder_templates).$dynamic();

    const conditions = [];
    if (builderId) conditions.push(eq(ja_builder_templates.builderId, builderId));
    if (status)    conditions.push(eq(ja_builder_templates.status, status));
    if (search) {
      const like_ = `%${search}%`;
      conditions.push(
        or(
          like(ja_builder_templates.name, like_),
          like(ja_builder_templates.description, like_),
          like(ja_builder_templates.category, like_),
        )
      );
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    query = query.orderBy(asc(ja_builder_templates.builderId), asc(ja_builder_templates.sortOrder), asc(ja_builder_templates.id));

    const rows = await query;

    const templates = rows.map(row => ({
      id:               row.id,
      templateId:       row.templateId,
      builderId:        row.builderId,
      name:             row.name,
      description:      row.description ?? '',
      category:         row.category,
      subcategory:      row.subcategory ?? null,
      industries:       row.industries ? (() => { try { return JSON.parse(row.industries!); } catch { return []; } })() : [],
      planRequired:     row.planRequired,
      accessLevel:      row.accessLevel ?? 'all',
      orgRestriction:   row.orgRestriction ?? null,
      status:           row.status,
      popular:          row.popular ?? false,
      isFeatured:       row.isFeatured ?? false,
      isDraft:          row.isDraft ?? false,
      isPublished:      row.isPublished ?? true,
      isArchived:       row.isArchived ?? false,
      supportsBranding: row.supportsBranding ?? false,
      showDocHeader:    row.showDocHeader ?? false,
      accentColor:      row.accentColor ?? null,
      defaultLayout:    row.defaultLayout ?? null,
      bodyTemplate:     row.bodyTemplate ?? '',
      fields:           row.fields ? (() => { try { return JSON.parse(row.fields!); } catch { return []; } })() : [],
      layoutConfig:     row.layoutConfig ? (() => { try { return JSON.parse(row.layoutConfig!); } catch { return null; } })() : null,
      requiredFields:   row.requiredFields ? (() => { try { return JSON.parse(row.requiredFields!); } catch { return []; } })() : [],
      optionalFields:   row.optionalFields ? (() => { try { return JSON.parse(row.optionalFields!); } catch { return []; } })() : [],
      tags:             row.tags ? (() => { try { return JSON.parse(row.tags!); } catch { return []; } })() : [],
      sortOrder:        row.sortOrder ?? 0,
      version:          row.version ?? 1,
      versionNotes:     row.versionNotes ?? null,
      thumbnailUrl:     row.thumbnailUrl ?? null,
      previewUrl:       row.previewUrl ?? null,
      useCount:         row.useCount ?? 0,
      createdBy:        row.createdBy ?? null,
      updatedBy:        row.updatedBy ?? null,
      createdAt:        row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      updatedAt:        row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    }));

    return res.json({ success: true, templates, total: templates.length });
  } catch (err) {
    console.error('GET /api/admin/builder-templates error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
