/**
 * POST /api/admin/builder-meta
 * Upsert builder-level meta override (label, description, accentColor).
 * Admin session required.
 *
 * Body: { builderId, label?, description?, accentColor? }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_meta_overrides } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  const { builderId, label, description, accentColor } = req.body as {
    builderId: string;
    label?: string;
    description?: string;
    accentColor?: string;
  };

  if (!builderId) return res.status(400).json({ success: false, error: 'builderId is required.' });

  try {
    await db.execute(sql`
      INSERT INTO \`ja_builder_meta_overrides\`
        (\`builder_id\`, \`label\`, \`description\`, \`accent_color\`, \`updated_by\`, \`updated_at\`)
      VALUES
        (${builderId}, ${label ?? null}, ${description ?? null}, ${accentColor ?? null}, ${identity.email ?? 'admin'}, NOW())
      ON DUPLICATE KEY UPDATE
        \`label\`        = VALUES(\`label\`),
        \`description\`  = VALUES(\`description\`),
        \`accent_color\` = VALUES(\`accent_color\`),
        \`updated_by\`   = VALUES(\`updated_by\`),
        \`updated_at\`   = NOW()
    `);
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /api/admin/builder-meta error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
