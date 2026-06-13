/**
 * PATCH /api/notifications
 * Mark notifications as read.
 * Body: { ids: string[] } — specific IDs, or { all: true } to mark all read.
 */
import type { Request, Response } from 'express';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_notifications } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const { ids, all } = req.body as { ids?: number[]; all?: boolean };

  if (all) {
    await db.update(ja_notifications)
      .set({ read: true })
      .where(eq(ja_notifications.userId, userId));
  } else if (ids && ids.length > 0) {
    await db.update(ja_notifications)
      .set({ read: true })
      .where(and(eq(ja_notifications.userId, userId), inArray(ja_notifications.id, ids)));
  }
  return res.json({ success: true });
}
