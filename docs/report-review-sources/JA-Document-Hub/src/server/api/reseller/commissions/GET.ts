/**
 * GET /api/reseller/commissions
 * Commission history for the authenticated reseller.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_resellers, ja_reseller_commissions } from '../../../db/schema.js';
import { eq, desc, sum } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;

    const [commissions, totals] = await Promise.all([
      db.select().from(ja_reseller_commissions)
        .where(eq(ja_reseller_commissions.resellerId, reseller.id))
        .orderBy(desc(ja_reseller_commissions.createdAt))
        .limit(200),
      db.select({ status: ja_reseller_commissions.status, total: sum(ja_reseller_commissions.commissionGbp) })
        .from(ja_reseller_commissions)
        .where(eq(ja_reseller_commissions.resellerId, reseller.id))
        .groupBy(ja_reseller_commissions.status),
    ]);

    const byStatus: Record<string, number> = {};
    for (const t of totals) byStatus[t.status] = Number(t.total ?? 0);

    return res.json({
      success: true,
      commissions,
      totals: {
        pending: byStatus['pending'] ?? 0,
        approved: byStatus['approved'] ?? 0,
        paid: byStatus['paid'] ?? 0,
        rejected: byStatus['rejected'] ?? 0,
        on_hold: byStatus['on_hold'] ?? 0,
      },
    });
  });
}
