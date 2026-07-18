/**
 * PATCH /api/org/members
 * Change a member's role or suspend/unsuspend them.
 * Only Together Organisation owners and admins can do this.
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
    if (user.usageType !== 'business' || !['org_starter', 'org_growth', 'org_professional'].includes(user.plan)) {
      return res.status(403).json({ success: false, error: 'A Together Organisation account is required.' });
    }

    const { memberId, action, role } = req.body as { memberId?: number; action?: 'change_role' | 'suspend' | 'unsuspend'; role?: string };
    if (!memberId || !action) return res.status(400).json({ success: false, error: 'memberId and action are required.' });
    const [myMembership] = await db.select().from(ja_org_members).where(eq(ja_org_members.userId, user.id)).limit(1);
    if (!myMembership || (myMembership.role !== 'owner' && myMembership.role !== 'admin')) return res.status(403).json({ success: false, error: 'Only organisation owners and admins can manage members.' });
    const [targetMembership] = await db.select().from(ja_org_members).where(and(eq(ja_org_members.id, memberId), eq(ja_org_members.orgId, myMembership.orgId))).limit(1);
    if (!targetMembership) return res.status(404).json({ success: false, error: 'Member not found.' });
    if (targetMembership.role === 'owner') return res.status(403).json({ success: false, error: 'The organisation owner cannot be modified.' });
    if (myMembership.role === 'admin' && targetMembership.role === 'admin') return res.status(403).json({ success: false, error: 'Admins cannot modify other admins.' });

    if (action === 'change_role') {
      const validRoles = ['admin', 'manager', 'member', 'read_only'];
      if (!role || !validRoles.includes(role)) return res.status(400).json({ success: false, error: 'Invalid role.' });
      if (role === 'admin' && myMembership.role !== 'owner') return res.status(403).json({ success: false, error: 'Only the organisation owner can assign the admin role.' });
      await db.update(ja_org_members).set({ role: role as 'admin' | 'manager' | 'member' | 'read_only' }).where(eq(ja_org_members.id, memberId));
      return res.json({ success: true, message: 'Role updated.' });
    }
    if (action === 'suspend') {
      await db.update(ja_org_members).set({ suspended: true, suspendedAt: new Date(), suspendedBy: user.email }).where(eq(ja_org_members.id, memberId));
      return res.json({ success: true, message: 'Member suspended.' });
    }
    if (action === 'unsuspend') {
      await db.update(ja_org_members).set({ suspended: false, suspendedAt: null, suspendedBy: null }).where(eq(ja_org_members.id, memberId));
      return res.json({ success: true, message: 'Member unsuspended.' });
    }
    return res.status(400).json({ success: false, error: 'Unknown action.' });
  } catch (err) {
    console.error('PATCH /api/org/members error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}
