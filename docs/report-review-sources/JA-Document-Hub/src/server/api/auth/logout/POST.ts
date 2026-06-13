/**
 * POST /api/auth/logout
 * Invalidate the current session.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_sessions } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (token) {
      await db.delete(ja_sessions).where(eq(ja_sessions.token, token));
    }
    res.clearCookie('ja_session', { path: '/' });
    return res.json({ success: true });
  } catch (err) {
    console.error('auth.logout.error', err);
    return res.status(500).json({ success: false, error: 'Logout failed.' });
  }
}
