/**
 * POST /api/admin/builder-overrides
 * Upsert a template override for a builder template.
 * Body: { builderId, templateId, ...fields }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';
import { logAdminAction } from '../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const {
    builderId, templateId,
    name, description, category, status, planRequired,
    accentColor, defaultLayout, bodyTemplate, fieldsOverride, popular,
    updatedBy,
  } = req.body as {
    builderId: string; templateId: string;
    name?: string; description?: string; category?: string;
    status?: string; planRequired?: string; accentColor?: string;
    defaultLayout?: string; bodyTemplate?: string;
    fieldsOverride?: unknown[];   // JSON array of BuilderField
    popular?: boolean;
    updatedBy?: string;
  };

  if (!builderId?.trim() || !templateId?.trim()) {
    return res.status(400).json({ success: false, error: 'builderId and templateId are required.' });
  }

  try {
    // MySQL UPSERT via INSERT ... ON DUPLICATE KEY UPDATE
    await db.execute(sql`
      INSERT INTO ja_builder_template_overrides
        (builder_id, template_id, name, description, category, status, plan_required,
         accent_color, default_layout, body_template, fields_override, popular, updated_by, updated_at)
      VALUES
        (${builderId}, ${templateId},
         ${name ?? null}, ${description ?? null}, ${category ?? null},
         ${status ?? null}, ${planRequired ?? null},
         ${accentColor ?? null}, ${defaultLayout ?? null},
         ${bodyTemplate ?? null},
         ${fieldsOverride !== undefined ? JSON.stringify(fieldsOverride) : null},
         ${popular ?? null},
         ${updatedBy ?? null}, NOW())
      ON DUPLICATE KEY UPDATE
        name           = COALESCE(VALUES(name), name),
        description    = COALESCE(VALUES(description), description),
        category       = COALESCE(VALUES(category), category),
        status         = COALESCE(VALUES(status), status),
        plan_required  = COALESCE(VALUES(plan_required), plan_required),
        accent_color   = COALESCE(VALUES(accent_color), accent_color),
        default_layout = COALESCE(VALUES(default_layout), default_layout),
        body_template  = COALESCE(VALUES(body_template), body_template),
        fields_override = COALESCE(VALUES(fields_override), fields_override),
        popular        = COALESCE(VALUES(popular), popular),
        updated_by     = COALESCE(VALUES(updated_by), updated_by),
        updated_at     = NOW()
    `);

    await logAdminAction(adminEmail, 'builder_template_override', `${builderId}/${templateId}`, req);

    return res.json({ success: true });
  } catch (err) {
    console.error('POST /api/admin/builder-overrides error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
