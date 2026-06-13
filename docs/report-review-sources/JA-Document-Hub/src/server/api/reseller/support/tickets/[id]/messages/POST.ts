import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_resellers, ja_reseller_tickets, ja_reseller_ticket_messages } from '../../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireResellerSession } from '../../../../_session.js';

export default async function handler(req: Request, res: Response) {
  await requireResellerSession(req, res, async () => {
    const reseller = (req as Request & { reseller: typeof ja_resellers.$inferSelect }).reseller;
    const { id } = req.params;
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, error: 'Message body is required.' });

    const [ticket] = await db.select().from(ja_reseller_tickets)
      .where(and(eq(ja_reseller_tickets.uuid, id), eq(ja_reseller_tickets.resellerId, reseller.id)))
      .limit(1);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

    await db.insert(ja_reseller_ticket_messages).values({
      ticketId: ticket.id,
      senderType: 'reseller',
      senderId: reseller.id,
      senderName: reseller.fullName,
      body: body.trim(),
    });

    await db.update(ja_reseller_tickets).set({ status: 'open', updatedAt: new Date() }).where(eq(ja_reseller_tickets.id, ticket.id));

    return res.status(201).json({ success: true });
  });
}
