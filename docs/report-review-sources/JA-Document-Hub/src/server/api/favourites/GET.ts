import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_favourites } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const rows = await db.select({ templateId: ja_favourites.templateId })
    .from(ja_favourites).where(eq(ja_favourites.userId, userId));
  return res.json({ success: true, favourites: rows.map(r => r.templateId) });
}
