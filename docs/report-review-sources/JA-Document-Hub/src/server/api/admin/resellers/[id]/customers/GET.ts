import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_resellers, ja_reseller_customers, ja_users } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const { id } = req.params;
  const [reseller] = await db.select({ id: ja_resellers.id }).from(ja_resellers).where(eq(ja_resellers.uuid, id)).limit(1);
  if (!reseller) return res.status(404).json({ success: false, error: 'Reseller not found.' });

  const customers = await db.select({
    assignedAt: ja_reseller_customers.assignedAt,
    assignedBy: ja_reseller_customers.assignedBy,
    userId: ja_users.id,
    email: ja_users.email,
    firstName: ja_users.firstName,
    lastName: ja_users.lastName,
    plan: ja_users.plan,
    accountStatus: ja_users.accountStatus,
    createdAt: ja_users.createdAt,
  })
  .from(ja_reseller_customers)
  .innerJoin(ja_users, eq(ja_users.id, ja_reseller_customers.userId))
  .where(eq(ja_reseller_customers.resellerId, reseller.id));

  return res.json({ success: true, customers });
}
