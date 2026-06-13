/**
 * POST /api/signing/requests/:id/remind
 * Send reminder emails to pending/viewed signers.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers } from '../../../../../db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { resolveSession } from '../../../../auth/_session.js';
import { sendReminderEmail, logSigningAudit, buildSigningUrl } from '../../../_email-helpers.js';

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
  if (!['sent', 'viewed', 'partially_signed'].includes(request.status)) {
    return res.status(400).json({ success: false, error: 'Reminders can only be sent for active signing requests.' });
  }

  const { signerIds } = req.body as { signerIds?: string[] };

  let signers = await db
    .select()
    .from(ja_signing_signers)
    .where(and(
      eq(ja_signing_signers.requestId, request.id),
      inArray(ja_signing_signers.status, ['sent', 'viewed']),
    ));

  // Filter to specific signers if requested
  if (signerIds?.length) {
    signers = signers.filter(s => signerIds.includes(s.uuid));
  }

  if (signers.length === 0) return res.json({ success: true, sent: [], message: 'No pending signers to remind.' });

  const results: Array<{ email: string; ok: boolean }> = [];
  for (const signer of signers) {
    const url = buildSigningUrl(signer.token);
    const result = await sendReminderEmail({
      signerEmail: signer.email,
      signerName: signer.name,
      ownerName: 'Document Owner',
      documentTitle: request.title,
      signingUrl: url,
      expiresAt: signer.tokenExpiresAt ?? undefined,
      requestId: request.id,
      signerId: signer.id,
    });
    results.push({ email: signer.email, ok: result.ok });
  }

  await logSigningAudit(request.id, null, userId as number, null, 'reminder_sent', `Reminders sent to ${results.length} signer(s)`, req.ip ?? null, req.headers['user-agent'] ?? null, null, null);

  return res.json({ success: true, sent: results });
}
