/**
 * PATCH /api/admin/support/tickets/:id
 * Update ticket status, priority, or admin notes.
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { ja_support_tickets } from '../../../../db/schema.js';
import { requireAdminSession } from '../../_admin-session.js';
import { logAdminAction } from '../../_audit-log.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  const ticketId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, priority, adminNotes } = req.body as {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    adminNotes?: string;
  };

  try {
    type TicketUpdate = {
      status?: 'open' | 'in_progress' | 'resolved' | 'closed';
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      adminNotes?: string;
      resolvedAt?: Date;
      resolvedBy?: string;
      updatedAt?: Date;
    };

    const updates: TicketUpdate = { updatedAt: new Date() };
    if (status)                  updates.status     = status;
    if (priority)                updates.priority   = priority;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date();
      updates.resolvedBy = adminEmail;
    }

    await db.update(ja_support_tickets)
      .set(updates)
      .where(eq(ja_support_tickets.id, ticketId));

    const [updated] = await db.select().from(ja_support_tickets)
      .where(eq(ja_support_tickets.id, ticketId));

    const changes: string[] = [];
    if (status) changes.push(`status→${status}`);
    if (priority) changes.push(`priority→${priority}`);
    if (adminNotes !== undefined) changes.push('notes updated');
    await logAdminAction(adminEmail, 'support.ticket_update', `Ticket #${ticketId}: ${changes.join(', ')}`, req);

    return res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('admin.support.patch.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
