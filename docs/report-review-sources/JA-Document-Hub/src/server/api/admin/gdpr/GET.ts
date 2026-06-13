/**
 * GET /api/admin/gdpr
 * Returns all GDPR requests for admin review.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_gdpr_requests } from '../../../db/schema.js';
import { requireAdminSession } from '../_admin-session.js';
import { desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminSession(req);
  if (!identity) return res.status(401).json({ success: false, error: 'Admin session required.', code: 'NOT_AUTHENTICATED' });

  try {
    const requests = await db.select().from(ja_gdpr_requests).orderBy(desc(ja_gdpr_requests.createdAt));
    return res.json({ success: true, requests });
  } catch (err) {
    console.error('admin.gdpr.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
