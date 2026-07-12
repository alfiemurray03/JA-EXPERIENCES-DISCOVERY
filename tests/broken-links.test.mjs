import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseHTML } from "linkedom";

const publicRoot = resolve("public");
const ignoredPrefixes = ["/api/", "/auth/", "/cdn-cgi/", "/admin/login", "/admin/logout", "/account/login", "/account/logout"];

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

test("public HTML has no broken local links or assets", async () => {
  const failures = [];
  for (const file of await htmlFiles(publicRoot)) {
    const { document } = parseHTML(await readFile(file, "utf8"));
    for (const element of document.querySelectorAll("a[href], link[href], script[src], img[src], source[src]")) {
      const raw = element.getAttribute("href") || element.getAttribute("src") || "";
      if (!raw || raw.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
      const pathname = new URL(raw, "https://local.test/").pathname;
      if (ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) continue;
      const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
      const target = join(publicRoot, relative);
      const candidates = pathname.endsWith("/")
        ? [join(target, "index.html")]
        : [target, `${target}.html`, join(target, "index.html")];
      if (!(await Promise.all(candidates.map(exists))).some(Boolean)) failures.push(`${file}: ${raw}`);
    }
  }
  assert.deepEqual(failures, [], failures.slice(0, 50).join("\n"));
});
