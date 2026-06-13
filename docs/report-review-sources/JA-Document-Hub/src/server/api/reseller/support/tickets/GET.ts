import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_resellers, ja_reseller_tickets } from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireResellerSession } from '../../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    const tickets = await db.select().from(ja_reseller_tickets)
      .where(eq(ja_reseller_tickets.resellerId, reseller.id))
      .orderBy(desc(ja_reseller_tickets.createdAt));
    return res.json({ success: true, tickets });
  });
}
