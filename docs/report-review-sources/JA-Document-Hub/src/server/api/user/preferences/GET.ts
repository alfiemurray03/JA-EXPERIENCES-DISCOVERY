import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_user_preferences } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  try {
    const rows = await db.select().from(ja_user_preferences).where(eq(ja_user_preferences.userId, userId)).limit(1);
    const row = rows[0];
    const preferences = {
      emailNotifications: row?.emailNotifications ?? true,
      marketingEmails: row?.marketingEmails ?? false,
      theme: row?.theme ?? 'system',
    };
    return res.json({ success: true, preferences });
  } catch (err) {
    console.error('user.preferences.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
