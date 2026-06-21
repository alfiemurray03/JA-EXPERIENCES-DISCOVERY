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

function pageHtml(settings, mode) {
  const isComingSoon = mode === "coming-soon";

  const title = isComingSoon
    ? settings.comingsoon_title || "JA Experiences & Discovery is coming soon."
    : settings.maintenance_title || "We’ll be back shortly.";

  const message = isComingSoon
    ? settings.comingsoon_message || "Our new experiences and discovery service is being prepared. Please check back soon."
    : settings.maintenance_message || "JA Experiences & Discovery is temporarily unavailable while essential maintenance is carried out.";

  const eta = isComingSoon
    ? settings.comingsoon_eta || ""
    : settings.maintenance_eta || "";

  const kicker = isComingSoon ? "Pre-launch" : "Maintenance";
  const status = isComingSoon ? "Coming soon" : "Maintenance mode";

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(status)} | JA Experiences & Discovery</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    :root {
      --navy: #071f36;
      --ink: #08233c;
      --muted: #526276;
      --orange: #f26a2e;
      --cream: #f7f4ed;
      --line: #dde7f0;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 20% 15%, rgba(242,106,46,0.22), transparent 34%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12), transparent 32%),
        linear-gradient(135deg, #071f36, #041424);
      color: #ffffff;
      font-family: Inter, Arial, sans-serif;
      padding: 1.5rem;
    }

    .wrap {
      width: min(1040px, 100%);
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 1.2rem;
      align-items: stretch;
    }

    .card,
    .side {
      border-radius: 34px;
      box-shadow: 0 30px 90px rgba(0,0,0,0.32);
    }

    .card {
      background: #ffffff;
      color: var(--ink);
      padding: clamp(2rem, 6vw, 4.4rem);
    }

    .side {
      background: rgba(255,255,255,0.10);
      border: 1px solid rgba(255,255,255,0.16);
      backdrop-filter: blur(18px);
      padding: clamp(1.4rem, 4vw, 2rem);
      display: grid;
      align-content: end;
      min-height: 420px;
    }

    .logo {
      width: 62px;
      height: 62px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--orange), #ff8f5d);
      display: grid;
      place-items: center;
      color: #ffffff;
      font-weight: 950;
      margin-bottom: 1.5rem;
      box-shadow: 0 18px 38px rgba(242,106,46,0.28);
    }

    .kicker {
      color: var(--orange);
      font-size: 0.78rem;
      font-weight: 950;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      margin-bottom: 0.85rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.6rem, 7vw, 5.2rem);
      line-height: 0.9;
      letter-spacing: -0.075em;
    }

    p {
      margin: 1.2rem 0 0;
      color: var(--muted);
      font-size: 1.08rem;
      line-height: 1.7;
      max-width: 680px;
    }

    .eta {
      margin-top: 1.45rem;
      padding: 1rem;
      border-radius: 18px;
      background: #fff7ed;
      color: #7c2d12;
      font-weight: 850;
    }

    .side h2 {
      margin: 0;
      font-size: clamp(1.9rem, 4vw, 3rem);
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    .side p {
      color: rgba(255,255,255,0.72);
    }

    .pill {
      display: inline-flex;
      width: fit-content;
      margin-bottom: 1rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      color: #ffffff;
      padding: 0.55rem 0.8rem;
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    @media (max-width: 850px) {
      .wrap {
        grid-template-columns: 1fr;
      }

      .side {
        min-height: auto;
      }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card">
      <div class="logo">JA</div>
      <div class="kicker">${escapeHtml(kicker)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      ${eta ? `<div class="eta">Estimated launch / return: ${escapeHtml(eta)}</div>` : ""}
    </section>

    <aside class="side">
      <div>
        <span class="pill">JA Experiences & Discovery</span>
        <h2>Curated discovery, planning and experience guidance.</h2>
        <p>Part of JA Group Services Ltd.</p>
      </div>
    </aside>
  </main>
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
        'maintenance_title',
        'maintenance_message',
        'maintenance_eta',
        'comingsoon_enabled',
        'comingsoon_title',
        'comingsoon_message',
        'comingsoon_eta',
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
      comingsoon_enabled: "false",
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
    return new Response(injectTheme(await response.text(), settings), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const bypass =
    path.startsWith("/admin") ||
    path.startsWith("/cdn-cgi") ||
    path.startsWith("/assets") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml";

  if (bypass || !env.DB) {
    return next();
  }

  const settings = await getSiteSettings(env.DB);

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
  return new Response(injectTheme(html, settings), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
