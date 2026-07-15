import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const restricted = /\b(?:tokens?|credits?)\b|\busage\s+(?:allowances?|quotas?)\b/i;

const publicCopy = (content) => content.replace(/Universal Credit|credit card/gi, "");

async function publicHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["account", "admin"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await publicHtmlFiles(target));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

test("public header sends Builders to the marketing route", async () => {
  const header = await readFile(path.join(root, "public/assets/includes/header.html"), "utf8");
  assert.match(header, /href="\/builders\/"[^>]*>Builders<\/a>/);
});

test("public Builders page is marketing-only and contains no internal currency wording", async () => {
  const html = await readFile(path.join(root, "public/builders/index.html"), "utf8");
  assert.match(html, /Experience Builders/);
  assert.match(html, /\/account\/login\/\?return_to=%2Faccount%2Fbuilders%2F/);
  assert.doesNotMatch(publicCopy(html), restricted);
  assert.doesNotMatch(html, /<form\b|builderForm|builderEditor|assets\/js\/builders\.js/);
});

test("all public HTML and metadata exclude internal currency wording", async () => {
  const violations = [];
  for (const file of await publicHtmlFiles(path.join(root, "public"))) {
    const content = await readFile(file, "utf8");
    if (restricted.test(publicCopy(content))) violations.push(path.relative(root, file));
  }
  assert.deepEqual(violations, []);
});

test("customer portal Builders navigation targets the protected hub", async () => {
  const portal = await readFile(path.join(root, "public/assets/js/account-portal.js"), "utf8");
  const protectedPage = await readFile(path.join(root, "public/account/builders/index.html"), "utf8");
  assert.match(portal, /\["\/account\/builders\/", "Builders"\]/);
  assert.match(protectedPage, /\/account\/assets\/builders\.js/);
  assert.match(protectedPage, /name="robots" content="noindex,nofollow"/);
});

test("working builder client is stored beneath the protected account route", async () => {
  await assert.rejects(readFile(path.join(root, "public/assets/js/builders.js"), "utf8"));
  const protectedPage = await readFile(path.join(root, "public/account/builders/index.html"), "utf8");
  const protectedClient = await readFile(path.join(root, "public/account/assets/builders.js"), "utf8");
  assert.match(protectedClient, /Builder Usage Tokens/);
  assert.match(protectedPage, /data-cookieconsent="ignore"[^>]+\/account\/assets\/builders\.js/);
});
