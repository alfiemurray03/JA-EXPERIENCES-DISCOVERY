/**
 * GET /api/admin/resellers
 * List all resellers with stats.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_resellers, ja_reseller_customers, ja_reseller_commissions } from '../../../db/schema.js';
import { eq, count, sum } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const resellers = await db.select().from(ja_resellers).orderBy(ja_resellers.createdAt);

  const enriched = await Promise.all(resellers.map(async (r) => {
    const [custCount, commRows] = await Promise.all([
      db.select({ n: count() }).from(ja_reseller_customers).where(eq(ja_reseller_customers.resellerId, r.id)),
      db.select({ status: ja_reseller_commissions.status, total: sum(ja_reseller_commissions.commissionGbp) })
        .from(ja_reseller_commissions).where(eq(ja_reseller_commissions.resellerId, r.id)).groupBy(ja_reseller_commissions.status),
    ]);
    const commByStatus: Record<string, number> = {};
    for (const c of commRows) commByStatus[c.status] = Number(c.total ?? 0);
    return {
      ...r,
      passwordHash: undefined,
      sessionToken: undefined,
      customerCount: Number(custCount[0]?.n ?? 0),
      commissionPending: commByStatus['pending'] ?? 0,
      commissionApproved: commByStatus['approved'] ?? 0,
      commissionPaid: commByStatus['paid'] ?? 0,
    };
  }));

  return res.json({ success: true, resellers: enriched });
}
