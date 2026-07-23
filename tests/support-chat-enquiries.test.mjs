import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { onRequest as redirectLegacyAdminEnquiry } from '../functions/admin/index.js';

const chatbot = await readFile(new URL('../src/components/SupportChatbot.tsx', import.meta.url), 'utf8');
const supportRoute = await readFile(new URL('../functions/api/support/[[path]].js', import.meta.url), 'utf8');
const adminSection = await readFile(new URL('../src/pages/admin/operational-section.tsx', import.meta.url), 'utf8');

test('support assistant is fully visible and uses explicit readable colours', () => {
  assert.match(chatbot, /h-\[calc\(100dvh-6rem\)\]/);
  assert.match(chatbot, /max-h-\[620px\]/);
  assert.match(chatbot, /bg-white text-slate-950/);
  assert.match(chatbot, /\[color-scheme:light\]/);
  assert.match(chatbot, /text-slate-900 placeholder:text-slate-400/);
  assert.doesNotMatch(chatbot, /bg-white text-foreground/);
});

test('anonymous and signed-in support submissions use the Contact Enquiries workflow', () => {
  assert.equal((chatbot.match(/fetch\('\/api\/support\/submit'/g) || []).length, 2);
  assert.match(chatbot, /termsAccepted: newConsent/);
  assert.match(chatbot, /privacyAccepted: newConsent/);
  assert.match(chatbot, /termsAccepted: anonConsent/);
  assert.match(chatbot, /privacyAccepted: anonConsent/);
  assert.match(chatbot, /Planyx Support Team/);
  assert.match(chatbot, /Reference \{anonReference\}/);

  assert.match(supportRoute, /storeEnquiry\(env\.DB, enquiry, request\)/);
  assert.match(supportRoute, /category: "Technical Support"/);
  assert.match(supportRoute, /formType: "Support Chat"/);
  assert.match(supportRoute, /source: "Support Chat"/);
  assert.match(supportRoute, /adminPath: `\/admin\/enquiries\?reference=/);
  assert.match(supportRoute, /if \(request\.method === "POST" && parts\[0\] === "submit"\)/);

  const submitPosition = supportRoute.indexOf('parts[0] === "submit"');
  const authPosition = supportRoute.indexOf('if (!identity.email)');
  assert.ok(submitPosition > -1 && authPosition > submitPosition, 'anonymous submit must be handled before authenticated ticket history');
});

test('Admin Contact Enquiries explains and highlights support assistant records', () => {
  assert.match(adminSection, /Support assistant enquiries arrive here/);
  assert.match(adminSection, /new URLSearchParams\(location\.search\)\.get\('reference'\)/);
  assert.match(adminSection, /id=\{highlighted \? 'requested-enquiry'/);
  assert.match(adminSection, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
});

test('legacy Admin enquiry links redirect to the actual Contact Enquiries route', async () => {
  let nextCalled = false;
  const response = await redirectLegacyAdminEnquiry({
    request: new Request('https://japlanstudio.jagroupservices.co.uk/admin/?section=enquiries&reference=ENQ-20260718-000001'),
    next() {
      nextCalled = true;
      return new Response('next');
    },
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin/enquiries?reference=ENQ-20260718-000001');
  assert.equal(nextCalled, false);

  const passthrough = await redirectLegacyAdminEnquiry({
    request: new Request('https://japlanstudio.jagroupservices.co.uk/admin/'),
    next() {
      nextCalled = true;
      return new Response('next');
    },
  });
  assert.equal(await passthrough.text(), 'next');
  assert.equal(nextCalled, true);
});
