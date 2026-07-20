import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Admin sign out uses only the Admin Microsoft logout route', async () => {
  const [context, route] = await Promise.all([
    read('src/lib/admin-context.tsx'),
    read('functions/admin/logout.js'),
  ]);

  assert.match(context, /location\.replace\('\/admin\/logout'\)/);
  assert.match(context, /setTimeout/);
  assert.doesNotMatch(context, /api\/admin\/auth\/logout/);
  assert.doesNotMatch(context, /account\/logout/);
  assert.match(route, /nativeLogout\(context,\s*["']admin["']/);
  assert.doesNotMatch(route, /customer/);
});

test('customer sign out uses only the customer External ID logout route', async () => {
  const [context, route] = await Promise.all([
    read('src/lib/auth-context.tsx'),
    read('functions/account/logout.js'),
  ]);

  assert.match(context, /location\.replace\('\/account\/logout'\)/);
  assert.match(context, /setTimeout/);
  assert.doesNotMatch(context, /admin\/logout/);
  assert.match(route, /nativeLogout\(context,\s*["']customer["']/);
  assert.match(route, /ja_customer_session/);
  assert.doesNotMatch(route, /ja_admin_session/);
});

test('Microsoft logout uses distinct realm cookies, tables and return paths', async () => {
  const source = await read('functions/_shared/oidc.js');
  assert.match(source, /admin:[\s\S]*cookie:\s*["']ja_admin_session["'][\s\S]*sessionTable:\s*["']admin_oidc_sessions["']/);
  assert.match(source, /customer:[\s\S]*cookie:\s*["']ja_customer_oidc_session["'][\s\S]*sessionTable:\s*["']customer_oidc_sessions["']/);
  assert.match(source, /signed-out\/\$\{realm\}\//);
  assert.match(source, /end_session_endpoint/);
});

test('Admin Microsoft sign-out returns automatically to the Admin Centre landing page', async () => {
  const source = await read('functions/signed-out/[[realm]].js');
  assert.match(source, /if \(realm === "admin"\)/);
  assert.match(source, /Location: new URL\("\/admin", context\.request\.url\)\.toString\(\)/);
  assert.match(source, /status: 302/);
  assert.match(source, /Admin Portal session in this browser has not been changed/);
  assert.match(source, /Return to customer sign in/);
});
