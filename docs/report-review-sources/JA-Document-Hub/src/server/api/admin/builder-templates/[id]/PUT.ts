/**
 * PUT /api/admin/builder-templates/:id
 * Update a template in ja_builder_templates. Increments version on bodyTemplate change.
 * Admin session required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_builder_templates } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid template ID.' });

  const body = req.body as Record<string, unknown>;

  try {
    // Fetch current row to check version bump
    const [current] = await db.select().from(ja_builder_templates).where(eq(ja_builder_templates.id, id)).limit(1);
    if (!current) return res.status(404).json({ success: false, error: 'Template not found.' });

    const bodyChanged = body.bodyTemplate !== undefined && body.bodyTemplate !== current.bodyTemplate;
    const newVersion  = bodyChanged ? (current.version ?? 1) + 1 : (current.version ?? 1);

    await db.update(ja_builder_templates).set({
      ...(body.name            !== undefined && { name:            String(body.name) }),
      ...(body.description     !== undefined && { description:     body.description ? String(body.description) : null }),
      ...(body.category        !== undefined && { category:        String(body.category) }),
      ...(body.subcategory     !== undefined && { subcategory:     body.subcategory ? String(body.subcategory) : null }),
      ...(body.industries      !== undefined && { industries:      body.industries ? JSON.stringify(body.industries) : null }),
      ...(body.planRequired    !== undefined && { planRequired:    String(body.planRequired) }),
      ...(body.accessLevel     !== undefined && { accessLevel:     String(body.accessLevel) }),
      ...(body.orgRestriction  !== undefined && { orgRestriction:  body.orgRestriction ? String(body.orgRestriction) : null }),
      ...(body.status          !== undefined && { status:          String(body.status) }),
      ...(body.popular         !== undefined && { popular:         Boolean(body.popular) }),
      ...(body.isFeatured      !== undefined && { isFeatured:      Boolean(body.isFeatured) }),
      ...(body.isDraft         !== undefined && { isDraft:         Boolean(body.isDraft) }),
      ...(body.isPublished     !== undefined && { isPublished:     Boolean(body.isPublished) }),
      ...(body.isArchived      !== undefined && { isArchived:      Boolean(body.isArchived) }),
      ...(body.supportsBranding !== undefined && { supportsBranding: Boolean(body.supportsBranding) }),
      ...(body.showDocHeader   !== undefined && { showDocHeader:   Boolean(body.showDocHeader) }),
      ...(body.accentColor     !== undefined && { accentColor:     body.accentColor ? String(body.accentColor) : null }),
      ...(body.defaultLayout   !== undefined && { defaultLayout:   body.defaultLayout ? String(body.defaultLayout) : null }),
      ...(body.bodyTemplate    !== undefined && { bodyTemplate:    body.bodyTemplate ? String(body.bodyTemplate) : null }),
      ...(body.fields          !== undefined && { fields:          body.fields ? JSON.stringify(body.fields) : null }),
      ...(body.layoutConfig    !== undefined && { layoutConfig:    body.layoutConfig ? JSON.stringify(body.layoutConfig) : null }),
      ...(body.requiredFields  !== undefined && { requiredFields:  body.requiredFields ? JSON.stringify(body.requiredFields) : null }),
      ...(body.optionalFields  !== undefined && { optionalFields:  body.optionalFields ? JSON.stringify(body.optionalFields) : null }),
      ...(body.tags            !== undefined && { tags:            body.tags ? JSON.stringify(body.tags) : null }),
      ...(body.sortOrder       !== undefined && { sortOrder:       Number(body.sortOrder) }),
      ...(body.versionNotes    !== undefined && { versionNotes:    body.versionNotes ? String(body.versionNotes) : null }),
      ...(body.thumbnailUrl    !== undefined && { thumbnailUrl:    body.thumbnailUrl ? String(body.thumbnailUrl) : null }),
      ...(body.previewUrl      !== undefined && { previewUrl:      body.previewUrl ? String(body.previewUrl) : null }),
      version:   newVersion,
      updatedBy: identity.email,
    }).where(eq(ja_builder_templates.id, id));

    return res.json({ success: true, version: newVersion, versionBumped: bodyChanged });
  } catch (err) {
    console.error('PUT /api/admin/builder-templates/:id error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
