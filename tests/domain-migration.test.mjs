import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const retiredHost = ["experiences", "jagroupservices", "co", "uk"].join(".");
const primaryOrigin = "https://japlanstudio.jagroupservices.co.uk";
const ignoredDirectories = new Set([".git", "node_modules", ".wrangler", "dist"]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

test("the retired Experiences hostname is absent from the entire repository", async () => {
  const pattern = new RegExp(retiredHost.replaceAll(".", "\\."), "i");
  for (const file of await filesBelow(root)) {
    const content = await readFile(file, "utf8").catch(() => "");
    assert.doesNotMatch(content, pattern, path.relative(root, file));
  }
});

test("generated sitemap, robots and page metadata use the JA Plan Studio domain", async () => {
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  const robots = await readFile(path.join(root, "public/robots.txt"), "utf8");
  const homepage = await readFile(path.join(root, "public/index.html"), "utf8");
  assert.equal([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].length, 284);
  assert.doesNotMatch(sitemap, new RegExp(retiredHost.replaceAll(".", "\\."), "i"));
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(match[1].startsWith(`${primaryOrigin}/`));
  assert.match(robots, new RegExp(`Sitemap: ${primaryOrigin.replaceAll(".", "\\.")}\/sitemap\\.xml`));
  assert.match(homepage, new RegExp(`<link rel="canonical" href="${primaryOrigin.replaceAll(".", "\\.")}\/">`));
  assert.match(homepage, new RegExp(`${primaryOrigin.replaceAll(".", "\\.")}\/#website`));
  assert.match(homepage, new RegExp(`${primaryOrigin.replaceAll(".", "\\.")}\/#organization`));
});

test("runtime-generated customer, administrator and checkout links use the primary origin", async () => {
  const enquiries = await readFile(path.join(root, "functions/_shared/enquiries.js"), "utf8");
  const checkout = await readFile(path.join(root, "functions/create-checkout-session.js"), "utf8");
  const settings = await readFile(path.join(root, "functions/admin/api.js"), "utf8");
  assert.match(enquiries, new RegExp(`${primaryOrigin.replaceAll(".", "\\.")}\/account\/enquiries\/`));
  assert.match(enquiries, new RegExp(`${primaryOrigin.replaceAll(".", "\\.")}\/admin\/`));
  assert.match(checkout, new RegExp(primaryOrigin.replaceAll(".", "\\.")));
  assert.match(settings, new RegExp(primaryOrigin.replaceAll(".", "\\.")));
  assert.doesNotMatch(enquiries + checkout + settings, new RegExp(retiredHost.replaceAll(".", "\\."), "i"));
});
