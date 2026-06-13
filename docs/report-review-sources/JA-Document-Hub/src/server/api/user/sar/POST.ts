/**
 * POST /api/user/sar
 * Submit a Subject Access Request (SAR) or other GDPR right request.
 *
 * body: {
 *   requestType: 'sar' | 'export' | 'deletion' | 'rectification' | 'restriction' | 'portability' | 'objection',
 *   notes?: string
 * }
 *
 * Rate limiting: max 2 active (submitted/in_review/processing) requests per user.
 * Deadline: 30 calendar days from submission (UK GDPR Article 12(3)).
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_users, ja_sar_requests } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';
import { eq, and, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const VALID_TYPES = ['sar', 'export', 'deletion', 'rectification', 'restriction', 'portability', 'objection'] as const;
type SarType = typeof VALID_TYPES[number];

const TYPE_LABELS: Record<SarType, string> = {
  sar:            'Subject Access Request',
  export:         'Data Export',
  deletion:       'Right to Erasure (Account Deletion)',
  rectification:  'Right to Rectification',
  restriction:    'Right to Restriction of Processing',
  portability:    'Right to Data Portability',
  objection:      'Right to Object',
};

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  }

  const { requestType, notes } = req.body as { requestType?: string; notes?: string };

  if (!requestType || !VALID_TYPES.includes(requestType as SarType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid request type. Must be one of: ${VALID_TYPES.join(', ')}.`,
    });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? '';

  try {
    // Fetch user profile
    const users = await db
      .select({ email: ja_users.email, firstName: ja_users.firstName, lastName: ja_users.lastName })
      .from(ja_users)
      .where(eq(ja_users.id, userId))
      .limit(1);

    if (!users.length) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    const user = users[0];
    const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;

    // Rate limit: max 2 active requests of any type per user
    const activeRequests = await db
      .select({ id: ja_sar_requests.id })
      .from(ja_sar_requests)
      .where(
        and(
          eq(ja_sar_requests.userId, userId),
          inArray(ja_sar_requests.status, ['submitted', 'in_review', 'processing'])
        )
      );

    if (activeRequests.length >= 2) {
      return res.status(429).json({
        success: false,
        error: 'You already have active requests being processed. Please wait for them to be completed before submitting a new one.',
        code: 'RATE_LIMITED',
      });
    }

    // Check for duplicate active request of the same type
    const duplicate = await db
      .select({ id: ja_sar_requests.id })
      .from(ja_sar_requests)
      .where(
        and(
          eq(ja_sar_requests.userId, userId),
          eq(ja_sar_requests.requestType, requestType as SarType),
          inArray(ja_sar_requests.status, ['submitted', 'in_review', 'processing'])
        )
      )
      .limit(1);

    if (duplicate.length) {
      return res.status(409).json({
        success: false,
        error: `You already have an active ${TYPE_LABELS[requestType as SarType]} request. We will process it shortly.`,
        code: 'DUPLICATE_REQUEST',
      });
    }

    // UK GDPR deadline: 30 calendar days from submission
    const deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + 30);

    const uuid = randomUUID();

    await db.insert(ja_sar_requests).values({
      uuid,
      userId,
      email: user.email,
      fullName,
      requestType: requestType as SarType,
      notes: notes?.trim().slice(0, 2000) || null,
      status: 'submitted',
      deadlineAt,
      ipAddress: ip.slice(0, 45),
      userAgent: userAgent.slice(0, 500),
    });

    const label = TYPE_LABELS[requestType as SarType];
    const message = requestType === 'deletion'
      ? `Your ${label} request has been submitted (ref: ${uuid.slice(0, 8).toUpperCase()}). We will process it within 30 days as required by UK GDPR. You will receive a confirmation email. Your account will remain active until the deletion is processed.`
      : `Your ${label} has been submitted (ref: ${uuid.slice(0, 8).toUpperCase()}). We will respond within 30 days as required by UK GDPR. We may need to verify your identity before releasing any data.`;

    return res.status(201).json({ success: true, message, uuid });
  } catch (err) {
    console.error('user.sar.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to submit your request. Please try again.' });
  }
}
