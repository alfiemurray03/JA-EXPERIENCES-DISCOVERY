/**
 * GET /api/reseller/customers
 * List customers assigned to this reseller (limited fields for privacy).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_resellers, ja_reseller_customers, ja_users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireResellerSession } from '../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;

    const rows = await db
      .select({
        assignedAt: ja_reseller_customers.assignedAt,
        assignedBy: ja_reseller_customers.assignedBy,
        firstName: ja_users.firstName,
        lastName: ja_users.lastName,
        plan: ja_users.plan,
        accountStatus: ja_users.accountStatus,
        createdAt: ja_users.createdAt,
      })
      .from(ja_reseller_customers)
      .innerJoin(ja_users, eq(ja_users.id, ja_reseller_customers.userId))
      .where(eq(ja_reseller_customers.resellerId, reseller.id))
      .orderBy(ja_reseller_customers.assignedAt);

    return res.json({ success: true, customers: rows });
  });
}
