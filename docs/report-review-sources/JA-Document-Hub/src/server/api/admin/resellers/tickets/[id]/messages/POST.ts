import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_reseller_tickets, ja_reseller_ticket_messages, ja_resellers } from '../../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAdminRole } from '../../../../_require-role.js';
import { sendEmail } from '../../../../../../email.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const { id } = req.params;
  const { body, status } = req.body;
  if (!body?.trim()) return res.status(400).json({ success: false, error: 'Message body is required.' });

  const [ticket] = await db.select().from(ja_reseller_tickets).where(eq(ja_reseller_tickets.uuid, id)).limit(1);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

  const [reseller] = await db.select().from(ja_resellers).where(eq(ja_resellers.id, ticket.resellerId)).limit(1);

  await db.insert(ja_reseller_ticket_messages).values({
    ticketId: ticket.id,
    senderType: 'admin',
    senderId: 0,
    senderName: identity.email,
    body: body.trim(),
  });

  const newStatus = status ?? (ticket.status === 'open' ? 'in_progress' : ticket.status);
  await db.update(ja_reseller_tickets).set({ status: newStatus, updatedAt: new Date() }).where(eq(ja_reseller_tickets.id, ticket.id));

  if (reseller) {
    await sendEmail({
      to: reseller.email,
      subject: `Support Update: ${ticket.subject}`,
      html: `<h2>Support Update</h2><p>Dear ${reseller.fullName},</p><p>Our team has replied to your support ticket: <strong>${ticket.subject}</strong></p><blockquote>${body.trim().replace(/\n/g, '<br/>')}</blockquote><p>Log in to your reseller portal to view the full conversation.</p><p>Kind regards,<br/>JA Group Services Support</p>`,
      text: `Support reply for "${ticket.subject}":\n\n${body.trim()}`,
    }).catch(() => {});
  }

  return res.status(201).json({ success: true });
}
