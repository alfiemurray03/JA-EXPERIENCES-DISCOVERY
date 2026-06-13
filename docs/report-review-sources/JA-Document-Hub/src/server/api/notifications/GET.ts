import type { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_notifications } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const rows = await db.select()
    .from(ja_notifications)
    .where(eq(ja_notifications.userId, userId))
    .orderBy(desc(ja_notifications.createdAt))
    .limit(30);
  const unreadCount = rows.filter(r => !r.read).length;
  return res.json({ success: true, notifications: rows, unreadCount });
}
