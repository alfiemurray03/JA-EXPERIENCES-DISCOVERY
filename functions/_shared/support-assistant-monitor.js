import { clean } from "./support-assistant-core.js";

export async function ensureAssistantMonitoringTables(DB) {
  if (!DB) return;
  await DB.prepare(`CREATE TABLE IF NOT EXISTS support_ai_conversations (
    session_id TEXT PRIMARY KEY,
    customer_email TEXT,
    visitor_type TEXT DEFAULT 'anonymous',
    status TEXT DEFAULT 'active',
    category TEXT,
    provider TEXT,
    model TEXT,
    message_count INTEGER DEFAULT 0,
    last_user_message TEXT,
    last_assistant_message TEXT,
    matched_article TEXT,
    enquiry_reference TEXT,
    page_path TEXT,
    country TEXT,
    user_agent TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS support_ai_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    customer_email TEXT,
    role TEXT,
    message TEXT,
    response_source TEXT,
    matched_article TEXT,
    escalated INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function contextData(request, body) {
  const sessionId = clean(body.sessionId || request.headers.get("cf-ray") || crypto.randomUUID(), 120);
  const email = clean(request.headers.get("x-ja-auth-email") || body.email, 254).toLowerCase();
  return {
    sessionId,
    email,
    visitorType: email ? "authenticated" : "anonymous",
    pagePath: clean(body.pagePath, 300),
    country: clean(request.headers.get("cf-ipcountry"), 8),
    userAgent: clean(request.headers.get("user-agent"), 300)
  };
}

export async function recordAssistantEvent(DB, request, body, event) {
  if (!DB) return;
  try {
    await ensureAssistantMonitoringTables(DB);
    const data = contextData(request, body);
    if (event === "close") {
      await DB.prepare("UPDATE support_ai_conversations SET status=CASE WHEN status='active' THEN 'abandoned' ELSE status END,last_activity=CURRENT_TIMESTAMP,ended_at=CASE WHEN status='active' THEN CURRENT_TIMESTAMP ELSE ended_at END WHERE session_id=?")
        .bind(data.sessionId).run();
      return;
    }
    await DB.prepare(`INSERT INTO support_ai_conversations
      (session_id,customer_email,visitor_type,status,page_path,country,user_agent,started_at,last_activity)
      VALUES (?,?,?,'active',?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      ON CONFLICT(session_id) DO UPDATE SET
        customer_email=COALESCE(excluded.customer_email,support_ai_conversations.customer_email),
        visitor_type=excluded.visitor_type,
        page_path=COALESCE(NULLIF(excluded.page_path,''),support_ai_conversations.page_path),
        country=COALESCE(NULLIF(excluded.country,''),support_ai_conversations.country),
        user_agent=COALESCE(NULLIF(excluded.user_agent,''),support_ai_conversations.user_agent),
        status=CASE WHEN support_ai_conversations.status IN ('resolved','escalated','completed') THEN support_ai_conversations.status ELSE 'active' END,
        last_activity=CURRENT_TIMESTAMP`)
      .bind(data.sessionId, data.email || null, data.visitorType, data.pagePath || null, data.country || null, data.userAgent || null).run();
  } catch {
    // Monitoring must never interrupt visitor support.
  }
}

export async function recordAssistantExchange(DB, request, body, result, model = "") {
  if (!DB) return;
  try {
    await ensureAssistantMonitoringTables(DB);
    const data = contextData(request, body);
    const source = result.source || "built_in";
    const status = result.resolved ? "resolved" : result.escalate ? "escalated" : "active";
    const userMessage = clean(body.message, 2000);
    const assistantMessage = clean(result.reply, 3500);
    const endedAt = status === "resolved" ? new Date().toISOString() : null;
    await DB.batch([
      DB.prepare("INSERT INTO support_ai_messages (id,session_id,customer_email,role,message,response_source,matched_article,escalated) VALUES (?,?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), data.sessionId, data.email || null, "user", userMessage, source, result.article?.id || null, result.escalate ? 1 : 0),
      DB.prepare("INSERT INTO support_ai_messages (id,session_id,customer_email,role,message,response_source,matched_article,escalated) VALUES (?,?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), data.sessionId, data.email || null, "assistant", assistantMessage, source, result.article?.id || null, result.escalate ? 1 : 0),
      DB.prepare(`INSERT INTO support_ai_conversations
        (session_id,customer_email,visitor_type,status,category,provider,model,message_count,last_user_message,last_assistant_message,matched_article,page_path,country,user_agent,started_at,last_activity,ended_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)
        ON CONFLICT(session_id) DO UPDATE SET
          customer_email=COALESCE(excluded.customer_email,support_ai_conversations.customer_email),
          visitor_type=excluded.visitor_type,
          status=excluded.status,
          category=excluded.category,
          provider=excluded.provider,
          model=excluded.model,
          message_count=support_ai_conversations.message_count+2,
          last_user_message=excluded.last_user_message,
          last_assistant_message=excluded.last_assistant_message,
          matched_article=excluded.matched_article,
          page_path=COALESCE(NULLIF(excluded.page_path,''),support_ai_conversations.page_path),
          country=COALESCE(NULLIF(excluded.country,''),support_ai_conversations.country),
          user_agent=COALESCE(NULLIF(excluded.user_agent,''),support_ai_conversations.user_agent),
          last_activity=CURRENT_TIMESTAMP,
          ended_at=excluded.ended_at`)
        .bind(data.sessionId, data.email || null, data.visitorType, status, clean(result.category || "General Enquiry", 120), source, clean(model, 180) || null, 2, userMessage, assistantMessage, result.article?.id || null, data.pagePath || null, data.country || null, data.userAgent || null, endedAt)
    ]);
  } catch {
    // Monitoring must never interrupt visitor support.
  }
}

export async function markConversationEscalated(DB, sessionId, reference, email = "") {
  if (!DB || !sessionId) return;
  try {
    await ensureAssistantMonitoringTables(DB);
    await DB.prepare(`UPDATE support_ai_conversations SET
      status='escalated',enquiry_reference=?,customer_email=COALESCE(NULLIF(?,''),customer_email),last_activity=CURRENT_TIMESTAMP,ended_at=CURRENT_TIMESTAMP
      WHERE session_id=?`)
      .bind(clean(reference, 80), clean(email, 254).toLowerCase(), clean(sessionId, 120)).run();
  } catch {
    // Enquiry submission must succeed even if monitoring cannot be updated.
  }
}
