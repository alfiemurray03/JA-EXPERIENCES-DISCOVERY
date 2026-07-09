function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function wantsPortalHtml(request, pathname) {
  return request.method === "GET" && !pathname.startsWith("/account/api/");
}

function portalAssetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Request(url.toString(), request);
}

function clean(value, max = 400) { return String(value || "").trim().slice(0, max); }
function cleanEmail(value) { return clean(value, 254).toLowerCase(); }

function getAccessIdentity(request) {
  const nativeEmail = request.headers.get("x-ja-auth-email") || "";
  return { email: cleanEmail(nativeEmail) };
}

async function ensureTables(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS customer_saved_items (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_key TEXT NOT NULL,
      item_title TEXT NOT NULL,
      item_url TEXT,
      source_page TEXT,
      category TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email, item_type, item_key)
    )
  `).run();
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (wantsPortalHtml(request, url.pathname)) {
    if (env.ASSETS?.fetch) return env.ASSETS.fetch(portalAssetRequest(request, "/account/saved/index.html"));
    return Response.redirect(new URL("/account/saved/", request.url), 302);
  }
  if (!env.DB) return json({ error: "Database unavailable." }, 500);
  const identity = getAccessIdentity(request);
  if (!identity.email) return json({ error: "Not signed in." }, 401);
  await ensureTables(env.DB);

  if (request.method === "GET") {
    const result = await env.DB.prepare(`SELECT * FROM customer_saved_items WHERE lower(email) = lower(?) ORDER BY updated_at DESC, created_at DESC`).bind(identity.email).all();
    return json({ items: result.results || [] });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const action = clean(body.action, 20);
    const itemType = clean(body.item_type, 20);
    const itemKey = clean(body.item_key, 200);
    const itemTitle = clean(body.item_title, 200);
    const itemUrl = clean(body.item_url, 500);
    const sourcePage = clean(body.source_page, 80);
    const category = clean(body.category, 80);

    if (!itemType || !itemKey || !itemTitle) return json({ error: "Item type, key and title are required." }, 400);

    if (action === "remove") {
      await env.DB.prepare(`DELETE FROM customer_saved_items WHERE lower(email) = lower(?) AND item_type = ? AND item_key = ?`).bind(identity.email, itemType, itemKey).run();
      return json({ removed: true });
    }

    await env.DB.prepare(`
      INSERT INTO customer_saved_items (id, email, item_type, item_key, item_title, item_url, source_page, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email, item_type, item_key) DO UPDATE SET
        item_title = excluded.item_title,
        item_url = excluded.item_url,
        source_page = excluded.source_page,
        category = excluded.category,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      crypto.randomUUID(),
      identity.email,
      itemType,
      itemKey,
      itemTitle,
      itemUrl || null,
      sourcePage || null,
      category || null
    ).run();

    const saved = await env.DB.prepare(`SELECT * FROM customer_saved_items WHERE lower(email) = lower(?) ORDER BY updated_at DESC, created_at DESC`).bind(identity.email).all();
    return json({ items: saved.results || [] });
  }

  return json({ error: "Method not allowed." }, 405);
}
