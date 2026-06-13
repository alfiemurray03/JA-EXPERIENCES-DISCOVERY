/**
 * Shared session resolution helper.
 * Returns the numeric userId for the authenticated session, or null.
 */
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import { db } from '../../db/client.js';
import { ja_sessions } from '../../db/schema.js';

export async function resolveSession(req: Request): Promise<number | null> {
  const token = req.cookies?.ja_session as string | undefined;
  if (!token) return null;
  const rows = await db
    .select({ userId: ja_sessions.userId, expiresAt: ja_sessions.expiresAt })
    .from(ja_sessions)
    .where(eq(ja_sessions.token, token))
    .limit(1);
  const session = rows[0];
  if (!session || new Date() > session.expiresAt) return null;
  return session.userId;
}
