import { getNativeSession } from "../../_shared/oidc.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

const TYPES = {
  sar: "Access my personal data / Subject Access Request",
  export: "Access my personal data / Subject Access Request",
  deletion: "Delete my personal data",
  rectification: "Correct my personal data",
  restriction: "Restrict the use of my personal data",
  portability: "Data portability",
  objection: "Object to processing"
};

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function ensureTable(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS data_protection_requests (
    id TEXT PRIMARY KEY, reference TEXT UNIQUE, user_id TEXT, customer_name TEXT,
    customer_email TEXT, request_type TEXT, customer_message TEXT, status TEXT DEFAULT 'New',
    submitted_at TEXT, due_at TEXT, completed_at TEXT, assigned_admin_id TEXT,
    internal_notes TEXT, attachments TEXT, audit_log TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function publicStatus(status) {
  const value = String(status || "new").toLowerCase();
  if (["completed", "closed", "sent"].includes(value)) return "completed";
  if (["rejected", "refused / not applicable"].includes(value)) return "rejected";
  if (["processing", "in progress"].includes(value)) return "processing";
  if (["in review", "under review"].includes(value)) return "in_review";
  return "submitted";
}

function requestDto(row) {
  return {
    id: row.id,
    uuid: row.reference,
    requestType: row.request_type,
    notes: row.customer_message,
    status: publicStatus(row.status),
    deadlineAt: row.due_at,
    deadlineExtendedAt: null,
    identityVerified: false,
    adminNotes: null,
    rejectionReason: null,
    processedAt: row.completed_at,
    exportReady: null,
    downloadTokenExpires: null,
    downloadToken: null,
    downloadCount: 0,
    exportFileSizeBytes: null,
    downloadAvailable: false,
    createdAt: row.created_at || row.submitted_at,
    updatedAt: row.updated_at || row.created_at || row.submitted_at
  };
}

export async function onRequest({ request, env }) {
  try {
  if (!env.DB) return json({ success: false, error: "Privacy service is not configured." }, 503);
  const session = await getNativeSession(request, env, "customer").catch(() => null);
  if (!session?.email) return json({ success: false, error: "Please sign in to continue.", code: "NOT_AUTHENTICATED" }, 401);
  const user = { email: String(session.email).trim().toLowerCase(), name: String(session.name || session.email).trim() };
  await ensureTable(env.DB);

  if (request.method === "GET") {
    const result = await env.DB.prepare(`SELECT * FROM data_protection_requests
      WHERE lower(customer_email)=lower(?) ORDER BY submitted_at DESC, created_at DESC LIMIT 100`)
      .bind(user.email).all();
    return json({ success: true, requests: (result.results || []).map(requestDto) });
  }

  if (request.method === "POST") {
    if (!sameOrigin(request)) return json({ success: false, error: "Cross-origin request blocked." }, 403);
    const body = await request.json().catch(() => ({}));
    const type = String(body.requestType || "");
    if (!TYPES[type]) return json({ success: false, error: "Invalid request type." }, 400);
    const active = await env.DB.prepare(`SELECT id,request_type FROM data_protection_requests
      WHERE lower(customer_email)=lower(?) AND lower(status) NOT IN ('completed','closed','sent','rejected','refused / not applicable')`)
      .bind(user.email).all();
    if ((active.results || []).length >= 2) return json({ success: false, error: "You already have 2 active requests being processed.", code: "RATE_LIMITED" }, 429);
    if ((active.results || []).some((row) => row.request_type === TYPES[type])) {
      return json({ success: false, error: "You already have an active request of this type.", code: "DUPLICATE_REQUEST" }, 409);
    }
    const id = crypto.randomUUID();
    const reference = `DPR-${Date.now().toString(36).toUpperCase()}-${id.slice(0, 4).toUpperCase()}`;
    const now = new Date();
    const due = new Date(now.getTime() + 30 * 86400000);
    await env.DB.prepare(`INSERT INTO data_protection_requests
      (id,reference,user_id,customer_name,customer_email,request_type,customer_message,status,submitted_at,due_at,attachments,audit_log,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,'New',?,?,'[]','[]',?,?)`)
      .bind(id, reference, user.email, user.name || user.email, user.email, TYPES[type], String(body.notes || "").trim().slice(0, 2000), now.toISOString(), due.toISOString(), now.toISOString(), now.toISOString()).run();
    return json({ success: true, uuid: reference, message: `Your request has been submitted (ref: ${reference}). We will respond within 30 days.` }, 201);
  }

  return json({ success: false, error: "Method not allowed." }, 405);
  } catch (error) {
    console.error(JSON.stringify({ event: "customer_privacy_request_failed", message: error instanceof Error ? error.message : "Unknown error" }));
    return json({ success: false, error: "Privacy requests are temporarily unavailable. Please try again." }, 503);
  }
}
