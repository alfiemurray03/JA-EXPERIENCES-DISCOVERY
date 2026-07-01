function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function getAccessIdentity(request) {
  return {
    email: String(request.headers.get("x-ja-auth-email") || "").trim().toLowerCase(),
    name: String(request.headers.get("x-ja-auth-name") || request.headers.get("x-ja-auth-email") || "").trim()
  };
}

const DEFAULT_ADMIN_EMAIL = "alfieholywoodmurray@jagroupservices.co.uk";

function getAllowedAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  return String(raw).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function ensureAdminUsers(DB, env) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_users (
      email TEXT PRIMARY KEY,
      name TEXT,
      source TEXT DEFAULT 'portal',
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  for (const email of getAllowedAdmins(env)) {
    await DB.prepare(`
      INSERT INTO admin_users (email, name, source, created_by, updated_at)
      VALUES (?, ?, 'default', 'system', CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    `).bind(email, email).run();
  }
}

async function isAllowedAdmin(DB, identity, env) {
  if (!identity.email) return false;
  if (getAllowedAdmins(env).includes(identity.email)) return true;

  const admin = await DB.prepare(`SELECT email FROM admin_users WHERE lower(email) = lower(?)`).bind(identity.email).first();
  return Boolean(admin);
}

async function getAdminPermissions(DB, identity) {
  const admin = await DB.prepare(`SELECT role, permissions FROM admin_users WHERE lower(email) = lower(?)`).bind(identity.email).first();
  const role = admin?.role || "Auditor";
  if (role === "Platform Owner") return ["*"];
  const roleRows = await DB.prepare(`SELECT permission_code FROM role_permissions WHERE role_name = ? ORDER BY permission_code ASC`).bind(role).all();
  const rolePermissions = (roleRows.results || []).map((row) => row.permission_code).filter(Boolean);
  let explicit = [];
  try {
    const parsed = JSON.parse(admin?.permissions || "[]");
    explicit = Array.isArray(parsed) ? parsed : [];
  } catch {
    explicit = [];
  }
  return [...new Set([...rolePermissions, ...explicit])];
}

async function ensureCustomerAdminColumns(DB) {
  const columns = [
    ["admin_lifetime", "INTEGER DEFAULT 0"],
    ["admin_lifetime_plan_id", "TEXT"],
    ["admin_customer_status", "TEXT DEFAULT 'Standard'"],
    ["admin_notes", "TEXT"],
    ["admin_updated_at", "TEXT"]
  ];

  for (const [name, definition] of columns) {
    try {
      await DB.prepare(`ALTER TABLE profiles ADD COLUMN ${name} ${definition}`).run();
    } catch {
      // Column already exists or profiles table is managed elsewhere.
    }
  }
}

async function ensureAuditLog(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id TEXT PRIMARY KEY,
      actor_email TEXT,
      action TEXT,
      entity_type TEXT,
      entity_id TEXT,
      summary TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function ensureRoleTables(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_roles (
      name TEXT PRIMARY KEY,
      description TEXT,
      is_system INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_name TEXT,
      permission_code TEXT,
      PRIMARY KEY (role_name, permission_code)
    )
  `).run();
}

async function getCustomer(DB, email) {
  return DB.prepare(`
    SELECT
      email,
      verified_name,
      display_name,
      contact_email,
      phone,
      communication_preference,
      support_notes,
      admin_lifetime,
      admin_lifetime_plan_id,
      admin_customer_status,
      admin_notes,
      created_at,
      updated_at,
      admin_updated_at
    FROM profiles
    WHERE lower(email) = lower(?)
  `).bind(email).first();
}

async function getPlans(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS service_plans (
      id TEXT PRIMARY KEY,
      plan_name TEXT,
      plan_type TEXT,
      price_label TEXT,
      price_pence INTEGER,
      stripe_price_id TEXT,
      delivery_time TEXT,
      revisions TEXT,
      description TEXT,
      button_label TEXT,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 100,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const result = await DB.prepare(`
    SELECT id, plan_name, plan_type, is_active, sort_order
    FROM service_plans
    ORDER BY sort_order ASC, plan_name ASC
  `).all();

  return result.results || [];
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.DB) return json({ error: "Database binding DB is missing." }, 500);

  const identity = getAccessIdentity(request);

  if (!identity.email) return json({ error: "Not signed in." }, 401);

  await ensureAdminUsers(env.DB, env);

  if (!(await isAllowedAdmin(env.DB, identity, env))) return json({ error: "Forbidden.", signedInAs: identity.email }, 403);
  const permissions = await getAdminPermissions(env.DB, identity);

  await ensureCustomerAdminColumns(env.DB);
  await ensureAuditLog(env.DB);
  await ensureRoleTables(env.DB);

  const url = new URL(request.url);
  const email = String(url.searchParams.get("email") || "").trim().toLowerCase();

  if (!email) return json({ error: "Customer email is required." }, 400);

  if (request.method === "GET") {
    if (!(permissions.includes("*") || permissions.includes("manage_users") || permissions.includes("manage_crm"))) {
      return json({ error: "Forbidden.", section: "customers" }, 403);
    }
    const customer = await getCustomer(env.DB, email);

    if (!customer) return json({ error: "Customer not found." }, 404);

    return json({ admin: identity, customer, plans: await getPlans(env.DB) });
  }

  if (request.method === "POST") {
    if (!(permissions.includes("*") || permissions.includes("manage_users") || permissions.includes("manage_crm"))) {
      return json({ error: "Forbidden.", section: "customers" }, 403);
    }
    const body = await request.json().catch(() => ({}));

    const makeLifetime = Boolean(body.admin_lifetime);
    const notes = String(body.admin_notes || "").trim().slice(0, 4000);
    const lifetimePlanId = makeLifetime ? String(body.admin_lifetime_plan_id || "").trim().slice(0, 120) : "";
    const status = makeLifetime ? "Lifetime" : "Standard";

    await env.DB.prepare(`
      UPDATE profiles SET
        admin_lifetime = ?,
        admin_lifetime_plan_id = ?,
        admin_customer_status = ?,
        admin_notes = ?,
        admin_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE lower(email) = lower(?)
    `).bind(
      makeLifetime ? 1 : 0,
      lifetimePlanId || null,
      status,
      notes,
      email
    ).run();

    await env.DB.prepare(`
      INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata)
      VALUES (?, ?, ?, 'profiles', ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      identity.email,
      makeLifetime ? "lifetime_access_grant" : "lifetime_access_revoke",
      email,
      makeLifetime ? `Granted lifetime access to ${email}.` : `Revoked lifetime access for ${email}.`,
      JSON.stringify({ lifetimePlanId, status })
    ).run();

    const customer = await getCustomer(env.DB, email);

    return json({
      saved: true,
      admin: identity,
      customer,
      plans: await getPlans(env.DB)
    });
  }

  return json({ error: "Method not allowed." }, 405);
}
