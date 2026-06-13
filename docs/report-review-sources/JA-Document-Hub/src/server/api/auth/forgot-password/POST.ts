/**
 * POST /api/auth/forgot-password
 *
 * Customer password reset is DISABLED.
 * Customers authenticate exclusively via Microsoft Entra External ID.
 * Password management is handled by Microsoft — users can reset their
 * Microsoft account password via https://account.microsoft.com.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(403).json({
    success: false,
    error: 'Password reset is not available. Please manage your password through your Microsoft account.',
    code:  'PASSWORD_RESET_DISABLED',
  });
}
