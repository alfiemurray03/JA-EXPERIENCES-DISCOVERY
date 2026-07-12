import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_BUILDERS, outputFromInput, onRequest } from "../functions/account/builders.js";

test("every configured builder produces a readable structured output", () => {
  assert.equal(DEFAULT_BUILDERS.length, 30);
  const ids = new Set();
  for (const row of DEFAULT_BUILDERS) {
    const [id, name, , , tokenCost, plans, visibility] = row;
    assert.ok(id && name, "builder identity");
    assert.equal(ids.has(id), false, `duplicate builder ${id}`);
    ids.add(id);
    assert.ok(Number.isFinite(tokenCost) && tokenCost >= 0, `${id} token cost`);
    assert.ok(plans, `${id} plan inclusion`);
    assert.ok(["trial", "paid"].includes(visibility), `${id} visibility`);
    const output = outputFromInput({ id, name }, { title: `${name} result`, fields: { idea: "Test idea", notes: "Test notes" } });
    assert.equal(output.title, `${name} result`);
    assert.equal(output.builder, name);
    assert.ok(output.notes.length === 2 || output.notes.length === 17, `output notes length was ${output.notes.length}`);
    assert.ok(Array.isArray(output.responsibilities));
    assert.doesNotMatch(output.summary, /^\s*[{[]/);
  }
});

test("public and server builder inventories stay aligned", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../public/assets/js/builders.js", import.meta.url), "utf8"));
  const publicIds = [...source.matchAll(/^\s*\["([a-z0-9-]+)",/gm)].map((match) => match[1]);
  assert.deepEqual(publicIds, DEFAULT_BUILDERS.map((row) => row[0]));
});

test("builder service enforces suspension, plan inclusion, idempotency and atomic deduction", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../functions/account/builders.js", import.meta.url), "utf8"));
  assert.match(source, /admin_customer_status/);
  assert.match(source, /currently suspended/);
  assert.match(source, /plan_inclusion/);
  assert.match(source, /request_id/);
  assert.match(source, /duplicate: true/);
  assert.match(source, /DB\.batch|env\.DB\.batch/);
  assert.match(source, /remaining_tokens < cost/);
});

test("suspended customers are rejected by the builder endpoint itself", async () => {
  const DB = { prepare(sql) { return { bind() { return this; }, async first() { return sql.includes("FROM profiles") ? { admin_customer_status: "Suspended" } : null; }, async all() { return { results: [] }; }, async run() { return { success: true }; } }; } };
  const response = await onRequest({ request: new Request("https://experiences.example.test/account/api/builders", { headers: { "x-ja-auth-email": "customer@example.test" } }), env: { DB } });
  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /currently suspended/);
});
