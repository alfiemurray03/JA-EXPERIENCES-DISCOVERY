/**
 * GET /api/admin/signing/:id/audit
 * Admin: get full audit trail, signers, fields, and attachments for a signing request.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { ja_signing_requests, ja_signing_audit, ja_signing_signers, ja_signing_fields, ja_signing_attachments } from '../../../../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { requireAdminRole } from '../../../_require-role.js';

export default async function handler(req: Request, res: Response) {
  const admin = await requireAdminRole(req, res, []);
  if (!admin) return;

  const { id } = req.params;
  const [request] = await db.select().from(ja_signing_requests).where(eq(ja_signing_requests.uuid, id)).limit(1);
  if (!request) return res.status(404).json({ success: false, error: 'Signing request not found.' });

  const [audit, signers, fields, attachments] = await Promise.all([
    db.select().from(ja_signing_audit).where(eq(ja_signing_audit.requestId, request.id)).orderBy(asc(ja_signing_audit.createdAt)),
    db.select().from(ja_signing_signers).where(eq(ja_signing_signers.requestId, request.id)).orderBy(asc(ja_signing_signers.order)),
    db.select().from(ja_signing_fields).where(eq(ja_signing_fields.requestId, request.id)),
    db.select().from(ja_signing_attachments).where(eq(ja_signing_attachments.requestId, request.id)),
  ]);

  return res.json({ success: true, request, signers, fields, attachments, audit });
}
