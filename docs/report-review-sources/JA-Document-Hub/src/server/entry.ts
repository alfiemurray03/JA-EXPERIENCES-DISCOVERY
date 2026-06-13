import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFileSync } from "node:fs";

// <api-imports>
import healthGet from "./api/health/GET";
import adminAuthLogoutPost from "./api/admin/auth/logout/POST";
import adminAuthMeGet from "./api/admin/auth/me/GET";
import adminAuthDiagnosticsGet from "./api/admin/auth/diagnostics/GET";
import adminOidcStartGet from "./api/admin/auth/oidc/start/GET";
import adminOidcCallbackGet from "./api/admin/auth/oidc/callback/GET";
import adminUsersGet from "./api/admin/users/GET";
import adminUsersPost from "./api/admin/users/POST";
import adminUsersPatch from "./api/admin/users/[id]/PATCH";
import adminAuditLoginAttemptsGet from "./api/admin/audit/login-attempts/GET";
import adminActionLogGet from "./api/admin/action-log/GET";
// Customer auth
import authRegisterPost from "./api/auth/register/POST";
import authLoginPost from "./api/auth/login/POST";
import authMeGet from "./api/auth/me/GET";
import authLogoutPost from "./api/auth/logout/POST";
import authProfilePatch from "./api/auth/profile/PATCH";
// Admin data
import adminCustomersGet from "./api/admin/customers/GET";
import adminCustomersPost from "./api/admin/customers/POST";
import adminCustomerGetOne from "./api/admin/customers/[id]/GET";
import adminCustomerPatch from "./api/admin/customers/[id]/PATCH";
// Documents
import documentsGet from "./api/documents/GET";
import documentsPost from "./api/documents/POST";
import documentGetOne from "./api/documents/[id]/GET";
import documentPut from "./api/documents/[id]/PUT";
import documentDelete from "./api/documents/[id]/DELETE";
// Folders
import foldersGet from "./api/folders/GET";
import foldersPost from "./api/folders/POST";
import folderPut from "./api/folders/[id]/PUT";
import folderDelete from "./api/folders/[id]/DELETE";
// Admin store seed
import { runMigrations } from "./db/migrate";
import { startDocumentExpiryJob } from "./jobs/document-expiry";
// Password reset
import authForgotPasswordPost from "./api/auth/forgot-password/POST";
import authResetPasswordPost from "./api/auth/reset-password/POST";
import adminPasswordResetsGet from "./api/admin/password-resets/GET";
import adminPasswordResetActionPost from "./api/admin/password-resets/[id]/POST";
import adminForgotPasswordPost from "./api/admin/forgot-password/POST";
// Favourites
import favouritesGet from "./api/favourites/GET";
import favouritesPost from "./api/favourites/POST";
import favouritesDelete from "./api/favourites/DELETE";
// Recently used
import recentlyUsedGet from "./api/recently-used/GET";
import recentlyUsedPost from "./api/recently-used/POST";
// Notifications
import notificationsGet from "./api/notifications/GET";
import notificationsPatch from "./api/notifications/PATCH";
// Change password
import changePasswordPost from "./api/auth/change-password/POST";
// Admin stats
import adminStatsGet from "./api/admin/stats/GET";
// User preferences
import userPreferencesGet from "./api/user/preferences/GET";
import userPreferencesPatch from "./api/user/preferences/PATCH";
// Stripe
import stripeConfigGet from "./api/stripe/config/GET";
import stripeCreateCheckoutSessionPost from "./api/stripe/create-checkout-session/POST";
import stripeWebhookPost from "./api/stripe/webhook/POST";
import stripePortalPost from "./api/stripe/portal/POST";
import stripeBillingHistoryGet from "./api/stripe/billing-history/GET";
// Support tickets
import adminSupportGet from "./api/admin/support/GET";
import adminSupportPatch from "./api/admin/support/[id]/PATCH";
// System config
import adminSystemConfigGet from "./api/admin/system-config/GET";
import adminSystemConfigPost from "./api/admin/system-config/POST";
// Public system config (no auth)
import systemConfigPublicGet from "./api/system-config/public/GET";
// Stripe diagnostics
import adminStripeDiagnosticsGet from "./api/admin/stripe-diagnostics/GET";
// Stripe admin management
import adminStripeStatusGet from "./api/admin/stripe/status/GET";
import adminStripeUpdateKeysPost from "./api/admin/stripe/update-keys/POST";
import adminStripeUpdatePricesPost from "./api/admin/stripe/update-prices/POST";
import adminStripeTestConnectionPost from "./api/admin/stripe/test-connection/POST";
import adminStripeVerifyPricesPost from "./api/admin/stripe/verify-prices/POST";
import adminStripeTestCheckoutPost from "./api/admin/stripe/test-checkout/POST";
// Lifetime users
import adminLifetimeGet from "./api/admin/lifetime/GET";
// Public support submission
import supportSubmitPost from "./api/support/submit/POST";
// Organisation members
import orgMembersGet from "./api/org/members/GET";
import orgMembersPost from "./api/org/members/POST";
import orgMembersPatch from "./api/org/members/PATCH";
import orgMembersDelete from "./api/org/members/DELETE";
// Admin custom templates
import adminTemplatesGet from "./api/admin/templates/GET";
import adminTemplatesPost from "./api/admin/templates/POST";
import adminTemplatesPut from "./api/admin/templates/[id]/PUT";
import adminTemplatesDelete from "./api/admin/templates/[id]/DELETE";
// Admin builder overrides
import adminBuilderOverridesGet from "./api/admin/builder-overrides/GET";
import adminBuilderOverridesPost from "./api/admin/builder-overrides/POST";
import adminBuilderOverridesDelete from "./api/admin/builder-overrides/DELETE";
// Admin builder meta overrides (builder-level label/description/colour)
import adminBuilderMetaGet from "./api/admin/builder-meta/GET";
import adminBuilderMetaPost from "./api/admin/builder-meta/POST";
// Ticket messages (admin ↔ customer chat)
import adminTicketMessagesGet from "./api/admin/support/[id]/messages/GET";
import adminTicketMessagesPost from "./api/admin/support/[id]/messages/POST";
import customerTicketsGet from "./api/support/tickets/GET";
import customerTicketMessagesGet from "./api/support/tickets/[id]/messages/GET";
import customerTicketMessagesPost from "./api/support/tickets/[id]/messages/POST";
// Invoices
import invoicesGet from "./api/invoices/GET";
import invoicesPost from "./api/invoices/POST";
import invoiceGetOne from "./api/invoices/[id]/GET";
// Builder Documents
import builderDocsGet from "./api/builder-docs/GET";
import builderDocsPost from "./api/builder-docs/POST";
import builderDocGetOne from "./api/builder-docs/[id]/GET";
import builderDocDelete from "./api/builder-docs/[id]/DELETE";
import documentsAuditGet from "./api/documents/audit/GET";
// Builders summary (hub page — user-facing, merged static + DB overrides)
import buildersSummaryGet from "./api/builders/summary/GET";
// Builder templates (user-facing — loads from DB)
import builderTemplatesGet from "./api/builders/templates/GET";
// Admin builder templates (full CRUD on ja_builder_templates)
import adminBuilderTemplatesGet from "./api/admin/builder-templates/GET";
import adminLegalGet from "./api/admin/legal/GET";
import adminLegalPost from "./api/admin/legal/POST";
import legalGet from "./api/legal/GET";
import adminBuilderTemplatesPost from "./api/admin/builder-templates/POST";
import adminBuilderTemplatesPut from "./api/admin/builder-templates/[id]/PUT";
import adminBuilderTemplatesDelete from "./api/admin/builder-templates/[id]/DELETE";
import adminBuilderTemplatesDuplicate from "./api/admin/builder-templates/[id]/duplicate/POST";
// Portal nav config (customer-facing + admin management)
import portalNavGet from "./api/portal-nav/GET";
import adminPortalNavGet from "./api/admin/portal-nav/GET";
import adminPortalNavPost from "./api/admin/portal-nav/POST";
// Admin test tools
import adminTestToolsPost from "./api/admin/test-tools/POST";
// OIDC (Microsoft Entra External ID)
import oidcStartGet from "./api/auth/oidc/start/GET";
import oidcCallbackGet from "./api/auth/oidc/callback/GET";
import oidcLogoutGet from "./api/auth/oidc/logout/GET";
// Affiliate programme
import affiliateApplyPost from "./api/affiliate/apply/POST";
import affiliateTrackGet from "./api/affiliate/track/GET";
import affiliateDashboardGet from "./api/affiliate/dashboard/GET";
import adminAffiliatesGet from "./api/admin/affiliates/GET";
import adminAffiliatesPatch from "./api/admin/affiliates/[id]/PATCH";
import adminAffiliateConversionsGet from "./api/admin/affiliates/conversions/GET";
import adminAffiliateConversionPatch from "./api/admin/affiliates/conversions/[id]/PATCH";
// Document Signing
import signingRequestsPost from "./api/signing/requests/POST";
import signingRequestsGet from "./api/signing/requests/GET";
import signingRequestGetOne from "./api/signing/requests/[id]/GET";
import signingRequestPatch from "./api/signing/requests/[id]/PATCH";
import signingRequestSendPost from "./api/signing/requests/[id]/send/POST";
import signingRequestRemindPost from "./api/signing/requests/[id]/remind/POST";
import signingRequestUploadPost from "./api/signing/requests/[id]/upload/POST";
import signingRequestCertificateGet from "./api/signing/requests/[id]/certificate/GET";
import signingAttachmentsGet from "./api/signing/requests/[id]/attachments/GET";
import signingAttachmentsPost from "./api/signing/requests/[id]/attachments/POST";
import signingAttachmentDelete from "./api/signing/requests/[id]/attachments/[attachmentId]/DELETE";
import signingAttachmentPatch from "./api/signing/requests/[id]/attachments/[attachmentId]/PATCH";
import signingPackGet from "./api/signing/requests/[id]/pack/GET";
import signingSignGet from "./api/signing/sign/[token]/GET";
import signingSignPost from "./api/signing/sign/[token]/POST";
import adminSigningGet from "./api/admin/signing/GET";
import adminSigningPatch from "./api/admin/signing/[id]/PATCH";
import adminSigningAuditGet from "./api/admin/signing/[id]/audit/GET";
import adminSigningConfigGet from "./api/admin/signing/config/GET";
import adminSigningConfigPatch from "./api/admin/signing/config/PATCH";
// Admin security
import { blockCustomerOnAdminRoutes } from "./api/admin/_customer-block";
// CMS page content
import adminPageContentGet from "./api/admin/page-content/GET";
import adminPageContentPost from "./api/admin/page-content/POST";
import adminPageContentDelete from "./api/admin/page-content/[slug]/DELETE";
import pageContentPublicGet from "./api/page-content/[slug]/GET";
// Site settings
import adminSiteSettingsGet from "./api/admin/site-settings/GET";
import adminSiteSettingsPost from "./api/admin/site-settings/POST";
import siteSettingsPublicGet from "./api/site-settings/public/GET";
// GDPR requests (legacy)
import userGdprGet from "./api/user/gdpr/GET";
import userGdprPost from "./api/user/gdpr/POST";
import adminGdprGet from "./api/admin/gdpr/GET";
import adminGdprPatch from "./api/admin/gdpr/[id]/PATCH";
// SAR (Subject Access Requests) — full UK GDPR workflow
import userSarGet from "./api/user/sar/GET";
import userSarPost from "./api/user/sar/POST";
import userSarDownload from "./api/user/sar/[uuid]/download/GET";
import adminSarGet from "./api/admin/sar/GET";
import adminSarPatch from "./api/admin/sar/[id]/PATCH";
import adminSarGenerateExport from "./api/admin/sar/[id]/generate-export/POST";
import adminSarDownload from "./api/admin/sar/[id]/download/GET";
// Reseller programme
import resellerApplyPost from "./api/reseller/apply/POST";
import resellerReferralTrackGet from "./api/reseller/referrals/track/GET";
import resellerAuthLoginPost from "./api/reseller/auth/login/POST";
import resellerAuthMeGet from "./api/reseller/auth/me/GET";
import resellerAuthLogoutPost from "./api/reseller/auth/logout/POST";
import resellerDashboardGet from "./api/reseller/dashboard/GET";
import resellerCustomersGet from "./api/reseller/customers/GET";
import resellerReferralsGet from "./api/reseller/referrals/GET";
import resellerCommissionsGet from "./api/reseller/commissions/GET";
import resellerResourcesGet from "./api/reseller/resources/GET";
import resellerSupportTicketsGet from "./api/reseller/support/tickets/GET";
import resellerSupportTicketsPost from "./api/reseller/support/tickets/POST";
import resellerSupportTicketMessagesGet from "./api/reseller/support/tickets/[id]/messages/GET";
import resellerSupportTicketMessagesPost from "./api/reseller/support/tickets/[id]/messages/POST";
import resellerSettingsGet from "./api/reseller/settings/GET";
import resellerSettingsPatch from "./api/reseller/settings/PATCH";
// Admin reseller management
import adminResellersGet from "./api/admin/resellers/GET";
import adminResellersPatch from "./api/admin/resellers/[id]/PATCH";
import adminResellerCustomersGet from "./api/admin/resellers/[id]/customers/GET";
import adminResellerCommissionsGet from "./api/admin/resellers/commissions/GET";
import adminResellerCommissionPatch from "./api/admin/resellers/commissions/[id]/PATCH";
import adminResellerResourcesGet from "./api/admin/resellers/resources/GET";
import adminResellerResourcesPost from "./api/admin/resellers/resources/POST";
import adminResellerResourcePatch from "./api/admin/resellers/resources/[id]/PATCH";
import adminResellerResourceDelete from "./api/admin/resellers/resources/[id]/DELETE";
import adminResellerAnnouncementsGet from "./api/admin/resellers/announcements/GET";
import adminResellerAnnouncementsPost from "./api/admin/resellers/announcements/POST";
import adminResellerAnnouncementPatch from "./api/admin/resellers/announcements/[id]/PATCH";
import adminResellerTicketsGet from "./api/admin/resellers/tickets/GET";
import adminResellerTicketMessagesGet from "./api/admin/resellers/tickets/[id]/messages/GET";
import adminResellerTicketMessagesPost from "./api/admin/resellers/tickets/[id]/messages/POST";
import adminResellerAuditGet from "./api/admin/resellers/audit/GET";
// </api-imports>
import { seoRoutes } from "../lib/seo-routes";

function normalizeCommerceApiBaseUrlEnv() {
	if (process.env.GODADDY_API_BASE_URL) return;
	const hostOnly = process.env.VITE_GODADDY_API_HOST;
	if (!hostOnly) return;
	const normalizedHost = hostOnly.replace(/^https?:\/\//, "").trim();
	if (!normalizedHost) return;
	process.env.GODADDY_API_BASE_URL = `https://${normalizedHost}`;
}

normalizeCommerceApiBaseUrlEnv();

const app = express();

// Honour x-forwarded-* from the load balancer so req.protocol/req.hostname
// reflect the public-facing values. Express-maintained parsing respects the
// existing trust-proxy config; direct header reads would let a client spoof
// the sitemap origin in robots.txt.
app.set("trust proxy", true);

// Raw body for Stripe webhook signature verification — must come BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Security: block customer sessions from admin routes ────────────────────────
app.use(blockCustomerOnAdminRoutes);

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Lightweight sliding-window rate limiter — no external dependency.
// Keyed by IP. Buckets are pruned lazily to avoid memory leaks.
interface RateBucket { count: number; resetAt: number; }
const _rateBuckets = new Map<string, RateBucket>();

function createRateLimiter(opts: { windowMs: number; max: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '');
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    let bucket = _rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      _rateBuckets.set(key, bucket);
    }
    bucket.count++;
    if (bucket.count > opts.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, error: opts.message, code: 'RATE_LIMITED' });
    }
    // Lazy prune: remove expired buckets periodically
    if (_rateBuckets.size > 5000) {
      for (const [k, b] of _rateBuckets) {
        if (now > b.resetAt) _rateBuckets.delete(k);
      }
    }
    return next();
  };
}

// 10 attempts per 15 minutes on auth endpoints
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Please wait 15 minutes before trying again.',
});

// 5 attempts per hour on password reset
const passwordRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please wait an hour before trying again.',
});

// ── Security headers ──────────────────────────────────────────────────────────
// app (inline styles/scripts used by Vite HMR, Radix UI, and the PDF renderer)
// but blocks the most dangerous vectors: object embeds, base-URI hijacking,
// and cross-origin framing.
app.use((_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Stop MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Referrer policy — don't leak full URL to third parties
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy — disable unused browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // HSTS — enforce HTTPS for 1 year (only meaningful in production)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Scripts: self + inline (Vite HMR / shadcn) + blob (PDF export)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      // Styles: self + inline (Tailwind / Radix / PDF renderer)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs (logo uploads) + blob (canvas export)
      "img-src 'self' data: blob: https:",
      // Connections: self + Microsoft OIDC + Stripe
      "connect-src 'self' https://login.microsoftonline.com https://api.stripe.com",
      // Frames: Stripe Elements only
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      // Block all plugin embeds
      "object-src 'none'",
      // Prevent base-URI hijacking
      "base-uri 'self'",
      // Restrict form submissions
      "form-action 'self'",
    ].join('; '),
  );
  next();
});

// ── Maintenance mode middleware ────────────────────────────────────────────────
// Checks toggle_maintenance in DB. Blocks non-admin API calls when enabled.
// Admin routes (/api/admin/*), health, and public config are always allowed.
import { db as _db } from './db/client.js';
import { ja_system_config as _jsc } from './db/schema.js';
import { eq as _eq } from 'drizzle-orm';
import { ja_admin_sessions as _jas } from './db/schema.js';

let _maintenanceCached: boolean | null = null;
let _maintenanceCacheTime = 0;
const MAINTENANCE_CACHE_TTL = 10_000; // 10 seconds

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (_maintenanceCached !== null && now - _maintenanceCacheTime < MAINTENANCE_CACHE_TTL) {
    return _maintenanceCached;
  }
  try {
    const rows = await _db.select({ value: _jsc.value })
      .from(_jsc)
      .where(_eq(_jsc.configKey, 'toggle_maintenance'))
      .limit(1);
    _maintenanceCached = rows[0]?.value === 'true';
    _maintenanceCacheTime = now;
    return _maintenanceCached;
  } catch {
    return false;
  }
}

async function isAdminRequest(req: import('express').Request): Promise<boolean> {
  const token = req.cookies?.ja_admin_session as string | undefined;
  if (!token) return false;
  try {
    const rows = await _db.select({ adminId: _jas.adminId, expiresAt: _jas.expiresAt })
      .from(_jas)
      .where(_eq(_jas.token, token))
      .limit(1);
    const s = rows[0];
    return !!(s && new Date() < s.expiresAt);
  } catch {
    return false;
  }
}

app.use(async (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  // Always allow: admin routes, health, public config, stripe webhook, static assets
  const path = req.path;
  if (
    path.startsWith('/api/admin') ||
    path.startsWith('/api/health') ||
    path.startsWith('/api/system-config/public') ||
    path.startsWith('/api/stripe/webhook') ||
    path.startsWith('/api/signing/sign/') ||  // public signer endpoints always available
    path.startsWith('/api/reseller/referrals/track') || // referral tracking always available
    path.startsWith('/api/reseller/apply') || // application always available
    !path.startsWith('/api/')
  ) return next();

  const maintenance = await isMaintenanceMode();
  if (!maintenance) return next();

  // In maintenance mode — allow admins through
  const isAdmin = await isAdminRequest(req);
  if (isAdmin) return next();

  return res.status(503).json({
    success: false,
    error: 'The platform is currently undergoing maintenance. Please try again shortly.',
    code: 'MAINTENANCE_MODE',
  });
});

// ── Document Signing feature-toggle middleware ─────────────────────────────
// Reads signing_enabled from ja_system_config. Blocks /api/signing/* (except
// public /api/signing/sign/:token which is always available) when disabled.
let _signingEnabledCached: boolean | null = null;
let _signingEnabledCacheTime = 0;
const SIGNING_CACHE_TTL = 15_000; // 15 seconds

async function isSigningEnabled(): Promise<boolean> {
  const now = Date.now();
  if (_signingEnabledCached !== null && now - _signingEnabledCacheTime < SIGNING_CACHE_TTL) {
    return _signingEnabledCached;
  }
  try {
    const rows = await _db.select({ value: _jsc.value })
      .from(_jsc)
      .where(_eq(_jsc.configKey, 'signing_enabled'))
      .limit(1);
    // Default to enabled if no row exists
    _signingEnabledCached = rows.length === 0 || rows[0]?.value !== 'false';
    _signingEnabledCacheTime = now;
    return _signingEnabledCached;
  } catch {
    return true; // fail open
  }
}

app.use(async (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  // Only intercept /api/signing/* routes
  if (!req.path.startsWith('/api/signing/')) return next();
  // Public signer endpoints always pass through
  if (req.path.startsWith('/api/signing/sign/')) return next();
  // Admin routes always pass through
  if (req.path.startsWith('/api/admin/')) return next();

  const enabled = await isSigningEnabled();
  if (enabled) return next();

  return res.status(503).json({
    success: false,
    error: 'Document Signing is currently disabled. Please contact support.',
    code: 'SIGNING_DISABLED',
  });
});


// Run DB migrations on startup (idempotent)
runMigrations().then(() => {
  startDocumentExpiryJob();
}).catch((err) => console.error('db.migrate.startup.error', err));

// <api-registrations>
app.get("/api/health", healthGet);
// Admin auth — Microsoft Entra OIDC only
app.post("/api/admin/auth/logout", adminAuthLogoutPost);
app.get("/api/admin/auth/me", adminAuthMeGet);
app.get("/api/admin/auth/diagnostics", adminAuthDiagnosticsGet);
// Admin Microsoft Entra OIDC (corporate tenant — separate from customer External ID)
app.get("/auth/admin/oidc/start", adminOidcStartGet);
app.get("/auth/admin/oidc/callback", adminOidcCallbackGet);
app.get("/api/admin/users", adminUsersGet);
app.post("/api/admin/users", adminUsersPost);
app.patch("/api/admin/users/:id", adminUsersPatch);
app.get("/api/admin/audit/login-attempts", adminAuditLoginAttemptsGet);
app.get("/api/admin/action-log", adminActionLogGet);
// Customer auth
app.post("/api/auth/register", authRateLimit, authRegisterPost);
app.post("/api/auth/login", authRateLimit, authLoginPost);
app.get("/api/auth/me", authMeGet);
app.post("/api/auth/logout", authLogoutPost);
app.patch("/api/auth/profile", authProfilePatch);
app.get("/api/admin/customers", adminCustomersGet);
app.post("/api/admin/customers", adminCustomersPost);
app.get("/api/admin/customers/:id", adminCustomerGetOne);
app.patch("/api/admin/customers/:id", adminCustomerPatch);
// Password reset
app.post("/api/auth/forgot-password", passwordRateLimit, authForgotPasswordPost);
app.post("/api/auth/reset-password", passwordRateLimit, authResetPasswordPost);
app.get("/api/admin/password-resets", adminPasswordResetsGet);
app.post("/api/admin/password-resets/:id/action", adminPasswordResetActionPost);
app.post("/api/admin/forgot-password", adminForgotPasswordPost);
// Favourites
app.get("/api/favourites", favouritesGet);
app.post("/api/favourites", favouritesPost);
app.delete("/api/favourites", favouritesDelete);
// Recently used
app.get("/api/recently-used", recentlyUsedGet);
app.post("/api/recently-used", recentlyUsedPost);
// Notifications
app.get("/api/notifications", notificationsGet);
app.patch("/api/notifications", notificationsPatch);
// Change password
app.post("/api/auth/change-password", changePasswordPost);
// Admin stats
app.get("/api/admin/stats", adminStatsGet);
// User preferences
app.get("/api/user/preferences", userPreferencesGet);
app.patch("/api/user/preferences", userPreferencesPatch);
// Stripe
app.get("/api/stripe/config", stripeConfigGet);
app.post("/api/stripe/create-checkout-session", stripeCreateCheckoutSessionPost);
app.post("/api/stripe/webhook", stripeWebhookPost);
app.post("/api/stripe/portal", stripePortalPost);
app.get("/api/stripe/billing-history", stripeBillingHistoryGet);
// Support tickets
app.get("/api/admin/support/tickets", adminSupportGet);
app.patch("/api/admin/support/tickets/:id", adminSupportPatch);
// System config
app.get("/api/admin/system-config", adminSystemConfigGet);
app.post("/api/admin/system-config", adminSystemConfigPost);
// Public system config (no auth required)
app.get("/api/system-config/public", systemConfigPublicGet);
// Stripe diagnostics
app.get("/api/admin/stripe-diagnostics", adminStripeDiagnosticsGet);
// Stripe admin management
app.get("/api/admin/stripe/status", adminStripeStatusGet);
app.post("/api/admin/stripe/update-keys", adminStripeUpdateKeysPost);
app.post("/api/admin/stripe/update-prices", adminStripeUpdatePricesPost);
app.post("/api/admin/stripe/test-connection", adminStripeTestConnectionPost);
app.post("/api/admin/stripe/verify-prices", adminStripeVerifyPricesPost);
app.post("/api/admin/stripe/test-checkout", adminStripeTestCheckoutPost);
app.get("/api/admin/lifetime", adminLifetimeGet);
// Public support submission
app.post("/api/support/submit", supportSubmitPost);
// Organisation members
app.get("/api/org/members", orgMembersGet);
app.post("/api/org/members", orgMembersPost);
app.patch("/api/org/members", orgMembersPatch);
app.delete("/api/org/members", orgMembersDelete);
// Admin custom templates
app.get("/api/admin/templates", adminTemplatesGet);
app.post("/api/admin/templates", adminTemplatesPost);
app.put("/api/admin/templates/:id", adminTemplatesPut);
app.delete("/api/admin/templates/:id", adminTemplatesDelete);
// Admin builder overrides
app.get("/api/admin/builder-overrides", adminBuilderOverridesGet);
app.post("/api/admin/builder-overrides", adminBuilderOverridesPost);
app.delete("/api/admin/builder-overrides", adminBuilderOverridesDelete);
app.get("/api/admin/builder-meta", adminBuilderMetaGet);
app.post("/api/admin/builder-meta", adminBuilderMetaPost);
// Ticket messages (admin ↔ customer chat)
app.get("/api/admin/support/tickets/:id/messages", adminTicketMessagesGet);
app.post("/api/admin/support/tickets/:id/messages", adminTicketMessagesPost);
app.get("/api/support/tickets", customerTicketsGet);
app.get("/api/support/tickets/:id/messages", customerTicketMessagesGet);
app.post("/api/support/tickets/:id/messages", customerTicketMessagesPost);
// Invoices
app.get("/api/invoices", invoicesGet);
app.post("/api/invoices", invoicesPost);
app.get("/api/invoices/:id", invoiceGetOne);
// Builder Documents
app.get("/api/builder-docs", builderDocsGet);
app.post("/api/builder-docs", builderDocsPost);
app.get("/api/builder-docs/:id", builderDocGetOne);
app.delete("/api/builder-docs/:id", builderDocDelete);
app.get("/api/documents/audit", documentsAuditGet);
app.get("/api/builders/summary", buildersSummaryGet);
// Builder templates — user-facing (loads from DB)
app.get("/api/builders/templates", builderTemplatesGet);
// Admin builder templates — full CRUD
app.get("/api/admin/builder-templates", adminBuilderTemplatesGet);
app.get("/api/admin/legal", adminLegalGet);
app.post("/api/admin/legal", adminLegalPost);
app.get("/api/legal", legalGet);
app.post("/api/admin/builder-templates", adminBuilderTemplatesPost);
app.put("/api/admin/builder-templates/:id", adminBuilderTemplatesPut);
app.delete("/api/admin/builder-templates/:id", adminBuilderTemplatesDelete);
app.post("/api/admin/builder-templates/:id/duplicate", adminBuilderTemplatesDuplicate);
// Portal nav config
app.get("/api/portal-nav", portalNavGet);
app.get("/api/admin/portal-nav", adminPortalNavGet);
app.post("/api/admin/portal-nav", adminPortalNavPost);
// Admin test tools
app.post("/api/admin/test-tools", adminTestToolsPost);
// CMS page content
app.get("/api/admin/page-content", adminPageContentGet);
app.post("/api/admin/page-content", adminPageContentPost);
app.delete("/api/admin/page-content/:slug", adminPageContentDelete);
app.get("/api/page-content/:slug", pageContentPublicGet);
// Site settings
app.get("/api/admin/site-settings", adminSiteSettingsGet);
app.post("/api/admin/site-settings", adminSiteSettingsPost);
app.get("/api/site-settings/public", siteSettingsPublicGet);
// GDPR requests (legacy)
app.get("/api/user/gdpr", userGdprGet);
app.post("/api/user/gdpr", userGdprPost);
app.get("/api/admin/gdpr", adminGdprGet);
app.patch("/api/admin/gdpr/:id", adminGdprPatch);
// SAR — Subject Access Requests (full UK GDPR workflow)
app.get("/api/user/sar", userSarGet);
app.post("/api/user/sar", userSarPost);
app.get("/api/user/sar/:uuid/download", userSarDownload);
app.get("/api/admin/sar", adminSarGet);
app.patch("/api/admin/sar/:id", adminSarPatch);
app.post("/api/admin/sar/:id/generate-export", adminSarGenerateExport);
app.get("/api/admin/sar/:id/download", adminSarDownload);
// OIDC (Microsoft Entra External ID) — server-side confidential client
app.get("/auth/oidc/start", oidcStartGet);
app.get("/auth/callback", oidcCallbackGet);
app.get("/auth/logout", oidcLogoutGet);
// Affiliate programme
app.post("/api/affiliate/apply", affiliateApplyPost);
app.get("/api/affiliate/track", affiliateTrackGet);
app.get("/api/affiliate/dashboard", affiliateDashboardGet);
app.get("/api/admin/affiliates", adminAffiliatesGet);
app.patch("/api/admin/affiliates/:id", adminAffiliatesPatch);
app.get("/api/admin/affiliates/conversions", adminAffiliateConversionsGet);
app.patch("/api/admin/affiliates/conversions/:id", adminAffiliateConversionPatch);
// Documents
app.get("/api/documents", documentsGet);
app.post("/api/documents", documentsPost);
app.get("/api/documents/:id", documentGetOne);
app.put("/api/documents/:id", documentPut);
app.delete("/api/documents/:id", documentDelete);
// Folders
app.get("/api/folders", foldersGet);
app.post("/api/folders", foldersPost);
app.put("/api/folders/:id", folderPut);
app.delete("/api/folders/:id", folderDelete);
// Document Signing — customer
app.post("/api/signing/requests", signingRequestsPost);
app.get("/api/signing/requests", signingRequestsGet);
app.get("/api/signing/requests/:id", signingRequestGetOne);
app.patch("/api/signing/requests/:id", signingRequestPatch);
app.post("/api/signing/requests/:id/send", signingRequestSendPost);
app.post("/api/signing/requests/:id/remind", signingRequestRemindPost);
app.post("/api/signing/requests/:id/upload", signingRequestUploadPost);
app.get("/api/signing/requests/:id/certificate", signingRequestCertificateGet);
app.get("/api/signing/requests/:id/attachments", signingAttachmentsGet);
app.post("/api/signing/requests/:id/attachments", signingAttachmentsPost);
app.delete("/api/signing/requests/:id/attachments/:attachmentId", signingAttachmentDelete);
app.patch("/api/signing/requests/:id/attachments/:attachmentId", signingAttachmentPatch);
app.get("/api/signing/requests/:id/pack", signingPackGet);
// Document Signing — public signer (no auth)
app.get("/api/signing/sign/:token", signingSignGet);
app.post("/api/signing/sign/:token", signingSignPost);
// Document Signing — admin
app.get("/api/admin/signing", adminSigningGet);
app.patch("/api/admin/signing/:id", adminSigningPatch);
app.get("/api/admin/signing/:id/audit", adminSigningAuditGet);
app.get("/api/admin/signing/config", adminSigningConfigGet);
app.patch("/api/admin/signing/config", adminSigningConfigPatch);
// Reseller programme — public
app.post("/api/reseller/apply", resellerApplyPost);
app.get("/api/reseller/referrals/track", resellerReferralTrackGet);
// Reseller auth
app.post("/api/reseller/auth/login", authRateLimit, resellerAuthLoginPost);
app.get("/api/reseller/auth/me", resellerAuthMeGet);
app.post("/api/reseller/auth/logout", resellerAuthLogoutPost);
// Reseller portal
app.get("/api/reseller/dashboard", resellerDashboardGet);
app.get("/api/reseller/customers", resellerCustomersGet);
app.get("/api/reseller/referrals", resellerReferralsGet);
app.get("/api/reseller/commissions", resellerCommissionsGet);
app.get("/api/reseller/resources", resellerResourcesGet);
app.get("/api/reseller/support/tickets", resellerSupportTicketsGet);
app.post("/api/reseller/support/tickets", resellerSupportTicketsPost);
app.get("/api/reseller/support/tickets/:id/messages", resellerSupportTicketMessagesGet);
app.post("/api/reseller/support/tickets/:id/messages", resellerSupportTicketMessagesPost);
app.get("/api/reseller/settings", resellerSettingsGet);
app.patch("/api/reseller/settings", resellerSettingsPatch);
// Admin reseller management
app.get("/api/admin/resellers", adminResellersGet);
app.patch("/api/admin/resellers/:id", adminResellersPatch);
app.get("/api/admin/resellers/:id/customers", adminResellerCustomersGet);
app.get("/api/admin/resellers/commissions", adminResellerCommissionsGet);
app.patch("/api/admin/resellers/commissions/:id", adminResellerCommissionPatch);
app.get("/api/admin/resellers/resources", adminResellerResourcesGet);
app.post("/api/admin/resellers/resources", adminResellerResourcesPost);
app.patch("/api/admin/resellers/resources/:id", adminResellerResourcePatch);
app.delete("/api/admin/resellers/resources/:id", adminResellerResourceDelete);
app.get("/api/admin/resellers/announcements", adminResellerAnnouncementsGet);
app.post("/api/admin/resellers/announcements", adminResellerAnnouncementsPost);
app.patch("/api/admin/resellers/announcements/:id", adminResellerAnnouncementPatch);
app.get("/api/admin/resellers/tickets", adminResellerTicketsGet);
app.get("/api/admin/resellers/tickets/:id/messages", adminResellerTicketMessagesGet);
app.post("/api/admin/resellers/tickets/:id/messages", adminResellerTicketMessagesPost);
app.get("/api/admin/resellers/audit", adminResellerAuditGet);
// </api-registrations>

// Error middleware must be registered AFTER the routes it protects; Express
// only passes errors to middleware defined later in the stack.
app.use("/api", (err: unknown, req: Request, res: Response, _next: NextFunction) => {
	// Always respond JSON on /api so clients parsing response.json() don't
	// receive Express's default HTML error page for non-Error throws.
	console.error("ssr.api.error", {
		url: req.url,
		error: err instanceof Error ? err.stack : String(err),
	});
	res.status(500).json({ error: "Internal server error" });
});

function baseUrl(req: Request): string {
	const env = process.env.PUBLIC_URL || process.env.SITE_URL;
	if (env) return env.replace(/\/+$/, "");
	return `${req.protocol}://${req.hostname}`;
}

function escapeXml(s: string): string {
	return s.replace(/[&<>"']/g, (c) =>
		({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
	);
}

app.get("/robots.txt", (req, res) => {
	const base = baseUrl(req);
	const body = [
		"User-agent: *",
		"Allow: /",
		"Disallow: /dashboard",
		"Disallow: /documents",
		"Disallow: /settings",
		"Disallow: /admin",
		"Disallow: /auth/",
		"Disallow: /signing/",
		"Disallow: /org/",
		"Disallow: /affiliate/dashboard",
		"",
		`Sitemap: ${base}/sitemap.xml`,
		"",
	].join("\n");
	res.type("text/plain").set("Cache-Control", "public, max-age=3600").send(body);
});

app.get("/sitemap.xml", (req, res) => {
	const base = baseUrl(req);
	const urls = seoRoutes
		.filter((r) => typeof r.path === "string" && r.path.startsWith("/"))
		.map((r) => {
			const loc = `${base}${r.path}`;
			const parts = [`    <loc>${escapeXml(loc)}</loc>`];
			if (r.lastmod) parts.push(`    <lastmod>${escapeXml(r.lastmod)}</lastmod>`);
			if (r.changefreq) parts.push(`    <changefreq>${r.changefreq}</changefreq>`);
			if (r.priority !== undefined)
				parts.push(`    <priority>${r.priority.toFixed(1)}</priority>`);
			return `  <url>\n${parts.join("\n")}\n  </url>`;
		})
		.join("\n");
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	res.type("application/xml").set("Cache-Control", "public, max-age=3600").send(body);
});

if (import.meta.env.PROD) {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const clientDir = join(__dirname, "client");

	app.use(
		express.static(clientDir, {
			index: false,
			setHeaders(res, filePath) {
				res.set(
					"Cache-Control",
					filePath.includes("/assets/")
						? "public, max-age=31536000, immutable"
						: "no-cache",
				);
			},
		}),
	);

	app.use((_req, res, next) => {
		res.set("Cache-Control", "no-cache");
		next();
	});

	let template: string;
	try {
		template = readFileSync(join(clientDir, "index.html"), "utf-8");
	} catch (err) {
		console.error("ssr.template.load-failed", {
			path: join(clientDir, "index.html"),
			error: err instanceof Error ? err.message : String(err),
		});
		process.exit(1);
	}
	if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
		// Fail fast at boot, same as a template load failure above: without
		// markers, every .replace() call on the render path is a no-op and we
		// would serve a shell with no <head> content and no rendered body on
		// every request. Preferring process.exit over a degraded mode ensures
		// an operator notices and fixes the build rather than serving broken
		// SEO-invisible pages indefinitely.
		console.error("ssr.template.markers-missing", {
			hasHead: template.includes("<!--app-head-->"),
			hasHtml: template.includes("<!--app-html-->"),
		});
		process.exit(1);
	}
	const fallbackShell = template
		.replace("<!--app-head-->", "")
		.replace("<!--app-html-->", "");

	// Resolve the SSR module once into a stable render function. A failed
	// load is unrecoverable at runtime - exiting lets the container
	// scheduler restart with a clean slate rather than leaving the server
	// to serve silent 503s indefinitely against a single startup log.
	type RenderResult = {
		html: string;
		head: string;
		status: number;
		redirect?: string;
	};
	let renderFn: ((url: string) => Promise<RenderResult>) | null = null;
	const SSR_MODULE_LOAD_TIMEOUT_MS = 30_000;
	const loadTimeout = setTimeout(() => {
		if (renderFn !== null) return;
		console.error("ssr.module.load-timeout", {
			timeoutMs: SSR_MODULE_LOAD_TIMEOUT_MS,
		});
		process.exit(1);
	}, SSR_MODULE_LOAD_TIMEOUT_MS);
	loadTimeout.unref();
	import("../entry-server").then(
		(mod) => {
			clearTimeout(loadTimeout);
			renderFn = mod.render;
		},
		(err) => {
			clearTimeout(loadTimeout);
			console.error("ssr.module.load-failed", {
				error: err instanceof Error ? err.stack : String(err),
			});
			process.exit(1);
		},
	);

	app.get(/.*/, async (req, res, next) => {
		if (req.method !== "GET") return next();
		if (req.path.startsWith("/api")) return next();
		if (extname(req.path)) return next();
		const sendFallback = () =>
			res
				.status(503)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-store")
				.send(fallbackShell);
		if (renderFn === null) {
			// Module not yet resolved; fall back without logging to avoid startup
			// noise before the first render is even possible. A terminal load
			// failure (import reject or 30s timeout) process.exit(1)s from the
			// loader above, so this branch is only the brief warmup window.
			return sendFallback();
		}
		try {
			const result = await renderFn(req.url);
			if (result.redirect) {
				// Redirect thrown from a loader/action surfaces as a Response.
				// Forward it so the browser actually navigates to the new URL
				// instead of seeing an empty shell with a stale status.
				res.redirect(result.status, result.redirect);
				return;
			}
			if (!result.html) {
				// A non-redirect Response was thrown from a loader (e.g.
				// `throw new Response(null, { status: 404 })`). renderToString
				// produced no markup, so we have a real status but no body.
				// Log so the case is observable in ops dashboards, and mark
				// no-store so CDNs don't cache an empty page as a valid hit.
				// User-visible 404 / error pages should come from a route
				// errorElement, not from this fallback path.
				console.error("ssr.render.error-response", {
					url: req.url,
					status: result.status,
				});
				res
					.status(result.status)
					.set("Content-Type", "text/html; charset=utf-8")
					.set("Cache-Control", "no-store")
					.send(fallbackShell);
				return;
			}
			// Function replacements disable String.replace's $-special sequences
			// ($&, $', $`, $$) so user-authored titles / JSON-LD like
			// "Save $& today" insert literally instead of being interpolated.
			const out = template
				.replace("<!--app-head-->", () => result.head)
				.replace("<!--app-html-->", () => result.html);
			res
				.status(result.status)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-cache")
				.send(out);
		} catch (err) {
			// 503 surfaces the failure in CDN/monitoring without caching a broken
			// page as success. console.error (not warn) puts it at the right log
			// level for the observability pipeline to alert on.
			console.error("ssr.render.failed", {
				url: req.url,
				// Log the full stack — React's renderToString annotates it with
				// the failing component's call tree, which the message alone
				// discards.
				error: err instanceof Error ? err.stack : String(err),
			});
			sendFallback();
		}
	});

	const shutdown = async (signal: string) => {
		console.log(`Got ${signal}, shutting down gracefully...`);
		// Scope the ERR_MODULE_NOT_FOUND suppression to the import() only.
		// A closeConnection() failure that happens to carry the same code
		// (unlikely but possible for wrapped errors) must not be silently
		// swallowed - it indicates a real db-close failure worth logging.
		let mod: { closeConnection?: () => Promise<void> | void } | null = null;
		try {
			const dbClient = "./db/client" + ".js";
			mod = await import(/* @vite-ignore */ dbClient);
		} catch (error: unknown) {
			const code = (error as { code?: string } | null)?.code;
			if (code !== "ERR_MODULE_NOT_FOUND") {
				console.error("ssr.shutdown.db-import-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		if (mod && typeof mod.closeConnection === "function") {
			try {
				await mod.closeConnection();
				console.log("Database connections closed");
			} catch (error: unknown) {
				console.error("ssr.shutdown.db-close-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		process.exit(0);
	};

	(["SIGTERM", "SIGINT"] as const).forEach((signal) => {
		process.once(signal, () => {
			void shutdown(signal);
		});
	});

	const rawPort = process.env.PORT || "3000";
	const port = parseInt(rawPort, 10);
	if (!Number.isInteger(port) || port <= 0 || port > 65535) {
		// parseInt("abc") returns NaN; passing that to app.listen throws
		// synchronously before the server.on("error") handler below can catch
		// it. Fail fast with an actionable log rather than a cryptic crash.
		console.error("ssr.server.invalid-port", { rawPort });
		process.exit(1);
	}
	const host = process.env.HOST || "0.0.0.0";
	const server = app.listen(port, host, () => {
		console.log(`Server listening on http://${host}:${port}`);
	});
	server.on("error", (err: NodeJS.ErrnoException) => {
		console.error("ssr.server.listen-failed", {
			port,
			host,
			code: err.code,
			error: err.message,
		});
		process.exit(1);
	});
}

export default app;
