/**
 * Central audit logging library.
 * Logs every significant action — admin, user, cookie consent, points, messages, auth.
 * All entries go to the audit_log table.
 */
import db from '../db.js';

// Ensure the comprehensive audit_log table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_name TEXT,
    actor_email TEXT,
    actor_type TEXT NOT NULL DEFAULT 'user',
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT '',
    resource_id TEXT,
    resource_label TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add actor_type / user_agent columns if they don't exist (migration)
try {
  db.exec(`ALTER TABLE audit_log ADD COLUMN actor_type TEXT NOT NULL DEFAULT 'user'`);
} catch { /* already exists */ }
try {
  db.exec(`ALTER TABLE audit_log ADD COLUMN user_agent TEXT`);
} catch { /* already exists */ }
// Rename admin_id → actor_id if old schema
try {
  db.exec(`ALTER TABLE audit_log ADD COLUMN actor_id INTEGER`);
} catch { /* already exists */ }
try {
  db.exec(`ALTER TABLE audit_log ADD COLUMN actor_name TEXT`);
} catch { /* already exists */ }
try {
  db.exec(`ALTER TABLE audit_log ADD COLUMN actor_email TEXT`);
} catch { /* already exists */ }

export interface AuditEntry {
  actorId?: number | null;
  actorName?: string | null;
  actorEmail?: string | null;
  actorType?: 'admin' | 'user' | 'system' | 'visitor';
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  resourceLabel?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function writeAudit(entry: AuditEntry): void {
  try {
    db.prepare(`
      INSERT INTO audit_log
        (actor_id, actor_name, actor_email, actor_type, action, resource_type, resource_id, resource_label, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.actorId ?? null,
      entry.actorName ?? null,
      entry.actorEmail ?? null,
      entry.actorType ?? 'user',
      entry.action,
      entry.resourceType ?? '',
      entry.resourceId ?? null,
      entry.resourceLabel ?? null,
      entry.details ?? null,
      entry.ipAddress ?? null,
      entry.userAgent ?? null,
    );
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err);
  }
}

/** Convenience: write from an admin action (backwards compat with old writeAuditLog signature) */
export function writeAuditLog(
  adminId: number,
  adminName: string,
  adminEmail: string,
  action: string,
  resourceType: string,
  resourceId?: string | null,
  resourceLabel?: string | null,
  details?: string | null,
  ipAddress?: string | null,
): void {
  writeAudit({
    actorId: adminId,
    actorName: adminName,
    actorEmail: adminEmail,
    actorType: 'admin',
    action,
    resourceType,
    resourceId,
    resourceLabel,
    details,
    ipAddress,
  });
}
