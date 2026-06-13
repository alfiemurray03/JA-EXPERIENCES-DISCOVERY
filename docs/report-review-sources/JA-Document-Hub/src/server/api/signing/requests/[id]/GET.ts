/**
 * GET /api/signing/requests/:id
 * Get a single signing request with signers, fields, attachments, and audit trail.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_signing_fields, ja_signing_audit, ja_signing_attachments } from '../../../../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import { resolveSession } from '../../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });

  const { id } = req.params;
  try {
    const [request] = await db
      .select()
      .from(ja_signing_requests)
      .where(and(eq(ja_signing_requests.uuid, id), eq(ja_signing_requests.userId, userId as number)))
      .limit(1);

    if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

    const signers = await db
      .select()
      .from(ja_signing_signers)
      .where(eq(ja_signing_signers.requestId, request.id))
      .orderBy(asc(ja_signing_signers.order));

    const fields = await db
      .select()
      .from(ja_signing_fields)
      .where(eq(ja_signing_fields.requestId, request.id));

    const attachments = await db
      .select()
      .from(ja_signing_attachments)
      .where(eq(ja_signing_attachments.requestId, request.id));

    const audit = await db
      .select()
      .from(ja_signing_audit)
      .where(eq(ja_signing_audit.requestId, request.id))
      .orderBy(asc(ja_signing_audit.createdAt));

    return res.json({ success: true, request, signers, fields, attachments, audit });
  } catch (err) {
    console.error('signing.request.getone.error', err);
    return res.status(500).json({ success: false, error: 'Failed to load signing request.' });
  }
}
