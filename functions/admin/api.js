const DEFAULT_ADMIN_EMAIL = "alfieholywoodmurray@jagroupservices.co.uk";
const CLOSURE_STATUSES = ["Open", "In Progress", "Approved", "Rejected", "Completed"];
const DPR_STATUSES = ["Received", "Verifying Identity", "In Progress", "Ready to Send", "Sent", "Closed", "Rejected"];
const SYSTEM_REPORT_STATUSES = ["Open", "In Progress", "Resolved", "Rejected"];
const THEME_MODES = ["light", "dark", "system"];

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

  for (const email of configuredAdmins(env)) {
    await DB.prepare(`
      INSERT INTO admin_users (email, name, source, created_by, updated_at)
      VALUES (?, ?, 'default', 'system', CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        source = CASE WHEN admin_users.source = 'portal' THEN admin_users.source ELSE 'default' END,
        updated_at = CURRENT_TIMESTAMP
    `).bind(email, email).run();
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
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN contact_email TEXT`);
  await safeAlter(DB, `ALTER TABLE company_branding ADD COLUMN registered_notice TEXT`);

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

async function isAllowedAdmin(DB, identity, env) {
  if (!identity.email) return false;
  if (configuredAdmins(env).includes(identity.email)) return true;

  const row = await DB.prepare(`SELECT email FROM admin_users WHERE lower(email) = lower(?)`).bind(identity.email).first();
  return Boolean(row);
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

async function seedDefaults(DB) {
  const planCount = await DB.prepare(`SELECT COUNT(*) AS count FROM service_plans`).first();

  if (!planCount || Number(planCount.count) === 0) {
    const plans = [
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
      `).bind(...plan).run();
    }
  }

  const branding = await DB.prepare(`SELECT id FROM company_branding WHERE id = 'main'`).first();
  if (!branding) {
    await DB.prepare(`
      INSERT INTO company_branding (
        id, business_name, trading_name, service_name, support_email, contact_email,
        phone, website, registered_notice, footer_notice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      "JA Experiences & Discovery is operated by JA Group Services Ltd."
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
    maintenanceStatus: maintenance.maintenance_enabled === "true" ? "On" : "Off"
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
      rows.push({ email, name: email, source: "default", created_by: "system", created_at: null, updated_at: null });
    }
  }
  return rows.sort((a, b) => a.email.localeCompare(b.email));
}

async function addAdmin(DB, body, identity) {
  const email = cleanEmail(body.email);
  if (!isEmail(email)) throw new Error("Enter a valid admin email address.");

  await DB.prepare(`
    INSERT INTO admin_users (email, name, source, created_by, updated_at)
    VALUES (?, ?, 'portal', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      updated_at = CURRENT_TIMESTAMP
  `).bind(email, clean(body.name || email, 180), identity.email).run();
}

async function removeAdmin(DB, body, identity, env) {
  const email = cleanEmail(body.email);
  if (!isEmail(email)) throw new Error("Admin email is required.");

  const admins = await getAdmins(DB, env);
  if (admins.length <= 1) throw new Error("The last remaining admin cannot be removed.");
  if (configuredAdmins(env).includes(email)) throw new Error("Default environment admins cannot be removed from the portal.");
  if (email === identity.email && admins.length <= 1) throw new Error("You cannot remove the final admin account.");

  await DB.prepare(`DELETE FROM admin_users WHERE lower(email) = lower(?)`).bind(email).run();
}

async function savePlan(DB, body) {
  const id = clean(body.id, 120) || crypto.randomUUID();
  const planName = clean(body.plan_name, 180);
  if (!planName) throw new Error("Plan name is required.");

  await DB.prepare(`
    INSERT INTO service_plans (
      id, plan_name, plan_type, price_label, price_pence, stripe_product_id, stripe_price_id,
      delivery_time, revisions, description, button_label, is_active, is_featured, sort_order, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
      is_active = excluded.is_active,
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
    body.is_active ? 1 : 0,
    body.is_featured ? 1 : 0,
    Number(body.sort_order || 100)
  ).run();

  return all(DB, `SELECT * FROM service_plans ORDER BY sort_order ASC, plan_name ASC`);
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
      phone, website, registered_notice, footer_notice, updated_at
    )
    VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
    clean(body.footer_notice, 1000)
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

async function saveDataProtectionRequest(DB, body, identity) {
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
  if (body.action === "delete") {
    await DB.prepare(`DELETE FROM affiliate_content_blocks WHERE id = ?`).bind(id).run();
    await writeAudit(DB, identity, "affiliate_content_delete", "affiliate_content_blocks", id, "Deleted affiliate content block.", {});
    return getAffiliateContent(DB);
  }

  const title = clean(body.title, 180);
  if (!title) throw new Error("Content block title is required.");

  await DB.prepare(`
    INSERT INTO affiliate_content_blocks (
      id, block_type, title, body, widget_code, cta_label, cta_url, legal_notice,
      is_enabled, is_published, sort_order, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
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
    "smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_from_name", "smtp_from_email", "smtp_security"
  ], {
    smtp_host: "smtp.jagroupservices.co.uk",
    smtp_port: "587",
    smtp_username: "noreply@jagroupservices.co.uk",
    smtp_from_name: "JA Smart Profile",
    smtp_from_email: "noreply@jagroupservices.co.uk",
    smtp_security: "STARTTLS"
  });

  return {
    smtp_host: settings.smtp_host,
    smtp_port: settings.smtp_port,
    smtp_username: settings.smtp_username,
    smtp_password_masked: maskSecret(settings.smtp_password || ""),
    smtp_from_name: settings.smtp_from_name,
    smtp_from_email: settings.smtp_from_email,
    smtp_security: settings.smtp_security,
    admin_notification_email: env.ADMIN_NOTIFICATION_EMAIL || "",
    configured: Boolean(settings.smtp_host && settings.smtp_username && (settings.smtp_password || env.SMTP_PASSWORD))
  };
}

async function saveEmailSettings(DB, body, env, identity) {
  const current = await settingMap(DB, ["smtp_password"], {});
  await saveSettings(DB, {
    smtp_host: clean(body.smtp_host, 250) || "smtp.jagroupservices.co.uk",
    smtp_port: clean(body.smtp_port, 10) || "587",
    smtp_username: clean(body.smtp_username, 254) || "noreply@jagroupservices.co.uk",
    smtp_password: clean(body.smtp_password, 500) || current.smtp_password || env.SMTP_PASSWORD || "",
    smtp_from_name: clean(body.smtp_from_name, 180) || "JA Smart Profile",
    smtp_from_email: clean(body.smtp_from_email, 254) || "noreply@jagroupservices.co.uk",
    smtp_security: clean(body.smtp_security, 40) || "STARTTLS"
  });
  await writeAudit(DB, identity, "smtp_settings_update", "site_settings", "email", "Updated Email (SMTP) settings.", { host: clean(body.smtp_host, 250), username: clean(body.smtp_username, 254) });
  return getEmailSettings(DB, env);
}

async function testNotification(DB, body, env, identity) {
  const settings = await getEmailSettings(DB, env);
  const notificationType = clean(body.notification_type, 80) || "New Signup";
  const target = env.ADMIN_NOTIFICATION_EMAIL || "";
  const canSend = Boolean(env.EMAIL_API_ENDPOINT && env.EMAIL_API_TOKEN && target);
  let result = {
    sent: false,
    message: "Test notification was logged, but no HTTP email provider is configured for Cloudflare Pages Functions. Raw SMTP cannot be sent directly from this runtime.",
    to: target,
    notificationType
  };

  if (canSend) {
    const response = await fetch(env.EMAIL_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.EMAIL_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: target,
        from: settings.smtp_from_email,
        fromName: settings.smtp_from_name,
        subject: `JA Experiences test notification: ${notificationType}`,
        text: `This is a ${notificationType} test notification from the JA Experiences admin centre.`
      })
    });
    result = {
      sent: response.ok,
      message: response.ok ? "Test notification sent successfully." : `Email provider returned ${response.status}.`,
      to: target,
      notificationType
    };
  }

  await writeAudit(DB, identity, "test_notification", "email", notificationType, result.message, { sent: result.sent, to: target, notificationType });
  return result;
}

async function getAuditLog(DB) {
  return all(DB, `SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 500`);
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

async function getMaintenance(DB) {
  return settingMap(DB, [
    "maintenance_enabled",
    "maintenance_title",
    "maintenance_message",
    "maintenance_eta"
  ], {
    maintenance_enabled: "false",
    maintenance_title: "We'll be back shortly.",
    maintenance_message: "JA Experiences & Discovery is temporarily unavailable while essential maintenance is carried out.",
    maintenance_eta: ""
  });
}

async function saveMaintenance(DB, body) {
  await saveSettings(DB, {
    maintenance_enabled: body.maintenance_enabled ? "true" : "false",
    maintenance_title: clean(body.maintenance_title, 180) || "We'll be back shortly.",
    maintenance_message: clean(body.maintenance_message, 1000) || "JA Experiences & Discovery is temporarily unavailable while essential maintenance is carried out.",
    maintenance_eta: clean(body.maintenance_eta, 180)
  });

  return getMaintenance(DB);
}

async function getComingSoon(DB) {
  return settingMap(DB, [
    "comingsoon_enabled",
    "comingsoon_title",
    "comingsoon_message",
    "comingsoon_eta"
  ], {
    comingsoon_enabled: "false",
    comingsoon_title: "JA Experiences & Discovery is coming soon.",
    comingsoon_message: "Our new experiences and discovery service is being prepared. Please check back soon.",
    comingsoon_eta: ""
  });
}

async function saveComingSoon(DB, body) {
  await saveSettings(DB, {
    comingsoon_enabled: body.comingsoon_enabled ? "true" : "false",
    comingsoon_title: clean(body.comingsoon_title, 180) || "JA Experiences & Discovery is coming soon.",
    comingsoon_message: clean(body.comingsoon_message, 1000) || "Our new experiences and discovery service is being prepared. Please check back soon.",
    comingsoon_eta: clean(body.comingsoon_eta, 180)
  });

  return getComingSoon(DB);
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

  const url = new URL(request.url);
  const section = url.searchParams.get("section") || "overview";

  try {
    if (request.method === "GET") {
      if (section === "overview") return json({ admin: identity, overview: await getOverview(env.DB) });
      if (section === "analytics") return json({ admin: identity, analytics: await getAnalytics(env.DB) });
      if (section === "admins") return json({ admin: identity, admins: await getAdmins(env.DB, env) });
      if (section === "customers") {
        return json({
          admin: identity,
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
      if (section === "plans") return json({ admin: identity, plans: await all(env.DB, `SELECT * FROM service_plans ORDER BY sort_order ASC, plan_name ASC`) });
      if (section === "policies") return json({ admin: identity, policies: await all(env.DB, `SELECT * FROM policy_pages ORDER BY title ASC`) });
      if (section === "branding") return json({ admin: identity, branding: await env.DB.prepare(`SELECT * FROM company_branding WHERE id = 'main'`).first() });
      if (section === "support") return json({ admin: identity, support: await all(env.DB, `SELECT * FROM support_tickets ORDER BY updated_at DESC, created_at DESC LIMIT 500`) });
      if (section === "system") return json({ admin: identity, system: await all(env.DB, `SELECT * FROM system_events ORDER BY updated_at DESC, created_at DESC LIMIT 500`) });
      if (section === "datarequests") return json({ admin: identity, datarequests: await getDataProtectionRequests(env.DB) });
      if (section === "systemreports") return json({ admin: identity, systemreports: await getSystemReports(env.DB) });
      if (section === "closures") return json({ admin: identity, closures: await getClosureRequests(env.DB) });
      if (section === "affiliate") return json({ admin: identity, affiliate: await getAffiliateContent(env.DB) });
      if (section === "appearance") return json({ admin: identity, appearance: await getAppearance(env.DB) });
      if (section === "email") return json({ admin: identity, email: await getEmailSettings(env.DB, env) });
      if (section === "audit") return json({ admin: identity, audit: await getAuditLog(env.DB) });
      if (section === "maintenance") return json({ admin: identity, maintenance: await getMaintenance(env.DB) });
      if (section === "comingsoon") return json({ admin: identity, comingsoon: await getComingSoon(env.DB) });
      if (section === "stripe") return json({ admin: identity, stripe: await getStripe(env.DB, env, url.searchParams.get("test") === "1") });
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (body.action === "export_customer_data") {
        const exported = await exportCustomerData(env.DB, body.customer_email || body.user_id, clean(body.format, 20) || "json");
        await writeAudit(env.DB, identity, "customer_data_export", "profiles", cleanEmail(body.customer_email || body.user_id), "Exported customer CRM data.", { format: exported.format });
        return json({ export: exported, saved: true });
      }
      if (section === "admins") {
        if (body.action === "remove") await removeAdmin(env.DB, body, identity, env);
        else await addAdmin(env.DB, body, identity);
        await writeAudit(env.DB, identity, body.action === "remove" ? "admin_remove" : "admin_add", "admin_users", cleanEmail(body.email), `Updated admin access for ${cleanEmail(body.email)}.`, {});
        return json({ admins: await getAdmins(env.DB, env), saved: true });
      }
      if (section === "plans") {
        const plans = await savePlan(env.DB, body);
        await writeAudit(env.DB, identity, "plan_save", "service_plans", clean(body.id, 120), `Saved plan ${clean(body.plan_name, 180)}.`, {});
        return json({ plans, saved: true });
      }
      if (section === "policies") {
        const policies = await savePolicy(env.DB, body);
        await writeAudit(env.DB, identity, "policy_save", "policy_pages", cleanSlug(body.slug), `Saved policy ${clean(body.title, 180)}.`, { status: clean(body.status, 80) });
        return json({ policies, saved: true });
      }
      if (section === "branding") return json({ branding: await saveBranding(env.DB, body), saved: true });
      if (section === "support") return json({ support: await saveSupport(env.DB, body), saved: true });
      if (section === "system") return json({ system: await saveSystemEvent(env.DB, body), saved: true });
      if (section === "datarequests") return json({ datarequests: await saveDataProtectionRequest(env.DB, body, identity), saved: true });
      if (section === "systemreports") return json({ systemreports: await saveSystemReport(env.DB, body, identity), saved: true });
      if (section === "closures") return json({ closures: await saveClosureRequest(env.DB, body, identity), saved: true });
      if (section === "affiliate") return json({ affiliate: await saveAffiliateContent(env.DB, body, identity), saved: true });
      if (section === "appearance") return json({ appearance: await saveAppearance(env.DB, body, identity), saved: true });
      if (section === "email") {
        if (body.action === "test") return json({ email: await getEmailSettings(env.DB, env), test: await testNotification(env.DB, body, env, identity), saved: true });
        return json({ email: await saveEmailSettings(env.DB, body, env, identity), saved: true });
      }
      if (section === "maintenance") return json({ maintenance: await saveMaintenance(env.DB, body), saved: true });
      if (section === "comingsoon") return json({ comingsoon: await saveComingSoon(env.DB, body), saved: true });
      if (section === "stripe") return json({ stripe: await saveStripe(env.DB, body, env), saved: true });
    }

    return json({ error: "Method or section not allowed." }, 405);
  } catch (error) {
    return json({ error: error.message || "Admin API error." }, 500);
  }
}
