/**
 * GET /api/admin/stats
 * Returns real platform statistics for the admin dashboard.
 */
import type { Request, Response } from 'express';
import { count, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_users, ja_documents } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const [userCount] = await db.select({ count: count() }).from(ja_users);
    const [docCount] = await db.select({ count: count() }).from(ja_documents);

    // Plan breakdown
    const planRows = await db
      .select({ plan: ja_users.plan, count: count() })
      .from(ja_users)
      .groupBy(ja_users.plan);

    // Documents created in last 30 days
    const [recentDocs] = await db.select({ count: count() }).from(ja_documents)
      .where(sql`${ja_documents.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    // New users in last 30 days
    const [recentUsers] = await db.select({ count: count() }).from(ja_users)
      .where(sql`${ja_users.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    // Users by usage type
    const usageRows = await db
      .select({ usageType: ja_users.usageType, count: count() })
      .from(ja_users)
      .groupBy(ja_users.usageType);

    // Paid users (non-free)
    const [paidUsers] = await db.select({ count: count() }).from(ja_users)
      .where(sql`${ja_users.plan} != 'free'`);

    return res.json({
      success: true,
      stats: {
        totalUsers: userCount?.count ?? 0,
        totalDocuments: docCount?.count ?? 0,
        paidUsers: paidUsers?.count ?? 0,
        recentDocuments: recentDocs?.count ?? 0,
        recentUsers: recentUsers?.count ?? 0,
        planBreakdown: planRows,
        usageBreakdown: usageRows,
      },
    });
  } catch (err) {
    console.error('admin.stats.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
