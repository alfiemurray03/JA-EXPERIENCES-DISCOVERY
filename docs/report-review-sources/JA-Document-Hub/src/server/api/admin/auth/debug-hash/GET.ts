/**
 * GET /api/admin/auth/debug-hash
 *
 * DISABLED — Debug endpoint removed from production.
 * Admin Portal uses Microsoft Entra ID exclusively.
 *
 * This stub is kept so the file compiles cleanly. The route is NOT registered
 * in entry.ts.
 */
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  return res.status(410).json({
    success: false,
    error: 'Debug endpoint not available.',
    code: 'DEBUG_DISABLED',
  });
}
