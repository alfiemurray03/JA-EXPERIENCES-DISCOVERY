import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/_middleware.js";

class MiddlewareD1 {
  constructor({ session = true, adminStatus = "Active", customerStatus = "Active" } = {}) {
    this.hasSession = session;
    this.adminStatus = adminStatus;
    this.customerStatus = customerStatus;
  }

  prepare(sql) {
    const database = this;
    return {
      bind() {
        return {
          async first() {
            if (sql.includes("FROM admin_oidc_sessions")) {
              return database.hasSession ? {
                token_hash: "hash", subject: "subject", tenant_id: "tenant",
                email: "admin@example.test", name: "Administrator", refresh_token_encrypted: null,
                refresh_due: 0, created_at: "2026-07-01 10:00:00", last_seen_at: "2026-07-01 10:00:00",
                idle_expires_at: "2026-07-01 10:30:00", absolute_expires_at: "2026-07-01 18:00:00"
              } : null;
            }
            if (sql.includes("FROM customer_oidc_sessions")) {
              return database.hasSession ? {
                token_hash: "customer-hash", subject: "customer-subject", tenant_id: "customer-tenant",
                email: "customer@example.test", name: "Customer", refresh_token_encrypted: null,
                refresh_due: 0, created_at: "2026-07-01 10:00:00", last_seen_at: "2026-07-01 10:00:00",
                idle_expires_at: "2026-07-01 11:00:00", absolute_expires_at: "2026-07-02 10:00:00"
              } : null;
            }
            if (sql.includes("FROM admin_users")) {
              return { email: "admin@example.test", status: database.adminStatus };
            }
            if (sql.includes("SELECT admin_customer_status FROM profiles")) {
              return { admin_customer_status: database.customerStatus };
            }
            return null;
          },
          async run() { return { success: true, meta: { changes: 1 } }; }
        };
      },
      async run() { return { success: true, meta: { changes: 1 } }; }
    };
  }
}

function environment(DB) {
  return {
    DB,
    NATIVE_OIDC_ENABLED: "true",
    ADMIN_OIDC_ISSUER: "https://login.example.test/tenant/v2.0",
    ADMIN_OIDC_CLIENT_ID: "admin-client-id",
    ADMIN_OIDC_CLIENT_SECRET: "admin-client-secret",
    CUSTOMER_OIDC_ISSUER: "https://customer.ciamlogin.com/customer-tenant/v2.0",
    CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
    CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret",
    OIDC_TOKEN_ENCRYPTION_KEY: "test-only-encryption-key-with-more-than-32-characters"
  };
}

test("middleware replaces spoofable identity headers with the validated native session", async () => {
  const DB = new MiddlewareD1();
  let downstreamRequest;
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/api?section=overview", {
      headers: {
        Cookie: "ja_admin_session=opaque-session",
        "x-ja-auth-email": "attacker@example.test"
      }
    }),
    env: environment(DB),
    next: async (request) => {
      downstreamRequest = request;
      return Response.json({ ok: true });
    }
  });
  assert.equal(response.status, 200);
  assert.equal(downstreamRequest.headers.get("x-ja-auth-email"), "admin@example.test");
  assert.equal(downstreamRequest.headers.get("x-ja-auth-realm"), "admin");
  assert.ok(downstreamRequest.headers.get("x-ja-auth-session"));
});

test("native mode strips legacy Cloudflare Access identity headers from public requests", async () => {
  let downstreamRequest;
  const response = await onRequest({
    request: new Request("https://experiences.example.test/api/enquiries", {
      headers: {
        "Cf-Access-Authenticated-User-Email": "victim@example.test",
        "Cf-Access-Jwt-Assertion": "spoofed.jwt.value"
      }
    }),
    env: environment(new MiddlewareD1()),
    next: async (request) => {
      downstreamRequest = request;
      return Response.json({ ok: true });
    }
  });
  assert.equal(response.status, 200);
  assert.equal(downstreamRequest.headers.get("cf-access-authenticated-user-email"), null);
  assert.equal(downstreamRequest.headers.get("cf-access-jwt-assertion"), null);
});

test("middleware redirects an unauthenticated administrator and preserves the deep link", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/api?section=customers"),
    env: environment(new MiddlewareD1({ session: false })),
    next: async () => { throw new Error("Protected request reached the origin."); }
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/admin/login?return_to=%2Fadmin%2Fapi%3Fsection%3Dcustomers");
});

test("middleware fails closed when native realm configuration is incomplete", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const response = await onRequest({
      request: new Request("https://experiences.example.test/admin/"),
      env: { NATIVE_OIDC_ENABLED: "true", DB: new MiddlewareD1() },
      next: async () => { throw new Error("Misconfigured request reached the origin."); }
    });
    assert.equal(response.status, 503);
    assert.match(await response.text(), /temporarily unavailable/);
  } finally {
    console.error = originalConsoleError;
  }
});

test("middleware rejects suspended administrators before protected content", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/api", {
      headers: { Cookie: "ja_admin_session=opaque-session" }
    }),
    env: environment(new MiddlewareD1({ adminStatus: "Suspended" })),
    next: async () => { throw new Error("Suspended administrator reached the origin."); }
  });
  assert.equal(response.status, 403);
});

test("middleware rejects unsafe authenticated requests without an exact same-origin Origin", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/api", {
      method: "POST",
      headers: { Cookie: "ja_admin_session=opaque-session", Origin: "https://attacker.example" }
    }),
    env: environment(new MiddlewareD1()),
    next: async () => { throw new Error("Cross-origin request reached the origin."); }
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "Invalid request origin." });
});

test("middleware enforces Customer account status before serving the portal", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/account/profile/", {
      headers: { Cookie: "ja_customer_oidc_session=opaque-customer-session" }
    }),
    env: environment(new MiddlewareD1({ customerStatus: "Blocked" })),
    next: async () => { throw new Error("Blocked customer reached the origin."); }
  });
  assert.equal(response.status, 403);
  assert.match(await response.text(), /not active/);
});
