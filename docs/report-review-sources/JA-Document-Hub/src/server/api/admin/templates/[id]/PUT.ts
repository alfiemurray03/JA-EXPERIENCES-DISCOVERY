/**
 * PUT /api/admin/templates/:id
 * Update an existing DB-driven template by its numeric id.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_custom_templates } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const id = parseInt(String(req.params.id ?? ''), 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id.' });

    const body = req.body as {
      name?: string;
      category?: string;
      description?: string;
      icon?: string;
      planRequired?: 'free' | 'business' | 'professional';
      tags?: string[];
      sections?: unknown[];
      generateFn?: string;
      isActive?: boolean;
    };

    const updates: Record<string, unknown> = {};
    if (body.name        !== undefined) updates.name        = body.name;
    if (body.category    !== undefined) updates.category    = body.category;
    if (body.description !== undefined) updates.description = body.description;
    if (body.icon        !== undefined) updates.icon        = body.icon;
    if (body.planRequired !== undefined) updates.planRequired = body.planRequired;
    if (body.tags        !== undefined) updates.tags        = JSON.stringify(body.tags);
    if (body.sections    !== undefined) updates.sections    = JSON.stringify(body.sections);
    if (body.generateFn  !== undefined) updates.generateFn  = body.generateFn;
    if (body.isActive    !== undefined) updates.isActive    = body.isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    await db.update(ja_custom_templates).set(updates).where(eq(ja_custom_templates.id, id));

    return res.json({ success: true, message: 'Template updated.' });
  } catch (err) {
    console.error('PUT /api/admin/templates/:id error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
