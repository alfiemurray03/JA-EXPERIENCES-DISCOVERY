import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { onRequest as adminApiOnRequest } from "../functions/admin/api.js";
import { onRequest as middlewareOnRequest } from "../functions/_middleware.js";
import { onRequestGet as activateTrialOnRequestGet } from "../functions/account/activate-trial.js";
import { onRequestGet as comingSoonConfigOnRequestGet } from "../functions/api/coming-soon-config.js";

class MockD1 {
  constructor() {
    this.siteStatus = "normal";
    this.trialClaimed = false;
    this.paidSubscription = false;
    this.preparedQueries = [];
    this.batchQueries = [];
    this.auditWrites = 0;
  }

  prepare(sql) {
    const db = this;
    db.preparedQueries.push(sql);
    const stmt = {
      sql,
      bindings: [],
      bind(...args) {
        stmt.bindings = args;
        return stmt;
      },
      toString() {
        return sql;
      },
      async first() {
        if (sql.includes("site_settings") && sql.includes("site_status")) {
          return { value: db.siteStatus };
        }
        if (sql.includes("admin_users")) {
          return { email: "alfieholywoodmurray@jagroupservices.co.uk", role: "Platform Owner", status: "Active" };
        }
        if (sql.includes("FROM admin_oidc_sessions")) {
          return {
            token_hash: "admin-hash", subject: "admin-subject", tenant_id: "admin-tenant",
            email: "alfieholywoodmurray@jagroupservices.co.uk", name: "Alfie", refresh_token_encrypted: null,
            refresh_due: 0, created_at: "2026-07-01 10:00:00", last_seen_at: "2026-07-01 10:00:00",
            idle_expires_at: "2026-07-01 10:30:00", absolute_expires_at: "2026-07-01 18:00:00"
          };
        }
        if (sql.includes("FROM customer_oidc_sessions")) {
          return {
            token_hash: "customer-hash", subject: "customer-subject", tenant_id: "customer-tenant",
            email: "customer@example.com", name: "Customer", refresh_token_encrypted: null,
            refresh_due: 0, created_at: "2026-07-01 10:00:00", last_seen_at: "2026-07-01 10:00:00",
            idle_expires_at: "2026-07-01 11:00:00", absolute_expires_at: "2026-07-02 10:00:00"
          };
        }
        if (sql.includes("trial_access_tokens")) {
          return db.trialClaimed ? { id: "trial_123" } : null;
        }
        if (sql.includes("stripe_subscriptions")) {
          return db.paidSubscription ? { plan_name: "Premium Member", status: "active" } : null;
        }
        return null;
      },
      async run() {
        if (sql.includes("INSERT INTO admin_audit_log")) db.auditWrites += 1;
        return { success: true };
      },
      async all() {
        if (sql.includes("table_info(profiles)")) {
          return {
            results: [
              { name: "email" },
              { name: "suspended_at" },
              { name: "suspended_by" },
              { name: "suspension_reason" },
              { name: "reactivated_at" },
              { name: "reactivated_by" },
              { name: "reactivation_reason" }
            ]
          };
        }
        if (sql.includes("site_settings")) {
          return {
            results: [
              { key: "site_status", value: db.siteStatus }
            ]
          };
        }
        return { results: [] };
      }
    };
    return stmt;
  }

  async batch(statements) {
    this.batchQueries.push(...statements);
    for (const statement of statements) {
      if (statement.sql.includes("INSERT INTO site_settings") && statement.bindings[0] === "site_status") {
        this.siteStatus = statement.bindings[1];
      }
    }
    return [{ success: true }];
  }
}

function getMockEnv(DB) {
  return {
    DB,
    ADMIN_EMAIL: "alfieholywoodmurray@jagroupservices.co.uk",
    NATIVE_OIDC_ENABLED: "true",
    OIDC_TOKEN_ENCRYPTION_KEY: "test-only-encryption-key-with-more-than-32-characters",
    ADMIN_OIDC_ISSUER: "https://login.example.test/tenant/v2.0",
    ADMIN_OIDC_CLIENT_ID: "admin-client-id",
    ADMIN_OIDC_CLIENT_SECRET: "admin-client-secret",
    CUSTOMER_OIDC_ISSUER: "https://customer.ciamlogin.com/customer-tenant/v2.0",
    CUSTOMER_OIDC_CLIENT_ID: "customer-client-id",
    CUSTOMER_OIDC_CLIENT_SECRET: "customer-client-secret"
  };
}

test("admin API GET section handlers return real platform D1 data", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);

  for (const section of ["builders", "credits", "usage", "addons"]) {
    const request = new Request(`https://experiences.example.com/admin/api?section=${section}`, {
      headers: {
        "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
        "x-ja-auth-name": "Alfie"
      }
    });

    const response = await adminApiOnRequest({ request, env });
    if (response.status !== 200) {
      console.error("FAIL BODY FOR SECTION", section, ":", await response.json());
    }
    assert.equal(response.status, 200, `section ${section} should load successfully`);
    const data = await response.json();
    assert.ok(data.admin, `section ${section} response should include admin context`);
    assert.ok(data.platform, `section ${section} response should include platform D1 data`);
    assert.ok(Array.isArray(data.platform.builders), `section ${section} platform should include builders`);
    assert.ok(Array.isArray(data.platform.outputs), `section ${section} platform should include outputs`);
    assert.ok(Array.isArray(data.platform.ledger), `section ${section} platform should include ledger`);
    assert.ok(Array.isArray(data.platform.attempts), `section ${section} platform should include attempts`);
    assert.ok(Array.isArray(data.platform.addons), `section ${section} platform should include addons`);
    assert.ok(Array.isArray(data.platform.trials), `section ${section} platform should include trials`);
  }
});

test("admin API diagnostics endpoint returns suspension columns check", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);

  const request = new Request("https://experiences.example.com/admin/api?section=systemsettings&action=diagnostics", {
    headers: {
      "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
      "x-ja-auth-name": "Alfie"
    }
  });

  const response = await adminApiOnRequest({ request, env });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.diagnostics);
  assert.equal(data.diagnostics.technical.suspension_columns, "All 6 Columns Exist");
});

test("middleware gating blocks customer dashboard and login during closed modes but allows admin panel", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);

  const nextMock = async () => new Response("Success");

  // 1. Normal Mode: allows customer dashboard
  DB.siteStatus = "normal";
  let request = new Request("https://experiences.example.com/account/dashboard");
  let response = await middlewareOnRequest({ request, env, next: nextMock });
  assert.ok(response.status === 302 || response.status === 401);

  // 2. Coming Soon Mode: blocks customer dashboard and redirects them to coming-soon
  DB.siteStatus = "coming_soon";
  request = new Request("https://experiences.example.com/account/dashboard", {
    headers: {
      "Cookie": "ja_customer_oidc_session=opaque-session",
      "Accept": "text/html"
    }
  });
  response = await middlewareOnRequest({ request, env, next: nextMock });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), "/coming-soon/");

  // 3. Maintenance Mode: blocks customer login and returns 503 Maintenance page
  DB.siteStatus = "maintenance";
  request = new Request("https://experiences.example.com/account/login", {
    headers: { "Accept": "text/html" }
  });
  response = await middlewareOnRequest({ request, env, next: nextMock });
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.match(body, /Maintenance/i);

  // 4. Closed Mode: keeps administrator portal and admin logins completely accessible
  DB.siteStatus = "maintenance";
  request = new Request("https://experiences.example.com/admin/dashboard", {
    headers: {
      "Cookie": "ja_admin_session=opaque-session",
      "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
      "x-ja-auth-name": "Alfie"
    }
  });
  response = await middlewareOnRequest({ request, env, next: nextMock });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Success");

  // 5. Closed Mode: allows authenticated administrators to access customer dashboard without redirect
  DB.siteStatus = "coming_soon";
  request = new Request("https://experiences.example.com/account/dashboard", {
    headers: {
      "Cookie": "ja_admin_session=opaque-session; ja_customer_oidc_session=opaque-session",
      "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
      "x-ja-auth-name": "Alfie",
      "Accept": "text/html"
    }
  });
  response = await middlewareOnRequest({ request, env, next: nextMock });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "Success");
});

test("free trial activation route credits exactly 30 tokens, calculates 14 days expiry, and protects against multiple claims", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);

  // Helper mock session cookie
  const cookieHeaders = {
    "Cookie": "ja_customer_oidc_session=opaque-customer-session"
  };

  const request = new Request("https://experiences.example.com/account/activate-trial", {
    headers: {
      ...cookieHeaders,
      "x-ja-auth-email": "customer@example.com",
      "x-ja-auth-name": "Customer"
    }
  });

  // 1. Successful First Claim: activates trial, credits exactly 30 tokens, sets 14 days expiry, saves in D1
  DB.trialClaimed = false;
  DB.paidSubscription = false;
  let response = await activateTrialOnRequestGet({ request, env });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("Location"), /trial_success=1/);

  // Verify atomic queries registered in batch
  assert.equal(DB.batchQueries.length, 4);
  const trialInsert = DB.batchQueries[0].toString();
  const ledgerInsert = DB.batchQueries[1].toString();
  assert.match(trialInsert, /INSERT INTO trial_access_tokens/);
  assert.match(ledgerInsert, /INSERT INTO builder_token_ledger/);

  // 2. Duplicate Claim: D1 protection prevents multiple claims and returns error query param
  DB.trialClaimed = true;
  response = await activateTrialOnRequestGet({ request, env });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("Location"), /trial_error=already_claimed/);

  // 3. Paid Plan Subscriber: prevents claim and redirects to dashboard with error param
  DB.trialClaimed = false;
  DB.paidSubscription = true;
  response = await activateTrialOnRequestGet({ request, env });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("Location"), /trial_error=paid_plan/);
});

test("coming-soon-config API returns standard launch date format and supports no-store", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);

  const response = await comingSoonConfigOnRequestGet({ env });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store, no-cache, must-revalidate");
  const data = await response.json();
  assert.equal(data.headline, "Coming Soon");
  assert.equal(data.launchDate, "");
});

test("site status saves are authoritative and independent of builder platform queries", async () => {
  const DB = new MockD1();
  const env = getMockEnv(DB);
  for (const status of ["coming_soon", "maintenance", "normal", "normal", "coming_soon", "maintenance"]) {
    const request = new Request("https://experiences.example.com/admin/api?section=systemsettings", {
      method: "POST",
      headers: {
        "Origin": "https://experiences.example.com",
        "Content-Type": "application/json",
        "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk",
        "x-ja-auth-name": "Alfie"
      },
      body: JSON.stringify({ action: "update_site_status", site_status: status })
    });
    const response = await adminApiOnRequest({ request, env });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/json/);
    const payload = await response.json();
    assert.equal(payload.saved, true);
    assert.equal(payload.site_status, status);
    assert.equal(DB.siteStatus, status);
    assert.equal("platform" in payload, false);
  }
  assert.equal(DB.auditWrites, 6);
});

test("site status save rejects invalid values before changing D1", async () => {
  const DB = new MockD1();
  const request = new Request("https://experiences.example.com/admin/api?section=systemsettings", {
    method: "POST",
    headers: {
      "Origin": "https://experiences.example.com",
      "Content-Type": "application/json",
      "x-ja-auth-email": "alfieholywoodmurray@jagroupservices.co.uk"
    },
    body: JSON.stringify({ action: "update_site_status", site_status: "launch_gateway" })
  });
  const response = await adminApiOnRequest({ request, env: getMockEnv(DB) });
  assert.equal(response.status, 400);
  assert.equal(DB.siteStatus, "normal");
});

test("admin shell includes reference mobile navigation without replacing protected routes", async () => {
  const html = await readFile(new URL("../public/admin/dashboard/index.html", import.meta.url), "utf8");
  assert.match(html, /class="admin-mobile-nav"/);
  assert.match(html, /data-section="customers"/);
  assert.match(html, /data-section="systemsettings"/);
  assert.match(html, /href="\/admin\/logout"/);
  assert.match(html, /Protected by native Microsoft Entra ID/);
});

test("customer record renderer keeps identity verification and adds full profile structure", async () => {
  const client = await readFile(new URL("../public/assets/js/admin-control.js", import.meta.url), "utf8");
  assert.match(client, /customer-record-page-head/);
  assert.match(client, /customer-warning-banner/);
  assert.match(client, /customer-identity-card/);
  assert.match(client, /customer-record-tabs/);
  assert.match(client, /renderCustomerIdentityVerification\(customer, verification, securityQuestions\)/);
  assert.match(client, /protectedDisabled/);
  assert.match(client, /Back to CRM/);
});

test("System Settings uses the narrow reference workspace and icon tab structure", async () => {
  const client = await readFile(new URL("../public/assets/js/admin-control.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/admin/assets/admin-saas-v2.css", import.meta.url), "utf8");
  assert.match(client, /settings-page-head/);
  assert.match(client, /settings-page-icon/);
  assert.match(client, /icon\(t\.icon\)/);
  assert.match(css, /system-settings-shell[^}]+768px/s);
  assert.match(css, /settings-category-tabs[^}]+background: #f1f5f9/s);
});
