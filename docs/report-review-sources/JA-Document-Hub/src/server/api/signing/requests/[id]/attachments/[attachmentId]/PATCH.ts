/**
 * PATCH /api/signing/requests/:id/attachments/:attachmentId
 * Update attachment visibility/append settings.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_signing_requests, ja_signing_attachments } from '../../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  const { id, attachmentId } = req.params;
  const [request] = await db
    .select()
    .from(ja_signing_requests)
    .where(and(eq(ja_signing_requests.uuid, id), eq(ja_signing_requests.userId, userId as number)))
    .limit(1);

  if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

  const [attachment] = await db
    .select()
    .from(ja_signing_attachments)
    .where(and(eq(ja_signing_attachments.uuid, attachmentId), eq(ja_signing_attachments.requestId, request.id)))
    .limit(1);

  if (!attachment) return res.status(404).json({ success: false, error: 'Attachment not found.' });

  const { visibleToSigners, appendToFinalPack } = req.body as {
    visibleToSigners?: boolean;
    appendToFinalPack?: boolean;
  };

  const updates: Partial<typeof ja_signing_attachments.$inferInsert> = {};
  if (visibleToSigners !== undefined) updates.visibleToSigners = Boolean(visibleToSigners);
  if (appendToFinalPack !== undefined) updates.appendToFinalPack = Boolean(appendToFinalPack);

  if (Object.keys(updates).length > 0) {
    await db.update(ja_signing_attachments).set(updates).where(eq(ja_signing_attachments.id, attachment.id));
  }

  const [updated] = await db.select().from(ja_signing_attachments).where(eq(ja_signing_attachments.id, attachment.id)).limit(1);
  return res.json({ success: true, attachment: updated });
}
