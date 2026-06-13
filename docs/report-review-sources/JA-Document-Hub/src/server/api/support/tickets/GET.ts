/**
 * GET /api/support/tickets
 * Returns support tickets for the authenticated customer (by session or email).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_sessions, ja_users, ja_support_tickets } from '../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const sessionRows = await db
      .select({ userId: ja_sessions.userId, expiresAt: ja_sessions.expiresAt })
      .from(ja_sessions)
      .where(eq(ja_sessions.token, token))
      .limit(1);
    const session = sessionRows[0];
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ success: false, error: 'Session expired.' });
    }

    const userRows = await db
      .select({ email: ja_users.email })
      .from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);
    const email = userRows[0]?.email;
    if (!email) return res.status(401).json({ success: false, error: 'User not found.' });

    const tickets = await db
      .select()
      .from(ja_support_tickets)
      .where(eq(ja_support_tickets.email, email))
      .orderBy(desc(ja_support_tickets.createdAt));

    return res.json({ success: true, tickets });
  } catch (err) {
    console.error('support.tickets.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
