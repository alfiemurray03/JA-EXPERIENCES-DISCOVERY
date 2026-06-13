/**
 * portal-nav.ts
 *
 * Canonical definition of the customer portal sidebar navigation.
 * This is the DEFAULT structure. Admins can override visibility of items
 * via the admin portal (/admin/portal-nav), which persists overrides to
 * ja_system_config under the key "portal_nav_config".
 *
 * The sidebar renders from this structure — every item has a stable `id`
 * used as the key for admin overrides.
 */

export interface PortalNavItem {
  id: string;
  label: string;
  href: string;
  /** Whether this item is visible by default */
  defaultVisible: boolean;
}

export interface PortalNavSection {
  id: string;
  label: string;
  items: PortalNavItem[];
  /** Whether this section is visible by default */
  defaultVisible: boolean;
}

/** Admin override shape stored in ja_system_config */
export interface PortalNavOverrides {
  /** Map of item/section id → visible override */
  visibility: Record<string, boolean>;
}

export const DEFAULT_PORTAL_NAV: PortalNavSection[] = [
  {
    id: 'dashboard',
    label: 'DASHBOARD',
    defaultVisible: true,
    items: [
      { id: 'nav-dashboard',  label: 'Dashboard',  href: '/dashboard', defaultVisible: true },
    ],
  },
  {
    id: 'documents',
    label: 'DOCUMENTS',
    defaultVisible: true,
    items: [
      { id: 'nav-my-documents',       label: 'My Documents',       href: '/documents',                defaultVisible: true },
      { id: 'nav-recent-documents',   label: 'Recent Documents',   href: '/documents?filter=recent',  defaultVisible: true },
      { id: 'nav-drafts',             label: 'Drafts',             href: '/documents?filter=draft',   defaultVisible: true },
      { id: 'nav-completed',          label: 'Completed Documents',href: '/documents?filter=complete',defaultVisible: true },
      { id: 'nav-shared',             label: 'Shared Documents',   href: '/documents?filter=shared',  defaultVisible: true },
      { id: 'nav-favourites',         label: 'Favourites',         href: '/documents?filter=favourites', defaultVisible: true },
      { id: 'nav-archive',            label: 'Archive',            href: '/documents?filter=archived', defaultVisible: true },
      { id: 'nav-trash',              label: 'Trash',              href: '/documents?filter=trash',   defaultVisible: true },
      { id: 'nav-audit-history',      label: 'Audit & History',    href: '/documents/audit',          defaultVisible: true },
    ],
  },
  {
    id: 'builders-hub',
    label: 'BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-builders-hub', label: 'Builders Hub', href: '/builders', defaultVisible: true },
    ],
  },
  {
    id: 'core-builders',
    label: 'CORE BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-letter-builder',    label: 'Letter Builder',    href: '/letter-builder',    defaultVisible: true },
      { id: 'nav-email-builder',     label: 'Email Builder',     href: '/email-builder',     defaultVisible: true },
      { id: 'nav-invoice-builder',   label: 'Invoice Builder',   href: '/invoice-builder',   defaultVisible: true },
      { id: 'nav-contract-builder',  label: 'Contract Builder',  href: '/contract-builder',  defaultVisible: true },
      { id: 'nav-policy-builder',    label: 'Policy Builder',    href: '/policy-builder',    defaultVisible: true },
      { id: 'nav-form-builder',      label: 'Form Builder',      href: '/form-builder',      defaultVisible: true },
      { id: 'nav-report-builder',    label: 'Report Builder',    href: '/report-builder',    defaultVisible: true },
      { id: 'nav-minutes-builder',   label: 'Minutes Builder',   href: '/minutes-builder',   defaultVisible: true },
      { id: 'nav-proposal-builder',  label: 'Proposal Builder',  href: '/proposal-builder',  defaultVisible: true },
      { id: 'nav-checklist-builder', label: 'Checklist Builder', href: '/checklist-builder', defaultVisible: true },
    ],
  },
  {
    id: 'business-builders',
    label: 'BUSINESS BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-quote-builder',               label: 'Quote Builder',               href: '/builders/quote',               defaultVisible: true },
      { id: 'nav-estimate-builder',            label: 'Estimate Builder',            href: '/builders/estimate',            defaultVisible: true },
      { id: 'nav-purchase-order-builder',      label: 'Purchase Order Builder',      href: '/builders/purchase-order',      defaultVisible: true },
      { id: 'nav-business-plan-builder',       label: 'Business Plan Builder',       href: '/builders/business-plan',       defaultVisible: true },
      { id: 'nav-project-plan-builder',        label: 'Project Plan Builder',        href: '/builders/project-plan',        defaultVisible: true },
      { id: 'nav-action-plan-builder',         label: 'Action Plan Builder',         href: '/builders/action-plan',         defaultVisible: true },
      { id: 'nav-service-agreement-builder',   label: 'Service Agreement Builder',   href: '/builders/service-agreement',   defaultVisible: true },
      { id: 'nav-consultancy-agreement-builder', label: 'Consultancy Agreement Builder', href: '/builders/consultancy-agreement', defaultVisible: true },
      { id: 'nav-supplier-agreement-builder',  label: 'Supplier Agreement Builder',  href: '/builders/supplier-agreement',  defaultVisible: true },
    ],
  },
  {
    id: 'governance-builders',
    label: 'GOVERNANCE BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-agenda-builder',                label: 'Agenda Builder',                href: '/builders/agenda',                defaultVisible: true },
      { id: 'nav-resolution-builder',            label: 'Resolution Builder',            href: '/builders/resolution',            defaultVisible: true },
      { id: 'nav-meeting-notice-builder',        label: 'Meeting Notice Builder',        href: '/builders/meeting-notice',        defaultVisible: true },
      { id: 'nav-board-minutes-builder',         label: 'Board Minutes Builder',         href: '/builders/board-minutes',         defaultVisible: true },
      { id: 'nav-board-pack-builder',            label: 'Board Pack Builder',            href: '/builders/board-pack',            defaultVisible: true },
      { id: 'nav-shareholder-resolution-builder',label: 'Shareholder Resolution Builder',href: '/builders/shareholder-resolution',defaultVisible: true },
      { id: 'nav-director-resolution-builder',   label: 'Director Resolution Builder',   href: '/builders/director-resolution',   defaultVisible: true },
      { id: 'nav-company-record-builder',        label: 'Company Record Builder',        href: '/builders/company-record',        defaultVisible: true },
    ],
  },
  {
    id: 'hr-builders',
    label: 'HR BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-job-description-builder',      label: 'Job Description Builder',      href: '/builders/job-description',      defaultVisible: true },
      { id: 'nav-employment-contract-builder',  label: 'Employment Contract Builder',  href: '/builders/employment-contract',  defaultVisible: true },
      { id: 'nav-offer-letter-builder',         label: 'Offer Letter Builder',         href: '/builders/offer-letter',         defaultVisible: true },
      { id: 'nav-staff-handbook-builder',       label: 'Staff Handbook Builder',       href: '/builders/staff-handbook',       defaultVisible: true },
      { id: 'nav-recruitment-pack-builder',     label: 'Recruitment Pack Builder',     href: '/builders/recruitment-pack',     defaultVisible: true },
      { id: 'nav-appraisal-builder',            label: 'Appraisal Builder',            href: '/builders/appraisal',            defaultVisible: true },
      { id: 'nav-training-record-builder',      label: 'Training Record Builder',      href: '/builders/training-record',      defaultVisible: true },
      { id: 'nav-disciplinary-letter-builder',  label: 'Disciplinary Letter Builder',  href: '/builders/disciplinary-letter',  defaultVisible: true },
      { id: 'nav-grievance-letter-builder',     label: 'Grievance Letter Builder',     href: '/builders/grievance-letter',     defaultVisible: true },
    ],
  },
  {
    id: 'compliance-builders',
    label: 'COMPLIANCE BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-privacy-policy-builder',       label: 'Privacy Policy Builder',       href: '/builders/privacy-policy',       defaultVisible: true },
      { id: 'nav-gdpr-builder',                 label: 'GDPR Builder',                 href: '/builders/gdpr',                 defaultVisible: true },
      { id: 'nav-dpia-builder',                 label: 'DPIA Builder',                 href: '/builders/dpia',                 defaultVisible: true },
      { id: 'nav-risk-assessment-builder',      label: 'Risk Assessment Builder',      href: '/builders/risk-assessment',      defaultVisible: true },
      { id: 'nav-method-statement-builder',     label: 'Method Statement Builder',     href: '/builders/method-statement',     defaultVisible: true },
      { id: 'nav-incident-report-builder',      label: 'Incident Report Builder',      href: '/builders/incident-report',      defaultVisible: true },
      { id: 'nav-health-safety-policy-builder', label: 'Health & Safety Policy Builder',href: '/builders/health-safety-policy',defaultVisible: true },
      { id: 'nav-complaints-procedure-builder', label: 'Complaints Procedure Builder', href: '/builders/complaints-procedure', defaultVisible: true },
      { id: 'nav-equality-policy-builder',      label: 'Equality Policy Builder',      href: '/builders/equality-policy',      defaultVisible: true },
    ],
  },
  {
    id: 'education-builders',
    label: 'EDUCATION BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-certificate-builder',      label: 'Certificate Builder',      href: '/builders/certificate',      defaultVisible: true },
      { id: 'nav-assessment-builder',       label: 'Assessment Builder',       href: '/builders/assessment',       defaultVisible: true },
      { id: 'nav-workbook-builder',         label: 'Workbook Builder',         href: '/builders/workbook',         defaultVisible: true },
      { id: 'nav-lesson-plan-builder',      label: 'Lesson Plan Builder',      href: '/builders/lesson-plan',      defaultVisible: true },
      { id: 'nav-course-builder',           label: 'Course Builder',           href: '/builders/course',           defaultVisible: true },
      { id: 'nav-course-outline-builder',   label: 'Course Outline Builder',   href: '/builders/course-outline',   defaultVisible: true },
      { id: 'nav-training-certificate-builder', label: 'Training Certificate Builder', href: '/builders/training-certificate', defaultVisible: true },
    ],
  },
  {
    id: 'charity-builders',
    label: 'CHARITY & MEMBERSHIP BUILDERS',
    defaultVisible: true,
    items: [
      { id: 'nav-membership-form-builder',        label: 'Membership Form Builder',        href: '/builders/membership-form',        defaultVisible: true },
      { id: 'nav-membership-certificate-builder', label: 'Membership Certificate Builder', href: '/builders/membership-certificate', defaultVisible: true },
      { id: 'nav-volunteer-agreement-builder',    label: 'Volunteer Agreement Builder',    href: '/builders/volunteer-agreement',    defaultVisible: true },
      { id: 'nav-trustee-minutes-builder',        label: 'Trustee Minutes Builder',        href: '/builders/trustee-minutes',        defaultVisible: true },
      { id: 'nav-grant-application-builder',      label: 'Grant Application Builder',      href: '/builders/grant-application',      defaultVisible: true },
      { id: 'nav-charity-policy-builder',         label: 'Charity Policy Builder',         href: '/builders/charity-policy',         defaultVisible: true },
      { id: 'nav-event-plan-builder',             label: 'Event Plan Builder',             href: '/builders/event-plan',             defaultVisible: true },
    ],
  },
  {
    id: 'signing',
    label: 'SIGNING',
    defaultVisible: true,
    items: [
      { id: 'nav-document-signing',     label: 'Document Signing',     href: '/signing',                  defaultVisible: true },
      { id: 'nav-signature-requests',   label: 'Signature Requests',   href: '/signing?filter=requests',  defaultVisible: true },
      { id: 'nav-awaiting-signatures',  label: 'Awaiting Signatures',  href: '/signing?filter=awaiting',  defaultVisible: true },
      { id: 'nav-completed-signatures', label: 'Completed Signatures', href: '/signing?filter=completed', defaultVisible: true },
    ],
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    defaultVisible: true,
    items: [
      { id: 'nav-organisation',      label: 'Organisation',      href: '/org/members',      defaultVisible: true },
      { id: 'nav-team-members',      label: 'Team Members',      href: '/org/members',      defaultVisible: true },
      { id: 'nav-branding',          label: 'Branding',          href: '/settings#branding',defaultVisible: true },
      { id: 'nav-billing',           label: 'Membership & Billing', href: '/settings#billing', defaultVisible: true },
      { id: 'nav-settings',          label: 'Settings',          href: '/settings',         defaultVisible: true },
      { id: 'nav-support',           label: 'Support',           href: '/support',          defaultVisible: true },
    ],
  },
];

/**
 * Merge admin overrides into the default nav structure.
 * Items/sections hidden by admin override are filtered out.
 */
export function applyPortalNavOverrides(
  sections: PortalNavSection[],
  overrides: PortalNavOverrides,
): PortalNavSection[] {
  return sections
    .filter(section => {
      const override = overrides.visibility[section.id];
      return override !== undefined ? override : section.defaultVisible;
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const override = overrides.visibility[item.id];
        return override !== undefined ? override : item.defaultVisible;
      }),
    }))
    .filter(section => section.items.length > 0);
}
