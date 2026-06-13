import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { ja_user_preferences } from '../../../db/schema.js';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  const body = req.body as {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    theme?: string;
  };

  try {
    const existing = await db.select({ userId: ja_user_preferences.userId })
      .from(ja_user_preferences)
      .where(eq(ja_user_preferences.userId, userId))
      .limit(1);

    const updates: { emailNotifications?: boolean; marketingEmails?: boolean; theme?: string } = {};
    if (typeof body.emailNotifications === 'boolean') updates.emailNotifications = body.emailNotifications;
    if (typeof body.marketingEmails === 'boolean') updates.marketingEmails = body.marketingEmails;
    if (typeof body.theme === 'string' && ['light', 'dark', 'system'].includes(body.theme)) {
      updates.theme = body.theme;
    }

    if (existing.length > 0) {
      await db.update(ja_user_preferences).set(updates).where(eq(ja_user_preferences.userId, userId));
    } else {
      await db.insert(ja_user_preferences).values({ userId, ...updates });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('user.preferences.patch.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
