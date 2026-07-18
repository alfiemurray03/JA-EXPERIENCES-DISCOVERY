import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  accountPlanEntitlements,
  accountTypeFromProfile,
  enforceSharePermission,
  normaliseAccountType,
} from '../functions/_shared/account-entitlements.js';

const root = new URL('../', import.meta.url);

test('account type is explicit and historic both records fail safely to Individual', () => {
  assert.equal(normaliseAccountType('Individual'), 'individual');
  assert.equal(normaliseAccountType('Business'), 'organisation');
  assert.equal(accountTypeFromProfile({ usage_type: 'both', microsoft_company_name: 'Example Ltd' }), 'individual');
  assert.equal(accountTypeFromProfile({ usage_type: 'business' }), 'organisation');
  assert.equal(accountTypeFromProfile({ account_type: 'individual', usage_type: 'business' }), 'individual');
});

test('Individual accounts never receive organisation itinerary permissions', () => {
  for (const plan of ['personal', 'standard', 'professional', 'org_starter']) {
    const entitlement = accountPlanEntitlements('individual', plan);
    assert.equal(entitlement.canShareItineraries, false);
    assert.equal(entitlement.canInviteEditors, false);
    assert.equal(entitlement.maximumSharePermission, 'none');
  }
});

test('the first three organisation plans are view-only', () => {
  for (const plan of ['personal', 'standard', 'professional']) {
    const entitlement = accountPlanEntitlements('organisation', plan);
    assert.equal(entitlement.canShareItineraries, true);
    assert.equal(entitlement.canInviteEditors, false);
    assert.equal(entitlement.maximumSharePermission, 'view');
    assert.equal(enforceSharePermission('organisation', plan, 'edit'), 'view');
  }
});

test('Together is the only organisation plan with collaborative editing', () => {
  const entitlement = accountPlanEntitlements('organisation', 'org_starter');
  assert.equal(entitlement.canShareItineraries, true);
  assert.equal(entitlement.canInviteEditors, true);
  assert.equal(entitlement.organisationMemberWorkspace, true);
  assert.equal(enforceSharePermission('organisation', 'org_starter', 'edit'), 'edit');
});

test('account classification is saved independently from a company-name field', async () => {
  const source = await readFile(new URL('functions/account/account-type.js', root), 'utf8');
  assert.match(source, /account_type_selected_at/);
  assert.match(source, /usage_type=\?/);
  assert.match(source, /accountType === "organisation" \? "business" : "personal"/);
  assert.doesNotMatch(source, /microsoft_company_name[^\n]+accountType/);
});

test('itinerary access requires a signed-in invited email and rechecks the owner plan', async () => {
  const source = await readFile(new URL('functions/account/api/itinerary-access.js', root), 'utf8');
  assert.match(source, /x-ja-auth-email/);
  assert.match(source, /recipient_email/);
  assert.match(source, /ownerAccess\(DB, row\.owner_email\)/);
  assert.match(source, /enforceSharePermission/);
  assert.match(source, /This itinerary is read-only for your account/);
  assert.doesNotMatch(source, /publicLink|shareToken|token TEXT NOT NULL UNIQUE/);
});

test('pricing and builders render separate Individual and Organisation experiences', async () => {
  const pricing = await readFile(new URL('src/pages/pricing.tsx', root), 'utf8');
  const builders = await readFile(new URL('src/pages/builders-hub.tsx', root), 'utf8');
  const plans = await readFile(new URL('src/lib/service-plans.ts', root), 'utf8');

  assert.match(pricing, /INDIVIDUAL_PLAN_FEATURE_COMPARISON/);
  assert.match(pricing, /ORGANISATION_PLAN_FEATURE_COMPARISON/);
  assert.match(pricing, /Who will use this account\?/);
  assert.match(builders, /Workspace setup/);
  assert.match(builders, /Shared with me/);
  assert.match(builders, /Individual itineraries are private/);
  assert.match(plans, /Invited users can edit itineraries/);
  assert.match(plans, /personal: false, standard: false, professional: false, org_starter: true/);
});
