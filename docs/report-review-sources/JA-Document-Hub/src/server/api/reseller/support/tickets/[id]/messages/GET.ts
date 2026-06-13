import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_resellers, ja_reseller_tickets, ja_reseller_ticket_messages } from '../../../../../../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import { requireResellerSession } from '../../../../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    const { id } = req.params;

    const [ticket] = await db.select().from(ja_reseller_tickets)
      .where(and(eq(ja_reseller_tickets.uuid, id), eq(ja_reseller_tickets.resellerId, reseller.id)))
      .limit(1);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

    const messages = await db.select().from(ja_reseller_ticket_messages)
      .where(eq(ja_reseller_ticket_messages.ticketId, ticket.id))
      .orderBy(asc(ja_reseller_ticket_messages.createdAt));

    return res.json({ success: true, ticket, messages });
  });
}
