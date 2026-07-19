import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { onRequest as supportAssistant } from '../functions/api/support-assistant.js';

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const routes = await readFile(new URL('../src/routes.tsx', import.meta.url), 'utf8');
const chatbot = await readFile(new URL('../src/components/AIHelpChatbot.tsx', import.meta.url), 'utf8');
const helpCentre = await readFile(new URL('../src/pages/help-centre.tsx', import.meta.url), 'utf8');
const adminSettings = await readFile(new URL('../src/pages/admin/ai-chatbot.tsx', import.meta.url), 'utf8');
const adminDashboard = await readFile(new URL('../src/pages/admin/dashboard.tsx', import.meta.url), 'utf8');
const supportSubmit = await readFile(new URL('../functions/api/support/[[path]].js', import.meta.url), 'utf8');
const assistantRoute = await readFile(new URL('../functions/api/support-assistant.js', import.meta.url), 'utf8');

test('AI Help Centre chatbot replaces the old global support widget', () => {
  assert.match(app, /import AIHelpChatbot from '@\/components\/AIHelpChatbot'/);
  assert.match(app, /<AIHelpChatbot \/>/);
  assert.doesNotMatch(app, /import SupportChatbot/);
});

test('Help Centre is public at both support URLs', () => {
  assert.match(app, /const PublicHelpCentrePage = lazy/);
  assert.match(app, /path: '\/support', element: <PublicHelpCentrePage \/>/);
  assert.match(app, /path: '\/help-centre', element: <PublicHelpCentrePage \/>/);
  assert.match(app, /'\/support', '\/help-centre'/);
  assert.match(helpCentre, /available without signing in/i);
  assert.match(helpCentre, /fetch\('\/api\/support-assistant'/);
});

test('chatbot asks guided questions and searches Help Centre guidance', () => {
  assert.match(chatbot, /STARTER_SUGGESTIONS/);
  assert.match(chatbot, /Searching the Help Centre/);
  assert.match(chatbot, /fetch\('\/api\/support-assistant'/);
  assert.match(chatbot, /Did this solve the problem|No, I still need help/);
  assert.match(chatbot, /Create an enquiry/);
  assert.match(chatbot, /AI answers may be checked before acting/);
});

test('signed-out visitors have a complete enquiry form with visible validation', () => {
  assert.match(chatbot, /id="ai-enquiry-name"/);
  assert.match(chatbot, /id="ai-enquiry-email"/);
  assert.match(chatbot, /id="ai-enquiry-subject"/);
  assert.match(chatbot, /id="ai-enquiry-message"/);
  assert.match(chatbot, /Enter a subject of at least 3 characters/);
  assert.match(chatbot, /Please give at least 10 characters of detail/);
  assert.match(chatbot, /disabled=\{submitting\}/);
  assert.match(chatbot, /The button remains available/);
  assert.match(chatbot, /termsAccepted: true/);
  assert.match(chatbot, /privacyAccepted: true/);
  assert.match(chatbot, /startedAt: openedAtRef\.current/);
  assert.match(chatbot, /fetch\('\/api\/support\/submit'/);
});

test('enquiry submission is handled before authentication and stored as Contact Enquiry', () => {
  const submitPosition = supportSubmit.indexOf('parts[0] === "submit"');
  const authPosition = supportSubmit.indexOf('if (!identity.email)');
  assert.ok(submitPosition > -1 && authPosition > submitPosition, 'anonymous submission must run before support-history authentication');
  assert.match(supportSubmit, /storeEnquiry\(env\.DB, enquiry, request\)/);
  assert.match(supportSubmit, /enquiryType: "AI Help Centre escalation"/);
  assert.match(supportSubmit, /adminPath: `\/admin\/enquiries\?reference=/);
  assert.match(supportSubmit, /startedAt:/);
  assert.match(chatbot, /Admin Centre’s Contact Enquiries section/);
  assert.match(chatbot, /ENQ reference/);
});

test('assistant supports Admin-managed built-in help and optional Workers AI fallback', () => {
  assert.match(assistantRoute, /ai_chatbot_allow_anonymous/);
  assert.match(assistantRoute, /builtInAnswer/);
  assert.match(assistantRoute, /workersAiAnswer/);
  assert.match(assistantRoute, /env\.AI\.run/);
  assert.match(assistantRoute, /if \(!result\)/);
  assert.match(assistantRoute, /support_ai_messages/);
  assert.match(assistantRoute, /articles: articles\.map/);
  assert.match(assistantRoute, /Do not invent account, billing, legal/);
});

test('built-in assistant answers anonymously without an AI binding', async () => {
  const response = await supportAssistant({
    request: new Request('https://japlanstudio.jagroupservices.co.uk/api/support-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'anonymous-test',
        message: 'My builder will not save or preview my plan',
        history: [],
      }),
    }),
    env: {},
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.source, 'built_in');
  assert.match(data.reply, /Refresh the page|Explore Builders|save/i);
  assert.ok(Array.isArray(data.suggestions));
});

test('assistant offers Contact Enquiry escalation when self-help did not work', async () => {
  const response = await supportAssistant({
    request: new Request('https://japlanstudio.jagroupservices.co.uk/api/support-assistant', {
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

test('Admin Centre has protected AI Chatbot Settings and knowledge controls', () => {
  assert.match(routes, /path: '\/admin\/ai-chatbot'/);
  assert.match(routes, /<RequireAdmin><AdminAIChatbotPage \/><\/RequireAdmin>/);
  assert.match(adminDashboard, /to: '\/admin\/ai-chatbot'/);
  assert.match(adminSettings, /AI Chatbot Settings/);
  assert.match(adminSettings, /ai_chatbot_enabled/);
  assert.match(adminSettings, /ai_chatbot_allow_anonymous/);
  assert.match(adminSettings, /ai_chatbot_self_help_enabled/);
  assert.match(adminSettings, /ai_chatbot_escalation_enabled/);
  assert.match(adminSettings, /ai_chatbot_provider/);
  assert.match(adminSettings, /ai_chatbot_model/);
  assert.match(adminSettings, /ai_chatbot_knowledge_json/);
  assert.match(adminSettings, /Add answer/);
  assert.match(adminSettings, /Test the live assistant/);
});
