import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_invoices } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveSession } from '../auth/_session.js';
import crypto from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const { title, data } = req.body as { title?: string; data?: unknown };
  if (!title || !data) return res.status(400).json({ success: false, error: 'Missing title or data.' });
  try {
    const uuid = crypto.randomUUID();
    await db.insert(ja_invoices).values({
      uuid,
      userId,
      title: String(title).slice(0, 255),
      data: JSON.stringify(data),
    });
    const [row] = await db.select({ id: ja_invoices.uuid, title: ja_invoices.title, updatedAt: ja_invoices.updatedAt })
      .from(ja_invoices).where(eq(ja_invoices.uuid, uuid)).limit(1);
    return res.status(201).json({ success: true, invoice: row });
  } catch (err) {
    console.error('invoices.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to save invoice.' });
  }
}
