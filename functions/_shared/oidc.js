const REALMS = {
  admin: {
    prefix: "ADMIN_OIDC",
    cookie: "ja_admin_session",
    transactionCookie: "ja_admin_oidc_tx",
    sessionTable: "admin_oidc_sessions",
    path: "/admin",
    loginPath: "/admin/login",
    callbackPath: "/admin/auth/callback"
  },
  customer: {
    prefix: "CUSTOMER_OIDC",
    cookie: "ja_customer_oidc_session",
    transactionCookie: "ja_customer_oidc_tx",
    sessionTable: "customer_oidc_sessions",
    path: "/account",
    loginPath: "/account/login",
    callbackPath: "/account/auth/callback"
  }
};

const discoveryCache = new Map();
const jwksCache = new Map();
const readyDatabases = new WeakSet();
const tableColumnsCache = new WeakMap();

function realmConfig(realm, env) {
  const definition = REALMS[realm];
  if (!definition) throw new Error("Unsupported authentication realm.");
  const value = (suffix) => String(env[`${definition.prefix}_${suffix}`] || "").trim();
  const issuer = value("ISSUER").replace(/\/$/, "");
  const clientId = value("CLIENT_ID");
  const clientSecret = value("CLIENT_SECRET");
  if (!issuer || !clientId || !clientSecret) throw new Error(`${definition.prefix} is not configured.`);
  return {
    ...definition,
    realm,
    issuer,
    clientId,
    clientSecret,
    scopes: value("SCOPES") || "openid profile email offline_access",
    prompt: value("PROMPT"),
    idleMinutes: boundedNumber(value("IDLE_MINUTES"), realm === "admin" ? 30 : 60, 5, 1440),
    absoluteMinutes: boundedNumber(value("ABSOLUTE_MINUTES"), realm === "admin" ? 480 : 1440, 15, 43200)
  };
}

function firstClaim(claims, ...keys) {
  for (const key of keys) {
    const value = claims?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function boundedNumber(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalised = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalised.padEnd(normalised.length + ((4 - normalised.length % 4) % 4), "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function randomValue(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64Url(value);
}

async function sha256Bytes(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export async function hashToken(value) {
  return [...await sha256Bytes(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  const prefix = `${name}=`;
  const entry = (request.headers.get("Cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : "";
}

function secureCookie(name, value, { path, maxAge }) {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function expireOidcCookie(realm) {
  const config = REALMS[realm];
  return secureCookie(config.cookie, "", { path: config.path, maxAge: 0 });
}

function expireTransactionCookie(realm) {
  const config = REALMS[realm];
  return secureCookie(config.transactionCookie, "", { path: config.callbackPath, maxAge: 0 });
}

function safeReturnPath(value, realm) {
  const fallback = realm === "admin" ? "/admin/" : "/account/";
  try {
    const raw = String(value || "");
    if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
    const candidate = new URL(raw, "https://return.local");
    if (candidate.origin !== "https://return.local" || !candidate.pathname.startsWith(`${REALMS[realm].path}/`)) return fallback;
    return `${candidate.pathname}${candidate.search}`;
  } catch {
    return fallback;
  }
}

async function discover(config) {
  const cached = discoveryCache.get(config.issuer);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const response = await fetch(`${config.issuer}/.well-known/openid-configuration`, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 3600, cacheEverything: true }
  });
  if (!response.ok) throw new Error("Unable to load the Microsoft OpenID configuration.");
  const value = await response.json();
  if (!value.authorization_endpoint || !value.token_endpoint || !value.jwks_uri || !value.issuer) {
    throw new Error("The Microsoft OpenID configuration is incomplete.");
  }
  discoveryCache.set(config.issuer, { value, expiresAt: Date.now() + 3_600_000 });
  return value;
}

async function getJwks(uri, force = false) {
  const cached = jwksCache.get(uri);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.value;
  const response = await fetch(uri, { headers: { Accept: "application/json" }, cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!response.ok) throw new Error("Unable to load Microsoft signing keys.");
  const value = await response.json();
  if (!Array.isArray(value.keys)) throw new Error("Microsoft signing keys are invalid.");
  jwksCache.set(uri, { value, expiresAt: Date.now() + 3_600_000 });
  return value;
}

function decodeJwt(token) {
  if (String(token || "").length > 65_536) throw new Error("ID token is too large.");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid ID token format.");
  return {
    signingInput: new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    signature: decodeBase64Url(parts[2]),
    header: JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))),
    claims: JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])))
  };
}

async function verifyIdToken(token, config, metadata, expectedNonce) {
  const decoded = decodeJwt(token);
  if (decoded.header.alg !== "RS256" || !decoded.header.kid) throw new Error("Unsupported ID token signing algorithm.");
  let jwks = await getJwks(metadata.jwks_uri);
  const matchesKey = (key) => key.kid === decoded.header.kid && key.kty === "RSA"
    && (!key.use || key.use === "sig") && (!key.alg || key.alg === "RS256");
  let jwk = jwks.keys.find(matchesKey);
  if (!jwk) {
    jwks = await getJwks(metadata.jwks_uri, true);
    jwk = jwks.keys.find(matchesKey);
  }
  if (!jwk) throw new Error("No matching Microsoft signing key was found.");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const validSignature = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decoded.signature, decoded.signingInput);
  if (!validSignature) throw new Error("ID token signature validation failed.");

  const now = Math.floor(Date.now() / 1000);
  const claims = decoded.claims;
  if (claims.iss !== metadata.issuer) throw new Error("ID token issuer validation failed.");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(config.clientId)) throw new Error("ID token audience validation failed.");
  if (audiences.length > 1 && claims.azp !== config.clientId) throw new Error("ID token authorised-party validation failed.");
  if (!Number.isFinite(Number(claims.exp)) || Number(claims.exp) <= now - 60) throw new Error("ID token has expired.");
  if (claims.nbf && Number(claims.nbf) > now + 60) throw new Error("ID token is not active.");
  if (claims.iat && Number(claims.iat) > now + 60) throw new Error("ID token issue time is invalid.");
  if (expectedNonce && claims.nonce !== expectedNonce) throw new Error("ID token nonce validation failed.");
  if (!claims.sub) throw new Error("ID token subject is missing.");
  return claims;
}

async function encryptionKey(env) {
  const secret = String(env.OIDC_TOKEN_ENCRYPTION_KEY || "");
  if (secret.length < 32) throw new Error("OIDC_TOKEN_ENCRYPTION_KEY must contain at least 32 characters.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({
    name: "HKDF",
    hash: "SHA-256",
    salt: new TextEncoder().encode("ja-experiences-native-oidc-v1"),
    info: new TextEncoder().encode("refresh-token-storage")
  }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptSecret(value, env) {
  if (!value) return null;
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(env), new TextEncoder().encode(value));
  return `${base64Url(iv)}.${base64Url(new Uint8Array(encrypted))}`;
}

async function decryptSecret(value, env) {
  if (!value) return "";
  const [iv, encrypted] = String(value).split(".");
  if (!iv || !encrypted) throw new Error("Encrypted token format is invalid.");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64Url(iv) },
    await encryptionKey(env),
    decodeBase64Url(encrypted)
  );
  return new TextDecoder().decode(decrypted);
}

async function ensureTables(DB) {
  if (readyDatabases.has(DB)) return;
  await DB.prepare(`CREATE TABLE IF NOT EXISTS oidc_login_transactions (
    state_hash TEXT PRIMARY KEY, realm TEXT NOT NULL, nonce TEXT NOT NULL, code_verifier TEXT NOT NULL,
    return_to TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, expires_at TEXT NOT NULL, used_at TEXT
  )`).run();
  for (const table of ["admin_oidc_sessions", "customer_oidc_sessions"]) {
    await DB.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
      token_hash TEXT PRIMARY KEY, subject TEXT NOT NULL, tenant_id TEXT, email TEXT NOT NULL, name TEXT,
      refresh_token_encrypted TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
      idle_expires_at TEXT NOT NULL, absolute_expires_at TEXT NOT NULL, refresh_after TEXT NOT NULL,
      revoked_at TEXT, ip_hash TEXT, user_agent TEXT,
      microsoft_object_id TEXT, microsoft_given_name TEXT, microsoft_family_name TEXT,
      microsoft_preferred_username TEXT, microsoft_locale TEXT
    )`).run();
    for (const column of [
      "microsoft_object_id TEXT",
      "microsoft_given_name TEXT",
      "microsoft_family_name TEXT",
      "microsoft_preferred_username TEXT",
      "microsoft_locale TEXT"
    ]) {
      try {
        await DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column}`).run();
      } catch {
        // Existing sessions tables may already include the column.
      }
    }
  }
  readyDatabases.add(DB);
}

async function getTableColumns(DB, table) {
  let cache = tableColumnsCache.get(DB);
  if (!cache) {
    cache = new Map();
    tableColumnsCache.set(DB, cache);
  }
  if (cache.has(table)) return cache.get(table);
  try {
    const result = await DB.prepare(`PRAGMA table_info(${table})`).all();
    const columns = new Set((result.results || []).map((row) => String(row.name || "").trim()).filter(Boolean));
    cache.set(table, columns);
    return columns;
  } catch {
    const columns = new Set();
    cache.set(table, columns);
    return columns;
  }
}

function emailFromClaims(claims) {
  const emails = Array.isArray(claims.emails) ? claims.emails : [];
  return String(claims.email || claims.preferred_username || claims.upn || emails[0] || "").trim().toLowerCase();
}

async function ensureProfileColumns(DB) {
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

  for (const column of [
    "microsoft_object_id TEXT",
    "microsoft_tenant_id TEXT",
    "microsoft_display_name TEXT",
    "microsoft_given_name TEXT",
    "microsoft_family_name TEXT",
    "microsoft_email TEXT",
    "microsoft_preferred_username TEXT",
    "microsoft_locale TEXT",
    "microsoft_updated_at TEXT",
    "stripe_customer_id TEXT",
    "stripe_customer_created_at TEXT",
    "stripe_customer_synced_at TEXT"
  ]) {
    try {
      await DB.prepare(`ALTER TABLE profiles ADD COLUMN ${column}`).run();
    } catch {
      // Existing databases may already have the column.
    }
  }
}

function isDebugAuthLoggingEnabled(env) {
  const value = String(env?.JA_DEBUG_AUTH_LOGGING || env?.NODE_ENV || env?.ENVIRONMENT || "").toLowerCase();
  return value === "true" || value === "development" || value === "preview";
}

function requestCorrelationId(request) {
  return String(
    request.headers.get("cf-ray") ||
    request.headers.get("x-request-id") ||
    request.headers.get("x-correlation-id") ||
    crypto.randomUUID()
  ).trim();
}

function logAuthEvent(env, payload) {
  if (!isDebugAuthLoggingEnabled(env)) return;
  console.error(JSON.stringify({
    component: "native-oidc",
    ...payload
  }));
}

function serialiseError(error) {
  return {
    message: error instanceof Error ? error.message : String(error || "Unknown error"),
    stack: error instanceof Error ? error.stack : ""
  };
}

async function stage(context, realm, name, fn, extra = {}) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      error.authStage = {
        realm,
        stage: name,
        file: "functions/_shared/oidc.js",
        function: "completeLogin",
        requestId: requestCorrelationId(context.request),
        ...extra
      };
    }
    logAuthEvent(context.env, {
      realm,
      stage: name,
      file: "functions/_shared/oidc.js",
      function: "completeLogin",
      requestId: requestCorrelationId(context.request),
      ...extra,
      error: serialiseError(error)
    });
    throw error;
  }
}

async function syncCustomerProfileFromClaims(context, claims, email) {
  if (!context.env.DB || !email) return;
  await ensureProfileColumns(context.env.DB);

  const profileEmail = String(email || "").trim().toLowerCase();
  const displayName = firstClaim(claims, "name") || profileEmail;
  const givenName = firstClaim(claims, "given_name");
  const familyName = firstClaim(claims, "family_name");
  const preferredUsername = firstClaim(claims, "preferred_username", "upn", "email");
  const locale = firstClaim(claims, "locale");

  await context.env.DB.prepare(`
    INSERT INTO profiles (
      email,
      verified_name,
      display_name,
      contact_email,
      microsoft_object_id,
      microsoft_tenant_id,
      microsoft_display_name,
      microsoft_given_name,
      microsoft_family_name,
      microsoft_email,
      microsoft_preferred_username,
      microsoft_locale,
      microsoft_updated_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      verified_name = COALESCE(excluded.verified_name, profiles.verified_name),
      display_name = COALESCE(NULLIF(excluded.display_name, ''), profiles.display_name, excluded.verified_name, profiles.email),
      contact_email = COALESCE(NULLIF(excluded.contact_email, ''), profiles.contact_email, excluded.email),
      microsoft_object_id = COALESCE(NULLIF(excluded.microsoft_object_id, ''), profiles.microsoft_object_id),
      microsoft_tenant_id = COALESCE(NULLIF(excluded.microsoft_tenant_id, ''), profiles.microsoft_tenant_id),
      microsoft_display_name = COALESCE(NULLIF(excluded.microsoft_display_name, ''), profiles.microsoft_display_name),
      microsoft_given_name = COALESCE(NULLIF(excluded.microsoft_given_name, ''), profiles.microsoft_given_name),
      microsoft_family_name = COALESCE(NULLIF(excluded.microsoft_family_name, ''), profiles.microsoft_family_name),
      microsoft_email = COALESCE(NULLIF(excluded.microsoft_email, ''), profiles.microsoft_email),
      microsoft_preferred_username = COALESCE(NULLIF(excluded.microsoft_preferred_username, ''), profiles.microsoft_preferred_username),
      microsoft_locale = COALESCE(NULLIF(excluded.microsoft_locale, ''), profiles.microsoft_locale),
      microsoft_updated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    profileEmail,
    displayName,
    displayName,
    profileEmail,
    firstClaim(claims, "oid", "sub"),
    firstClaim(claims, "tid"),
    displayName,
    givenName,
    familyName,
    firstClaim(claims, "email"),
    preferredUsername,
    locale
  ).run();
}

export function nativeOidcEnabled(env) {
  return String(env.NATIVE_OIDC_ENABLED || "").toLowerCase() === "true";
}

export async function beginLogin(context, realm) {
  const config = realmConfig(realm, context.env);
  if (!context.env.DB) throw new Error("D1 is required for native authentication.");
  await ensureTables(context.env.DB);
  await context.env.DB.prepare(`DELETE FROM oidc_login_transactions WHERE datetime(expires_at) <= datetime('now') OR datetime(created_at) < datetime('now', '-1 day')`).run();
  const metadata = await discover(config);
  const requestUrl = new URL(context.request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("return_to"), realm);
  const state = randomValue(32);
  const nonce = randomValue(32);
  const verifier = randomValue(64);
  const challenge = base64Url(await sha256Bytes(verifier));
  const stateHash = await hashToken(state);
  await context.env.DB.prepare(`
    INSERT INTO oidc_login_transactions (state_hash, realm, nonce, code_verifier, return_to, expires_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '+10 minutes'))
  `).bind(stateHash, realm, nonce, verifier, returnTo).run();

  const redirectUri = `${requestUrl.origin}${config.callbackPath}`;
  const authorization = new URL(metadata.authorization_endpoint);
  authorization.searchParams.set("client_id", config.clientId);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("redirect_uri", redirectUri);
  authorization.searchParams.set("response_mode", "query");
  authorization.searchParams.set("scope", config.scopes);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("nonce", nonce);
  authorization.searchParams.set("code_challenge", challenge);
  authorization.searchParams.set("code_challenge_method", "S256");
  if (config.prompt) authorization.searchParams.set("prompt", config.prompt);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorization.toString(),
      "Set-Cookie": secureCookie(config.transactionCookie, state, { path: config.callbackPath, maxAge: 600 }),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer"
    }
  });
}

export async function completeLogin(context, realm) {
  const config = realmConfig(realm, context.env);
  const url = new URL(context.request.url);
  const requestId = requestCorrelationId(context.request);
  const state = url.searchParams.get("state") || "";
  const cookieState = readCookie(context.request, config.transactionCookie);
  if (!state || !cookieState || state !== cookieState) throw new Error("Authentication state validation failed.");
  if (url.searchParams.get("error")) throw new Error(`Microsoft authentication failed: ${url.searchParams.get("error")}.`);
  const code = url.searchParams.get("code") || "";
  if (!code) throw new Error("Microsoft did not return an authorisation code.");
  await stage(context, realm, "table_initialisation", async () => {
    await ensureTables(context.env.DB);
  }, { requestId });

  const stateHash = await stage(context, realm, "state_hash", () => hashToken(state), { requestId });
  const transaction = await stage(context, realm, "transaction_lookup", async () => {
    const row = await context.env.DB.prepare(`
      SELECT state_hash, nonce, code_verifier, return_to FROM oidc_login_transactions
      WHERE state_hash = ? AND realm = ? AND used_at IS NULL AND datetime(expires_at) > datetime('now')
    `).bind(stateHash, realm).first();
    return row;
  }, { requestId, stateHash });
  if (!transaction) throw new Error("The authentication transaction is invalid or expired.");

  await stage(context, realm, "transaction_mark_used", async () => {
    await context.env.DB.prepare(`UPDATE oidc_login_transactions SET used_at = CURRENT_TIMESTAMP WHERE state_hash = ?`).bind(stateHash).run();
  }, { requestId, stateHash });

  const metadata = await stage(context, realm, "discovery", () => discover(config), { requestId });
  const redirectUri = `${url.origin}${config.callbackPath}`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: transaction.code_verifier,
    scope: config.scopes
  });
  const tokenResponse = await stage(context, realm, "token_exchange", async () => {
    return await fetch(metadata.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: body.toString()
    });
  }, { requestId, redirectUri, tokenEndpoint: metadata.token_endpoint });
  const tokens = await stage(context, realm, "token_exchange_response", async () => {
    const payload = await tokenResponse.json();
    if (!tokenResponse.ok || !payload.id_token) {
      const error = new Error("Microsoft token exchange failed.");
      error.details = {
        status: tokenResponse.status,
        response_ok: tokenResponse.ok
      };
      throw error;
    }
    return payload;
  }, { requestId, redirectUri, tokenStatus: tokenResponse.status });

  const claims = await stage(context, realm, "id_token_validation", () => verifyIdToken(tokens.id_token, config, metadata, transaction.nonce), {
    requestId,
    redirectUri
  });
  const email = await stage(context, realm, "email_extraction", () => {
    const value = emailFromClaims(claims);
    if (!value) throw new Error("Microsoft did not provide an email identity.");
    return value;
  }, { requestId, redirectUri });

  if (realm === "customer") {
    try {
      await syncCustomerProfileFromClaims(context, claims, email);
    } catch (error) {
      console.error(JSON.stringify({
        event: "customer_profile_sync_failed",
        message: error instanceof Error ? error.message : "Unknown profile sync error",
        email,
        requestId
      }));
    }
  }

  const sessionToken = randomValue(48);
  const sessionHash = await stage(context, realm, "session_hash", () => hashToken(sessionToken), {
    requestId,
    customerEmail: email
  });
  const ipHash = await stage(context, realm, "ip_hash", () => hashToken(context.request.headers.get("CF-Connecting-IP") || "unknown"), {
    requestId,
    customerEmail: email
  });
  const encryptedRefreshToken = await stage(context, realm, "refresh_token_encryption", () => encryptSecret(tokens.refresh_token, context.env), {
    requestId,
    customerEmail: email
  });
  await stage(context, realm, "session_creation", async () => {
    const columns = await getTableColumns(context.env.DB, config.sessionTable);
    const insertSpec = [
      ["token_hash", "?", sessionHash],
      ["subject", "?", claims.sub],
      ["tenant_id", "?", claims.tid || ""],
      ["email", "?", email],
      ["name", "?", String(claims.name || email).trim()],
      ["refresh_token_encrypted", "?", encryptedRefreshToken],
      ["idle_expires_at", "datetime('now', ?)", `+${config.idleMinutes} minutes`],
      ["absolute_expires_at", "datetime('now', ?)", `+${config.absoluteMinutes} minutes`],
      ["refresh_after", "datetime('now', '+50 minutes')", null],
      ["ip_hash", "?", ipHash],
      ["user_agent", "?", String(context.request.headers.get("User-Agent") || "").slice(0, 500)]
    ];
    const optional = [
      ["microsoft_object_id", "?", firstClaim(claims, "oid", "sub")],
      ["microsoft_given_name", "?", firstClaim(claims, "given_name")],
      ["microsoft_family_name", "?", firstClaim(claims, "family_name")],
      ["microsoft_preferred_username", "?", firstClaim(claims, "preferred_username", "upn", "email")],
      ["microsoft_locale", "?", firstClaim(claims, "locale")]
    ];
    for (const [column, placeholder, value] of optional) {
      if (columns.has(column)) {
        insertSpec.push([column, placeholder, value]);
      }
    }
    const insertColumns = insertSpec.map(([column]) => column);
    const placeholders = insertSpec.map(([, placeholder]) => placeholder);
    const bindValues = insertSpec
      .filter(([, , value]) => value !== null)
      .map(([, , value]) => value);
    await context.env.DB.prepare(`
      INSERT INTO ${config.sessionTable} (${insertColumns.join(", ")})
      VALUES (${placeholders.join(", ")})
    `).bind(...bindValues).run();
  }, {
    requestId,
    customerEmail: email,
    sessionTable: config.sessionTable,
    sqlStatement: "insert_customer_oidc_session"
  });

  const headers = await stage(context, realm, "redirect_generation", () => {
    const responseHeaders = new Headers({
      Location: safeReturnPath(transaction.return_to, realm),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer"
    });
    responseHeaders.append("Set-Cookie", secureCookie(config.cookie, sessionToken, { path: config.path, maxAge: config.absoluteMinutes * 60 }));
    responseHeaders.append("Set-Cookie", expireTransactionCookie(realm));
    return responseHeaders;
  }, {
    requestId,
    customerEmail: email
  });
  return new Response(null, { status: 302, headers });
}

export async function getNativeSession(request, env, realm) {
  const config = realmConfig(realm, env);
  if (!env.DB) return null;
  await ensureTables(env.DB);
  const token = readCookie(request, config.cookie);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await env.DB.prepare(`
    SELECT token_hash, subject, tenant_id, email, name, refresh_token_encrypted, refresh_after,
      microsoft_object_id, microsoft_given_name, microsoft_family_name, microsoft_preferred_username, microsoft_locale,
      datetime(refresh_after) <= datetime('now') AS refresh_due,
      created_at, last_seen_at, idle_expires_at, absolute_expires_at
    FROM ${config.sessionTable}
    WHERE token_hash = ? AND revoked_at IS NULL
      AND datetime(idle_expires_at) > datetime('now')
      AND datetime(absolute_expires_at) > datetime('now')
  `).bind(tokenHash).first();
  if (!row) {
    await env.DB.prepare(`UPDATE ${config.sessionTable} SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP) WHERE token_hash = ?`).bind(tokenHash).run();
    return null;
  }
  if (row.refresh_token_encrypted && Number(row.refresh_due || 0) === 1) {
    const refreshClaim = await env.DB.prepare(`
      UPDATE ${config.sessionTable}
      SET refresh_after = datetime('now', '+2 minutes')
      WHERE token_hash = ? AND revoked_at IS NULL AND datetime(refresh_after) <= datetime('now')
    `).bind(tokenHash).run();
    const claimed = Number(refreshClaim?.meta?.changes ?? 1) > 0;
    if (claimed) {
      let fatalRefreshFailure = false;
      try {
        const metadata = await discover(config);
        let refreshToken;
        try {
          refreshToken = await decryptSecret(row.refresh_token_encrypted, env);
        } catch (error) {
          fatalRefreshFailure = true;
          throw error;
        }
        const response = await fetch(metadata.token_endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            scope: config.scopes
          }).toString()
        });
        const tokens = await response.json();
        if (!response.ok) {
          fatalRefreshFailure = response.status >= 400 && response.status < 500 && response.status !== 429;
          throw new Error("Microsoft refresh-token exchange failed.");
        }
        let refreshed = { email: row.email, name: row.name, subject: row.subject, tenantId: row.tenant_id };
        let refreshedClaims = null;
        if (tokens.id_token) {
          try {
            refreshedClaims = await verifyIdToken(tokens.id_token, config, metadata, "");
          } catch (error) {
            fatalRefreshFailure = true;
            throw error;
          }
          refreshed = {
            email: emailFromClaims(refreshedClaims) || row.email,
            name: String(refreshedClaims.name || row.name || row.email),
            subject: refreshedClaims.sub,
            tenantId: refreshedClaims.tid || row.tenant_id
          };
        }
        const encryptedRefresh = tokens.refresh_token ? await encryptSecret(tokens.refresh_token, env) : row.refresh_token_encrypted;
        await env.DB.prepare(`
          UPDATE ${config.sessionTable}
          SET subject = ?, tenant_id = ?, email = ?, name = ?, refresh_token_encrypted = ?, refresh_after = datetime('now', '+50 minutes'),
            microsoft_object_id = ?, microsoft_given_name = ?, microsoft_family_name = ?, microsoft_preferred_username = ?, microsoft_locale = ?
          WHERE token_hash = ? AND revoked_at IS NULL
        `).bind(
          refreshed.subject,
          refreshed.tenantId,
          refreshed.email,
          refreshed.name,
          encryptedRefresh,
          firstClaim(refreshedClaims || {}, "oid", "sub"),
          firstClaim(refreshedClaims || {}, "given_name"),
          firstClaim(refreshedClaims || {}, "family_name"),
          firstClaim(refreshedClaims || {}, "preferred_username", "upn", "email"),
          firstClaim(refreshedClaims || {}, "locale"),
          tokenHash
        ).run();
        Object.assign(row, {
          subject: refreshed.subject,
          tenant_id: refreshed.tenantId,
          email: refreshed.email,
          name: refreshed.name
        });
      } catch {
        if (fatalRefreshFailure) {
          await env.DB.prepare(`UPDATE ${config.sessionTable} SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`).bind(tokenHash).run();
          return null;
        }
        await env.DB.prepare(`
          UPDATE ${config.sessionTable} SET refresh_after = datetime('now', '+5 minutes')
          WHERE token_hash = ? AND revoked_at IS NULL
        `).bind(tokenHash).run();
      }
    }
  }
  await env.DB.prepare(`
    UPDATE ${config.sessionTable}
    SET last_seen_at = CURRENT_TIMESTAMP, idle_expires_at = MIN(datetime('now', ?), absolute_expires_at)
    WHERE token_hash = ?
  `).bind(`+${config.idleMinutes} minutes`, tokenHash).run();
  return {
    realm,
    tokenHash,
    subject: row.subject,
    tenantId: row.tenant_id,
    email: row.email,
    name: row.name || row.email,
    objectId: row.microsoft_object_id || "",
    givenName: row.microsoft_given_name || "",
    familyName: row.microsoft_family_name || "",
    preferredUsername: row.microsoft_preferred_username || "",
    locale: row.microsoft_locale || ""
  };
}

export async function revokeNativeSession(request, env, realm) {
  const config = realmConfig(realm, env);
  if (!env.DB) return;
  await ensureTables(env.DB);
  const token = readCookie(request, config.cookie);
  if (!token) return;
  await env.DB.prepare(`UPDATE ${config.sessionTable} SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL`)
    .bind(await hashToken(token)).run();
}

export async function nativeLogout(context, realm, additionalCookies = []) {
  const config = realmConfig(realm, context.env);
  await revokeNativeSession(context.request, context.env, realm);
  const signedOut = `${new URL(context.request.url).origin}/signed-out/${realm}/`;
  let destination = signedOut;
  try {
    const metadata = await discover(config);
    if (!metadata.end_session_endpoint) throw new Error("Microsoft did not publish an end-session endpoint.");
    const logout = new URL(metadata.end_session_endpoint);
    logout.searchParams.set("post_logout_redirect_uri", signedOut);
    destination = logout.toString();
  } catch (error) {
    console.error(JSON.stringify({
      event: "oidc_logout_provider_unavailable",
      realm,
      message: error instanceof Error ? error.message : "Unknown provider error"
    }));
  }
  const headers = new Headers({
    Location: destination,
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer"
  });
  headers.append("Set-Cookie", expireOidcCookie(realm));
  for (const cookie of additionalCookies) headers.append("Set-Cookie", cookie);
  return new Response(null, {
    status: 302,
    headers
  });
}

export function loginRedirect(request, realm) {
  const url = new URL(request.url);
  const returnTo = `${url.pathname}${url.search}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${REALMS[realm].loginPath}?return_to=${encodeURIComponent(returnTo)}`,
      "Cache-Control": "no-store"
    }
  });
}

export function assertSameOrigin(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return true;
  const origin = request.headers.get("Origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export function withIdentity(request, identity) {
  const headers = new Headers(request.headers);
  headers.delete("x-ja-auth-email");
  headers.delete("x-ja-auth-name");
  headers.delete("x-ja-auth-realm");
  headers.delete("x-ja-auth-subject");
  headers.delete("x-ja-auth-tenant");
  headers.delete("x-ja-auth-object-id");
  headers.delete("x-ja-auth-given-name");
  headers.delete("x-ja-auth-family-name");
  headers.delete("x-ja-auth-preferred-username");
  headers.delete("x-ja-auth-locale");
  headers.delete("x-ja-auth-session");
  if (identity) {
    headers.set("x-ja-auth-email", identity.email);
    headers.set("x-ja-auth-name", identity.name);
    headers.set("x-ja-auth-realm", identity.realm);
    if (identity.subject) headers.set("x-ja-auth-subject", identity.subject);
    if (identity.tenantId) headers.set("x-ja-auth-tenant", identity.tenantId);
    if (identity.objectId) headers.set("x-ja-auth-object-id", identity.objectId);
    if (identity.givenName) headers.set("x-ja-auth-given-name", identity.givenName);
    if (identity.familyName) headers.set("x-ja-auth-family-name", identity.familyName);
    if (identity.preferredUsername) headers.set("x-ja-auth-preferred-username", identity.preferredUsername);
    if (identity.locale) headers.set("x-ja-auth-locale", identity.locale);
    if (identity.tokenHash) headers.set("x-ja-auth-session", identity.tokenHash);
  }
  return new Request(request, { headers });
}

export function nativeIdentity(request) {
  return {
    email: String(request.headers.get("x-ja-auth-email") || "").trim().toLowerCase(),
    name: String(request.headers.get("x-ja-auth-name") || "").trim(),
    realm: String(request.headers.get("x-ja-auth-realm") || "").trim(),
    subject: String(request.headers.get("x-ja-auth-subject") || "").trim(),
    tenantId: String(request.headers.get("x-ja-auth-tenant") || "").trim(),
    objectId: String(request.headers.get("x-ja-auth-object-id") || "").trim(),
    givenName: String(request.headers.get("x-ja-auth-given-name") || "").trim(),
    familyName: String(request.headers.get("x-ja-auth-family-name") || "").trim(),
    preferredUsername: String(request.headers.get("x-ja-auth-preferred-username") || "").trim(),
    locale: String(request.headers.get("x-ja-auth-locale") || "").trim()
  };
}
