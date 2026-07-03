import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Production Health is wired through navigation, permissions, API and rendering", async () => {
  const [html, client, api] = await Promise.all([
    readFile(new URL("public/admin/dashboard/index.html", root), "utf8"),
    readFile(new URL("public/assets/js/admin-control.js", root), "utf8"),
    readFile(new URL("functions/admin/api.js", root), "utf8")
  ]);

  assert.match(html, /data-section="health"[^>]*>Production Health</);
  assert.match(client, /health:\s*"Production Health"/);
  assert.match(client, /function renderProductionHealth\(/);
  assert.match(api, /health:\s*\["view_dashboard", "manage_status", "manage_api", "manage_settings"\]/);
  assert.match(api, /section === "health"/);
});

test("Production Health does not invent unavailable observability or delivery telemetry", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");

  assert.match(api, /worker_error_rate:\s*null/);
  assert.match(api, /Worker error rate requires Cloudflare observability access/);
  assert.match(api, /delivery is not tested by this read-only check/);
  assert.match(api, /delivery history cannot be verified/);
});
