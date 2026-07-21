import { accountPlanEntitlements, accountTypeFromProfile, enforceSharePermission } from "../../_shared/account-entitlements.js";
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
  await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_output_access_owner ON builder_output_access(owner_email, status)`).run().catch(() => {});
  await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_output_access_recipient ON builder_output_access(recipient_email, status)`).run().catch(() => {});
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

function parseOutput(value) {
  if (value && typeof value === "object") return value;
  try { return JSON.parse(String(value || "{}")); } catch { return {}; }
}

async function accessRecord(DB, id, email) {
  return DB.prepare(`SELECT a.*, o.email AS output_owner_email, o.title, o.builder_name,
    o.output_payload, o.created_at AS itinerary_created_at, o.updated_at AS itinerary_updated_at
    FROM builder_output_access a JOIN builder_outputs o ON o.id=a.output_id
    WHERE a.id=? AND a.status='active'
      AND (lower(a.owner_email)=lower(?) OR lower(a.recipient_email)=lower(?)) LIMIT 1`)
    .bind(id, email, email).first();
}

async function presentAccess(DB, row, currentEmail) {
  const context = await ownerAccess(DB, row.owner_email);
  const effectivePermission = enforceSharePermission(context.accountType, context.planCode, row.permission);
  const isOwner = cleanEmail(row.owner_email) === currentEmail;
  const isRecipient = cleanEmail(row.recipient_email) === currentEmail;
  const available = context.entitlements.canShareItineraries && effectivePermission !== "none";
  return {
    id: row.id,
    outputId: row.output_id,
    title: row.title || "Itinerary",
    builderName: row.builder_name || "Experience plan",
    ownerEmail: row.owner_email,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name || "",
    requestedPermission: row.permission,
    permission: effectivePermission,
    canEdit: available && (isOwner || (isRecipient && effectivePermission === "edit")),
    available,
    ownerAccountType: context.accountType,
    ownerPlanCode: context.planCode,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ success: false, error: "Itinerary service is unavailable." }, 503);
  const email = cleanEmail(request.headers.get("x-ja-auth-email"));
  if (!email) return json({ success: false, error: "Please sign in to continue." }, 401);
  await prepareTables(env.DB);

  if (request.method === "GET") {
    const url = new URL(request.url);
    const accessId = clean(url.searchParams.get("id"), 120);
    if (accessId) {
      const row = await accessRecord(env.DB, accessId, email);
      if (!row) return json({ success: false, error: "This itinerary is not available to your account." }, 404);
      const access = await presentAccess(env.DB, row, email);
      if (!access.available) return json({ success: false, error: "This itinerary access is no longer active." }, 403);
      return json({ success: true, access, itinerary: parseOutput(row.output_payload) });
    }

    const context = await ownerAccess(env.DB, email);
    const ownedRows = await env.DB.prepare(`SELECT a.*, o.title, o.builder_name FROM builder_output_access a
      LEFT JOIN builder_outputs o ON o.id=a.output_id
      WHERE lower(a.owner_email)=lower(?) AND a.status='active' ORDER BY a.created_at DESC`)
      .bind(email).all().catch(() => ({ results: [] }));
    const receivedRows = await env.DB.prepare(`SELECT a.*, o.title, o.builder_name FROM builder_output_access a
      LEFT JOIN builder_outputs o ON o.id=a.output_id
      WHERE lower(a.recipient_email)=lower(?) AND a.status='active' ORDER BY a.created_at DESC`)
      .bind(email).all().catch(() => ({ results: [] }));
    const owned = await Promise.all((ownedRows.results || []).map((row) => presentAccess(env.DB, row, email)));
    const received = await Promise.all((receivedRows.results || []).map((row) => presentAccess(env.DB, row, email)));

    return json({
      success: true,
      accountType: context.accountType,
      planCode: context.planCode,
      entitlements: context.entitlements,
      owned: owned.filter((item) => item.available),
      received: received.filter((item) => item.available)
    });
  }

  if (request.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405);
  const body = await request.json().catch(() => ({}));
  const action = clean(body.action, 40) || "create";

  if (action === "revoke") {
    const id = clean(body.id, 120);
    await env.DB.prepare(`UPDATE builder_output_access SET status='revoked', revoked_at=CURRENT_TIMESTAMP,
      updated_at=CURRENT_TIMESTAMP WHERE id=? AND lower(owner_email)=lower(?)`).bind(id, email).run();
    return json({ success: true, revoked: true });
  }

  if (action === "update") {
    const id = clean(body.id, 120);
    const row = await accessRecord(env.DB, id, email);
    if (!row) return json({ success: false, error: "This itinerary is not available to your account." }, 404);
    const access = await presentAccess(env.DB, row, email);
    if (!access.canEdit) return json({ success: false, error: "This itinerary is read-only for your account." }, 403);

    const output = parseOutput(row.output_payload);
    const title = clean(body.title || output.title || row.title, 160);
    const summary = clean(body.summary || output.summary, 4000);
    const notes = Array.isArray(body.notes)
      ? body.notes.slice(0, 100).map((note) => ({ label: clean(note?.label, 160), value: clean(note?.value, 5000) }))
      : Array.isArray(output.notes) ? output.notes : [];
    const updatedOutput = { ...output, title, summary, notes, collaborativeUpdatedAt: new Date().toISOString(), collaborativeUpdatedBy: email };
    await env.DB.prepare(`UPDATE builder_outputs SET title=?, output_payload=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(title, JSON.stringify(updatedOutput), row.output_id).run();
    return json({ success: true, saved: true, access, itinerary: updatedOutput });
  }

  const context = await ownerAccess(env.DB, email);
  if (!context.entitlements.canShareItineraries) {
    const error = "An active Explore, Plan, Complete or Together subscription is required to share an itinerary.";
    return json({ success: false, error, code: "ITINERARY_ACCESS_NOT_INCLUDED" }, 403);
  }

  const outputId = clean(body.outputId || body.output_id, 120);
  const recipientEmail = cleanEmail(body.recipientEmail || body.recipient_email);
  const recipientName = clean(body.recipientName || body.recipient_name, 160);
  if (!outputId) return json({ success: false, error: "Select an itinerary." }, 400);
  if (!recipientEmail || !recipientEmail.includes("@")) return json({ success: false, error: "Enter a valid recipient email address." }, 400);
  if (recipientEmail === email) return json({ success: false, error: "Use a different email address for the invited user." }, 400);

  const output = await env.DB.prepare(`SELECT id, title, builder_name FROM builder_outputs
    WHERE id=? AND lower(email)=lower(?) AND archived_at IS NULL`).bind(outputId, email).first();
  if (!output) return json({ success: false, error: "The selected itinerary could not be found." }, 404);

  const permission = enforceSharePermission(context.accountType, context.planCode, body.permission);
  const existing = await env.DB.prepare(`SELECT id FROM builder_output_access WHERE output_id=?
    AND lower(owner_email)=lower(?) AND lower(recipient_email)=lower(?) AND status='active' LIMIT 1`)
    .bind(outputId, email, recipientEmail).first();
  const id = existing?.id || crypto.randomUUID();
  if (existing) {
    await env.DB.prepare(`UPDATE builder_output_access SET recipient_name=?, permission=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(recipientName || null, permission, id).run();
  } else {
    await env.DB.prepare(`INSERT INTO builder_output_access
      (id, owner_email, output_id, recipient_email, recipient_name, permission) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, email, outputId, recipientEmail, recipientName || null, permission).run();
  }

  return json({
    success: true,
    access: { id, outputId, title: output.title, recipientEmail, recipientName, permission },
    permissionNotice: permission === "edit"
      ? "The invited Together Plan user may edit this itinerary after signing in."
      : "The invited user may view this itinerary after signing in, but cannot change it."
  });
}
