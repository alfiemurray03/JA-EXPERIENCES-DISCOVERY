/**
 * GET /api/admin/lifetime
 * Returns all users with planIsLifetime = true, plus their grant history.
 */
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_users, ja_lifetime_grants } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const users = await db
      .select({
        id:             ja_users.uuid,
        email:          ja_users.email,
        firstName:      ja_users.firstName,
        lastName:       ja_users.lastName,
        company:        ja_users.company,
        plan:           ja_users.plan,
        planIsLifetime: ja_users.planIsLifetime,
        createdAt:      ja_users.createdAt,
        lastLogin:      ja_users.lastLogin,
      })
      .from(ja_users)
      .where(sql`plan_is_lifetime = 1`)
      .orderBy(sql`created_at DESC`);

    // Load grant history for each user
    const result = await Promise.all(users.map(async (u) => {
      // Get internal id for join
      const rows = await db
        .select({ id: ja_users.id })
        .from(ja_users)
        .where(sql`uuid = ${u.id}`)
        .limit(1);
      const internalId = rows[0]?.id;
      let grants: Array<{ action: string; plan: string; grantedBy: string; note: string | null; createdAt: Date }> = [];
      if (internalId) {
        grants = await db
          .select({
            action:    ja_lifetime_grants.action,
            plan:      ja_lifetime_grants.plan,
            grantedBy: ja_lifetime_grants.grantedBy,
            note:      ja_lifetime_grants.note,
            createdAt: ja_lifetime_grants.createdAt,
          })
          .from(ja_lifetime_grants)
          .where(sql`user_id = ${internalId}`)
          .orderBy(sql`created_at DESC`)
          .limit(20);
      }
      return { ...u, grants };
    }));

    return res.json({ success: true, users: result });
  } catch (err) {
    console.error('admin.lifetime.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load lifetime users.' });
  }
}
