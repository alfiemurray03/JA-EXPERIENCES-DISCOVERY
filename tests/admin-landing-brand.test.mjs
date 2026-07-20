import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Admin landing page is branded for JA Plan Studio operations', async () => {
  const page = await read('src/pages/admin/login.tsx');
  assert.match(page, /JA Plan Studio/);
  assert.match(page, /Admin Centre/);
  assert.match(page, /Planning platform operations/);
  assert.match(page, /Experience builders/);
  assert.match(page, /Customer CRM/);
  assert.match(page, /Plans and billing/);
  assert.match(page, /AI support assistant/);
  assert.match(page, /Continue with Microsoft/);
  assert.match(page, /four-digit Admin PIN is requested next/);
  assert.doesNotMatch(page, /document activity/i);
  assert.doesNotMatch(page, /Document Hub/i);
});
