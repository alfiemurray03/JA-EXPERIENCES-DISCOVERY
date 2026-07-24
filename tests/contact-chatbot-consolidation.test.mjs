import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = path => readFile(new URL(path, root), 'utf8');

test('AI Chatbot Contact page tab owns contact availability and maintenance controls', async () => {
  const chatbot = await source('src/pages/admin/AIChatbotControlCenter.tsx');
  const siteSettings = await source('src/pages/admin/site-settings.tsx');

  for (const key of [
    'contact_page_status',
    'contact_maintenance_title',
    'contact_maintenance_reason',
    'contact_maintenance_message',
    'contact_maintenance_start',
    'contact_maintenance_expected_return',
    'contact_offline_message',
  ]) {
    assert.match(chatbot, new RegExp(key));
  }

  assert.match(chatbot, /Contact Us page status/);
  assert.match(chatbot, /Preview maintenance/);
  assert.match(chatbot, /Preview offline/);
  assert.match(chatbot, /Route diagnostic/);
  assert.doesNotMatch(siteSettings, /<h3[^>]*>Contact Us page status<\/h3>/);
});

test('Cloudflare routing consumes the same contact status settings', async () => {
  const middleware = await source('functions/_middleware.js');

  assert.match(middleware, /contact_page_status/);
  assert.match(middleware, /contact_maintenance_title/);
  assert.match(middleware, /contact_offline_message/);
  assert.match(middleware, /path === "\/contact"/);
});
