/**
 * GET /api/admin/support/tickets/:id/messages
 * Returns all messages for a support ticket. Admin only.
 * Also marks all customer messages as read_by_admin.
 * Includes is_internal flag so the UI can distinguish internal notes.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminSession } from '../../../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const ticketId = parseInt(String(req.params.id), 10);
  if (!ticketId) return res.status(400).json({ success: false, error: 'Invalid ticket ID.' });

  try {
    // Mark all customer messages as read by admin
    await db.execute(sql`
      UPDATE ja_ticket_messages
      SET read_by_admin = 1
      WHERE ticket_id = ${ticketId} AND sender_type = 'customer'
    `);

    const rows = await db.execute(sql`
      SELECT id, ticket_id, sender_type, sender_id, sender_name, sender_email,
             message, read_by_admin, read_by_customer,
             COALESCE(is_internal, 0) AS is_internal,
             created_at
      FROM ja_ticket_messages
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `);

    const messages = (rows as unknown as { rows?: unknown[] }).rows ?? (Array.isArray(rows) ? rows : []);
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('admin.ticket.messages.get.error', err);
    return res.json({ success: true, messages: [] });
  }
}
