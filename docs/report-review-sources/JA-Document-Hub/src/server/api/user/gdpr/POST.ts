/**
 * POST /api/user/gdpr
 * Submit a GDPR data export or deletion request.
 * body: { type: 'export' | 'deletion', reason?: string }
 */
import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_users, ja_gdpr_requests } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  const { type, reason } = req.body as { type?: string; reason?: string };
  if (!type || !['export', 'deletion'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Request type must be "export" or "deletion".' });
  }

  try {
    const users = await db.select({ email: ja_users.email, firstName: ja_users.firstName, lastName: ja_users.lastName })
      .from(ja_users).where(eq(ja_users.id, userId)).limit(1);
    if (!users.length) return res.status(404).json({ success: false, error: 'User not found.' });
    const user = users[0];

    // Check for existing pending request of same type
    const existing = await db.select({ id: ja_gdpr_requests.id, status: ja_gdpr_requests.status })
      .from(ja_gdpr_requests)
      .where(sql`user_id = ${userId} AND request_type = ${type} AND status IN ('pending', 'processing')`)
      .limit(1);

    if (existing.length) {
      return res.status(409).json({ success: false, error: `You already have a pending ${type} request. We will process it shortly.` });
    }

    await db.insert(ja_gdpr_requests).values({
      userId,
      email: user.email,
      requestType: type as 'export' | 'deletion',
      reason: reason?.trim().slice(0, 1000) || null,
      status: 'pending',
    });

    const message = type === 'export'
      ? 'Your data export request has been submitted. We will email your data within 30 days as required by GDPR.'
      : 'Your account deletion request has been submitted. Your account and data will be permanently deleted within 30 days. You will receive a confirmation email.';

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('user.gdpr.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to submit your request. Please try again.' });
  }
}
