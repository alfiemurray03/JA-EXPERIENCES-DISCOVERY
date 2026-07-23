import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const productionUrl = "https://japlanstudio.jagroupservices.co.uk";
const formerBrand = new RegExp(["JA", "Experiences", "(?:\\s*&(?:amp;)?\\s*Discovery)?"].join(" "), "i");

const readPublic = route => readFile(path.join(publicDir, route === "/" ? "index.html" : route.slice(1), route === "/" ? "" : "index.html"), "utf8");
const schemas = html => [...html.matchAll(/<script\s+type="application\/ld\+json">(.*?)<\/script>/gis)].map(match => JSON.parse(match[1]));

test("homepage exposes one canonical WebSite and Organization", async () => {
  const html = await readPublic("/");
  const entities = schemas(html);
  const websites = entities.filter(entity => entity["@type"] === "WebSite");
  const organizations = entities.filter(entity => entity["@type"] === "Organization");
  assert.equal(websites.length, 1);
  assert.equal(organizations.length, 1);
  assert.equal(websites[0].name, "Planyx");
  assert.equal(websites[0].alternateName, "Planyx by JA Group Services Ltd");
  assert.equal(websites[0]["@id"], `${productionUrl}/#website`);
  assert.deepEqual(websites[0].publisher, { "@id": `${productionUrl}/#organization` });
  assert.equal(organizations[0].name, "Planyx");
  assert.equal(organizations[0].legalName, "JA Group Services Ltd");
  assert.equal(organizations[0].identifier.value, "16314179");
  assert.equal(organizations[0].email, "japlanstudio@jagroupservices.co.uk");
  assert.deepEqual(organizations[0].address, {
    "@type": "PostalAddress",
    streetAddress: "167-169 Great Portland Street, 5th Floor",
    addressLocality: "London",
    addressRegion: "Westminster",
    postalCode: "W1W 5PF",
    addressCountry: "GB"
  });
  assert.match(html, /<link rel="canonical" href="https:\/\/japlanstudio\.jagroupservices\.co\.uk\/">/);
  assert.match(html, /<meta property="og:site_name" content="Planyx">/);
});

test("generated destination pages contain canonical WebPage data and real breadcrumbs", async () => {
  const html = await readPublic("/destinations/london/");
  const entities = schemas(html);
  const page = entities.find(entity => entity["@type"] === "WebPage");
  const breadcrumb = entities.find(entity => entity["@type"] === "BreadcrumbList");
  assert.equal(page.url, `${productionUrl}/destinations/london/`);
  assert.equal(page.isPartOf["@id"], `${productionUrl}/#website`);
  assert.equal(page.publisher["@id"], `${productionUrl}/#organization`);
  assert.deepEqual(breadcrumb.itemListElement.map(item => item.name), ["Home", "Destinations", "London"]);
  assert.equal(new Set(entities.map(entity => entity["@id"])).size, entities.length);
});

test("Coming Soon retains intentional noindex while using canonical current identity", async () => {
  const html = await readPublic("/coming-soon/");
  const entities = schemas(html);
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(html, /<meta property="og:site_name" content="Planyx">/);
  assert.equal(entities.filter(entity => entity["@type"] === "WebSite").length, 1);
  assert.equal(entities.find(entity => entity["@type"] === "WebSite").name, "Planyx");
  assert.equal(entities.find(entity => entity["@type"] === "Organization").legalName, "JA Group Services Ltd");
});

test("sitemap stays public-only and uses the production canonical domain", async () => {
  const xml = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
  assert.doesNotMatch(xml, /(?:\/admin\/|\/account\/|\/builders\/)/);
  assert.doesNotMatch(xml, /pages\.dev|ja-experiences/i);
  for (const loc of xml.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(loc[1].startsWith(`${productionUrl}/`));
});

test("current public SEO metadata does not use the former brand or malformed JSON-LD", async () => {
  const files = ["index.html", "coming-soon/index.html"];
  const destinations = await readdir(path.join(publicDir, "destinations"), { withFileTypes: true });
  files.push(...destinations.filter(entry => entry.isDirectory()).map(entry => `destinations/${entry.name}/index.html`));
  for (const relative of files) {
    const html = await readFile(path.join(publicDir, relative), "utf8");
    const head = html.match(/<head>(.*?)<\/head>/is)?.[1] ?? "";
    assert.doesNotMatch(head, formerBrand, relative);
    assert.doesNotThrow(() => schemas(html), relative);
    const ids = schemas(html).map(entity => entity["@id"]).filter(Boolean);
    assert.equal(ids.length, new Set(ids).size, relative);
  }
});
