function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
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

  const email =
    emailHeader ||
    tokenIdentity.email ||
    tokenIdentity.user_email ||
    tokenIdentity.username ||
    "";

  const name =
    tokenIdentity.name ||
    tokenIdentity.common_name ||
    tokenIdentity.user_name ||
    tokenIdentity.preferred_username ||
    email ||
    "";

  return {
    email: String(email || "").trim().toLowerCase(),
    name: String(name || "").trim()
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

async function ensureCustomerAdminColumns(DB) {
  const columns = [
    ["admin_lifetime", "INTEGER DEFAULT 0"],
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
      admin_customer_status,
      admin_notes,
      created_at,
      updated_at,
      admin_updated_at
    FROM profiles
    WHERE lower(email) = lower(?)
  `).bind(email).first();
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.DB) return json({ error: "Database binding DB is missing." }, 500);

  const identity = getAccessIdentity(request);

  if (!identity.email) return json({ error: "Not signed in." }, 401);

  await ensureAdminUsers(env.DB, env);

  if (!(await isAllowedAdmin(env.DB, identity, env))) return json({ error: "Forbidden.", signedInAs: identity.email }, 403);

  await ensureCustomerAdminColumns(env.DB);

  const url = new URL(request.url);
  const email = String(url.searchParams.get("email") || "").trim().toLowerCase();

  if (!email) return json({ error: "Customer email is required." }, 400);

  if (request.method === "GET") {
    const customer = await getCustomer(env.DB, email);

    if (!customer) return json({ error: "Customer not found." }, 404);

    return json({ admin: identity, customer });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));

    const makeLifetime = Boolean(body.admin_lifetime);
    const notes = String(body.admin_notes || "").trim().slice(0, 4000);
    const status = makeLifetime ? "Lifetime" : "Standard";

    await env.DB.prepare(`
      UPDATE profiles SET
        admin_lifetime = ?,
        admin_customer_status = ?,
        admin_notes = ?,
        admin_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE lower(email) = lower(?)
    `).bind(
      makeLifetime ? 1 : 0,
      status,
      notes,
      email
    ).run();

    const customer = await getCustomer(env.DB, email);

    return json({
      saved: true,
      admin: identity,
      customer
    });
  }

  return json({ error: "Method not allowed." }, 405);
}
