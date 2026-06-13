/**
 * JABooking — Authentication Configuration
 *
 * Two completely separate authentication systems:
 * 1. Business/Customer Portal — JA Secure Access (Microsoft Entra External ID / CIAM)
 * 2. Platform Admin Portal — JA Group Services Microsoft Entra tenant
 *
 * SECURITY: Client secrets are NEVER stored here.
 * They are stored as secure server-side environment variables only.
 * These configs contain only public-facing values (tenant IDs, client IDs, endpoints).
 */

// ─── Production domain — the ONLY domain registered in Azure App Registrations
const PRODUCTION_BASE = 'https://jabooking.jagroupservices.co.uk';

// ─── Business / Customer Portal ─────────────────────────────────────────────
export const BUSINESS_AUTH = {
  tenantId: '643abcb7-2f0d-4e72-a193-47ff1a0e63e1',
  clientId: '2bf8e2f1-84da-4432-9dbb-7c6b0638c430',
  authority:
    'https://jagroupservicescustomerhub.ciamlogin.com/643abcb7-2f0d-4e72-a193-47ff1a0e63e1/v2.0',
  metadataUrl:
    'https://jagroupservicescustomerhub.ciamlogin.com/643abcb7-2f0d-4e72-a193-47ff1a0e63e1/v2.0/.well-known/openid-configuration',
  authorizeUrl:
    'https://jagroupservicescustomerhub.ciamlogin.com/643abcb7-2f0d-4e72-a193-47ff1a0e63e1/oauth2/v2.0/authorize',
  tokenUrl:
    'https://jagroupservicescustomerhub.ciamlogin.com/643abcb7-2f0d-4e72-a193-47ff1a0e63e1/oauth2/v2.0/token',
  redirectUri: `${PRODUCTION_BASE}/auth/callback`,
  postLogoutRedirectUri: `${PRODUCTION_BASE}/`,
  scopes: ['openid', 'profile', 'email', 'offline_access'] as const,
  loginRoute: '/login',
  callbackRoute: '/auth/callback',
  appRoles: ['BusinessOwner', 'BusinessManager', 'StaffMember', 'FinanceUser', 'ReadOnlyUser'] as const,
} as const;

// ─── Platform Admin Portal ───────────────────────────────────────────────────
export const ADMIN_AUTH = {
  tenantId: '53477196-db21-46d2-8123-00be3d6882da',
  clientId: 'bd1a140f-30c2-448f-99a7-bda9e4200f69',
  authority:
    'https://login.microsoftonline.com/53477196-db21-46d2-8123-00be3d6882da/v2.0',
  metadataUrl:
    'https://login.microsoftonline.com/53477196-db21-46d2-8123-00be3d6882da/v2.0/.well-known/openid-configuration',
  authorizeUrl:
    'https://login.microsoftonline.com/53477196-db21-46d2-8123-00be3d6882da/oauth2/v2.0/authorize',
  tokenUrl:
    'https://login.microsoftonline.com/53477196-db21-46d2-8123-00be3d6882da/oauth2/v2.0/token',
  redirectUri: `${PRODUCTION_BASE}/admin/auth/callback`,
  postLogoutRedirectUri: `${PRODUCTION_BASE}/admin/login`,
  scopes: ['openid', 'profile', 'email', 'offline_access'] as const,
  loginRoute: '/admin/login',
  callbackRoute: '/admin/auth/callback',
  allowedRoles: [
    'SuperAdmin',
    'PlatformAdmin',
    'SupportAdmin',
    'BillingAdmin',
    'ContentModerator',
    'ReadOnlyAdmin',
  ] as const,
} as const;

// ─── Application Security Settings ──────────────────────────────────────────
export const APP_CONFIG = {
  baseUrl: 'https://jabooking.jagroupservices.co.uk',
  publicBusinessDomain: 'jabooking.jagroupservices.co.uk',
  requireBusinessId: true,
  strictTenantIsolation: true,
} as const;

export type AdminRole = (typeof ADMIN_AUTH.allowedRoles)[number];
export type BusinessAppRole = (typeof BUSINESS_AUTH.appRoles)[number];
