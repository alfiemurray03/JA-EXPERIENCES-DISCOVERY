import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Admin landing page is branded for Planyx operations', async () => {
  const page = await read('src/pages/admin/login.tsx');
  assert.match(page, /Planyx/);
  assert.match(page, /Admin Centre/);
  assert.match(page, /Planning platform operations/);
  assert.match(page, /Experience builders/);
  assert.match(page, /Customer CRM/);
  assert.match(page, /Plans and billing/);
  assert.match(page, /AI support assistant/);
  assert.match(page, /Continue with Microsoft/);
  assert.match(page, /four-digit Admin PIN is requested next/);
  assert.match(page, /import SiteNavHeader/);
  assert.match(page, /import Footer/);
  assert.match(page, /<SiteNavHeader \/>/);
  assert.match(page, /<Footer \/>/);
  assert.match(page, /dark:bg/);
  assert.match(page, /!text-black/);
  assert.doesNotMatch(page, /text-6xl/);
  assert.doesNotMatch(page, /document activity/i);
  assert.doesNotMatch(page, /Document Hub/i);
  assert.doesNotMatch(page, /Go to customer sign-in/);
});


test('Admin landing HTML cannot remain stale at the Cloudflare edge', async () => {
  const headers = await read('public/_headers');
  assert.match(headers, /\/admin\/\*/);
  assert.match(headers, /no-store, no-cache, must-revalidate/);
  assert.match(headers, /\/index\.html/);
});
