import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/_middleware.js";

test("middleware always bypasses public-site modes for Stripe webhooks", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/stripe-webhook", { method: "POST", body: "{}" }),
    env: {
      DB: { prepare() { throw new Error("Stripe webhook bypass must not query site settings."); } }
    },
    next: async () => new Response("webhook route", { status: 202 })
  });
  assert.equal(response.status, 202);
  assert.equal(await response.text(), "webhook route");
});

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

test("authenticated admin API remains available during public blocking modes", async () => {
  const DB = new MiddlewareD1();
  const prepare = DB.prepare.bind(DB);
  DB.prepare = (sql) => {
    if (sql.includes("site_settings")) throw new Error("Admin routes must not evaluate public mode settings.");
    return prepare(sql);
  };
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/api?section=launchgateway", {
      headers: { Cookie: "ja_admin_session=opaque-session", Accept: "application/json" }
    }),
    env: environment(DB),
    next: async () => Response.json({ admin: true })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { admin: true });
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

test("authenticated users bypass the public administrator landing page", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/admin/", {
      headers: { Cookie: "ja_admin_session=opaque-session" }
    }),
    env: environment(new MiddlewareD1()),
    next: async () => Response.text("landing")
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/admin/dashboard/");
});

test("authenticated users bypass the public customer landing page", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/account/", {
      headers: { Cookie: "ja_customer_oidc_session=opaque-session" }
    }),
    env: environment(new MiddlewareD1()),
    next: async () => Response.text("landing")
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/account/dashboard/");
});

test("authenticated administrators bypass Launch Gateway and maintenance on public routes", async () => {
  const DB = new MiddlewareD1();
  const prepare = DB.prepare.bind(DB);
  DB.prepare = (sql) => {
    if (sql.includes("site_settings")) throw new Error("Authenticated admin requests must not evaluate public gating settings.");
    return prepare(sql);
  };
  const response = await onRequest({
    request: new Request("https://experiences.example.test/", {
      headers: { Cookie: "ja_admin_session=opaque-session" }
    }),
    env: environment(DB),
    next: async () => new Response("public site", { status: 200 })
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "public site");
});

test("visitors still see Launch Gateway when public gating is enabled", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/"),
    env: {
      ...environment(new MiddlewareD1({ session: false })),
      DB: {
        prepare(sql) {
          if (sql.includes("FROM site_settings")) {
            return {
              all: async () => ({ results: [{ key: "launchgateway_enabled", value: "true" }] }),
              first: async () => null,
              run: async () => ({ success: true, meta: { changes: 1 } })
            };
          }
          return new MiddlewareD1({ session: false }).prepare(sql);
        }
      }
    },
    next: async () => new Response("public site", { status: 200 })
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Launch Gateway/);
});

test("signed-out users can view portal landing pages before authentication", async () => {
  for (const path of ["/account/", "/admin/"]) {
    const response = await onRequest({
      request: new Request(`https://experiences.example.test${path}`),
      env: environment(new MiddlewareD1({ session: false })),
      next: async () => new Response("landing")
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "landing");
  }
});

test("customer authentication endpoints bypass Launch Gateway and maintenance modes", async () => {
  for (const path of ["/account/login", "/account/auth/callback"]) {
    const DB = new MiddlewareD1({ session: false });
    const prepare = DB.prepare.bind(DB);
    DB.prepare = (sql) => {
      if (sql.includes("site_settings")) throw new Error("Customer authentication routes must not evaluate public mode settings.");
      return prepare(sql);
    };
    const response = await onRequest({
      request: new Request(`https://experiences.example.test${path}`),
      env: environment(DB),
      next: async () => new Response("customer authentication route")
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "customer authentication route");
  }
});

test("signed-out JSON profile checks do not start a login transaction", async () => {
  const response = await onRequest({
    request: new Request("https://experiences.example.test/account/profile", {
      headers: { Accept: "application/json" }
    }),
    env: environment(new MiddlewareD1({ session: false })),
    next: async () => { throw new Error("Signed-out profile check reached the origin."); }
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Not signed in." });
  assert.equal(response.headers.get("location"), null);
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
