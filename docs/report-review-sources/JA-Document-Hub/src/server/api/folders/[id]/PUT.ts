/**
 * PUT /api/folders/:id
 * Updates a folder for the authenticated customer.
 */
import type { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_folders, ja_sessions } from '../../../db/schema.js';

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
    const { name, color } = req.body as { name?: string; color?: string };

    const setPayload: Partial<typeof ja_folders.$inferInsert> & { updatedAt: Date } = { updatedAt: new Date() };
    if (name !== undefined) setPayload.name = name.trim();
    if (color !== undefined) setPayload.color = color;

    await db
      .update(ja_folders)
      .set(setPayload)
      .where(sql`${ja_folders.uuid} = ${id} AND ${ja_folders.userId} = ${userId}`);

    return res.json({ success: true });
  } catch (err) {
    console.error('folders.put.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
