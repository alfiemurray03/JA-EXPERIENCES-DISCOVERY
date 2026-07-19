import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { onRequest as supportAssistant } from '../functions/api/support-assistant.js';
import { onRequest as supportMiddleware } from '../functions/api/support/_middleware.js';

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const chatbotEntry = await readFile(new URL('../src/components/AIHelpChatbot.tsx', import.meta.url), 'utf8');
const chatbot = await readFile(new URL('../src/components/ManagedAIHelpChatbot.tsx', import.meta.url), 'utf8');
const assistantCore = await readFile(new URL('../functions/_shared/support-assistant-core.js', import.meta.url), 'utf8');
const supportBoundary = await readFile(new URL('../functions/api/support/_middleware.js', import.meta.url), 'utf8');
const supportSubmit = await readFile(new URL('../functions/api/support/[[path]].js', import.meta.url), 'utf8');

const request = (path, options = {}) => new Request(`https://japlanstudio.jagroupservices.co.uk${path}`, options);

test('managed AI Help Centre chatbot replaces the old support widget', () => {
  assert.match(app, /import AIHelpChatbot from '@\/components\/AIHelpChatbot'/);
  assert.match(app, /<AIHelpChatbot \/>/);
  assert.match(chatbotEntry, /ManagedAIHelpChatbot/);
  assert.doesNotMatch(app, /import SupportChatbot/);
});

test('chatbot performs guided self-help and Contact Enquiry escalation', () => {
  assert.match(chatbot, /STARTER_SUGGESTIONS/);
  assert.match(chatbot, /Searching the Help Centre/);
  assert.match(chatbot, /fetch\('\/api\/support-assistant'/);
  assert.match(assistantCore, /No, I still need help/);
  assert.match(chatbot, /Create an enquiry/);
  assert.match(chatbot, /fetch\('\/api\/support\/submit'/);
  assert.match(chatbot, /sessionId: sessionIdRef\.current/);
  assert.match(chatbot, /startedAt: openedAtRef\.current/);
  assert.match(chatbot, /Admin Centre’s Contact Enquiries section/);
});

test('anonymous enquiry submission bypasses only the submit middleware route', async () => {
  assert.match(supportBoundary, /isAnonymousEnquirySubmission/);
  assert.match(supportBoundary, /request\.method === "POST" && url\.pathname === "\/api\/support\/submit"/);
  assert.match(supportBoundary, /!identity && !publicSubmission/);
  assert.match(supportBoundary, /Please sign in to use customer support/);

  const publicResponse = await supportMiddleware({
    request: request('/api/support/submit', {
      method: 'POST',
      headers: { Origin: 'https://japlanstudio.jagroupservices.co.uk' },
    }),
    env: {},
    next: async () => new Response(JSON.stringify({ success: true }), { status: 200 }),
  });
  assert.equal(publicResponse.status, 200);
});

test('anonymous escalation is stored in Contact Enquiries and linked to its conversation', () => {
  const submitPosition = supportSubmit.indexOf('parts[0] === "submit"');
  const authPosition = supportSubmit.indexOf('if (!identity.email)');
  assert.ok(submitPosition > -1 && authPosition > submitPosition);
  assert.match(supportSubmit, /storeEnquiry\(env\.DB, enquiry, request\)/);
  assert.match(supportSubmit, /markConversationEscalated/);
  assert.match(supportSubmit, /enquiryType: "AI Help Centre escalation"/);
  assert.match(supportSubmit, /adminPath: `\/admin\/enquiries\?reference=/);
});

test('built-in assistant answers anonymously without an AI binding', async () => {
  const response = await supportAssistant({
    request: request('/api/support-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'anonymous-test', message: 'My builder will not save or preview my plan', history: [] }),
    }),
    env: {},
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.source, 'built_in');
  assert.match(data.reply, /Refresh|builder|save/i);
  assert.ok(Array.isArray(data.suggestions));
});

test('assistant offers enquiry escalation when self-help did not work', async () => {
  const response = await supportAssistant({
    request: request('/api/support-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'escalation-test',
        message: 'No, it still did not work and I need a person',
        history: [{ role: 'user', content: 'My builder is not working' }],
      }),
    }),
    env: {},
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.escalate, true);
  assert.ok(data.suggestions.includes('Create an enquiry'));
});
