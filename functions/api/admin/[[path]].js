import { getNativeSession, withIdentity, assertSameOrigin } from "../../_shared/oidc.js";
import { onRequest as legacyAdminApi } from "../../admin/api.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function pathParts(context) {
  const value = context.params?.path;
  const raw = Array.isArray(value) ? value.join("/") : String(value || "");
  return raw.split("/").filter(Boolean).map(decodeURIComponent);
}

async function bodyOf(request) {
  try { return await request.json(); } catch { return {}; }
}

async function all(DB, sql, bindings = []) {
  const result = await DB.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function tableHasColumn(DB, table, column) {
  const rows = await all(DB, `PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

function parse(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function normaliseStatus(value, fallback = "active") {
  const status = String(value || fallback).trim().toLowerCase().replaceAll(" ", "_");
  if (status === "standard") return "active";
  return status;
}

function splitName(name, email) {
  const bits = String(name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: bits[0] || String(email || "").split("@")[0] || "Customer",
    lastName: bits.slice(1).join(" ")
  };
}

async function audit(DB, identity, action, entityType, entityId, summary, metadata = {}) {
  await DB.prepare(`INSERT INTO admin_audit_log
    (id, actor_email, action, entity_type, entity_id, summary, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), identity.email, action, entityType, entityId, summary, JSON.stringify(metadata)).run();
}

async function callLegacy(context, identity, section, options = {}) {
  const url = new URL(context.request.url);
  url.pathname = "/admin/api";
  url.searchParams.set("section", section);
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  // Build identity headers without cloning the incoming body. Some adapters parse the
  // original JSON before forwarding a transformed mutation to the established API.
  const identitySource = withIdentity(new Request(context.request.url, { headers: context.request.headers }), identity);
  const headers = new Headers(identitySource.headers);
  headers.delete("content-length");
  const request = new Request(url, {
    method: options.method || context.request.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  if (options.body !== undefined) request.headers.set("Content-Type", "application/json");
  return legacyAdminApi({ ...context, request });
}

async function legacyData(context, identity, section, options = {}) {
  const response = await callLegacy(context, identity, section, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "Administration request failed."), { status: response.status });
  return data;
}

function customerRow(row) {
  const name = row.display_name || row.verified_name || row.customer_name || "";
  const names = splitName(name, row.email);
  const lifetime = Boolean(Number(row.admin_lifetime || 0));
  const status = normaliseStatus(row.admin_customer_status, "active");
  return {
    id: row.customer_id || row.email,
    email: row.email,
    displayName: name || `${names.firstName} ${names.lastName}`.trim(),
    firstName: names.firstName,
    lastName: names.lastName,
    company: row.company || null,
    photoUrl: row.photo_url || null,
    oidcSub: row.oidc_sub || null,
    tenantId: row.tenant_id || null,
    authMethod: row.auth_method || "microsoft",
    role: row.app_role || "user",
    accountStatus: status,
    plan: row.admin_lifetime_plan_id || row.subscription_plan || row.assigned_plan || "free",
    usageType: row.usage_type || "both",
    isVerified: Boolean(row.verified_name || row.display_name),
    planIsLifetime: lifetime,
    planExpiresAt: row.plan_expires_at || row.trial_end || null,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || null,
    lastLogin: row.last_activity || row.updated_at || null,
    subscriptionStatus: row.subscription_status || null,
    builderUsage: Number(row.builder_usage || 0),
    tokenBalance: Number(row.token_balance || 0)
  };
}

async function getCustomers(context, identity) {
  const data = await legacyData(context, identity, "customers", { method: "GET" });
  const users = (data.customers || []).map(customerRow);
  return json({ success: true, users, customers: users, total: users.length });
}

async function createCustomer(context, identity) {
  const body = await bodyOf(context.request);
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return json({ success: false, error: "A valid email address is required." }, 400);
  const displayName = `${String(body.firstName || "").trim()} ${String(body.lastName || "").trim()}`.trim() || email;
  await context.env.DB.prepare(`INSERT INTO profiles
    (email, verified_name, display_name, contact_email, admin_customer_status, admin_lifetime_plan_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'Active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name, contact_email=excluded.contact_email,
      admin_lifetime_plan_id=excluded.admin_lifetime_plan_id, updated_at=CURRENT_TIMESTAMP`)
    .bind(email, displayName, displayName, email, String(body.plan || "free")).run();
  await audit(context.env.DB, identity, "customer.create", "customer", email, `Created customer ${email}.`);
  return json({ success: true, id: email }, 201);
}

async function getCustomer(context, identity, email) {
  const data = await legacyData(context, identity, "customer", { method: "GET", query: { email } });
  if (!data.customer?.email) return json({ success: false, error: "Customer not found." }, 404);
  const customer = customerRow(data.customer);
  const outputs = data.customer.builderOutputs || [];
  const recent = outputs.map((item) => ({
    uuid: item.id, title: item.title, templateId: item.builder_id,
    status: normaliseStatus(item.status, "completed"), createdAt: item.created_at, updatedAt: item.updated_at
  }));
  const completed = recent.filter((item) => item.status === "completed").length;
  return json({
    success: true,
    profile: {
      customer,
      subscription: data.customer.billing?.subscription || data.customer.billing || null,
      documents: { total: recent.length, drafts: recent.filter((x) => x.status === "draft").length, completed, archived: 0, recent }
    },
    customer,
    plans: data.plans || [],
    verification: data.verification || null
  });
}

async function patchCustomer(context, identity, email) {
  const body = await bodyOf(context.request);
  const existing = await context.env.DB.prepare("SELECT * FROM profiles WHERE lower(email)=lower(?)").bind(email).first();
  if (!existing) return json({ success: false, error: "Customer not found." }, 404);
  const action = String(body.action || "update_profile");
  let status = existing.admin_customer_status || "Active";
  let lifetime = Number(existing.admin_lifetime || 0);
  let plan = existing.admin_lifetime_plan_id || "free";
  if (["suspend", "suspend_account"].includes(action)) status = "Suspended";
  if (["activate", "reactivate_account"].includes(action)) status = "Active";
  if (["grant_lifetime", "change_lifetime"].includes(action)) { lifetime = 1; plan = String(body.plan || plan); }
  if (action === "revoke_lifetime") { lifetime = 0; plan = "free"; }
  if (["change_plan", "override_plan"].includes(action)) plan = String(body.plan || plan);
  const requestedName = `${String(body.firstName ?? "").trim()} ${String(body.lastName ?? "").trim()}`.trim();
  const displayName = requestedName || existing.display_name || existing.verified_name || email;
  await context.env.DB.prepare(`UPDATE profiles SET
    display_name=?, contact_email=?, company=?, usage_type=?, app_role=?, admin_customer_status=?, admin_lifetime=?, admin_lifetime_plan_id=?, plan_expires_at=?,
    admin_notes=COALESCE(?, admin_notes), admin_updated_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
    WHERE lower(email)=lower(?)`)
    .bind(displayName, String(body.email || existing.contact_email || email), body.company ?? existing.company ?? null,
      body.usageType ?? existing.usage_type ?? "both", body.role ?? existing.app_role ?? "user", status, lifetime, plan,
      body.planExpiresAt ?? existing.plan_expires_at ?? null, body.note || null, email).run();
  if (action === "verify" && !existing.verified_name) {
    await context.env.DB.prepare("UPDATE profiles SET verified_name=display_name WHERE lower(email)=lower(?)").bind(email).run();
  }
  await audit(context.env.DB, identity, `customer.${action}`, "customer", email, `Updated customer ${email}.`, { action, plan, status });
  return json({ success: true, customer: customerRow({ ...existing, display_name: displayName, admin_customer_status: status, admin_lifetime: lifetime, admin_lifetime_plan_id: plan }) });
}

async function settings(context) {
  const DB = context.env.DB;
  if (context.request.method === "GET") {
    const rows = await all(DB, "SELECT key,value FROM site_settings ORDER BY key");
    return json({ success: true, settings: Object.fromEntries(rows.map((row) => [row.key, row.value])), config: Object.fromEntries(rows.map((row) => [row.key, row.value])) });
  }
  const body = await bodyOf(context.request);
  const values = body.settings && typeof body.settings === "object" ? body.settings
    : body.config && typeof body.config === "object" ? body.config
    : body.key ? { [body.key]: body.value } : body;
  const entries = Object.entries(values).filter(([key]) => /^[a-zA-Z0-9_.-]{1,100}$/.test(key));
  if (!entries.length) return json({ success: false, error: "No valid settings were supplied." }, 400);
  const hasUpdatedAt = await tableHasColumn(DB, "site_settings", "updated_at");
  const sql = hasUpdatedAt
    ? `INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`
    : `INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`;
  await DB.batch(entries.map(([key, value]) => DB.prepare(sql).bind(key, typeof value === "string" ? value : JSON.stringify(value))));
  return json({ success: true, saved: entries.length });
}

async function stats(context) {
  const DB = context.env.DB;
  const safeFirst = (sql) => DB.prepare(sql).first().catch(() => ({ count: 0 }));
  const safeAll = (sql) => all(DB, sql).catch(() => []);
  const [users, documents, paid, recentDocuments, recentUsers] = await Promise.all([
    safeFirst("SELECT COUNT(*) AS count FROM profiles"),
    safeFirst("SELECT COUNT(*) AS count FROM builder_outputs WHERE archived_at IS NULL"),
    safeFirst("SELECT COUNT(*) AS count FROM profiles WHERE lower(COALESCE(admin_customer_status,'free')) NOT IN ('free','standard')"),
    safeAll("SELECT id AS uuid,title,builder_id AS templateId,status,created_at AS createdAt,updated_at AS updatedAt FROM builder_outputs WHERE archived_at IS NULL ORDER BY created_at DESC LIMIT 8"),
    safeAll("SELECT email AS id,email,COALESCE(display_name,verified_name,email) AS displayName,created_at AS createdAt FROM profiles ORDER BY created_at DESC LIMIT 8")
  ]);
  return json({ success: true, stats: {
    totalUsers: Number(users?.count || 0),
    totalDocuments: Number(documents?.count || 0),
    paidUsers: Number(paid?.count || 0),
    recentDocuments,
    recentUsers,
    planBreakdown: [],
    usageBreakdown: []
  }});
}

async function users(context, identity) {
  const data = await legacyData(context, identity, "admins", { method: "GET" });
  const users = (data.admins || []).map((row) => ({
    id: row.email, name: row.name || row.email, email: row.email,
    role: row.role || "Admin", isPlatformOwner: row.role === "Platform Owner",
    isVerified: normaliseStatus(row.status) === "active", createdAt: row.created_at,
    lastLogin: row.last_login || row.updated_at
  }));
  return json({ success: true, users });
}

async function ensureBuilderTemplates(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS builder_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT, template_id TEXT NOT NULL, builder_id TEXT NOT NULL,
    name TEXT NOT NULL, description TEXT, category TEXT NOT NULL, subcategory TEXT,
    industries TEXT, plan_required TEXT DEFAULT 'free', access_level TEXT DEFAULT 'all', org_restriction TEXT,
    status TEXT DEFAULT 'active', popular INTEGER DEFAULT 0, is_featured INTEGER DEFAULT 0,
    is_draft INTEGER DEFAULT 0, is_published INTEGER DEFAULT 1, is_archived INTEGER DEFAULT 0,
    supports_branding INTEGER DEFAULT 0, show_doc_header INTEGER DEFAULT 0, accent_color TEXT,
    default_layout TEXT, body_template TEXT, fields TEXT, layout_config TEXT, required_fields TEXT,
    optional_fields TEXT, tags TEXT, sort_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1,
    version_notes TEXT, thumbnail_url TEXT, preview_url TEXT, use_count INTEGER DEFAULT 0,
    created_by TEXT, updated_by TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(builder_id, template_id)
  )`).run();
}

function builderTemplate(row) {
  const bool = (value) => Boolean(Number(value));
  return {
    id: row.id, templateId: row.template_id, builderId: row.builder_id, name: row.name,
    description: row.description || "", category: row.category, subcategory: row.subcategory,
    industries: parse(row.industries, []), planRequired: row.plan_required || "free",
    accessLevel: row.access_level || "all", orgRestriction: row.org_restriction,
    status: row.status || "active", popular: bool(row.popular), isFeatured: bool(row.is_featured),
    isDraft: bool(row.is_draft), isPublished: bool(row.is_published), isArchived: bool(row.is_archived),
    supportsBranding: bool(row.supports_branding), showDocHeader: bool(row.show_doc_header),
    accentColor: row.accent_color, defaultLayout: row.default_layout, bodyTemplate: row.body_template || "",
    fields: parse(row.fields, []), layoutConfig: parse(row.layout_config, null), requiredFields: parse(row.required_fields, []),
    optionalFields: parse(row.optional_fields, []), tags: parse(row.tags, []), sortOrder: Number(row.sort_order || 0),
    version: Number(row.version || 1), versionNotes: row.version_notes, thumbnailUrl: row.thumbnail_url,
    previewUrl: row.preview_url, useCount: Number(row.use_count || 0), createdBy: row.created_by,
    updatedBy: row.updated_by, createdAt: row.created_at, updatedAt: row.updated_at
  };
}

const TEMPLATE_FIELDS = {
  name: "name", description: "description", category: "category", subcategory: "subcategory",
  industries: "industries", planRequired: "plan_required", accessLevel: "access_level", orgRestriction: "org_restriction",
  status: "status", popular: "popular", isFeatured: "is_featured", isDraft: "is_draft", isPublished: "is_published",
  isArchived: "is_archived", supportsBranding: "supports_branding", showDocHeader: "show_doc_header",
  accentColor: "accent_color", defaultLayout: "default_layout", bodyTemplate: "body_template", fields: "fields",
  layoutConfig: "layout_config", requiredFields: "required_fields", optionalFields: "optional_fields", tags: "tags",
  sortOrder: "sort_order", versionNotes: "version_notes", thumbnailUrl: "thumbnail_url", previewUrl: "preview_url"
};

function templateValue(key, value) {
  if (["industries", "fields", "layoutConfig", "requiredFields", "optionalFields", "tags"].includes(key)) return value == null ? null : JSON.stringify(value);
  if (["popular", "isFeatured", "isDraft", "isPublished", "isArchived", "supportsBranding", "showDocHeader"].includes(key)) return value ? 1 : 0;
  return value;
}

async function builderTemplates(context, identity, parts) {
  const DB = context.env.DB;
  const id = parts[1] ? Number(parts[1]) : null;
  if (context.request.method === "GET") {
    const url = new URL(context.request.url);
    const clauses = [], bindings = [];
    if (url.searchParams.get("builderId")) { clauses.push("builder_id=?"); bindings.push(url.searchParams.get("builderId")); }
    if (url.searchParams.get("status")) { clauses.push("status=?"); bindings.push(url.searchParams.get("status")); }
    if (url.searchParams.get("search")) { clauses.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)"); const q = `%${url.searchParams.get("search")}%`; bindings.push(q,q,q); }
    const rows = await all(DB, `SELECT * FROM builder_templates ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY builder_id,sort_order,id`, bindings);
    return json({ success: true, templates: rows.map(builderTemplate), total: rows.length });
  }
  if (context.request.method === "DELETE" && id) {
    await DB.prepare("DELETE FROM builder_templates WHERE id=?").bind(id).run();
    await audit(DB, identity, "builder_template.delete", "builder_template", String(id), `Deleted builder template ${id}.`);
    return json({ success: true });
  }
  if (context.request.method === "POST" && id && parts[2] === "duplicate") {
    const source = await DB.prepare("SELECT * FROM builder_templates WHERE id=?").bind(id).first();
    if (!source) return json({ success: false, error: "Template not found." }, 404);
    const suffix = crypto.randomUUID().slice(0, 8);
    await DB.prepare(`INSERT INTO builder_templates
      (template_id,builder_id,name,description,category,subcategory,industries,plan_required,access_level,status,popular,is_featured,is_draft,is_published,is_archived,supports_branding,show_doc_header,accent_color,default_layout,body_template,fields,layout_config,required_fields,optional_fields,tags,sort_order,version,version_notes,thumbnail_url,preview_url,created_by,updated_by)
      SELECT template_id||'-copy-${suffix}',builder_id,name||' (Copy)',description,category,subcategory,industries,plan_required,access_level,status,popular,is_featured,1,0,0,supports_branding,show_doc_header,accent_color,default_layout,body_template,fields,layout_config,required_fields,optional_fields,tags,sort_order,1,'Duplicated',thumbnail_url,preview_url,?,? FROM builder_templates WHERE id=?`)
      .bind(identity.email, identity.email, id).run();
    return json({ success: true });
  }
  const body = await bodyOf(context.request);
  if (context.request.method === "POST" && !id) {
    if (!body.templateId || !body.builderId || !body.name || !body.category) return json({ success: false, error: "Template ID, builder, name and category are required." }, 400);
    const columns = ["template_id","builder_id","name","category"], values = [body.templateId,body.builderId,body.name,body.category];
    for (const [key,column] of Object.entries(TEMPLATE_FIELDS)) if (key in body && !["name","category"].includes(key)) { columns.push(column); values.push(templateValue(key, body[key])); }
    columns.push("created_by","updated_by"); values.push(identity.email,identity.email);
    const result = await DB.prepare(`INSERT INTO builder_templates (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`).bind(...values).run();
    await audit(DB, identity, "builder_template.create", "builder_template", String(result.meta?.last_row_id || ""), `Created ${body.name}.`);
    return json({ success: true, id: result.meta?.last_row_id }, 201);
  }
  if (context.request.method === "PUT" && id) {
    const current = await DB.prepare("SELECT * FROM builder_templates WHERE id=?").bind(id).first();
    if (!current) return json({ success: false, error: "Template not found." }, 404);
    const sets = [], values = [];
    for (const [key,column] of Object.entries(TEMPLATE_FIELDS)) if (key in body) { sets.push(`${column}=?`); values.push(templateValue(key, body[key])); }
    if (body.bodyTemplate !== undefined && body.bodyTemplate !== current.body_template) sets.push("version=version+1");
    sets.push("updated_by=?", "updated_at=CURRENT_TIMESTAMP"); values.push(identity.email);
    await DB.prepare(`UPDATE builder_templates SET ${sets.join(",")} WHERE id=?`).bind(...values,id).run();
    await audit(DB, identity, "builder_template.update", "builder_template", String(id), `Updated builder template ${id}.`);
    return json({ success: true });
  }
  return json({ success: false, error: "Unsupported builder template operation." }, 405);
}

function ticketRow(row, index = 0) {
  return {
    id: row.id, uuid: row.reference || row.id, userId: null,
    name: row.customer_name || row.customer_email || "Customer", email: row.customer_email || "",
    subject: row.subject || "Support request", message: row.notes || "", category: row.category || "general",
    priority: normaliseStatus(row.priority, "normal"), status: normaliseStatus(row.status, "open"),
    adminNotes: row.notes || null, resolvedBy: row.assigned_admin || null,
    resolvedAt: ["resolved","closed"].includes(normaliseStatus(row.status)) ? row.updated_at : null,
    createdAt: row.created_at, updatedAt: row.updated_at, _index: index
  };
}

async function support(context, identity, parts) {
  const DB = context.env.DB;
  const data = await legacyData(context, identity, "support", { method: "GET" });
  const tickets = (data.support || []).map(ticketRow);
  const ticketId = parts[2];
  if (context.request.method === "GET" && !ticketId) {
    const count = (status) => tickets.filter((t) => t.status === status).length;
    return json({ success: true, tickets, stats: { total: tickets.length, open: count("open"), in_progress: count("in_progress"), resolved: count("resolved"), closed: count("closed"), urgent: tickets.filter((t) => t.priority === "urgent").length } });
  }
  if (ticketId && parts[3] === "messages") {
    if (context.request.method === "POST") {
      const body = await bodyOf(context.request);
      if (!String(body.message || "").trim()) return json({ success: false, error: "Message is required." }, 400);
      await DB.prepare(`INSERT INTO support_ticket_messages (ticket_id,sender_type,sender_name,sender_email,message,is_internal,read_by_admin)
        VALUES (?,'admin',?,?,?,?,1)`).bind(ticketId, identity.name || identity.email, identity.email, String(body.message).trim(), body.isInternal ? 1 : 0).run();
      await DB.prepare("UPDATE support_tickets SET status=CASE WHEN status='Open' THEN 'In Progress' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(ticketId).run();
      await audit(DB, identity, "support.reply", "support_ticket", ticketId, `Replied to support ticket ${ticketId}.`);
    }
    const messages = await all(DB, "SELECT * FROM support_ticket_messages WHERE ticket_id=? ORDER BY created_at,id", [ticketId]);
    return json({ success: true, messages });
  }
  if (context.request.method === "PATCH" && ticketId) {
    const body = await bodyOf(context.request);
    await DB.prepare(`UPDATE support_tickets SET status=COALESCE(?,status),priority=COALESCE(?,priority),notes=COALESCE(?,notes),assigned_admin=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(body.status || null, body.priority || null, body.adminNotes ?? null, identity.email, ticketId).run();
    await audit(DB, identity, "support.update", "support_ticket", ticketId, `Updated support ticket ${ticketId}.`);
    const row = await DB.prepare("SELECT * FROM support_tickets WHERE id=?").bind(ticketId).first();
    return json({ success: true, ticket: ticketRow(row || {}) });
  }
  return json({ success: false, error: "Support ticket not found." }, 404);
}

async function ensurePageContent(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS page_content (
    id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, type TEXT DEFAULT 'marketing',
    status TEXT DEFAULT 'draft', body_html TEXT, body_text TEXT, meta_title TEXT, meta_desc TEXT,
    updated_by TEXT, version INTEGER DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function contentRow(row) {
  return { id: row.id, slug: row.slug, title: row.title, type: row.type, status: row.status,
    body: row.body_html || "", excerpt: row.body_text || "", lastUpdated: row.updated_at,
    updatedBy: row.updated_by || "Admin", publishedAt: row.status === "published" ? row.updated_at : null,
    version: Number(row.version || 1) };
}

async function pageContent(context, identity, parts) {
  const DB = context.env.DB;
  if (context.request.method === "GET") {
    const rows = await all(DB, "SELECT * FROM page_content ORDER BY updated_at DESC");
    return json({ success: true, items: rows.map(contentRow) });
  }
  if (context.request.method === "DELETE" && parts[1]) {
    await DB.prepare("UPDATE page_content SET status='archived',updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE slug=?").bind(identity.email, parts[1]).run();
    await audit(DB, identity, "content.archive", "page_content", parts[1], `Archived ${parts[1]}.`);
    return json({ success: true });
  }
  const body = await bodyOf(context.request);
  const slug = String(body.slug || "").trim();
  if (!slug || !body.title) return json({ success: false, error: "Slug and title are required." }, 400);
  await DB.prepare(`INSERT INTO page_content (id,slug,title,type,status,body_html,body_text,updated_by)
    VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,type=excluded.type,status=excluded.status,
    body_html=excluded.body_html,body_text=excluded.body_text,updated_by=excluded.updated_by,version=page_content.version+1,updated_at=CURRENT_TIMESTAMP`)
    .bind(crypto.randomUUID(),slug,body.title,body.type || "marketing",body.status || "draft",body.bodyHtml || body.body || "",body.bodyText || body.excerpt || "",identity.email).run();
  await audit(DB, identity, "content.save", "page_content", slug, `Saved ${slug}.`);
  return json({ success: true });
}

function legalDoc(row) {
  return { slug: row.slug, title: row.title, body: row.content || "", status: row.status || (row.is_published ? "published" : "draft"),
    effectiveDate: row.effective_date, version: Number.parseInt(row.version || "1", 10), updatedBy: row.updated_by || "Admin", updatedAt: row.updated_at };
}

async function legal(context, identity) {
  const DB = context.env.DB;
  if (context.request.method === "GET") {
    const data = await legacyData(context, identity, "policies", { method: "GET" });
    const docs = (data.policies || []).map(legalDoc);
    const logs = await all(DB, "SELECT * FROM admin_audit_log WHERE entity_type='policy' ORDER BY created_at DESC LIMIT 200").catch(() => []);
    const grouped = {}; for (const entry of logs) (grouped[entry.entity_id] ||= []).push(entry);
    return json({ success: true, docs, audit: grouped });
  }
  const body = await bodyOf(context.request);
  const status = body.action === "publish" ? "published" : "draft";
  const version = Number(body.version || 1) + (body.action === "publish" ? 1 : 0);
  await DB.prepare(`INSERT INTO policy_pages (slug,title,content,content_type,version,effective_date,status,is_published,updated_at)
    VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,content=excluded.content,
    version=excluded.version,effective_date=excluded.effective_date,status=excluded.status,is_published=excluded.is_published,updated_at=CURRENT_TIMESTAMP`)
    .bind(body.slug,body.title,body.body || "","markdown",String(version),body.effectiveDate || null,status,status === "published" ? 1 : 0).run();
  await audit(DB, identity, `policy.${body.action || "save"}`, "policy", body.slug, `${status === "published" ? "Published" : "Saved"} ${body.title}.`);
  const row = await DB.prepare("SELECT * FROM policy_pages WHERE slug=?").bind(body.slug).first();
  return json({ success: true, doc: legalDoc({ ...row, updated_by: identity.email }) });
}

async function auditRoutes(context, identity, parts) {
  if (parts.join("/") === "audit/login-attempts") {
    const data = await legacyData(context, identity, "sessions", { method: "GET" });
    const attempts = (data.sessions || []).map((row) => ({ email: row.email || row.admin_email, success: true, ip: row.ip_address || "", createdAt: row.created_at || row.last_seen_at }));
    return json({ success: true, attempts });
  }
  const data = await legacyData(context, identity, "audit", { method: "GET" });
  const rows = data.audit?.entries || data.audit || [];
  const entries = Array.isArray(rows) ? rows.map((row) => ({ id: row.id, admin_email: row.actor_email || row.admin_email, action: row.action, detail: row.summary || row.detail, ip: row.ip_address || "", created_at: row.created_at })) : [];
  return json({ success: true, entries });
}

async function lifetime(context, identity) {
  const customersData = await legacyData(context, identity, "customers", { method: "GET" });
  const plansData = await legacyData(context, identity, "plans", { method: "GET" });
  const grants = (customersData.customers || []).filter((row) => Number(row.admin_lifetime || 0)).map((row) => ({
    id: row.email, userId: row.email, email: row.email, plan: row.admin_lifetime_plan_id || "professional",
    note: row.admin_notes || null, grantedAt: row.admin_updated_at || row.updated_at, grantedBy: "admin"
  }));
  return json({ success: true, grants, lifetime: grants, plans: plansData.plans || [] });
}

const GENERIC_SECTIONS = {
  plans: "plans", analytics: "analytics", security: "security", notifications: "notifications",
  membership: "membership", reports: "reports", health: "health", affiliates: "affiliate",
  "data-requests": "datarequests", system: "system", appearance: "appearance", email: "email",
  maintenance: "maintenance", branding: "branding", stripe: "stripe"
};

async function portalNav(context) {
  const DB = context.env.DB;
  if (context.request.method === "GET") {
    const row = await DB.prepare("SELECT value FROM site_settings WHERE key='portal_nav_config'").first();
    return json({ success: true, sections: [], overrides: parse(row?.value, { visibility: {} }) });
  }
  const body = await bodyOf(context.request);
  const overrides = { visibility: body.visibility && typeof body.visibility === "object" ? body.visibility : {} };
  const hasUpdatedAt = await tableHasColumn(DB, "site_settings", "updated_at");
  const sql = hasUpdatedAt
    ? `INSERT INTO site_settings (key,value,updated_at) VALUES ('portal_nav_config',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP`
    : `INSERT INTO site_settings (key,value) VALUES ('portal_nav_config',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`;
  await DB.prepare(sql).bind(JSON.stringify(overrides)).run();
  return json({ success: true, overrides });
}

function configuredAdmins(env) {
  return String(env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function isAuthorisedAdmin(DB, identity, env) {
  if (configuredAdmins(env).includes(String(identity.email || "").toLowerCase())) return true;
  try {
    const row = await DB.prepare("SELECT status FROM admin_users WHERE lower(email)=lower(?)").bind(identity.email).first();
    return Boolean(row) && !["blocked", "closed", "disabled", "inactive", "suspended"].includes(String(row.status || "active").toLowerCase());
  } catch {
    return false;
  }
}

async function generic(context, identity, parts) {
  const section = GENERIC_SECTIONS[parts[0]];
  if (!section) return json({ success: false, error: `Admin function '${parts.join("/")}' is not available.` }, 404);
  const body = context.request.method === "GET" ? undefined : await bodyOf(context.request);
  const data = await legacyData(context, identity, section, { body });
  return json({ success: true, ...data });
}

const OPERATIONAL_SECTIONS = new Set([
  "overview", "health", "operations", "reports", "status", "notifications",
  "systemreports", "closures", "enquiries", "admins", "roles", "sessions",
  "credits", "usage", "addons", "plans", "branding", "affiliate"
]);

async function operationalSection(context, identity, parts) {
  const section = String(parts[1] || "").toLowerCase();
  if (!OPERATIONAL_SECTIONS.has(section)) return json({ success: false, error: "Unknown administration section." }, 404);
  const body = context.request.method === "GET" ? undefined : await bodyOf(context.request);
  const result = await legacyData(context, identity, section, { body });
  const payload = result[section] ?? result.overview ?? result.platform ?? result;
  return json({ success: true, section, data: payload, admin: result.admin || null });
}

export async function onRequest(context) {
  if (!context.env.DB) return json({ success: false, error: "Database binding is unavailable." }, 503);
  let identity;
  try {
    identity = await getNativeSession(context.request, context.env, "admin");
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_compatibility_auth_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return json({ success: false, error: "Admin authentication is temporarily unavailable." }, 503);
  }
  if (!identity) return json({ success: false, error: "Admin session expired. Please sign in again.", code: "SESSION_EXPIRED" }, 401);
  if (!assertSameOrigin(context.request)) return json({ success: false, error: "The request origin could not be verified." }, 403);
  const parts = pathParts(context);
  try {
    if (!(await isAuthorisedAdmin(context.env.DB, identity, context.env))) {
      return json({ success: false, error: "This account is not authorised for the admin portal." }, 403);
    }
    if (parts[0] === "stats") return stats(context);
    if (parts[0] === "users") return users(context, identity);
    if (parts[0] === "customers" && parts.length === 1 && context.request.method === "GET") return getCustomers(context, identity);
    if (parts[0] === "customers" && parts.length === 1 && context.request.method === "POST") return createCustomer(context, identity);
    if (parts[0] === "customers" && parts[1] && context.request.method === "GET") return getCustomer(context, identity, parts[1]);
    if (parts[0] === "customers" && parts[1] && context.request.method === "PATCH") return patchCustomer(context, identity, parts[1]);
    if (["site-settings", "system-config"].includes(parts[0])) return settings(context);
    if (parts[0] === "builder-templates") return builderTemplates(context, identity, parts);
    if (parts[0] === "support" && parts[1] === "tickets") return support(context, identity, parts);
    if (parts[0] === "page-content") return pageContent(context, identity, parts);
    if (parts[0] === "legal") return legal(context, identity);
    if (parts[0] === "audit" || parts[0] === "action-log") return auditRoutes(context, identity, parts);
    if (parts[0] === "lifetime") return lifetime(context, identity);
    if (parts[0] === "portal-nav") return portalNav(context);
    if (parts[0] === "section") return operationalSection(context, identity, parts);
    return generic(context, identity, parts);
  } catch (error) {
    const reference = String(context.request.headers.get("cf-ray") || crypto.randomUUID()).slice(0, 80);
    console.error(JSON.stringify({ event: "admin_compatibility_route_failed", path: parts.join("/"), reference, message: error instanceof Error ? error.message : "Unknown error" }));
    const status = Number(error?.status || 500);
    return json({ success: false, error: status >= 500 ? "Administration data could not be loaded. Please retry." : error.message, reference }, status);
  }
}
