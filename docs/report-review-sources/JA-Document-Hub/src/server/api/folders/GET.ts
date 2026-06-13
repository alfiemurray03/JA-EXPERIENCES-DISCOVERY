/**
 * GET /api/folders
 * Returns all folders for the authenticated customer.
 */
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_folders, ja_sessions } from '../../db/schema.js';

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

    const folders = await db
      .select()
      .from(ja_folders)
      .where(eq(ja_folders.userId, session.userId));

    return res.json({
      success: true,
      folders: folders.map((f) => ({
        id: f.uuid,
        name: f.name,
        color: f.color,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('folders.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
