import type { PlanId } from './plan-config';

export type AccountType = 'individual' | 'organisation';
export type SharePermission = 'none' | 'view' | 'edit';

export interface AccountPlanEntitlements {
  accountType: AccountType;
  planCode: PlanId;
  isIndividual: boolean;
  isOrganisation: boolean;
  paid: boolean;
  canShareItineraries: boolean;
  canInviteViewers: boolean;
  canInviteEditors: boolean;
  maximumSharePermission: SharePermission;
  organisationMemberWorkspace: boolean;
  workspaceLabel: string;
  features: string[];
}

const PAID_PLANS = new Set<PlanId>(['personal', 'standard', 'professional', 'org_starter']);
const READ_ONLY_ORGANISATION_PLANS = new Set<PlanId>(['personal', 'standard', 'professional']);

export function normaliseAccountType(value: unknown): AccountType {
  const normalised = String(value ?? '').trim().toLowerCase().replace(/[^a-z]/g, '');
  return ['organisation', 'organization', 'business', 'company', 'corporate'].includes(normalised)
    ? 'organisation'
    : 'individual';
}

export function accountPlanEntitlements(accountTypeValue: unknown, planCode: PlanId): AccountPlanEntitlements {
  const accountType = normaliseAccountType(accountTypeValue);
  const isOrganisation = accountType === 'organisation';
  const readOnlySharing = isOrganisation && READ_ONLY_ORGANISATION_PLANS.has(planCode);
  const collaborativeSharing = isOrganisation && planCode === 'org_starter';

  const features = isOrganisation
    ? [
        'A separate organisation workspace that does not mix with personal customer accounts',
        ...(readOnlySharing || collaborativeSharing
          ? ['Share completed itineraries with invited viewers']
          : []),
        ...(readOnlySharing
          ? ['Shared itineraries are read-only; invited users cannot change the plan']
          : []),
        ...(collaborativeSharing
          ? ['Choose read-only or editing access for invited collaborators', 'Organisation member workspace']
          : []),
      ]
    : [
        'A private individual workspace',
        'Personal plans are kept separate from organisation accounts',
        'Organisation members and business sharing controls are not shown',
      ];

  return {
    accountType,
    planCode,
    isIndividual: !isOrganisation,
    isOrganisation,
    paid: PAID_PLANS.has(planCode),
    canShareItineraries: readOnlySharing || collaborativeSharing,
    canInviteViewers: readOnlySharing || collaborativeSharing,
    canInviteEditors: collaborativeSharing,
    maximumSharePermission: collaborativeSharing ? 'edit' : readOnlySharing ? 'view' : 'none',
    organisationMemberWorkspace: collaborativeSharing,
    workspaceLabel: isOrganisation ? 'Organisation workspace' : 'Individual workspace',
    features,
  };
}

export function enforceSharePermission(
  accountType: AccountType,
  planCode: PlanId,
  requestedPermission: SharePermission,
): SharePermission {
  const entitlements = accountPlanEntitlements(accountType, planCode);
  if (!entitlements.canShareItineraries) return 'none';
  if (requestedPermission === 'edit' && entitlements.canInviteEditors) return 'edit';
  return 'view';
}
