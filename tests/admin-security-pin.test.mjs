import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('director CRM override PIN uses a correctly delimited HMAC and an audited session', async () => {
  const endpoint = await read('functions/admin/api.js');
  assert.match(endpoint, /adminPinStatus/);
  assert.match(endpoint, /adminPinMac/);
  assert.match(endpoint, /hmac_sha256\$\$\{salt\}\$\$\{await adminPinMac/);
  assert.doesNotMatch(endpoint, /pin\s+TEXT/);
  assert.match(endpoint, /ADMIN_OIDC_CLIENT_SECRET/);
  assert.match(endpoint, /attempts >= 5/);
  assert.match(endpoint, /locked for 15 minutes/);
  assert.match(endpoint, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(endpoint, /admin_pin_verification_failed/);
  assert.match(endpoint, /admin_pin_verified/);
});

test('Admin Portal is never blocked by the CRM override PIN', async () => {
  const layout = await read('src/components/AdminLayout.tsx');
  assert.doesNotMatch(layout, /if \(!pinState\.unlocked\)/);
  assert.doesNotMatch(layout, /Create your personal four-digit PIN/);
});

test('customer Support PIN is the initial CRM tab and director override verifies inline', async () => {
  const api = await read('functions/admin/api.js');
  const crm = await read('src/pages/admin/customer-crm.tsx');
  assert.match(api, /isSupervisorContext\(adminContext\)/);
  assert.match(api, /body\.action === "admin_pin_override"/);
  assert.match(api, /reason\.length < 4/);
  assert.match(api, /customer_admin_pin_override/);
  assert.match(crm, /defaultValue=\{data\.verification\?\.verified \? "overview" : "security"\}/);
  assert.match(crm, /Director CRM override/);
  assert.match(crm, /Director CRM override PIN/);
  assert.match(crm, /\/admin\/api\?section=adminpin/);
  assert.match(crm, /action: 'admin_pin_override'/);
  assert.match(crm, /overrideReason\.trim\(\)\.length < 4/);
});

test('Security Centre lets each director create or replace their CRM override PIN', async () => {
  const security = await read('src/pages/admin/security.tsx');
  assert.match(security, /Director CRM override PIN/);
  assert.match(security, /action: directorPinStatus\.configured \? 'reset' : 'setup'/);
  assert.match(security, /It never controls Admin Portal sign-in/);
});
