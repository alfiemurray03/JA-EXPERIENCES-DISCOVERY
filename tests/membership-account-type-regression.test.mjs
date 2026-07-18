import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('membership page displays Individual and Organisation directly', async () => {
  const membership = await source('src/pages/admin/subscriptions.tsx');
  assert.match(membership, /Membership/);
  assert.match(membership, /Individual/);
  assert.match(membership, /Organisation/);
  assert.match(membership, /Account type/);
  assert.match(membership, /Confirmation required/);
  assert.match(membership, /Sharing/);
  assert.match(membership, /Invitations/);
  assert.doesNotMatch(membership, /\['personal', 'business', 'both'\]/);
});

test('membership profile normalises absent document activity instead of crashing', async () => {
  const membership = await source('src/pages/admin/subscriptions.tsx');
  assert.match(membership, /EMPTY_DOCUMENTS/);
  assert.match(membership, /normaliseProfile/);
  assert.match(membership, /source\.documents/);
  assert.match(membership, /Number\(value \|\| 0\)/);
  assert.doesNotMatch(membership, /setProfile\(d\)/);
});

test('dedicated admin customer API provides both nested and compatible top-level profile fields', async () => {
  const api = await source('functions/api/admin/customers/[[path]].js');
  assert.match(api, /const profile = \{ customer, subscription, documents, workspace \}/);
  assert.match(api, /return json\(\{ success: true, profile, \.\.\.profile \}\)/);
  assert.match(api, /accountTypeConfirmed/);
  assert.match(api, /accountPlanEntitlements/);
  assert.match(api, /sharingLevel/);
});

test('admin account-type changes write the authoritative and compatibility fields together', async () => {
  const api = await source('functions/api/admin/customers/[[path]].js');
  assert.match(api, /account_type=\?/);
  assert.match(api, /account_type_selected_at=CURRENT_TIMESTAMP/);
  assert.match(api, /accountType === "organisation" \? "business" : "personal"/);
  assert.doesNotMatch(api, /company[^\n]+accountTypeFromProfile/);
});

test('pricing source contains a prominent Individual and Organisation selector', async () => {
  const pricing = await source('src/pages/pricing.tsx');
  assert.match(pricing, /Who will use this account\?/);
  assert.match(pricing, />Individual</);
  assert.match(pricing, />Organisation</);
  assert.match(pricing, /Organisation feature table|Compare \{audience\} features/);
  assert.match(pricing, /INDIVIDUAL_PLAN_FEATURE_COMPARISON/);
  assert.match(pricing, /ORGANISATION_PLAN_FEATURE_COMPARISON/);
});
