/**
 * GET /api/signing/sign/:token
 * Public endpoint — no authentication required.
 * Returns the signing request details for a signer to review.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_signing_fields, ja_signing_attachments } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logSigningAudit } from '../../_email-helpers.js';

export default async function handler(req: Request, res: Response) {
  const { token } = req.params;
  if (!token || token.length < 32) return res.status(400).json({ success: false, error: 'Invalid signing token.' });

  const [signer] = await db
    .select()
    .from(ja_signing_signers)
    .where(eq(ja_signing_signers.token, token))
    .limit(1);

  if (!signer) return res.status(404).json({ success: false, error: 'Signing link not found or has expired.' });

  // Check token expiry
  if (signer.tokenExpiresAt && new Date() > signer.tokenExpiresAt) {
    return res.status(410).json({ success: false, error: 'This signing link has expired.', code: 'TOKEN_EXPIRED' });
  }

  // Check signer status
  if (signer.status === 'signed') {
    return res.status(200).json({ success: true, alreadySigned: true, signerName: signer.name });
  }
  if (signer.status === 'declined') {
    return res.status(200).json({ success: true, declined: true, signerName: signer.name });
  }

  const [request] = await db
    .select()
    .from(ja_signing_requests)
    .where(eq(ja_signing_requests.id, signer.requestId))
    .limit(1);

  if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

  if (['cancelled', 'expired'].includes(request.status)) {
    return res.status(410).json({ success: false, error: 'This signing request has been cancelled or expired.', code: 'REQUEST_INACTIVE' });
  }

  // Check sequential order — is it this signer's turn?
  if (request.signerOrder === 'sequential') {
    const allSigners = await db.select().from(ja_signing_signers).where(eq(ja_signing_signers.requestId, request.id));
    const prevSigners = allSigners.filter(s => s.order < signer.order);
    const allPrevSigned = prevSigners.every(s => s.status === 'signed');
    if (!allPrevSigned) {
      return res.status(200).json({ success: true, waitingForPrevious: true, signerName: signer.name, signerOrder: signer.order });
    }
  }

  // Get fields for this signer
  const fields = await db
    .select()
    .from(ja_signing_fields)
    .where(and(eq(ja_signing_fields.requestId, request.id), eq(ja_signing_fields.signerId, signer.id)));

  // Get attachments visible to signers
  const allAttachments = await db
    .select()
    .from(ja_signing_attachments)
    .where(eq(ja_signing_attachments.requestId, request.id));
  const visibleAttachments = allAttachments.filter(a => a.visibleToSigners);

  // Mark as viewed if not already
  if (signer.status === 'sent' || signer.status === 'pending') {
    await db.update(ja_signing_signers)
      .set({ status: 'viewed', updatedAt: new Date() })
      .where(eq(ja_signing_signers.id, signer.id));
    await logSigningAudit(
      request.id, signer.id, null, null, 'document_viewed',
      `Document viewed by ${signer.email}`,
      req.ip ?? null, req.headers['user-agent'] ?? null, signer.email, 'email_token',
    );
    // Update request status if needed
    if (request.status === 'sent') {
      await db.update(ja_signing_requests).set({ status: 'viewed', updatedAt: new Date() }).where(eq(ja_signing_requests.id, request.id));
    }
  }

  return res.json({
    success: true,
    request: {
      uuid: request.uuid,
      title: request.title,
      message: request.message,
      documentPath: request.documentPath ? `/airo-assets/uploads/${request.documentPath}` : null,
      documentName: request.documentName,
      status: request.status,
      expiresAt: request.expiresAt,
    },
    signer: {
      uuid: signer.uuid,
      name: signer.name,
      email: signer.email,
      role: signer.role,
      status: signer.status,
    },
    fields: fields.map(f => ({
      uuid: f.uuid,
      fieldType: f.fieldType,
      page: f.page,
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      required: f.required,
      label: f.label,
      value: f.value,
    })),
    attachments: visibleAttachments.map(a => ({
      uuid: a.uuid,
      originalName: a.originalName,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
      url: `/airo-assets/uploads/${a.filePath}`,
    })),
  });
}
