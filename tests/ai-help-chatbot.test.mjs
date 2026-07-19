import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { onRequest as supportAssistant } from '../functions/api/support-assistant.js';
import { onRequest as supportMiddleware } from '../functions/api/support/_middleware.js';
import { configFrom } from '../functions/_shared/support-assistant-core.js';

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const routes = await readFile(new URL('../src/routes.tsx', import.meta.url), 'utf8');
const chatbotEntry = await readFile(new URL('../src/components/AIHelpChatbot.tsx', import.meta.url), 'utf8');
const chatbot = await readFile(new URL('../src/components/ManagedAIHelpChatbot.tsx', import.meta.url), 'utf8');
const helpCentre = await readFile(new URL('../src/pages/help-centre.tsx', import.meta.url), 'utf8');
const adminEntry = await readFile(new URL('../src/pages/admin/ai-chatbot.tsx', import.meta.url), 'utf8');
const adminControl = await readFile(new URL('../src/pages/admin/AIChatbotControlCenter.tsx', import.meta.url), 'utf8');
const adminDashboard = await readFile(new URL('../src/pages/admin/dashboard.tsx', import.meta.url), 'utf8');
const supportSubmit = await readFile(new URL('../functions/api/support/[[path]].js', import.meta.url), 'utf8');
const supportBoundary = await readFile(new URL('../functions/api/support/_middleware.js', import.meta.url), 'utf8');
const assistantRoute = await readFile(new URL('../functions/api/support-assistant.js', import.meta.url), 'utf8');
const assistantCore = await readFile(new URL('../functions/_shared/support-assistant-core.js', import.meta.url), 'utf8');
const assistantMonitor = await readFile(new URL('../functions/_shared/support-assistant-monitor.js', import.meta.url), 'utf8');
const adminMonitor = await readFile(new URL('../functions/api/admin/support-assistant/[[path]].js', import.meta.url), 'utf8');

const request = (path, options = {}) => new Request(`https://japlanstudio.jagroupservices.co.uk${path}`, options);

test('managed AI Help Centre chatbot replaces the old support widget', () => {
  assert.match(app, /import AIHelpChatbot from '@\/components\/AIHelpChatbot'/);
  assert.match(app, /<AIHelpChatbot \/>/);
  assert.match(chatbotEntry, /ManagedAIHelpChatbot/);
  assert.doesNotMatch(app, /import SupportChatbot/);
});

test('Help Centre remains public for signed-in and signed-out visitors', () => {
  assert.match(app, /const PublicHelpCentrePage = lazy/);
  assert.match(app, /path: '\/support', element: <PublicHelpCentrePage \/>/);
  assert.match(app, /path: '\/help-centre', element: <PublicHelpCentrePage \/>/);
  assert.match(helpCentre, /available without signing in/i);
  assert.match(helpCentre, /fetch\('\/api\/support-assistant'/);
});

test('chatbot performs guided self-help and Contact Enquiry escalation', () => {
  assert.match(chatbot, /STARTER_SUGGESTIONS/);
  assert.match(chatbot, /Searching the Help Centre/);
  assert.match(chatbot, /fetch\('\/api\/support-assistant'/);
  assert.match(chatbot, /No, I still need help/);
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
  assert.match(supportBoundary, /Please sign in to view customer support conversations/);

  const publicResponse = await supportMiddleware({
    request: request('/api/support/submit', {
      method: 'POST',
      headers: { Origin: 'https://japlanstudio.jagroupservices.co.uk' },
    }),
    env: {},
    next: async () => new Response(JSON.stringify({ success: true }), { status: 200 }),
  });
  assert.equal(publicResponse.status, 200);

  const protectedResponse = await supportMiddleware({
    request: request('/api/support/tickets', {
      method: 'GET',
      headers: { Origin: 'https://japlanstudio.jagroupservices.co.uk' },
    }),
    env: {},
    next: async () => new Response('unexpected', { status: 200 }),
  });
  assert.equal(protectedResponse.status, 401);
});

test('anonymous escalation is stored in canonical Contact Enquiries and linked to the conversation', () => {
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

test('maintenance, debugging and design settings are parsed by the runtime', () => {
  const config = configFrom({
    ai_chatbot_maintenance_enabled: 'true',
    ai_chatbot_debug_enabled: 'true',
    ai_chatbot_position: 'bottom-left',
    ai_chatbot_primary_color: '#123456',
    ai_chatbot_panel_width: '500',
    ai_chatbot_auto_open_delay_seconds: '20',
  });
  assert.equal(config.maintenanceEnabled, true);
  assert.equal(config.debugEnabled, true);
  assert.equal(config.position, 'bottom-left');
  assert.equal(config.primaryColor, '#123456');
  assert.equal(config.panelWidth, 500);
  assert.equal(config.autoOpenDelaySeconds, 20);
  assert.match(assistantRoute, /config\.maintenanceEnabled/);
  assert.match(assistantRoute, /recordAssistantEvent/);
  assert.match(assistantRoute, /recordAssistantExchange/);
  assert.match(assistantCore, /workersAiAnswer/);
});

test('conversation monitoring stores transcripts, status and enquiry references', () => {
  assert.match(assistantMonitor, /support_ai_conversations/);
  assert.match(assistantMonitor, /support_ai_messages/);
  assert.match(assistantMonitor, /visitor_type/);
  assert.match(assistantMonitor, /status='escalated'/);
  assert.match(assistantMonitor, /enquiry_reference/);
  assert.match(adminMonitor, /getNativeSession\(request, env, "admin"\)/);
  assert.match(adminMonitor, /SELECT \* FROM support_ai_conversations/);
  assert.match(adminMonitor, /purge_abandoned/);
  assert.match(adminMonitor, /workersAiBinding/);
});

test('Admin Centre provides full chatbot control and monitoring', () => {
  assert.match(routes, /path: '\/admin\/ai-chatbot'/);
  assert.match(routes, /<RequireAdmin><AdminAIChatbotPage \/><\/RequireAdmin>/);
  assert.match(adminDashboard, /to: '\/admin\/ai-chatbot'/);
  assert.match(adminEntry, /AIChatbotControlCenter/);
  assert.match(adminControl, /AI Chatbot Control Centre/);
  assert.match(adminControl, /Maintenance mode/);
  assert.match(adminControl, /Debug logging/);
  assert.match(adminControl, /Anonymous visitors/);
  assert.match(adminControl, /Widget appearance/);
  assert.match(adminControl, /Conversation monitor/);
  assert.match(adminControl, /Runtime diagnostics/);
  assert.match(adminControl, /ai_chatbot_maintenance_enabled/);
  assert.match(adminControl, /ai_chatbot_primary_color/);
  assert.match(adminControl, /ai_chatbot_knowledge_json/);
  assert.match(adminControl, /\/api\/admin\/support-assistant/);
});
