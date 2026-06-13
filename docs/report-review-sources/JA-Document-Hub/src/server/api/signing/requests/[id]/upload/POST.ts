/**
 * POST /api/signing/requests/:id/upload
 * Upload a document file for a signing request.
 * Accepts multipart/form-data with a 'document' field.
 * Stores to /shared-storage/public/assets/signing/<uuid>/<filename>
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../../auth/_session.js';
import { logSigningAudit } from '../../../_email-helpers.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

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
  if (request.status !== 'draft') return res.status(400).json({ success: false, error: 'Only draft requests can have documents uploaded.' });

  // multer is not available — use raw body parsing
  // The frontend sends the file as base64 JSON: { filename, mimeType, data (base64) }
  const { filename, mimeType, data } = req.body as { filename?: string; mimeType?: string; data?: string };
  if (!filename || !data) return res.status(400).json({ success: false, error: 'filename and data are required.' });

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  if (mimeType && !allowedTypes.includes(mimeType)) {
    return res.status(400).json({ success: false, error: 'Only PDF and image files are supported.' });
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length > 20 * 1024 * 1024) {
    return res.status(400).json({ success: false, error: 'File size must not exceed 20 MB.' });
  }

  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
  const dir = `/shared-storage/public/assets/signing/${request.uuid}`;
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, safeFilename);
  await fs.writeFile(filePath, buffer);

  const relativePath = `signing/${request.uuid}/${safeFilename}`;
  await db.update(ja_signing_requests)
    .set({ documentPath: relativePath, documentName: safeFilename, documentHash: hash, updatedAt: new Date() })
    .where(eq(ja_signing_requests.id, request.id));

  await logSigningAudit(request.id, null, userId as number, null, 'document_uploaded', `Document uploaded: ${safeFilename} (${buffer.length} bytes, SHA-256: ${hash})`, req.ip ?? null, req.headers['user-agent'] ?? null, null, null);

  return res.json({ success: true, path: relativePath, hash, filename: safeFilename });
}
