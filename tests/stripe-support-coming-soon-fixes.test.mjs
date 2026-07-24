import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  resolveConfiguredStripePriceId,
  verifyStripePriceConfiguration,
} from "../functions/_shared/stripe-price-verification.js";

const root = new URL("../", import.meta.url);

const plan = {
  code: "personal",
  name: "Explore",
  amountPence: 599,
  currency: "gbp",
  interval: "month",
};

test("Stripe price resolution prefers the Admin-saved price ID", () => {
  const result = resolveConfiguredStripePriceId(
    { stripe_price_id: "price_admin" },
    { STRIPE_PRICE_PERSONAL: "price_env" },
    plan,
  );

  assert.deepEqual(result, {
    priceId: "price_admin",
    source: "database",
  });
});

test("Stripe price resolution falls back to the environment", () => {
  const result = resolveConfiguredStripePriceId(
    null,
    { STRIPE_PRICE_PERSONAL: "price_env" },
    plan,
  );

  assert.deepEqual(result, {
    priceId: "price_env",
    source: "environment",
  });
});

test("Stripe verifier accepts the correct active monthly GBP plan mapping", async () => {
  const result = await verifyStripePriceConfiguration(
    async () => ({
      id: "price_expected",
      active: true,
      currency: "gbp",
      unit_amount: 599,
      type: "recurring",
      recurring: { interval: "month", interval_count: 1 },
      product: { id: "prod_expected", name: "Explore Plan", active: true },
    }),
    "sk_test_example",
    plan,
    "price_expected",
    "database",
  );

  assert.equal(result.valid, true);
  assert.equal(result.priceId, "price_expected");
  assert.equal(result.source, "database");
});

test("Stripe verifier rejects a Price ID mapped to the wrong amount", async () => {
  const result = await verifyStripePriceConfiguration(
    async () => ({
      id: "price_other",
      active: true,
      currency: "gbp",
      unit_amount: 799,
      type: "recurring",
      recurring: { interval: "month", interval_count: 1 },
      product: { id: "prod_expected", name: "Explore Plan", active: true },
    }),
    "sk_test_example",
    plan,
    "price_other",
    "database",
  );

  assert.equal(result.valid, false);
  assert.match(result.error, /wrong amount/i);
});

test("Coming Soon page follows the current Planyx launch-page structure", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  const script = await readFile(new URL("public/assets/js/coming-soon.js", root), "utf8");
  assert.match(html, /class="signal"/);
  assert.match(html, /class="countdown-grid"/);
  assert.match(html, /id="coming-soon-features"/);
  assert.match(html, /Build experiences\. Create memories\./);
  assert.match(html, /Copyright 2025–2026 JA Group Services Ltd/);
  assert.doesNotMatch(html, /sign[ -]?in/i);
  assert.match(script, /renderFeatures/);
  assert.match(script, /startCountdown/);
  assert.match(script, /cache: "no-store"/);
});
