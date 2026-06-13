/**
 * Admin session resolver helpers — Microsoft-identity aware.
 *
 * requireAdminSession — returns the Microsoft identity or null
 * guardAdminSession   — sends 401 and returns null if not authenticated
 *
 * Sessions are backed by ja_admin_sessions. The Microsoft identity
 * (email, name, roles, tid) is stored in the session row — no lookup
 * against ja_admin_accounts is needed.
 */
import type { Request, Response } from 'express';
import { resolveAdminSession, type MsAdminIdentity } from './auth/_session-cookie.js';

export type { MsAdminIdentity };

/**
 * Resolve the admin session from the request cookie.
 * Returns the Microsoft identity on success, or null if not authenticated.
 */
export async function requireAdminSession(
  req: Request
): Promise<(MsAdminIdentity & { sessionToken: string }) | null> {
  const token = req.cookies?.[ADMIN_COOKIE] as string | undefined;
  if (!token) return null;
  return resolveAdminSession(token);
}

/** Cookie name — exported so logout handler can clear it by name. */
export const ADMIN_COOKIE = 'ja_admin_session';

/**
 * Convenience guard — sends a 401 with a clear error message if not authenticated.
 * Returns the Microsoft identity on success, or null (response already sent) on failure.
 */
export async function guardAdminSession(
  req: Request,
  res: Response
): Promise<(MsAdminIdentity & { sessionToken: string }) | null> {
  const token = req.cookies?.[ADMIN_COOKIE] as string | undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Admin session required. Please sign in to the Admin Portal.',
      code: 'NOT_AUTHENTICATED',
    });
    return null;
  }

  const identity = await resolveAdminSession(token);

  if (!identity) {
    res.status(401).json({
      success: false,
      error: 'Admin session expired or invalid. Please sign in again.',
      code: 'SESSION_EXPIRED',
    });
    return null;
  }

  return identity;
}
