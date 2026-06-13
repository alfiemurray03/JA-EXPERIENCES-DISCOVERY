/**
 * POST /api/documents
 * Creates a new saved draft for the authenticated customer.
 *
 * Enforces:
 *  - Plan must allow saving (free plan cannot save)
 *  - Draft limit per plan (5 for Standard, 10 for Professional/Org)
 *  - Sets expiresAt based on plan retention period
 */
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_documents, ja_sessions, ja_users } from '../../db/schema.js';
import {
  PLAN_DRAFT_LIMIT, PLAN_RETENTION_DAYS, canSaveDrafts,
  type PlanId,
} from '../../../lib/plan-config.js';

export default async function handler(req: Request, res: Response) {
  try {
    const token = req.cookies?.ja_session as string | undefined;
    if (!token) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

    const sessionRows = await db
      .select({ userId: ja_sessions.userId, expiresAt: ja_sessions.expiresAt })
      .from(ja_sessions)
      .where(eq(ja_sessions.token, token))
      .limit(1);

    const session = sessionRows[0];
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ success: false, error: 'Session expired.' });
    }

    // Load user plan
    const userRows = await db
      .select({ plan: ja_users.plan })
      .from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);

    const plan = (userRows[0]?.plan ?? 'free') as PlanId;

    // Free plan cannot save drafts
    if (!canSaveDrafts(plan)) {
      return res.status(403).json({
        success: false,
        error: 'Your current plan does not include saved drafts. Upgrade to Standard or above to save documents.',
        code: 'PLAN_NO_DRAFTS',
      });
    }

    // Check draft limit
    const draftLimit = PLAN_DRAFT_LIMIT[plan];
    const countRows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ja_documents)
      .where(and(
        eq(ja_documents.userId, session.userId),
        sql`\`status\` != 'archived'`,
      ));
    const currentCount = Number(countRows[0]?.count ?? 0);

    if (currentCount >= draftLimit) {
      return res.status(403).json({
        success: false,
        error: `You have reached your draft limit of ${draftLimit} documents. Export or delete existing drafts to create new ones.`,
        code: 'DRAFT_LIMIT_REACHED',
        limit: draftLimit,
        current: currentCount,
      });
    }

    const { templateId, title, category, status, docRef, fields, content, folderId } = req.body as {
      templateId?: string;
      title?: string;
      category?: string;
      status?: string;
      docRef?: string;
      fields?: Record<string, unknown>;
      content?: string;
      folderId?: string;
    };

    if (!templateId || !title) {
      return res.status(400).json({ success: false, error: 'templateId and title are required.' });
    }

    // Calculate expiry date
    const retentionDays = PLAN_RETENTION_DAYS[plan];
    const now = new Date();
    const expiresAt = retentionDays
      ? new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000)
      : null;

    const uuid = crypto.randomUUID();

    await db.insert(ja_documents).values({
      uuid,
      userId: session.userId,
      templateId,
      title,
      category: category ?? null,
      status: (status as 'draft' | 'complete' | 'archived') ?? 'draft',
      docRef: docRef ?? null,
      fields: fields ? JSON.stringify(fields) : null,
      content: content ?? null,
      folderId: folderId ?? null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      document: {
        id: uuid,
        templateId,
        title,
        category: category ?? null,
        status: status ?? 'draft',
        docRef: docRef ?? null,
        fields: fields ?? {},
        content: content ?? '',
        folderId: folderId ?? null,
        version: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error('documents.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
