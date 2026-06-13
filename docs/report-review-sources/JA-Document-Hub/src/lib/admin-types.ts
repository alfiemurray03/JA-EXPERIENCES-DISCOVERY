/**
 * Platform Administration Portal — types and permission helpers.
 *
 * Admin authentication is handled entirely by Microsoft Entra ID.
 * The AdminUser shape reflects what comes from the Microsoft session:
 * email, display name, and an array of app roles from the token.
 *
 * Roles are Microsoft app role values (strings). If no app roles are
 * configured in Entra, the roles array will be empty — in that case
 * the user is treated as having full access (any tenant member is trusted).
 *
 * Platform operator: JA Group Services Ltd
 */

// ── AdminUser — shape returned by /api/admin/auth/me ─────────────────────────

export interface AdminUser {
  email:                 string;
  name:                  string;
  roles:                 string[];   // Microsoft app role values
  tid:                   string;     // Microsoft tenant ID
  isSystemAdministrator: boolean;
  authMethod:            'oidc';
  operator:              string;     // 'JA Group Services Ltd'
}

// ── Role display helpers ──────────────────────────────────────────────────────

/**
 * Return a human-readable label for the admin's primary role.
 * Falls back to 'Administrator' when no specific roles are configured.
 */
export function getAdminRoleLabel(admin: AdminUser): string {
  if (admin.roles.includes('PlatformOwner'))      return 'Platform Owner';
  if (admin.roles.includes('SystemAdministrator')) return 'System Administrator';
  if (admin.roles.includes('Admin'))               return 'Administrator';
  if (admin.roles.includes('SupportAdmin'))        return 'Support Admin';
  if (admin.roles.length > 0)                      return admin.roles[0];
  return 'Administrator'; // no roles configured → full access
}

/**
 * Return a Tailwind colour class for the admin's primary role badge.
 */
export function getAdminRoleColor(admin: AdminUser): string {
  if (admin.roles.includes('PlatformOwner'))
    return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/40';
  if (admin.roles.includes('SystemAdministrator') || admin.roles.includes('Admin'))
    return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40';
  if (admin.roles.includes('SupportAdmin'))
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40';
}

// ── Permission helpers ────────────────────────────────────────────────────────

/**
 * Check whether an admin has permission to access a portal section.
 *
 * When no app roles are configured in Microsoft Entra (roles array is empty),
 * any authenticated tenant member has full access — this is the default for
 * new deployments before app roles are set up.
 *
 * When app roles ARE configured, the mapping below applies.
 * SupportAdmin can only access support-related sections.
 */
export function hasPermission(admin: AdminUser, section: string): boolean {
  // No roles configured → full access for any authenticated tenant member
  if (admin.roles.length === 0) return true;

  // PlatformOwner / SystemAdministrator / Admin → full access
  if (
    admin.roles.includes('PlatformOwner') ||
    admin.roles.includes('SystemAdministrator') ||
    admin.roles.includes('Admin')
  ) return true;

  // SupportAdmin → restricted access
  if (admin.roles.includes('SupportAdmin')) {
    const supportSections = ['dashboard', 'support', 'password-resets', 'customers'];
    return supportSections.includes(section);
  }

  return false;
}

/**
 * Check whether an admin has write permission for a section.
 * SupportAdmin has read-only access to most sections.
 */
export function hasWritePermission(admin: AdminUser, section: string): boolean {
  if (admin.roles.length === 0) return true;
  if (
    admin.roles.includes('PlatformOwner') ||
    admin.roles.includes('SystemAdministrator') ||
    admin.roles.includes('Admin')
  ) return true;
  // SupportAdmin write access
  if (admin.roles.includes('SupportAdmin')) {
    return ['support'].includes(section);
  }
  return false;
}

// ── localStorage cache helpers ────────────────────────────────────────────────

const CACHE_KEY = 'ja_admin_profile';

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch { return null; }
}

export function setAdminSession(admin: AdminUser): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(admin)); } catch { /* ignore */ }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}
