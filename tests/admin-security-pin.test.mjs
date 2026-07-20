import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('administrator CRM override PIN uses a correctly delimited HMAC and an audited session', async () => {
  const endpoint = await read('functions/admin/api.js');
  assert.match(endpoint, /adminPinStatus/);
  assert.match(endpoint, /adminPinMac/);
  assert.match(endpoint, /\["hmac_sha256", salt, await adminPinMac\(env, pin, salt\)\]\.join\("\\$"\)/);
  assert.match(endpoint, /function parseAdminPinHash/);
  assert.match(endpoint, /parsedHash\?\.legacy/);
  assert.match(endpoint, /normalisedHash/);
  assert.doesNotMatch(endpoint, /const pinHash = `hmac_sha256\$\{salt\}/);
  assert.doesNotMatch(endpoint, /pin\s+TEXT/);
  assert.match(endpoint, /ADMIN_OIDC_CLIENT_SECRET/);
  assert.match(endpoint, /attempts >= 5/);
  assert.match(endpoint, /locked for 15 minutes/);
  assert.match(endpoint, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(endpoint, /admin_pin_verification_failed/);
  assert.match(endpoint, /admin_pin_verified/);
});

test('Admin Portal requires the personal PIN after Microsoft authentication', async () => {
  const layout = await read('src/components/AdminLayout.tsx');
  assert.match(layout, /if \(!pinState\.unlocked\)/);
  assert.match(layout, /Enter your personal four-digit PIN to continue after Microsoft sign-in/);
  assert.match(layout, /Create your personal four-digit PIN/);
  assert.match(layout, /\/admin\/api\?section=adminpin/);
  assert.doesNotMatch(layout, /false && !pinState\.unlocked/);
});

test('customer Support PIN is the initial CRM tab and administrator override verifies inline', async () => {
  const api = await read('functions/admin/api.js');
  const crm = await read('src/pages/admin/customer-crm.tsx');
  assert.match(api, /body\.action === "admin_pin_override"/);
  assert.match(api, /reason\.length < 4/);
  assert.match(api, /customer_admin_pin_override/);
  assert.match(crm, /defaultValue=\{data\.verification\?\.verified \? "overview" : "security"\}/);
  assert.match(crm, /Administrator CRM override/);
  assert.match(crm, /Administrator CRM override PIN/);
  assert.match(crm, /\/admin\/api\?section=adminpin/);
  assert.match(crm, /action: 'admin_pin_override'/);
  assert.match(crm, /overrideReason\.trim\(\)\.length < 4/);
});

test('Security Centre lets each administrator create or replace their CRM override PIN', async () => {
  const security = await read('src/pages/admin/security.tsx');
  assert.match(security, /Administrator CRM override PIN/);
  assert.match(security, /action: directorPinStatus\.configured \? 'reset' : 'setup'/);
  assert.match(security, /every administrator/);
  assert.match(security, /It never controls Admin Portal sign-in/);
});


test('all Microsoft-authorised admins can use their own CRM PIN without a role gate', async () => {
  const api = await read('functions/admin/api.js');
  assert.match(api, /eligible: true/);
  assert.doesNotMatch(api, /Director access is required to use a CRM override PIN/);
  assert.doesNotMatch(api, /Director access is required for a CRM override/);
  assert.match(api, /action === "setup" \|\| action === "reset"/);
});
