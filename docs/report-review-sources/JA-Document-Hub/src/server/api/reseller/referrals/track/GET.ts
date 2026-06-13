/**
 * GET /api/reseller/referrals/track?code=XXX
 * Track a referral link click. Sets a cookie for attribution.
 * Redirects to homepage (or landing page).
 */
import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { db } from '../../../../db/client.js';
import { ja_resellers, ja_reseller_clicks } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { code } = req.query as { code?: string };
  if (!code) return res.redirect('/');

  const [reseller] = await db.select({ id: ja_resellers.id }).from(ja_resellers).where(eq(ja_resellers.referralCode, code)).limit(1);
  if (reseller) {
    const ipHash = createHash('sha256').update(req.ip ?? '').digest('hex');
    await db.insert(ja_reseller_clicks).values({
      resellerId: reseller.id,
      ipHash,
      userAgent: (req.headers['user-agent'] ?? '').slice(0, 500),
      landingPage: (req.query.lp as string ?? '/').slice(0, 500),
    }).catch(() => {});

    // Set attribution cookie (30 days)
    res.cookie('ja_reseller_ref', code, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });
  }

  return res.redirect('/');
}
