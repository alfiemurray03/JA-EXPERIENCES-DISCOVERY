import { getNativeSession } from "../../_shared/oidc.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function ensureTable(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS customer_preferences (
    email TEXT PRIMARY KEY, email_notifications INTEGER DEFAULT 1,
    marketing_emails INTEGER DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: "Preference service is not configured." }, 503);
  const session = await getNativeSession(request, env, "customer").catch(() => null);
  if (!session?.email) return json({ success: false, error: "Please sign in to continue.", code: "NOT_AUTHENTICATED" }, 401);
  const email = String(session.email).trim().toLowerCase();
  await ensureTable(env.DB);

  if (request.method === "GET") {
    const row = await env.DB.prepare("SELECT * FROM customer_preferences WHERE lower(email)=lower(?)").bind(email).first();
    return json({ success: true, preferences: {
      emailNotifications: row ? Number(row.email_notifications) === 1 : true,
      marketingEmails: row ? Number(row.marketing_emails) === 1 : false
    } });
  }

  if (request.method === "PATCH") {
    if (!sameOrigin(request)) return json({ success: false, error: "Cross-origin request blocked." }, 403);
    const body = await request.json().catch(() => ({}));
    const emailNotifications = typeof body.emailNotifications === "boolean" ? body.emailNotifications : true;
    const marketingEmails = typeof body.marketingEmails === "boolean" ? body.marketingEmails : false;
    await env.DB.prepare(`INSERT INTO customer_preferences (email,email_notifications,marketing_emails,updated_at)
      VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET
      email_notifications=excluded.email_notifications, marketing_emails=excluded.marketing_emails, updated_at=CURRENT_TIMESTAMP`)
      .bind(email, emailNotifications ? 1 : 0, marketingEmails ? 1 : 0).run();
    return json({ success: true, preferences: { emailNotifications, marketingEmails } });
  }

  return json({ success: false, error: "Method not allowed." }, 405);
}
