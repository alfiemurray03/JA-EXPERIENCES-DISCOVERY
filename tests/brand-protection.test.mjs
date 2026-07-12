import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const includedRoots = ["public", "functions", "scripts", "src"];
const textExtensions = new Set([".css", ".html", ".js", ".json", ".mjs", ".svg", ".ts", ".xml"]);
const oldFirstWord = "Exper" + "iences";
const prohibitedBrand = new RegExp(`JA ${oldFirstWord}\\s*(?:&(?:amp;)?|and)\\s*Discovery|${oldFirstWord}\\s*(?:&(?:amp;)?|and)\\s*Discovery|JA ${oldFirstWord}`, "i");

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(filePath));
    else if (entry.isFile() && (textExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name === "site.webmanifest")) files.push(filePath);
  }
  return files;
}

test("customer-facing and administration sources contain no former brand references", async () => {
  const violations = [];
  for (const relativeRoot of includedRoots) {
    for (const filePath of await collect(path.join(root, relativeRoot))) {
      const content = await readFile(filePath, "utf8");
      if (prohibitedBrand.test(content)) violations.push(path.relative(root, filePath));
    }
  }
  assert.deepEqual(violations, [], `Former brand references found in:\n${violations.join("\n")}`);
});

test("shared wordmarks use the approved accessible black-and-navy treatment", async () => {
  const [header, footer, styles] = await Promise.all([
    readFile(path.join(root, "public/assets/includes/header.html"), "utf8"),
    readFile(path.join(root, "public/assets/includes/footer.html"), "utf8"),
    readFile(path.join(root, "src/styles/tailwind.css"), "utf8"),
  ]);
  assert.match(header, /aria-label="JA Plan Studio home"/);
  assert.match(footer, /aria-label="JA Plan Studio"/);
  assert.match(styles, /\.brand-wordmark \.brand-ja \{ color: #000; \}/);
  assert.match(styles, /\.brand-wordmark \.brand-name \{ color: var\(--ja-navy, #102449\); \}/);
});
