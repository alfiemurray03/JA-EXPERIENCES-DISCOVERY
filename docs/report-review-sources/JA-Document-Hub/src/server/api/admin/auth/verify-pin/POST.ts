/**
 * POST /api/admin/auth/verify-pin
 *
 * DISABLED — PIN verification has been removed.
 * Admin Portal uses Microsoft Entra ID exclusively.
 *
 * This stub is kept so the file compiles cleanly. The route is NOT registered
 * in entry.ts.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'PIN verification is not available.',
    code: 'PIN_DISABLED',
  });
}
