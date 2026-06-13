/**
 * GET /api/admin/password-resets
 * Returns all password reset requests for admin review.
 */
import type { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_password_reset_requests } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  const adminEmail = identity?.email ?? 'unknown';
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required. Please sign in to the Admin Portal.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db
      .select()
      .from(ja_password_reset_requests)
      .orderBy(desc(ja_password_reset_requests.createdAt));

    return res.json({ success: true, requests: rows });
  } catch (err) {
    console.error('admin.password-resets.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
