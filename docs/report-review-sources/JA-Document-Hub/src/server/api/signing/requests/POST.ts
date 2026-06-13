import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_signing_requests, ja_users } from '../../../db/schema.js';
import { eq, count } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';
import { canUseSigning, PLAN_SIGNING_LIMIT, type PlanId } from '../../../../lib/plan-config.js';
import { logSigningAudit } from '../_email-helpers.js';
import crypto from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  // Plan check
  const userRows = await db.select({ plan: ja_users.plan }).from(ja_users).where(eq(ja_users.id, userId)).limit(1);
  const plan = (userRows[0]?.plan ?? 'free') as PlanId;
  if (!canUseSigning(plan)) {
    return res.status(403).json({ success: false, error: 'Document Signing requires the Professional plan or above.', code: 'PLAN_NO_SIGNING' });
  }

  // Limit check
  const countRows = await db.select({ c: count() }).from(ja_signing_requests).where(eq(ja_signing_requests.userId, userId));
  const current = Number(countRows[0]?.c ?? 0);
  const limit = PLAN_SIGNING_LIMIT[plan];
  if (current >= limit) {
    return res.status(403).json({ success: false, error: `You have reached your signing request limit of ${limit}.`, code: 'SIGNING_LIMIT_REACHED' });
  }

  const { title, message, signerOrder, expiresAt, reminderDays } = req.body as {
    title?: string; message?: string; signerOrder?: string;
    expiresAt?: string; reminderDays?: number;
  };
  if (!title?.trim()) return res.status(400).json({ success: false, error: 'Title is required.' });

  const uuid = crypto.randomUUID();
  await db.insert(ja_signing_requests).values({
    uuid,
    userId: userId as number,
    title: title.trim().slice(0, 255),
    message: message?.trim() || null,
    signerOrder: (signerOrder === 'sequential' ? 'sequential' : 'any') as 'any' | 'sequential',
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    reminderDays: reminderDays ?? 3,
    status: 'draft',
  });

  const [row] = await db.select().from(ja_signing_requests).where(eq(ja_signing_requests.uuid, uuid)).limit(1);
  await logSigningAudit(row.id, null, userId as number, null, 'document_created', `Signing request created: "${title}"`, req.ip ?? null, req.headers['user-agent'] ?? null, null, null);

  return res.status(201).json({ success: true, request: row });
}
