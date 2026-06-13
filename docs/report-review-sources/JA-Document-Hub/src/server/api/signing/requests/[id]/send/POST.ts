/**
 * POST /api/signing/requests/:id/send
 * Send the signing request to all signers (or next signer in sequential mode).
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_users } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../../auth/_session.js';
import { sendSigningRequestEmail, logSigningAudit, buildSigningUrl } from '../../../_email-helpers.js';

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
  if (request.status !== 'draft') return res.status(400).json({ success: false, error: 'Only draft requests can be sent.' });

  const signers = await db
    .select()
    .from(ja_signing_signers)
    .where(eq(ja_signing_signers.requestId, request.id))
    .orderBy(ja_signing_signers.order);

  if (signers.length === 0) return res.status(400).json({ success: false, error: 'Add at least one signer before sending.' });

  // Load owner details
  const [owner] = await db.select({ firstName: ja_users.firstName, lastName: ja_users.lastName, email: ja_users.email })
    .from(ja_users).where(eq(ja_users.id, userId as number)).limit(1);
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Document Owner';

  // Determine which signers to notify
  const toNotify = request.signerOrder === 'sequential'
    ? signers.filter(s => s.order === 1)  // only first signer
    : signers;                             // all signers

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];
  for (const signer of toNotify) {
    const url = buildSigningUrl(signer.token);
    const result = await sendSigningRequestEmail({
      signerEmail: signer.email,
      signerName: signer.name,
      ownerName,
      documentTitle: request.title,
      message: request.message ?? undefined,
      signingUrl: url,
      expiresAt: signer.tokenExpiresAt ?? undefined,
      requestId: request.id,
      signerId: signer.id,
    });
    results.push({ email: signer.email, ...result });
    // Update signer status
    await db.update(ja_signing_signers)
      .set({ status: 'sent', updatedAt: new Date() })
      .where(eq(ja_signing_signers.id, signer.id));
  }

  // Update request status to sent
  await db.update(ja_signing_requests)
    .set({ status: 'sent', updatedAt: new Date() })
    .where(eq(ja_signing_requests.id, request.id));

  await logSigningAudit(request.id, null, userId as number, null, 'sent', `Signing request sent to ${toNotify.length} signer(s)`, req.ip ?? null, req.headers['user-agent'] ?? null, null, null);

  return res.json({ success: true, sent: results });
}
