import assert from "node:assert/strict";
import test from "node:test";

import { onRequest } from "../functions/account/billing.js";

class BillingDB {
  constructor({ secret = "", customerId = "cus_owned" } = {}) {
    this.secret = secret;
    this.customerId = customerId;
  }

  prepare(sql) {
    const database = this;
    const statement = {
      bindings: [],
      bind(...bindings) { this.bindings = bindings; return this; },
      async run() { return { success: true }; },
      async first() {
        if (sql.includes("FROM profiles")) return { email: "customer@example.test", stripe_customer_id: database.customerId };
        if (sql.includes("stripe_secret_key")) return database.secret ? { value: database.secret } : null;
        if (sql.includes("FROM stripe_subscriptions")) return {
          id: "sub_owned", customer_id: database.customerId, plan_name: "Discovery Plan", status: "active",
          billing_status: "paid", billing_interval: "month", current_period_end: "2030-01-01T00:00:00.000Z",
          next_payment_at: "2030-01-01T00:00:00.000Z", subscription_start: "2029-01-01T00:00:00.000Z",
          payment_method_brand: "visa", payment_method_last4: "4242", cancel_at_period_end: 0
        };
        return null;
      },
      async all() {
        if (sql.includes("FROM stripe_invoices")) return { results: [{ id: "in_owned", customer_id: database.customerId, status: "paid", amount_paid: 4900, currency: "gbp" }] };
        return { results: [] };
      }
    };
    return statement;
  }
}

function request(method = "GET", body = undefined) {
  return new Request("https://experiences.example.test/account/billing", {
    method,
    headers: { "x-ja-auth-email": "customer@example.test", "content-type": "application/json" },
    body
  });
}

test("billing data is resolved from the authenticated customer's D1 ownership mapping", async () => {
  const response = await onRequest({ request: request(), env: { DB: new BillingDB() } });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.subscription.subscriptionReference, "sub_owned");
  assert.equal(payload.subscription.paymentMethod, "VISA •••• 4242");
  assert.equal(JSON.stringify(payload).includes("cus_owned"), false);
});

test("portal session ignores browser-supplied customer IDs", async () => {
  const originalFetch = globalThis.fetch;
  let submittedBody = "";
  globalThis.fetch = async (_url, options) => {
    submittedBody = String(options.body);
    return Response.json({ url: "https://billing.stripe.test/session" });
  };
  try {
    const response = await onRequest({
      request: request("POST", JSON.stringify({ customer: "cus_attacker" })),
      env: { DB: new BillingDB({ secret: "sk_test", customerId: "cus_owned" }) }
    });
    assert.equal(response.status, 200);
    assert.match(submittedBody, /customer=cus_owned/);
    assert.doesNotMatch(submittedBody, /cus_attacker/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("billing endpoint requires an authenticated customer", async () => {
  const response = await onRequest({ request: new Request("https://experiences.example.test/account/billing"), env: { DB: new BillingDB() } });
  assert.equal(response.status, 401);
});
