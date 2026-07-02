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
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS admin_users (
        email TEXT PRIMARY KEY,
        name TEXT,
        source TEXT DEFAULT 'portal',
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const admin = await env.DB.prepare(`SELECT * FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first();
    const status = String(admin?.status || "Active").trim().toLowerCase();
    if (admin && ["blocked", "closed", "disabled", "inactive", "suspended"].includes(status)) return false;
    return configured || Boolean(admin);
  } catch {
    return configured;
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function auditBypass(DB, row, action, summary, path) {
  try {
    await DB.prepare(`
      INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      row.admin_email || "admin-bypass",
      action,
      "admin_bypass_sessions",
      row.token_hash.slice(0, 12),
      summary,
      JSON.stringify({ path })
    ).run();
  } catch {
    // Audit failure must not block a valid admin bypass cookie.
  }
}

async function hasAdminBypass(request, env) {
  if (!env.DB) return false;
  const token = (request.headers.get("Cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ja_admin_bypass="))
    ?.split("=")[1] || "";
  if (!token) return false;

  try {
    const tokenHash = await sha256(token);
    const row = await env.DB.prepare(`
      SELECT token_hash, admin_email, last_used_at FROM admin_bypass_sessions
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND datetime(expires_at) > datetime('now')
    `).bind(tokenHash).first();
    if (!row) {
      const expired = await env.DB.prepare(`
        SELECT token_hash, admin_email FROM admin_bypass_sessions
        WHERE token_hash = ?
          AND revoked_at IS NULL
          AND datetime(expires_at) <= datetime('now')
      `).bind(tokenHash).first();
      if (expired) {
        await env.DB.prepare(`UPDATE admin_bypass_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(tokenHash).run();
        await auditBypass(env.DB, expired, "admin_bypass_expired", "Admin live-site bypass session expired.", new URL(request.url).pathname);
      }
      return false;
    }
    await env.DB.prepare(`UPDATE admin_bypass_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(tokenHash).run();
    if (!row.last_used_at) {
      await auditBypass(env.DB, row, "admin_bypass_used", "Used admin live-site bypass session.", new URL(request.url).pathname);
    }
    return true;
  } catch {
    return false;
  }
}

function pageHtml(settings, page) {
  const prefix = page === "coming-soon" ? "comingsoon" : "maintenance";
  const mode = settings[`${prefix}_content_mode`] === "html" ? "html" : "plain";
  const content = String(settings[`${prefix}_content`] ?? "");

  if (mode === "html") return content;

  const title = prefix === "comingsoon" ? "Coming Soon" : "Maintenance";
  const plainContent = escapeHtml(content).replace(/\r?\n/g, "<br>");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="robots" content="noindex,nofollow">
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

async function migrateStatusPageContent(DB) {
  for (const prefix of ["comingsoon", "maintenance"]) {
    await DB.prepare(`
      INSERT OR IGNORE INTO site_settings (key, value, updated_at)
      VALUES (
        ?,
        COALESCE((SELECT value FROM site_settings WHERE key = ?), ''),
        CURRENT_TIMESTAMP
      )
    `).bind(`${prefix}_content`, `${prefix}_message`).run();
  }
}

async function getSiteSettings(DB) {
  try {
    await migrateStatusPageContent(DB);
    const result = await DB.prepare(`
      SELECT key, value
      FROM site_settings
      WHERE key IN (
        'maintenance_enabled',
        'maintenance_content_mode',
        'maintenance_content',
        'comingsoon_enabled',
        'comingsoon_content_mode',
        'comingsoon_content',
        'site_theme_mode'
      )
    `).all();

    const settings = {};

    for (const row of result.results || []) {
      settings[row.key] = row.value;
    }

    return settings;
  } catch {
    return {
      maintenance_enabled: "false",
      maintenance_content_mode: "plain",
      maintenance_content: "",
      comingsoon_enabled: "false",
      comingsoon_content_mode: "plain",
      comingsoon_content: "",
      site_theme_mode: "dark"
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
  const script = `<script>window.__JA_NATIVE_IDENTITY__=${JSON.stringify({
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
  })}</script>`;
  if (html.includes("</head>")) return html.replace("</head>", `${script}</head>`);
  return `${script}${html}`;
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

export async function onRequest(context) {
  const { env, next } = context;
  let request = withIdentity(context.request, null);
  const url = new URL(request.url);
  const path = url.pathname;
  const rootLanding = path === "/admin" || path === "/admin/" || path === "/account" || path === "/account/";
  const landingRealm = path.startsWith("/admin") ? "admin" : path.startsWith("/account") ? "customer" : "";
  const publicAuthPath = new Set([
    "/admin/login", "/admin/login/", "/admin/auth/callback", "/admin/auth/callback/", "/admin/logout", "/admin/logout/",
    "/account/login", "/account/login/", "/account/auth/callback", "/account/auth/callback/", "/account/logout", "/account/logout/"
  ]).has(path);
  const realm = path.startsWith("/admin/") || path === "/admin/dashboard"
    ? "admin"
    : path.startsWith("/account/") || path === "/account/dashboard"
      ? "customer"
      : "";

  if (realm === "admin" && !publicAuthPath) {
    request = withIdentity(request, null);
  }

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
    if (!identity) return loginRedirect(request, realm);
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
          return new Response("This customer account is not active.", {
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
    if (!env.DB || !(response.headers.get("Content-Type") || "").includes("text/html")) return response;
    const settings = await getSiteSettings(env.DB);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Length");
    return new Response(injectAccessibility(injectNativeIdentity(injectTheme(await response.text(), settings), requestIdentitySnapshot(request))), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const bypass =
    path === "/admin" ||
    path === "/admin/" ||
    path.startsWith("/admin/dashboard") ||
    path === "/account/logout" ||
    path === "/account/logout/" ||
    path === "/account" ||
    path === "/account/" ||
    path === "/status" ||
    path.startsWith("/status/") ||
    path === "/api/status" ||
    path.startsWith("/api/status/") ||
    path === "/api/enquiries" ||
    path.startsWith("/api/enquiries/") ||
    path.startsWith("/cdn-cgi") ||
    path.startsWith("/assets") ||
    path === "/signed-out" ||
    path.startsWith("/signed-out/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml";

  if (bypass || !env.DB) {
    return next(request);
  }

  const settings = await getSiteSettings(env.DB);
  const previewBlocked = url.searchParams.get("preview_public_block") === "1";
  const adminBypass = !previewBlocked && await hasAdminBypass(request, env);

  if (adminBypass) {
    return next(request);
  }

  if (settings.maintenance_enabled === "true") {
    return new Response(pageHtml(settings, "maintenance"), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "3600"
      }
    });
  }

  if (settings.comingsoon_enabled === "true") {
    return new Response(pageHtml(settings, "coming-soon"), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
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
