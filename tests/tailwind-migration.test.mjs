import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const removedStyles = /theme\.css|public-saas\.css|portal\.css|builders\.css|admin-saas-v2\.css/;

async function walk(url) {
  const entries = await readdir(url, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, url);
    if (entry.isDirectory()) files.push(...await walk(child));
    else files.push(child);
  }
  return files;
}

test("production templates contain no removed legacy stylesheet references", async () => {
  const files = (await walk(new URL("../public/", import.meta.url))).filter((url) => /\.(?:html|js)$/.test(url.pathname));
  for (const file of files) assert.doesNotMatch(await readFile(file, "utf8"), removedStyles, file.pathname);
});

test("all generated destinations use the compiled Tailwind shell", async () => {
  const dirs = (await readdir(new URL("../public/destinations/", import.meta.url), { withFileTypes: true })).filter((entry) => entry.isDirectory());
  assert.equal(dirs.length, 252);
  for (const dir of dirs) {
    const html = await readFile(new URL(`../public/destinations/${dir.name}/index.html`, import.meta.url), "utf8");
    assert.match(html, /\/assets\/css\/tailwind\.css/);
    assert.match(html, /siteShellHeader/);
    assert.match(html, /siteShellFooter/);
  }
});

test("Subscription Plans page has no hard-coded plan cards or prices", async () => {
  const html = await readFile(new URL("../public/pricing/index.html", import.meta.url), "utf8");
  assert.match(html, /subscription-plans\.js/);
  assert.doesNotMatch(html, /pricing-card|plan-card|£19\.99|£29\.99|£39\.99/);
});

test("shared footer uses one compact wordmark and one contact email", async () => {
  const footer = await readFile(new URL("../public/assets/includes/footer.html", import.meta.url), "utf8");
  assert.match(footer, /aria-label="JA Plan Studio"/);
  assert.match(footer, /class="brand-ja"[^>]*>JA<\/span><span class="brand-name"[^>]*>Plan Studio<\/span>/);
  assert.doesNotMatch(footer, /site-footer-email/);
  assert.equal((footer.match(/mailto:japlanstudio@jagroupservices\.co\.uk/g) || []).length, 1);
});

test("Cookiebot reset records only genuine accept or decline choices", async () => {
  const shell = await readFile(new URL("../public/assets/js/site-shell.js", import.meta.url), "utf8");
  assert.match(shell, /2026-07-launch-reset-1/);
  assert.match(shell, /CookiebotOnAccept/);
  assert.match(shell, /CookiebotOnDecline/);
  assert.doesNotMatch(shell, /requestRenewal[\s\S]{0,200}localStorage\.setItem/);
});

test("shared header and footer use refined typography and a visible full footer wordmark", async () => {
  const styles = await readFile(new URL("../src/styles/tailwind.css", import.meta.url), "utf8");
  assert.match(styles, /\.site-nav a,[\s\S]*?font-weight:\s*500/);
  assert.match(styles, /\.site-create-link\s*{[\s\S]*?font-weight:\s*600/);
  assert.match(styles, /\.site-footer a\.site-footer-brand\s*{[\s\S]*?font-weight:\s*600/);
  assert.match(styles, /\.site-footer h4\s*{[\s\S]*?font-weight:\s*600/);
  assert.match(styles, /\.site-footer \.site-footer-brand \.brand-name\s*{\s*color:\s*#60a5fa/);
});

test("shared public shell uses the JA Plan Studio Google Fonts typography", async () => {
  const styles = await readFile(new URL("../src/styles/tailwind.css", import.meta.url), "utf8");
  assert.match(styles, /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap'\)/);
  assert.match(styles, /\.site-header\s*{[\s\S]*?font-family:\s*"Inter"/);
  assert.match(styles, /\.site-footer\s*{[\s\S]*?font-family:\s*"Inter"/);
  assert.match(styles, /\.brand-wordmark\s*{[\s\S]*?font-family:\s*"Plus Jakarta Sans"/);
  assert.match(styles, /\.site-brand\.brand-wordmark\s*{[\s\S]*?font-size:\s*clamp\(1\.1rem,[\s\S]*?1\.25rem\)/);
  assert.doesNotMatch(styles, /Manrope Local|fontsource-variable\/manrope|assets\/fonts\/manrope/);
});

test("Cookiebot cannot block the shared public header and footer shell", async () => {
  const htmlFiles = (await walk(new URL("../public/", import.meta.url))).filter((url) => url.pathname.endsWith(".html"));
  const violations = [];
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    if (/src="\/assets\/js\/site-shell\.js/.test(html) && !/<script[^>]*data-cookieconsent="ignore"[^>]*src="\/assets\/js\/site-shell\.js/.test(html)) {
      violations.push(file.pathname);
    }
  }
  assert.deepEqual(violations, []);
});
