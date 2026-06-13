/**
 * POST /api/auth/reset-password
 *
 * Customer password reset is DISABLED.
 * Customers authenticate exclusively via Microsoft Entra External ID.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(403).json({
    success: false,
    error: 'Password reset is not available. Please manage your password through your Microsoft account.',
    code:  'PASSWORD_RESET_DISABLED',
  });
}
