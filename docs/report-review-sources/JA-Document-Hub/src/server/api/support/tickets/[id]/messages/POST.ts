/**
 * POST /api/support/tickets/:id/messages
 * Customer sends a message on their support ticket.
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
      .select({ id: ja_users.id, email: ja_users.email, firstName: ja_users.firstName, lastName: ja_users.lastName })
      .from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);
    const user = userRows[0];
    if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

    const ticketId = parseInt(String(req.params.id), 10);
    const { message } = req.body as { message?: string };
    if (!message?.trim()) return res.status(400).json({ success: false, error: 'Message is required.' });

    const ticketRows = await db
      .select({ id: ja_support_tickets.id, email: ja_support_tickets.email, status: ja_support_tickets.status })
      .from(ja_support_tickets)
      .where(eq(ja_support_tickets.id, ticketId))
      .limit(1);
    const ticket = ticketRows[0];
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });
    if (ticket.email !== user.email) return res.status(403).json({ success: false, error: 'Access denied.' });
    if (ticket.status === 'closed') return res.status(400).json({ success: false, error: 'This ticket is closed.' });

    const senderName = `${user.firstName} ${user.lastName}`.trim();

    await db.execute(sql`
      INSERT INTO ja_ticket_messages (ticket_id, sender_type, sender_id, sender_name, sender_email, message, read_by_admin, read_by_customer)
      VALUES (${ticketId}, 'customer', ${user.id}, ${senderName}, ${user.email}, ${message.trim()}, 0, 1)
    `);

    // Re-open if resolved/closed
    if (ticket.status === 'resolved') {
      await db.update(ja_support_tickets)
        .set({ status: 'open', updatedAt: new Date() })
        .where(eq(ja_support_tickets.id, ticketId));
    }

    const rows = await db.execute(sql`
      SELECT id, ticket_id, sender_type, sender_id, sender_name, sender_email,
             message, read_by_admin, read_by_customer, created_at
      FROM ja_ticket_messages
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `);
    const messages = (rows as unknown as { rows?: unknown[] }).rows ?? (Array.isArray(rows) ? rows : []);

    return res.json({ success: true, messages });
  } catch (err) {
    console.error('support.ticket.messages.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
}
