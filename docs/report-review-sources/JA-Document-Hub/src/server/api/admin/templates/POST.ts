/**
 * POST /api/admin/templates
 * Create a new DB-driven template.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_custom_templates } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

interface TemplateBody {
  templateId: string;
  name: string;
  category?: string;
  description: string;
  icon?: string;
  planRequired?: 'free' | 'business' | 'professional';
  tags?: string[];
  sections: unknown[];
  generateFn: string;
  createdBy?: string;
}

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const body = req.body as TemplateBody;

    if (!body.templateId?.trim()) return res.status(400).json({ success: false, error: 'templateId is required.' });
    if (!body.name?.trim())       return res.status(400).json({ success: false, error: 'name is required.' });
    if (!body.description?.trim()) return res.status(400).json({ success: false, error: 'description is required.' });
    if (!body.sections || !Array.isArray(body.sections)) return res.status(400).json({ success: false, error: 'sections must be an array.' });
    if (!body.generateFn?.trim()) return res.status(400).json({ success: false, error: 'generateFn is required.' });

    const uuid = crypto.randomUUID();

    await db.insert(ja_custom_templates).values({
      uuid,
      templateId:   body.templateId.trim().toLowerCase().replace(/\s+/g, '-'),
      name:         body.name.trim(),
      category:     body.category ?? 'business',
      description:  body.description.trim(),
      icon:         body.icon ?? 'FileText',
      planRequired: body.planRequired ?? 'free',
      tags:         JSON.stringify(body.tags ?? []),
      sections:     JSON.stringify(body.sections),
      generateFn:   body.generateFn,
      isActive:     true,
      isCustom:     true,
      createdBy:    body.createdBy ?? 'admin',
    });

    return res.status(201).json({ success: true, message: 'Template created.', uuid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Duplicate entry')) {
      return res.status(400).json({ success: false, error: 'A template with that ID already exists.' });
    }
    console.error('POST /api/admin/templates error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
