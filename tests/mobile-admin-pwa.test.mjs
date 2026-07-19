import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const adminMobile = await readFile(new URL('../src/styles/admin-mobile.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
const pwa = await readFile(new URL('../src/lib/pwa.ts', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../static/manifest.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('../static/sw.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Admin Portal supports horizontal touch scrolling on mobile', () => {
  assert.match(adminMobile, /\.admin-portal main[\s\S]*overflow-x: auto/);
  assert.match(adminMobile, /-webkit-overflow-scrolling: touch/);
  assert.match(adminMobile, /touch-action: pan-x pan-y/);
  assert.match(adminMobile, /min-width: max\(720px, 100%\)/);
  assert.match(adminMobile, /env\(safe-area-inset-bottom\)/);
});

test('mobile web app launches on the public homepage without compulsory sign-in', () => {
  assert.equal(manifest.name, 'JA Plan Studio');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.start_url, '/?source=pwa');
  assert.ok(manifest.icons.some((icon) => String(icon.purpose).includes('maskable')));
  assert.ok(manifest.shortcuts.some((shortcut) => shortcut.url === '/?source=pwa'));
  assert.ok(manifest.shortcuts.some((shortcut) => shortcut.url === '/help-centre'));
  assert.ok(!manifest.shortcuts.some((shortcut) => shortcut.url === '/dashboard'));
  assert.ok(!manifest.shortcuts.some((shortcut) => shortcut.url === '/admin'));
});

test('service worker is registered and keeps protected sessions out of cache', () => {
  assert.match(main, /installPwaSupport\(\)/);
  assert.match(pwa, /serviceWorker\.register\('\/sw\.js'/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(serviceWorker, /isProtectedNavigation/);
  assert.match(serviceWorker, /pathname\.startsWith\('\/admin\/'\)/);
  assert.match(serviceWorker, /pathname\.startsWith\('\/dashboard\/'\)/);
  assert.match(serviceWorker, /request\.mode === 'navigate'/);
});

test('HTML includes iPhone and Android web app metadata', () => {
  assert.match(index, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(index, /apple-mobile-web-app-capable" content="yes"/);
  assert.match(index, /viewport-fit=cover/);
  assert.match(index, /theme-color" content="#0b172d"/);
});
