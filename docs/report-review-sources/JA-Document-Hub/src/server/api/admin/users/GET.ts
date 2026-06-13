/**
 * GET /api/admin/users
 * Returns all admin accounts from the database (passwords excluded).
 */
import type { Request, Response } from 'express';
import { getAllAdmins } from '../auth/_store.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const users = await getAllAdmins();
    const normalised = users.map((u) => ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      lastLogin: u.lastLogin instanceof Date ? u.lastLogin.toISOString() : u.lastLogin ?? null,
    }));
    return res.json({ success: true, users: normalised });
  } catch (err) {
    console.error('admin.users.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
