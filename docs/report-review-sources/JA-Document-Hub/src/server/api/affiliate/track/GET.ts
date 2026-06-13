/**
 * GET /api/affiliate/track?ref=CODE&landing=/some-page
 * Public — records a referral click and sets a tracking cookie.
 * Redirects to the landing page (or homepage).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import crypto from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  const ref = (req.query.ref as string | undefined)?.toUpperCase().trim();
  const landing = (req.query.landing as string | undefined) ?? '/';

  if (!ref) return res.redirect('/');

  try {
    // Verify code exists and affiliate is approved
    const rows = await db.execute(sql`
      SELECT id FROM ja_affiliates
      WHERE referral_code = ${ref} AND status = 'approved'
      LIMIT 1
    `);
    const affiliate = (rows as unknown as { rows?: unknown[] }).rows?.[0] as { id: number } | undefined;
    if (!affiliate) return res.redirect('/');

    // Record click (hash IP for privacy)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const ua = (req.headers['user-agent'] as string ?? '').slice(0, 500);

    await db.execute(sql`
      INSERT INTO ja_affiliate_clicks (affiliate_id, ip_hash, user_agent, landing_page, created_at)
      VALUES (${affiliate.id}, ${ipHash}, ${ua}, ${landing.slice(0, 500)}, NOW())
    `);

    // Set 30-day tracking cookie
    res.cookie('ja_ref', ref, {
      httpOnly: false, // needs to be readable by checkout JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.redirect(landing.startsWith('/') ? landing : '/');
  } catch (err) {
    console.error('affiliate.track.error', err);
    return res.redirect('/');
  }
}
