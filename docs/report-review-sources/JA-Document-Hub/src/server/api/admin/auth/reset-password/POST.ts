/**
 * POST /api/admin/auth/reset-password
 *
 * DISABLED — Admin Portal uses Microsoft Entra ID exclusively.
 * Password reset is handled by Microsoft account management.
 *
 * This stub is kept so the file compiles cleanly. The route is NOT registered
 * in entry.ts — any request to this path will 404.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'Password reset is not available. Manage your account via Microsoft.',
    code: 'PASSWORD_RESET_DISABLED',
  });
}
