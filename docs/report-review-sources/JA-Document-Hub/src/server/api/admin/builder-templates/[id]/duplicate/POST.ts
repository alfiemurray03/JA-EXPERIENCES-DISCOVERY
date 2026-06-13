/**
 * POST /api/admin/builder-templates/:id/duplicate
 * Duplicate a template with a new templateId.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_builder_templates } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid template ID.' });

  try {
    const [src] = await db.select().from(ja_builder_templates).where(eq(ja_builder_templates.id, id)).limit(1);
    if (!src) return res.status(404).json({ success: false, error: 'Template not found.' });

    const newTemplateId = `${src.templateId}-copy-${Date.now()}`;
    const [result] = await db.insert(ja_builder_templates).values({
      templateId:       newTemplateId,
      builderId:        src.builderId,
      name:             `${src.name} (Copy)`,
      description:      src.description,
      category:         src.category,
      subcategory:      src.subcategory,
      industries:       src.industries,
      planRequired:     src.planRequired,
      accessLevel:      src.accessLevel ?? 'all',
      orgRestriction:   src.orgRestriction,
      status:           'draft',
      popular:          false,
      isFeatured:       false,
      isDraft:          true,
      isPublished:      false,
      isArchived:       false,
      supportsBranding: src.supportsBranding,
      showDocHeader:    src.showDocHeader,
      accentColor:      src.accentColor,
      defaultLayout:    src.defaultLayout,
      bodyTemplate:     src.bodyTemplate,
      fields:           src.fields,
      layoutConfig:     src.layoutConfig,
      requiredFields:   src.requiredFields,
      optionalFields:   src.optionalFields,
      tags:             src.tags,
      sortOrder:        (src.sortOrder ?? 0) + 1,
      version:          1,
      versionNotes:     `Duplicated from ${src.templateId}`,
      createdBy:        identity.email,
      updatedBy:        identity.email,
    });

    return res.status(201).json({
      success: true,
      id: (result as { insertId?: number }).insertId,
      templateId: newTemplateId,
    });
  } catch (err) {
    console.error('POST /api/admin/builder-templates/:id/duplicate error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
