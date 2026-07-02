import assert from "node:assert/strict";
import test from "node:test";
import {
  beginLogin,
  completeLogin,
  getNativeSession,
  nativeLogout,
  nativeOidcEnabled
} from "../functions/_shared/oidc.js";

function base64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  return Buffer.from(bytes).toString("base64url");
}

class MockD1 {
  constructor() {
    this.transaction = null;
    this.session = null;
    this.revoked = false;
    this.refreshClaimed = false;
  }

  prepare(sql) {
    const database = this;
    return {
      bind(...values) {
        return {
          async run() {
            if (sql.includes("INSERT INTO oidc_login_transactions")) {
              database.transaction = {
                state_hash: values[0], realm: values[1], nonce: values[2],
                code_verifier: values[3], return_to: values[4]
              };
            }
            if (sql.includes("INSERT INTO admin_oidc_sessions")) {
              database.session = {
                token_hash: values[0], subject: values[1], tenant_id: values[2], email: values[3],
                name: values[4], refresh_token_encrypted: values[5], refresh_due: 0,
                created_at: "2026-07-01 12:00:00", last_seen_at: "2026-07-01 12:00:00",
                idle_expires_at: "2026-07-01 12:30:00", absolute_expires_at: "2026-07-01 20:00:00"
              };
            }
            if (sql.includes("INSERT INTO customer_oidc_sessions")) {
              database.customerSession = {
                token_hash: values[0], subject: values[1], tenant_id: values[2], email: values[3],
                name: values[4], refresh_token_encrypted: values[5], refresh_due: 0,
                created_at: "2026-07-01 12:00:00", last_seen_at: "2026-07-01 12:00:00",
                idle_expires_at: "2026-07-01 12:30:00", absolute_expires_at: "2026-07-01 20:00:00"
              };
            }
            if (sql.includes("SET refresh_after = datetime('now', '+2 minutes')")) {
              if (database.refreshClaimed) return { success: true, meta: { changes: 0 } };
              database.refreshClaimed = true;
              return { success: true, meta: { changes: 1 } };
            }
            if (sql.includes("SET subject = ?") && database.session) {
              Object.assign(database.session, {
                subject: values[0], tenant_id: values[1], email: values[2], name: values[3],
                refresh_token_encrypted: values[4], refresh_due: 0
              });
            }
            if (sql.includes("SET subject = ?") && database.customerSession) {
              Object.assign(database.customerSession, {
                subject: values[0], tenant_id: values[1], email: values[2], name: values[3],
                refresh_token_encrypted: values[4], refresh_due: 0
              });
            }
            if (sql.includes("SET revoked_at = CURRENT_TIMESTAMP")) database.revoked = true;
            if (sql.includes("SET revoked_at = CURRENT_TIMESTAMP") && sql.includes("customer_oidc_sessions")) database.customerRevoked = true;
            return { success: true };
          },
          async first() {
            if (sql.includes("FROM oidc_login_transactions")) return database.transaction;
            if (sql.includes("FROM admin_oidc_sessions")) return database.revoked ? null : database.session;
            if (sql.includes("FROM customer_oidc_sessions")) return database.customerRevoked ? null : database.customerSession;
            return null;
          }
        };
      },
      async run() { return { success: true }; }
    };
  }
}

const env = {
  NATIVE_OIDC_ENABLED: "true",
  ADMIN_OIDC_ISSUER: "https://login.example.test/tenant/v2.0",
  ADMIN_OIDC_CLIENT_ID: "admin-client-id",
  ADMIN_OIDC_CLIENT_SECRET: "test-client-secret",
  ADMIN_OIDC_PROMPT: "login",
  OIDC_TOKEN_ENCRYPTION_KEY: "test-only-encryption-key-with-more-than-32-characters"
};

async function signedIdToken(
  privateKey,
  kid,
  nonce,
  issuer = "https://login.example.test/tenant/v2.0",
  audience = "admin-client-id",
  email = "admin@example.test",
  subject = "subject-1",
  tenantId = "tenant-1",
  name = "Test Administrator"
) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: issuer,
    aud: audience,
    sub: subject,
    tid: tenantId,
    email,
    name,
    nonce,
    iat: now,
    nbf: now - 1,
    exp: now + 300
  }));
  const input = new TextEncoder().encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, input);
  return `${header}.${payload}.${base64Url(new Uint8Array(signature))}`;
}

test("native authentication remains feature-gated", () => {
  assert.equal(nativeOidcEnabled({}), false);
  assert.equal(nativeOidcEnabled({ NATIVE_OIDC_ENABLED: "true" }), true);
});

test("customer and administrator realms use independent authorities and cookies", async () => {
  const originalFetch = globalThis.fetch;
  const DB = new MockD1();
  const customerEnv = {
    ...env,
    CUSTOMER_OIDC_ISSUER: "https://customer.ciamlogin.com/customer-tenant/v2.0",
    CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
    CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret",
    CUSTOMER_OIDC_PROMPT: "login"
  };
  globalThis.fetch = async () => Response.json({
    issuer: customerEnv.CUSTOMER_OIDC_ISSUER,
    authorization_endpoint: "https://customer.ciamlogin.com/authorize",
    token_endpoint: "https://customer.ciamlogin.com/token",
    jwks_uri: "https://customer.ciamlogin.com/keys",
    end_session_endpoint: "https://customer.ciamlogin.com/logout"
  });
  try {
    const response = await beginLogin({
      request: new Request("https://experiences.example.test/account/login?return_to=https%3A%2F%2Fevil.example%2F"),
      env: { ...customerEnv, DB }
    }, "customer");
    assert.equal(new URL(response.headers.get("location")).hostname, "customer.ciamlogin.com");
    assert.match(response.headers.get("set-cookie"), /^ja_customer_oidc_tx=/);
    assert.equal(DB.transaction.realm, "customer");
    assert.equal(DB.transaction.return_to, "/account/");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("customer OIDC flow creates a session and redirects into the portal", async () => {
  const originalFetch = globalThis.fetch;
  const DB = new MockD1();
  const keys = await crypto.subtle.generateKey({
    name: "RSASSA-PKCS1-v1_5", modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256"
  }, true, ["sign", "verify"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
  publicJwk.kid = "test-key";
  publicJwk.alg = "RS256";
  const customerEnv = {
    ...env,
    CUSTOMER_OIDC_ISSUER: "https://customer.ciamlogin.com/customer-tenant/v2.0",
    CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
    CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret",
    CUSTOMER_OIDC_PROMPT: "login",
    CUSTOMER_OIDC_SCOPES: "openid profile email offline_access"
  };
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.endsWith("/.well-known/openid-configuration")) {
      return Response.json({
        issuer: customerEnv.CUSTOMER_OIDC_ISSUER,
        authorization_endpoint: "https://customer.ciamlogin.com/authorize",
        token_endpoint: "https://customer.ciamlogin.com/token",
        jwks_uri: "https://customer.ciamlogin.com/keys",
        end_session_endpoint: "https://customer.ciamlogin.com/logout"
      });
    }
    if (target.endsWith("/keys")) {
      return Response.json({ keys: [publicJwk] });
    }
    if (target.endsWith("/token")) {
      return Response.json({
        id_token: await signedIdToken(
          keys.privateKey,
          "test-key",
          DB.transaction.nonce,
          customerEnv.CUSTOMER_OIDC_ISSUER,
          customerEnv.CUSTOMER_OIDC_CLIENT_ID,
          "customer@example.test",
          "customer-subject-1",
          "customer-tenant-1",
          "Test Customer"
        ),
        refresh_token: "customer-refresh-token"
      });
    }
    throw new Error(`Unexpected fetch: ${target}`);
  };
  try {
    const start = await beginLogin({
      request: new Request("https://experiences.example.test/account/login?return_to=%2Faccount%2Fdashboard%2F"),
      env: { ...customerEnv, DB }
    }, "customer");
    const state = new URL(start.headers.get("location")).searchParams.get("state");
    const transactionCookie = start.headers.get("set-cookie").split(";")[0];
    const callback = await completeLogin({
      request: new Request(`https://experiences.example.test/account/auth/callback?code=test-code&state=${encodeURIComponent(state)}`, {
        headers: { Cookie: transactionCookie }
      }),
      env: { ...customerEnv, DB }
    }, "customer");
    assert.equal(callback.status, 302);
    assert.equal(callback.headers.get("location"), "/account/dashboard/");
    assert.match(callback.headers.get("set-cookie"), /ja_customer_oidc_session=/);
    assert.equal(DB.customerSession.email, "customer@example.test");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("administrator OIDC flow uses state, nonce, PKCE and a validated signed token", async () => {
  const originalFetch = globalThis.fetch;
  const DB = new MockD1();
  const keys = await crypto.subtle.generateKey({
    name: "RSASSA-PKCS1-v1_5", modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256"
  }, true, ["sign", "verify"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
  publicJwk.kid = "test-key";
  publicJwk.alg = "RS256";

  let tokenRequests = 0;
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.endsWith("/.well-known/openid-configuration")) {
      return Response.json({
        issuer: env.ADMIN_OIDC_ISSUER,
        authorization_endpoint: "https://login.example.test/authorize",
        token_endpoint: "https://login.example.test/token",
        jwks_uri: "https://login.example.test/keys",
        end_session_endpoint: "https://login.example.test/logout"
      });
    }
    if (target.endsWith("/keys")) return Response.json({ keys: [publicJwk] });
    if (target.endsWith("/token")) {
      tokenRequests += 1;
      return Response.json({
        id_token: await signedIdToken(
          keys.privateKey,
          "test-key",
          DB.transaction.nonce,
          env.ADMIN_OIDC_ISSUER,
          env.ADMIN_OIDC_CLIENT_ID,
          "admin@example.test",
          "subject-1",
          "tenant-1",
          "Test Administrator"
        ),
        refresh_token: `refresh-token-${tokenRequests}`
      });
    }
    throw new Error(`Unexpected fetch: ${target}`);
  };

  try {
    const start = await beginLogin({
      request: new Request("https://experiences.example.test/admin/login?return_to=%2Fadmin%2F%3Fsection%3Dcustomers"),
      env: { ...env, DB }
    }, "admin");
    assert.equal(start.status, 302);
    const authorization = new URL(start.headers.get("location"));
    assert.equal(authorization.searchParams.get("response_type"), "code");
    assert.equal(authorization.searchParams.get("code_challenge_method"), "S256");
    assert.ok(authorization.searchParams.get("code_challenge"));
    assert.equal(authorization.searchParams.get("nonce"), DB.transaction.nonce);
    assert.equal(authorization.searchParams.get("prompt"), "login");
    const state = authorization.searchParams.get("state");
    const transactionCookie = start.headers.get("set-cookie").split(";")[0];

    await assert.rejects(() => completeLogin({
      request: new Request(`https://experiences.example.test/admin/auth/callback?code=test-code&state=${encodeURIComponent(state)}`, {
        headers: { Cookie: "ja_admin_oidc_tx=wrong-state" }
      }),
      env: { ...env, DB }
    }, "admin"), /state validation failed/);

    const callback = await completeLogin({
      request: new Request(`https://experiences.example.test/admin/auth/callback?code=test-code&state=${encodeURIComponent(state)}`, {
        headers: { Cookie: transactionCookie }
      }),
      env: { ...env, DB }
    }, "admin");
    assert.equal(callback.status, 302);
    assert.equal(callback.headers.get("location"), "/admin/?section=customers");
    assert.match(callback.headers.get("set-cookie"), /ja_admin_session=/);
    assert.equal(DB.session.email, "admin@example.test");
    assert.notEqual(DB.session.refresh_token_encrypted, "refresh-token-1");

    const sessionCookie = callback.headers.get("set-cookie").match(/ja_admin_session=([^;,]+)/)[0];
    DB.session.refresh_due = 1;
    const identity = await getNativeSession(new Request("https://experiences.example.test/admin/", {
      headers: { Cookie: sessionCookie }
    }), { ...env, DB }, "admin");
    assert.equal(identity.email, "admin@example.test");
    assert.equal(tokenRequests, 1);
    assert.equal(DB.refreshClaimed, false);
    assert.notEqual(DB.session.refresh_token_encrypted, "refresh-token-2");

    const logout = await nativeLogout({
      request: new Request("https://experiences.example.test/admin/logout", { headers: { Cookie: sessionCookie } }),
      env: { ...env, DB }
    }, "admin");
    assert.equal(logout.status, 302);
    assert.equal(new URL(logout.headers.get("location")).pathname, "/logout");
    assert.equal(DB.revoked, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("logout clears application cookies even when Microsoft discovery is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const DB = new MockD1();
  const customerEnv = {
    ...env,
    CUSTOMER_OIDC_ISSUER: "https://unavailable.ciamlogin.com/customer/v2.0",
    CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
    CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret"
  };
  globalThis.fetch = async () => { throw new Error("Network unavailable"); };
  console.error = () => {};
  try {
    const response = await nativeLogout({
      request: new Request("https://experiences.example.test/account/logout"),
      env: { ...customerEnv, DB }
    }, "customer", ["ja_customer_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"]);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "https://experiences.example.test/signed-out/customer/");
    assert.match(response.headers.get("set-cookie"), /ja_customer_oidc_session=;/);
    assert.match(response.headers.get("set-cookie"), /ja_customer_session=;/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});
