/**
 * GET /api/signing/requests/:id/attachments
 * List attachments for a signing request.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests, ja_signing_attachments } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  const { id } = req.params;
  const [request] = await db
    .select()
    .from(ja_signing_requests)
    .where(and(eq(ja_signing_requests.uuid, id), eq(ja_signing_requests.userId, userId as number)))
    .limit(1);

  if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

  const attachments = await db
    .select()
    .from(ja_signing_attachments)
    .where(eq(ja_signing_attachments.requestId, request.id));

  return res.json({ success: true, attachments });
}
