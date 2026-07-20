import { getNativeSession } from "../../../_shared/oidc.js";

const PIN_SESSION_COOKIE = "ja_admin_pin_session";
const PIN_SESSION_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const DEFAULT_ADMIN_EMAIL = "alfieholywoodmurray@jagroupservices.co.uk";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}

function cookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function hex(bytes) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || ""))));
}

async function pinHash(pin, salt = crypto.randomUUID()) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 210000, hash: "SHA-256" }, key, 256);
  return `pbkdf2_sha256$210000$${salt}$${hex(bits)}`;
}

function equal(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] || 0) ^ (b[index] || 0);
  return difference === 0;
}

async function verifyPin(pin, stored) {
  const [, iterations, salt, expected] = String(stored || "").split("$");
  if (!iterations || !salt || !expected) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: Number(iterations), hash: "SHA-256" }, key, 256);
  return equal(hex(bits), expected);
}

async function ensureTables(DB) {
  await DB.prepare(`CREATE TABLE IF NOT EXISTS admin_security_pins (
    admin_email TEXT PRIMARY KEY, pin_hash TEXT NOT NULL, failed_attempts INTEGER DEFAULT 0,
    locked_until TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS admin_pin_sessions (
    token_hash TEXT PRIMARY KEY, admin_email TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL, revoked_at TEXT
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS admin_audit_log (
    id TEXT PRIMARY KEY, actor_email TEXT, action TEXT, entity_type TEXT, entity_id TEXT,
    summary TEXT, metadata TEXT DEFAULT '{}', created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function audit(DB, email, action, summary, metadata = {}) {
  await DB.prepare(`INSERT INTO admin_audit_log (id, actor_email, action, entity_type, entity_id, summary, metadata) VALUES (?, ?, ?, 'admin_security_pin', ?, ?, ?)`)
    .bind(crypto.randomUUID(), email, action, email, summary, JSON.stringify(metadata)).run();
}

async function adminIdentity(context) {
  const identity = await getNativeSession(context.request, context.env, "admin");
  if (!identity?.email) return null;
  const email = String(identity.email).trim().toLowerCase();
  const row = await context.env.DB.prepare(`SELECT status FROM admin_users WHERE lower(email) = lower(?)`).bind(email).first().catch(() => null);
  const configured = String(context.env.ADMIN_EMAILS || context.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().split(",").map(value => value.trim()).includes(email);
  if (!configured && !row) return null;
  if (["blocked", "closed", "disabled", "inactive", "suspended"].includes(String(row?.status || "active").toLowerCase())) return null;
  return { ...identity, email };
}

async function status(DB, request, email) {
  const pin = await DB.prepare(`SELECT failed_attempts, locked_until, created_at, updated_at FROM admin_security_pins WHERE lower(admin_email) = lower(?)`).bind(email).first();
  const token = cookie(request, PIN_SESSION_COOKIE);
  const tokenHash = token ? await sha256(token) : "";
  const session = tokenHash ? await DB.prepare(`SELECT expires_at FROM admin_pin_sessions WHERE token_hash = ? AND lower(admin_email) = lower(?) AND revoked_at IS NULL AND datetime(expires_at) > datetime('now')`).bind(tokenHash, email).first() : null;
  const locked = Boolean(pin?.locked_until && Date.parse(pin.locked_until) > Date.now());
  return { configured: Boolean(pin), unlocked: Boolean(session), expiresAt: session?.expires_at || null, locked, lockedUntil: locked ? pin.locked_until : null, attemptsRemaining: Math.max(0, MAX_ATTEMPTS - Number(pin?.failed_attempts || 0)) };
}

export async function onRequestGet(context) {
  if (!context.env.DB) return json({ success: false, error: "Administrator PIN storage is unavailable." }, 503);
  const identity = await adminIdentity(context);
  if (!identity) return json({ success: false, error: "Microsoft administrator sign-in is required." }, 401);
  await ensureTables(context.env.DB);
  return json({ success: true, ...(await status(context.env.DB, context.request, identity.email)) });
}

export async function onRequestPost(context) {
  if (!context.env.DB) return json({ success: false, error: "Administrator PIN storage is unavailable." }, 503);
  const identity = await adminIdentity(context);
  if (!identity) return json({ success: false, error: "Microsoft administrator sign-in is required." }, 401);
  await ensureTables(context.env.DB);
  const body = await context.request.json().catch(() => ({}));
  const action = String(body.action || "verify");
  const pin = String(body.pin || "");
  if (action === "lock") {
    const token = cookie(context.request, PIN_SESSION_COOKIE);
    if (token) await context.env.DB.prepare(`UPDATE admin_pin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(await sha256(token)).run();
    await audit(context.env.DB, identity.email, "admin_pin_session_locked", "Administrator locked their PIN session.");
    return json({ success: true, configured: true, unlocked: false }, 200, { "Set-Cookie": `${PIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  }
  if (!/^\d{4}$/.test(pin)) return json({ success: false, error: "Enter exactly four numbers." }, 400);
  const existing = await context.env.DB.prepare(`SELECT * FROM admin_security_pins WHERE lower(admin_email) = lower(?)`).bind(identity.email).first();
  if (action === "setup") {
    if (existing) return json({ success: false, error: "A PIN already exists. Use change PIN instead." }, 409);
    await context.env.DB.prepare(`INSERT INTO admin_security_pins (admin_email, pin_hash) VALUES (?, ?)`).bind(identity.email, await pinHash(pin)).run();
    await audit(context.env.DB, identity.email, "admin_pin_created", "Created an individual administrator security PIN.");
  } else {
    if (!existing) return json({ success: false, error: "Create your administrator PIN first." }, 409);
    if (existing.locked_until && Date.parse(existing.locked_until) > Date.now()) return json({ success: false, error: "PIN access is temporarily locked.", lockedUntil: existing.locked_until }, 423);
    if (!(await verifyPin(pin, existing.pin_hash))) {
      const attempts = Number(existing.failed_attempts || 0) + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await context.env.DB.prepare(`UPDATE admin_security_pins SET failed_attempts = ?, locked_until = ?, updated_at = CURRENT_TIMESTAMP WHERE lower(admin_email) = lower(?)`).bind(lockedUntil ? 0 : attempts, lockedUntil, identity.email).run();
      await audit(context.env.DB, identity.email, "admin_pin_verification_failed", "Administrator PIN verification failed.", { attempts, locked: Boolean(lockedUntil) });
      return json({ success: false, error: lockedUntil ? "Too many attempts. PIN access is locked for 15 minutes." : "The administrator PIN is incorrect.", attemptsRemaining: lockedUntil ? 0 : MAX_ATTEMPTS - attempts }, lockedUntil ? 423 : 401);
    }
    if (action === "change") {
      const newPin = String(body.newPin || "");
      if (!/^\d{4}$/.test(newPin)) return json({ success: false, error: "The new PIN must contain exactly four numbers." }, 400);
      await context.env.DB.prepare(`UPDATE admin_security_pins SET pin_hash = ?, failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE lower(admin_email) = lower(?)`).bind(await pinHash(newPin), identity.email).run();
      await context.env.DB.prepare(`UPDATE admin_pin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE lower(admin_email) = lower(?) AND revoked_at IS NULL`).bind(identity.email).run();
      await audit(context.env.DB, identity.email, "admin_pin_changed", "Changed the individual administrator security PIN.");
    }
  }
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + PIN_SESSION_MINUTES * 60 * 1000).toISOString();
  await context.env.DB.prepare(`UPDATE admin_security_pins SET failed_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE lower(admin_email) = lower(?)`).bind(identity.email).run();
  await context.env.DB.prepare(`INSERT INTO admin_pin_sessions (token_hash, admin_email, expires_at) VALUES (?, ?, ?)`).bind(await sha256(token), identity.email, expiresAt).run();
  await audit(context.env.DB, identity.email, "admin_pin_verified", "Administrator PIN verified and privileged session opened.", { expires_at: expiresAt });
  return json({ success: true, configured: true, unlocked: true, expiresAt }, 200, { "Set-Cookie": `${PIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${PIN_SESSION_MINUTES * 60}; HttpOnly; Secure; SameSite=Strict` });
}
