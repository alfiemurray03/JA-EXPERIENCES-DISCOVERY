/**
 * Reseller session helpers.
 * Resellers authenticate with email + password (separate from customer OIDC).
 * Session token stored in ja_resellers.session_token / session_expires_at.
 */
import type { Request, Response, NextFunction } from 'express';
import { db } from '../../db/client.js';
import { ja_resellers } from '../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

const COOKIE = 'ja_reseller_session';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Resolve reseller from session cookie. Returns reseller row or null. */
export async function resolveResellerSession(req: Request) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  const now = new Date();
  const [reseller] = await db
    .select()
    .from(ja_resellers)
    .where(
      and(
        eq(ja_resellers.sessionToken, token),
        gt(ja_resellers.sessionExpiresAt, now),
      ),
    )
    .limit(1);
  return reseller ?? null;
}

/** Express middleware — requires a valid reseller session. */
export async function requireResellerSession(req: Request, res: Response, next: NextFunction) {
  const reseller = await resolveResellerSession(req);
  if (!reseller) {
    return res.status(401).json({ success: false, error: 'Reseller authentication required.', code: 'NOT_AUTHENTICATED' });
  }
  if (reseller.status !== 'approved') {
    return res.status(403).json({ success: false, error: 'Your reseller account is not active.', code: 'NOT_APPROVED' });
  }
  (req as Request & { reseller: typeof reseller }).reseller = reseller;
  next();
}

/** Set reseller session cookie. */
export function setResellerCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: false, // preview is HTTP; production behind HTTPS proxy
    sameSite: 'lax',
    maxAge: TTL_MS,
    path: '/',
  });
}

/** Clear reseller session cookie. */
export function clearResellerCookie(res: Response) {
  res.clearCookie(COOKIE, { path: '/' });
}

export { TTL_MS, COOKIE };
