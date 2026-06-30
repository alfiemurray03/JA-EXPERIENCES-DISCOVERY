function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function decodeJwtPayload(jwt) {
  try {
    if (!jwt || !jwt.includes(".")) return {};
    const payload = jwt.split(".")[1];
    const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalised.padEnd(normalised.length + ((4 - normalised.length % 4) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

function getAccessIdentity(request) {
  const emailHeader =
    request.headers.get("cf-access-authenticated-user-email") ||
    request.headers.get("CF-Access-Authenticated-User-Email") ||
    "";

  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    request.headers.get("CF-Access-Jwt-Assertion") ||
    "";

  const tokenIdentity = decodeJwtPayload(jwt);
  const email = emailHeader || tokenIdentity.email || tokenIdentity.user_email || tokenIdentity.username || "";

  return String(email || "").trim().toLowerCase();
}

function configuredAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk";
  return String(raw).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function isAdminRequest(request, env) {
  const email = getAccessIdentity(request);
  if (!email) return false;
  if (configuredAdmins(env).includes(email)) return true;
  if (!env.DB) return false;

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

    const admin = await env.DB.prepare(`SELECT email FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first();
    return Boolean(admin);
  } catch {
    return false;
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

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/admin" || path === "/admin/" || path.startsWith("/admin/index")) {
    if (!(await isAdminRequest(request, env))) {
      return new Response("Forbidden", {
        status: 403,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    const response = await next();
    if (!env.DB || !(response.headers.get("Content-Type") || "").includes("text/html")) return response;
    const settings = await getSiteSettings(env.DB);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("Content-Length");
    return new Response(injectAccessibility(injectTheme(await response.text(), settings)), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const bypass =
    path.startsWith("/admin") ||
    path === "/account/logout" ||
    path === "/account/logout/" ||
    path === "/status" ||
    path.startsWith("/status/") ||
    path === "/api/status" ||
    path.startsWith("/api/status/") ||
    path.startsWith("/cdn-cgi") ||
    path.startsWith("/assets") ||
    path === "/signed-out" ||
    path.startsWith("/signed-out/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml";

  if (bypass || !env.DB) {
    return next();
  }

  const settings = await getSiteSettings(env.DB);
  const previewBlocked = url.searchParams.get("preview_public_block") === "1";
  const adminBypass = !previewBlocked && await hasAdminBypass(request, env);

  if (adminBypass) {
    return next();
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

  const response = await next();
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.delete("Content-Length");
  return new Response(injectAccessibility(injectTheme(html, settings)), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
