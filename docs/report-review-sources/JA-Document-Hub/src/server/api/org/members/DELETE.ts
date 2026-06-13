/**
 * DELETE /api/org/members
 * Remove a member from the organisation.
 * Body: { memberId: number } — the ja_org_members.id
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_sessions, ja_users, ja_org_members } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.session_token as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const [session] = await db.select().from(ja_sessions).where(eq(ja_sessions.token, token)).limit(1);
    if (!session || session.expiresAt < new Date()) return res.status(401).json({ success: false, error: 'Session expired.' });

    const [user] = await db.select().from(ja_users).where(eq(ja_users.id, session.userId)).limit(1);
    if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

    const { memberId } = req.body as { memberId?: number };
    if (!memberId || typeof memberId !== 'number') {
      return res.status(400).json({ success: false, error: 'memberId is required.' });
    }

    // Find caller's membership
    const [myMembership] = await db
      .select()
      .from(ja_org_members)
      .where(eq(ja_org_members.userId, user.id))
      .limit(1);

    if (!myMembership || (myMembership.role !== 'owner' && myMembership.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Only org owners and admins can remove members.' });
    }

    // Find the target membership
    const [target] = await db
      .select()
      .from(ja_org_members)
      .where(and(eq(ja_org_members.id, memberId), eq(ja_org_members.orgId, myMembership.orgId)))
      .limit(1);

    if (!target) return res.status(404).json({ success: false, error: 'Member not found.' });
    if (target.role === 'owner') return res.status(400).json({ success: false, error: 'Cannot remove the organisation owner.' });
    if (target.userId === user.id) return res.status(400).json({ success: false, error: 'You cannot remove yourself.' });

    await db.delete(ja_org_members).where(eq(ja_org_members.id, memberId));

    return res.json({ success: true, message: 'Member removed from organisation.' });
  } catch (err) {
    console.error('DELETE /api/org/members error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
