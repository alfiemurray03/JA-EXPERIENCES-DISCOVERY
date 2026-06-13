/**
 * GET /api/reseller/referrals
 * Referral link stats + click history.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_resellers, ja_reseller_clicks, ja_reseller_commissions } from '../../../db/schema.js';
import { eq, count, desc } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;

    const [clicks, signups, recentClicks] = await Promise.all([
      db.select({ n: count() }).from(ja_reseller_clicks).where(eq(ja_reseller_clicks.resellerId, reseller.id)),
      db.select({ n: count() }).from(ja_reseller_commissions).where(eq(ja_reseller_commissions.resellerId, reseller.id)),
      db.select({ landingPage: ja_reseller_clicks.landingPage, createdAt: ja_reseller_clicks.createdAt })
        .from(ja_reseller_clicks)
        .where(eq(ja_reseller_clicks.resellerId, reseller.id))
        .orderBy(desc(ja_reseller_clicks.createdAt))
        .limit(50),
    ]);

    return res.json({
      success: true,
      referralCode: reseller.referralCode,
      referralLink: reseller.referralLink,
      stats: {
        clicks: Number(clicks[0]?.n ?? 0),
        signups: Number(signups[0]?.n ?? 0),
      },
      recentClicks,
    });
  });
}
