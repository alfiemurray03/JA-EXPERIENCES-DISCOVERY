/**
 * POST /api/admin/users
 * Creates a legacy admin account in the database.
 * Note: Admin authentication is now handled by Microsoft Entra ID (OIDC).
 * This endpoint is retained for legacy/local admin account creation only.
 * Microsoft app roles (PlatformOwner, SystemAdministrator, Admin, SupportAdmin)
 * are assigned in the Entra app registration — not here.
 *
 * Body: { name, email, role, password }
 */
import type { Request, Response } from 'express';
import { getAdminByEmail, createAdminAccount } from '../auth/_store.js';

// Microsoft Entra app role values — these are the canonical roles for this platform.
// Legacy strings (super_admin, platform_admin, etc.) are no longer accepted.
const ALLOWED_ROLES = [
  'PlatformOwner',
  'SystemAdministrator',
  'Admin',
  'SupportAdmin',
];

export default async function handler(req: Request, res: Response) {
  try {
    const { name, email, role, password } = req.body as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, role, and password are required.' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    const existing = await getAdminByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with that email already exists.' });
    }

    const newAdmin = await createAdminAccount({ name, email, role, password });
    return res.status(201).json({ success: true, user: {
      ...newAdmin,
      createdAt: newAdmin.createdAt instanceof Date ? newAdmin.createdAt.toISOString() : newAdmin.createdAt,
      lastLogin: null,
    }});
  } catch (err) {
    console.error('admin.users.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
