import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Coming Soon config API has no hard-coded launch date", async () => {
  const api = await readFile(new URL("functions/api/coming-soon-config.js", root), "utf8");
  assert.doesNotMatch(api, /2026-08-29T22:01:00\+01:00/);
  assert.match(api, /launchDate: ""/);
});

test("Coming Soon config API reads settings from D1 with parameterised queries", async () => {
  const api = await readFile(new URL("functions/api/coming-soon-config.js", root), "utf8");
  assert.match(api, /env\.DB\.prepare\("SELECT value FROM site_settings WHERE key = \?"\)\.bind\(key\)/);
});

test("Coming Soon config API sends no-store cache headers", async () => {
  const api = await readFile(new URL("functions/api/coming-soon-config.js", root), "utf8");
  assert.match(api, /Cache-Control.*no-store/);
});

test("Site status API reads from D1 with parameterised query and falls back to normal", async () => {
  const api = await readFile(new URL("functions/api/site-status.js", root), "utf8");
  assert.match(api, /SELECT value FROM site_settings WHERE key = 'site_status'/);
  assert.match(api, /status.*normal/);
  assert.match(api, /Cache-Control.*no-store/);
});

test("Admin API supports update_site_status action with audit logging", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  assert.match(api, /update_site_status/);
  assert.match(api, /\["normal", "coming_soon", "maintenance"\]\.includes\(nextStatus\)/);
  assert.match(api, /writeAudit.*site_status_update/);
});

test("Admin API supports update_coming_soon_settings action with audit logging", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  assert.match(api, /update_coming_soon_settings/);
  assert.match(api, /coming_soon_headline/);
  assert.match(api, /coming_soon_subtext/);
  assert.match(api, /coming_soon_launch_date/);
  assert.match(api, /writeAudit.*coming_soon_settings_update/);
});

test("Admin API validates launch date and rejects invalid dates", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  assert.match(api, /Number\.isNaN\(parsed\.getTime\(\)\)/);
  assert.match(api, /Launch date is not a valid date/);
});

test("Admin API platformsettings section returns coming_soon settings", async () => {
  const api = await readFile(new URL("functions/admin/api.js", root), "utf8");
  assert.match(api, /coming_soon:.*headline.*subtext.*launchDate/);
});

test("Middleware gates public routes based on site_status from D1", async () => {
  const mw = await readFile(new URL("functions/_middleware.js", root), "utf8");
  assert.match(mw, /site_status === "maintenance"/);
  assert.match(mw, /site_status === "coming_soon"/);
  assert.match(mw, /status: 503/);
  assert.match(mw, /Location.*\/coming-soon\//);
});

test("Middleware bypasses admin, auth, account, API, assets, and status routes", async () => {
  const mw = await readFile(new URL("functions/_middleware.js", root), "utf8");
  assert.match(mw, /path\.startsWith\("\/admin\/"\)/);
  assert.match(mw, /path\.startsWith\("\/account\/"\)/);
  assert.match(mw, /path\.startsWith\("\/assets"\)/);
  assert.match(mw, /path === "\/api\/site-status"/);
  assert.match(mw, /path === "\/api\/coming-soon-config"/);
  assert.match(mw, /path\.startsWith\("\/signed-out\/"\)/);
});

test("Middleware falls back to maintenance on D1 failure (does not expose full site)", async () => {
  const mw = await readFile(new URL("functions/_middleware.js", root), "utf8");
  assert.match(mw, /site_status.*maintenance.*catch|catch[^}]+maintenance[^}]+true|maintenance_enabled.*true[\s\S]{0,200}catch/);
});

test("Coming Soon page has JA Experiences branding, countdown, noindex, and legal links", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  assert.match(html, /JA Experiences/i);
  assert.match(html, /noindex.*nofollow/i);
  assert.match(html, /days|hours|minutes|seconds/i);
  assert.match(html, /Cookiebot\.renew/);
  assert.match(html, /\/legal\/privacy\//);
  assert.match(html, /\/legal\/terms\//);
  assert.match(html, /\/legal\/cookies\//);
  assert.match(html, /\/accessibility-support\//);
});

test("Coming Soon page hides countdown when no date is saved", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  assert.match(html, /countdown.*hidden|no.*date.*hidden|launchDate.*null|!launchDate/i);
});

test("Coming Soon page fetches config from API and uses saved values", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  const script = await readFile(new URL("public/assets/js/coming-soon.js", root), "utf8");
  assert.match(html, /src="\/assets\/js\/coming-soon\.js[^"]*"[^>]*data-cookieconsent="ignore"[^>]*defer/);
  assert.match(script, /\/api\/coming-soon-config/);
  assert.match(script, /cache: "no-store"/);
  assert.match(script, /tick\(\);[\s\S]*setInterval\(tick, 1000\)/);
  assert.match(script, /renderFeatures/);
  assert.doesNotMatch(html + script, /2026-08-29T22:01:00\+01:00/);
});

test("Maintenance page has JA Experiences branding, 503 wording, noindex, and legal links", async () => {
  const html = await readFile(new URL("public/maintenance/index.html", root), "utf8");
  assert.match(html, /JA Experiences/i);
  assert.match(html, /Maintenance/i);
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /Cookiebot\.renew/);
  assert.match(html, /\/legal\/privacy\//);
  assert.match(html, /\/legal\/terms\//);
  assert.match(html, /\/legal\/cookies\//);
  assert.match(html, /\/accessibility-support\//);
});

test("Maintenance page is responsive", async () => {
  const html = await readFile(new URL("public/maintenance/index.html", root), "utf8");
  assert.match(html, /viewport.*width.*initial-scale/);
  assert.match(html, /@media|clamp|min-width|max-width/);
});

test("Coming Soon page is responsive", async () => {
  const html = await readFile(new URL("public/coming-soon/index.html", root), "utf8");
  assert.match(html, /viewport.*width.*initial-scale/);
  assert.match(html, /@media.*max-width/);
});

test("Admin dashboard has Site Status mode-selection cards with all three modes", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /renderSiteStatusTab/);
  assert.match(client, /name="siteStatusMode"/);
  assert.match(client, /\["normal", "coming_soon", "maintenance"\]/);
  assert.match(client, /Save Site Status/);
  assert.match(client, /status-mode-card/);
});

test("Admin Site Status tab has Coming Soon Countdown section with headline, subtext, launch date, and save button", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /Coming Soon Countdown/);
  assert.match(client, /comingSoonHeadline/);
  assert.match(client, /comingSoonSubtext/);
  assert.match(client, /comingSoonLaunchDate/);
  assert.match(client, /Save Countdown Settings/);
  assert.match(client, /update_coming_soon_settings/);
});

test("Admin Coming Soon form loads existing values from API on render", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /\/api\/coming-soon-config/);
  assert.match(client, /comingSoonHeadline.*value/);
});

test("Admin Coming Soon form handles GMT/BST conversion for datetime-local input", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /getUkOffset/);
  assert.match(client, /bstStart|gmtStart/i);
});

test("Admin site status form shows saving, success, and error messages", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /Saving|saving/i);
  assert.match(client, /saved successfully|Saved successfully/i);
  assert.match(client, /could not be saved/i);
});

test("System Settings tabs reuse real renderers inside one stable shell", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  for (const tabId of ["general", "stripe", "products", "plans", "email", "compliance", "appearance", "sitestatus", "troubleshooting"]) assert.match(client, new RegExp(`id: "${tabId}"`));
  assert.match(client, /settingsRenderPanel/);
  assert.match(client, /case "stripe":[\s\S]*renderStripe/);
  assert.match(client, /case "products":[\s\S]*renderExperienceBuilders/);
  assert.match(client, /case "plans":[\s\S]*renderPlans/);
  assert.match(client, /case "email":[\s\S]*renderEmail/);
  assert.match(client, /case "compliance":[\s\S]*renderPolicies/);
  assert.match(client, /case "appearance":[\s\S]*renderAppearance/);
  assert.doesNotMatch(client, /renderSettingsLinkTab|Open Stripe settings|Open Plans settings|Open Email settings/);
});

test("Troubleshooting has independent diagnostics content and an internal Site Status tab action", async () => {
  const client = await readFile(new URL("public/assets/js/admin-control.js", root), "utf8");
  assert.match(client, /Run safe platform checks and review technical information to help diagnose common service problems/);
  assert.match(client, /Run Diagnostics/);
  assert.match(client, /action: "diagnostics"/);
  assert.match(client, /Go to Site Status/);
  assert.match(client, /data-tab=\\?"sitestatus/);
});

test("D1 site_settings table is created by migration or via API initialisation", async () => {
  const migrationFiles = await import("node:fs/promises").then((fs) =>
    fs.readdir(new URL("migrations/", root))
  );
  const migrationContents = await Promise.all(
    migrationFiles.map((f) => readFile(new URL(`migrations/${f}`, root), "utf8"))
  );
  const adminApi = await readFile(new URL("functions/admin/api.js", root), "utf8");
  const siteStatusApi = await readFile(new URL("functions/api/site-status.js", root), "utf8");
  const allContent = migrationContents.join("\n") + adminApi + siteStatusApi;
  assert.match(allContent, /site_settings/);
});
