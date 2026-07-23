import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { verifyConfiguredPrice } from "../functions/api/admin/stripe/verify-prices.js";

const root = new URL("../", import.meta.url);

test("customer support API has a customer-session middleware boundary", async () => {
  const middleware = await readFile(new URL("functions/api/support/_middleware.js", root), "utf8");
  assert.match(middleware, /getNativeSession\(request, env, "customer"\)/);
  assert.match(middleware, /request = withIdentity\(request, identity\)/);
  assert.match(middleware, /SELECT admin_customer_status FROM profiles/);
  assert.match(middleware, /Please sign in to use customer support/);
});

test("Stripe Verify All route covers exactly the four live Planyx plans", async () => {
  const route = await readFile(new URL("functions/api/admin/stripe/verify-prices.js", root), "utf8");
  for (const key of ["personal", "standard", "professional", "org_starter"]) {
    assert.match(route, new RegExp(`key: "${key}"`));
  }
  for (const amount of [599, 799, 1499, 3999]) {
    assert.match(route, new RegExp(`amount: ${amount}`));
  }
  assert.match(route, /payload\.recurring\?\.interval === "month"/);
  assert.match(route, /payload\.currency.*gbp/);
  assert.match(route, /productMatches/);
  assert.match(route, /priceActive/);
  assert.match(route, /productActive/);
});

test("Stripe verifier accepts the correct active monthly GBP plan mapping", async () => {
  const plan = {
    label: "Explore Plan",
    amount: 599,
    productId: "prod_expected",
    productNames: ["Explore Plan"],
    defaultPriceId: "price_expected"
  };
  const result = await verifyConfiguredPrice(
    async () => Response.json({
      id: "price_expected",
      active: true,
      currency: "gbp",
      unit_amount: 599,
      recurring: { interval: "month", interval_count: 1 },
      product: { id: "prod_expected", name: "Explore Plan", active: true }
    }),
    "sk_test_example",
    plan,
    "price_expected",
    "database"
  );

  assert.equal(result.valid, true);
  assert.equal(result.product, "Explore Plan");
  assert.equal(result.amount, 599);
  assert.equal(result.currency, "GBP");
  assert.equal(result.interval, "month");
});

test("Stripe verifier rejects a Price ID mapped to the wrong amount", async () => {
  const plan = {
    label: "Explore Plan",
    amount: 599,
    productId: "prod_expected",
    productNames: ["Explore Plan"],
    defaultPriceId: "price_expected"
  };
  const result = await verifyConfiguredPrice(
    async () => Response.json({
      id: "price_other",
      active: true,
      currency: "gbp",
      unit_amount: 799,
      recurring: { interval: "month", interval_count: 1 },
      product: { id: "prod_expected", name: "Explore Plan", active: true }
    }),
    "sk_test_example",
    plan,
    "price_other",
    "database"
  );

  assert.equal(result.valid, false);
  assert.match(result.error, /wrong amount/i);
});

test("Coming Soon page follows the JA Profile Studio launch-page structure", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  const script = await readFile(new URL("public/assets/js/coming-soon.js", root), "utf8");
  assert.match(html, /class="hero-icon"/);
  assert.match(html, /class="countdown-grid"/);
  assert.match(html, /id="coming-soon-features"/);
  assert.match(html, /Copyright 2025–2026 JA Group Services Ltd/);
  assert.doesNotMatch(html, /sign[ -]?in/i);
  assert.match(script, /renderFeatures/);
  assert.match(script, /startCountdown/);
  assert.match(script, /cache: "no-store"/);
});
