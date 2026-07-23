import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboard = await readFile(new URL("../public/admin/dashboard/index.html", import.meta.url), "utf8");
const client = await readFile(new URL("../public/assets/js/admin-control.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles/tailwind.css", import.meta.url), "utf8");

test("shared Admin Centre shell keeps protected navigation and accessible mobile controls", () => {
  for (const section of ["overview", "health", "operations", "analytics", "reports", "status", "audit", "customers", "plans", "builders", "datarequests", "support", "notifications", "systemsettings"]) {
    assert.match(dashboard, new RegExp(`data-section="${section}"`), section);
  }
  assert.match(dashboard, /aria-label="Administration navigation"/);
  assert.match(dashboard, /aria-controls="adminSidebar" aria-expanded="false"/);
  assert.match(dashboard, /Protected by native Microsoft Entra ID/);
  assert.match(dashboard, /Admin Access Verified/);
  assert.match(dashboard, /admin-mobile-nav/);
});

test("sidebar uses the approved full brand and favourites cannot duplicate Overview", () => {
  assert.match(dashboard, /aria-label="Planyx"/);
  assert.match(dashboard, />Plan Studio<\/span>/);
  assert.match(dashboard, />Admin Centre<\/span>/);
  assert.doesNotMatch(dashboard, /Plan Studio Admin<\/span>/);
  assert.match(client, /section !== "overview"/);
});

test("Overview uses the authoritative Site Status and genuine workspace routes", () => {
  assert.match(client, /fetch\("\/api\/site-status"/);
  assert.match(client, /Maintenance Mode/);
  assert.match(client, /Coming Soon/);
  assert.match(client, /Normal/);
  assert.doesNotMatch(client, /Operations dashboard/);
  assert.doesNotMatch(client, /Workspace card/);
  assert.doesNotMatch(client, /Website Launch Gateway/);
  for (const section of ["health", "status", "systemsettings", "stripe", "audit", "customers"]) {
    assert.match(client, new RegExp(`\\["${section}"`), section);
    assert.match(client, new RegExp(`\\b${section}:\\s*"`), section);
  }
});

test("Admin Centre typography and responsive shell use the approved design system", () => {
  assert.match(styles, /body:has\(\.admin-shell\)[\s\S]*font-family: Inter/);
  assert.match(styles, /body:has\(\.admin-shell\) h1[\s\S]*Plus Jakarta Sans/);
  assert.match(styles, /grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media \(max-width: 1200px\)[\s\S]*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*grid-template-columns: 1fr/);
  assert.doesNotMatch(styles.match(/body:has\(\.admin-shell\)[\s\S]*?\n}/)?.[0] || "", /Segoe UI/);
});
