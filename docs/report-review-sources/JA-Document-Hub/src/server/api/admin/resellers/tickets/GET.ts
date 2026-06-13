import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_reseller_tickets, ja_resellers } from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const tickets = await db.select({
    ticket: ja_reseller_tickets,
    resellerName: ja_resellers.fullName,
    resellerEmail: ja_resellers.email,
  })
  .from(ja_reseller_tickets)
  .innerJoin(ja_resellers, eq(ja_resellers.id, ja_reseller_tickets.resellerId))
  .orderBy(desc(ja_reseller_tickets.updatedAt));
  return res.json({ success: true, tickets });
}
