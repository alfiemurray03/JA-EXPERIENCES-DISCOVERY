import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { configFrom } from '../functions/_shared/support-assistant-core.js';

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const routes = await readFile(new URL('../src/routes.tsx', import.meta.url), 'utf8');
const helpCentre = await readFile(new URL('../src/pages/help-centre.tsx', import.meta.url), 'utf8');
const adminEntry = await readFile(new URL('../src/pages/admin/ai-chatbot.tsx', import.meta.url), 'utf8');
const adminControl = await readFile(new URL('../src/pages/admin/AIChatbotControlCenter.tsx', import.meta.url), 'utf8');
const adminDashboard = await readFile(new URL('../src/pages/admin/dashboard.tsx', import.meta.url), 'utf8');
const assistantRoute = await readFile(new URL('../functions/api/support-assistant.js', import.meta.url), 'utf8');
const assistantCore = await readFile(new URL('../functions/_shared/support-assistant-core.js', import.meta.url), 'utf8');
const assistantMonitor = await readFile(new URL('../functions/_shared/support-assistant-monitor.js', import.meta.url), 'utf8');
const adminMonitor = await readFile(new URL('../functions/api/admin/support-assistant/[[path]].js', import.meta.url), 'utf8');

test('Help Centre remains public for signed-in and signed-out visitors', () => {
  assert.match(app, /const PublicHelpCentrePage = lazy/);
  assert.match(app, /path: '\/support', element: <PublicHelpCentrePage \/>/);
  assert.match(app, /path: '\/help-centre', element: <PublicHelpCentrePage \/>/);
  assert.match(helpCentre, /available without signing in/i);
  assert.match(helpCentre, /fetch\('\/api\/support-assistant'/);
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


test('Admin chatbot control centre manages webhook slots, scheduled maintenance and branding', () => {
  assert.match(adminControl, /Integrations/);
  assert.match(adminControl, /Microsoft Teams Support/);
  assert.match(adminControl, /SUPPORT_WEBHOOK_2_URL/);
  assert.match(adminControl, /SUPPORT_WEBHOOK_3_URL/);
  assert.match(adminControl, /SUPPORT_WEBHOOK_4_URL/);
  assert.match(adminControl, /Send test/);
  assert.match(adminControl, /Scheduled start/);
  assert.match(adminControl, /Scheduled end/);
  assert.doesNotMatch(adminControl, /Allow enquiries during maintenance/);
  assert.match(adminControl, /Customer contact is locked during maintenance/);
  assert.match(adminControl, /Times New Roman/);
  assert.match(adminControl, /Atkinson Hyperlegible/);
  assert.match(adminControl, /fetch\('\/api\/support-assistant'/);
  assert.match(adminControl, /Launcher logo URL/);
  assert.match(adminControl, /Assistant avatar URL/);
  assert.match(adminControl, /Chatbot font/);
  assert.match(adminMonitor, /test_webhook/);
  assert.match(adminMonitor, /TEAMS_SUPPORT_WEBHOOK_URL/);
  assert.match(adminMonitor, /permittedWebhook/);
});


test('Admin Centre exposes the expanded support knowledge and affiliate controls', () => {
  assert.match(assistantCore, /EXPANDED_DEFAULT_ARTICLES/);
  assert.match(adminControl, /loaded\.knowledge = assistantData\.articles/);
  assert.match(adminControl, /Customer contact is locked during maintenance/);
  assert.match(adminControl, /Configured start and end times are shown to visitors/);
});
