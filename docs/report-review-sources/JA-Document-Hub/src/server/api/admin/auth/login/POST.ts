/**
 * POST /api/admin/auth/login
 *
 * DISABLED — Admin Portal uses Microsoft Entra ID exclusively.
 * Password-based admin login has been removed.
 *
 * The correct admin sign-in flow is:
 *   GET /auth/admin/oidc/start  →  Microsoft  →  GET /auth/admin/oidc/callback
 *
 * This stub is kept so the file compiles cleanly. The route is NOT registered
 * in entry.ts — any request to this path will 404.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'Password login is not available. Please sign in via the Admin Portal.',
    code: 'PASSWORD_LOGIN_DISABLED',
  });
}
