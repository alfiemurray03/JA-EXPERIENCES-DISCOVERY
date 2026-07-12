import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("shared shell initialises both before and after DOMContentLoaded", async () => {
  const loader = await readFile(new URL("public/assets/js/site-shell.js", root), "utf8");
  assert.match(loader, /document\.readyState === "loading"/);
  assert.match(loader, /DOMContentLoaded", initialiseSiteShell/);
  assert.match(loader, /else\s*{\s*initialiseSiteShell\(\)/);
  assert.match(loader, /\/assets\/includes\/header\.html/);
  assert.match(loader, /\/assets\/includes\/footer\.html/);
});

test("representative root and nested public pages provide shared shell targets and loader", async () => {
  for (const path of ["public/index.html", "public/pricing/index.html", "public/destinations/london/index.html", "public/legal/privacy/index.html", "public/login/index.html"]) {
    const html = await readFile(new URL(path, root), "utf8");
    assert.match(html, /id="siteShellHeader"/, path);
    assert.match(html, /id="siteShellFooter"/, path);
    assert.match(html, /src="\/assets\/js\/site-shell\.js/, path);
  }
});

test("shared components use only JA Plan Studio branding", async () => {
  const content = await Promise.all(["header.html", "footer.html"].map((name) => readFile(new URL(`public/assets/includes/${name}`, root), "utf8")));
  assert.match(content.join("\n"), /JA Plan Studio/);
  assert.doesNotMatch(content.join("\n"), /JA Experiences\s*(?:&amp;|&)\s*Discovery/i);
});
