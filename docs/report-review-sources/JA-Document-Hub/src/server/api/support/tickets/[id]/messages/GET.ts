/**
 * GET /api/support/tickets/:id/messages
 * Returns messages for a ticket. Customer must own the ticket (matched by email).
 * Also marks admin messages as read_by_customer.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_sessions, ja_users, ja_support_tickets } from '../../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const sessionRows = await db
      .select({ userId: ja_sessions.userId, expiresAt: ja_sessions.expiresAt })
      .from(ja_sessions)
      .where(eq(ja_sessions.token, token))
      .limit(1);
    const session = sessionRows[0];
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ success: false, error: 'Session expired.' });
    }

    const userRows = await db
      .select({ email: ja_users.email, firstName: ja_users.firstName, lastName: ja_users.lastName })
      .from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);
    const user = userRows[0];
    if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

    const ticketId = parseInt(String(req.params.id), 10);
    const ticketRows = await db
      .select({ id: ja_support_tickets.id, email: ja_support_tickets.email })
      .from(ja_support_tickets)
      .where(eq(ja_support_tickets.id, ticketId))
      .limit(1);
    const ticket = ticketRows[0];
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    if (ticket.email !== user.email) return res.status(403).json({ success: false, error: 'Access denied.' });

    // Mark admin messages as read by customer
    await db.execute(sql`
      UPDATE ja_ticket_messages
      SET read_by_customer = 1
      WHERE ticket_id = ${ticketId} AND sender_type = 'admin'
    `);

    const rows = await db.execute(sql`
      SELECT id, ticket_id, sender_type, sender_id, sender_name, sender_email,
             message, read_by_admin, read_by_customer, created_at
      FROM ja_ticket_messages
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `);
    const messages = (rows as unknown as { rows?: unknown[] }).rows ?? (Array.isArray(rows) ? rows : []);

    return res.json({ success: true, messages, user: { name: `${user.firstName} ${user.lastName}`, email: user.email } });
  } catch (err) {
    console.error('support.ticket.messages.get.error', err);
    return res.json({ success: true, messages: [] });
  }
}
