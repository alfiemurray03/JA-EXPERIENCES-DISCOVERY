/**
 * POST /api/auth/login
 *
 * Customer email/password login is DISABLED.
 * The platform uses Microsoft Entra External ID as the sole customer
 * authentication method. All customer sign-in flows go through:
 *   GET /auth/oidc/start  →  Entra  →  GET /auth/callback
 *
 * This endpoint is kept in the codebase (and registered in entry.ts) so that
 * any legacy client code that still calls it receives a clear, structured error
 * rather than a 404. It does not authenticate anyone.
 *
 * Admin portal login is entirely separate and uses /api/admin/auth/login.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(403).json({
    success: false,
    error: 'Password login is not available. Please sign in with your Microsoft account.',
    code:  'PASSWORD_LOGIN_DISABLED',
  });
}
