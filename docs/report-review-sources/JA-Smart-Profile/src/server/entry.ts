import express, { type NextFunction, type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFileSync } from "node:fs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { getSecret } from "#airo/secrets";
import { SQLiteSessionStore } from "./session-store.js";

// <api-imports>
import healthGet from "./api/health/GET";
import partnerEnquiryPost from "./api/partner-enquiry/POST";
import reportIssuePost from "./api/report-issue/POST.js";
import { getIssueReports, updateIssueReport } from "./api/admin/issue-reports.js";
// </api-imports>

// Auth (OIDC)
import {
  customerLoginStart, customerLoginCallback, customerLogout,
  adminLoginStart, adminLoginCallback, adminLogout,
} from "./api/auth/oidc";
import authMe from "./api/auth/me";
import adminMe from "./api/auth/admin-me";

// Profiles
import { getMyProfiles, createProfile, updateProfile, deleteProfile, getPublicProfile, getPublicBusinessProfile } from "./api/profiles/index";
import { setProfilePin, verifyProfilePin, getProfilePinStatus, toggleMessaging, toggleEnquiry } from "./api/profiles/pin";

// Links
import { getLinks, createLink, updateLink, deleteLink, reorderLinks, recordClick } from "./api/links/index";

// QR
import { getQRCode } from "./api/qr/index";

// Enquiries
import { submitEnquiry, getEnquiries, markRead } from "./api/enquiries/index";

// Analytics
import { recordView, getAnalytics } from "./api/analytics/index";

// Themes & Plans
import { getThemes } from "./api/themes/index";
import { getPlans } from "./api/plans/index";

// Admin
import {
  getUsers, updateUser, deleteUser,
  getProfiles, deleteAdminProfile,
  getAllEnquiries,
  getAdminAnalytics,
  getAdminPlans, createPlan, updatePlan,
  getAdminThemes, createTheme, updateTheme,
  getSettings, updateSettings,
  updateUserSettings, deleteAccount,
  getBranding, updateBranding, getPublicBranding,
  getPartnerEnquiries, markPartnerEnquiryRead, deletePartnerEnquiry,
  getSiteTheme, updateSiteTheme,
  pauseUser, getGlobalPauseState, setGlobalPauseState,
} from "./api/admin/index";

// Audit & Legal
import { getAuditLog, getLegalPolicies, updateLegalPolicy, getPublicPolicy } from "./api/admin/audit";
import { testNotification } from "./api/admin/test-notifications";

// Stripe & Billing
import { getStripeConfig, updateStripeConfig, grantLifetimeAccess, revokeLifetimeAccess, getSubscriptions, syncStripeProducts, getStripeProducts } from "./api/admin/stripe";
import { stripeWebhook } from "./api/stripe/webhook";
import { submitSupportRequest, getSupportRequests, updateSupportRequest } from "./api/support/request";
import accountUpdate from "./api/account/update";
import { cancelSubscription } from "./api/billing/cancel";
import { getReferralMe, getAdminReferrals } from "./api/referral/index";
import { applyAffiliate, getMyAffiliateStatus, adminListAffiliates, adminApproveAffiliate, adminRejectAffiliate, adminUpdateCommissionRate, adminListCommissions, adminMarkCommissionPaid } from "./api/affiliate/index";
import { createCheckoutSession } from "./api/billing/checkout";
import { sendCardMessage, visitorReply, getVisitorThread, acceptVisitor, getMyThreads, getThread, replyToThread, setThreadStatus, deleteThread, getThreadStatus, adminGetAllThreads } from "./api/messages/index";
import { getNotifications, markNotificationsRead, deleteNotification } from "./api/notifications/index";
import { getMyPointsSummary, getMyPointsHistory, getRewards, redeemReward, getMyRedemptions, getMyReferral } from "./api/points/index";
import {
  adminGetRules, adminUpdateRule,
  adminGetRewards, adminCreateReward, adminUpdateReward, adminDeleteReward,
  adminGetMemberBalances, adminAdjustPoints,
  adminGetRedemptions, adminFulfillRedemption,
  adminGetReferralActivity,
} from "./api/admin/points";

// Middleware
import { requireAuth, requireAdminApi } from "./middleware/auth";
import { securityHeaders } from "./middleware/security-headers";
import { authLimiter, formSubmitLimiter, analyticsLimiter, publicApiLimiter } from "./middleware/rate-limit";
import { auditMiddleware } from "./middleware/audit-middleware";
import logConsent from "./api/audit/consent";

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

// Security headers — applied to every response before any route logic
app.use(securityHeaders);

// ⚠️  Stripe webhook MUST be registered before express.json() so it receives the raw body
app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// Body parsing — 100kb limit (was 10mb — prevents DoS via oversized payloads)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(session({
  name: 'ja_smart_profile_session',
  store: new SQLiteSessionStore(),
  secret: (getSecret('SESSION_SECRET') as string) || 'fallback-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  },
}));

// <api-registrations>
app.get("/api/health", healthGet);
app.post("/api/partner-enquiry", formSubmitLimiter, partnerEnquiryPost);
app.post("/api/report-issue", formSubmitLimiter, reportIssuePost);
app.post("/api/audit/consent", logConsent);
// </api-registrations>

// Global audit middleware — logs all mutating API calls
app.use('/api', auditMiddleware);

// Auth routes (OIDC)
app.get("/auth/login", authLimiter, customerLoginStart);
app.get("/auth/callback", authLimiter, customerLoginCallback);
app.get("/auth/logout", customerLogout);
// Admin login page — show error page if ?error= is present, otherwise start OIDC
app.get("/admin/login", authLimiter, (req, res, next) => {
  if (req.query.error) {
    // Render a plain error page — do NOT start a new OIDC flow
    // Sanitise the error param — only allow known error codes to prevent reflected XSS
    const ALLOWED_ERRORS = ['oidc_callback_failed', 'oidc_init_failed', 'access_denied', 'no_email'];
    const rawError = String(req.query.error);
    const error = ALLOWED_ERRORS.includes(rawError) ? rawError : 'unknown_error';
    const messages: Record<string, string> = {
      oidc_callback_failed: 'Authentication failed. The admin client secret may be misconfigured — check ADMIN_OIDC_CLIENT_SECRET in Settings → Secrets.',
      oidc_init_failed:     'Could not start the login flow. Check server logs.',
      access_denied:        'Your Microsoft account does not have the Administrator role on this application.',
      no_email:             'Your Microsoft account did not return an email address.',
      unknown_error:        'An unexpected error occurred during login.',
    };
    const msg = messages[error];
    return res.status(401).send(`<!DOCTYPE html><html><head><title>Admin Login Error</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#f1f5f9}
      .box{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem 2.5rem;max-width:480px;text-align:center}
      h2{color:#f87171;margin-top:0}p{color:#94a3b8;line-height:1.6}
      a{display:inline-block;margin-top:1.5rem;padding:.6rem 1.5rem;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:600}
      a:hover{background:#2563eb}code{background:#0f172a;padding:.2rem .4rem;border-radius:4px;font-size:.85em;color:#fbbf24}</style>
      </head><body><div class="box">
      <h2>Admin Login Failed</h2>
      <p>${msg}</p>
      <code>${error}</code>
      <a href="/admin/login">Try again</a>
      </div></body></html>`);
  }
  // No error — fall through to React SPA (the login page UI)
  return next();
});
// Dedicated server-only OIDC start — React Router never intercepts /admin/auth/...
app.get("/admin/auth/start", authLimiter, adminLoginStart);
app.get("/admin/auth/callback", adminLoginCallback);
app.get("/admin/logout", adminLogout);
app.get("/api/auth/me", requireAuth, authMe);
app.get("/api/auth/admin/me", adminMe);

// Profile routes
app.get("/api/profiles/me", requireAuth, getMyProfiles);
app.post("/api/profiles", requireAuth, createProfile);
app.put("/api/profiles/:id", requireAuth, updateProfile);
app.delete("/api/profiles/:id", requireAuth, deleteProfile);
app.get("/api/profiles/:username/public", getPublicProfile);  // legacy — kept for backward compat
app.get("/api/profiles/:prefix/:username/public", getPublicProfile);
app.get("/api/business/:bizSlug/:personSlug/public", getPublicBusinessProfile);
// PIN + feature toggles
app.get("/api/profiles/:id/pin/status", requireAuth, getProfilePinStatus);
app.post("/api/profiles/:id/pin", requireAuth, setProfilePin);
app.post("/api/profiles/:id/pin/verify", requireAuth, verifyProfilePin);
app.patch("/api/profiles/:id/messaging", requireAuth, toggleMessaging);
app.patch("/api/profiles/:id/enquiry", requireAuth, toggleEnquiry);

// Link routes
app.get("/api/links/:profileId", requireAuth, getLinks);
app.post("/api/links", requireAuth, createLink);
app.put("/api/links/reorder", requireAuth, reorderLinks);
app.put("/api/links/:id", requireAuth, updateLink);
app.delete("/api/links/:id", requireAuth, deleteLink);
app.post("/api/links/:id/click", publicApiLimiter, recordClick);

// QR routes
app.get("/api/qr/:profileId", requireAuth, getQRCode);

// Enquiry routes
app.post("/api/enquiries/:username", formSubmitLimiter, submitEnquiry);
app.get("/api/enquiries", requireAuth, getEnquiries);
app.put("/api/enquiries/:id/read", requireAuth, markRead);

// Analytics routes
app.post("/api/analytics/view/:username", analyticsLimiter, recordView);
app.get("/api/analytics/:profileId", requireAuth, getAnalytics);

// Themes & Plans
app.get("/api/themes", getThemes);
app.get("/api/plans", getPlans);

// User settings
app.put("/api/users/:id/settings", requireAuth, updateUserSettings);
app.delete("/api/users/:id", requireAuth, deleteAccount);

// Admin routes — all use requireAdminApi (JSON-only, reads adminUserId from session)
app.get("/api/admin/users", requireAdminApi, getUsers);
app.put("/api/admin/users/:id", requireAdminApi, updateUser);
app.delete("/api/admin/users/:id", requireAdminApi, deleteUser);
app.patch("/api/admin/users/:id/pause", requireAdminApi, pauseUser);
app.get("/api/admin/pause", requireAdminApi, getGlobalPauseState);
app.put("/api/admin/pause", requireAdminApi, setGlobalPauseState);
app.get("/api/admin/profiles", requireAdminApi, getProfiles);
app.delete("/api/admin/profiles/:id", requireAdminApi, deleteAdminProfile);
app.get("/api/admin/enquiries", requireAdminApi, getAllEnquiries);
app.get("/api/admin/analytics", requireAdminApi, getAdminAnalytics);
app.get("/api/admin/plans", requireAdminApi, getAdminPlans);
app.post("/api/admin/plans", requireAdminApi, createPlan);
app.put("/api/admin/plans/:id", requireAdminApi, updatePlan);
app.get("/api/admin/themes", requireAdminApi, getAdminThemes);
app.post("/api/admin/themes", requireAdminApi, createTheme);
app.put("/api/admin/themes/:id", requireAdminApi, updateTheme);
app.get("/api/admin/settings", requireAdminApi, getSettings);
app.put("/api/admin/settings", requireAdminApi, updateSettings);
app.get("/api/admin/branding", requireAdminApi, getBranding);
app.put("/api/admin/branding", requireAdminApi, updateBranding);
app.get("/api/admin/theme", requireAdminApi, getSiteTheme);
app.put("/api/admin/theme", requireAdminApi, updateSiteTheme);
// Public branding (no auth — used by frontend)
app.get("/api/branding", getPublicBranding);
app.get("/api/admin/audit", requireAdminApi, getAuditLog);
app.get("/api/admin/legal", requireAdminApi, getLegalPolicies);
app.put("/api/admin/legal/:key", requireAdminApi, updateLegalPolicy);
app.get("/api/legal/:key", getPublicPolicy);
app.post("/api/admin/test-notification", requireAdminApi, testNotification);

// Stripe & Billing admin routes
app.get("/api/admin/stripe/config", requireAdminApi, getStripeConfig);
app.put("/api/admin/stripe/config", requireAdminApi, updateStripeConfig);
app.get("/api/admin/subscriptions", requireAdminApi, getSubscriptions);
app.post("/api/admin/users/:userId/lifetime", requireAdminApi, grantLifetimeAccess);
app.delete("/api/admin/users/:userId/lifetime", requireAdminApi, revokeLifetimeAccess);
// Stripe product sync
app.post("/api/admin/stripe/sync-products", requireAdminApi, syncStripeProducts);
app.get("/api/admin/stripe/products", requireAdminApi, getStripeProducts);
// Partner enquiries
app.get("/api/admin/partner-enquiries", requireAdminApi, getPartnerEnquiries);
app.patch("/api/admin/partner-enquiries/:id/read", requireAdminApi, markPartnerEnquiryRead);
app.delete("/api/admin/partner-enquiries/:id", requireAdminApi, deletePartnerEnquiry);

// Support requests
app.post("/api/support/request", requireAuth, formSubmitLimiter, submitSupportRequest);
app.put("/api/account/update", requireAuth, accountUpdate);
app.get("/api/admin/support-requests", requireAdminApi, getSupportRequests);
app.patch("/api/admin/support-requests/:id", requireAdminApi, updateSupportRequest);
app.get("/api/admin/issue-reports", requireAdminApi, getIssueReports);
app.patch("/api/admin/issue-reports/:id", requireAdminApi, updateIssueReport);

// Card Messaging
app.post("/api/messages/:username", formSubmitLimiter, sendCardMessage);
app.get("/api/messages/thread/:threadId/status", getThreadStatus);
app.get("/api/messages/thread/:threadId/visitor", getVisitorThread);
app.post("/api/messages/thread/:threadId/visitor-reply", formSubmitLimiter, visitorReply);
app.get("/api/messages/threads", requireAuth, getMyThreads);
app.get("/api/messages/threads/:threadId", requireAuth, getThread);
app.post("/api/messages/threads/:threadId/reply", requireAuth, replyToThread);
app.patch("/api/messages/threads/:threadId/status", requireAuth, setThreadStatus);
app.patch("/api/messages/threads/:threadId/accept", requireAuth, acceptVisitor);
app.delete("/api/messages/threads/:threadId", requireAuth, deleteThread);
app.get("/api/admin/messages", requireAdminApi, adminGetAllThreads);

// Notifications
app.get("/api/notifications", requireAuth, getNotifications);
app.post("/api/notifications/read", requireAuth, markNotificationsRead);
app.delete("/api/notifications/:id", requireAuth, deleteNotification);

// Points & Rewards — customer
app.get("/api/points/summary", requireAuth, getMyPointsSummary);
app.get("/api/points/history", requireAuth, getMyPointsHistory);
app.get("/api/points/rewards", requireAuth, getRewards);
app.post("/api/points/redeem", requireAuth, redeemReward);
app.get("/api/points/redemptions", requireAuth, getMyRedemptions);
app.get("/api/points/referral", requireAuth, getMyReferral);

// Points & Rewards — admin
app.get("/api/admin/points/rules", requireAdminApi, adminGetRules);
app.put("/api/admin/points/rules/:id", requireAdminApi, adminUpdateRule);
app.get("/api/admin/points/rewards", requireAdminApi, adminGetRewards);
app.post("/api/admin/points/rewards", requireAdminApi, adminCreateReward);
app.put("/api/admin/points/rewards/:id", requireAdminApi, adminUpdateReward);
app.delete("/api/admin/points/rewards/:id", requireAdminApi, adminDeleteReward);
app.get("/api/admin/points/members", requireAdminApi, adminGetMemberBalances);
app.post("/api/admin/points/adjust", requireAdminApi, adminAdjustPoints);
app.get("/api/admin/points/redemptions", requireAdminApi, adminGetRedemptions);
app.patch("/api/admin/points/redemptions/:id", requireAdminApi, adminFulfillRedemption);
app.get("/api/admin/points/referrals", requireAdminApi, adminGetReferralActivity);

// Referral & Points
app.get("/api/referral/me", requireAuth, getReferralMe);
app.get("/api/admin/referrals", requireAdminApi, getAdminReferrals);

// Affiliate programme
app.post("/api/affiliate/apply", requireAuth, formSubmitLimiter, applyAffiliate);
app.get("/api/affiliate/me", requireAuth, getMyAffiliateStatus);
app.get("/api/admin/affiliates", requireAdminApi, adminListAffiliates);
app.post("/api/admin/affiliates/:id/approve", requireAdminApi, adminApproveAffiliate);
app.post("/api/admin/affiliates/:id/reject", requireAdminApi, adminRejectAffiliate);
app.put("/api/admin/affiliates/:id/commission", requireAdminApi, adminUpdateCommissionRate);
app.get("/api/admin/affiliate-commissions", requireAdminApi, adminListCommissions);
app.patch("/api/admin/affiliate-commissions/:id/paid", requireAdminApi, adminMarkCommissionPaid);

// Billing
app.post("/api/billing/checkout", requireAuth, createCheckoutSession);
app.post("/api/billing/cancel", requireAuth, cancelSubscription);

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
