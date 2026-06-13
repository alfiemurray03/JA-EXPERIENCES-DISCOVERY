import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_reseller_tickets, ja_reseller_ticket_messages } from '../../../../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { requireAdminRole } from '../../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;
  const { id } = req.params;
  const [ticket] = await db.select().from(ja_reseller_tickets).where(eq(ja_reseller_tickets.uuid, id)).limit(1);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

  const messages = await db.select().from(ja_reseller_ticket_messages)
    .where(eq(ja_reseller_ticket_messages.ticketId, ticket.id))
    .orderBy(asc(ja_reseller_ticket_messages.createdAt));

  return res.json({ success: true, ticket, messages });
}
