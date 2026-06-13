/**
 * POST /api/admin/auth/logout
 * Destroys the admin session in the DB and clears the cookie.
 */
import type { Request, Response } from 'express';
import { destroyAdminSession, ADMIN_COOKIE } from '../_session-cookie.js';

export default async function handler(req: Request, res: Response) {
  const token = req.cookies?.[ADMIN_COOKIE] as string | undefined;
  if (token) {
    await destroyAdminSession(token, res);
  } else {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
  }
  return res.json({ success: true });
}
