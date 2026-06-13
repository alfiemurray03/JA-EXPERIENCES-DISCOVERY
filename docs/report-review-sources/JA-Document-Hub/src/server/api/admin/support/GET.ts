/**
 * GET /api/admin/support/tickets
 * Returns all support tickets with optional status/priority filters.
 */
import type { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_support_tickets } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const { status, priority } = req.query as Record<string, string>;

    let query = db.select().from(ja_support_tickets).orderBy(desc(ja_support_tickets.createdAt));

    const tickets = await query;

    // Filter in JS (simpler than dynamic drizzle where chains)
    let filtered = tickets;
    if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority === priority);

    // Stats
    const stats = {
      open:        tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved:    tickets.filter(t => t.status === 'resolved').length,
      closed:      tickets.filter(t => t.status === 'closed').length,
      urgent:      tickets.filter(t => t.priority === 'urgent').length,
      total:       tickets.length,
    };

    return res.json({ success: true, tickets: filtered, stats });
  } catch (err) {
    console.error('admin.support.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
