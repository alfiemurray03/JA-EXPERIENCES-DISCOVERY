/**
 * Middleware: block customer (ja_session) tokens from accessing /api/admin/* routes.
 *
 * Normal customer sessions must never be accepted on admin endpoints.
 * If a customer session cookie is present on an admin route, we:
 *  1. Return 403 Forbidden.
 *  2. Log the attempt to the admin audit log (best-effort).
 *
 * This is defence-in-depth — individual handlers also call requireAdminSession /
 * requireAdminRole, but this middleware catches any that are accidentally missed.
 */
import type { Request, Response, NextFunction } from 'express';
import { db } from '../../db/client.js';
import { ja_sessions, ja_users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function blockCustomerOnAdminRoutes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Only applies to /api/admin/* routes
  if (!req.path.startsWith('/api/admin/')) return next();

  // Admin auth endpoints are always allowed (login, setup, etc.)
  const adminAuthPaths = [
    '/api/admin/auth/',
    '/api/admin/auth/setup-status',
  ];
  if (adminAuthPaths.some(p => req.path.startsWith(p))) return next();

  const customerToken = req.cookies?.ja_session as string | undefined;
  if (!customerToken) return next(); // No customer session — let admin session check handle it

  // Check if this is a valid customer session
  try {
    const rows = await db
      .select({ userId: ja_sessions.userId, expiresAt: ja_sessions.expiresAt })
      .from(ja_sessions)
      .where(eq(ja_sessions.token, customerToken))
      .limit(1);

    const session = rows[0];
    if (!session || new Date() > session.expiresAt) return next(); // Expired/invalid — harmless

    // Valid customer session attempting admin access — block and log
    const userRows = await db
      .select({ email: ja_users.email, role: ja_users.role })
      .from(ja_users)
      .where(eq(ja_users.id, session.userId))
      .limit(1);

    const user = userRows[0];
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';

    // Log to admin audit log
    try {
      await db.execute(
        sql`INSERT INTO ja_admin_action_log (admin_id, admin_email, action, detail, ip)
            VALUES (0, ${user?.email ?? 'unknown'}, 'security.customer_admin_access_attempt',
              ${`Customer account attempted admin access: ${req.method} ${req.path} (role: ${user?.role ?? 'unknown'})`},
              ${ip})`
      );
    } catch { /* non-fatal */ }

    res.status(403).json({
      success: false,
      error: 'Access denied. This area is restricted to administrators only.',
      code: 'FORBIDDEN',
    });
  } catch {
    // If DB check fails, let the request through — individual handlers will reject it
    return next();
  }
}
