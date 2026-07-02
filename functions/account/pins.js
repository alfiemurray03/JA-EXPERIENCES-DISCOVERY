function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function clean(value, max = 2000) { return String(value || "").trim().slice(0, max); }
function cleanEmail(value) { return clean(value, 254).toLowerCase(); }

function getAccessIdentity(request) {
  const nativeEmail = request.headers.get("x-ja-auth-email") || "";
  return { email: cleanEmail(nativeEmail), name: clean(request.headers.get("x-ja-auth-name") || nativeEmail, 160) };
}

async function ensureTables(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS customer_support_pins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      pin_ciphertext TEXT,
      pin_iv TEXT,
      pin_last4 TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      expires_at TEXT NOT NULL,
      used_at TEXT,
      revoked_at TEXT,
      revoked_by TEXT,
      last_used_at TEXT,
      audit_history TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ""));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function getEncryptionKey(env) {
  const source = env.SUPPORT_PIN_ENCRYPTION_KEY || env.SESSION_SECRET || env.ACCESS_COOKIE_SECRET || env.SECRET_KEY || env.APP_SECRET || "";
  if (!source) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptPin(env, pin) {
  const key = await getEncryptionKey(env);
  if (!key) return { ciphertext: "", iv: "" };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(pin));
  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv)
  };
}

async function decryptPin(env, ciphertext, iv) {
  if (!ciphertext || !iv) return "";
  const key = await getEncryptionKey(env);
  if (!key) return "";
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    base64ToBytes(ciphertext)
  );
  return new TextDecoder().decode(plaintext);
}

async function createSupportPinRecord(DB, env, email, actorEmail, pin = null) {
  const supportPin = pin || generatePin();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const payload = JSON.stringify([{ event: "generated", at: new Date().toISOString(), actor: actorEmail }]);
  const encrypted = await encryptPin(env, supportPin);
  await DB.prepare(`INSERT INTO customer_support_pins (id, email, pin_hash, pin_ciphertext, pin_iv, pin_last4, status, expires_at, audit_history) VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?)`).bind(
    crypto.randomUUID(),
    email,
    await hashPin(supportPin),
    encrypted.ciphertext,
    encrypted.iv,
    supportPin.slice(-4),
    expiresAt,
    payload
  ).run();
  return { pin: supportPin, expiresAt };
}

function serializePinRow(row) {
  return row ? {
    id: row.id,
    active_pin: row.active_pin || "",
    pin_last4: row.pin_last4,
    status: row.status,
    expires_at: row.expires_at,
    used_at: row.used_at,
    revoked_at: row.revoked_at,
    revoked_by: row.revoked_by,
    last_used_at: row.last_used_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  } : null;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "Database unavailable." }, 500);
  const identity = getAccessIdentity(request);
  if (!identity.email) return json({ error: "Not signed in." }, 401);
  await ensureTables(env.DB);

  if (request.method === "GET") {
    const result = await env.DB.prepare(`SELECT id, pin_hash, pin_ciphertext, pin_iv, pin_last4, status, expires_at, used_at, revoked_at, revoked_by, last_used_at, created_at, updated_at FROM customer_support_pins WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 50`).bind(identity.email).all();
    let pins = result.results || [];
    let active = pins.find((pin) => pin.status === "Active" && !pin.revoked_at) || pins[0] || null;
    if (active) {
      active.active_pin = await decryptPin(env, active.pin_ciphertext, active.pin_iv);
    }
    if (!active || !active.active_pin) {
      const created = await createSupportPinRecord(env.DB, env, identity.email, identity.email);
      active = { id: null, pin_last4: created.pin.slice(-4), status: "Active", expires_at: created.expiresAt, used_at: null, revoked_at: null, revoked_by: null, last_used_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active_pin: created.pin, generated: true };
      return json({ pins: [active] });
    }
    return json({ pins: [serializePinRow({ ...active, active_pin: active.active_pin })] });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const action = clean(body.action, 20);
    const id = clean(body.id, 120);
    if (action === "generate") {
      const { pin, expiresAt } = await createSupportPinRecord(env.DB, env, identity.email, identity.email);
      return json({ pin, expiresAt });
    }
    const current = await env.DB.prepare(`SELECT * FROM customer_support_pins WHERE id = ? AND lower(email) = lower(?)`).bind(id, identity.email).first();
    if (!current) return json({ error: "PIN not found." }, 404);
    if (action === "revoke") {
      await env.DB.prepare(`UPDATE customer_support_pins SET status = 'Revoked', revoked_at = CURRENT_TIMESTAMP, revoked_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(identity.email, id).run();
      return json({ revoked: true });
    }
    if (action === "rotate") {
      const pin = generatePin();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const encrypted = await encryptPin(env, pin);
      await env.DB.prepare(`UPDATE customer_support_pins SET pin_hash = ?, pin_ciphertext = ?, pin_iv = ?, pin_last4 = ?, status = 'Active', expires_at = ?, revoked_at = NULL, revoked_by = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(await hashPin(pin), encrypted.ciphertext, encrypted.iv, pin.slice(-4), expiresAt, id).run();
      return json({ pin, expiresAt });
    }
    return json({ error: "Unknown action." }, 400);
  }

  return json({ error: "Method not allowed." }, 405);
}
