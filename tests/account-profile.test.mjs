import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/account/profile.js";

const profileColumns = [
  "email", "verified_name", "display_name", "contact_email", "phone",
  "communication_preference", "support_notes", "created_at", "updated_at",
  "admin_lifetime", "admin_lifetime_plan_id", "admin_customer_status",
  "microsoft_object_id", "microsoft_tenant_id", "microsoft_display_name",
  "microsoft_given_name", "microsoft_family_name", "microsoft_email",
  "microsoft_preferred_username", "microsoft_locale", "microsoft_country",
  "microsoft_preferred_language", "microsoft_mobile_phone", "microsoft_office_location",
  "microsoft_city", "microsoft_state", "microsoft_postal_code", "microsoft_street_address",
  "microsoft_photo_url", "microsoft_updated_at", "graph_sync_last_at",
  "graph_sync_success", "graph_sync_failure_reason", "graph_sync_last_http_status",
  "graph_sync_last_request_id", "graph_sync_last_client_request_id",
  "stripe_customer_id", "stripe_customer_created_at", "stripe_customer_synced_at"
];

class ProfileD1Mock {
  constructor(session = null, { legacySessionSchema = false } = {}) {
    this.session = session;
    this.legacySessionSchema = legacySessionSchema;
  }

  prepare(sql) {
    let boundValues = [];
    const statement = {
      bind(...values) {
        boundValues = values;
        return statement;
      },
      async run() {
        if (sql.includes("INSERT INTO profiles")) {
          const insert = sql.match(/INSERT INTO profiles\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/s);
          assert.ok(insert, "Profile INSERT must have a parseable column/value list");
          const columns = insert[1].split(",").map((value) => value.trim());
          const values = insert[2].split(",").map((value) => value.trim());
          assert.equal(values.length, columns.length, "Profile INSERT column/value count mismatch");
          assert.equal((insert[2].match(/\?/g) || []).length, boundValues.length, "Profile INSERT placeholder/bind count mismatch");
        }
        return { success: true };
      },
      async all() {
        if (sql.includes("PRAGMA table_info(profiles)")) {
          return { results: profileColumns.map((name) => ({ name })) };
        }
        return { results: [] };
      },
      async first() {
        if (sql.includes("FROM customer_oidc_sessions")) {
          if (this.legacySessionSchema && sql.includes("access_token_encrypted") && !sql.includes("NULL AS access_token_encrypted")) {
            throw new Error("no such column: access_token_encrypted");
          }
          return this.session;
        }
        if (sql.includes("SELECT * FROM profiles")) {
          return {
            email: "customer@example.test",
            verified_name: "Test Customer",
            display_name: "Test Customer",
            contact_email: "customer@example.test",
            admin_customer_status: "Standard",
            created_at: "2026-07-03T00:00:00.000Z",
            updated_at: "2026-07-03T00:00:00.000Z"
          };
        }
        return null;
      }
    };
    statement.session = this.session;
    statement.legacySessionSchema = this.legacySessionSchema;
    return statement;
  }
}

async function encryptToken(value, secret) {
  const encoder = new TextEncoder();
  const material = await crypto.subtle.importKey("raw", encoder.encode(secret), "HKDF", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({
    name: "HKDF",
    hash: "SHA-256",
    salt: encoder.encode("ja-experiences-native-oidc-v1"),
    info: encoder.encode("refresh-token-storage")
  }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `${Buffer.from(iv).toString("base64url")}.${Buffer.from(encrypted).toString("base64url")}`;
}

test("GET /account/profile always returns JSON when Graph tokens are unavailable", async () => {
  const request = new Request("http://127.0.0.1/account/profile", {
    headers: {
      Accept: "application/json",
      "x-ja-auth-email": "customer@example.test",
      "x-ja-auth-name": "Test Customer",
      "x-ja-auth-object-id": "customer-object-id"
    }
  });
  const response = await onRequest({ request, env: { DB: new ProfileD1Mock() }, next: () => assert.fail("static handler called") });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.equal(payload.success, true);
  assert.equal(payload.profile.email, "customer@example.test");
});

test("GET /account/profile returns JSON after a successful Graph /me response", async () => {
  const secret = "test-token-encryption-key-that-is-long-enough";
  const accessToken = await encryptToken("graph-access-token", secret);
  const DB = new ProfileD1Mock({
    token_hash: "session-hash",
    access_token_encrypted: accessToken,
    access_token_expires_at: "2099-01-01T00:00:00.000Z"
  });
  const request = new Request("http://127.0.0.1/account/profile", {
    headers: {
      Accept: "application/json",
      Cookie: "ja_customer_oidc_session=test-session",
      "x-ja-auth-email": "customer@example.test",
      "x-ja-auth-name": "Test Customer",
      "x-ja-auth-object-id": "customer-object-id"
    }
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    id: "customer-object-id",
    displayName: "Graph Customer",
    mail: "customer@example.test"
  }), { status: 200, headers: { "content-type": "application/json", "request-id": "graph-request-id" } });

  try {
    const response = await onRequest({ request, env: { DB, OIDC_TOKEN_ENCRYPTION_KEY: secret } });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.profile.email, "customer@example.test");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GET /account/profile uses a refresh token from a legacy session schema", async () => {
  const secret = "test-token-encryption-key-that-is-long-enough";
  const refreshToken = await encryptToken("graph-refresh-token", secret);
  const DB = new ProfileD1Mock({
    token_hash: "session-hash",
    refresh_token_encrypted: refreshToken
  }, { legacySessionSchema: true });
  const request = new Request("http://127.0.0.1/account/profile", {
    headers: {
      Accept: "application/json",
      Cookie: "ja_customer_oidc_session=test-session",
      "x-ja-auth-email": "customer@example.test",
      "x-ja-auth-name": "Test Customer",
      "x-ja-auth-object-id": "customer-object-id"
    }
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) {
      return Response.json({ token_endpoint: "https://customer.example.test/token" });
    }
    if (url === "https://customer.example.test/token") {
      return Response.json({ access_token: "new-access-token", expires_in: 3600 });
    }
    if (url.startsWith("https://graph.microsoft.com/v1.0/me")) {
      return Response.json({ id: "customer-object-id", displayName: "Graph Customer" });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const response = await onRequest({
      request,
      env: {
        DB,
        OIDC_TOKEN_ENCRYPTION_KEY: secret,
        CUSTOMER_OIDC_ISSUER: "https://customer.example.test/tenant/v2.0",
        CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
        CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret"
      }
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.profile.email, "customer@example.test");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("GET /account/profile converts thrown D1 errors into structured JSON", async () => {
  const request = new Request("http://127.0.0.1/account/profile", {
    headers: { Accept: "application/json", "x-ja-auth-email": "customer@example.test" }
  });
  const DB = { prepare() { throw new Error("D1 test failure"); } };
  const response = await onRequest({ request, env: { DB } });
  const payload = await response.json();

  assert.equal(response.status, 500);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(payload, { success: false, stage: "read D1 profile", error: "D1 test failure" });
});

test("POST /account/profile binds one value for every profile INSERT placeholder", async () => {
  const request = new Request("http://127.0.0.1/account/profile", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-ja-auth-email": "customer@example.test",
      "x-ja-auth-name": "Test Customer"
    },
    body: JSON.stringify({
      displayName: "Updated Customer",
      contactEmail: "customer@example.test",
      termsAccepted: true,
      privacyAccepted: true
    })
  });
  const response = await onRequest({ request, env: { DB: new ProfileD1Mock() } });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.saved, true);
});

test("POST /account/profile updates ordinary details without resetting consent and patches Microsoft Graph", async () => {
  const secret = "test-token-encryption-key-that-is-long-enough";
  const accessToken = await encryptToken("graph-access-token", secret);
  const DB = new ProfileD1Mock({
    token_hash: "session-hash",
    access_token_encrypted: accessToken,
    access_token_expires_at: "2099-01-01T00:00:00.000Z",
  });
  const request = new Request("http://127.0.0.1/account/profile", {
    method: "POST",
    headers: {
      Accept: "application/json", "Content-Type": "application/json",
      Cookie: "ja_customer_oidc_session=test-session",
      "x-ja-auth-email": "customer@example.test", "x-ja-auth-name": "Test Customer",
    },
    body: JSON.stringify({
      displayName: "Updated Customer", givenName: "Updated", familyName: "Customer",
      companyName: "Example Ltd", mobilePhone: "+442038342790", city: "London", country: "United Kingdom",
    }),
  });
  const originalFetch = globalThis.fetch;
  let graphBody = null;
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://graph.microsoft.com/v1.0/me");
    assert.equal(init.method, "PATCH");
    graphBody = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  };
  try {
    const response = await onRequest({ request, env: { DB, OIDC_TOKEN_ENCRYPTION_KEY: secret } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).saved, true);
    assert.deepEqual(graphBody, {
      displayName: "Updated Customer", givenName: "Updated", surname: "Customer",
      mobilePhone: "+442038342790", city: "London", country: "United Kingdom", companyName: "Example Ltd",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
