import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_invoices } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  try {
    const rows = await db.select({
      id: ja_invoices.uuid,
      title: ja_invoices.title,
      updatedAt: ja_invoices.updatedAt,
    }).from(ja_invoices).where(eq(ja_invoices.userId, userId)).orderBy(desc(ja_invoices.updatedAt)).limit(50);
    return res.json({ success: true, invoices: rows });
  } catch (err) {
    console.error('invoices.get.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load invoices.' });
  }
}
