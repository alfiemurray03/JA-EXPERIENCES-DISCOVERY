import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFileSync } from "node:fs";

// <api-imports>
import admin_action_log_get_0 from "./api/admin/action-log/GET";
import admin_affiliates_get_1 from "./api/admin/affiliates/GET";
import admin_affiliates_conversions_get_2 from "./api/admin/affiliates/conversions/GET";
import admin_affiliates_conversions_id_patch_3 from "./api/admin/affiliates/conversions/[id]/PATCH";
import admin_affiliates_id_patch_4 from "./api/admin/affiliates/[id]/PATCH";
import admin_audit_login_attempts_get_5 from "./api/admin/audit/login-attempts/GET";
import admin_auth_complete_setup_post_6 from "./api/admin/auth/complete-setup/POST";
import admin_auth_debug_hash_get_7 from "./api/admin/auth/debug-hash/GET";
import admin_auth_diagnostics_get_8 from "./api/admin/auth/diagnostics/GET";
import admin_auth_login_post_9 from "./api/admin/auth/login/POST";
import admin_auth_logout_post_10 from "./api/admin/auth/logout/POST";
import admin_auth_me_get_11 from "./api/admin/auth/me/GET";
import admin_auth_oidc_callback_get_12 from "./api/admin/auth/oidc/callback/GET";
import admin_auth_oidc_start_get_13 from "./api/admin/auth/oidc/start/GET";
import admin_auth_resend_pin_post_14 from "./api/admin/auth/resend-pin/POST";
import admin_auth_reset_password_post_15 from "./api/admin/auth/reset-password/POST";
import admin_auth_setup_post_16 from "./api/admin/auth/setup/POST";
import admin_auth_setup_status_get_17 from "./api/admin/auth/setup-status/GET";
import admin_auth_verify_pin_post_18 from "./api/admin/auth/verify-pin/POST";
import admin_builder_meta_get_19 from "./api/admin/builder-meta/GET";
import admin_builder_meta_post_20 from "./api/admin/builder-meta/POST";
import admin_builder_overrides_delete_21 from "./api/admin/builder-overrides/DELETE";
import admin_builder_overrides_get_22 from "./api/admin/builder-overrides/GET";
import admin_builder_overrides_post_23 from "./api/admin/builder-overrides/POST";
import admin_builder_templates_get_24 from "./api/admin/builder-templates/GET";
import admin_builder_templates_post_25 from "./api/admin/builder-templates/POST";
import admin_builder_templates_id_delete_26 from "./api/admin/builder-templates/[id]/DELETE";
import admin_builder_templates_id_put_27 from "./api/admin/builder-templates/[id]/PUT";
import admin_builder_templates_id_duplicate_post_28 from "./api/admin/builder-templates/[id]/duplicate/POST";
import admin_customers_get_29 from "./api/admin/customers/GET";
import admin_customers_post_30 from "./api/admin/customers/POST";
import admin_customers_id_get_31 from "./api/admin/customers/[id]/GET";
import admin_customers_id_patch_32 from "./api/admin/customers/[id]/PATCH";
import admin_forgot_password_post_33 from "./api/admin/forgot-password/POST";
import admin_gdpr_get_34 from "./api/admin/gdpr/GET";
import admin_gdpr_id_patch_35 from "./api/admin/gdpr/[id]/PATCH";
import admin_legal_get_36 from "./api/admin/legal/GET";
import admin_legal_post_37 from "./api/admin/legal/POST";
import admin_lifetime_get_38 from "./api/admin/lifetime/GET";
import admin_page_content_get_39 from "./api/admin/page-content/GET";
import admin_page_content_post_40 from "./api/admin/page-content/POST";
import admin_page_content_slug_delete_41 from "./api/admin/page-content/[slug]/DELETE";
import admin_password_resets_get_42 from "./api/admin/password-resets/GET";
import admin_password_resets_id_post_43 from "./api/admin/password-resets/[id]/POST";
import admin_portal_nav_get_44 from "./api/admin/portal-nav/GET";
import admin_portal_nav_post_45 from "./api/admin/portal-nav/POST";
import admin_resellers_get_46 from "./api/admin/resellers/GET";
import admin_resellers_announcements_get_47 from "./api/admin/resellers/announcements/GET";
import admin_resellers_announcements_post_48 from "./api/admin/resellers/announcements/POST";
import admin_resellers_announcements_id_patch_49 from "./api/admin/resellers/announcements/[id]/PATCH";
import admin_resellers_audit_get_50 from "./api/admin/resellers/audit/GET";
import admin_resellers_commissions_get_51 from "./api/admin/resellers/commissions/GET";
import admin_resellers_commissions_id_patch_52 from "./api/admin/resellers/commissions/[id]/PATCH";
import admin_resellers_resources_get_53 from "./api/admin/resellers/resources/GET";
import admin_resellers_resources_post_54 from "./api/admin/resellers/resources/POST";
import admin_resellers_resources_id_delete_55 from "./api/admin/resellers/resources/[id]/DELETE";
import admin_resellers_resources_id_patch_56 from "./api/admin/resellers/resources/[id]/PATCH";
import admin_resellers_tickets_get_57 from "./api/admin/resellers/tickets/GET";
import admin_resellers_tickets_id_messages_get_58 from "./api/admin/resellers/tickets/[id]/messages/GET";
import admin_resellers_tickets_id_messages_post_59 from "./api/admin/resellers/tickets/[id]/messages/POST";
import admin_resellers_id_patch_60 from "./api/admin/resellers/[id]/PATCH";
import admin_resellers_id_customers_get_61 from "./api/admin/resellers/[id]/customers/GET";
import admin_resellers_id_customers_post_62 from "./api/admin/resellers/[id]/customers/POST";
import admin_sar_get_63 from "./api/admin/sar/GET";
import admin_sar_id_patch_64 from "./api/admin/sar/[id]/PATCH";
import admin_sar_id_download_get_65 from "./api/admin/sar/[id]/download/GET";
import admin_sar_id_generate_export_post_66 from "./api/admin/sar/[id]/generate-export/POST";
import admin_signing_get_67 from "./api/admin/signing/GET";
import admin_signing_config_get_68 from "./api/admin/signing/config/GET";
import admin_signing_config_patch_69 from "./api/admin/signing/config/PATCH";
import admin_signing_id_patch_70 from "./api/admin/signing/[id]/PATCH";
import admin_signing_id_audit_get_71 from "./api/admin/signing/[id]/audit/GET";
import admin_site_settings_get_72 from "./api/admin/site-settings/GET";
import admin_site_settings_post_73 from "./api/admin/site-settings/POST";
import admin_stats_get_74 from "./api/admin/stats/GET";
import admin_stripe_status_get_75 from "./api/admin/stripe/status/GET";
import admin_stripe_test_checkout_post_76 from "./api/admin/stripe/test-checkout/POST";
import admin_stripe_test_connection_post_77 from "./api/admin/stripe/test-connection/POST";
import admin_stripe_update_keys_post_78 from "./api/admin/stripe/update-keys/POST";
import admin_stripe_update_prices_post_79 from "./api/admin/stripe/update-prices/POST";
import admin_stripe_verify_prices_post_80 from "./api/admin/stripe/verify-prices/POST";
import admin_stripe_diagnostics_get_81 from "./api/admin/stripe-diagnostics/GET";
import admin_support_get_82 from "./api/admin/support/GET";
import admin_support_id_patch_83 from "./api/admin/support/[id]/PATCH";
import admin_support_id_messages_get_84 from "./api/admin/support/[id]/messages/GET";
import admin_support_id_messages_post_85 from "./api/admin/support/[id]/messages/POST";
import admin_system_config_get_86 from "./api/admin/system-config/GET";
import admin_system_config_post_87 from "./api/admin/system-config/POST";
import admin_templates_get_88 from "./api/admin/templates/GET";
import admin_templates_post_89 from "./api/admin/templates/POST";
import admin_templates_id_delete_90 from "./api/admin/templates/[id]/DELETE";
import admin_templates_id_put_91 from "./api/admin/templates/[id]/PUT";
import admin_test_tools_post_92 from "./api/admin/test-tools/POST";
import admin_users_get_93 from "./api/admin/users/GET";
import admin_users_post_94 from "./api/admin/users/POST";
import admin_users_id_patch_95 from "./api/admin/users/[id]/PATCH";
import affiliate_apply_post_96 from "./api/affiliate/apply/POST";
import affiliate_dashboard_get_97 from "./api/affiliate/dashboard/GET";
import affiliate_track_get_98 from "./api/affiliate/track/GET";
import auth_change_password_post_99 from "./api/auth/change-password/POST";
import auth_forgot_password_post_100 from "./api/auth/forgot-password/POST";
import auth_login_post_101 from "./api/auth/login/POST";
import auth_logout_post_102 from "./api/auth/logout/POST";
import auth_me_get_103 from "./api/auth/me/GET";
import auth_oidc_callback_get_104 from "./api/auth/oidc/callback/GET";
import auth_oidc_logout_get_105 from "./api/auth/oidc/logout/GET";
import auth_oidc_start_get_106 from "./api/auth/oidc/start/GET";
import auth_profile_patch_107 from "./api/auth/profile/PATCH";
import auth_register_post_108 from "./api/auth/register/POST";
import auth_reset_password_post_109 from "./api/auth/reset-password/POST";
import builder_docs_get_110 from "./api/builder-docs/GET";
import builder_docs_post_111 from "./api/builder-docs/POST";
import builder_docs_id_delete_112 from "./api/builder-docs/[id]/DELETE";
import builder_docs_id_get_113 from "./api/builder-docs/[id]/GET";
import builder_docs_id_put_114 from "./api/builder-docs/[id]/PUT";
import builders_summary_get_115 from "./api/builders/summary/GET";
import builders_templates_get_116 from "./api/builders/templates/GET";
import documents_get_117 from "./api/documents/GET";
import documents_post_118 from "./api/documents/POST";
import documents_audit_get_119 from "./api/documents/audit/GET";
import documents_id_delete_120 from "./api/documents/[id]/DELETE";
import documents_id_get_121 from "./api/documents/[id]/GET";
import documents_id_put_122 from "./api/documents/[id]/PUT";
import favourites_delete_123 from "./api/favourites/DELETE";
import favourites_get_124 from "./api/favourites/GET";
import favourites_post_125 from "./api/favourites/POST";
import folders_get_126 from "./api/folders/GET";
import folders_post_127 from "./api/folders/POST";
import folders_id_delete_128 from "./api/folders/[id]/DELETE";
import folders_id_put_129 from "./api/folders/[id]/PUT";
import health_get_130 from "./api/health/GET";
import invoices_get_131 from "./api/invoices/GET";
import invoices_post_132 from "./api/invoices/POST";
import invoices_id_get_133 from "./api/invoices/[id]/GET";
import legal_get_134 from "./api/legal/GET";
import notifications_get_135 from "./api/notifications/GET";
import notifications_patch_136 from "./api/notifications/PATCH";
import org_members_delete_137 from "./api/org/members/DELETE";
import org_members_get_138 from "./api/org/members/GET";
import org_members_patch_139 from "./api/org/members/PATCH";
import org_members_post_140 from "./api/org/members/POST";
import page_content_slug_get_141 from "./api/page-content/[slug]/GET";
import portal_nav_get_142 from "./api/portal-nav/GET";
import recently_used_get_143 from "./api/recently-used/GET";
import recently_used_post_144 from "./api/recently-used/POST";
import reseller_apply_post_145 from "./api/reseller/apply/POST";
import reseller_auth_login_post_146 from "./api/reseller/auth/login/POST";
import reseller_auth_logout_post_147 from "./api/reseller/auth/logout/POST";
import reseller_auth_me_get_148 from "./api/reseller/auth/me/GET";
import reseller_commissions_get_149 from "./api/reseller/commissions/GET";
import reseller_customers_get_150 from "./api/reseller/customers/GET";
import reseller_dashboard_get_151 from "./api/reseller/dashboard/GET";
import reseller_referrals_get_152 from "./api/reseller/referrals/GET";
import reseller_referrals_track_get_153 from "./api/reseller/referrals/track/GET";
import reseller_resources_get_154 from "./api/reseller/resources/GET";
import reseller_settings_get_155 from "./api/reseller/settings/GET";
import reseller_settings_patch_156 from "./api/reseller/settings/PATCH";
import reseller_support_tickets_get_157 from "./api/reseller/support/tickets/GET";
import reseller_support_tickets_post_158 from "./api/reseller/support/tickets/POST";
import reseller_support_tickets_id_messages_get_159 from "./api/reseller/support/tickets/[id]/messages/GET";
import reseller_support_tickets_id_messages_post_160 from "./api/reseller/support/tickets/[id]/messages/POST";
import signing_requests_get_161 from "./api/signing/requests/GET";
import signing_requests_post_162 from "./api/signing/requests/POST";
import signing_requests_id_get_163 from "./api/signing/requests/[id]/GET";
import signing_requests_id_patch_164 from "./api/signing/requests/[id]/PATCH";
import signing_requests_id_attachments_get_165 from "./api/signing/requests/[id]/attachments/GET";
import signing_requests_id_attachments_post_166 from "./api/signing/requests/[id]/attachments/POST";
import signing_requests_id_attachments_attachmentId_delete_167 from "./api/signing/requests/[id]/attachments/[attachmentId]/DELETE";
import signing_requests_id_attachments_attachmentId_patch_168 from "./api/signing/requests/[id]/attachments/[attachmentId]/PATCH";
import signing_requests_id_certificate_get_169 from "./api/signing/requests/[id]/certificate/GET";
import signing_requests_id_pack_get_170 from "./api/signing/requests/[id]/pack/GET";
import signing_requests_id_remind_post_171 from "./api/signing/requests/[id]/remind/POST";
import signing_requests_id_send_post_172 from "./api/signing/requests/[id]/send/POST";
import signing_requests_id_upload_post_173 from "./api/signing/requests/[id]/upload/POST";
import signing_sign_token_get_174 from "./api/signing/sign/[token]/GET";
import signing_sign_token_post_175 from "./api/signing/sign/[token]/POST";
import site_settings_public_get_176 from "./api/site-settings/public/GET";
import stripe_add_seats_post_177 from "./api/stripe/add-seats/POST";
import stripe_billing_history_get_178 from "./api/stripe/billing-history/GET";
import stripe_config_get_179 from "./api/stripe/config/GET";
import stripe_create_checkout_session_post_180 from "./api/stripe/create-checkout-session/POST";
import stripe_portal_post_181 from "./api/stripe/portal/POST";
import stripe_webhook_post_182 from "./api/stripe/webhook/POST";
import support_submit_post_183 from "./api/support/submit/POST";
import support_tickets_get_184 from "./api/support/tickets/GET";
import support_tickets_id_messages_get_185 from "./api/support/tickets/[id]/messages/GET";
import support_tickets_id_messages_post_186 from "./api/support/tickets/[id]/messages/POST";
import system_config_public_get_187 from "./api/system-config/public/GET";
import user_gdpr_get_188 from "./api/user/gdpr/GET";
import user_gdpr_post_189 from "./api/user/gdpr/POST";
import user_preferences_get_190 from "./api/user/preferences/GET";
import user_preferences_patch_191 from "./api/user/preferences/PATCH";
import user_sar_get_192 from "./api/user/sar/GET";
import user_sar_post_193 from "./api/user/sar/POST";
import user_sar_uuid_download_get_194 from "./api/user/sar/[uuid]/download/GET";
// </api-imports>
import { seoRoutes } from "../lib/seo-routes";
import { runMigrations } from "./db/migrate.js";
import { startDocumentExpiryJob } from "./jobs/document-expiry.js";
import { blockCustomerOnAdminRoutes } from "./api/admin/_customer-block.js";

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://widget.getyourguide.com",
      // Styles: self + inline (Tailwind / Radix / PDF renderer)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs (logo uploads) + blob (canvas export)
      "img-src 'self' data: blob: https:",
      // Connections: self + Microsoft OIDC + Stripe
      "connect-src 'self' https://login.microsoftonline.com https://api.stripe.com",
      // Frames: payments and approved activity partners
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://partner.headout.com https://widget.getyourguide.com",
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
app.get("/api/admin/action-log", admin_action_log_get_0);
app.get("/api/admin/affiliates", admin_affiliates_get_1);
app.get("/api/admin/affiliates/conversions", admin_affiliates_conversions_get_2);
app.patch("/api/admin/affiliates/conversions/:id", admin_affiliates_conversions_id_patch_3);
app.patch("/api/admin/affiliates/:id", admin_affiliates_id_patch_4);
app.get("/api/admin/audit/login-attempts", admin_audit_login_attempts_get_5);
app.post("/api/admin/auth/complete-setup", admin_auth_complete_setup_post_6);
app.get("/api/admin/auth/debug-hash", admin_auth_debug_hash_get_7);
app.get("/api/admin/auth/diagnostics", admin_auth_diagnostics_get_8);
app.post("/api/admin/auth/login", admin_auth_login_post_9);
app.post("/api/admin/auth/logout", admin_auth_logout_post_10);
app.get("/api/admin/auth/me", admin_auth_me_get_11);
app.get("/api/admin/auth/oidc/callback", admin_auth_oidc_callback_get_12);
app.get("/api/admin/auth/oidc/start", admin_auth_oidc_start_get_13);
app.post("/api/admin/auth/resend-pin", admin_auth_resend_pin_post_14);
app.post("/api/admin/auth/reset-password", admin_auth_reset_password_post_15);
app.post("/api/admin/auth/setup", admin_auth_setup_post_16);
app.get("/api/admin/auth/setup-status", admin_auth_setup_status_get_17);
app.post("/api/admin/auth/verify-pin", admin_auth_verify_pin_post_18);
app.get("/api/admin/builder-meta", admin_builder_meta_get_19);
app.post("/api/admin/builder-meta", admin_builder_meta_post_20);
app.delete("/api/admin/builder-overrides", admin_builder_overrides_delete_21);
app.get("/api/admin/builder-overrides", admin_builder_overrides_get_22);
app.post("/api/admin/builder-overrides", admin_builder_overrides_post_23);
app.get("/api/admin/builder-templates", admin_builder_templates_get_24);
app.post("/api/admin/builder-templates", admin_builder_templates_post_25);
app.delete("/api/admin/builder-templates/:id", admin_builder_templates_id_delete_26);
app.put("/api/admin/builder-templates/:id", admin_builder_templates_id_put_27);
app.post("/api/admin/builder-templates/:id/duplicate", admin_builder_templates_id_duplicate_post_28);
app.get("/api/admin/customers", admin_customers_get_29);
app.post("/api/admin/customers", admin_customers_post_30);
app.get("/api/admin/customers/:id", admin_customers_id_get_31);
app.patch("/api/admin/customers/:id", admin_customers_id_patch_32);
app.post("/api/admin/forgot-password", admin_forgot_password_post_33);
app.get("/api/admin/gdpr", admin_gdpr_get_34);
app.patch("/api/admin/gdpr/:id", admin_gdpr_id_patch_35);
app.get("/api/admin/legal", admin_legal_get_36);
app.post("/api/admin/legal", admin_legal_post_37);
app.get("/api/admin/lifetime", admin_lifetime_get_38);
app.get("/api/admin/page-content", admin_page_content_get_39);
app.post("/api/admin/page-content", admin_page_content_post_40);
app.delete("/api/admin/page-content/:slug", admin_page_content_slug_delete_41);
app.get("/api/admin/password-resets", admin_password_resets_get_42);
app.post("/api/admin/password-resets/:id", admin_password_resets_id_post_43);
app.get("/api/admin/portal-nav", admin_portal_nav_get_44);
app.post("/api/admin/portal-nav", admin_portal_nav_post_45);
app.get("/api/admin/resellers", admin_resellers_get_46);
app.get("/api/admin/resellers/announcements", admin_resellers_announcements_get_47);
app.post("/api/admin/resellers/announcements", admin_resellers_announcements_post_48);
app.patch("/api/admin/resellers/announcements/:id", admin_resellers_announcements_id_patch_49);
app.get("/api/admin/resellers/audit", admin_resellers_audit_get_50);
app.get("/api/admin/resellers/commissions", admin_resellers_commissions_get_51);
app.patch("/api/admin/resellers/commissions/:id", admin_resellers_commissions_id_patch_52);
app.get("/api/admin/resellers/resources", admin_resellers_resources_get_53);
app.post("/api/admin/resellers/resources", admin_resellers_resources_post_54);
app.delete("/api/admin/resellers/resources/:id", admin_resellers_resources_id_delete_55);
app.patch("/api/admin/resellers/resources/:id", admin_resellers_resources_id_patch_56);
app.get("/api/admin/resellers/tickets", admin_resellers_tickets_get_57);
app.get("/api/admin/resellers/tickets/:id/messages", admin_resellers_tickets_id_messages_get_58);
app.post("/api/admin/resellers/tickets/:id/messages", admin_resellers_tickets_id_messages_post_59);
app.patch("/api/admin/resellers/:id", admin_resellers_id_patch_60);
app.get("/api/admin/resellers/:id/customers", admin_resellers_id_customers_get_61);
app.post("/api/admin/resellers/:id/customers", admin_resellers_id_customers_post_62);
app.get("/api/admin/sar", admin_sar_get_63);
app.patch("/api/admin/sar/:id", admin_sar_id_patch_64);
app.get("/api/admin/sar/:id/download", admin_sar_id_download_get_65);
app.post("/api/admin/sar/:id/generate-export", admin_sar_id_generate_export_post_66);
app.get("/api/admin/signing", admin_signing_get_67);
app.get("/api/admin/signing/config", admin_signing_config_get_68);
app.patch("/api/admin/signing/config", admin_signing_config_patch_69);
app.patch("/api/admin/signing/:id", admin_signing_id_patch_70);
app.get("/api/admin/signing/:id/audit", admin_signing_id_audit_get_71);
app.get("/api/admin/site-settings", admin_site_settings_get_72);
app.post("/api/admin/site-settings", admin_site_settings_post_73);
app.get("/api/admin/stats", admin_stats_get_74);
app.get("/api/admin/stripe/status", admin_stripe_status_get_75);
app.post("/api/admin/stripe/test-checkout", admin_stripe_test_checkout_post_76);
app.post("/api/admin/stripe/test-connection", admin_stripe_test_connection_post_77);
app.post("/api/admin/stripe/update-keys", admin_stripe_update_keys_post_78);
app.post("/api/admin/stripe/update-prices", admin_stripe_update_prices_post_79);
app.post("/api/admin/stripe/verify-prices", admin_stripe_verify_prices_post_80);
app.get("/api/admin/stripe-diagnostics", admin_stripe_diagnostics_get_81);
app.get("/api/admin/support", admin_support_get_82);
app.patch("/api/admin/support/:id", admin_support_id_patch_83);
app.get("/api/admin/support/:id/messages", admin_support_id_messages_get_84);
app.post("/api/admin/support/:id/messages", admin_support_id_messages_post_85);
app.get("/api/admin/system-config", admin_system_config_get_86);
app.post("/api/admin/system-config", admin_system_config_post_87);
app.get("/api/admin/templates", admin_templates_get_88);
app.post("/api/admin/templates", admin_templates_post_89);
app.delete("/api/admin/templates/:id", admin_templates_id_delete_90);
app.put("/api/admin/templates/:id", admin_templates_id_put_91);
app.post("/api/admin/test-tools", admin_test_tools_post_92);
app.get("/api/admin/users", admin_users_get_93);
app.post("/api/admin/users", admin_users_post_94);
app.patch("/api/admin/users/:id", admin_users_id_patch_95);
app.post("/api/affiliate/apply", affiliate_apply_post_96);
app.get("/api/affiliate/dashboard", affiliate_dashboard_get_97);
app.get("/api/affiliate/track", affiliate_track_get_98);
app.post("/api/auth/change-password", auth_change_password_post_99);
app.post("/api/auth/forgot-password", auth_forgot_password_post_100);
app.post("/api/auth/login", auth_login_post_101);
app.post("/api/auth/logout", auth_logout_post_102);
app.get("/api/auth/me", auth_me_get_103);
app.get("/api/auth/oidc/callback", auth_oidc_callback_get_104);
app.get("/api/auth/oidc/logout", auth_oidc_logout_get_105);
app.get("/api/auth/oidc/start", auth_oidc_start_get_106);
app.patch("/api/auth/profile", auth_profile_patch_107);
app.post("/api/auth/register", auth_register_post_108);
app.post("/api/auth/reset-password", auth_reset_password_post_109);
app.get("/api/builder-docs", builder_docs_get_110);
app.post("/api/builder-docs", builder_docs_post_111);
app.delete("/api/builder-docs/:id", builder_docs_id_delete_112);
app.get("/api/builder-docs/:id", builder_docs_id_get_113);
app.put("/api/builder-docs/:id", builder_docs_id_put_114);
app.get("/api/builders/summary", builders_summary_get_115);
app.get("/api/builders/templates", builders_templates_get_116);
app.get("/api/documents", documents_get_117);
app.post("/api/documents", documents_post_118);
app.get("/api/documents/audit", documents_audit_get_119);
app.delete("/api/documents/:id", documents_id_delete_120);
app.get("/api/documents/:id", documents_id_get_121);
app.put("/api/documents/:id", documents_id_put_122);
app.delete("/api/favourites", favourites_delete_123);
app.get("/api/favourites", favourites_get_124);
app.post("/api/favourites", favourites_post_125);
app.get("/api/folders", folders_get_126);
app.post("/api/folders", folders_post_127);
app.delete("/api/folders/:id", folders_id_delete_128);
app.put("/api/folders/:id", folders_id_put_129);
app.get("/api/health", health_get_130);
app.get("/api/invoices", invoices_get_131);
app.post("/api/invoices", invoices_post_132);
app.get("/api/invoices/:id", invoices_id_get_133);
app.get("/api/legal", legal_get_134);
app.get("/api/notifications", notifications_get_135);
app.patch("/api/notifications", notifications_patch_136);
app.delete("/api/org/members", org_members_delete_137);
app.get("/api/org/members", org_members_get_138);
app.patch("/api/org/members", org_members_patch_139);
app.post("/api/org/members", org_members_post_140);
app.get("/api/page-content/:slug", page_content_slug_get_141);
app.get("/api/portal-nav", portal_nav_get_142);
app.get("/api/recently-used", recently_used_get_143);
app.post("/api/recently-used", recently_used_post_144);
app.post("/api/reseller/apply", reseller_apply_post_145);
app.post("/api/reseller/auth/login", reseller_auth_login_post_146);
app.post("/api/reseller/auth/logout", reseller_auth_logout_post_147);
app.get("/api/reseller/auth/me", reseller_auth_me_get_148);
app.get("/api/reseller/commissions", reseller_commissions_get_149);
app.get("/api/reseller/customers", reseller_customers_get_150);
app.get("/api/reseller/dashboard", reseller_dashboard_get_151);
app.get("/api/reseller/referrals", reseller_referrals_get_152);
app.get("/api/reseller/referrals/track", reseller_referrals_track_get_153);
app.get("/api/reseller/resources", reseller_resources_get_154);
app.get("/api/reseller/settings", reseller_settings_get_155);
app.patch("/api/reseller/settings", reseller_settings_patch_156);
app.get("/api/reseller/support/tickets", reseller_support_tickets_get_157);
app.post("/api/reseller/support/tickets", reseller_support_tickets_post_158);
app.get("/api/reseller/support/tickets/:id/messages", reseller_support_tickets_id_messages_get_159);
app.post("/api/reseller/support/tickets/:id/messages", reseller_support_tickets_id_messages_post_160);
app.get("/api/signing/requests", signing_requests_get_161);
app.post("/api/signing/requests", signing_requests_post_162);
app.get("/api/signing/requests/:id", signing_requests_id_get_163);
app.patch("/api/signing/requests/:id", signing_requests_id_patch_164);
app.get("/api/signing/requests/:id/attachments", signing_requests_id_attachments_get_165);
app.post("/api/signing/requests/:id/attachments", signing_requests_id_attachments_post_166);
app.delete("/api/signing/requests/:id/attachments/:attachmentId", signing_requests_id_attachments_attachmentId_delete_167);
app.patch("/api/signing/requests/:id/attachments/:attachmentId", signing_requests_id_attachments_attachmentId_patch_168);
app.get("/api/signing/requests/:id/certificate", signing_requests_id_certificate_get_169);
app.get("/api/signing/requests/:id/pack", signing_requests_id_pack_get_170);
app.post("/api/signing/requests/:id/remind", signing_requests_id_remind_post_171);
app.post("/api/signing/requests/:id/send", signing_requests_id_send_post_172);
app.post("/api/signing/requests/:id/upload", signing_requests_id_upload_post_173);
app.get("/api/signing/sign/:token", signing_sign_token_get_174);
app.post("/api/signing/sign/:token", signing_sign_token_post_175);
app.get("/api/site-settings/public", site_settings_public_get_176);
app.post("/api/stripe/add-seats", stripe_add_seats_post_177);
app.get("/api/stripe/billing-history", stripe_billing_history_get_178);
app.get("/api/stripe/config", stripe_config_get_179);
app.post("/api/stripe/create-checkout-session", stripe_create_checkout_session_post_180);
app.post("/api/stripe/portal", stripe_portal_post_181);
app.post("/api/stripe/webhook", stripe_webhook_post_182);
app.post("/api/support/submit", support_submit_post_183);
app.get("/api/support/tickets", support_tickets_get_184);
app.get("/api/support/tickets/:id/messages", support_tickets_id_messages_get_185);
app.post("/api/support/tickets/:id/messages", support_tickets_id_messages_post_186);
app.get("/api/system-config/public", system_config_public_get_187);
app.get("/api/user/gdpr", user_gdpr_get_188);
app.post("/api/user/gdpr", user_gdpr_post_189);
app.get("/api/user/preferences", user_preferences_get_190);
app.patch("/api/user/preferences", user_preferences_patch_191);
app.get("/api/user/sar", user_sar_get_192);
app.post("/api/user/sar", user_sar_post_193);
app.get("/api/user/sar/:uuid/download", user_sar_uuid_download_get_194);
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
