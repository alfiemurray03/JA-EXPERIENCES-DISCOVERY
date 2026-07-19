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

test('starts account triage after unresolved sign-in help', () => {
  const result = guidedEscalation(config, 'No, I still cannot sign in', [
    { role: 'user', content: 'My Microsoft login is not working' },
    { role: 'assistant', content: 'Try signing in again. Did this solve the problem?' },
  ]);
  assert.equal(result.source, 'guided_triage');
  assert.equal(result.category, 'Technical Support');
  assert.match(result.reply, /Escalation check 1 of 4/);
  assert.match(result.reply, /customer account or the Admin Centre/);
  assert.equal(result.escalate, false);
});

test('asks billing questions in sequence and excludes sensitive payment details', () => {
  const history = [
    { role: 'user', content: 'I was charged for my subscription' },
    ...exchange('Escalation check 1 of 4 — Billing or subscription', 'Professional plan'),
  ];
  const result = guidedEscalation(config, 'Professional plan', history);
  assert.match(result.reply, /Escalation check 2 of 4/);
  assert.match(result.reply, /date, amount and invoice or receipt reference only/);
  assert.match(result.reply, /never provide a password, full payment-card number, security code or authentication code/);
});

test('finishes triage with priority, structured subject and enquiry action', () => {
  const history = [
    { role: 'user', content: 'My account is locked and I cannot access my paid plan' },
    ...exchange('Escalation check 1 of 4 — Account or sign-in', 'Customer account'),
    ...exchange('Escalation check 2 of 4 — Account or sign-in', 'It says account unavailable'),
    ...exchange('Escalation check 3 of 4 — Account or sign-in', 'iPhone Safari'),
    ...exchange('Escalation check 4 of 4 — Account or sign-in', 'Since today, every time'),
  ];
  const result = guidedEscalation(config, 'Since today, every time', history);
  assert.equal(result.escalate, true);
  assert.equal(result.priority, 'High');
  assert.equal(result.suggestedSubject, '[High] Account or sign-in support request');
  assert.deepEqual(result.suggestions, ['Create an enquiry', 'Try another question']);
  assert.match(result.reply, /full conversation and your answers will be attached automatically/);
});

test('routes privacy concerns to the Data Protection category', () => {
  const result = guidedEscalation(config, 'I need a human to help delete my personal data', []);
  assert.equal(result.category, 'Data Protection');
  assert.match(result.reply, /access, correction, deletion, objection, restriction or a suspected data incident/);
});

test('does not intercept ordinary self-help questions', () => {
  assert.equal(guidedEscalation(config, 'How do I create a plan?', []), null);
});
