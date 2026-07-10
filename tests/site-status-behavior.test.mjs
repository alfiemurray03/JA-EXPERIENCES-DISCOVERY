import assert from "node:assert/strict";
import test from "node:test";
import { onRequest as middleware } from "../functions/_middleware.js";
import { onRequestGet as siteStatusApi } from "../functions/api/site-status.js";
import { onRequestGet as comingSoonConfigApi } from "../functions/api/coming-soon-config.js";
import { onRequest as adminApi, runSystemDiagnostics, saveAuthoritativeSiteStatus } from "../functions/admin/api.js";

class StatusDatabase {
  constructor(status = "normal") { this.status = status; }
  prepare(sql) {
    const database = this;
    return {
      bind() { return this; },
      async first() {
        if (sql.includes("key = 'site_status'")) return { value: database.status };
        return null;
      },
      async all() {
        if (sql.includes("FROM site_settings")) return { results: [{ key: "site_status", value: database.status }] };
        return { results: [] };
      },
      async run() { return { success: true, meta: { changes: 0 } }; }
    };
  }
}

async function publicRequest(database, path) {
  const env = { DB: database, NATIVE_OIDC_ENABLED: "true", ADMIN_OIDC_ISSUER: "https://login.example.test/tenant/v2.0", ADMIN_OIDC_CLIENT_ID: "admin", ADMIN_OIDC_CLIENT_SECRET: "secret", CUSTOMER_OIDC_ISSUER: "https://customer.example.test/tenant/v2.0", CUSTOMER_OIDC_CLIENT_ID: "customer", CUSTOMER_OIDC_CLIENT_SECRET: "secret", OIDC_TOKEN_ENCRYPTION_KEY: "test-key-longer-than-thirty-two-characters" };
  return middleware({ request: new Request(`https://experiences.example.test${path}`, { headers: { Accept: "text/html" } }), env, next: async () => new Response("public website", { headers: { "Content-Type": "text/html" } }) });
}

test("one D1 site status immediately controls normal, coming soon, maintenance, then normal", async () => {
  const database = new StatusDatabase("normal");
  let response = await publicRequest(database, "/destinations/");
  assert.equal(response.status, 200); assert.match(await response.text(), /public website/);

  database.status = "coming_soon";
  for (const path of ["/", "/destinations/", "/pricing/", "/builders/day-trip/"]) {
    response = await publicRequest(database, path);
    assert.equal(response.status, 302); assert.equal(response.headers.get("location"), "/coming-soon/"); assert.equal(response.headers.get("cache-control"), "no-store");
  }

  database.status = "maintenance";
  response = await publicRequest(database, "/destinations/");
  assert.equal(response.status, 503); assert.match(await response.text(), /Maintenance/i); assert.equal(response.headers.get("cache-control"), "no-store");

  database.status = "normal";
  response = await publicRequest(database, "/pricing/");
  assert.equal(response.status, 200); assert.match(await response.text(), /public website/);
});

test("admin, authentication, account and status APIs remain excluded from public modes", async () => {
  const database = new StatusDatabase("coming_soon");
  for (const path of ["/admin/", "/account/", "/account/login", "/api/site-status", "/api/coming-soon-config"]) {
    const response = await publicRequest(database, path);
    assert.notEqual(response.headers.get("location"), "/coming-soon/", path);
    assert.notEqual(response.status, 503, path);
  }
});

test("site status API reads current D1 value without caching", async () => {
  const database = new StatusDatabase("coming_soon");
  const response = await siteStatusApi({ env: { DB: database } });
  assert.deepEqual(await response.json(), { status: "coming_soon" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("Coming Soon config preserves BST, winter GMT, blank, past and invalid date values without caching", async () => {
  for (const launchDate of ["2026-08-29T21:01:00.000Z", "2026-12-20T22:01:00.000Z", "", "2020-01-01T00:00:00.000Z", "invalid"]) {
    const DB = { prepare() { return { bind(key) { return { first: async () => key === "coming_soon_launch_date" ? { value: launchDate } : null }; } }; } };
    const response = await comingSoonConfigApi({ env: { DB } });
    const payload = await response.json();
    assert.equal(payload.launchDate, launchDate);
    assert.equal(response.headers.get("cache-control"), "no-store, no-cache, must-revalidate");
  }
});

test("admin status save writes one authoritative mode and disables legacy overrides", async () => {
  const saved = new Map();
  const DB = { prepare() { let bindings = []; return { bind(...values) { bindings = values; return this; }, async run() { saved.set(bindings[0], bindings[1]); } }; }, async batch(statements) { for (const statement of statements) await statement.run(); } };
  await saveAuthoritativeSiteStatus(DB, "coming_soon");
  assert.equal(saved.get("site_status"), "coming_soon");
  assert.equal(saved.get("maintenance_enabled"), "false");
  assert.equal(saved.get("launchgateway_enabled"), "false");
});

test("diagnostics endpoint rejects unauthenticated requests", async () => {
  const response = await adminApi({ request: new Request("https://experiences.example.test/admin/api?section=systemsettings&action=diagnostics"), env: { DB: new StatusDatabase() } });
  assert.equal(response.status, 401);
});

test("diagnostics returns only safe status metadata", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
  try {
    const diagnostics = await runSystemDiagnostics(new StatusDatabase("normal"), { ADMIN_OIDC_ISSUER: "configured", ADMIN_OIDC_CLIENT_ID: "configured", CUSTOMER_OIDC_ISSUER: "configured", CUSTOMER_OIDC_CLIENT_ID: "configured", STRIPE_SECRET_KEY: "super-secret", EMAIL_API_KEY: "super-secret" }, new Request("https://experiences.example.test/admin/api"));
    const payload = JSON.stringify(diagnostics);
    assert.doesNotMatch(payload, /super-secret|API_KEY|SECRET_KEY|session|cookie/i);
    assert.equal(diagnostics.technical.site_status, "normal");
    assert.ok(diagnostics.checked_at);
  } finally { globalThis.fetch = originalFetch; }
});
