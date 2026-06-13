/**
 * Audit log helper.
 * Call writeAudit() from any API handler to record a significant event.
 * All writes are fire-and-forget — errors are logged but never thrown,
 * so a failed audit write never breaks the primary operation.
 */
import { randomUUID } from 'crypto';
import { db } from '@/server/db/client.js';
import { auditLog } from '@/server/db/schema.js';

export interface AuditParams {
  /** The user who performed the action (omit for system/unauthenticated events). */
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  /** Short machine-readable action name, e.g. 'quote_sent', 'user_signup'. */
  action: string;
  /** The type of resource affected, e.g. 'print_request', 'user'. */
  resourceType?: string;
  /** The ID of the affected resource. */
  resourceId?: string;
  /** Human-readable description shown in the admin audit log. */
  summary: string;
  /** Any extra structured data to store alongside the event. */
  meta?: Record<string, unknown>;
  /** Client IP address (pass req.ip). */
  ipAddress?: string;
}

export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorId: params.actorId ?? null,
      actorEmail: params.actorEmail ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      resourceType: params.resourceType ?? null,
      resourceId: params.resourceId ?? null,
      summary: params.summary,
      meta: params.meta ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    // Never let audit failures break the primary operation
    console.error('[audit] write failed:', err);
  }
}
