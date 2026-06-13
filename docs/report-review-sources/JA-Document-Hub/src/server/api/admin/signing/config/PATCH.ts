/**
 * PATCH /api/admin/signing/config
 * Admin: save Document Signing configuration.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const admin = await requireAdminRole(req, res, []);
  if (!admin) return;

  const { config } = req.body as { config?: Record<string, string> };
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ success: false, error: 'config object is required.' });
  }

  const allowed = [
    'signing_enabled', 'signing_plans',
    'signing_max_docs_professional', 'signing_max_docs_org_starter',
    'signing_max_docs_org_growth', 'signing_max_docs_org_professional',
    'signing_max_signers', 'signing_default_expiry_days', 'signing_reminder_days',
    'signing_max_attachments', 'signing_max_attachment_size_mb', 'signing_allowed_attachment_types',
    'signing_append_to_final_pack_default',
    'signing_email_template_request', 'signing_email_template_reminder',
    'signing_email_template_completed', 'signing_email_template_declined',
    'signing_branding_logo_url', 'signing_branding_company_name', 'signing_branding_footer_text',
  ];

  try {
    for (const [key, value] of Object.entries(config)) {
      if (!allowed.includes(key)) continue;
      await db.execute(sql`
        INSERT INTO \`ja_system_config\` (\`config_key\`, \`value\`)
        VALUES (${key}, ${String(value)})
        ON DUPLICATE KEY UPDATE \`value\` = ${String(value)}
      `);
    }
    await logAdminAction(admin.email, 'signing.config.update', `Updated signing config: ${Object.keys(config).join(', ')}`, req);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin.signing.config.patch.error', err);
    return res.status(500).json({ success: false, error: 'Failed to save signing config.' });
  }
}
