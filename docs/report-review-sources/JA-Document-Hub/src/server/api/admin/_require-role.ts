/**
 * Role-based access control for admin API endpoints.
 *
 * Admin authentication is handled entirely by Microsoft Entra ID.
 * Identity (email, display name, app roles) comes from the session row —
 * no lookup against ja_admin_accounts is performed.
 *
 * requireAdminRole — verifies the admin session AND checks the caller has
 * one of the allowed Microsoft app roles. Returns AdminIdentity on success,
 * or null (response already sent) on failure.
 *
 * Microsoft app role values (exact strings from Entra app registration):
 *   PlatformOwner | SystemAdministrator | Admin | SupportAdmin
 *
 * Full-access bypass (ignores allowedRoles list):
 *   PlatformOwner, SystemAdministrator
 *
 * Restricted roles (must be explicitly listed in allowedRoles):
 *   Admin, SupportAdmin
 *
 * When the token carries no roles at all (roles array is empty), any
 * authenticated member of the tenant has full access — this covers the
 * period before Entra app roles are assigned.
 *
 * All blocked access attempts are logged to ja_admin_audit_log.
 *
 * Platform operator: JA Group Services Ltd
 */
import type { Request, Response } from 'express';
import { resolveAdminSession } from './auth/_session-cookie.js';
import { db } from '../../db/client.js';
import { ja_admin_audit_log } from '../../db/schema.js';

// ── Valid Microsoft Entra app role values ─────────────────────────────────────

export const ENTRA_ROLES = {
  PlatformOwner:       'PlatformOwner',
  SystemAdministrator: 'SystemAdministrator',
  Admin:               'Admin',
  SupportAdmin:        'SupportAdmin',
} as const;

export type EntraRole = typeof ENTRA_ROLES[keyof typeof ENTRA_ROLES];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminIdentity {
  email:                 string;
  name:                  string;
  roles:                 string[];   // Microsoft Entra app role values
  tid:                   string;
  isSystemAdministrator: boolean;    // true for PlatformOwner or SystemAdministrator
  sessionToken:          string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * True if the identity has a top-tier role (PlatformOwner or SystemAdministrator)
 * OR if no roles are configured yet (tenant-member fallback).
 * These identities bypass the allowedRoles check entirely.
 */
function isFullAccess(roles: string[]): boolean {
  if (roles.length === 0) return true; // no roles configured → full access (pre-assignment fallback)
  return (
    roles.includes(ENTRA_ROLES.PlatformOwner) ||
    roles.includes(ENTRA_ROLES.SystemAdministrator)
  );
}

async function logBlockedAttempt(
  email: string,
  ip: string,
  detail: string,
): Promise<void> {
  try {
    await db.insert(ja_admin_audit_log).values({
      email,
      success: false,
      ip,
    });
    console.warn('admin.api.blocked', { email, detail });
  } catch { /* best-effort */ }
}

// ── Resolver ──────────────────────────────────────────────────────────────────

/** Resolve the admin session from the request cookie. Returns null if not authenticated. */
export async function resolveAdminIdentity(req: Request): Promise<AdminIdentity | null> {
  const token = req.cookies?.ja_admin_session as string | undefined;
  if (!token) return null;

  const session = await resolveAdminSession(token);
  if (!session) return null;

  return {
    email:                 session.email,
    name:                  session.name,
    roles:                 session.roles,
    tid:                   session.tid,
    isSystemAdministrator: isFullAccess(session.roles),
    sessionToken:          session.sessionToken,
  };
}

// ── Guard ─────────────────────────────────────────────────────────────────────

/**
 * Guard an admin endpoint by Microsoft Entra app role.
 *
 * allowedRoles: list of Entra app role values that may access this endpoint.
 *   Pass [] to allow any authenticated admin (any tenant member with any role).
 *
 * Full-access roles (PlatformOwner, SystemAdministrator) always pass,
 * regardless of allowedRoles. Restricted roles (Admin, SupportAdmin) must
 * be explicitly listed in allowedRoles to gain access.
 *
 * Examples:
 *   requireAdminRole(req, res, [])
 *     → any authenticated admin (all four roles + no-role fallback)
 *
 *   requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator'])
 *     → only top-tier roles (Admin and SupportAdmin are blocked)
 *
 *   requireAdminRole(req, res, ['PlatformOwner', 'SystemAdministrator', 'Admin', 'SupportAdmin'])
 *     → all four roles (equivalent to [])
 */
export async function requireAdminRole(
  req: Request,
  res: Response,
  allowedRoles: string[],
): Promise<AdminIdentity | null> {
  const ip = req.ip ?? 'unknown';
  const identity = await resolveAdminIdentity(req);

  if (!identity) {
    res.status(401).json({
      success: false,
      error: 'Admin session required. Please sign in to the Admin Portal.',
      code: 'NOT_AUTHENTICATED',
    });
    await logBlockedAttempt('unauthenticated', ip, `${req.method} ${req.path}`);
    return null;
  }

  // PlatformOwner / SystemAdministrator (or no roles yet) bypass all checks
  if (isFullAccess(identity.roles)) return identity;

  // Empty allowedRoles = any authenticated admin (Admin, SupportAdmin included)
  if (allowedRoles.length === 0) return identity;

  // Check whether the identity has at least one of the required roles
  const hasRole = allowedRoles.some(r => identity.roles.includes(r));
  if (!hasRole) {
    await logBlockedAttempt(
      identity.email,
      ip,
      `Roles [${identity.roles.join(', ')}] attempted ${req.method} ${req.path} requiring [${allowedRoles.join(', ')}]`,
    );
    res.status(403).json({
      success: false,
      error: 'You do not have permission to perform this action.',
      code: 'FORBIDDEN',
    });
    return null;
  }

  return identity;
}
