import assert from 'node:assert/strict';
import test from 'node:test';
import { customerPlanId } from '../src/lib/customer-plan.ts';

test('customer account uses the canonical lifetime plan ID instead of the display type', () => {
  assert.equal(customerPlanId({ currentPlanId: 'professional', currentPlan: 'Complete Plan', currentPlanType: 'Monthly subscription', lifetimeAccess: true }), 'professional');
  assert.equal(customerPlanId({ currentPlanId: 'org_starter', currentPlanType: 'Monthly subscription', lifetimeAccess: true }), 'org_starter');
});
