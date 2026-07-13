import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("provider pages are separate JA Plan Studio pages with shared shell, search and disclosures", async () => {
  const [gyg, headout] = await Promise.all([read("public/getyourguide/index.html"), read("public/headout/index.html")]);
  for (const [provider, html] of [["GetYourGuide", gyg], ["Headout", headout]]) {
    assert.match(html, new RegExp(`<title>[^<]*${provider}[^<]*JA Plan Studio`));
    assert.match(html, /id="siteShellHeader"/);
    assert.match(html, /id="siteShellFooter"/);
    assert.match(html, /affiliate-widget-data\.js/);
    assert.match(html, /Affiliate disclosure:/);
    assert.match(html, /type="search"/);
    assert.doesNotMatch(html, /JA Experiences\s*(?:&amp;|&)\s*Discovery/i);
  }
  assert.doesNotMatch(gyg, /headout-widgets\.js/);
  assert.doesNotMatch(headout, /getyourguide-widgets\.js/);
});

test("shared affiliate records support case-insensitive country, city and activity search", async () => {
  const source = await read("public/assets/js/affiliate-widget-data.js");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const data = context.window.JA_AFFILIATE_WIDGET_DATA;
  const records = data.register("Test provider", [{ countryName: "United Kingdom", city: "London", widgetName: "Tower attraction tour", category: "Activities" }]);
  assert.equal(data.matches(records[0], " united KINGDOM "), true);
  assert.equal(data.matches(records[0], "LONDON"), true);
  assert.equal(data.matches(records[0], "attraction"), true);
  assert.equal(data.matches(records[0], "no such place"), false);
  assert.equal(data.matches(records[0], ""), true);
});

test("genuine provider identifiers are retained and external scripts are guarded", async () => {
  const [gyg, headout] = await Promise.all([read("public/assets/js/getyourguide-widgets.js"), read("public/assets/js/headout-widgets.js")]);
  assert.match(gyg, /PARTNER_ID = "ZSEVDSG"/);
  assert.match(headout, /affiliate_code=JL2D9u/);
  assert.equal((gyg.match(/pa\.umd\.production\.min\.js/g) || []).length >= 1, true);
  assert.equal((headout.match(/partner\.headout\.com\/embed\/script/g) || []).length, 2);
  assert.match(gyg, /script\.onerror/);
  assert.match(headout, /script\.onerror/);
  assert.match(gyg, /provider-widget-fallback/);
  assert.match(headout, /provider-widget-fallback/);
});

test("destination gallery exposes public guides and protected validated builder handoff", async () => {
  const [page, directory, protectedPage, builders, destinations] = await Promise.all([
    read("public/destinations/index.html"),
    read("public/assets/js/destination-directory.js"),
    read("public/account/builders/index.html"),
    read("public/account/assets/builders.js"),
    read("public/assets/js/destinations-data.js")
  ]);
  assert.match(page, /id="allDestinations"/);
  assert.match(directory, /\/destinations\/\$\{escapeHtml\(destination\.slug\)\}\//);
  assert.match(directory, /Build this plan/);
  assert.match(directory, /\/account\/builders\/\?builder=holiday-planner&amp;destination=/);
  assert.match(protectedPage, /destinations-data\.js/);
  assert.match(builders, /window\.JA_DESTINATIONS\.find\(\(item\) => item\.slug === destinationSlug\)/);
  assert.match(builders, /builderState\.guidedAnswers\.destination = builderState\.requestedDestination/);
  assert.match(builders, /selected destination is not supported/i);
  assert.doesNotMatch(builders, /^(?:<{7}|={7}|>{7})/m);
  assert.equal((destinations.match(/"slug":/g) || []).length, 252);
});

test("shared navigation reaches both affiliate galleries", async () => {
  const header = await read("public/assets/includes/header.html");
  assert.match(header, /href="\/getyourguide\/"/);
  assert.match(header, /href="\/headout\/"/);
  assert.match(header, /nav-dropdown-toggle/);
});
