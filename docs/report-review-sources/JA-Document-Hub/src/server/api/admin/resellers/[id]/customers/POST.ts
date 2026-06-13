import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_resellers, ja_reseller_customers, ja_reseller_audit } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: 'userId is required.' });

  const [reseller] = await db.select({ id: ja_resellers.id }).from(ja_resellers).where(eq(ja_resellers.uuid, id)).limit(1);
  if (!reseller) return res.status(404).json({ success: false, error: 'Reseller not found.' });

  await db.insert(ja_reseller_customers).values({
    resellerId: reseller.id,
    userId: Number(userId),
    assignedBy: identity.email,
  }).onDuplicateKeyUpdate({ set: { assignedBy: identity.email } });

  await db.insert(ja_reseller_audit).values({
    resellerId: reseller.id,
    adminEmail: identity.email,
    action: 'customer_assigned',
    detail: `Customer userId=${userId} assigned to reseller`,
    ipAddress: req.ip ?? null,
  });

  return res.status(201).json({ success: true });
}
