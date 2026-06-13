/**
 * PATCH /api/signing/requests/:id
 * Update or cancel a signing request.
 * Only draft requests can be fully edited. Sent requests can only be cancelled.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_signing_requests, ja_signing_signers, ja_signing_fields } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../../auth/_session.js';
import { logSigningAudit } from '../../_email-helpers.js';

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

  const { action, title, message, signerOrder, expiresAt, reminderDays, signers, fields } = req.body as {
    action?: string; title?: string; message?: string; signerOrder?: string;
    expiresAt?: string; reminderDays?: number;
    signers?: Array<{ uuid?: string; email: string; name: string; role?: string; order?: number }>;
    fields?: Array<{ uuid?: string; signerId: string; fieldType: string; page: number; x: number; y: number; width: number; height: number; required?: boolean; label?: string }>;
  };

  // Cancel action
  if (action === 'cancel') {
    if (request.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Completed documents cannot be cancelled.' });
    }
    await db.update(ja_signing_requests)
      .set({ status: 'cancelled', cancelledAt: new Date(), cancelledBy: userId as number, updatedAt: new Date() })
      .where(eq(ja_signing_requests.id, request.id));
    await logSigningAudit(request.id, null, userId as number, null, 'cancelled', 'Request cancelled by owner', req.ip ?? null, req.headers['user-agent'] ?? null, null, null);
    return res.json({ success: true, message: 'Request cancelled.' });
  }

  // Only drafts can be edited
  if (request.status !== 'draft') {
    return res.status(400).json({ success: false, error: 'Only draft requests can be edited.' });
  }

  // Update request metadata
  const updates: Partial<typeof ja_signing_requests.$inferInsert> = { updatedAt: new Date() };
  if (title?.trim()) updates.title = title.trim().slice(0, 255);
  if (message !== undefined) updates.message = message?.trim() || null;
  if (signerOrder) updates.signerOrder = (signerOrder === 'sequential' ? 'sequential' : 'any') as 'any' | 'sequential';
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (reminderDays !== undefined) updates.reminderDays = reminderDays;

  await db.update(ja_signing_requests).set(updates).where(eq(ja_signing_requests.id, request.id));

  // Replace signers if provided
  if (signers !== undefined) {
    await db.delete(ja_signing_signers).where(eq(ja_signing_signers.requestId, request.id));
    await db.delete(ja_signing_fields).where(eq(ja_signing_fields.requestId, request.id));

    if (signers.length > 0) {
      const crypto = await import('node:crypto');
      for (const s of signers) {
        const signerUuid = crypto.randomUUID();
        const token = crypto.randomBytes(48).toString('hex');
        const tokenExpiry = updates.expiresAt ?? (request.expiresAt ?? null);
        await db.insert(ja_signing_signers).values({
          uuid: signerUuid,
          requestId: request.id,
          email: s.email.trim().toLowerCase(),
          name: s.name.trim(),
          role: s.role?.trim() || null,
          order: s.order ?? 1,
          token,
          tokenExpiresAt: tokenExpiry,
          status: 'pending',
        });
      }
    }
  }

  // Replace fields if provided
  if (fields !== undefined && signers === undefined) {
    await db.delete(ja_signing_fields).where(eq(ja_signing_fields.requestId, request.id));
    if (fields.length > 0) {
      const crypto = await import('node:crypto');
      // Resolve signer UUIDs to IDs
      const dbSigners = await db.select({ id: ja_signing_signers.id, uuid: ja_signing_signers.uuid })
        .from(ja_signing_signers).where(eq(ja_signing_signers.requestId, request.id));
      const signerMap = new Map(dbSigners.map(s => [s.uuid, s.id]));

      for (const f of fields) {
        const signerId = signerMap.get(f.signerId);
        if (!signerId) continue;
        await db.insert(ja_signing_fields).values({
          uuid: crypto.randomUUID(),
          requestId: request.id,
          signerId,
          fieldType: f.fieldType as 'signature' | 'initials' | 'name' | 'date' | 'checkbox' | 'text',
          page: f.page,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          required: f.required !== false,
          label: f.label?.trim() || null,
        });
      }
    }
  }

  const [updated] = await db.select().from(ja_signing_requests).where(eq(ja_signing_requests.id, request.id)).limit(1);
  return res.json({ success: true, request: updated });
}
