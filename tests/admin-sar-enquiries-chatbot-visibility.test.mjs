import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('production Admin SAR route handles list and actions', async () => {
  const source = await read('functions/api/admin/sar/[[path]].js');
  assert.match(source, /section=datarequests/);
  assert.match(source, /context\.request\.method === "GET" && !parts\.length/);
  assert.match(source, /context\.request\.method === "PATCH"/);
  assert.match(source, /generate-export/);
  assert.doesNotMatch(source, /Admin function 'sar' is not available/);
});

test('Contact Enquiries uses a dedicated Admin viewer', async () => {
  const page = await read('src/pages/admin/enquiries.tsx');
  const operational = await read('src/pages/admin/operational-section.tsx');
  const api = await read('functions/api/admin/enquiries/[[reference]].js');
  assert.match(page, /View enquiry/);
  assert.match(page, /Conversation/);
  assert.match(page, /Reply to customer/);
  assert.match(page, /Internal note/);
  assert.match(operational, /return <AdminEnquiriesPage/);
  assert.match(api, /getEnquiryThread/);
  assert.match(api, /updateEnquiryAsAdmin/);
});

test('Admin utilities remain accessible without covering page content', async () => {
  const theme = await read('src/lib/admin-theme-context.tsx');
  const layout = await read('src/components/AdminLayout.tsx');
  const css = await read('src/styles/chatbot-admin-fixes.css');
  const main = await read('src/main.tsx');
  assert.doesNotMatch(theme, /fixed bottom-20 right-4/);
  assert.doesNotMatch(theme, /Chatbot settings/);
  assert.match(layout, /AI Chatbot Control/);
  assert.match(layout, /\/admin\/ai-chatbot/);
  assert.match(layout, /Sidebar utilities/);
  assert.match(layout, /Switch Admin Portal to light mode/);
  assert.match(layout, /hidden xl:inline/);
  assert.match(css, /aria-label\$=" chat"/);
  assert.match(css, /p\.font-mono/);
  assert.match(css, /data-slot="card"/);
  assert.match(main, /chatbot-admin-fixes\.css/);
});
