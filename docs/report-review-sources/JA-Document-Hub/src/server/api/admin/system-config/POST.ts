/**
 * POST /api/admin/system-config
 * Upsert one or more system config key-value pairs.
 * Body: { config: Record<string, string> }
 * Writes an audit log entry for any toggle_ key changes.
 */
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';
import { logAdminAction } from '../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });
  const adminEmail = identity.email ?? 'unknown';

  const { config } = req.body as { config: Record<string, string> };
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ success: false, error: 'config object required.' });
  }

  try {
    // Fetch current values for diff (audit log)
    const existing = await db.select().from(ja_system_config);
    const prev: Record<string, string> = {};
    for (const row of existing) prev[row.configKey] = row.value;

    for (const [key, value] of Object.entries(config)) {
      await db.execute(
        sql`INSERT INTO ja_system_config (config_key, value) VALUES (${key}, ${String(value)})
            ON DUPLICATE KEY UPDATE value = ${String(value)}, updated_at = NOW()`
      );
    }

    // Audit log — only log toggle changes
    const toggleChanges = Object.entries(config)
      .filter(([k]) => k.startsWith('toggle_'))
      .filter(([k, v]) => prev[k] !== v);

    for (const [key, value] of toggleChanges) {
      const toggleName = key.replace('toggle_', '');
      const state = value === 'true' ? 'ENABLED' : 'DISABLED';
      await logAdminAction(adminEmail, 'feature_toggle', `Feature toggle "${toggleName}" set to ${state}`, req);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('admin.system-config.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
