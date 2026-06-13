/**
 * POST /api/admin/builder-templates
 * Create a new template in ja_builder_templates.
 * Admin session required.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_templates } from '../../../db/schema.js';
import { requireAdminRole } from '../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const body = req.body as Record<string, unknown>;

  if (!body.templateId || !body.builderId || !body.name || !body.category) {
    return res.status(400).json({ success: false, error: 'templateId, builderId, name, and category are required.' });
  }

  try {
    const [result] = await db.insert(ja_builder_templates).values({
      templateId:      String(body.templateId),
      builderId:       String(body.builderId),
      name:            String(body.name),
      description:     body.description ? String(body.description) : null,
      category:        String(body.category),
      subcategory:     body.subcategory ? String(body.subcategory) : null,
      industries:      body.industries ? JSON.stringify(body.industries) : null,
      planRequired:    body.planRequired ? String(body.planRequired) : 'free',
      accessLevel:     body.accessLevel ? String(body.accessLevel) : 'all',
      orgRestriction:  body.orgRestriction ? String(body.orgRestriction) : null,
      status:          body.status ? String(body.status) : 'active',
      popular:         Boolean(body.popular),
      isFeatured:      Boolean(body.isFeatured),
      isDraft:         Boolean(body.isDraft),
      isPublished:     body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      isArchived:      Boolean(body.isArchived),
      supportsBranding: Boolean(body.supportsBranding),
      showDocHeader:   Boolean(body.showDocHeader),
      accentColor:     body.accentColor ? String(body.accentColor) : null,
      defaultLayout:   body.defaultLayout ? String(body.defaultLayout) : null,
      bodyTemplate:    body.bodyTemplate ? String(body.bodyTemplate) : null,
      fields:          body.fields ? JSON.stringify(body.fields) : null,
      layoutConfig:    body.layoutConfig ? JSON.stringify(body.layoutConfig) : null,
      requiredFields:  body.requiredFields ? JSON.stringify(body.requiredFields) : null,
      optionalFields:  body.optionalFields ? JSON.stringify(body.optionalFields) : null,
      tags:            body.tags ? JSON.stringify(body.tags) : null,
      sortOrder:       body.sortOrder ? Number(body.sortOrder) : 0,
      version:         1,
      versionNotes:    body.versionNotes ? String(body.versionNotes) : null,
      thumbnailUrl:    body.thumbnailUrl ? String(body.thumbnailUrl) : null,
      previewUrl:      body.previewUrl ? String(body.previewUrl) : null,
      createdBy:       identity.email,
      updatedBy:       identity.email,
    });

    return res.status(201).json({ success: true, id: (result as { insertId?: number }).insertId });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('Duplicate entry')) {
      return res.status(409).json({ success: false, error: 'A template with this ID already exists for this builder.' });
    }
    console.error('POST /api/admin/builder-templates error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
