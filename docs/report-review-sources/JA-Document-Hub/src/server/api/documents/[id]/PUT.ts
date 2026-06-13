/**
 * PUT /api/documents/:id
 * Updates a document for the authenticated customer.
 */
import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_documents, ja_sessions } from '../../../db/schema.js';

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

    const { id } = req.params;
    const userId = session.userId as number;
    const existing = await db
      .select({ id: ja_documents.id })
      .from(ja_documents)
      .where(sql`${ja_documents.uuid} = ${id} AND ${ja_documents.userId} = ${userId}`)
      .limit(1);

    if (!existing[0]) return res.status(404).json({ success: false, error: 'Document not found.' });

    const { title, status, fields, content, folderId, docRef, category } = req.body as {
      title?: string;
      status?: string;
      fields?: Record<string, unknown>;
      content?: string;
      folderId?: string | null;
      docRef?: string;
      category?: string;
    };

    const setPayload: Partial<typeof ja_documents.$inferInsert> & { updatedAt: Date } = { updatedAt: new Date() };
    if (title !== undefined) setPayload.title = title;
    if (status !== undefined) setPayload.status = status as 'draft' | 'complete' | 'archived';
    if (fields !== undefined) setPayload.fields = JSON.stringify(fields);
    if (content !== undefined) setPayload.content = content;
    if (folderId !== undefined) setPayload.folderId = folderId ?? undefined;
    if (docRef !== undefined) setPayload.docRef = docRef;
    if (category !== undefined) setPayload.category = category;

    await db
      .update(ja_documents)
      .set(setPayload)
      .where(sql`${ja_documents.uuid} = ${id} AND ${ja_documents.userId} = ${userId}`);

    return res.json({ success: true });
  } catch (err) {
    console.error('documents.put.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
