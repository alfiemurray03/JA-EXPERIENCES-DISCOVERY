/**
 * Admin action audit log helper.
 * Writes to ja_admin_action_log table (separate from login-attempt log).
 *
 * Updated for Microsoft-only auth: accepts email directly instead of
 * looking up by adminId. adminId is written as 0 for backward-compat.
 */
import type { Request } from 'express';
import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';

export async function logAdminAction(
  adminEmail: string,
  action: string,
  detail: string,
  req: Request,
): Promise<void> {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';

    await db.execute(
      sql`INSERT INTO ja_admin_action_log (admin_id, admin_email, action, detail, ip)
          VALUES (0, ${adminEmail}, ${action}, ${detail}, ${ip})`
    );
  } catch (err) {
    // Non-fatal — don't let audit log failure break the main operation
    console.error('admin.audit-log.write.error', err);
  }
}
