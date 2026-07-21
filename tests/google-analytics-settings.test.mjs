import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Site Settings validates and persists a GA4 Measurement ID', async () => {
  const page = await source('src/pages/admin/site-settings.tsx');
  const post = await source('src/server/api/admin/site-settings/POST.ts');

  assert.match(page, /Google Analytics 4 Measurement ID/);
  assert.match(page, /G-\[A-Z0-9\]/);
  assert.match(page, /google_analytics_id/);
  assert.match(post, /INVALID_GOOGLE_ANALYTICS_ID/);
  assert.match(post, /normalisedSettings\.google_analytics_id/);
});

test('Google Analytics is public-runtime configured and consent gated', async () => {
  const runtime = await source('src/components/GoogleAnalytics.tsx');
  const context = await source('src/lib/site-settings-context.tsx');
  const publicSettings = await source('src/server/api/site-settings/public/GET.ts');
  const app = await source('src/App.tsx');

  assert.match(publicSettings, /google_analytics_id/);
  assert.match(context, /googleAnalyticsId/);
  assert.match(context, /G-50QJHHL7H7/);
  assert.match(runtime, /getAnalyticsConsent/);
  assert.match(runtime, /onConsentChange/);
  assert.match(runtime, /googletagmanager\.com\/gtag\/js/);
  assert.match(runtime, /analytics_storage: 'granted'/);
  assert.match(runtime, /ad_storage: 'denied'/);
  assert.match(runtime, /pathname\.startsWith\('\/admin\/'\)/);
  assert.match(app, /<GoogleAnalytics \/>/);
});
