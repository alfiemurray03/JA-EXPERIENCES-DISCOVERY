/**
 * GET /api/auth/me
 * Return the currently authenticated customer (via session cookie).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_users, ja_sessions } from '../../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const [session] = await db.select().from(ja_sessions)
      .where(and(eq(ja_sessions.token, token), gt(ja_sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) return res.status(401).json({ success: false, error: 'Session expired.' });

    const [user] = await db.select().from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);

    if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

    return res.json({
      success: true,
      user: {
        id:             user.uuid,
        email:          user.email,
        firstName:      user.firstName,
        lastName:       user.lastName,
        company:        user.company,
        plan:           user.plan,
        usageType:      user.usageType,
        planIsLifetime: user.planIsLifetime,
        planExpiresAt:  user.planExpiresAt ?? null,
        createdAt:      user.createdAt,
      },
    });
  } catch (err) {
    console.error('auth.me.error', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
