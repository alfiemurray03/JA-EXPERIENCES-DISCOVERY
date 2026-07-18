import { accountPlanEntitlements, accountTypeFromProfile } from "../../_shared/account-entitlements.js";
import { normalisePlanCode } from "../../_shared/subscription-entitlements.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
const cleanEmail = (value) => clean(value, 254).toLowerCase();

async function prepareTables(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_output_access (
    id TEXT PRIMARY KEY,
    owner_email TEXT NOT NULL,
    output_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    permission TEXT NOT NULL DEFAULT 'view',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TEXT
  )`).run();
}

async function activePlan(DB, email, profile) {
  if (Number(profile?.admin_lifetime || 0) === 1) {
    return normalisePlanCode(profile?.admin_lifetime_plan_id) || "free";
  }
  const subscription = await DB.prepare(`SELECT plan_code, plan_name FROM stripe_subscriptions
    WHERE lower(customer_email)=lower(?) AND lower(COALESCE(status,'')) IN ('active','trialing')
    AND (current_period_end IS NULL OR current_period_end='' OR datetime(current_period_end)>datetime('now'))
    ORDER BY COALESCE(current_period_end, trial_end, subscription_start, updated_at) DESC LIMIT 1`)
    .bind(email).first().catch(() => null);
  return normalisePlanCode(subscription?.plan_code || subscription?.plan_name) || "free";
}

async function ownerAccess(DB, email) {
  const profile = await DB.prepare(`SELECT * FROM profiles WHERE lower(email)=lower(?)`).bind(email).first().catch(() => null);
  const accountType = accountTypeFromProfile(profile || {});
  const planCode = await activePlan(DB, email, profile || {});
  return { accountType, planCode, entitlements: accountPlanEntitlements(accountType, planCode) };
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: "Itinerary service is unavailable." }, 503);
  const email = cleanEmail(request.headers.get("x-ja-auth-email"));
  if (!email) return json({ success: false, error: "Please sign in to continue." }, 401);
  await prepareTables(env.DB);

  if (request.method !== "GET") return json({ success: false, error: "Method not allowed." }, 405);
  const context = await ownerAccess(env.DB, email);
  const owned = await env.DB.prepare(`SELECT a.*, o.title, o.builder_name FROM builder_output_access a
    LEFT JOIN builder_outputs o ON o.id=a.output_id
    WHERE lower(a.owner_email)=lower(?) AND a.status='active' ORDER BY a.created_at DESC`)
    .bind(email).all().catch(() => ({ results: [] }));
  const received = await env.DB.prepare(`SELECT a.*, o.title, o.builder_name FROM builder_output_access a
    LEFT JOIN builder_outputs o ON o.id=a.output_id
    WHERE lower(a.recipient_email)=lower(?) AND a.status='active' ORDER BY a.created_at DESC`)
    .bind(email).all().catch(() => ({ results: [] }));

  return json({ success: true, accountType: context.accountType, planCode: context.planCode,
    entitlements: context.entitlements, owned: owned.results || [], received: received.results || [] });
}
