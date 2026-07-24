import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readFeatureFlag, readPublicFeatureConfig } from '../functions/_shared/feature-flags.js';
import { onRequestGet as publicConfig } from '../functions/api/system-config/public.js';
import { onRequestGet as checkoutGet } from '../functions/create-checkout-session.js';

const root = new URL('../', import.meta.url);

class FeatureDB {
  constructor(settings = {}) {
    this.settings = settings;
  }

  prepare(sql) {
    const settings = this.settings;
    return {
      bind(key) {
        return {
          async first() {
            if (!sql.includes('site_settings')) return null;
            return Object.prototype.hasOwnProperty.call(settings, key) ? { value: settings[key] } : null;
          },
        };
      },
      async all() {
        return {
          results: Object.entries(settings).map(([key, value]) => ({ key, value })),
        };
      },
    };
  }
}

test('Cloudflare public config exposes the saved Payments toggle', async () => {
  const DB = new FeatureDB({ toggle_payments: 'true', toggle_registration: 'false' });
  const response = await publicConfig({ env: { DB } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control').includes('no-store'), true);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.config.payments, true);
  assert.equal(payload.config.registration, false);
});

test('feature flags fail closed for payments and retain safe defaults', async () => {
  assert.equal(await readFeatureFlag(new FeatureDB({}), 'payments', false), false);
  const config = await readPublicFeatureConfig(new FeatureDB({}));
  assert.equal(config.payments, false);
  assert.equal(config.registration, true);
  assert.equal(config.a11y_enabled, true);
});

test('Cloudflare checkout requires a customer account before payment', async () => {
  const response = await checkoutGet({
    request: new Request('https://planyx.example/create-checkout-session?plan=personal'),
    env: { DB: new FeatureDB({ toggle_payments: 'false' }), SITE_URL: 'https://planyx.example' },
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /^\/account\/login\?return_to=/);
});

test('pricing renders disabled controls and a clear coming-soon message when Payments is off', async () => {
  const pricing = await readFile(new URL('src/pages/pricing.tsx', root), 'utf8');
  assert.match(pricing, /useFeatureConfig/);
  assert.match(pricing, /Payments coming soon/);
  assert.match(pricing, /searchParams\.get\('payments'\) === 'disabled'/);
  assert.match(pricing, /paymentsEnabled=\{paymentsEnabled\}/);
});

test('administration polish is loaded and removes clipped table values', async () => {
  const main = await readFile(new URL('src/main.tsx', root), 'utf8');
  const css = await readFile(new URL('src/styles/admin-polish.css', root), 'utf8');
  const table = await readFile(new URL('src/components/ui/table.tsx', root), 'utf8');

  assert.match(main, /admin-polish\.css/);
  assert.match(css, /\.admin-portal main table th/);
  assert.match(css, /\.admin-portal main table \.truncate/);
  assert.match(css, /overflow:\s*visible/);
  assert.match(css, /admin-data-table/);
  assert.match(table, /admin-table-scroll/);
  assert.match(table, /admin-data-table/);
});

test('generic operational tables display full values rather than truncating them', async () => {
  const page = await readFile(new URL('src/pages/admin/operational-section.tsx', root), 'utf8');
  assert.doesNotMatch(page, /max-w-\[260px\] truncate/);
  assert.match(page, /whitespace-normal break-words/);
  assert.match(page, /admin-table-scroll/);
  assert.match(page, /scope="col"/);
});

test('both checkout runtimes enforce the Payments feature toggle', async () => {
  const cloudflare = await readFile(new URL('functions/create-checkout-session.js', root), 'utf8');
  const server = await readFile(new URL('src/server/api/stripe/create-checkout-session/POST.ts', root), 'utf8');
  assert.match(cloudflare, /readFeatureFlag\(env\.DB, "payments", false\)/);
  assert.match(server, /paymentsAreEnabled/);
  assert.match(server, /stripe_price_personal_override/);
  assert.match(server, /validatePrice/);
});
