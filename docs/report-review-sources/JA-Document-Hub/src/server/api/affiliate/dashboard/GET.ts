/**
 * GET /api/affiliate/dashboard
 * Authenticated customer — returns the affiliate's own stats.
 * Only approved affiliates can access this.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  }

  try {
    // Find affiliate linked to this user account
    const affRows = await db.execute(sql`
      SELECT id, uuid, full_name, email, referral_code, commission_rate, status, created_at
      FROM ja_affiliates
      WHERE user_id = ${userId} AND status = 'approved'
      LIMIT 1
    `);
    const aff = ((affRows as unknown as { rows?: unknown[] }).rows ?? [])[0] as {
      id: number; uuid: string; full_name: string; email: string;
      referral_code: string; commission_rate: number; status: string; created_at: string;
    } | undefined;

    if (!aff) {
      return res.status(403).json({ success: false, error: 'No approved affiliate account found.', code: 'NOT_AFFILIATE' });
    }

    // Stats
    const [clicksRes, signupsRes, commissionsRes] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as cnt FROM ja_affiliate_clicks WHERE affiliate_id = ${aff.id}`),
      db.execute(sql`SELECT COUNT(*) as cnt FROM ja_affiliate_conversions WHERE affiliate_id = ${aff.id} AND type = 'signup'`),
      db.execute(sql`
        SELECT
          SUM(CASE WHEN status = 'pending' THEN commission_gbp ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN commission_gbp ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'paid' THEN commission_gbp ELSE 0 END) as paid
        FROM ja_affiliate_conversions WHERE affiliate_id = ${aff.id}
      `),
    ]);

    const clicks = Number(((clicksRes as unknown as { rows?: unknown[] }).rows ?? [])[0] as { cnt: number } | undefined)
      || Number(((clicksRes as unknown as { rows?: unknown[] }).rows ?? [])[0] as { cnt?: string } | undefined)?.valueOf()
      || 0;

    const signups = Number(((signupsRes as unknown as { rows?: unknown[] }).rows ?? [])[0] as { cnt?: string | number } | undefined)
      || 0;

    const commRow = ((commissionsRes as unknown as { rows?: unknown[] }).rows ?? [])[0] as {
      pending?: string | number; approved?: string | number; paid?: string | number;
    } | undefined;

    const baseUrl = `${req.protocol}://${req.hostname}`;
    const referralLink = `${baseUrl}/?ref=${aff.referral_code}`;

    return res.json({
      success: true,
      affiliate: {
        uuid: aff.uuid,
        fullName: aff.full_name,
        email: aff.email,
        referralCode: aff.referral_code,
        referralLink,
        commissionRate: aff.commission_rate,
        status: aff.status,
        joinedAt: aff.created_at,
      },
      stats: {
        clicks: Number(clicks) || 0,
        signups: Number(signups) || 0,
        commissionPending: Number(commRow?.pending ?? 0),
        commissionApproved: Number(commRow?.approved ?? 0),
        commissionPaid: Number(commRow?.paid ?? 0),
      },
    });
  } catch (err) {
    console.error('affiliate.dashboard.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load affiliate dashboard.' });
  }
}
