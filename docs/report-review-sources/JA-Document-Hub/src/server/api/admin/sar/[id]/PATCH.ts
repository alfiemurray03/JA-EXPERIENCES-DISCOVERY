/**
 * PATCH /api/admin/sar/:id
 * Update a SAR request — status, identity verification, admin notes, assignment, deadline extension.
 *
 * body: {
 *   status?: SarStatus,
 *   adminNotes?: string,
 *   rejectionReason?: string,
 *   identityVerified?: boolean,
 *   identityNotes?: string,
 *   assignedTo?: string,
 *   extendDeadline?: boolean,
 *   deadlineExtendReason?: string,
 * }
 *
 * All changes are audit-logged.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { ja_sar_requests } from '../../../../db/schema.js';
import { requireAdminRole } from '../../_require-role.js';
import { logAdminAction } from '../../_audit-log.js';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['submitted', 'in_review', 'processing', 'ready', 'completed', 'rejected', 'unable_to_complete'] as const;
type SarStatus = typeof VALID_STATUSES[number];

export default async function handler(req: Request, res: Response) {
  const identity = await requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator', 'Admin', 'SupportAdmin']);
  if (!identity) return;

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid request ID.' });

  const {
    status,
    adminNotes,
    rejectionReason,
    identityVerified,
    identityNotes,
    assignedTo,
    extendDeadline,
    deadlineExtendReason,
  } = req.body as {
    status?: string;
    adminNotes?: string;
    rejectionReason?: string;
    identityVerified?: boolean;
    identityNotes?: string;
    assignedTo?: string;
    extendDeadline?: boolean;
    deadlineExtendReason?: string;
  };

  if (status && !VALID_STATUSES.includes(status as SarStatus)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  try {
    const rows = await db.select().from(ja_sar_requests).where(eq(ja_sar_requests.id, id)).limit(1);
    if (!rows.length) return res.status(404).json({ success: false, error: 'SAR request not found.' });

    const sar = rows[0];
    const changes: string[] = [];

    // Build update payload
    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (status && status !== sar.status) {
      update.status = status;
      changes.push(`status: ${sar.status} → ${status}`);

      // Set processedAt/processedBy when reaching terminal states
      if (['completed', 'rejected', 'unable_to_complete'].includes(status)) {
        update.processedBy = identity.email;
        update.processedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      update.adminNotes = adminNotes.trim().slice(0, 5000) || null;
      changes.push('admin notes updated');
    }

    if (rejectionReason !== undefined) {
      update.rejectionReason = rejectionReason.trim().slice(0, 2000) || null;
      changes.push('rejection reason updated');
    }

    if (identityVerified !== undefined && identityVerified !== sar.identityVerified) {
      update.identityVerified = identityVerified;
      if (identityVerified) {
        update.identityVerifiedBy = identity.email;
        update.identityVerifiedAt = new Date();
      } else {
        update.identityVerifiedBy = null;
        update.identityVerifiedAt = null;
      }
      changes.push(`identity verified: ${identityVerified}`);
    }

    if (identityNotes !== undefined) {
      update.identityNotes = identityNotes.trim().slice(0, 2000) || null;
      changes.push('identity notes updated');
    }

    if (assignedTo !== undefined) {
      update.assignedTo = assignedTo.trim() || null;
      changes.push(`assigned to: ${assignedTo || 'unassigned'}`);
    }

    if (extendDeadline) {
      // Extend by 2 months from current deadline (UK GDPR allows up to 3 months total)
      const currentDeadline = sar.deadlineExtendedAt ?? sar.deadlineAt;
      const extended = new Date(currentDeadline);
      extended.setMonth(extended.getMonth() + 2);
      update.deadlineExtendedAt = extended;
      update.deadlineExtendReason = (deadlineExtendReason ?? '').trim().slice(0, 1000) || 'Complex request — deadline extended by 2 months.';
      changes.push(`deadline extended to ${extended.toISOString().split('T')[0]}`);
    }

    if (Object.keys(update).length <= 1) {
      return res.status(400).json({ success: false, error: 'No changes provided.' });
    }

    await db.update(ja_sar_requests).set(update).where(eq(ja_sar_requests.id, id));

    await logAdminAction(
      identity.email,
      'sar.update',
      `SAR #${id} (${sar.uuid.slice(0, 8).toUpperCase()}) — ${changes.join('; ')}`,
      req,
    );

    return res.json({ success: true, message: 'SAR request updated.', changes });
  } catch (err) {
    console.error('admin.sar.patch.error', err);
    return res.status(500).json({ success: false, error: 'Failed to update request.' });
  }
}
