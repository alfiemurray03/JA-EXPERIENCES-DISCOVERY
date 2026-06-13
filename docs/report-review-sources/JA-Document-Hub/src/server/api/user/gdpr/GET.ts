/**
 * GET /api/user/gdpr
 * Returns the authenticated user's GDPR requests.
 */
import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_gdpr_requests } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  try {
    const requests = await db.select()
      .from(ja_gdpr_requests)
      .where(sql`user_id = ${userId}`)
      .orderBy(sql`created_at DESC`);

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('user.gdpr.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
