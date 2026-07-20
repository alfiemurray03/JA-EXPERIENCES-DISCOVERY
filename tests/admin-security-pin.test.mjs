import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('administrator PIN is a Microsoft-bound, hashed step-up session', async () => {
  const endpoint = await read('functions/api/admin/auth/admin-pin.js');
  assert.match(endpoint, /getNativeSession\(context\.request, context\.env, "admin"\)/);
  assert.match(endpoint, /PBKDF2/);
  assert.match(endpoint, /iterations: 210000/);
  assert.doesNotMatch(endpoint, /pin\s+TEXT/);
  assert.match(endpoint, /MAX_ATTEMPTS = 5/);
  assert.match(endpoint, /locked for 15 minutes/);
  assert.match(endpoint, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(endpoint, /admin_pin_verification_failed/);
  assert.match(endpoint, /admin_pin_verified/);
});

test('Admin Portal blocks page content until the individual PIN is verified', async () => {
  const layout = await read('src/components/AdminLayout.tsx');
  assert.match(layout, /\/api\/admin\/auth\/admin-pin/);
  assert.match(layout, /Create your personal four-digit PIN/);
  assert.match(layout, /Your administrator PIN session expired/);
  assert.match(layout, /if \(!pinState\.unlocked\)/);
});

test('customer CRM override requires active admin PIN and an audited reason', async () => {
  const api = await read('functions/admin/api.js');
  const crm = await read('src/pages/admin/customer-crm.tsx');
  assert.match(api, /hasActiveAdminPinSession/);
  assert.match(api, /body\.action === "admin_pin_override"/);
  assert.match(api, /reason\.length < 8/);
  assert.match(api, /customer_admin_pin_override/);
  assert.match(crm, /Administrator PIN override/);
  assert.match(crm, /reason and access are permanently audited/);
  assert.match(crm, /action: 'admin_pin_override'/);
});
