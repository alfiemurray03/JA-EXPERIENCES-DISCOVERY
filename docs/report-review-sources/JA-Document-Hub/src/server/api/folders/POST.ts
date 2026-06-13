/**
 * POST /api/folders
 * Creates a new folder for the authenticated customer.
 */
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
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

    const { name, color } = req.body as { name?: string; color?: string };
    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required.' });
    }

    const uuid = crypto.randomUUID();
    const now = new Date();

    await db.insert(ja_folders).values({
      uuid,
      userId: session.userId,
      name: name.trim(),
      color: color ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      success: true,
      folder: { id: uuid, name: name.trim(), color: color ?? null, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    });
  } catch (err) {
    console.error('folders.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
