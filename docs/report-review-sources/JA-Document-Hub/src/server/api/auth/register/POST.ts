/**
 * POST /api/auth/register
 *
 * Public self-registration is DISABLED.
 * Customer accounts are provisioned automatically on first Microsoft Entra
 * sign-in via GET /auth/oidc/start → GET /auth/callback.
 *
 * This endpoint returns a structured 403 so legacy clients receive a clear
 * error rather than a 404.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(403).json({
    success: false,
    error: 'Public registration is not available. Please sign in with your Microsoft account.',
    code:  'REGISTRATION_DISABLED',
  });
}
