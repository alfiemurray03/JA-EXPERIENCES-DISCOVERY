/**
 * GET /api/admin/auth/setup-status
 *
 * DISABLED — First-run setup wizard has been removed.
 * Admin Portal uses Microsoft Entra ID exclusively.
 *
 * This stub is kept so the file compiles cleanly. The route is NOT registered
 * in entry.ts.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'Setup status endpoint not available.',
    code: 'SETUP_DISABLED',
  });
}
