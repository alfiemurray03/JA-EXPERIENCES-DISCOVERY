export const CUSTOMER_PLAN_IDS = ['free', 'personal', 'standard', 'professional', 'org_starter'] as const;
export type CustomerPlanId = typeof CUSTOMER_PLAN_IDS[number];

export function customerPlanId(profile: Record<string, unknown>): CustomerPlanId {
  const raw = String(profile.currentPlanId || profile.currentPlan || 'free').toLowerCase().replace(/[\s-]+/g, '_');
  return (CUSTOMER_PLAN_IDS as readonly string[]).includes(raw) ? raw as CustomerPlanId : 'free';
}
