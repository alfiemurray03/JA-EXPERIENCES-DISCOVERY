/**
 * PATCH /api/auth/profile
 * Update the current user's profile fields.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_users, ja_sessions } from '../../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

import type { InferInsertModel } from 'drizzle-orm';

type UserUpdate = Partial<Pick<InferInsertModel<typeof ja_users>, 'firstName' | 'lastName' | 'company' | 'usageType'>>;

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const [session] = await db.select().from(ja_sessions)
      .where(and(eq(ja_sessions.token, token), gt(ja_sessions.expiresAt, new Date())))
      .limit(1);
    if (!session) return res.status(401).json({ success: false, error: 'Session expired.' });

    const { firstName, lastName, company, usageType } = req.body as {
      firstName?: string; lastName?: string; company?: string; usageType?: string;
    };

    const updates: UserUpdate = {};
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (company !== undefined) updates.company = company?.trim() || null;
    if (usageType) updates.usageType = usageType as InferInsertModel<typeof ja_users>['usageType'];

    if (Object.keys(updates).length > 0) {
      await db.update(ja_users).set(updates).where(eq(ja_users.id, session.userId));
    }

    const [user] = await db.select().from(ja_users).where(eq(ja_users.id, session.userId)).limit(1);

    return res.json({
      success: true,
      user: {
        id: user.uuid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        plan: user.plan,
        usageType: user.usageType,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('auth.profile.patch.error', err);
    return res.status(500).json({ success: false, error: 'Update failed.' });
  }
}
