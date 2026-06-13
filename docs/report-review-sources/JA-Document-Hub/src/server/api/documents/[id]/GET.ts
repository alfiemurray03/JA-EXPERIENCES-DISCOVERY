/**
 * GET /api/documents/:id
 * Returns a single document by UUID for the authenticated customer.
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
    const rows = await db
      .select()
      .from(ja_documents)
      .where(sql`${ja_documents.uuid} = ${id} AND ${ja_documents.userId} = ${userId}`)
      .limit(1);

    const doc = rows[0];
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });

    const fields = doc.fields ? JSON.parse(doc.fields) as Record<string, unknown> : {};
    const templateName = typeof fields._templateName === 'string' ? fields._templateName : doc.templateId;

    return res.json({
      success: true,
      document: {
        id: doc.uuid,
        templateId: doc.templateId,
        templateName,
        category: doc.category,
        title: doc.title,
        status: doc.status,
        docRef: doc.docRef,
        fields,
        content: doc.content ?? '',
        formData: fields as Record<string, string>,
        generatedContent: doc.content ?? '',
        version: doc.version,
        folderId: doc.folderId,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('documents.get-one.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
