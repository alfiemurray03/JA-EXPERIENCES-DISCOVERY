import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_reseller_commissions, ja_resellers } from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const commissions = await db.select({
    commission: ja_reseller_commissions,
    resellerName: ja_resellers.fullName,
    resellerEmail: ja_resellers.email,
  })
  .from(ja_reseller_commissions)
  .innerJoin(ja_resellers, eq(ja_resellers.id, ja_reseller_commissions.resellerId))
  .orderBy(desc(ja_reseller_commissions.createdAt))
  .limit(500);

  return res.json({ success: true, commissions });
}
