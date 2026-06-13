/**
 * Admin session cookie helpers — Microsoft-identity aware.
 *
 * Sessions are backed by ja_admin_sessions. The Microsoft identity
 * (email, display name, app roles, tenant ID) is stored in the session row
 * so /api/admin/auth/me can return the admin's identity without hitting
 * ja_admin_accounts at all.
 *
 * adminId is kept as a nullable column for backward-compat but is no longer
 * required — Microsoft is the source of truth.
 */
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_admin_sessions } from '../../../db/schema.js';

export const ADMIN_COOKIE = 'ja_admin_session';

/** 24-hour admin session (was 8h — extended so Microsoft-authenticated admins don't get kicked mid-day) */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // Allow the cookie in both preview (http) and production (https)
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export interface MsAdminIdentity {
  email: string;
  name: string;
  roles: string[];   // app roles from Microsoft token
  tid: string;       // tenant ID
}

/**
 * Create a DB session row carrying the Microsoft identity and set the cookie.
 * Returns the session token.
 */
export async function createAdminSession(
  identity: MsAdminIdentity,
  res: Response
): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(ja_admin_sessions).values({
    token,
    adminId:  null,
    msEmail:  identity.email,
    msName:   identity.name,
    msRoles:  JSON.stringify(identity.roles),
    msTid:    identity.tid,
    expiresAt,
  });

  res.cookie(ADMIN_COOKIE, token, cookieOptions(SESSION_TTL_MS));
  return token;
}

/**
 * Resolve a session token → Microsoft identity.
 * Returns null if the token is missing, not found, or expired.
 */
export async function resolveAdminSession(
  token: string
): Promise<(MsAdminIdentity & { sessionToken: string }) | null> {
  const rows = await db
    .select()
    .from(ja_admin_sessions)
    .where(eq(ja_admin_sessions.token, token))
    .limit(1);

  const session = rows[0];
  if (!session) return null;
  if (new Date() > session.expiresAt) return null;
  if (!session.msEmail) return null;

  let roles: string[] = [];
  try { roles = JSON.parse(session.msRoles ?? '[]'); } catch { /* ignore */ }

  return {
    email:        session.msEmail,
    name:         session.msName ?? session.msEmail,
    roles,
    tid:          session.msTid ?? '',
    sessionToken: session.token,
  };
}

/** Delete the DB session row and clear the cookie. */
export async function destroyAdminSession(token: string, res: Response): Promise<void> {
  try {
    await db.delete(ja_admin_sessions).where(eq(ja_admin_sessions.token, token));
  } catch { /* best-effort */ }
  res.clearCookie(ADMIN_COOKIE, { path: '/' });
}
