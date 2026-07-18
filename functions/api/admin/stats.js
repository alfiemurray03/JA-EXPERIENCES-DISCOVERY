import { getNativeSession, withIdentity } from "../../_shared/oidc.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function configuredAdmins(env) {
  const raw = env.ADMIN_EMAILS || env.ADMIN_EMAIL || "alfieholywoodmurray@jagroupservices.co.uk";
  return String(raw).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function isAuthorisedAdmin(env, identity) {
  const email = String(identity?.email || "").trim().toLowerCase();
  if (!email) return false;
  if (configuredAdmins(env).includes(email)) return true;
  if (!env.DB) return false;
  try {
    const admin = await env.DB.prepare("SELECT status FROM admin_users WHERE lower(email)=lower(?)").bind(email).first();
    const status = String(admin?.status || "active").trim().toLowerCase();
    return Boolean(admin) && !["blocked", "closed", "disabled", "inactive", "suspended"].includes(status);
  } catch {
    return false;
  }
}

async function all(DB, sql, bindings = []) {
  const result = await DB.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function columns(DB, table) {
  try {
    return new Set((await all(DB, `PRAGMA table_info(${table})`)).map((row) => String(row.name || "")));
  } catch {
    return new Set();
  }
}

async function safeFirst(DB, sql, bindings = []) {
  try { return await DB.prepare(sql).bind(...bindings).first(); }
  catch { return { count: 0 }; }
}

async function safeAll(DB, sql, bindings = []) {
  try { return await all(DB, sql, bindings); }
  catch { return []; }
}

function countOf(row) {
  const value = Number(row?.count ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function coalesceExpression(available, candidates, fallback) {
  const present = candidates.filter((column) => available.has(column));
  return present.length ? `COALESCE(${present.join(", ")}, '${fallback}')` : `'${fallback}'`;
}

export async function analyticsStats(DB) {
  const profileColumns = await columns(DB, "profiles");
  const planExpression = coalesceExpression(profileColumns, ["admin_lifetime_plan_id", "subscription_plan", "assigned_plan"], "free");
  const accountExpression = coalesceExpression(profileColumns, ["account_type", "usage_type"], "individual");

  const [users, documents, paid, recentDocumentCount, recentUserCount, recentDocumentRecords, recentUserRecords, planBreakdown, usageBreakdown] = await Promise.all([
    safeFirst(DB, "SELECT COUNT(*) AS count FROM profiles"),
    safeFirst(DB, "SELECT COUNT(*) AS count FROM builder_outputs WHERE archived_at IS NULL"),
    safeFirst(DB, `SELECT COUNT(*) AS count FROM profiles WHERE lower(${planExpression}) NOT IN ('free', '')`),
    safeFirst(DB, "SELECT COUNT(*) AS count FROM builder_outputs WHERE archived_at IS NULL AND datetime(created_at) >= datetime('now','-30 days')"),
    safeFirst(DB, "SELECT COUNT(*) AS count FROM profiles WHERE datetime(created_at) >= datetime('now','-30 days')"),
    safeAll(DB, "SELECT id AS uuid,title,builder_id AS templateId,status,created_at AS createdAt,updated_at AS updatedAt FROM builder_outputs WHERE archived_at IS NULL ORDER BY created_at DESC LIMIT 8"),
    safeAll(DB, "SELECT email AS id,email,COALESCE(display_name,verified_name,email) AS displayName,created_at AS createdAt FROM profiles ORDER BY created_at DESC LIMIT 8"),
    safeAll(DB, `SELECT lower(${planExpression}) AS plan, COUNT(*) AS count FROM profiles GROUP BY lower(${planExpression}) ORDER BY count DESC`),
    safeAll(DB, `SELECT lower(${accountExpression}) AS usageType, COUNT(*) AS count FROM profiles GROUP BY lower(${accountExpression}) ORDER BY count DESC`)
  ]);

  return {
    totalUsers: countOf(users),
    totalDocuments: countOf(documents),
    paidUsers: countOf(paid),
    recentDocuments: countOf(recentDocumentCount),
    recentUsers: countOf(recentUserCount),
    planBreakdown: planBreakdown.map((row) => ({ plan: typeof row.plan === "string" && row.plan.trim() ? row.plan.trim() : "free", count: countOf(row) })),
    usageBreakdown: usageBreakdown.map((row) => ({ usageType: typeof row.usageType === "string" && row.usageType.trim() ? row.usageType.trim() : "individual", count: countOf(row) })),
    recentDocumentRecords,
    recentUserRecords
  };
}

export async function onRequestGet(context) {
  const { env } = context;
  let identity;
  try {
    identity = await getNativeSession(withIdentity(context.request, null), env, "admin");
  } catch {
    return json({ success: false, error: "Analytics is temporarily unavailable. Please try again." }, 503);
  }
  if (!identity) return json({ success: false, error: "Administrator session required." }, 401);
  if (!(await isAuthorisedAdmin(env, identity))) return json({ success: false, error: "Administrator access was denied." }, 403);
  if (!env.DB) return json({ success: false, error: "Analytics database is unavailable." }, 503);
  try {
    return json({ success: true, stats: await analyticsStats(env.DB) });
  } catch {
    return json({ success: false, error: "Analytics data could not be loaded." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") return json({ success: false, error: "Method not allowed." }, 405);
  return onRequestGet(context);
}
