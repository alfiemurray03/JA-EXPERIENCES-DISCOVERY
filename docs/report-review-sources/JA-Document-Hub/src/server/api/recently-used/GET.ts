import type { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_recently_used } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const rows = await db.select({ templateId: ja_recently_used.templateId, usedAt: ja_recently_used.usedAt })
    .from(ja_recently_used)
    .where(eq(ja_recently_used.userId, userId))
    .orderBy(desc(ja_recently_used.usedAt))
    .limit(10);
  return res.json({ success: true, recentlyUsed: rows.map(r => r.templateId) });
}
