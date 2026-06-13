import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_builder_docs } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const builderId = req.query.builderId as string | undefined;
  try {
    let query = db.select({
      id: ja_builder_docs.uuid,
      builderId: ja_builder_docs.builderId,
      templateId: ja_builder_docs.templateId,
      title: ja_builder_docs.title,
      status: ja_builder_docs.status,
      updatedAt: ja_builder_docs.updatedAt,
    }).from(ja_builder_docs).where(
      builderId
        ? and(eq(ja_builder_docs.userId, userId), eq(ja_builder_docs.builderId, builderId))
        : eq(ja_builder_docs.userId, userId)
    ).orderBy(desc(ja_builder_docs.updatedAt)).limit(100);
    const rows = await query;
    return res.json({ success: true, docs: rows });
  } catch (err) {
    console.error('builder-docs.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load documents.' });
  }
}
