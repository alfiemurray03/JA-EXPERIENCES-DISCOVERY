import test from 'node:test';
import assert from 'node:assert/strict';
import { guidedEscalation } from '../functions/_shared/support-assistant-triage.js';

const config = { escalationEnabled: true };

function exchange(question, answer) {
  return [
    { role: 'assistant', content: question },
    { role: 'user', content: answer },
  ];
}

test('starts a natural account conversation after unresolved sign-in help', () => {
  const result = guidedEscalation(config, 'No, I still cannot sign in', [
    { role: 'user', content: 'My Microsoft login is not working' },
    { role: 'assistant', content: 'Try signing in again. Did this solve the problem?' },
  ]);
  assert.equal(result.source, 'guided_triage');
  assert.equal(result.category, 'Technical Support');
  assert.match(result.reply, /I’ll ask a few questions/);
  assert.match(result.reply, /Which sign-in option are you using/);
  assert.match(result.reply, /\n\nWhich sign-in option/);
  assert.doesNotMatch(result.reply, /\\\\n/);
  assert.doesNotMatch(result.reply, /\b(?:check|question)\s+\d+\s+of\s+\d+/i);
  assert.equal(result.escalate, false);
});

test('asks normal billing questions in sequence and excludes sensitive payment details', () => {
  const firstQuestion = 'Which subscription plan or payment do you need help with?';
  const history = [
    { role: 'user', content: 'I was charged for my subscription' },
    ...exchange(firstQuestion, 'Professional plan'),
  ];
  const result = guidedEscalation(config, 'Professional plan', history);
  assert.match(result.reply, /Was a payment taken/);
  assert.match(result.reply, /Do not send any card details/);
  assert.doesNotMatch(result.reply, /\d+ of \d+/);
});

test('asks for confirmation before submitting to the support team', () => {
  const history = [
    { role: 'user', content: 'My account is locked and I cannot access my paid plan' },
    ...exchange('Which sign-in option are you using for your Planyx account?', 'Microsoft sign-in'),
    ...exchange('What happens when you try to sign in? If you see an error message, please tell me exactly what it says.', 'It says account unavailable'),
    ...exchange('What device and browser are you using?', 'iPhone Safari'),
    ...exchange('When did this start, and does it happen every time you try?', 'Since today, every time'),
  ];
  const confirmation = guidedEscalation(config, 'Since today, every time', history);
  assert.equal(confirmation.escalate, false);
  assert.match(confirmation.reply, /Would you like me to send this conversation to the support team\?/);
  assert.deepEqual(confirmation.suggestions, ['Yes, send it to the support team', 'No, keep helping me']);

  const confirmed = guidedEscalation(config, 'Yes, please', [...history, { role: 'assistant', content: confirmation.reply }, { role: 'user', content: 'Yes, please' }]);
  assert.equal(confirmed.escalate, true);
  assert.equal(confirmed.priority, 'High');
  assert.equal(confirmed.suggestedSubject, '[High] Account or sign-in support request');
  assert.match(confirmed.reply, /sending the conversation to the support team now/);
  assert.match(confirmed.reply, /enquiry reference/);

  const declined = guidedEscalation(config, 'No, keep helping me', [...history, { role: 'assistant', content: confirmation.reply }, { role: 'user', content: 'No, keep helping me' }]);
  assert.equal(declined.escalate, false);
  assert.match(declined.reply, /I haven’t sent anything/);
});

test('routes privacy concerns using conversational British English', () => {
  const result = guidedEscalation(config, 'I need a human to help delete my personal data', []);
  assert.equal(result.category, 'Data Protection');
  assert.match(result.reply, /accessing, correcting or deleting your information/);
  assert.match(result.reply, /Please don’t send passwords/);
});

test('does not intercept ordinary self-help questions', () => {
  assert.equal(guidedEscalation(config, 'How do I create a plan?', []), null);
});
