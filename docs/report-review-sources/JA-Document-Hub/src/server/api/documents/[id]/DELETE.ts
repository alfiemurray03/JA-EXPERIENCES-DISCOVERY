/**
 * DELETE /api/documents/:id
 * Deletes a document for the authenticated customer.
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
    await db
      .delete(ja_documents)
      .where(sql`${ja_documents.uuid} = ${id} AND ${ja_documents.userId} = ${userId}`);

    return res.json({ success: true });
  } catch (err) {
    console.error('documents.delete.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
