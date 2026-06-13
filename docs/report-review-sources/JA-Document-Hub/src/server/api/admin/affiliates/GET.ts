/**
 * GET /api/admin/affiliates
 * Returns all affiliate applications with stats.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminRole } from '../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const status = req.query.status as string | undefined;

  try {
    const rows = await db.execute(sql`
      SELECT
        a.id, a.uuid, a.full_name, a.email, a.phone, a.company, a.website,
        a.referral_code, a.commission_rate, a.status, a.agreed_to_terms,
        a.referral_method, a.expected_audience, a.admin_notes,
        a.approved_by, a.approved_at, a.created_at, a.updated_at,
        a.user_id,
        (SELECT COUNT(*) FROM ja_affiliate_clicks c WHERE c.affiliate_id = a.id) AS clicks,
        (SELECT COUNT(*) FROM ja_affiliate_conversions cv WHERE cv.affiliate_id = a.id AND cv.type = 'signup') AS signups,
        (SELECT COALESCE(SUM(cv2.commission_gbp),0) FROM ja_affiliate_conversions cv2 WHERE cv2.affiliate_id = a.id AND cv2.status = 'pending') AS commission_pending,
        (SELECT COALESCE(SUM(cv3.commission_gbp),0) FROM ja_affiliate_conversions cv3 WHERE cv3.affiliate_id = a.id AND cv3.status = 'paid') AS commission_paid
      FROM ja_affiliates a
      ${status ? sql`WHERE a.status = ${status}` : sql``}
      ORDER BY a.created_at DESC
    `);

    const affiliates = ((rows as unknown as { rows?: unknown[] }).rows ?? []) as Record<string, unknown>[];

    return res.json({ success: true, affiliates });
  } catch (err) {
    console.error('admin.affiliates.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load affiliates.' });
  }
}
