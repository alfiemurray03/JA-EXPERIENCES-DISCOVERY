import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Branding and Appearance is an editable Admin Centre section', async () => {
  const page = await source('src/pages/admin/branding.tsx');
  const section = await source('src/pages/admin/operational-section.tsx');

  assert.match(page, /Branding & Appearance/);
  assert.match(page, /browser_tab_name/);
  assert.match(page, /admin_tab_name/);
  assert.match(page, /favicon_url/);
  assert.match(page, /Upload favicon/);
  assert.match(page, /MAX_FAVICON_BYTES = 256 \* 1024/);
  assert.match(page, /admin_theme_mode/);
  assert.match(page, /Light/);
  assert.match(page, /Dark/);
  assert.match(page, /System/);
  assert.match(section, /import AdminBrandingPage/);
  assert.match(section, /if \(isBranding\) return <AdminBrandingPage \/>/);
});

test('Admin theme changes the complete portal and remains separate from the public site', async () => {
  const themeContext = await source('src/lib/admin-theme-context.tsx');
  const darkCss = await source('src/styles/admin-dark.css');
  const tailwind = await source('tailwind.config.js');
  const main = await source('src/main.tsx');

  assert.match(tailwind, /darkMode: 'class'/);
  assert.match(themeContext, /admin_theme_mode/);
  assert.match(themeContext, /root\.classList\.toggle\('dark', adminRouteActive && resolvedTheme === 'dark'\)/);
  assert.match(themeContext, /root\.querySelector\('\.admin-portal'\)/);
  assert.match(themeContext, /Switch Admin Portal to dark mode/);
  assert.match(themeContext, /Switch Admin Portal to light mode/);
  assert.match(darkCss, /#admin-theme-root\.dark \.admin-portal > aside/);
  assert.match(darkCss, /#admin-theme-root\.dark \.admin-portal header/);
  assert.match(darkCss, /#admin-theme-root\.dark \.admin-portal main table/);
  assert.match(darkCss, /#admin-theme-root\.dark \.admin-portal :where\(input, textarea, select/);
  assert.match(darkCss, /#admin-theme-root\.dark :where\(\[role="dialog"\]/);
  assert.match(main, /import '\.\/styles\/admin-dark\.css'/);
});

test('Saved browser branding is available in public, Admin and Coming Soon runtimes', async () => {
  const browserBranding = await source('src/lib/browser-branding.ts');
  const publicSettings = await source('src/server/api/site-settings/public/GET.ts');
  const cloudflareSettings = await source('functions/site-settings.js');
  const comingSoon = await source('static/assets/js/coming-soon.js');
  const main = await source('src/main.tsx');

  for (const key of ['browser_tab_name', 'admin_tab_name', 'favicon_url', 'admin_theme_mode']) {
    assert.match(publicSettings, new RegExp(key));
    assert.match(cloudflareSettings, new RegExp(key));
  }
  assert.match(browserBranding, /applyBrowserBranding/);
  assert.match(browserBranding, /link\[rel~="icon"\]/);
  assert.match(browserBranding, /\/api\/site-settings\/public/);
  assert.match(browserBranding, /\/site-settings/);
  assert.match(comingSoon, /loadBrowserBranding/);
  assert.match(comingSoon, /faviconUrl/);
  assert.match(comingSoon, /document\.title = `\$\{headline\} — \$\{tabName/);
  assert.match(main, /installBrowserBranding\(\)/);
});
