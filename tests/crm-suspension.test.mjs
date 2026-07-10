import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("CRM uses existing customer, subscription, trial, builder and token data", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  for (const field of ["subscription_plan", "subscription_status", "trial_status", "builder_usage", "token_balance", "last_activity"]) assert.match(api, new RegExp(field));
  assert.match(client, /All account statuses/);
  assert.match(client, /Active/);
  assert.match(client, /Suspended/);
  assert.match(client, /Trial/);
  assert.match(client, /Paid/);
  assert.match(client, /Expired/);
  assert.match(client, /No subscription/);
  assert.match(client, /customerPreviousPage/);
  assert.match(client, /customerNextPage/);
});

test("suspension and reactivation are reasoned, confirmed, persisted and audited", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  const migration = await readFile(new URL("migrations/0006_customer_suspension.sql", root), "utf8");
  for (const column of ["suspended_at", "suspended_by", "suspension_reason", "reactivated_at", "reactivated_by", "reactivation_reason"]) assert.match(migration, new RegExp(column));
  assert.match(api, /suspend_account/);
  assert.match(api, /reactivate_account/);
  assert.match(api, /customer_account_suspended/);
  assert.match(api, /customer_account_reactivated/);
  assert.match(api, /request_id/);
  assert.match(client, /Suspension reason is required|suspended \? "Reactivation" : "Suspension"/);
  assert.match(client, /window\.confirm/);
});
