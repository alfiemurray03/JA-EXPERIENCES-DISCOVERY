const DEFAULT_ADMIN_EMAIL = "alfieholywoodmurray@jagroupservices.co.uk";
const CLOSURE_STATUSES = ["Open", "In Progress", "Approved", "Rejected", "Completed"];
const DPR_STATUSES = ["Received", "Verifying Identity", "In Progress", "Ready to Send", "Sent", "Closed", "Rejected"];
const SYSTEM_REPORT_STATUSES = ["Open", "In Progress", "Resolved", "Rejected"];
const THEME_MODES = ["light", "dark", "system"];
const PERMISSION_SECTIONS = {
  overview: ["view_dashboard"],
  operations: ["view_dashboard", "manage_status", "manage_analytics", "manage_api", "manage_settings"],
  analytics: ["manage_analytics"],
  audit: ["manage_audit"],
  admins: ["manage_admins", "manage_roles", "manage_permissions"],
  roles: ["manage_roles", "manage_permissions"],
  sessions: ["manage_admins", "manage_audit", "manage_api"],
  customers: ["manage_users", "manage_crm"],
  datarequests: ["manage_data_requests"],
  systemreports: ["manage_system_reports", "manage_audit"],
  closures: ["manage_closure_requests"],
  support: ["manage_support", "manage_crm"],
  system: ["manage_settings"],
  plans: ["manage_plans", "manage_pricing"],
  stripe: ["manage_stripe"],
  email: ["manage_email"],
  branding: ["manage_branding", "manage_content"],
  appearance: ["manage_settings"],
  affiliate: ["manage_content"],
  policies: ["manage_policies", "manage_content"],
  comingsoon: ["manage_content"],
  maintenance: ["manage_content"]
};
const DEFAULT_ROLE_PERMISSIONS = {
  "Platform Owner": ["*"],
  "Senior Administrator": [
    "view_dashboard","manage_admins","manage_roles","manage_permissions","manage_users","manage_crm","manage_plans","manage_pricing","manage_stripe","manage_support","manage_status","manage_analytics","manage_content","manage_branding","manage_email","manage_reports","manage_policies","manage_settings","manage_audit","manage_api","manage_data_requests","manage_closure_requests","manage_system_reports","manage_travel","manage_bookings","manage_refunds"
  ],
  Administrator: ["view_dashboard","manage_users","manage_crm","manage_plans","manage_pricing","manage_content","manage_status","manage_system_reports","manage_support","manage_analytics"],
  "Travel Consultant": ["view_dashboard","manage_users","manage_crm","manage_travel","manage_bookings"],
  Finance: ["view_dashboard","manage_stripe","manage_refunds","manage_reports"],
  "Customer Support": ["view_dashboard","manage_users","manage_crm","manage_support","manage_data_requests","manage_closure_requests","manage_system_reports"],
  "Marketing & Content": ["view_dashboard","manage_content","manage_policies","manage_branding"],
  "Compliance & Data Protection": ["view_dashboard","manage_data_requests","manage_audit","manage_policies","manage_reports"],
  "Auditor": ["view_only"]
};
const PERMISSION_CATALOG = {
  Platform: ["view_dashboard", "manage_admins", "manage_roles", "manage_permissions", "manage_api", "manage_settings"],
  "Customer Operations": ["manage_users", "manage_crm", "manage_travel", "manage_bookings"],
  Finance: ["manage_stripe", "manage_payments", "manage_refunds", "manage_subscriptions", "manage_reports"],
  Content: ["manage_content", "manage_branding", "manage_policies", "manage_email"],
  Compliance: ["manage_audit", "manage_data_requests", "manage_closure_requests", "manage_reports", "manage_policies"],
  Communications: ["manage_email", "manage_support"],
  Website: ["manage_content", "manage_status", "manage_plans", "manage_pricing", "manage_branding"],
  Analytics: ["manage_analytics", "manage_reports"],
  System: ["manage_settings", "manage_api", "manage_status"],
  Support: ["manage_support", "manage_data_requests", "manage_closure_requests", "manage_system_reports"],
  Travel: ["manage_travel", "manage_bookings"]
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function jsonWithHeaders(data, headers, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
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
  const email = emailHeader || tokenIdentity.email || tokenIdentity.user_email || tokenIdentity.username || "";
  const name = tokenIdentity.name || tokenIdentity.common_name || tokenIdentity.user_name || tokenIdentity.preferred_username || email || "";

  return {
    email: String(email || "").trim().toLowerCase(),
    name: String(name || "").trim()
  };
}

function configuredAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  return String(raw).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function cleanEmail(value) {
  return clean(value, 254).toLowerCase();
}

function cleanSlug(value) {
  return clean(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function maskSecret(value, prefixLength = 7, suffixLength = 4) {
  if (!value) return "";
  const text = String(value);
  if (text.length <= prefixLength + suffixLength) return "••••••••";
  return `${text.slice(0, prefixLength)}••••••••${text.slice(-suffixLength)}`;
}

function safeJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))
  ].join("\n");
}

async function safeAlter(DB, sql) {
  try {
    await DB.prepare(sql).run();
  } catch {
    // D1 throws if the column already exists. That is expected during safe migrations.
  }
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

async function ensureTables(DB, env) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      verified_name TEXT,
      display_name TEXT,
      contact_email TEXT,
      phone TEXT,
      communication_preference TEXT,
      support_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_lifetime INTEGER DEFAULT 0`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_lifetime_plan_id TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_customer_status TEXT DEFAULT 'Standard'`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_notes TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN admin_updated_at TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_attempted_at TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_status TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_provider TEXT`);
  await safeAlter(DB, `ALTER TABLE profiles ADD COLUMN signup_notification_to TEXT`);

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_users (
      email TEXT PRIMARY KEY,
      name TEXT,
      role TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'Active',
      permissions TEXT,
      favourites TEXT,
      source TEXT DEFAULT 'portal',
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_roles (
      name TEXT PRIMARY KEY,
      description TEXT,
      is_system INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_permissions (
      code TEXT PRIMARY KEY,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
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

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_preferences (
      email TEXT PRIMARY KEY,
      favourites TEXT DEFAULT '[]',
      dashboard_preferences TEXT DEFAULT '{}',
      notification_preferences TEXT DEFAULT '{}',
      recently_used TEXT DEFAULT '[]',
      preferred_landing_page TEXT DEFAULT 'overview',
      sidebar_collapsed INTEGER DEFAULT 0,
      theme_preference TEXT DEFAULT 'system',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE admin_users ADD COLUMN role TEXT DEFAULT 'Admin'`);
  await safeAlter(DB, `ALTER TABLE admin_users ADD COLUMN status TEXT DEFAULT 'Active'`);
  await safeAlter(DB, `ALTER TABLE admin_users ADD COLUMN permissions TEXT`);
  await safeAlter(DB, `ALTER TABLE admin_users ADD COLUMN favourites TEXT`);
  await safeAlter(DB, `ALTER TABLE admin_preferences ADD COLUMN recently_used TEXT DEFAULT '[]'`);
  await safeAlter(DB, `ALTER TABLE admin_preferences ADD COLUMN preferred_landing_page TEXT DEFAULT 'overview'`);
  await safeAlter(DB, `ALTER TABLE admin_preferences ADD COLUMN sidebar_collapsed INTEGER DEFAULT 0`);
  await safeAlter(DB, `ALTER TABLE admin_preferences ADD COLUMN theme_preference TEXT DEFAULT 'system'`);

  for (const email of configuredAdmins(env)) {
    await DB.prepare(`
      INSERT INTO admin_users (email, name, role, status, permissions, favourites, source, created_by, updated_at)
      VALUES (?, ?, 'Platform Owner', 'Active', '["*"]', '[]', 'default', 'system', CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        role = 'Platform Owner',
        permissions = '["*"]',
        source = CASE WHEN admin_users.source = 'portal' THEN admin_users.source ELSE 'default' END,
        updated_at = CURRENT_TIMESTAMP
    `).bind(email, email).run();
  }

  for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await DB.prepare(`
      INSERT INTO admin_roles (name, description, is_system, updated_at)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(name) DO UPDATE SET
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `).bind(role, role).run();

    for (const permission of permissions) {
      await DB.prepare(`
        INSERT INTO admin_permissions (code, description, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(code) DO UPDATE SET
          description = excluded.description,
          updated_at = CURRENT_TIMESTAMP
      `).bind(permission, permission).run();

      await DB.prepare(`
        INSERT INTO role_permissions (role_name, permission_code)
        VALUES (?, ?)
        ON CONFLICT(role_name, permission_code) DO NOTHING
      `).bind(role, permission).run();
    }
  }

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

  await safeAlter(DB, `ALTER TABLE service_plans ADD COLUMN stripe_product_id TEXT`);

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS policy_pages (
      slug TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      content_type TEXT DEFAULT 'markdown',
      version TEXT DEFAULT '1.0',
      effective_date TEXT,
      status TEXT DEFAULT 'draft',
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE policy_pages ADD COLUMN version TEXT DEFAULT '1.0'`);
  await safeAlter(DB, `ALTER TABLE policy_pages ADD COLUMN effective_date TEXT`);
  await safeAlter(DB, `ALTER TABLE policy_pages ADD COLUMN status TEXT DEFAULT 'draft'`);
  await safeAlter(DB, `ALTER TABLE policy_pages ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`);

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS company_branding (
      id TEXT PRIMARY KEY,
      business_name TEXT,
      trading_name TEXT,
      service_name TEXT,
      support_email TEXT,
      contact_email TEXT,
      phone TEXT,
      website TEXT,
      registered_notice TEXT,
      footer_notice TEXT,
      public_brand_text TEXT,
      logo_url TEXT,
      favicon_url TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN contact_email TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN registered_notice TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN footer_notice TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN public_brand_text TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN logo_url TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN favicon_url TEXT`);

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      customer_email TEXT,
      subject TEXT,
      status TEXT,
      priority TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS system_events (
      id TEXT PRIMARY KEY,
      type TEXT,
      severity TEXT,
      title TEXT,
      message TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await migrateStatusPageContent(DB);

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS data_protection_requests (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      user_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      request_type TEXT,
      customer_message TEXT,
      status TEXT DEFAULT 'New',
      submitted_at TEXT,
      due_at TEXT,
      completed_at TEXT,
      assigned_admin_id TEXT,
      internal_notes TEXT,
      attachments TEXT,
      audit_log TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS system_reports (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      user_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      issue_type TEXT,
      affected_url TEXT,
      device_browser TEXT,
      description TEXT,
      status TEXT DEFAULT 'New',
      priority TEXT DEFAULT 'Normal',
      submitted_at TEXT,
      resolved_at TEXT,
      assigned_admin_id TEXT,
      internal_notes TEXT,
      attachments TEXT,
      audit_log TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS closure_requests (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      customer_email TEXT,
      customer_name TEXT,
      requested_by TEXT,
      reason TEXT,
      status TEXT DEFAULT 'Open',
      assigned_admin_id TEXT,
      internal_notes TEXT,
      audit_log TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    )
  `).run();

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS affiliate_content_blocks (
      id TEXT PRIMARY KEY,
      source_key TEXT,
      block_type TEXT,
      title TEXT,
      body TEXT,
      widget_code TEXT,
      cta_label TEXT,
      cta_url TEXT,
      legal_notice TEXT,
      is_enabled INTEGER DEFAULT 1,
      is_published INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 100,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE affiliate_content_blocks ADD COLUMN source_key TEXT`);

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

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_bypass_sessions (
      token_hash TEXT PRIMARY KEY,
      admin_email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      revoked_at TEXT,
      last_used_at TEXT
    )
  `).run();
}

async function isAllowedAdmin(DB, identity, env) {
  if (!identity.email) return false;
  if (configuredAdmins(env).includes(identity.email)) return true;

  const row = await DB.prepare(`SELECT email FROM admin_users WHERE lower(email) = lower(?) AND COALESCE(status, 'Active') != 'Suspended'`).bind(identity.email).first();
  return Boolean(row);
}

async function getEffectivePermissions(DB, adminRow) {
  if (!adminRow) return ["*"];
  const role = canonicalRoleName(adminRow.role || "Auditor");
  if (role === "Platform Owner") return ["*"];

  const roleRows = await DB.prepare(`SELECT permission_code FROM role_permissions WHERE role_name = ? ORDER BY permission_code ASC`).bind(role).all();
  const rolePermissions = (roleRows.results || []).map((row) => row.permission_code).filter(Boolean);
  const explicitPermissions = safeJson(adminRow.permissions, []).filter(Boolean);
  const merged = new Set([...rolePermissions, ...explicitPermissions]);
  if (!merged.size) merged.add("view_only");
  return [...merged];
}

function allowedSectionsForPermissions(permissions) {
  const set = new Set(["overview"]);
  if (permissions.includes("*")) {
    Object.keys(PERMISSION_SECTIONS).forEach((section) => set.add(section));
    return [...set];
  }
  for (const [section, needed] of Object.entries(PERMISSION_SECTIONS)) {
    if (needed.some((permission) => permissions.includes(permission) || permissions.includes("*"))) set.add(section);
  }
  return [...set];
}

function canAccessSection(permissions, section) {
  if (permissions.includes("*")) return true;
  const needed = PERMISSION_SECTIONS[section];
  if (!needed) return true;
  return needed.some((permission) => permissions.includes(permission));
}

function requiresAnyPermission(permissions, required = []) {
  if (permissions.includes("*")) return true;
  return required.some((permission) => permissions.includes(permission));
}

function hasAnyPermission(permissions, required = []) {
  if (permissions.includes("*")) return true;
  return required.some((permission) => permissions.includes(permission));
}

function canonicalRoleName(role) {
  const normalised = clean(role, 80);
  if (normalised === "Admin") return "Senior Administrator";
  return normalised || "Auditor";
}

function ownerOrPermission(adminContext, required = []) {
  return ownerBypass(adminContext.permissions, adminContext) || required.some((permission) => adminContext.permissions.includes(permission));
}

function isPlatformOwner(adminRow) {
  return adminRow?.role === "Platform Owner";
}

function ownerBypass(permissions, adminRow = null) {
  if (permissions.includes("*")) return true;
  return isPlatformOwner(adminRow);
}

async function all(DB, sql, bindings = []) {
  const statement = DB.prepare(sql);
  const result = bindings.length ? await statement.bind(...bindings).all() : await statement.all();
  return result.results || [];
}

async function settingMap(DB, keys, defaults = {}) {
  const placeholders = keys.map(() => "?").join(", ");
  const rows = await all(DB, `SELECT key, value FROM site_settings WHERE key IN (${placeholders})`, keys);
  const settings = { ...defaults };
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}

async function saveSettings(DB, settings) {
  for (const [key, value] of Object.entries(settings)) {
    await DB.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `).bind(key, value).run();
  }
}

async function writeAudit(DB, identity, action, entityType, entityId, summary, metadata = {}) {
  await DB.prepare(`
    INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    auditActor(identity),
    clean(action, 120),
    clean(entityType, 120),
    clean(entityId, 180),
    clean(summary, 1000),
    JSON.stringify(metadata)
  ).run();
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function createBypass(DB, identity) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  await DB.prepare(`
    INSERT INTO admin_bypass_sessions (token_hash, admin_email, expires_at)
    VALUES (?, ?, ?)
  `).bind(tokenHash, identity.email, expires).run();
  await writeAudit(DB, identity, "admin_bypass_created", "admin_bypass_sessions", tokenHash.slice(0, 12), "Created admin live-site bypass session.", { expires });
  return {
    token,
    expires,
    cookie: `ja_admin_bypass=${token}; Path=/; Max-Age=7200; HttpOnly; Secure; SameSite=Lax`
  };
}

async function revokeBypass(DB, request, identity) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("ja_admin_bypass="))?.split("=")[1] || "";
  if (token) {
    await DB.prepare(`UPDATE admin_bypass_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(await sha256(token)).run();
  }
  await writeAudit(DB, identity, "admin_bypass_removed", "admin_bypass_sessions", token ? "current" : "none", "Removed admin live-site bypass session.", {});
  return {
    removed: true,
    cookie: "ja_admin_bypass=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  };
}

async function seedDefaults(DB) {
  const plans = [
    ["free_discovery_enquiry", "Free Discovery Enquiry", "Free", "£0", 0, "", "", "1 to 3 working days", "Initial review and recommendation", "A no-cost starting point for questions and support route guidance.", "Start a free enquiry", 1, 0, 0],
    ["destination_discovery_standard", "Destination Discovery Plan", "Standard", "£49", 4900, "prod_destination_discovery", "price_1TkZu2DZzb3r6Q3cuhKd6KTt", "3-5 working days", "1 minor revision", "A focused destination discovery plan for early-stage trip ideas.", "Buy now securely", 1, 1, 10],
    ["itinerary_experience_standard", "Itinerary and Experience Planning Plan", "Standard", "£89", 8900, "prod_itinerary_experience", "price_1TkZuJDZzb3r6Q3c9cEy41Iw", "5-7 working days", "1 minor revision", "A structured itinerary and experience planning service.", "Buy now securely", 1, 1, 20],
    ["complete_planning_standard", "Complete Discovery and Planning Guidance Plan", "Standard", "£149", 14900, "prod_complete_planning", "price_1TkZucDZzb3r6Q3cGVNcyvIF", "7-10 working days", "2 minor revisions", "A complete discovery and planning guidance package.", "Buy now securely", 1, 1, 30],
    ["destination_discovery_social", "Destination Discovery Social Tariff", "Social tariff", "£29", 2900, "prod_destination_social", "price_1TkZuuDZzb3r6Q3c2C6jQuvo", "3-5 working days", "1 minor revision", "Reduced-rate destination discovery plan.", "Buy now securely", 1, 0, 40],
    ["itinerary_experience_social", "Itinerary Planning Social Tariff", "Social tariff", "£55", 5500, "prod_itinerary_social", "price_1TkZv0DZzb3r6Q3cOh6tjkIM", "5-7 working days", "1 minor revision", "Reduced-rate itinerary and experience planning service.", "Buy now securely", 1, 0, 50],
    ["complete_planning_social", "Complete Planning Social Tariff", "Social tariff", "£95", 9500, "prod_complete_social", "price_1TkZvDDZzb3r6Q3csGxh4vSL", "7-10 working days", "2 minor revisions", "Reduced-rate complete planning guidance package.", "Buy now securely", 1, 0, 60]
  ];

  for (const plan of plans) {
    await DB.prepare(`
      INSERT INTO service_plans (
        id, plan_name, plan_type, price_label, price_pence, stripe_product_id, stripe_price_id,
        delivery_time, revisions, description, button_label, is_active, is_featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).bind(...plan).run();
  }

  const branding = await DB.prepare(`SELECT id FROM company_branding WHERE id = 'main'`).first();
  if (!branding) {
    await DB.prepare(`
      INSERT INTO company_branding (
        id, business_name, trading_name, service_name, support_email, contact_email,
        phone, website, registered_notice, footer_notice, public_brand_text, logo_url, favicon_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      "main",
      "JA Group Services Ltd",
      "JA Experiences & Discovery",
      "JA Experiences & Discovery",
      "support@jagroupservices.co.uk",
      "hello@jagroupservices.co.uk",
      "",
      "https://experiences.jagroupservices.co.uk",
      "JA Experiences & Discovery is a service line of JA Group Services Ltd.",
      "JA Experiences & Discovery is operated by JA Group Services Ltd.",
      "Curated discovery, planning and experience guidance.",
      "",
      ""
    ).run();
  }

  const policies = [
    ["terms-of-service", "Terms of Service", "# Terms of Service\n\nThese terms explain the basis on which JA Experiences & Discovery provides discovery, planning and guidance services.", "markdown", "1.0", "2026-06-21", "published", 1],
    ["privacy-notice", "Privacy Notice", "# Privacy Notice\n\nThis notice explains how JA Experiences & Discovery handles customer account, enquiry and service information.", "markdown", "1.0", "2026-06-21", "published", 1],
    ["cookie-policy", "Cookie Policy", "# Cookie Policy\n\nThis policy explains how cookies and similar technologies are used by JA Experiences & Discovery.", "markdown", "1.0", "2026-06-21", "draft", 0],
    ["refund-policy", "Refund and Cancellation Policy", "# Refund and Cancellation Policy\n\nThis policy explains refunds, cancellations and service delivery boundaries for paid planning services.", "markdown", "1.0", "2026-06-21", "draft", 0],
    ["affiliate-disclosure", "Affiliate Disclosure", "# Affiliate Disclosure\n\nJA Experiences & Discovery may earn commission from third-party providers where customers book through affiliate links.", "markdown", "1.0", "2026-06-21", "draft", 0],
    ["important-information", "Important Information", "# Important Information\n\nJA Experiences & Discovery provides planning and guidance support only. Third-party bookings remain subject to provider terms.", "markdown", "1.0", "2026-06-21", "draft", 0]
  ];

  for (const policy of policies) {
    await DB.prepare(`
      INSERT OR IGNORE INTO policy_pages (slug, title, content, content_type, version, effective_date, status, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(...policy).run();
  }
}

async function getOverview(DB) {
  const [customers, plans, activePlans, policies, tickets, openIssues, admins, dpr, systemReports, closures, lifetime] = await Promise.all([
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM service_plans`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM service_plans WHERE is_active = 1`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM policy_pages`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM support_tickets`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM system_events WHERE lower(status) NOT IN ('resolved', 'closed')`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM admin_users`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM data_protection_requests WHERE lower(status) NOT IN ('completed', 'closed', 'refused / not applicable')`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM system_reports WHERE lower(status) NOT IN ('resolved', 'rejected', 'fixed', 'closed', 'duplicate / not reproducible')`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM closure_requests WHERE lower(status) NOT IN ('completed', 'rejected')`).first(),
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles WHERE admin_lifetime = 1`).first()
  ]);

  const comingsoon = await getComingSoon(DB);
  const maintenance = await getMaintenance(DB);
  const [recentAudit, latestCustomers, latestSupport, latestReports, sessions, activeAdmins] = await Promise.all([
    all(DB, `SELECT action, actor_email, entity_type, entity_id, summary, metadata, created_at FROM admin_audit_log ORDER BY created_at DESC LIMIT 8`),
    all(DB, `SELECT email, verified_name, display_name, contact_email, updated_at FROM profiles ORDER BY updated_at DESC, created_at DESC LIMIT 6`),
    all(DB, `SELECT id, subject, status, priority, updated_at FROM support_tickets ORDER BY updated_at DESC, created_at DESC LIMIT 6`),
    all(DB, `SELECT id, title, status, updated_at FROM system_reports ORDER BY updated_at DESC, created_at DESC LIMIT 6`),
    all(DB, `SELECT token_hash, admin_email, created_at, expires_at, revoked_at, last_used_at FROM admin_bypass_sessions ORDER BY COALESCE(last_used_at, created_at) DESC LIMIT 6`),
    all(DB, `SELECT email, name, role, status, updated_at FROM admin_users WHERE COALESCE(status, 'Active') = 'Active' ORDER BY updated_at DESC LIMIT 12`)
  ]);

  return {
    customers: customers?.count || 0,
    plans: plans?.count || 0,
    activePlans: activePlans?.count || 0,
    policies: policies?.count || 0,
    supportTickets: tickets?.count || 0,
    openIssues: openIssues?.count || 0,
    dataProtectionRequests: dpr?.count || 0,
    systemReports: systemReports?.count || 0,
    closureRequests: closures?.count || 0,
    lifetimeUsers: lifetime?.count || 0,
    admins: admins?.count || 0,
    comingSoonStatus: comingsoon.comingsoon_enabled === "true" ? "On" : "Off",
    maintenanceStatus: maintenance.maintenance_enabled === "true" ? "On" : "Off",
    recentAudit,
    latestCustomers,
    latestSupport,
    latestReports,
    sessions,
    activeAdmins
  };
}

async function getAnalytics(DB) {
  const [
    users,
    newUsers,
    lifetimeUsers,
    freeUsers,
    paidUsers,
    enquiries,
    supportOpen,
    dprOpen,
    closureOpen,
    reports,
    planChanges,
    emailTests
  ] = await Promise.all([
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles WHERE created_at >= datetime('now', 'start of month')`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles WHERE admin_lifetime = 1`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles WHERE COALESCE(admin_lifetime, 0) = 0`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM profiles WHERE admin_customer_status NOT IN ('Standard', 'Free')`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM enquiries`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM support_tickets WHERE lower(status) NOT IN ('resolved', 'closed')`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM data_protection_requests WHERE lower(status) NOT IN ('sent', 'closed', 'rejected', 'completed')`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM closure_requests WHERE lower(status) NOT IN ('completed', 'rejected')`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM system_reports`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM admin_audit_log WHERE action LIKE '%plan%' OR action LIKE '%lifetime%'`).first().catch(() => ({ count: 0 })),
    DB.prepare(`SELECT COUNT(*) AS count FROM admin_audit_log WHERE action = 'test_notification'`).first().catch(() => ({ count: 0 }))
  ]);

  return {
    totalUsers: users?.count || 0,
    newUsersThisMonth: newUsers?.count || 0,
    activeUsers: users?.count || 0,
    lifetimeUsers: lifetimeUsers?.count || 0,
    freeUsers: freeUsers?.count || 0,
    paidUsers: paidUsers?.count || 0,
    totalBookingsOrReferrals: 0,
    totalEnquiries: enquiries?.count || 0,
    openSupportRequests: supportOpen?.count || 0,
    openDataRequests: dprOpen?.count || 0,
    openClosureRequests: closureOpen?.count || 0,
    systemReportsSubmitted: reports?.count || 0,
    planChanges: planChanges?.count || 0,
    emailNotificationStatus: emailTests?.count ? `${emailTests.count} test attempts logged` : "No test attempts logged"
  };
}

async function getAdmins(DB, env) {
  const rows = await all(DB, `SELECT * FROM admin_users ORDER BY email ASC`);
  const defaults = configuredAdmins(env);
  const seen = new Set(rows.map((row) => row.email));
  for (const email of defaults) {
    if (!seen.has(email)) {
      rows.push({ email, name: email, role: "Platform Owner", status: "Active", permissions: "[\"*\"]", favourites: "[]", source: "default", created_by: "system", created_at: null, updated_at: null });
    }
  }
  const withHistory = [];
  for (const row of rows.sort((a, b) => a.email.localeCompare(b.email))) {
    withHistory.push({
      ...row,
      login_history: await getAdminActivity(DB, row.email)
    });
  }
  return withHistory;
}

async function getRoles(DB) {
  const roles = await all(DB, `
    SELECT
      r.name,
      r.description,
      r.is_system,
      r.updated_at,
      COALESCE(users.assigned_count, 0) AS assigned_count
    FROM admin_roles r
    LEFT JOIN (
      SELECT role, COUNT(*) AS assigned_count
      FROM admin_users
      GROUP BY role
    ) users ON users.role = r.name
    ORDER BY r.is_system DESC, r.name ASC
  `);

  const permissionsByRole = await all(DB, `
    SELECT role_name, permission_code
    FROM role_permissions
    ORDER BY role_name ASC, permission_code ASC
  `);

  const grouped = new Map();
  for (const row of permissionsByRole) {
    if (!grouped.has(row.role_name)) grouped.set(row.role_name, []);
    grouped.get(row.role_name).push(row.permission_code);
  }

  return roles.map((role) => ({
    ...role,
    is_system: Number(role.is_system || 0),
    assigned_count: Number(role.assigned_count || 0),
    permissions: grouped.get(role.name) || []
  }));
}

async function ensureRoleWritable(DB, roleName) {
  const role = await DB.prepare(`SELECT name, is_system FROM admin_roles WHERE name = ?`).bind(roleName).first();
  if (!role) throw new Error("Role not found.");
  if (Number(role.is_system || 0) === 1 && role.name === "Platform Owner") throw new Error("The Platform Owner role cannot be modified.");
  return role;
}

function normalisePermissionList(permissions) {
  if (!Array.isArray(permissions)) return [];
  return [...new Set(permissions.map((permission) => clean(permission, 80)).filter(Boolean))];
}

async function createRole(DB, body, identity) {
  const name = clean(body.name, 80);
  if (!name) throw new Error("Role name is required.");
  const description = clean(body.description, 240) || `${name} role`;
  const existing = await DB.prepare(`SELECT name FROM admin_roles WHERE name = ?`).bind(name).first();
  if (existing) throw new Error("A role with that name already exists.");
  const permissions = normalisePermissionList(body.permissions);

  await DB.prepare(`
    INSERT INTO admin_roles (name, description, is_system, updated_at)
    VALUES (?, ?, 0, CURRENT_TIMESTAMP)
  `).bind(name, description).run();

  for (const permission of permissions) {
    await DB.prepare(`
      INSERT INTO admin_permissions (code, description, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(code) DO UPDATE SET
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `).bind(permission, permission).run();
    await DB.prepare(`
      INSERT INTO role_permissions (role_name, permission_code)
      VALUES (?, ?)
      ON CONFLICT(role_name, permission_code) DO NOTHING
    `).bind(name, permission).run();
  }

  await writeAudit(DB, identity, "role_create", "admin_roles", name, `Created role ${name}.`, { permissions });
  return getRoles(DB);
}

async function updateRole(DB, body, identity) {
  const name = clean(body.name, 80);
  if (!name) throw new Error("Role name is required.");
  const role = await ensureRoleWritable(DB, name);
  const description = clean(body.description, 240) || role.description || `${name} role`;
  const permissions = normalisePermissionList(body.permissions);

  await DB.prepare(`
    UPDATE admin_roles
    SET description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE name = ?
  `).bind(description, name).run();

  await DB.prepare(`DELETE FROM role_permissions WHERE role_name = ?`).bind(name).run();
  for (const permission of permissions) {
    await DB.prepare(`
      INSERT INTO admin_permissions (code, description, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(code) DO UPDATE SET
        description = excluded.description,
        updated_at = CURRENT_TIMESTAMP
    `).bind(permission, permission).run();
    await DB.prepare(`
      INSERT INTO role_permissions (role_name, permission_code)
      VALUES (?, ?)
      ON CONFLICT(role_name, permission_code) DO NOTHING
    `).bind(name, permission).run();
  }

  await writeAudit(DB, identity, "role_update", "admin_roles", name, `Updated role ${name}.`, { permissions });
  return getRoles(DB);
}

async function renameRole(DB, body, identity) {
  const from = clean(body.from, 80);
  const to = clean(body.to, 80);
  if (!from || !to) throw new Error("Both the current and new role names are required.");
  if (from === "Platform Owner") throw new Error("The Platform Owner role cannot be renamed.");
  if (from === to) return getRoles(DB);
  const existing = await DB.prepare(`SELECT name, is_system FROM admin_roles WHERE name = ?`).bind(from).first();
  if (!existing) throw new Error("Role not found.");
  const conflict = await DB.prepare(`SELECT name FROM admin_roles WHERE name = ?`).bind(to).first();
  if (conflict) throw new Error("A role with that name already exists.");

  await DB.prepare(`UPDATE admin_roles SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`).bind(to, from).run();
  await DB.prepare(`UPDATE role_permissions SET role_name = ? WHERE role_name = ?`).bind(to, from).run();
  await DB.prepare(`UPDATE admin_users SET role = ? WHERE role = ?`).bind(to, from).run();
  await writeAudit(DB, identity, "role_rename", "admin_roles", from, `Renamed role ${from} to ${to}.`, { from, to });
  return getRoles(DB);
}

async function cloneRole(DB, body, identity) {
  const source = clean(body.source, 80);
  const name = clean(body.name, 80);
  if (!source || !name) throw new Error("Source and new role names are required.");
  const existing = await DB.prepare(`SELECT name FROM admin_roles WHERE name = ?`).bind(name).first();
  if (existing) throw new Error("A role with that name already exists.");
  const role = await DB.prepare(`SELECT name, description FROM admin_roles WHERE name = ?`).bind(source).first();
  if (!role) throw new Error("Role not found.");
  const permissions = await all(DB, `SELECT permission_code FROM role_permissions WHERE role_name = ? ORDER BY permission_code ASC`, [source]);

  await DB.prepare(`
    INSERT INTO admin_roles (name, description, is_system, updated_at)
    VALUES (?, ?, 0, CURRENT_TIMESTAMP)
  `).bind(name, `${role.description || source} copy`).run();
  for (const row of permissions) {
    await DB.prepare(`
      INSERT INTO role_permissions (role_name, permission_code)
      VALUES (?, ?)
      ON CONFLICT(role_name, permission_code) DO NOTHING
    `).bind(name, row.permission_code).run();
  }
  await writeAudit(DB, identity, "role_clone", "admin_roles", name, `Cloned role ${source} to ${name}.`, { source, name });
  return getRoles(DB);
}

async function deleteRole(DB, body, identity) {
  const name = clean(body.name, 80);
  if (!name) throw new Error("Role name is required.");
  const role = await ensureRoleWritable(DB, name);
  if (Number(role.is_system || 0) === 1) throw new Error("System roles cannot be deleted.");
  const assigned = await DB.prepare(`SELECT COUNT(*) AS count FROM admin_users WHERE role = ?`).bind(name).first();
  if (Number(assigned?.count || 0) > 0) throw new Error("This role is still assigned to administrators.");
  await DB.prepare(`DELETE FROM role_permissions WHERE role_name = ?`).bind(name).run();
  await DB.prepare(`DELETE FROM admin_roles WHERE name = ?`).bind(name).run();
  await writeAudit(DB, identity, "role_delete", "admin_roles", name, `Deleted role ${name}.`, {});
  return getRoles(DB);
}

async function getRoleSummary(DB) {
  const roles = await getRoles(DB);
  return roles.map((role) => ({
    name: role.name,
    description: role.description,
    is_system: role.is_system,
    assigned_count: role.assigned_count,
    permissions: role.permissions
  }));
}

function dashboardPresetForRole(role, permissions) {
  role = canonicalRoleName(role);
  if (role === "Platform Owner" || permissions.includes("*")) {
    return ["overview", "status", "analytics", "customers", "admins", "roles", "sessions", "plans", "stripe", "support", "systemreports", "datarequests", "closures", "policies", "branding", "comingsoon", "maintenance", "audit", "email"];
  }
  if (role === "Senior Administrator") {
    return ["overview", "customers", "users", "plans", "branding", "comingsoon", "maintenance", "status", "analytics", "support", "systemreports", "audit"];
  }
  if (role === "Finance") return ["overview", "stripe", "plans", "audit", "reports"];
  if (role === "Customer Support") return ["overview", "customers", "support", "datarequests", "closures", "systemreports", "audit"];
  if (role === "Marketing & Content") return ["overview", "branding", "comingsoon", "maintenance", "policies", "affiliate", "email"];
  if (role === "Compliance & Data Protection") return ["overview", "audit", "datarequests", "closures", "policies", "reports"];
  if (role === "Auditor") return ["overview", "audit"];
  return ["overview", "customers", "plans", "status", "analytics", "support"];
}

function widgetCatalog() {
  return [
    { id: "live_status", label: "Live Website Status", section: "status", permission: "view_dashboard", tone: "online" },
    { id: "statuspage", label: "Statuspage Health", section: "status", permission: "manage_status", tone: "online" },
    { id: "worker_health", label: "Worker Health", section: "overview", permission: "view_dashboard", tone: "online" },
    { id: "database_health", label: "Database Health", section: "overview", permission: "view_dashboard", tone: "online" },
    { id: "stripe_health", label: "Stripe Health", section: "stripe", permission: "manage_stripe", tone: "warning" },
    { id: "api_health", label: "API Health", section: "overview", permission: "view_dashboard", tone: "online" },
    { id: "recent_audit", label: "Recent Audit Events", section: "audit", permission: "manage_audit", tone: "online" },
    { id: "active_admins", label: "Active Administrators", section: "admins", permission: "manage_admins", tone: "online" },
    { id: "active_sessions", label: "Active Sessions", section: "sessions", permission: "manage_api", tone: "online" },
    { id: "latest_customers", label: "Latest Customer Activity", section: "customers", permission: "manage_crm", tone: "online" },
    { id: "latest_support", label: "Latest Support Activity", section: "support", permission: "manage_support", tone: "online" },
    { id: "latest_reports", label: "Latest System Reports", section: "systemreports", permission: "manage_system_reports", tone: "warning" },
    { id: "latest_plans", label: "Latest Plan Changes", section: "plans", permission: "manage_plans", tone: "online" },
    { id: "latest_data_requests", label: "Latest Data Requests", section: "datarequests", permission: "manage_data_requests", tone: "online" },
    { id: "latest_closures", label: "Latest Closure Requests", section: "closures", permission: "manage_closure_requests", tone: "online" }
  ];
}

function widgetSetForRole(role, permissions) {
  role = canonicalRoleName(role);
  const allowed = new Set();
  const available = widgetCatalog();
  const preset = dashboardPresetForRole(role, permissions);
  for (const widget of available) {
    if (permissions.includes("*") || permissions.includes(widget.permission) || widget.permission === "view_dashboard") {
      if (preset.includes(widget.section) || role === "Platform Owner" || permissions.includes("*")) allowed.add(widget.id);
    }
  }
  return available.filter((widget) => allowed.has(widget.id));
}

async function addAdmin(DB, body, identity) {
  const email = cleanEmail(body.email);
  if (!isEmail(email)) throw new Error("Enter a valid admin email address.");
  const existing = await DB.prepare(`SELECT role FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first();
  const nextRole = existing?.role === "Platform Owner" ? "Platform Owner" : clean(body.role, 80) || "Administrator";
  if (nextRole !== "Platform Owner") {
    const role = await DB.prepare(`SELECT name FROM admin_roles WHERE name = ?`).bind(nextRole).first();
    if (!role) throw new Error("Selected role does not exist.");
  }
  const nextPermissions = nextRole === "Platform Owner" ? ["*"] : (Array.isArray(body.permissions) ? body.permissions : []);

  await DB.prepare(`
    INSERT INTO admin_users (email, name, role, status, permissions, source, created_by, updated_at)
    VALUES (?, ?, ?, ?, ?, 'portal', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      role = CASE WHEN admin_users.role = 'Platform Owner' THEN 'Platform Owner' ELSE excluded.role END,
      status = CASE WHEN admin_users.role = 'Platform Owner' THEN 'Active' ELSE excluded.status END,
      permissions = CASE WHEN admin_users.role = 'Platform Owner' THEN '["*"]' ELSE excluded.permissions END,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    email,
    clean(body.name || email, 180),
    nextRole,
    clean(body.status, 80) || "Active",
    JSON.stringify(nextPermissions),
    identity.email
  ).run();
}

async function updateAdmin(DB, body, identity, env) {
  const originalEmail = cleanEmail(body.original_email || body.email);
  const nextEmail = cleanEmail(body.email);
  if (!isEmail(originalEmail)) throw new Error("Admin email is required.");
  if (!isEmail(nextEmail)) throw new Error("New admin email is required.");
  const current = await DB.prepare(`SELECT email, role, status, permissions, source FROM admin_users WHERE lower(email) = lower(?)`).bind(originalEmail).first();
  if (!current) throw new Error("Administrator not found.");
  if (current.role === "Platform Owner") {
    await DB.prepare(`UPDATE admin_users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE lower(email) = lower(?)`).bind(clean(body.name || nextEmail, 180), originalEmail).run();
    return getAdmins(DB, env);
  }

  const nextRole = clean(body.role, 80) || current.role || "Administrator";
  if (nextRole === "Platform Owner") throw new Error("Only the existing Platform Owner can hold that role.");
  const roleExists = await DB.prepare(`SELECT name FROM admin_roles WHERE name = ?`).bind(nextRole).first();
  if (!roleExists) throw new Error("Selected role does not exist.");
  const nextStatus = ["Active", "Inactive", "Suspended"].includes(clean(body.status, 80)) ? clean(body.status, 80) : (current.status || "Active");
  const nextPermissions = Array.isArray(body.permissions) ? normalisePermissionList(body.permissions) : safeJson(current.permissions, []);
  if (nextEmail !== originalEmail) {
    const emailExists = await DB.prepare(`SELECT email FROM admin_users WHERE lower(email) = lower(?)`).bind(nextEmail).first();
    if (emailExists) throw new Error("Another administrator already uses that email.");
  }

  await DB.prepare(`
    UPDATE admin_users SET
      email = ?,
      name = ?,
      role = ?,
      status = ?,
      permissions = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE lower(email) = lower(?)
  `).bind(
    nextEmail,
    clean(body.name || nextEmail, 180),
    nextRole,
    nextStatus,
    JSON.stringify(nextPermissions),
    originalEmail
  ).run();

  await DB.prepare(`UPDATE admin_audit_log SET actor_email = ? WHERE lower(actor_email) = lower(?)`).bind(nextEmail, originalEmail).run();
  await DB.prepare(`UPDATE admin_preferences SET email = ? WHERE lower(email) = lower(?)`).bind(nextEmail, originalEmail).run();
  return getAdmins(DB, env);
}

async function removeAdmin(DB, body, identity, env) {
  const email = cleanEmail(body.email);
  if (!isEmail(email)) throw new Error("Admin email is required.");
  const current = await DB.prepare(`SELECT role FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first();
  if (current?.role === "Platform Owner") throw new Error("The Platform Owner cannot be removed.");

  const admins = await getAdmins(DB, env);
  if (admins.length <= 1) throw new Error("The last remaining admin cannot be removed.");
  if (configuredAdmins(env).includes(email)) throw new Error("Default environment admins cannot be removed from the portal.");
  if (email === identity.email && admins.length <= 1) throw new Error("You cannot remove the final admin account.");

  await DB.prepare(`DELETE FROM admin_users WHERE lower(email) = lower(?)`).bind(email).run();
}

async function saveAdminPreferences(DB, body, identity) {
  const allowedSections = new Set(["overview", "operations", "analytics", "audit", "admins", "roles", "sessions", "customers", "datarequests", "systemreports", "closures", "support", "system", "plans", "stripe", "email", "branding", "appearance", "affiliate", "comingsoon", "maintenance", "policies"]);
  const favourites = Array.isArray(body.favourites)
    ? body.favourites.map((item) => clean(item, 80)).filter((item) => allowedSections.has(item)).slice(0, 12)
    : [];
  const dashboardPreferences = safeJson(body.dashboard_preferences, {});
  const notificationPreferences = safeJson(body.notification_preferences, {});
  const recentlyUsed = Array.isArray(body.recently_used)
    ? body.recently_used.map((item) => clean(item, 80)).filter((item) => allowedSections.has(item)).slice(0, 12)
    : [];
  const preferredLandingPage = clean(body.preferred_landing_page, 80);
  const sidebarCollapsed = Boolean(body.sidebar_collapsed);
  const themePreference = ["light", "dark", "system"].includes(clean(body.theme_preference, 20)) ? clean(body.theme_preference, 20) : "system";

  await DB.prepare(`
    INSERT INTO admin_preferences (email, favourites, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      favourites = excluded.favourites,
      updated_at = CURRENT_TIMESTAMP
  `).bind(identity.email, JSON.stringify(favourites)).run();

  await DB.prepare(`
    UPDATE admin_preferences SET
      dashboard_preferences = ?,
      notification_preferences = ?,
      recently_used = ?,
      preferred_landing_page = ?,
      sidebar_collapsed = ?,
      theme_preference = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE lower(email) = lower(?)
  `).bind(
    JSON.stringify(dashboardPreferences || {}),
    JSON.stringify(notificationPreferences || {}),
    JSON.stringify(recentlyUsed),
    preferredLandingPage || "overview",
    sidebarCollapsed ? 1 : 0,
    themePreference,
    identity.email
  ).run();

  return {
    favourites,
    dashboard_preferences: dashboardPreferences || {},
    notification_preferences: notificationPreferences || {},
    recently_used: recentlyUsed,
    preferred_landing_page: preferredLandingPage || "overview",
    sidebar_collapsed: sidebarCollapsed ? 1 : 0,
    theme_preference: themePreference
  };
}

async function getAdminPreferences(DB, identity) {
  const row = await DB.prepare(`SELECT favourites, dashboard_preferences, notification_preferences, recently_used, preferred_landing_page, sidebar_collapsed, theme_preference FROM admin_preferences WHERE lower(email) = lower(?)`).bind(identity.email).first();
  return {
    favourites: safeJson(row?.favourites, []).filter(Boolean),
    dashboard_preferences: safeJson(row?.dashboard_preferences, {}),
    notification_preferences: safeJson(row?.notification_preferences, {}),
    recently_used: safeJson(row?.recently_used, []).filter(Boolean),
    preferred_landing_page: row?.preferred_landing_page || "overview",
    sidebar_collapsed: Number(row?.sidebar_collapsed || 0) === 1,
    theme_preference: row?.theme_preference || "system"
  };
}

function defaultLandingPageForRole(role, permissions) {
  role = canonicalRoleName(role);
  if (role === "Platform Owner" || permissions.includes("*")) return "overview";
  if (role === "Senior Administrator") return "overview";
  if (role === "Finance") return "stripe";
  if (role === "Customer Support") return "support";
  if (role === "Marketing & Content") return "branding";
  if (role === "Compliance & Data Protection") return "audit";
  if (role === "Auditor") return "audit";
  return "overview";
}

async function savePlan(DB, body) {
  const id = clean(body.id, 120) || crypto.randomUUID();
  const planName = clean(body.plan_name, 180);
  if (!planName) throw new Error("Plan name is required.");

  await DB.prepare(`
    INSERT INTO service_plans (
      id, plan_name, plan_type, price_label, price_pence, stripe_product_id, stripe_price_id,
      delivery_time, revisions, description, button_label, is_featured, sort_order, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      plan_name = excluded.plan_name,
      plan_type = excluded.plan_type,
      price_label = excluded.price_label,
      price_pence = excluded.price_pence,
      stripe_product_id = excluded.stripe_product_id,
      stripe_price_id = excluded.stripe_price_id,
      delivery_time = excluded.delivery_time,
      revisions = excluded.revisions,
      description = excluded.description,
      button_label = excluded.button_label,
      is_featured = excluded.is_featured,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    planName,
    clean(body.plan_type, 80),
    clean(body.price_label, 40),
    Number(body.price_pence || 0),
    clean(body.stripe_product_id, 180),
    clean(body.stripe_price_id, 180),
    clean(body.delivery_time, 120),
    clean(body.revisions, 120),
    clean(body.description, 1000),
    clean(body.button_label, 80) || "Buy now securely",
    body.is_featured ? 1 : 0,
    Number(body.sort_order || 100)
  ).run();

  return all(DB, `SELECT * FROM service_plans ORDER BY sort_order ASC, plan_name ASC`);
}

async function savePlanVisibility(DB, body) {
  const incoming = Array.isArray(body.plans) ? body.plans : [];
  if (!incoming.length) throw new Error("No plan changes were supplied.");

  const ids = incoming.map((plan) => clean(plan.id, 120)).filter(Boolean);
  if (ids.length !== incoming.length) throw new Error("One or more plan IDs are invalid.");

  const current = await all(DB, `SELECT id, is_active FROM service_plans ORDER BY sort_order ASC, plan_name ASC`);
  const currentMap = new Map(current.map((plan) => [plan.id, Number(plan.is_active || 0)]));

  for (const plan of incoming) {
    if (!currentMap.has(clean(plan.id, 120))) throw new Error(`Unknown plan: ${clean(plan.id, 120)}`);
    const active = Number(plan.is_active || 0);
    if (active !== 0 && active !== 1) throw new Error(`Invalid active state for plan: ${clean(plan.id, 120)}`);
  }

  const expected = new Map(incoming.map((plan) => [clean(plan.id, 120), Number(plan.is_active || 0)]));

  const databaseAfterSave = [];
  for (const plan of incoming) {
    const id = clean(plan.id, 120);
    try {
      await DB.prepare(`UPDATE service_plans SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(expected.get(id), id)
        .run();
    } catch (error) {
      throw new Error(`Failed to update plan ${id}: ${error.message || error}`);
    }

    const persisted = await DB.prepare(`SELECT id, is_active FROM service_plans WHERE id = ?`)
      .bind(id)
      .first();
    if (!persisted) {
      throw new Error(`Plan ${id} was not found after saving.`);
    }
    databaseAfterSave.push({
      id: persisted.id,
      is_active: Number(persisted.is_active || 0)
    });
  }

  const savedPlans = await all(DB, `SELECT * FROM service_plans ORDER BY sort_order ASC, plan_name ASC`);
  const savedMap = new Map(savedPlans.map((plan) => [plan.id, Number(plan.is_active || 0)]));

  for (const [id, value] of expected.entries()) {
    if (!savedMap.has(id)) {
      throw new Error(`Plan ${id} was not found after saving.`);
    }
    if (Number(savedMap.get(id)) !== value) {
      throw new Error(`Plan ${id} was not persisted. Expected ${value}, found ${savedMap.get(id)}.`);
    }
  }

  const plans = savedPlans.map((plan) => ({
    ...plan,
    is_active: Number(plan.is_active || 0),
    is_featured: Number(plan.is_featured || 0)
  }));

  return {
    success: true,
    rows_updated: incoming.length,
    database_after_save: databaseAfterSave,
    plans
  };
}

async function savePolicy(DB, body) {
  const slug = cleanSlug(body.slug);
  const originalSlug = cleanSlug(body.original_slug || body.slug);
  if (!slug) throw new Error("Policy slug is required.");

  const status = body.is_published || body.status === "published" ? "published" : "draft";

  if (originalSlug && originalSlug !== slug) {
    const existing = await DB.prepare(`SELECT slug FROM policy_pages WHERE slug = ?`).bind(slug).first();
    if (existing) throw new Error("A policy with this slug already exists.");
  }

  await DB.prepare(`
    INSERT INTO policy_pages (slug, title, content, content_type, version, effective_date, status, is_published, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      content_type = excluded.content_type,
      version = excluded.version,
      effective_date = excluded.effective_date,
      status = excluded.status,
      is_published = excluded.is_published,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    slug,
    clean(body.title, 180),
    clean(body.content, 20000),
    clean(body.content_type, 20) || "markdown",
    clean(body.version, 40) || "1.0",
    clean(body.effective_date, 40),
    status,
    status === "published" ? 1 : 0
  ).run();

  if (originalSlug && originalSlug !== slug) {
    await DB.prepare(`DELETE FROM policy_pages WHERE slug = ?`).bind(originalSlug).run();
  }

  return all(DB, `SELECT * FROM policy_pages ORDER BY title ASC`);
}

async function saveBranding(DB, body) {
  await DB.prepare(`
    INSERT INTO company_branding (
      id, business_name, trading_name, service_name, support_email, contact_email,
      phone, website, registered_notice, footer_notice, public_brand_text, logo_url, favicon_url, updated_at
    )
    VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      business_name = excluded.business_name,
      trading_name = excluded.trading_name,
      service_name = excluded.service_name,
      support_email = excluded.support_email,
      contact_email = excluded.contact_email,
      phone = excluded.phone,
      website = excluded.website,
      registered_notice = excluded.registered_notice,
      footer_notice = excluded.footer_notice,
      public_brand_text = excluded.public_brand_text,
      logo_url = excluded.logo_url,
      favicon_url = excluded.favicon_url,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    clean(body.business_name, 180),
    clean(body.trading_name, 180),
    clean(body.service_name, 180),
    clean(body.support_email, 180),
    clean(body.contact_email, 180),
    clean(body.phone, 80),
    clean(body.website, 250),
    clean(body.registered_notice, 1000),
    clean(body.footer_notice, 1000),
    clean(body.public_brand_text, 500),
    clean(body.logo_url, 500),
    clean(body.favicon_url, 500)
  ).run();

  return DB.prepare(`SELECT * FROM company_branding WHERE id = 'main'`).first();
}

async function saveSupport(DB, body) {
  const id = clean(body.id, 120) || crypto.randomUUID();
  await DB.prepare(`
    INSERT INTO support_tickets (id, customer_email, subject, status, priority, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      customer_email = excluded.customer_email,
      subject = excluded.subject,
      status = excluded.status,
      priority = excluded.priority,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    clean(body.customer_email, 180),
    clean(body.subject, 250),
    clean(body.status, 80) || "Open",
    clean(body.priority, 80) || "Normal",
    clean(body.notes, 4000)
  ).run();

  return all(DB, `SELECT * FROM support_tickets ORDER BY updated_at DESC, created_at DESC LIMIT 500`);
}

async function saveSystemEvent(DB, body) {
  const id = clean(body.id, 120) || crypto.randomUUID();
  await DB.prepare(`
    INSERT INTO system_events (id, type, severity, title, message, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      severity = excluded.severity,
      title = excluded.title,
      message = excluded.message,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    clean(body.type, 100) || "General",
    clean(body.severity, 80) || "Info",
    clean(body.title, 250),
    clean(body.message, 4000),
    clean(body.status, 80) || "Open"
  ).run();

  return all(DB, `SELECT * FROM system_events ORDER BY updated_at DESC, created_at DESC LIMIT 500`);
}

function parseAuditLog(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addAudit(existing, event) {
  return JSON.stringify([
    ...parseAuditLog(existing),
    {
      ...event,
      timestamp: new Date().toISOString()
    }
  ]);
}

function auditActor(identity) {
  return identity.email || identity.name || "admin";
}

async function getDataProtectionRequests(DB) {
  return all(DB, `
    SELECT id, reference, user_id, customer_name, customer_email, request_type, customer_message,
      status, submitted_at, due_at, completed_at, assigned_admin_id, internal_notes,
      attachments, audit_log, created_at, updated_at
    FROM data_protection_requests
    ORDER BY submitted_at DESC, created_at DESC
    LIMIT 500
  `);
}

async function getSystemReports(DB) {
  return all(DB, `
    SELECT id, reference, user_id, customer_name, customer_email, issue_type, affected_url,
      device_browser, description, status, priority, submitted_at, resolved_at, assigned_admin_id,
      internal_notes, attachments, audit_log, created_at, updated_at
    FROM system_reports
    ORDER BY submitted_at DESC, created_at DESC
    LIMIT 500
  `);
}

async function saveDataProtectionRequest(DB, body, identity, env = {}) {
  const current = await DB.prepare(`SELECT * FROM data_protection_requests WHERE id = ? OR reference = ?`).bind(clean(body.id, 120), clean(body.reference, 120)).first();
  if (!current) throw new Error("Data protection request not found.");

  const nextStatus = clean(body.status, 80) || current.status || "New";
  const nextNotes = clean(body.internal_notes, 6000);
  const nextAssigned = clean(body.assigned_admin_id, 254);
  const events = [];

  if (nextStatus !== current.status) {
    events.push({ type: "Status changed", actor: auditActor(identity), previousValue: current.status || "", newValue: nextStatus });
  }
  if (body.action === "export_customer_data") {
    events.push({ type: "Customer data exported", actor: auditActor(identity), newValue: clean(body.format, 20) || "json" });
  }
  if (body.action === "mark_sent") {
    events.push({ type: "Data sent to subject", actor: auditActor(identity) });
  }
  if (nextAssigned !== (current.assigned_admin_id || "")) {
    events.push({ type: "Assigned to admin", actor: auditActor(identity), previousValue: current.assigned_admin_id || "", newValue: nextAssigned });
  }
  if (nextNotes && nextNotes !== (current.internal_notes || "")) {
    events.push({ type: "Admin note added", actor: auditActor(identity) });
  }
  if (nextStatus === "Completed" && current.status !== "Completed") {
    events.push({ type: "Marked completed", actor: auditActor(identity) });
  }
  if (nextStatus === "Closed" && current.status !== "Closed") {
    events.push({ type: "Closed", actor: auditActor(identity) });
  }

  let auditLog = current.audit_log || "[]";
  for (const event of events) auditLog = addAudit(auditLog, event);

  if (body.action === "mark_sent") {
    const exportPayload = await exportCustomerData(DB, current.customer_email || current.user_id, "json");
    try {
      await sendProviderEmail(DB, env, {
        to: current.customer_email || current.user_id,
        subject: `Your JA Experiences & Discovery data request ${current.reference}`,
        text: `Please find below the exported customer data for request ${current.reference}.\n\n${exportPayload.content}`
      });
      auditLog = addAudit(auditLog, { type: "Data sent to subject", actor: auditActor(identity), newValue: "Sent by email provider" });
    } catch (error) {
      auditLog = addAudit(auditLog, { type: "Data send failed", actor: auditActor(identity), newValue: error.message || "Email failed" });
      throw new Error(`Data export generated, but email sending failed: ${error.message || "Email provider error"}`);
    }
  }

  const completedAt = nextStatus === "Completed" || nextStatus === "Closed"
    ? (current.completed_at || new Date().toISOString())
    : current.completed_at;

  await DB.prepare(`
    UPDATE data_protection_requests SET
      status = ?,
      assigned_admin_id = ?,
      internal_notes = ?,
      completed_at = ?,
      audit_log = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(nextStatus, nextAssigned, nextNotes, completedAt, auditLog, current.id).run();

  if (body.action === "export_customer_data") {
    await writeAudit(DB, identity, "data_request_export", "data_protection_requests", current.id, `Exported customer data for ${current.reference}.`, { reference: current.reference, format: clean(body.format, 20) || "json" });
  } else if (body.action === "mark_sent") {
    await writeAudit(DB, identity, "data_request_sent", "data_protection_requests", current.id, `Marked ${current.reference} as sent to data subject.`, { reference: current.reference });
  } else if (events.length) {
    await writeAudit(DB, identity, "data_request_update", "data_protection_requests", current.id, `Updated ${current.reference}.`, { reference: current.reference, status: nextStatus });
  }

  return getDataProtectionRequests(DB);
}

async function saveSystemReport(DB, body, identity) {
  const current = await DB.prepare(`SELECT * FROM system_reports WHERE id = ? OR reference = ?`).bind(clean(body.id, 120), clean(body.reference, 120)).first();
  if (!current) throw new Error("System report not found.");

  const nextStatus = clean(body.status, 80) || current.status || "New";
  const nextPriority = clean(body.priority, 40) || current.priority || "Normal";
  const nextNotes = clean(body.internal_notes, 6000);
  const nextAssigned = clean(body.assigned_admin_id, 254);
  const events = [];

  if (nextStatus !== current.status) {
    events.push({ type: "Status changed", actor: auditActor(identity), previousValue: current.status || "", newValue: nextStatus });
  }
  if (nextPriority !== current.priority) {
    events.push({ type: "Priority changed", actor: auditActor(identity), previousValue: current.priority || "", newValue: nextPriority });
  }
  if (nextAssigned !== (current.assigned_admin_id || "")) {
    events.push({ type: "Assigned to admin", actor: auditActor(identity), previousValue: current.assigned_admin_id || "", newValue: nextAssigned });
  }
  if (nextNotes && nextNotes !== (current.internal_notes || "")) {
    events.push({ type: "Admin note added", actor: auditActor(identity) });
  }
  if (nextStatus === "Fixed" && current.status !== "Fixed") {
    events.push({ type: "Marked fixed", actor: auditActor(identity) });
  }
  if (nextStatus === "Closed" && current.status !== "Closed") {
    events.push({ type: "Closed", actor: auditActor(identity) });
  }

  let auditLog = current.audit_log || "[]";
  for (const event of events) auditLog = addAudit(auditLog, event);

  const resolvedAt = nextStatus === "Fixed" || nextStatus === "Closed"
    ? (current.resolved_at || new Date().toISOString())
    : current.resolved_at;

  await DB.prepare(`
    UPDATE system_reports SET
      status = ?,
      priority = ?,
      assigned_admin_id = ?,
      internal_notes = ?,
      resolved_at = ?,
      audit_log = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(nextStatus, nextPriority, nextAssigned, nextNotes, resolvedAt, auditLog, current.id).run();

  if (events.length) {
    await writeAudit(DB, identity, "system_report_update", "system_reports", current.id, `Updated ${current.reference}.`, { reference: current.reference, status: nextStatus, priority: nextPriority });
  }

  return getSystemReports(DB);
}

async function getClosureRequests(DB) {
  return all(DB, `
    SELECT id, reference, customer_email, customer_name, requested_by, reason, status,
      assigned_admin_id, internal_notes, audit_log, created_at, updated_at, completed_at
    FROM closure_requests
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 500
  `);
}

async function nextReference(DB, table, prefix) {
  const row = await DB.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first();
  return `${prefix}-${String(Number(row?.count || 0) + 1).padStart(5, "0")}`;
}

async function saveClosureRequest(DB, body, identity) {
  const id = clean(body.id, 120);
  const status = CLOSURE_STATUSES.includes(clean(body.status, 80)) ? clean(body.status, 80) : "Open";
  const customerEmail = cleanEmail(body.customer_email);
  if (!customerEmail) throw new Error("Customer email is required for a closure request.");

  if (!id) {
    const reference = await nextReference(DB, "closure_requests", "CLR");
    const auditLog = addAudit("[]", { type: "Closure request created", actor: auditActor(identity), newValue: status });
    await DB.prepare(`
      INSERT INTO closure_requests (
        id, reference, customer_email, customer_name, requested_by, reason, status,
        assigned_admin_id, internal_notes, audit_log
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      reference,
      customerEmail,
      clean(body.customer_name, 180),
      auditActor(identity),
      clean(body.reason, 2000),
      status,
      clean(body.assigned_admin_id, 254),
      clean(body.internal_notes, 6000),
      auditLog
    ).run();
    await writeAudit(DB, identity, "closure_request_create", "closure_requests", reference, `Created closure request ${reference}.`, { customerEmail, status });
    return getClosureRequests(DB);
  }

  const current = await DB.prepare(`SELECT * FROM closure_requests WHERE id = ?`).bind(id).first();
  if (!current) throw new Error("Closure request not found.");

  let auditLog = current.audit_log || "[]";
  if (status !== current.status) auditLog = addAudit(auditLog, { type: "Status changed", actor: auditActor(identity), previousValue: current.status || "", newValue: status });
  if (clean(body.assigned_admin_id, 254) !== (current.assigned_admin_id || "")) auditLog = addAudit(auditLog, { type: "Assigned to admin", actor: auditActor(identity), previousValue: current.assigned_admin_id || "", newValue: clean(body.assigned_admin_id, 254) });
  if (clean(body.internal_notes, 6000) && clean(body.internal_notes, 6000) !== (current.internal_notes || "")) auditLog = addAudit(auditLog, { type: "Internal note added", actor: auditActor(identity) });

  await DB.prepare(`
    UPDATE closure_requests SET
      status = ?,
      assigned_admin_id = ?,
      internal_notes = ?,
      audit_log = ?,
      completed_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    status,
    clean(body.assigned_admin_id, 254),
    clean(body.internal_notes, 6000),
    auditLog,
    status === "Completed" ? (current.completed_at || new Date().toISOString()) : current.completed_at,
    id
  ).run();

  await writeAudit(DB, identity, "closure_request_update", "closure_requests", id, `Updated closure request ${current.reference}.`, { reference: current.reference, status });
  return getClosureRequests(DB);
}

async function getAffiliateContent(DB) {
  return all(DB, `SELECT * FROM affiliate_content_blocks ORDER BY sort_order ASC, updated_at DESC LIMIT 500`);
}

function existingAffiliateBlocks() {
  return [
    {
      source_key: "headout-page-heading",
      block_type: "Page heading",
      title: "Headout Experiences",
      body: "Explore selected tours, attractions and activities by country, then choose a destination to view current Headout options.",
      cta_label: "Browse countries",
      cta_url: "/headout/#countries",
      legal_notice: "Headout is currently presented as the Primary Affiliate Partner for activities and experiences.",
      sort_order: 10
    },
    {
      source_key: "headout-affiliate-disclosure",
      block_type: "Disclaimer",
      title: "Headout affiliate disclosure",
      body: "Bookings made through Headout are made with Headout or the relevant third-party provider. JA Group Services Ltd may receive a commission where eligible. JA Group Services Ltd does not supply, control or guarantee third-party tours, activities, tickets or experiences.",
      cta_label: "Browse Headout experiences",
      cta_url: "/headout/",
      legal_notice: "Prices, availability, booking terms, cancellation rules and customer support are provided by the relevant provider.",
      sort_order: 20
    },
    {
      source_key: "headout-gallery-widget-template",
      block_type: "Widget",
      title: "Headout gallery widget template",
      body: "Reusable Headout activity gallery placement for destination and experience pages. Use this as the admin-managed source for Headout embedded activity sections.",
      widget_code: "<div data-affiliate-provider=\"headout\" data-hawt=\"gallery\" data-city=\"LONDON\" data-max-count=\"100\"></div>",
      cta_label: "Open Headout",
      cta_url: "/headout/",
      legal_notice: "Headout widget placements must remain accompanied by the affiliate disclosure and third-party provider notice.",
      sort_order: 25
    },
    {
      source_key: "headout-integration-code",
      block_type: "Integration code",
      title: "Headout affiliate integration code",
      body: "Primary Headout affiliate partner integration. Affiliate reference: JL2D9u. Keep script loading controlled by approved public page code; do not paste raw script tags into unmanaged content.",
      cta_label: "View Headout page",
      cta_url: "/headout/",
      legal_notice: "Affiliate references must not be hidden from the required disclosure wording.",
      sort_order: 28
    },
    {
      source_key: "getyourguide-page-heading",
      block_type: "Page heading",
      title: "GetYourGuide Activities",
      body: "Choose a country, select a city or area, then browse current GetYourGuide options for the destination you are interested in.",
      cta_label: "Browse countries",
      cta_url: "/getyourguide/#countries",
      legal_notice: "GetYourGuide is currently presented as the Secondary Affiliate Partner for activities and experiences.",
      sort_order: 30
    },
    {
      source_key: "getyourguide-affiliate-disclosure",
      block_type: "Disclaimer",
      title: "GetYourGuide affiliate disclosure",
      body: "Activities, attractions, tours, tickets, experiences, availability, prices, booking terms, cancellation rules and customer support are provided by GetYourGuide and/or the relevant third-party provider. JA Group Services Ltd may receive a commission for qualifying bookings made through links on this page.",
      cta_label: "Browse GetYourGuide activities",
      cta_url: "/getyourguide/",
      legal_notice: "JA Group Services Ltd does not supply, control or guarantee third-party tours, activities, tickets or experiences.",
      sort_order: 40
    },
    {
      source_key: "getyourguide-widget-template",
      block_type: "Widget",
      title: "GetYourGuide activity widget template",
      body: "Reusable GetYourGuide placement for destination and attraction activity sections. This record keeps the widget configuration visible and manageable in the admin centre.",
      widget_code: "<div data-affiliate-provider=\"getyourguide\" data-gyg-widget=\"activities\" data-gyg-locale=\"en-GB\" data-gyg-currency=\"GBP\"></div>",
      cta_label: "Open GetYourGuide",
      cta_url: "/getyourguide/",
      legal_notice: "GetYourGuide activity widgets must be shown with the affiliate disclosure and third-party booking notice.",
      sort_order: 45
    },
    {
      source_key: "getyourguide-integration-code",
      block_type: "Integration code",
      title: "GetYourGuide partner integration",
      body: "Secondary affiliate partner integration for activity, attraction and tour recommendations. Keep provider identifiers and widget placements managed through approved page templates and admin records.",
      cta_label: "View GetYourGuide page",
      cta_url: "/getyourguide/",
      legal_notice: "Third-party provider terms, prices, availability and cancellation rules apply.",
      sort_order: 48
    },
    {
      source_key: "experiences-provider-disclosure",
      block_type: "Referral notice",
      title: "Before booking",
      body: "The relevant third-party provider supplies the activity, price, availability, booking terms, cancellation rules and customer support. JA Group Services Ltd may receive commission from qualifying bookings.",
      cta_label: "Read the affiliate disclosure",
      cta_url: "/affiliate-disclosure/",
      sort_order: 50
    },
    {
      source_key: "affiliate-independent-providers",
      block_type: "Legal notice",
      title: "Affiliate links and independent providers",
      body: "Some activity links, partner content or referral links may earn JA Group Services Ltd a commission after a qualifying booking.",
      legal_notice: "Affiliate bookings are made with the relevant third-party provider. The third-party provider is responsible for its own service, booking terms, pricing, refunds, cancellations and service delivery.",
      sort_order: 60
    },
    {
      source_key: "destination-affiliate-browser-notice",
      block_type: "Destination block",
      title: "Destination activity browser notice",
      body: "Destination activity pages should help customers compare current third-party activity options by country, city and interest before leaving JA Experiences & Discovery for booking.",
      cta_label: "Browse activity partners",
      cta_url: "/activities/",
      legal_notice: "Customers should check suitability, accessibility, provider terms and cancellation conditions before booking.",
      sort_order: 70
    },
    {
      source_key: "affiliate-faq-provider-support",
      block_type: "FAQ block",
      title: "Who supports an affiliate booking?",
      body: "The third-party provider or affiliate marketplace supports bookings, amendments, cancellations, refunds and service delivery. JA Group Services Ltd provides discovery and guidance information only.",
      legal_notice: "JA Group Services Ltd is not the tour operator, travel agent or booking platform for third-party affiliate experiences.",
      sort_order: 80
    }
  ];
}

async function importAffiliateContent(DB, identity) {
  let imported = 0;
  for (const block of existingAffiliateBlocks()) {
    const existing = await DB.prepare(`SELECT id FROM affiliate_content_blocks WHERE source_key = ?`).bind(block.source_key).first();
    if (existing) continue;
    await DB.prepare(`
      INSERT INTO affiliate_content_blocks (
        id, source_key, block_type, title, body, widget_code, cta_label, cta_url, legal_notice,
        is_enabled, is_published, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, CURRENT_TIMESTAMP)
    `).bind(
      crypto.randomUUID(),
      block.source_key,
      block.block_type,
      block.title,
      block.body,
      block.widget_code || "",
      block.cta_label || "",
      block.cta_url || "",
      block.legal_notice || "",
      block.sort_order
    ).run();
    imported += 1;
  }

  await writeAudit(DB, identity, "affiliate_content_import", "affiliate_content_blocks", "existing-content", `Imported ${imported} existing affiliate content records.`, { imported });
  return { imported, records: await getAffiliateContent(DB) };
}

function sanitiseWidgetCode(value) {
  const code = clean(value, 8000);
  if (!code) return "";
  const lowered = code.toLowerCase();
  if (lowered.includes("<script") || lowered.includes("javascript:") || lowered.includes("onerror=") || lowered.includes("onload=")) {
    throw new Error("Unsafe widget code was blocked. Use approved embed snippets without script tags or inline event handlers.");
  }
  return code;
}

async function saveAffiliateContent(DB, body, identity) {
  const id = clean(body.id, 120) || crypto.randomUUID();
  if (body.action === "import_existing") {
    const imported = await importAffiliateContent(DB, identity);
    return imported.records;
  }

  if (body.action === "delete") {
    await DB.prepare(`DELETE FROM affiliate_content_blocks WHERE id = ?`).bind(id).run();
    await writeAudit(DB, identity, "affiliate_content_delete", "affiliate_content_blocks", id, "Deleted affiliate content block.", {});
    return getAffiliateContent(DB);
  }

  const title = clean(body.title, 180);
  if (!title) throw new Error("Content block title is required.");

  await DB.prepare(`
    INSERT INTO affiliate_content_blocks (
      id, source_key, block_type, title, body, widget_code, cta_label, cta_url, legal_notice,
      is_enabled, is_published, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      source_key = excluded.source_key,
      block_type = excluded.block_type,
      title = excluded.title,
      body = excluded.body,
      widget_code = excluded.widget_code,
      cta_label = excluded.cta_label,
      cta_url = excluded.cta_url,
      legal_notice = excluded.legal_notice,
      is_enabled = excluded.is_enabled,
      is_published = excluded.is_published,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    clean(body.source_key, 180),
    clean(body.block_type, 80) || "Content",
    title,
    clean(body.body, 12000),
    sanitiseWidgetCode(body.widget_code),
    clean(body.cta_label, 120),
    clean(body.cta_url, 500),
    clean(body.legal_notice, 4000),
    body.is_enabled ? 1 : 0,
    body.is_published ? 1 : 0,
    Number(body.sort_order || 100)
  ).run();

  await writeAudit(DB, identity, "affiliate_content_save", "affiliate_content_blocks", id, `Saved affiliate content block ${title}.`, { published: Boolean(body.is_published), enabled: Boolean(body.is_enabled) });
  return getAffiliateContent(DB);
}

async function getAppearance(DB) {
  return settingMap(DB, ["site_theme_mode"], { site_theme_mode: "dark" });
}

async function saveAppearance(DB, body, identity) {
  const mode = THEME_MODES.includes(clean(body.site_theme_mode, 20)) ? clean(body.site_theme_mode, 20) : "dark";
  await saveSettings(DB, { site_theme_mode: mode });
  await writeAudit(DB, identity, "appearance_update", "site_settings", "site_theme_mode", `Set site theme mode to ${mode}.`, { mode });
  return getAppearance(DB);
}

async function getEmailSettings(DB, env) {
  const settings = await settingMap(DB, [
    "smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_from_name", "smtp_from_email", "smtp_security",
    "email_provider", "email_api_key", "email_api_endpoint", "admin_notification_email"
  ], {
    smtp_host: "smtp.jagroupservices.co.uk",
    smtp_port: "587",
    smtp_username: "noreply@jagroupservices.co.uk",
    smtp_from_name: "JA Experiences & Discovery",
    smtp_from_email: "noreply@jagroupservices.co.uk",
    smtp_security: "STARTTLS",
    email_provider: "resend"
  });

  return {
    smtp_host: settings.smtp_host,
    smtp_port: settings.smtp_port,
    smtp_username: settings.smtp_username,
    smtp_password_masked: maskSecret(settings.smtp_password || ""),
    smtp_from_name: settings.smtp_from_name,
    smtp_from_email: settings.smtp_from_email,
    smtp_security: settings.smtp_security,
    email_provider: settings.email_provider || "resend",
    email_api_endpoint: settings.email_api_endpoint || "",
    email_api_key_masked: maskSecret(settings.email_api_key || env.EMAIL_API_TOKEN || env.RESEND_API_KEY || env.SENDGRID_API_KEY || env.POSTMARK_API_KEY || env.BREVO_API_KEY || ""),
    admin_notification_email: settings.admin_notification_email || env.ADMIN_NOTIFICATION_EMAIL || "",
    configured: Boolean((settings.email_api_key || env.EMAIL_API_TOKEN || env.RESEND_API_KEY || env.SENDGRID_API_KEY || env.POSTMARK_API_KEY || env.BREVO_API_KEY) && (settings.admin_notification_email || env.ADMIN_NOTIFICATION_EMAIL))
  };
}

async function saveEmailSettings(DB, body, env, identity) {
  const current = await settingMap(DB, ["smtp_password", "email_api_key"], {});
  await saveSettings(DB, {
    smtp_host: clean(body.smtp_host, 250) || "smtp.jagroupservices.co.uk",
    smtp_port: clean(body.smtp_port, 10) || "587",
    smtp_username: clean(body.smtp_username, 254) || "noreply@jagroupservices.co.uk",
    smtp_password: clean(body.smtp_password, 500) || current.smtp_password || env.SMTP_PASSWORD || "",
    smtp_from_name: clean(body.smtp_from_name, 180) || "JA Experiences & Discovery",
    smtp_from_email: clean(body.smtp_from_email, 254) || "noreply@jagroupservices.co.uk",
    smtp_security: clean(body.smtp_security, 40) || "STARTTLS",
    email_provider: clean(body.email_provider, 40) || "resend",
    email_api_endpoint: clean(body.email_api_endpoint, 500),
    email_api_key: clean(body.email_api_key, 800) || current.email_api_key || env.EMAIL_API_TOKEN || "",
    admin_notification_email: cleanEmail(body.admin_notification_email) || env.ADMIN_NOTIFICATION_EMAIL || ""
  });
  await writeAudit(DB, identity, "smtp_settings_update", "site_settings", "email", "Updated Email (SMTP) and provider settings.", { host: clean(body.smtp_host, 250), username: clean(body.smtp_username, 254), provider: clean(body.email_provider, 40) });
  return getEmailSettings(DB, env);
}

async function providerSettings(DB, env) {
  const stored = await settingMap(DB, ["email_provider", "email_api_key", "email_api_endpoint", "smtp_from_name", "smtp_from_email", "admin_notification_email"], {});
  const provider = (stored.email_provider || env.EMAIL_PROVIDER || "resend").toLowerCase();
  const apiKey = stored.email_api_key || env.EMAIL_API_TOKEN || env.RESEND_API_KEY || env.SENDGRID_API_KEY || env.POSTMARK_API_KEY || env.BREVO_API_KEY || "";
  return {
    provider,
    apiKey,
    endpoint: stored.email_api_endpoint || env.EMAIL_API_ENDPOINT || "",
    fromName: stored.smtp_from_name || "JA Experiences & Discovery",
    fromEmail: stored.smtp_from_email || "noreply@jagroupservices.co.uk",
    to: stored.admin_notification_email || env.ADMIN_NOTIFICATION_EMAIL || ""
  };
}

async function sendProviderEmail(DB, env, message) {
  const settings = await providerSettings(DB, env);
  const to = message.to || settings.to;
  if (!to) throw new Error("Recipient email is not configured.");
  if (!settings.apiKey && settings.provider !== "mailchannels") throw new Error("Email API key is not configured.");

  const from = settings.fromName ? `${settings.fromName} <${settings.fromEmail}>` : settings.fromEmail;
  let endpoint = settings.endpoint;
  let headers = { "Content-Type": "application/json" };
  let body;

  if (settings.provider === "sendgrid") {
    endpoint ||= "https://api.sendgrid.com/v3/mail/send";
    headers.Authorization = `Bearer ${settings.apiKey}`;
    body = { personalizations: [{ to: [{ email: to }] }], from: { email: settings.fromEmail, name: settings.fromName }, subject: message.subject, content: [{ type: "text/plain", value: message.text }] };
  } else if (settings.provider === "postmark") {
    endpoint ||= "https://api.postmarkapp.com/email";
    headers["X-Postmark-Server-Token"] = settings.apiKey;
    body = { From: from, To: to, Subject: message.subject, TextBody: message.text };
  } else if (settings.provider === "brevo") {
    endpoint ||= "https://api.brevo.com/v3/smtp/email";
    headers["api-key"] = settings.apiKey;
    body = { sender: { name: settings.fromName, email: settings.fromEmail }, to: [{ email: to }], subject: message.subject, textContent: message.text };
  } else if (settings.provider === "mailchannels") {
    endpoint ||= "https://api.mailchannels.net/tx/v1/send";
    body = { personalizations: [{ to: [{ email: to }] }], from: { email: settings.fromEmail, name: settings.fromName }, subject: message.subject, content: [{ type: "text/plain", value: message.text }] };
  } else {
    endpoint ||= "https://api.resend.com/emails";
    headers.Authorization = `Bearer ${settings.apiKey}`;
    body = { from, to, subject: message.subject, text: message.text };
  }

  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  const responseText = await response.text().catch(() => "");
  if (!response.ok) throw new Error(`Email provider returned ${response.status}: ${responseText.slice(0, 240)}`);
  return { provider: settings.provider, to, status: response.status };
}

async function testNotification(DB, body, env, identity) {
  const notificationType = clean(body.notification_type, 80) || "New Signup";
  let result;
  try {
    const sent = await sendProviderEmail(DB, env, {
      subject: `JA Experiences test notification: ${notificationType}`,
      text: `This is a ${notificationType} test notification from the JA Experiences admin centre.`
    });
    result = {
      sent: true,
      message: `Test notification sent successfully using ${sent.provider}.`,
      to: sent.to,
      notificationType
    };
  } catch (error) {
    result = {
      sent: false,
      message: error.message || "Test notification failed.",
      to: (await providerSettings(DB, env)).to,
      notificationType
    };
  }

  await writeAudit(DB, identity, "test_notification", "email", notificationType, result.message, { sent: result.sent, to: result.to, notificationType });
  return result;
}

async function getAuditLog(DB, filters = {}) {
  const where = [];
  const bindings = [];
  if (filters.administrator) {
    where.push(`lower(actor_email) = lower(?)`);
    bindings.push(cleanEmail(filters.administrator));
  }
  if (filters.role) {
    where.push(`role = ?`);
    bindings.push(clean(filters.role, 80));
  }
  if (filters.action) {
    where.push(`action = ?`);
    bindings.push(clean(filters.action, 120));
  }
  if (filters.module) {
    where.push(`entity_type = ?`);
    bindings.push(clean(filters.module, 120));
  }
  if (filters.date_from) {
    where.push(`date(created_at) >= date(?)`);
    bindings.push(clean(filters.date_from, 40));
  }
  if (filters.date_to) {
    where.push(`date(created_at) <= date(?)`);
    bindings.push(clean(filters.date_to, 40));
  }
  if (filters.outcome) {
    where.push(`lower(COALESCE(json_extract(metadata, '$.outcome'), 'success')) = lower(?)`);
    bindings.push(clean(filters.outcome, 40));
  }
  const sql = `SELECT * FROM admin_audit_log${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT 500`;
  return all(DB, sql, bindings);
}

async function getSessions(DB) {
  return all(DB, `
    SELECT token_hash, admin_email, created_at, expires_at, revoked_at, last_used_at
    FROM admin_bypass_sessions
    ORDER BY COALESCE(last_used_at, created_at) DESC
    LIMIT 200
  `);
}

async function getLoginHistory(DB, email) {
  return all(DB, `
    SELECT action, entity_type, entity_id, summary, metadata, created_at, actor_email
    FROM admin_audit_log
    WHERE lower(actor_email) = lower(?)
      AND action IN ('admin_bypass_created', 'admin_bypass_used', 'admin_bypass_removed', 'admin_bypass_expired', 'admin_add', 'admin_remove', 'role_update', 'role_create', 'role_delete', 'role_clone', 'role_rename')
    ORDER BY created_at DESC
    LIMIT 50
  `, [email]);
}

async function getAdminActivity(DB, email) {
  return all(DB, `
    SELECT action, entity_type, entity_id, summary, metadata, created_at, actor_email
    FROM admin_audit_log
    WHERE lower(actor_email) = lower(?)
       OR lower(entity_id) = lower(?)
    ORDER BY created_at DESC
    LIMIT 50
  `, [email, email]);
}

async function adminPayload(DB, identity) {
  const admin = await DB.prepare(`SELECT email, name, role, status, permissions, favourites, source, created_by, created_at, updated_at FROM admin_users WHERE lower(email) = lower(?)`).bind(identity.email).first();
  const storedRole = admin?.role || "Auditor";
  const role = canonicalRoleName(storedRole);
  const effectiveAdmin = admin || { email: identity.email, role, permissions: "[\"*\"]", favourites: "[]" };
  const permissions = await getEffectivePermissions(DB, effectiveAdmin);
  const preferences = await getAdminPreferences(DB, identity);
  const defaultLanding = defaultLandingPageForRole(role, permissions);
  return {
    ...identity,
    role: storedRole,
    effective_role: role,
    permissions,
    allowed_sections: allowedSectionsForPermissions(permissions),
    is_platform_owner: role === "Platform Owner",
    preferences: {
      ...preferences,
      preferred_landing_page: preferences.preferred_landing_page || defaultLanding,
      widget_layout: preferences.dashboard_preferences?.widget_layout || widgetSetForRole(role, permissions).map((widget) => widget.id)
    },
    roles: await getRoles(DB),
    permission_catalog: PERMISSION_CATALOG,
    login_history: await getLoginHistory(DB, identity.email),
    workspace: {
      default_landing_page: defaultLanding,
      widgets: widgetSetForRole(role, permissions)
    }
  };
}

async function exportCustomerData(DB, customerEmail, format = "json") {
  const email = cleanEmail(customerEmail);
  if (!email) throw new Error("Customer email is required.");
  const [profile, dataRequests, systemReports, closures] = await Promise.all([
    DB.prepare(`SELECT * FROM profiles WHERE lower(email) = lower(?)`).bind(email).first(),
    all(DB, `SELECT * FROM data_protection_requests WHERE lower(customer_email) = lower(?) OR lower(user_id) = lower(?)`, [email, email]),
    all(DB, `SELECT * FROM system_reports WHERE lower(customer_email) = lower(?) OR lower(user_id) = lower(?)`, [email, email]),
    all(DB, `SELECT * FROM closure_requests WHERE lower(customer_email) = lower(?)`, [email])
  ]);
  const payload = { profile, dataRequests, systemReports, closureRequests: closures };
  if (format === "csv") {
    return { format: "csv", filename: `${email}-customer-data.csv`, content: rowsToCsv([{ section: "profile", data: JSON.stringify(profile || {}) }, { section: "dataRequests", data: JSON.stringify(dataRequests) }, { section: "systemReports", data: JSON.stringify(systemReports) }, { section: "closureRequests", data: JSON.stringify(closures) }]) };
  }
  return { format: "json", filename: `${email}-customer-data.json`, content: JSON.stringify(payload, null, 2) };
}

async function getStatusPage(DB, prefix) {
  return settingMap(DB, [
    `${prefix}_enabled`,
    `${prefix}_content_mode`,
    `${prefix}_content`
  ], {
    [`${prefix}_enabled`]: "false",
    [`${prefix}_content_mode`]: "plain",
    [`${prefix}_content`]: ""
  });
}

async function saveStatusPage(DB, prefix, body) {
  const mode = body[`${prefix}_content_mode`] === "html" ? "html" : "plain";
  await saveSettings(DB, {
    [`${prefix}_enabled`]: body[`${prefix}_enabled`] ? "true" : "false",
    [`${prefix}_content_mode`]: mode,
    [`${prefix}_content`]: String(body[`${prefix}_content`] ?? "")
  });
  return getStatusPage(DB, prefix);
}

function getMaintenance(DB) {
  return getStatusPage(DB, "maintenance");
}

function saveMaintenance(DB, body) {
  return saveStatusPage(DB, "maintenance", body);
}

function getComingSoon(DB) {
  return getStatusPage(DB, "comingsoon");
}

function saveComingSoon(DB, body) {
  return saveStatusPage(DB, "comingsoon", body);
}

async function getStripeSettings(DB, env) {
  const stored = await settingMap(DB, [
    "stripe_publishable_key",
    "stripe_secret_key",
    "stripe_webhook_signing_secret"
  ], {});

  const publishableKey = stored.stripe_publishable_key || env.STRIPE_PUBLISHABLE_KEY || "";
  const secretKey = stored.stripe_secret_key || env.STRIPE_SECRET_KEY || "";
  const webhookSecret = stored.stripe_webhook_signing_secret || env.STRIPE_WEBHOOK_SECRET || "";

  return {
    publishableKey,
    secretKey,
    webhookSecret,
    source: {
      publishable: stored.stripe_publishable_key ? "D1" : publishableKey ? "environment" : "missing",
      secret: stored.stripe_secret_key ? "D1" : secretKey ? "environment" : "missing",
      webhook: stored.stripe_webhook_signing_secret ? "D1" : webhookSecret ? "environment" : "missing"
    }
  };
}

async function getStripe(DB, env, test = false) {
  const settings = await getStripeSettings(DB, env);
  const configured = Boolean(settings.secretKey);
  const stripe = {
    configured,
    mode: settings.secretKey.startsWith("sk_live_") ? "Live" : settings.secretKey.startsWith("sk_test_") ? "Test" : "Unknown",
    publishable_key_masked: maskSecret(settings.publishableKey, 10, 6),
    secret_key_masked: maskSecret(settings.secretKey),
    webhook_secret_masked: maskSecret(settings.webhookSecret, 7, 5),
    source: settings.source,
    account: null,
    products: [],
    message: configured ? "Stripe secret key is configured." : "Stripe secret key is not configured."
  };

  if (!configured || !test) return stripe;

  const accountResponse = await fetch("https://api.stripe.com/v1/account", {
    headers: { "Authorization": `Bearer ${settings.secretKey}` }
  });
  const account = await accountResponse.json();

  if (!accountResponse.ok) {
    stripe.message = account.error?.message || "Stripe account check failed.";
    return stripe;
  }

  const pricesResponse = await fetch("https://api.stripe.com/v1/prices?limit=20&expand[]=data.product", {
    headers: { "Authorization": `Bearer ${settings.secretKey}` }
  });
  const prices = await pricesResponse.json();

  stripe.account = {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    country: account.country,
    default_currency: account.default_currency
  };
  stripe.products = (prices.data || []).map((price) => ({
    id: price.product?.id || price.product || "",
    name: price.product?.name || "Stripe product",
    active: price.active,
    price_id: price.id,
    currency: price.currency,
    amount: price.unit_amount,
    interval: price.recurring?.interval || price.type
  }));
  stripe.message = "Stripe connection checked successfully.";

  return stripe;
}

async function saveStripe(DB, body, env) {
  const current = await getStripeSettings(DB, env);
  const updates = {
    stripe_publishable_key: clean(body.publishable_key, 300) || current.publishableKey,
    stripe_secret_key: clean(body.secret_key, 300) || current.secretKey,
    stripe_webhook_signing_secret: clean(body.webhook_signing_secret, 300) || current.webhookSecret
  };

  await saveSettings(DB, updates);
  return getStripe(DB, env, Boolean(body.test_connection));
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.DB) return json({ error: "Database binding DB is missing." }, 500);

  await ensureTables(env.DB, env);
  await seedDefaults(env.DB);

  const identity = getAccessIdentity(request);
  if (!identity.email) return json({ error: "Not signed in." }, 401);
  if (!(await isAllowedAdmin(env.DB, identity, env))) {
    return json({ error: "Forbidden.", signedInAs: identity.email }, 403);
  }
  const adminContext = await adminPayload(env.DB, identity);

  const url = new URL(request.url);
  const section = url.searchParams.get("section") || "overview";
  const ownerAccess = ownerBypass(adminContext.permissions, adminContext);

  try {
    if (request.method === "GET") {
      if (!ownerAccess && !canAccessSection(adminContext.permissions, section)) return json({ error: "Forbidden.", section }, 403);
      if (section === "overview") return json({ admin: adminContext, overview: await getOverview(env.DB) });
      if (section === "operations") return json({ admin: adminContext, operations: await getOverview(env.DB) });
      if (section === "analytics") return json({ admin: adminContext, analytics: await getAnalytics(env.DB) });
      if (section === "audit") {
        return json({
          admin: adminContext,
          audit: await getAuditLog(env.DB, Object.fromEntries(url.searchParams.entries())),
          audit_filters: Object.fromEntries(url.searchParams.entries())
        });
      }
      if (section === "prefs") return json({ admin: adminContext, preferences: adminContext.preferences });
      if (section === "admins") return json({ admin: adminContext, admins: await getAdmins(env.DB, env), roles: await getRoles(env.DB), permission_catalog: PERMISSION_CATALOG });
      if (section === "roles") return json({ admin: adminContext, roles: await getRoles(env.DB), permission_catalog: PERMISSION_CATALOG });
      if (section === "sessions") return json({ admin: adminContext, sessions: await getSessions(env.DB) });
      if (section === "customers") {
        return json({
          admin: adminContext,
          customers: await all(env.DB, `
            SELECT email, verified_name, display_name, contact_email, phone, communication_preference,
              support_notes, admin_lifetime, admin_lifetime_plan_id, admin_customer_status, admin_notes,
              created_at, updated_at
            FROM profiles
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 500
          `)
        });
      }
      if (section === "plans") {
        return json({
          admin: adminContext,
          plans: await all(env.DB, `SELECT * FROM service_plans ORDER BY sort_order ASC, plan_name ASC`)
        });
      }
      if (section === "policies") return json({ admin: adminContext, policies: await all(env.DB, `SELECT * FROM policy_pages ORDER BY title ASC`) });
      if (section === "branding") return json({ admin: adminContext, branding: await env.DB.prepare(`SELECT * FROM company_branding WHERE id = 'main'`).first() });
      if (section === "support") return json({ admin: adminContext, support: await all(env.DB, `SELECT * FROM support_tickets ORDER BY updated_at DESC, created_at DESC LIMIT 500`) });
      if (section === "system") return json({ admin: adminContext, system: await all(env.DB, `SELECT * FROM system_events ORDER BY updated_at DESC, created_at DESC LIMIT 500`) });
      if (section === "datarequests") return json({ admin: adminContext, datarequests: await getDataProtectionRequests(env.DB) });
      if (section === "systemreports") return json({ admin: adminContext, systemreports: await getSystemReports(env.DB) });
      if (section === "closures") return json({ admin: adminContext, closures: await getClosureRequests(env.DB) });
      if (section === "affiliate") return json({ admin: adminContext, affiliate: await getAffiliateContent(env.DB) });
      if (section === "appearance") return json({ admin: adminContext, appearance: await getAppearance(env.DB) });
      if (section === "email") return json({ admin: adminContext, email: await getEmailSettings(env.DB, env) });
      if (section === "maintenance") return json({ admin: adminContext, maintenance: await getMaintenance(env.DB) });
      if (section === "comingsoon") return json({ admin: adminContext, comingsoon: await getComingSoon(env.DB) });
      if (section === "stripe") return json({ admin: adminContext, stripe: await getStripe(env.DB, env, url.searchParams.get("test") === "1") });
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (section === "prefs") return json({ preferences: await saveAdminPreferences(env.DB, body, identity), saved: true });
      if (section === "bypass") {
        if (!ownerAccess && !(adminContext.permissions.includes("manage_api") || adminContext.permissions.includes("manage_settings"))) {
          return json({ error: "Forbidden.", section }, 403);
        }
        if (body.action === "remove") {
          const removed = await revokeBypass(env.DB, request, identity);
          return jsonWithHeaders({ bypass: { active: false }, saved: true }, { "Set-Cookie": removed.cookie });
        }
        const bypass = await createBypass(env.DB, identity);
        return jsonWithHeaders({ bypass: { active: true, expires: bypass.expires, redirect: "/" }, saved: true }, { "Set-Cookie": bypass.cookie });
      }
      if (body.action === "export_customer_data") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_users", "manage_crm"])) {
          return json({ error: "Forbidden.", section }, 403);
        }
        const exported = await exportCustomerData(env.DB, body.customer_email || body.user_id, clean(body.format, 20) || "json");
        await writeAudit(env.DB, identity, "customer_data_export", "profiles", cleanEmail(body.customer_email || body.user_id), "Exported customer CRM data.", { format: exported.format });
        return json({ export: exported, saved: true });
      }
      if (section === "admins") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_admins", "manage_roles", "manage_permissions"])) {
          return json({ error: "Forbidden.", section }, 403);
        }
        if (body.action === "remove") {
          await removeAdmin(env.DB, body, identity, env);
          await writeAudit(env.DB, identity, "admin_remove", "admin_users", cleanEmail(body.email), `Removed admin access for ${cleanEmail(body.email)}.`, {});
        } else if (body.action === "suspend") {
          await updateAdmin(env.DB, { ...body, status: "Suspended" }, identity, env);
          await writeAudit(env.DB, identity, "admin_suspend", "admin_users", cleanEmail(body.email), `Suspended admin ${cleanEmail(body.email)}.`, {});
        } else if (body.action === "reactivate") {
          await updateAdmin(env.DB, { ...body, status: "Active" }, identity, env);
          await writeAudit(env.DB, identity, "admin_reactivate", "admin_users", cleanEmail(body.email), `Reactivated admin ${cleanEmail(body.email)}.`, {});
        } else if (body.action === "update") {
          await updateAdmin(env.DB, body, identity, env);
          await writeAudit(env.DB, identity, "admin_update", "admin_users", cleanEmail(body.email), `Updated admin ${cleanEmail(body.email)}.`, {});
        } else {
          await addAdmin(env.DB, body, identity);
          await writeAudit(env.DB, identity, "admin_add", "admin_users", cleanEmail(body.email), `Added admin ${cleanEmail(body.email)}.`, {});
        }
        return json({ admins: await getAdmins(env.DB, env), saved: true });
      }
      if (section === "roles") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_roles", "manage_permissions"])) {
          return json({ error: "Forbidden.", section }, 403);
        }
        if (body.action === "create") return json({ roles: await createRole(env.DB, body, identity), saved: true });
        if (body.action === "update") return json({ roles: await updateRole(env.DB, body, identity), saved: true });
        if (body.action === "rename") return json({ roles: await renameRole(env.DB, body, identity), saved: true });
        if (body.action === "clone") return json({ roles: await cloneRole(env.DB, body, identity), saved: true });
        if (body.action === "delete") return json({ roles: await deleteRole(env.DB, body, identity), saved: true });
        throw new Error("Unknown role action.");
      }
      if (section === "sessions") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_admins", "manage_audit", "manage_api"])) {
          return json({ error: "Forbidden.", section }, 403);
        }
        if (body.action === "revoke") {
          await DB.prepare(`UPDATE admin_bypass_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(clean(body.token_hash, 120)).run();
          await writeAudit(env.DB, identity, "session_revoke", "admin_bypass_sessions", clean(body.token_hash, 120), "Revoked an admin session.", {});
          return json({ sessions: await getSessions(env.DB), saved: true });
        }
        throw new Error("Unknown session action.");
      }
      if (section === "plans") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_plans", "manage_pricing"])) {
          return json({ error: "Forbidden.", section }, 403);
        }
        if (body.action === "save_visibility") {
          const result = await savePlanVisibility(env.DB, body);
          await writeAudit(env.DB, identity, "plan_visibility_save", "service_plans", "bulk", "Saved plan visibility changes.", {});
          return json(result);
        }
        const plans = await savePlan(env.DB, body);
        await writeAudit(env.DB, identity, "plan_save", "service_plans", clean(body.id, 120), `Saved plan ${clean(body.plan_name, 180)}.`, {});
        return json({ plans, saved: true });
      }
      if (section === "policies") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_policies", "manage_content"])) return json({ error: "Forbidden.", section }, 403);
        const policies = await savePolicy(env.DB, body);
        await writeAudit(env.DB, identity, "policy_save", "policy_pages", cleanSlug(body.slug), `Saved policy ${clean(body.title, 180)}.`, { status: clean(body.status, 80) });
        return json({ policies, saved: true });
      }
      if (section === "branding") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_branding", "manage_content"])) return json({ error: "Forbidden.", section }, 403);
        const branding = await saveBranding(env.DB, body);
        await writeAudit(env.DB, identity, "branding_update", "company_branding", "main", "Updated company branding.", { serviceName: clean(body.service_name, 180) });
        return json({ branding, saved: true });
      }
      if (section === "support") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_support", "manage_crm"])) return json({ error: "Forbidden.", section }, 403);
        const support = await saveSupport(env.DB, body);
        await writeAudit(env.DB, identity, "support_update", "support_tickets", clean(body.id, 120), `Updated support ticket ${clean(body.subject, 250)}.`, { status: clean(body.status, 80), priority: clean(body.priority, 80) });
        return json({ support, saved: true });
      }
      if (section === "system") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_settings"])) return json({ error: "Forbidden.", section }, 403);
        const system = await saveSystemEvent(env.DB, body);
        await writeAudit(env.DB, identity, "system_issue_update", "system_events", clean(body.id, 120), `Updated system issue ${clean(body.title, 250)}.`, { status: clean(body.status, 80), severity: clean(body.severity, 80) });
        return json({ system, saved: true });
      }
      if (section === "datarequests") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_data_requests"])) return json({ error: "Forbidden.", section }, 403);
        return json({ datarequests: await saveDataProtectionRequest(env.DB, body, identity, env), saved: true });
      }
      if (section === "systemreports") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_system_reports", "manage_audit"])) return json({ error: "Forbidden.", section }, 403);
        return json({ systemreports: await saveSystemReport(env.DB, body, identity), saved: true });
      }
      if (section === "closures") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_closure_requests"])) return json({ error: "Forbidden.", section }, 403);
        return json({ closures: await saveClosureRequest(env.DB, body, identity), saved: true });
      }
      if (section === "affiliate") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_content"])) return json({ error: "Forbidden.", section }, 403);
        return json({ affiliate: await saveAffiliateContent(env.DB, body, identity), saved: true });
      }
      if (section === "appearance") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_settings"])) return json({ error: "Forbidden.", section }, 403);
        return json({ appearance: await saveAppearance(env.DB, body, identity), saved: true });
      }
      if (section === "email") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_email"])) return json({ error: "Forbidden.", section }, 403);
        if (body.action === "test") return json({ email: await getEmailSettings(env.DB, env), test: await testNotification(env.DB, body, env, identity), saved: true });
        return json({ email: await saveEmailSettings(env.DB, body, env, identity), saved: true });
      }
      if (section === "maintenance") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_content"])) return json({ error: "Forbidden.", section }, 403);
        const previous = await getMaintenance(env.DB);
        const maintenance = await saveMaintenance(env.DB, body);
        await writeAudit(env.DB, identity, "maintenance_update", "site_settings", "maintenance", `Maintenance mode ${body.maintenance_enabled ? "enabled" : "disabled"}.`, {
          previousValue: previous,
          newValue: maintenance
        });
        return json({ maintenance, saved: true });
      }
      if (section === "comingsoon") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_content"])) return json({ error: "Forbidden.", section }, 403);
        const previous = await getComingSoon(env.DB);
        const comingsoon = await saveComingSoon(env.DB, body);
        await writeAudit(env.DB, identity, "comingsoon_update", "site_settings", "comingsoon", `Coming Soon page ${body.comingsoon_enabled ? "enabled" : "disabled"}.`, {
          previousValue: previous,
          newValue: comingsoon
        });
        return json({ comingsoon, saved: true });
      }
      if (section === "stripe") {
        if (!ownerAccess && !hasAnyPermission(adminContext.permissions, ["manage_stripe"])) return json({ error: "Forbidden.", section }, 403);
        const stripe = await saveStripe(env.DB, body, env);
        await writeAudit(env.DB, identity, "stripe_settings_update", "site_settings", "stripe", "Updated Stripe API controls.", { tested: Boolean(body.test_connection), mode: stripe.mode });
        return json({ stripe, saved: true });
      }
    }

    return json({ error: "Method or section not allowed." }, 405);
  } catch (error) {
    return json({ error: error.message || "Admin API error." }, 500);
  }
}
