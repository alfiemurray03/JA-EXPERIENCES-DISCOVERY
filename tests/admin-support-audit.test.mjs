import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("new support cases carry create intent and audit the persisted identity", async () => {
  const [client, api] = await Promise.all([
    readFile(new URL("public/assets/js/admin-control.js", root), "utf8"),
    readFile(new URL("functions/admin/api.js", root), "utf8")
  ]);

  assert.match(client, /action:\s*isNew \? "create" : "update"/);
  assert.match(api, /saved:\s*\{ id, reference, subject \}/);
  assert.match(api, /body\.action === "create" \? "support_create" : "support_update"/);
  assert.match(api, /"support_tickets", result\.saved\.id/);
  assert.match(api, /result\.saved\.reference/);
});
