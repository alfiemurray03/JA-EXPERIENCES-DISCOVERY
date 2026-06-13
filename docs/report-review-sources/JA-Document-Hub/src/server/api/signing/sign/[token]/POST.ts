/**
 * POST /api/signing/sign/:token
 * Public endpoint — no authentication required.
 * Submit signatures / decline a signing request.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_signing_fields, ja_users } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logSigningAudit, sendCompletionEmail, sendDeclinedEmail, sendSigningRequestEmail, buildSigningUrl } from '../../_email-helpers.js';

export default async function handler(req: Request, res: Response) {
  const { token } = req.params;
  if (!token || token.length < 32) return res.status(400).json({ success: false, error: 'Invalid signing token.' });

  const [signer] = await db
    .select()
    .from(ja_signing_signers)
    .where(eq(ja_signing_signers.token, token))
    .limit(1);

  if (!signer) return res.status(404).json({ success: false, error: 'Signing link not found.' });
  if (signer.tokenExpiresAt && new Date() > signer.tokenExpiresAt) {
    return res.status(410).json({ success: false, error: 'This signing link has expired.', code: 'TOKEN_EXPIRED' });
  }
  if (signer.status === 'signed') return res.status(400).json({ success: false, error: 'You have already signed this document.' });
  if (signer.status === 'declined') return res.status(400).json({ success: false, error: 'You have already declined this document.' });

  const [request] = await db
    .select()
    .from(ja_signing_requests)
    .where(eq(ja_signing_requests.id, signer.requestId))
    .limit(1);

  if (!request || ['cancelled', 'expired', 'completed'].includes(request.status)) {
    return res.status(410).json({ success: false, error: 'This signing request is no longer active.' });
  }

  const { action, fieldValues, declineReason, pageViewed } = req.body as {
    action: 'sign' | 'decline' | 'page_view';
    fieldValues?: Record<string, string>; // fieldUuid → value
    declineReason?: string;
    pageViewed?: number; // page number viewed
  };

  const ip = req.ip ?? null;
  const ua = req.headers['user-agent'] ?? null;

  // Page view event — lightweight audit log, no status change
  if (action === 'page_view' && pageViewed) {
    await logSigningAudit(request.id, signer.id, null, null, 'page_viewed', `Page ${pageViewed} viewed by ${signer.email}`, ip, ua, signer.email, 'email_token');
    return res.json({ success: true });
  }

  if (action === 'decline') {
    await db.update(ja_signing_signers)
      .set({ status: 'declined', declinedAt: new Date(), declineReason: declineReason?.trim() || null, ipAddress: ip, userAgent: ua, updatedAt: new Date() })
      .where(eq(ja_signing_signers.id, signer.id));
    await logSigningAudit(request.id, signer.id, null, null, 'declined', `Declined by ${signer.email}${declineReason ? ': ' + declineReason : ''}`, ip, ua, signer.email, 'email_token');

    // Update request status
    await db.update(ja_signing_requests).set({ status: 'declined', updatedAt: new Date() }).where(eq(ja_signing_requests.id, request.id));

    // Notify owner
    const [owner] = await db.select({ firstName: ja_users.firstName, lastName: ja_users.lastName, email: ja_users.email }).from(ja_users).where(eq(ja_users.id, request.userId)).limit(1);
    if (owner) {
      await sendDeclinedEmail({ ownerEmail: owner.email, ownerName: `${owner.firstName} ${owner.lastName}`, documentTitle: request.title, signerName: signer.name, signerEmail: signer.email, reason: declineReason, requestId: request.id, requestUuid: request.uuid, eventType: 'declined' });
    }
    return res.json({ success: true, message: 'You have declined to sign this document.' });
  }

  if (action === 'sign') {
    // Fill field values
    if (fieldValues && Object.keys(fieldValues).length > 0) {
      for (const [fieldUuid, value] of Object.entries(fieldValues)) {
        await db.update(ja_signing_fields)
          .set({ value: String(value).slice(0, 100000), filledAt: new Date() })
          .where(and(eq(ja_signing_fields.uuid, fieldUuid), eq(ja_signing_fields.signerId, signer.id)));
        await logSigningAudit(request.id, signer.id, null, null, 'field_completed', `Field ${fieldUuid} completed by ${signer.email}`, ip, ua, signer.email, 'email_token');
      }
    }

    // Mark signer as signed
    await db.update(ja_signing_signers)
      .set({ status: 'signed', signedAt: new Date(), ipAddress: ip, userAgent: ua, updatedAt: new Date() })
      .where(eq(ja_signing_signers.id, signer.id));
    await logSigningAudit(request.id, signer.id, null, null, 'signed', `Document signed by ${signer.email}`, ip, ua, signer.email, 'email_token');

    // Check if all signers have signed
    const allSigners = await db.select().from(ja_signing_signers).where(eq(ja_signing_signers.requestId, request.id));
    const allSigned = allSigners.every(s => s.id === signer.id ? true : s.status === 'signed');

    if (allSigned) {
      // Mark request as completed
      await db.update(ja_signing_requests)
        .set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() })
        .where(eq(ja_signing_requests.id, request.id));
      await logSigningAudit(request.id, null, null, null, 'completed', 'All signers have signed — document completed', ip, ua, null, null);

      // Notify owner
      const [owner] = await db.select({ firstName: ja_users.firstName, lastName: ja_users.lastName, email: ja_users.email }).from(ja_users).where(eq(ja_users.id, request.userId)).limit(1);
      if (owner) {
        await sendCompletionEmail({ ownerEmail: owner.email, ownerName: `${owner.firstName} ${owner.lastName}`, documentTitle: request.title, requestId: request.id, requestUuid: request.uuid });
      }
      return res.json({ success: true, completed: true, message: 'Thank you! All parties have now signed this document.' });
    }

    // Sequential: notify next signer
    if (request.signerOrder === 'sequential') {
      const nextSigner = allSigners.find(s => s.order === signer.order + 1 && s.status === 'pending');
      if (nextSigner) {
        const url = buildSigningUrl(nextSigner.token);
        const [owner] = await db.select({ firstName: ja_users.firstName, lastName: ja_users.lastName }).from(ja_users).where(eq(ja_users.id, request.userId)).limit(1);
        const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Document Owner';
        await sendSigningRequestEmail({ signerEmail: nextSigner.email, signerName: nextSigner.name, ownerName, documentTitle: request.title, message: request.message ?? undefined, signingUrl: url, expiresAt: nextSigner.tokenExpiresAt ?? undefined, requestId: request.id, signerId: nextSigner.id });
        await db.update(ja_signing_signers).set({ status: 'sent', updatedAt: new Date() }).where(eq(ja_signing_signers.id, nextSigner.id));
      }
    }

    // Update request status to partially_signed
    await db.update(ja_signing_requests)
      .set({ status: 'partially_signed', updatedAt: new Date() })
      .where(eq(ja_signing_requests.id, request.id));

    return res.json({ success: true, completed: false, message: 'Thank you for signing! The document owner has been notified.' });
  }

  return res.status(400).json({ success: false, error: 'Invalid action. Use "sign" or "decline".' });
}
