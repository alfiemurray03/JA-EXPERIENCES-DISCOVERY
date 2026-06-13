/**
 * POST /api/admin/forgot-password
 *
 * DISABLED — Admin Portal uses Microsoft Entra ID exclusively.
 * Password management is handled by Microsoft account management.
 *
 * This stub returns a clear error. The route is kept registered so legacy
 * clients receive a structured response rather than a 404.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'Admin password reset is not available. Manage your account via Microsoft.',
    code: 'PASSWORD_RESET_DISABLED',
  });
}
