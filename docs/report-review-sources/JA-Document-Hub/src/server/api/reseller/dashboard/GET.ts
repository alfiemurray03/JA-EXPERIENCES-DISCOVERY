/**
 * GET /api/reseller/dashboard
 * Overview stats for the reseller portal dashboard.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import {
  ja_resellers, ja_reseller_customers, ja_reseller_clicks,
  ja_reseller_commissions, ja_reseller_announcements, ja_users,
} from '../../../db/schema.js';
import { eq, count, sum, desc } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;

    const [customerCount, clickCount, commRows, announcements] = await Promise.all([
      db.select({ n: count() }).from(ja_reseller_customers).where(eq(ja_reseller_customers.resellerId, reseller.id)),
      db.select({ n: count() }).from(ja_reseller_clicks).where(eq(ja_reseller_clicks.resellerId, reseller.id)),
      db.select({
        status: ja_reseller_commissions.status,
        total: sum(ja_reseller_commissions.commissionGbp),
      }).from(ja_reseller_commissions).where(eq(ja_reseller_commissions.resellerId, reseller.id)).groupBy(ja_reseller_commissions.status),
      db.select().from(ja_reseller_announcements).where(eq(ja_reseller_announcements.isActive, true)).orderBy(desc(ja_reseller_announcements.createdAt)).limit(5),
    ]);

    const commByStatus: Record<string, number> = {};
    for (const row of commRows) commByStatus[row.status] = Number(row.total ?? 0);

    return res.json({
      success: true,
      stats: {
        totalCustomers: Number(customerCount[0]?.n ?? 0),
        totalClicks: Number(clickCount[0]?.n ?? 0),
        commissionPending: commByStatus['pending'] ?? 0,
        commissionApproved: commByStatus['approved'] ?? 0,
        commissionPaid: commByStatus['paid'] ?? 0,
      },
      reseller: {
        uuid: reseller.uuid,
        fullName: reseller.fullName,
        email: reseller.email,
        company: reseller.company,
        referralCode: reseller.referralCode,
        referralLink: reseller.referralLink,
        commissionRate: reseller.commissionRate,
        commissionType: reseller.commissionType,
      },
      announcements,
    });
  });
}
