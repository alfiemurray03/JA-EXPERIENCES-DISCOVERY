/**
 * GET /api/admin/audit/login-attempts
 * Returns the last 200 admin login attempts from the database.
 */
import type { Request, Response } from 'express';
import { getLoginAttempts } from '../../auth/_store.js';
import { requireAdminSession } from '../../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const adminId = await requireAdminSession(req);
  if (!adminId) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const attempts = await getLoginAttempts(200);
    return res.json({ success: true, attempts });
  } catch (err) {
    console.error('admin.audit.login-attempts.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
