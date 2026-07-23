import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('all route families use the branded Planyx error page', async () => {
  const app = await source('src/App.tsx');
  const page = await source('src/components/RouteErrorPage.tsx');

  assert.match(app, /RouteErrorPage/);
  assert.match(app, /errorElement/);
  assert.match(app, /adminRoutes\.map\(withErrorPage\)/);
  assert.match(app, /resellerRoutes\.map\(withErrorPage\)/);

  assert.match(page, /Planyx/);
  assert.match(page, /Secure application recovery/);
  assert.match(page, /Error details/);
  assert.match(page, /details\.message/);
  assert.match(page, /Refresh page/);
  assert.match(page, /Copy error details/);
  assert.match(page, /Admin dashboard/);
});

test('stale dynamic imports attempt one controlled refresh and then render recovery UI', async () => {
  const recovery = await source('src/lib/chunk-recovery.ts');
  const main = await source('src/main.tsx');

  assert.match(main, /installChunkRecovery\(\)/);
  assert.match(recovery, /vite:preloadError/);
  assert.match(recovery, /unhandledrejection/);
  assert.match(recovery, /RECOVERY_WINDOW_MS/);
  assert.match(recovery, /renderEmergencyPage/);
  assert.match(recovery, /_japs_refresh/);
  assert.match(recovery, /dynamically imported module/);
});

test('publishing retains the immediately previous release asset manifest', async () => {
  const prepare = await source('scripts/prepare-vite-build.mjs');
  const sync = await source('scripts/sync-vite-output.mjs');

  assert.doesNotMatch(prepare, /publicDir/);
  assert.doesNotMatch(prepare, /public.*assets/);
  assert.match(prepare, /distDir/);

  assert.match(sync, /.asset-manifest\.json/);
  assert.match(sync, /previousReleaseAssets/);
  assert.match(sync, /currentReleaseAssets/);
  assert.match(sync, /First migration: retain the existing release once/);
  assert.match(sync, /if \(targetStats\) continue/);
});

test('the exact missing Analytics chunk has a safe compatibility module', async () => {
  const compatibility = await source('static/assets/analytics-XYhWdSNH.js');
  const workflow = await source('.github/workflows/publish-public.yml');

  assert.match(compatibility, /analytics-compat-refresh/);
  assert.match(compatibility, /window\.location\.replace/);
  assert.match(compatibility, /Planyx needs to be refreshed/);
  assert.match(compatibility, /export default function AnalyticsCompatibilityPage/);

  assert.match(workflow, /test -f public\/assets\/analytics-XYhWdSNH\.js/);
  assert.match(workflow, /Secure application recovery/);
  assert.match(workflow, /analytics-compat-refresh/);
});
