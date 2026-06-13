/**
 * GET /api/admin/auth/me
 *
 * Returns the currently authenticated admin's Microsoft identity from the
 * session cookie. Used on page load / refresh to restore the admin context.
 *
 * The identity (email, display name, app roles) comes from the session row —
 * it was written there by the OIDC callback when Microsoft authenticated the
 * user. No lookup against ja_admin_accounts is performed.
 *
 * Platform operator: JA Group Services Ltd
 */
import type { Request, Response } from 'express';
import { requireAdminSession } from '../../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  try {
    const identity = await requireAdminSession(req);

    if (!identity) {
      return res.status(401).json({
        success: false,
        error: 'Admin session expired. Please sign in again.',
        code: 'SESSION_EXPIRED',
      });
    }

    return res.json({
      success: true,
      admin: {
        email:       identity.email,
        name:        identity.name,
        roles:       identity.roles,
        tid:         identity.tid,
        // Convenience flag: true for PlatformOwner or SystemAdministrator (or no roles yet)
        isSystemAdministrator: identity.roles.includes('PlatformOwner')
                            || identity.roles.includes('SystemAdministrator')
                            || identity.roles.length === 0, // no roles configured → full access fallback
        authMethod:  'oidc',
        operator:    'JA Group Services Ltd',
      },
    });
  } catch (err) {
    console.error('admin.auth.me.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
