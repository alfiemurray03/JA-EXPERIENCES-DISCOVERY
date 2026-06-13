import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_favourites } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const { templateId } = req.body as { templateId?: string };
  if (!templateId) return res.status(400).json({ success: false, error: 'templateId required.' });
  await db.delete(ja_favourites)
    .where(and(eq(ja_favourites.userId, userId), eq(ja_favourites.templateId, templateId)));
  return res.json({ success: true });
}
