function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAccessIdentity(request) {
  return String(request.headers.get("x-ja-auth-email") || "").trim().toLowerCase();
}

function configuredAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk";
  return String(raw).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function isAdminRequest(request, env) {
  const email = getAccessIdentity(request);
  if (!email) return false;
  const configured = configuredAdmins(env).includes(email);
  if (!env.DB) return configured;

  try {
    const admin = await env.DB.prepare(`SELECT * FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first();
    const status = String(admin?.status || "Active").trim().toLowerCase();
    if (admin && ["blocked", "closed", "disabled", "inactive", "suspended"].includes(status)) return false;
    return configured || Boolean(admin);
  } catch {
    return configured;
  }
}

function pageHtml(settings, page) {
  const prefix = page === "launch-gateway" ? "launchgateway" : "maintenance";
  const mode = settings[`${prefix}_content_mode`] === "html" ? "html" : "plain";
  const content = String(settings[`${prefix}_content`] ?? "");

  if (mode === "html") return content;

  const title = prefix === "launchgateway" ? "Launch Gateway" : "Maintenance";
  const plainContent = escapeHtml(content).replace(/\r?\n/g, "<br>");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="icon" href="/assets/favicons/favicon.svg?v=20260704-1" type="image/svg+xml">
  <link rel="shortcut icon" href="/assets/favicons/favicon.ico?v=20260704-1" type="image/x-icon">
  <link rel="apple-touch-icon" href="/assets/favicons/apple-touch-icon.png?v=20260704-1">
  <link rel="manifest" href="/assets/favicons/site.webmanifest?v=20260704-1">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: clamp(1.25rem, 5vw, 4rem);
      background: #f6f7f9;
      color: #111827;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(760px, 100%);
      border: 1px solid #e2e6eb;
      border-radius: 14px;
      background: #ffffff;
      padding: clamp(1.5rem, 5vw, 3.5rem);
      box-shadow: 0 18px 50px rgba(16, 24, 40, .08);
      font-size: clamp(1rem, 2.5vw, 1.125rem);
      line-height: 1.75;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <main>${plainContent}</main>
</body>
</html>`;
}

async function getSiteSettings(DB) {
  try {
    const result = await DB.prepare(`
      SELECT key, value
      FROM site_settings
      WHERE key IN (
        'maintenance_enabled',
        'maintenance_content_mode',
        'maintenance_content',
        'launchgateway_enabled',
        'launchgateway_content_mode',
        'launchgateway_content',
        'site_theme_mode',
        'site_status'
      )
    `).all();

    const settings = {};

    for (const row of result.results || []) {
      settings[row.key] = row.value;
    }

    return settings;
  } catch {
    return {
      maintenance_enabled: "true",
      maintenance_content_mode: "plain",
      maintenance_content: "We are temporarily unavailable while we resolve a technical issue. Please check back shortly.",
      launchgateway_enabled: "false",
      launchgateway_content_mode: "plain",
      launchgateway_content: "",
      site_theme_mode: "dark",
      site_status: "maintenance"
    };
  }
}

function injectTheme(html, settings) {
  const mode = ["light", "dark", "system"].includes(settings.site_theme_mode) ? settings.site_theme_mode : "dark";
  const themeScript = `<script>document.documentElement.dataset.siteTheme=${JSON.stringify(mode)};</script>`;
  const themeStyle = `<style>
    html[data-site-theme="dark"] body {
      background-color: #0b1220;
      color-scheme: dark;
    }
    html[data-site-theme="dark"] .section,
    html[data-site-theme="dark"] .page-hero,
    html[data-site-theme="dark"] .info-card,
    html[data-site-theme="dark"] .card,
    html[data-site-theme="dark"] .panel,
    html[data-site-theme="dark"] .notice {
      background-color: #101827;
      color: #f8fafc;
      border-color: rgba(148, 163, 184, 0.24);
    }
    html[data-site-theme="dark"] p,
    html[data-site-theme="dark"] li,
    html[data-site-theme="dark"] .section-heading p {
      color: #bdd0ea;
    }
    html[data-site-theme="light"] body {
      color-scheme: light;
    }
    @media (prefers-color-scheme: dark) {
      html[data-site-theme="system"] body {
        background-color: #0b1220;
        color-scheme: dark;
      }
    }
  </style>`;

  if (html.includes("</head>")) return html.replace("</head>", `${themeScript}${themeStyle}</head>`);
  return `${themeScript}${themeStyle}${html}`;
}

function injectAccessibility(html) {
  const accessibilityStyle = `<style>
    :root {
      --accessibility-line-height: 1.6;
      --accessibility-letter-spacing: 0em;
    }
    html.accessibility-underline-links a { text-decoration: underline !important; text-underline-offset: .14em; }
    html.accessibility-dyslexia-font, html.accessibility-dyslexia-font body {
      font-family: "Arial", "Helvetica Neue", Helvetica, sans-serif !important;
    }
    html.accessibility-large-cursor, html.accessibility-large-cursor * { cursor: auto; }
    html.accessibility-reduced-motion *, html.accessibility-reduced-motion *::before, html.accessibility-reduced-motion *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
      scroll-behavior: auto !important;
    }
    body { line-height: var(--accessibility-line-height, 1.6); letter-spacing: var(--accessibility-letter-spacing, 0em); }
    .accessibility-button {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 9999;
      border: 0;
      border-radius: 999px;
      padding: .9rem 1.1rem;
      background: #0f172a;
      color: #fff;
      box-shadow: 0 14px 34px rgba(15, 23, 42, .2);
      font: inherit;
      font-weight: 800;
    }
    .accessibility-panel {
      position: fixed;
      right: 1rem;
      bottom: 4.75rem;
      z-index: 9999;
      width: min(92vw, 360px);
      background: #fff;
      color: #0f172a;
      border: 1px solid rgba(148, 163, 184, .4);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, .18);
      padding: 1rem;
    }
    .accessibility-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      margin-bottom: .85rem;
    }
    .accessibility-panel-head strong { font-size: 1rem; }
    .accessibility-close {
      border: 0;
      background: transparent;
      font-size: 1.4rem;
      line-height: 1;
      padding: .25rem .35rem;
      color: inherit;
    }
    .accessibility-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: .7rem;
    }
    .accessibility-grid label {
      display: grid;
      gap: .35rem;
      font-size: .92rem;
      font-weight: 700;
    }
    .accessibility-grid select,
    .toggle-row {
      min-height: 42px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, .4);
      padding: .55rem .7rem;
      background: #fff;
      color: inherit;
      font: inherit;
    }
    .toggle-row {
      display: flex !important;
      align-items: center;
      gap: .6rem;
    }
    .accessibility-actions { margin-top: .85rem; }
    .accessibility-reset {
      width: 100%;
      min-height: 42px;
      border: 0;
      border-radius: 10px;
      background: #e2e8f0;
      color: #0f172a;
      font: inherit;
      font-weight: 800;
    }
    @media (max-width: 560px) {
      .accessibility-button, .accessibility-panel { right: .75rem; left: .75rem; width: auto; }
      .accessibility-panel { bottom: 4.4rem; }
    }
  </style>`;
  const accessibilityScript = `<script defer src="/assets/js/accessibility.js"></script>`;
  let output = html;
  if (output.includes("</head>")) output = output.replace("</head>", `${accessibilityStyle}</head>`);
  if (output.includes("</body>")) output = output.replace("</body>", `${accessibilityScript}</body>`);
  else output += accessibilityScript;
  return output;
}

function injectNativeIdentity(html, identity) {
  if (!identity) return html;
  const metadata = `<meta name="ja-native-identity" content="${escapeHtml(JSON.stringify({
    email: identity.email || "",
    name: identity.name || "",
    realm: identity.realm || "",
    subject: identity.subject || "",
    tenantId: identity.tenantId || "",
    objectId: identity.objectId || "",
    givenName: identity.givenName || "",
    familyName: identity.familyName || "",
    preferredUsername: identity.preferredUsername || "",
    locale: identity.locale || "",
    jobTitle: identity.jobTitle || "",
    department: identity.department || "",
    companyName: identity.companyName || "",
    mobilePhone: identity.mobilePhone || "",
    businessPhone: identity.businessPhone || "",
    country: identity.country || "",
    preferredLanguage: identity.preferredLanguage || "",
    photoUrl: identity.photoUrl || ""
  }))}">`;
  if (html.includes("</head>")) return html.replace("</head>", `${metadata}</head>`);
  return `${metadata}${html}`;
}

function requestIdentitySnapshot(request) {
  const email = request.headers.get("x-ja-auth-email") || "";
  if (!email) return null;
  return {
    email,
    name: request.headers.get("x-ja-auth-name") || "",
    realm: request.headers.get("x-ja-auth-realm") || "",
    subject: request.headers.get("x-ja-auth-subject") || "",
    tenantId: request.headers.get("x-ja-auth-tenant") || "",
    objectId: request.headers.get("x-ja-auth-object-id") || "",
    givenName: request.headers.get("x-ja-auth-given-name") || "",
    familyName: request.headers.get("x-ja-auth-family-name") || "",
    preferredUsername: request.headers.get("x-ja-auth-preferred-username") || "",
    locale: request.headers.get("x-ja-auth-locale") || "",
    jobTitle: request.headers.get("x-ja-auth-job-title") || "",
    department: request.headers.get("x-ja-auth-department") || "",
    companyName: request.headers.get("x-ja-auth-company-name") || "",
    mobilePhone: request.headers.get("x-ja-auth-mobile-phone") || "",
    businessPhone: request.headers.get("x-ja-auth-business-phone") || "",
    country: request.headers.get("x-ja-auth-country") || "",
    preferredLanguage: request.headers.get("x-ja-auth-preferred-language") || "",
    photoUrl: request.headers.get("x-ja-auth-photo-url") || ""
  };
}

function hasFileExtension(path) {
  return /\/[^/]+\.[a-z0-9]+$/i.test(path);
}

function isHtmlNavigationRequest(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  const destination = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
  return destination === "document" || accept.includes("text/html") || accept.includes("*/*");
}

function isPublicDocumentPath(path) {
  if (path === "/" || path === "/index.html") return true;
  if (path === "/ja-group-services-id" || path === "/ja-group-services-id/") return true;
  if (path === "/legal/terms" || path === "/legal/terms/") return true;
  if (path === "/legal/privacy" || path === "/legal/privacy/") return true;
  if (path === "/legal/cookies" || path === "/legal/cookies/") return true;
  if (path === "/account" || path === "/account/") return true;
  if (path === "/admin" || path === "/admin/") return true;
  if (path === "/signed-out" || path.startsWith("/signed-out/")) return true;
  return false;
}

function isCustomerPortalPath(path) {
  return ["/dashboard", "/documents", "/builders", "/settings"].some(
    (prefix) => path === prefix || path === `${prefix}/` || path.startsWith(`${prefix}/`)
  );
}

function isPublicPlanningPath(path) {
  const exact = new Set([
    "/", "/index.html", "/pricing", "/activities", "/experiences", "/headout",
    "/getyourguide", "/booking-partners", "/how-it-works", "/plan-your-trip",
    "/planning-services", "/accommodation", "/transfers", "/local-transport",
    "/travel-documentation-support", "/accessibility-support",
    "/selected-partner-hotels", "/budget-experiences", "/family-experiences",
    "/couples-experiences", "/about", "/faqs"
  ]);
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return exact.has(normalized) || normalized === "/destinations" || normalized.startsWith("/destinations/");
}

function shouldGateCustomerDocument(request, path, publicAuthPath) {
  if (publicAuthPath) return false;
  if (path.startsWith("/account/") || path === "/account/dashboard") {
    if (path.startsWith("/assets/") || path.startsWith("/api/") || path === "/favicon.ico" || path === "/robots.txt" || path === "/sitemap.xml" || hasFileExtension(path)) {
      return false;
    }
    const accept = (request.headers.get("Accept") || "").toLowerCase();
    const destination = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
    return destination === "document" || accept.includes("text/html") || accept.includes("*/*");
  }
  return false;
}

async function getAuthenticatedAdminIdentity(request, env) {
  try {
    const identity = await getNativeSession(request, env, "admin");
    if (!identity) return null;
    const authenticatedRequest = withIdentity(request.clone(), identity);
    if (!(await isAdminRequest(authenticatedRequest, env))) return null;
    let role = "";
    let permissions = [];
    if (env.DB) {
      const admin = await env.DB.prepare(`SELECT role, permissions FROM admin_users WHERE lower(email) = lower(?)`)
        .bind(identity.email)
        .first()
        .catch(() => null);
      role = String(admin?.role || "");
      permissions = Array.isArray(admin?.permissions) ? admin.permissions : [];
    }
    return { identity, role, permissions };
  } catch (error) {
    console.error(JSON.stringify({
      event: "admin_bypass_lookup_error",
      message: error instanceof Error ? error.message : "Unknown admin bypass error"
    }));
    return null;
  }
}

export async function onRequest(context) {
  const { env, next } = context;
  let request = withIdentity(context.request, null);
  const url = new URL(request.url);
  const path = url.pathname;

  const adminIdentity = await getAuthenticatedAdminIdentity(request, env);

  if (adminIdentity && (path.startsWith("/coming-soon") || path.startsWith("/maintenance"))) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Cache-Control": "no-store"
      }
    });
  }

  const publicAuthPath = new Set([
    "/admin/login", "/admin/login/", "/admin/auth/callback", "/admin/auth/callback/", "/admin/logout", "/admin/logout/",
    "/auth/callback", "/auth/callback/",
    "/account/login", "/account/login/", "/account/auth/callback", "/account/auth/callback/", "/account/logout", "/account/logout/"
  ]).has(path);

  let settings = null;

  // Enforce site status gates first for non-administrators, excluding absolute system bypasses
  if (!adminIdentity) {
    const isStatusBypass =
      path === "/coming-soon" ||
      path === "/coming-soon/" ||
      path.startsWith("/coming-soon/") ||
      path === "/maintenance" ||
      path === "/maintenance/" ||
      path.startsWith("/maintenance/") ||
      path === "/favicon.ico" ||
      path === "/robots.txt" ||
      path === "/sitemap.xml" ||
      path.startsWith("/assets/") ||
      hasFileExtension(path) ||
      path.startsWith("/cdn-cgi/") ||
      path === "/plans-data" ||
      path === "/plans-data/" ||
      path === "/create-checkout-session" ||
      path === "/create-checkout-session/" ||
      path === "/payment-success" ||
      path === "/payment-success/" ||
      path === "/api" ||
      path.startsWith("/api/") ||
      path === "/health" ||
      path === "/health/" ||
      path.startsWith("/health/") ||
      path === "/stripe-webhook" ||
      path === "/stripe-webhook/" ||
      path === "/status" ||
      path.startsWith("/status/") ||
      path === "/admin" ||
      path === "/admin/" ||
      path.startsWith("/admin/") ||
      publicAuthPath;

    if (!isStatusBypass && env.DB) {
      settings = await getSiteSettings(env.DB);
      if (settings.site_status === "maintenance") {
        return new Response(pageHtml(settings, "maintenance"), {
          status: 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "Retry-After": "3600"
          }
        });
      }

      if (settings.site_status === "coming_soon") {
        if (isHtmlNavigationRequest(request)) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/coming-soon/",
              "Cache-Control": "no-store"
            }
          });
        }
        return new Response(JSON.stringify({ error: "Site is in coming soon mode." }), {
          status: 503,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      }
    }
  }

  const rootLanding = path === "/admin" || path === "/admin/" || path === "/account" || path === "/account/";
  const landingRealm = path.startsWith("/admin") ? "admin" : path.startsWith("/account") ? "customer" : "";

  // Admin screens are client-side routes. Serve the application document first and
  // let /api/admin/auth/me perform the authoritative session check inside React.
  // Eagerly opening the D1 session in middleware made a transient lookup failure turn
  // an otherwise healthy admin page into an unstyled plain-text 503 response.
  const adminDocumentRequest = (request.method === "GET" || request.method === "HEAD")
    && path.startsWith("/admin/")
    && !publicAuthPath
    && ((request.headers.get("Sec-Fetch-Dest") || "").toLowerCase() === "document"
      || (request.headers.get("Accept") || "").toLowerCase().includes("text/html"));

  if (adminDocumentRequest) {
    const retiredTransferredRoutes = new Set([
      "/admin/affiliate", "/admin/resellers", "/admin/signing", "/admin/pages",
      "/admin/portal-nav", "/admin/stripe-diagnostics", "/admin/test-tools",
      "/admin/password-resets", "/admin/legal"
    ]);
    const normalisedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    if (retiredTransferredRoutes.has(normalisedPath)) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin/dashboard", "Cache-Control": "no-store" }
      });
    }

    const response = await next(request);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Length");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const realm = !rootLanding && (path.startsWith("/admin/") || path === "/admin/dashboard")
    ? "admin"
    : !rootLanding && (path.startsWith("/account/") || path === "/account/dashboard" || isCustomerPortalPath(path) || shouldGateCustomerDocument(request, path, publicAuthPath))
      ? "customer"
      : "";

  if (rootLanding && landingRealm) {
    try {
      const landingIdentity = await getNativeSession(request, env, landingRealm);
      if (landingIdentity) {
        const headers = new Headers({
          Location: landingRealm === "admin" ? "/admin/dashboard/" : "/account/dashboard/",
          "Cache-Control": "no-store"
        });
        return new Response(null, { status: 302, headers });
      }
    } catch (error) {
      console.error(JSON.stringify({
        event: "native_oidc_session_validation_error",
        realm: landingRealm,
        message: error instanceof Error ? error.message : "Unknown session error"
      }));
      return new Response("Authentication is temporarily unavailable.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
  }

  if (realm && !publicAuthPath) {
    let identity;
    try {
      identity = await getNativeSession(request, env, realm);
    } catch (error) {
      console.error(JSON.stringify({
        event: "native_oidc_session_validation_error",
        realm,
        message: error instanceof Error ? error.message : "Unknown session error"
      }));
      return new Response("Authentication is temporarily unavailable.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
    if (!identity) {
      const expectsJson = (request.headers.get("Accept") || "").toLowerCase().includes("application/json");
      if (expectsJson) {
        return new Response(JSON.stringify({ error: "Not signed in." }), {
          status: 401,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      }
      return loginRedirect(request, realm);
    }
    if (!assertSameOrigin(request)) {
      return new Response(JSON.stringify({ error: "Invalid request origin." }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
    request = withIdentity(request, identity);

    if (realm === "admin" && !(await isAdminRequest(request, env))) {
      return new Response("Forbidden", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
      });
    }

    if (realm === "customer" && env.DB) {
      try {
        const profile = await env.DB.prepare(`SELECT admin_customer_status FROM profiles WHERE lower(email) = lower(?)`)
          .bind(identity.email).first();
        const status = String(profile?.admin_customer_status || "").trim().toLowerCase();
        if (["blocked", "closed", "disabled", "suspended"].includes(status)) {
          return new Response("Your account is currently suspended. Please contact JA Plan Studio for assistance.", {
            status: 403,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
          });
        }
      } catch {
        // Profile provisioning may not have occurred yet; authenticated first visits remain valid.
      }
    }
  }

  if (path === "/admin/dashboard" || path === "/admin/dashboard/" || path.startsWith("/admin/index")) {
    if (!(await isAdminRequest(request, env))) {
      return new Response("Forbidden", {
        status: 403,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    const response = await next(request);
    if (!(response.headers.get("Content-Type") || "").includes("text/html")) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Length");
    // The JA Plan Studio administration portal is intentionally light-only.
    // Do not inject the public website's saved theme into the admin document.
    return new Response(injectAccessibility(injectNativeIdentity(await response.text(), requestIdentitySnapshot(request))), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const adminSessionCookieDetected = (request.headers.get("Cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .some((part) => part.startsWith("ja_admin_session="));
  if (adminSessionCookieDetected) {
    console.log(JSON.stringify({ event: "admin_bypass_diag", stage: "admin_session_cookie_detected", path }));
  }

  const bypass =
    publicAuthPath ||
    isPublicPlanningPath(path) ||
    path === "/admin" ||
    path === "/admin/" ||
    path.startsWith("/admin/") ||
    path === "/account/logout" ||
    path === "/account/logout/" ||
    path === "/account" ||
    path === "/account/" ||
    path.startsWith("/account/") ||
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/sign-in" ||
    path.startsWith("/sign-in/") ||
    path.startsWith("/legal/") ||
    path === "/accessibility-support" ||
    path === "/accessibility-support/" ||
    path === "/status" ||
    path.startsWith("/status/") ||
    path === "/api/status" ||
    path.startsWith("/api/status/") ||
    path === "/api/enquiries" ||
    path.startsWith("/api/enquiries/") ||
    path === "/plans-data" ||
    path === "/plans-data/" ||
    path === "/create-checkout-session" ||
    path === "/create-checkout-session/" ||
    path === "/payment-success" ||
    path === "/payment-success/" ||
    path === "/api" ||
    path.startsWith("/api/") ||
    path === "/health" ||
    path === "/health/" ||
    path.startsWith("/health/") ||
    path === "/stripe-webhook" ||
    path === "/stripe-webhook/" ||
    path.startsWith("/cdn-cgi") ||
    path.startsWith("/assets") ||
    hasFileExtension(path) ||
    path === "/signed-out" ||
    path.startsWith("/signed-out/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/coming-soon" ||
    path === "/coming-soon/" ||
    path.startsWith("/coming-soon/") ||
    path === "/maintenance" ||
    path === "/maintenance/" ||
    path.startsWith("/maintenance/") ||
    path === "/api/coming-soon-config" ||
    path === "/api/site-status";

  if (bypass) {
    return next(request);
  }

  if (adminIdentity) {
    console.log(JSON.stringify({
      event: "admin_bypass_diag",
      stage: "admin_identity_resolved",
      path,
      email: adminIdentity.identity?.email || "",
      role: adminIdentity.role || "",
      permissions: adminIdentity.permissions || []
    }));
    return next(request);
  }

  if (!settings) {
    settings = await getSiteSettings(env.DB);
  }

  const response = await next(request);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.delete("Content-Length");
  return new Response(injectAccessibility(injectNativeIdentity(injectTheme(html, settings), requestIdentitySnapshot(request))), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
import {
  assertSameOrigin,
  getNativeSession,
  loginRedirect,
  withIdentity
} from "./_shared/oidc.js";
