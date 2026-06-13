/**
 * DELETE /api/signing/requests/:id/attachments/:attachmentId
 * Delete an attachment from a signing request.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../../db/client.js';
import { ja_signing_requests, ja_signing_attachments } from '../../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../../../auth/_session.js';
import { logSigningAudit } from '../../../../_email-helpers.js';
import fs from 'node:fs/promises';

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
  if (request.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Cannot delete attachments from a completed request.' });
  }

  const [attachment] = await db
    .select()
    .from(ja_signing_attachments)
    .where(and(eq(ja_signing_attachments.uuid, attachmentId), eq(ja_signing_attachments.requestId, request.id)))
    .limit(1);

  if (!attachment) return res.status(404).json({ success: false, error: 'Attachment not found.' });

  // Delete file from disk
  try {
    await fs.unlink(`/shared-storage/public/assets/${attachment.filePath}`);
  } catch { /* file may already be gone */ }

  await db.delete(ja_signing_attachments).where(eq(ja_signing_attachments.id, attachment.id));

  await logSigningAudit(
    request.id, null, userId as number, null,
    'attachment_deleted',
    `Attachment deleted: ${attachment.originalName}`,
    req.ip ?? null, req.headers['user-agent'] ?? null, null, null
  );

  return res.json({ success: true });
}
