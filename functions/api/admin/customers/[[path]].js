import { getNativeSession, assertSameOrigin } from "../../../_shared/oidc.js";
import { accountPlanEntitlements, accountTypeFromProfile, normaliseAccountType } from "../../../_shared/account-entitlements.js";
import { normalisePlanCode } from "../../../_shared/subscription-entitlements.js";

const LIVE_PLANS = new Set(["free", "personal", "standard", "professional", "org_starter"]);

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
});

function pathValue(context) {
  const value = context.params?.path;
  const raw = Array.isArray(value) ? value.join("/") : String(value || "");
  return decodeURIComponent(raw).trim().toLowerCase();
}

async function bodyOf(request) {
  try { return await request.json(); } catch { return {}; }
}

async function all(DB, sql, bindings = []) {
  const result = await DB.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function tableExists(DB, table) {
  const row = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .bind(table).first().catch(() => null);
  return Boolean(row?.name);
}

async function tableHasColumn(DB, table, column) {
  const rows = await all(DB, `PRAGMA table_info(${table})`).catch(() => []);
  return rows.some((row) => row.name === column);
}

async function safeAlter(DB, sql) {
  try { await DB.prepare(sql).run(); } catch (error) {
    if (!String(error?.message || error).toLowerCase().includes("duplicate column")) throw error;
  }
}

async function prepareSchema(DB) {
  await safeAlter(DB, "ALTER TABLE profiles ADD COLUMN account_type TEXT");
  await safeAlter(DB, "ALTER TABLE profiles ADD COLUMN account_type_selected_at TEXT");
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

function configuredAdmins(env) {
  return String(env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function authorised(DB, identity, env) {
  if (configuredAdmins(env).includes(String(identity.email || "").toLowerCase())) return true;
  if (!(await tableExists(DB, "admin_users"))) return false;
  const row = await DB.prepare("SELECT status FROM admin_users WHERE lower(email)=lower(?)")
    .bind(identity.email).first().catch(() => null);
  return Boolean(row) && !["blocked", "closed", "disabled", "inactive", "suspended"]
    .includes(String(row.status || "active").toLowerCase());
}

function splitName(name, email) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || String(email || "").split("@")[0] || "Customer",
    lastName: parts.slice(1).join(" ")
  };
}

function accountConfirmed(profile) {
  return Boolean(profile.account_type_selected_at)
    && ["individual", "organisation"].includes(String(profile.account_type || "").toLowerCase());
}

function subscriptionMap(rows) {
  const map = new Map();
  for (const row of rows) {
    const email = String(row.customer_email || "").toLowerCase();
    if (email && !map.has(email)) map.set(email, row);
  }
  return map;
}

function activePlan(profile, subscriptions) {
  if (Number(profile.admin_lifetime || 0) === 1) {
    return normalisePlanCode(profile.admin_lifetime_plan_id) || "free";
  }
  const subscription = subscriptions.get(String(profile.email || "").toLowerCase());
  return normalisePlanCode(subscription?.plan_code || subscription?.plan_name || profile.assigned_plan) || "free";
}

function sharingLabel(entitlements) {
  if (entitlements.maximumSharePermission === "edit") return "Read-only or edit";
  if (entitlements.maximumSharePermission === "view") return "Read-only";
  return "Private";
}

function statusValue(value) {
  const normalised = String(value || "active").trim().toLowerCase();
  return ["suspended", "blocked", "closed", "disabled"].includes(normalised) ? "suspended" : "active";
}

function customerFrom(profile, subscriptions, invitationCount = 0) {
  const name = profile.display_name || profile.verified_name || profile.customer_name || profile.email;
  const names = splitName(name, profile.email);
  const accountType = accountTypeFromProfile(profile);
  const plan = activePlan(profile, subscriptions);
  const entitlements = accountPlanEntitlements(accountType, plan);
  return {
    id: profile.customer_id || profile.email,
    email: profile.email,
    displayName: name,
    firstName: names.firstName,
    lastName: names.lastName,
    company: profile.company || profile.microsoft_company_name || null,
    accountType,
    accountTypeConfirmed: accountConfirmed(profile),
    usageType: accountType,
    plan,
    role: profile.app_role || "user",
    accountStatus: statusValue(profile.admin_customer_status),
    isVerified: Boolean(profile.verified_name || profile.display_name),
    planIsLifetime: Boolean(Number(profile.admin_lifetime || 0)),
    planExpiresAt: profile.plan_expires_at || profile.trial_end || null,
    subscriptionStatus: subscriptions.get(String(profile.email || "").toLowerCase())?.status || null,
    sharingLevel: sharingLabel(entitlements),
    canInviteEditors: entitlements.canInviteEditors,
    memberWorkspace: entitlements.organisationMemberWorkspace,
    activeInvitations: Number(invitationCount || 0),
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || null,
    lastLogin: profile.last_activity || profile.updated_at || null
  };
}

async function currentSubscriptions(DB) {
  if (!(await tableExists(DB, "stripe_subscriptions"))) return [];
  return all(DB, `SELECT * FROM stripe_subscriptions
    WHERE lower(COALESCE(status,'')) IN ('active','trialing')
      AND (current_period_end IS NULL OR current_period_end='' OR datetime(current_period_end)>datetime('now'))
    ORDER BY datetime(COALESCE(current_period_end, trial_end, updated_at)) DESC`).catch(() => []);
}

async function invitationCounts(DB) {
  if (!(await tableExists(DB, "builder_output_access"))) return new Map();
  const rows = await all(DB, `SELECT lower(owner_email) AS email, COUNT(*) AS count
    FROM builder_output_access WHERE lower(COALESCE(status,'active'))='active'
    GROUP BY lower(owner_email)`).catch(() => []);
  return new Map(rows.map((row) => [row.email, Number(row.count || 0)]));
}

async function listCustomers(DB) {
  const profiles = await all(DB, "SELECT * FROM profiles ORDER BY datetime(created_at) DESC");
  const subscriptions = subscriptionMap(await currentSubscriptions(DB));
  const invitations = await invitationCounts(DB);
  const users = profiles.map((profile) => customerFrom(
    profile,
    subscriptions,
    invitations.get(String(profile.email || "").toLowerCase()) || 0
  ));
  return json({ success: true, users, customers: users, total: users.length });
}

async function documentSummary(DB, email) {
  const empty = { total: 0, drafts: 0, completed: 0, archived: 0, recent: [] };
  if (!(await tableExists(DB, "builder_outputs"))) return empty;
  const rows = await all(DB, `SELECT id, title, builder_id, status, created_at, updated_at, archived_at
    FROM builder_outputs WHERE lower(email)=lower(?) ORDER BY datetime(updated_at) DESC LIMIT 100`, [email]).catch(() => []);
  const recent = rows.slice(0, 10).map((row) => ({
    uuid: row.id,
    title: row.title || "Untitled itinerary",
    templateId: row.builder_id || "planning-builder",
    status: row.archived_at ? "archived" : String(row.status || "completed").toLowerCase(),
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  }));
  return {
    total: rows.length,
    drafts: rows.filter((row) => !row.archived_at && String(row.status || "").toLowerCase() === "draft").length,
    completed: rows.filter((row) => !row.archived_at && ["complete", "completed", "published"].includes(String(row.status || "").toLowerCase())).length,
    archived: rows.filter((row) => Boolean(row.archived_at)).length,
    recent
  };
}

async function invitationSummary(DB, email) {
  const rows = await all(DB, `SELECT id, recipient_email, permission, status, created_at, updated_at
    FROM builder_output_access WHERE lower(owner_email)=lower(?) ORDER BY datetime(created_at) DESC`, [email]).catch(() => []);
  return {
    total: rows.length,
    active: rows.filter((row) => String(row.status || "active").toLowerCase() === "active").length,
    readOnly: rows.filter((row) => String(row.status || "active").toLowerCase() === "active" && String(row.permission || "view").toLowerCase() !== "edit").length,
    editable: rows.filter((row) => String(row.status || "active").toLowerCase() === "active" && String(row.permission || "view").toLowerCase() === "edit").length,
    recent: rows.slice(0, 10)
  };
}

function subscriptionShape(row) {
  if (!row) return null;
  return {
    stripeCustomerId: row.stripe_customer_id || row.customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || row.subscription_id || null,
    stripePriceId: row.stripe_price_id || row.price_id || null,
    status: row.status || "inactive",
    trialStart: row.trial_start || null,
    trialEnd: row.trial_end || null,
    currentPeriodStart: row.current_period_start || null,
    currentPeriodEnd: row.current_period_end || null,
    cancelAtPeriodEnd: Boolean(Number(row.cancel_at_period_end || 0))
  };
}

async function getCustomer(DB, email) {
  const profileRow = await DB.prepare("SELECT * FROM profiles WHERE lower(email)=lower(?)").bind(email).first();
  if (!profileRow) return json({ success: false, error: "Customer not found." }, 404);
  const subscriptionRows = await currentSubscriptions(DB);
  const subscriptions = subscriptionMap(subscriptionRows);
  const invitations = await invitationSummary(DB, email);
  const customer = customerFrom(profileRow, subscriptions, invitations.active);
  const documents = await documentSummary(DB, email);
  const entitlements = accountPlanEntitlements(customer.accountType, customer.plan);
  const subscription = subscriptionShape(subscriptions.get(String(email).toLowerCase()));
  const workspace = {
    accountType: customer.accountType,
    accountTypeConfirmed: customer.accountTypeConfirmed,
    sharingLevel: sharingLabel(entitlements),
    canShareItineraries: entitlements.canShareItineraries,
    canInviteEditors: entitlements.canInviteEditors,
    memberWorkspace: entitlements.organisationMemberWorkspace,
    invitations
  };
  const profile = { customer, subscription, documents, workspace };
  return json({ success: true, profile, ...profile });
}

async function audit(DB, identity, action, email, details = {}) {
  if (!(await tableExists(DB, "admin_audit_log"))) return;
  await DB.prepare(`INSERT INTO admin_audit_log
    (id, actor_email, action, entity_type, entity_id, summary, metadata)
    VALUES (?, ?, ?, 'customer', ?, ?, ?)`).bind(
      crypto.randomUUID(), identity.email, action, email,
      `${action} for ${email}.`, JSON.stringify(details)
    ).run().catch(() => {});
}

async function createCustomer(DB, identity, body) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return json({ success: false, error: "A valid email address is required." }, 400);
  const displayName = `${String(body.firstName || "").trim()} ${String(body.lastName || "").trim()}`.trim() || email;
  const accountType = normaliseAccountType(body.accountType || body.usageType || "individual");
  const plan = LIVE_PLANS.has(String(body.plan || "free")) ? String(body.plan || "free") : "free";
  await DB.prepare(`INSERT INTO profiles
    (email, verified_name, display_name, contact_email, company, account_type, account_type_selected_at,
     usage_type, admin_customer_status, admin_lifetime_plan_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'Active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name, contact_email=excluded.contact_email,
      company=excluded.company, account_type=excluded.account_type, account_type_selected_at=CURRENT_TIMESTAMP,
      usage_type=excluded.usage_type, admin_lifetime_plan_id=excluded.admin_lifetime_plan_id,
      updated_at=CURRENT_TIMESTAMP`).bind(
        email, displayName, displayName, email, body.company || null, accountType,
        accountType === "organisation" ? "business" : "personal", plan
      ).run();
  await audit(DB, identity, "customer.create", email, { accountType, plan });
  return json({ success: true, id: email }, 201);
}

async function patchCustomer(DB, identity, email, body) {
  const existing = await DB.prepare("SELECT * FROM profiles WHERE lower(email)=lower(?)").bind(email).first();
  if (!existing) return json({ success: false, error: "Customer not found." }, 404);

  const action = String(body.action || "update_profile");
  let accountType = accountTypeFromProfile(existing);
  let status = existing.admin_customer_status || "Active";
  let lifetime = Number(existing.admin_lifetime || 0);
  let plan = normalisePlanCode(existing.admin_lifetime_plan_id || existing.assigned_plan) || "free";

  if (body.accountType || ["set_account_type", "change_account_type"].includes(action)) {
    accountType = normaliseAccountType(body.accountType || body.usageType);
  }
  if (["suspend", "suspend_account"].includes(action)) status = "Suspended";
  if (["activate", "reactivate_account"].includes(action)) status = "Active";
  if (["change_plan", "override_plan"].includes(action)) {
    const requested = String(body.plan || "free");
    if (!LIVE_PLANS.has(requested)) return json({ success: false, error: "Select a valid live plan." }, 400);
    plan = requested;
  }
  if (["grant_lifetime", "change_lifetime"].includes(action)) {
    const requested = String(body.plan || "");
    if (!LIVE_PLANS.has(requested) || requested === "free") return json({ success: false, error: "Select a paid plan for lifetime access." }, 400);
    lifetime = 1;
    plan = requested;
  }
  if (action === "revoke_lifetime") {
    lifetime = 0;
    plan = "free";
  }

  const requestedName = `${String(body.firstName ?? "").trim()} ${String(body.lastName ?? "").trim()}`.trim();
  const displayName = requestedName || existing.display_name || existing.verified_name || email;
  const contactEmail = String(body.email || existing.contact_email || email).trim().toLowerCase();

  await DB.prepare(`UPDATE profiles SET
    display_name=?, contact_email=?, company=?, account_type=?, account_type_selected_at=CURRENT_TIMESTAMP,
    usage_type=?, app_role=?, admin_customer_status=?, admin_lifetime=?, admin_lifetime_plan_id=?,
    plan_expires_at=?, admin_notes=COALESCE(?,admin_notes), admin_updated_at=CURRENT_TIMESTAMP,
    updated_at=CURRENT_TIMESTAMP WHERE lower(email)=lower(?)`).bind(
      displayName,
      contactEmail,
      body.company ?? existing.company ?? null,
      accountType,
      accountType === "organisation" ? "business" : "personal",
      body.role ?? existing.app_role ?? "user",
      status,
      lifetime,
      plan,
      body.planExpiresAt ?? existing.plan_expires_at ?? null,
      body.note || null,
      email
    ).run();

  if (action === "verify" && !existing.verified_name) {
    await DB.prepare("UPDATE profiles SET verified_name=display_name WHERE lower(email)=lower(?)").bind(email).run();
  }
  await audit(DB, identity, `customer.${action}`, email, { accountType, plan, status, lifetime });
  return getCustomer(DB, email);
}

export async function onRequest(context) {
  if (!context.env.DB) return json({ success: false, error: "Database binding is unavailable." }, 503);
  let identity;
  try { identity = await getNativeSession(context.request, context.env, "admin"); }
  catch { return json({ success: false, error: "Admin authentication is temporarily unavailable." }, 503); }
  if (!identity) return json({ success: false, error: "Admin session expired. Please sign in again." }, 401);
  if (!assertSameOrigin(context.request)) return json({ success: false, error: "The request origin could not be verified." }, 403);
  if (!(await authorised(context.env.DB, identity, context.env))) {
    return json({ success: false, error: "This account is not authorised for the admin portal." }, 403);
  }

  await prepareSchema(context.env.DB);
  const email = pathValue(context);
  try {
    if (!email && context.request.method === "GET") return listCustomers(context.env.DB);
    if (!email && context.request.method === "POST") return createCustomer(context.env.DB, identity, await bodyOf(context.request));
    if (email && context.request.method === "GET") return getCustomer(context.env.DB, email);
    if (email && context.request.method === "PATCH") return patchCustomer(context.env.DB, identity, email, await bodyOf(context.request));
    return json({ success: false, error: "Method not allowed." }, 405);
  } catch (error) {
    const reference = String(context.request.headers.get("cf-ray") || crypto.randomUUID()).slice(0, 80);
    console.error(JSON.stringify({ event: "admin_customer_route_failed", email, reference, message: error instanceof Error ? error.message : String(error) }));
    return json({ success: false, error: "Customer membership data could not be loaded.", reference }, 500);
  }
}
