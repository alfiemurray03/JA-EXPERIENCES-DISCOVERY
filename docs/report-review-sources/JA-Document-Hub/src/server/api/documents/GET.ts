/**
 * GET /api/documents
 * Returns all documents for the authenticated customer.
 */
import type { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_documents, ja_sessions } from '../../db/schema.js';

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

    const docs = await db
      .select()
      .from(ja_documents)
      .where(eq(ja_documents.userId, session.userId))
      .orderBy(desc(ja_documents.updatedAt));

    return res.json({
      success: true,
      documents: docs.map((d) => {
        const fields = d.fields ? JSON.parse(d.fields) as Record<string, unknown> : {};
        const templateName = typeof fields._templateName === 'string' ? fields._templateName : d.templateId;
        return {
          id: d.uuid,
          templateId: d.templateId,
          templateName,
          category: d.category,
          title: d.title,
          status: d.status,
          docRef: d.docRef,
          fields,
          content: d.content ?? '',
          // Legacy aliases for wizard/view pages
          formData: fields as Record<string, string>,
          generatedContent: d.content ?? '',
          version: d.version,
          folderId: d.folderId,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        };
      }),
    });
  } catch (err) {
    console.error('documents.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
