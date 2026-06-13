import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_docs } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  const { id } = req.params;
  try {
    const [row] = await db.select().from(ja_builder_docs)
      .where(and(eq(ja_builder_docs.uuid, id), eq(ja_builder_docs.userId, userId as number))).limit(1);
    if (!row) return res.status(404).json({ success: false, error: 'Document not found.' });
    return res.json({
      success: true,
      doc: {
        ...row,
        fields: JSON.parse(row.fields),
      },
    });
  } catch (err) {
    console.error('builder-docs.getone.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load document.' });
  }
}
