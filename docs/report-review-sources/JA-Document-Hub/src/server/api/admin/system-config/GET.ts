/**
 * GET /api/admin/system-config
 * Returns all system config key-value pairs.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_system_config } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db.select().from(ja_system_config);
    const config: Record<string, string> = {};
    for (const row of rows) config[row.configKey] = row.value;
    return res.json({ success: true, config });
  } catch (err) {
    console.error('admin.system-config.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
