import { getAccessIdentity, isSameOriginRequest } from "../../_shared/enquiries.js";

const VALID_STATUSES = new Set(["normal", "coming_soon", "maintenance"]);
const STATUS_VALUES = {
  normal: { site_status: "normal", maintenance_enabled: "false", launchgateway_enabled: "false" },
  coming_soon: { site_status: "coming_soon", maintenance_enabled: "false", launchgateway_enabled: "true" },
  maintenance: { site_status: "maintenance", maintenance_enabled: "true", launchgateway_enabled: "false" }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function configuredAdmins(env) {
  return String(env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function parsePermissions(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function authoriseAdministrator(DB, identity, env) {
  if (!identity.email) return { authenticated: false, authorised: false };
  if (configuredAdmins(env).includes(identity.email)) return { authenticated: true, authorised: true };

  const admin = await DB.prepare(`
    SELECT role, status, permissions
    FROM admin_users
    WHERE lower(email) = lower(?)
  `).bind(identity.email).first();
  if (!admin || String(admin.status || "Active").toLowerCase() === "suspended") {
    return { authenticated: true, authorised: false };
  }
  if (admin.role === "Platform Owner") return { authenticated: true, authorised: true };

  const explicit = parsePermissions(admin.permissions);
  if (explicit.includes("*") || explicit.includes("manage_status")) return { authenticated: true, authorised: true };

  const rolePermission = await DB.prepare(`
    SELECT permission_code
    FROM role_permissions
    WHERE role_name = ? AND permission_code = 'manage_status'
    LIMIT 1
  `).bind(String(admin.role || "Auditor")).first();
  return { authenticated: true, authorised: Boolean(rolePermission) };
}

async function readStatusValues(DB) {
  const result = await DB.prepare(`
    SELECT key, value
    FROM site_settings
    WHERE key IN ('site_status', 'maintenance_enabled', 'launchgateway_enabled')
  `).all();
  return Object.fromEntries((result.results || []).map((row) => [row.key, String(row.value)]));
}

async function writeStatusValues(DB, values) {
  const columns = await DB.prepare("PRAGMA table_info(site_settings)").all();
  const hasUpdatedAt = (columns.results || []).some((column) => column.name === "updated_at");
  for (const key of ["site_status", "maintenance_enabled", "launchgateway_enabled"]) {
    const sql = hasUpdatedAt
      ? `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      : `INSERT INTO site_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`;
    await DB.prepare(sql).bind(key, values[key]).run();
  }
}

function valuesMatch(actual, expected) {
  return Object.entries(expected).every(([key, value]) => actual[key] === value);
}

async function writeAudit(DB, identity, status, previousStatus, correlationId) {
  await DB.prepare(`
    INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata)
    VALUES (?, ?, 'site_status_update', 'site_settings', 'site_status', ?, ?)
  `).bind(
    crypto.randomUUID(),
    identity.email,
    `Site status updated from ${previousStatus || "unknown"} to ${status}.`,
    JSON.stringify({ previous_status: previousStatus || "unknown", new_status: status, result: "success", correlation_id: correlationId })
  ).run();
}

export async function onRequest(context) {
  const { request, env } = context;
  const correlationId = String(request.headers.get("cf-ray") || request.headers.get("x-request-id") || crypto.randomUUID()).slice(0, 120);
  if (!env.DB) return json({ success: false, message: "Site Status is unavailable.", correlation_id: correlationId }, 500);

  try {
    const identity = getAccessIdentity(request);
    const access = await authoriseAdministrator(env.DB, identity, env);
    if (!access.authenticated) return json({ success: false, message: "Not signed in." }, 401);
    if (!access.authorised) return json({ success: false, message: "Forbidden." }, 403);

    if (request.method === "GET") {
      const values = await readStatusValues(env.DB);
      if (!VALID_STATUSES.has(values.site_status)) {
        return json({ success: false, message: "The saved Site Status is invalid.", correlation_id: correlationId }, 500);
      }
      return json({ success: true, site_status: values.site_status, values });
    }

    if (request.method !== "POST") return json({ success: false, message: "Method not allowed." }, 405);
    if (!isSameOriginRequest(request)) return json({ success: false, message: "This request could not be verified." }, 403);

    const body = await request.json().catch(() => null);
    const status = typeof body?.site_status === "string" ? body.site_status : "";
    if (!VALID_STATUSES.has(status) || Object.keys(body || {}).some((key) => key !== "site_status")) {
      return json({ success: false, message: "Invalid Site Status." }, 400);
    }

    const previous = await readStatusValues(env.DB);
    const expected = STATUS_VALUES[status];
    await writeStatusValues(env.DB, expected);
    const confirmed = await readStatusValues(env.DB);
    if (!valuesMatch(confirmed, expected)) {
      return json({ success: false, message: "Site Status could not be confirmed after saving.", correlation_id: correlationId }, 500);
    }

    let auditRecorded = true;
    try {
      await writeAudit(env.DB, identity, status, previous.site_status, correlationId);
    } catch (error) {
      auditRecorded = false;
      console.error(JSON.stringify({ event: "site_status_audit_failed", correlation_id: correlationId, error_name: error?.name || "Error" }));
    }
    return json({ success: true, saved: true, site_status: status, values: confirmed, audit_recorded: auditRecorded, correlation_id: correlationId });
  } catch (error) {
    console.error(JSON.stringify({ event: "site_status_request_failed", correlation_id: correlationId, error_name: error?.name || "Error" }));
    return json({ success: false, message: "Site Status could not be saved.", correlation_id: correlationId }, 500);
  }
}
