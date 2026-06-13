/**
 * GET /api/admin/affiliates/conversions
 * Returns all conversions (optionally filtered by affiliateId or status).
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdminRole } from '../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, []);
  if (!identity) return;

  const affiliateId = req.query.affiliateId as string | undefined;
  const status = req.query.status as string | undefined;

  try {
    const rows = await db.execute(sql`
      SELECT
        cv.id, cv.affiliate_id, cv.user_id, cv.type, cv.plan,
        cv.amount_gbp, cv.commission_gbp, cv.status,
        cv.paid_at, cv.paid_by, cv.created_at,
        a.full_name AS affiliate_name, a.email AS affiliate_email, a.referral_code
      FROM ja_affiliate_conversions cv
      JOIN ja_affiliates a ON a.id = cv.affiliate_id
      WHERE 1=1
        ${affiliateId ? sql`AND cv.affiliate_id = ${affiliateId}` : sql``}
        ${status ? sql`AND cv.status = ${status}` : sql``}
      ORDER BY cv.created_at DESC
      LIMIT 500
    `);

    return res.json({
      success: true,
      conversions: (rows as unknown as { rows?: unknown[] }).rows ?? [],
    });
  } catch (err) {
    console.error('admin.affiliates.conversions.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load conversions.' });
  }
}
