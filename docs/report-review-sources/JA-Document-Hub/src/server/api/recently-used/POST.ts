/**
 * POST /api/recently-used
 * Records a template as recently used (upsert on used_at).
 */
import type { Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_recently_used } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const { templateId } = req.body as { templateId?: string };
  if (!templateId) return res.status(400).json({ success: false, error: 'templateId required.' });

  const existing = await db.select({ id: ja_recently_used.id })
    .from(ja_recently_used)
    .where(and(eq(ja_recently_used.userId, userId), eq(ja_recently_used.templateId, templateId)))
    .limit(1);

  if (existing[0]) {
    await db.update(ja_recently_used)
      .set({ usedAt: new Date() })
      .where(eq(ja_recently_used.id, existing[0].id));
  } else {
    await db.insert(ja_recently_used).values({ userId, templateId });
  }

  // Keep only the 20 most recent per user
  const all = await db.select({ id: ja_recently_used.id })
    .from(ja_recently_used)
    .where(eq(ja_recently_used.userId, userId))
    .orderBy(desc(ja_recently_used.usedAt));
  if (all.length > 20) {
    const toDelete = all.slice(20).map(r => r.id);
    for (const id of toDelete) {
      await db.delete(ja_recently_used).where(eq(ja_recently_used.id, id));
    }
  }

  return res.json({ success: true });
}
