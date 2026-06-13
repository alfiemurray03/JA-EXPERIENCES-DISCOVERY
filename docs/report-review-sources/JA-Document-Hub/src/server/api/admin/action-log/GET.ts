/**
 * GET /api/admin/action-log
 * Returns admin action log entries (from ja_admin_action_log).
 * Supports ?limit=N&action=&adminId= filters.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '200'), 10) || 200, 500);
    const actionFilter = req.query.action as string | undefined;
    const adminFilter = req.query.adminId as string | undefined;

    let query = `SELECT id, admin_id, admin_email, action, detail, ip, created_at FROM ja_admin_action_log`;
    const conditions: string[] = [];
    if (actionFilter && actionFilter !== 'all') conditions.push(`action LIKE '${actionFilter.replace(/'/g, '')}%'`);
    if (adminFilter) conditions.push(`admin_id = ${parseInt(adminFilter, 10) || 0}`);
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const rows = await db.execute(sql.raw(query));
    const entries = (rows as unknown as { rows?: unknown[] }).rows ?? (Array.isArray(rows) ? rows : []);

    return res.json({ success: true, entries });
  } catch (err) {
    console.error('admin.action-log.get.error', err);
    // Table may not exist yet — return empty gracefully
    return res.json({ success: true, entries: [] });
  }
}
