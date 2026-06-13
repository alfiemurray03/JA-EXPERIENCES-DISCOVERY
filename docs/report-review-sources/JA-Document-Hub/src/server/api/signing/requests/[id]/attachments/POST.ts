/**
 * POST /api/signing/requests/:id/attachments
 * Upload an attachment to a signing request.
 * Body: { filename, mimeType, data (base64), visibleToSigners?, appendToFinalPack? }
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests, ja_signing_attachments } from '../../../../../db/schema.js';
import { eq, and, count } from 'drizzle-orm';
import { resolveSession } from '../../../../auth/_session.js';
import { logSigningAudit } from '../../../_email-helpers.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

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
  if (request.status === 'completed' || request.status === 'cancelled') {
    return res.status(400).json({ success: false, error: 'Cannot add attachments to a completed or cancelled request.' });
  }

  // Check attachment count
  const [countRow] = await db.select({ c: count() }).from(ja_signing_attachments).where(eq(ja_signing_attachments.requestId, request.id));
  if (Number(countRow?.c ?? 0) >= MAX_ATTACHMENTS) {
    return res.status(400).json({ success: false, error: `Maximum of ${MAX_ATTACHMENTS} attachments per request.` });
  }

  const { filename, mimeType, data, visibleToSigners = true, appendToFinalPack = false } = req.body as {
    filename?: string;
    mimeType?: string;
    data?: string;
    visibleToSigners?: boolean;
    appendToFinalPack?: boolean;
  };

  if (!filename || !data) return res.status(400).json({ success: false, error: 'filename and data are required.' });
  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    return res.status(400).json({ success: false, error: 'File type not allowed.' });
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({ success: false, error: 'File size must not exceed 20 MB.' });
  }

  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
  const uniqueFilename = `${Date.now()}-${safeFilename}`;
  const dir = `/shared-storage/public/assets/signing/${request.uuid}/attachments`;
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, uniqueFilename);
  await fs.writeFile(filePath, buffer);

  const relativePath = `signing/${request.uuid}/attachments/${uniqueFilename}`;
  const uuid = crypto.randomUUID();

  await db.insert(ja_signing_attachments).values({
    uuid,
    requestId: request.id,
    uploadedBy: userId as number,
    filename: uniqueFilename,
    originalName: safeFilename,
    mimeType: mimeType ?? 'application/octet-stream',
    fileSize: buffer.length,
    filePath: relativePath,
    fileHash: hash,
    visibleToSigners: Boolean(visibleToSigners),
    appendToFinalPack: Boolean(appendToFinalPack),
  });

  const [attachment] = await db.select().from(ja_signing_attachments).where(eq(ja_signing_attachments.uuid, uuid)).limit(1);

  await logSigningAudit(
    request.id, null, userId as number, null,
    'attachment_uploaded',
    `Attachment uploaded: ${safeFilename} (${buffer.length} bytes)`,
    req.ip ?? null, req.headers['user-agent'] ?? null, null, null
  );

  return res.status(201).json({ success: true, attachment });
}
