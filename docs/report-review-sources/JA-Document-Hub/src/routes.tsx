import React, { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import HomePage from './pages/index';
import ProdNotFoundPage from './pages/_404';
import Spinner from './components/Spinner';
import { useAuth } from './lib/auth-context';
import { useAdmin } from './lib/admin-context';
import { useResellerAuth } from './lib/reseller-auth-context';

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : ProdNotFoundPage;

// Lazy-loaded customer pages
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const AuthCallbackPage = lazy(() => import('./pages/auth-callback'));
const AuthLogoutPage   = lazy(() => import('./pages/auth-logout'));
const AuthOidcStartPage = lazy(() => import('./pages/auth-oidc-start'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const DocumentsPage = lazy(() => import('./pages/documents'));
const DocumentAuditPage = lazy(() => import('./pages/documents/audit'));
const BuildersHubPage = lazy(() => import('./pages/builders-hub'));
const DocumentViewPage = lazy(() => import('./pages/document-view'));
const PricingPage = lazy(() => import('./pages/pricing'));
const SettingsPage = lazy(() => import('./pages/settings'));
const SupportPage = lazy(() => import('./pages/support'));
const PrivacySettingsPage = lazy(() => import('./pages/privacy-settings'));
const TermsPage = lazy(() => import('./pages/terms'));
const PrivacyPage = lazy(() => import('./pages/privacy'));
const CookiesPage = lazy(() => import('./pages/cookies'));
const AcceptableUsePage = lazy(() => import('./pages/acceptable-use'));
const ContactPage = lazy(() => import('./pages/contact'));
const LetterBuilderPage = lazy(() => import('./pages/letter-builder'));
const EmailBuilderPage = lazy(() => import('./pages/email-builder'));
const InvoiceBuilderPage = lazy(() => import('./pages/invoice-builder'));
const ContractBuilderPage = lazy(() => import('./pages/contract-builder'));
const PolicyBuilderPage = lazy(() => import('./pages/policy-builder'));
const FormBuilderPage = lazy(() => import('./pages/form-builder'));
const ReportBuilderPage = lazy(() => import('./pages/report-builder'));
const MinutesBuilderPage = lazy(() => import('./pages/minutes-builder'));
const ProposalBuilderPage = lazy(() => import('./pages/proposal-builder'));
const ChecklistBuilderPage = lazy(() => import('./pages/checklist-builder'));

// Plan detail pages
const PlanPersonalPage         = lazy(() => import('./pages/plans/personal'));const PlanStandardPage        = lazy(() => import('./pages/plans/standard'));
const PlanProfessionalPage    = lazy(() => import('./pages/plans/professional'));
const PlanOrgStarterPage      = lazy(() => import('./pages/plans/org-starter'));
const PlanOrgGrowthPage       = lazy(() => import('./pages/plans/org-growth'));
const PlanOrgProfessionalPage = lazy(() => import('./pages/plans/org-professional'));

// Org pages
const OrgMembersPage = lazy(() => import('./pages/org/members'));

// Affiliate pages
const AffiliatePage = lazy(() => import('./pages/affiliate'));
const AffiliateDashboardPage = lazy(() => import('./pages/affiliate/dashboard'));

// Lazy-loaded admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/login'));
const AdminPasswordResetsPage = lazy(() => import('./pages/admin/password-resets'));
const AdminForgotPasswordPage = lazy(() => import('./pages/admin/forgot-password'));

const AdminDashboardPage = lazy(() => import('./pages/admin/dashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/users'));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/subscriptions'));
const AdminContentPage = lazy(() => import('./pages/admin/content'));
const AdminLegalPage = lazy(() => import('./pages/admin/legal'));
const AdminPagesPage = lazy(() => import('./pages/admin/pages'));
const AdminBuildersPage = lazy(() => import('./pages/admin/builders'));
const AdminSiteSettingsPage = lazy(() => import('./pages/admin/site-settings'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/analytics'));
const AdminSupportPage = lazy(() => import('./pages/admin/support'));
const AdminAuditPage = lazy(() => import('./pages/admin/audit'));
const AdminSecurityPage = lazy(() => import('./pages/admin/security'));
const AdminGdprPage = lazy(() => import('./pages/admin/gdpr'));
const AdminSystemPage = lazy(() => import('./pages/admin/system'));
const AdminStripeDiagnosticsPage = lazy(() => import('./pages/admin/stripe-diagnostics'));
const AdminTestToolsPage = lazy(() => import('./pages/admin/test-tools'));
const AdminAffiliatePage = lazy(() => import('./pages/admin/affiliate'));
const AdminSigningPage = lazy(() => import('./pages/admin/signing'));
const AdminResellersPage = lazy(() => import('./pages/admin/resellers'));

// Partners + Reseller pages
const PartnersPage = lazy(() => import('./pages/partners/index'));
const ResellerApplyPage = lazy(() => import('./pages/reseller/apply'));
const ResellerLoginPage = lazy(() => import('./pages/reseller/login'));
const ResellerDashboardPage = lazy(() => import('./pages/reseller/index'));
const ResellerCustomersPage = lazy(() => import('./pages/reseller/customers'));
const ResellerReferralsPage = lazy(() => import('./pages/reseller/referrals'));
const ResellerCommissionsPage = lazy(() => import('./pages/reseller/commissions'));
const ResellerResourcesPage = lazy(() => import('./pages/reseller/resources'));
const ResellerSupportPage = lazy(() => import('./pages/reseller/support'));
const ResellerSettingsPage = lazy(() => import('./pages/reseller/settings'));

import BuilderPlaceholder from './pages/builders/placeholder';

// Helper: wrap a placeholder builder page
function builderPlaceholder(name: string) {
  const El = () => <BuilderPlaceholder builderName={name} />;
  El.displayName = `Placeholder_${name}`;
  return El;
}

// Placeholder builder page components (lazy-loaded inline)
const QuoteBuilderPage               = builderPlaceholder('Quote Builder');
const EstimateBuilderPage            = builderPlaceholder('Estimate Builder');
const PurchaseOrderBuilderPage       = builderPlaceholder('Purchase Order Builder');
const BusinessPlanBuilderPage        = builderPlaceholder('Business Plan Builder');
const ProjectPlanBuilderPage         = builderPlaceholder('Project Plan Builder');
const ActionPlanBuilderPage          = builderPlaceholder('Action Plan Builder');
const ServiceAgreementBuilderPage    = builderPlaceholder('Service Agreement Builder');
const ConsultancyAgreementBuilderPage= builderPlaceholder('Consultancy Agreement Builder');
const SupplierAgreementBuilderPage   = builderPlaceholder('Supplier Agreement Builder');
const AgendaBuilderPage              = builderPlaceholder('Agenda Builder');
const ResolutionBuilderPage          = builderPlaceholder('Resolution Builder');
const MeetingNoticeBuilderPage       = builderPlaceholder('Meeting Notice Builder');
const BoardMinutesBuilderPage        = builderPlaceholder('Board Minutes Builder');
const BoardPackBuilderPage           = builderPlaceholder('Board Pack Builder');
const ShareholderResolutionBuilderPage = builderPlaceholder('Shareholder Resolution Builder');
const DirectorResolutionBuilderPage  = builderPlaceholder('Director Resolution Builder');
const CompanyRecordBuilderPage       = builderPlaceholder('Company Record Builder');
const JobDescriptionBuilderPage      = builderPlaceholder('Job Description Builder');
const EmploymentContractBuilderPage  = builderPlaceholder('Employment Contract Builder');
const OfferLetterBuilderPage         = builderPlaceholder('Offer Letter Builder');
const StaffHandbookBuilderPage       = builderPlaceholder('Staff Handbook Builder');
const RecruitmentPackBuilderPage     = builderPlaceholder('Recruitment Pack Builder');
const AppraisalBuilderPage           = builderPlaceholder('Appraisal Builder');
const TrainingRecordBuilderPage      = builderPlaceholder('Training Record Builder');
const DisciplinaryLetterBuilderPage  = builderPlaceholder('Disciplinary Letter Builder');
const GrievanceLetterBuilderPage     = builderPlaceholder('Grievance Letter Builder');
const PrivacyPolicyBuilderPage       = builderPlaceholder('Privacy Policy Builder');
const GdprBuilderPage                = builderPlaceholder('GDPR Builder');
const DpiaBuilderPage                = builderPlaceholder('DPIA Builder');
const RiskAssessmentBuilderPage      = builderPlaceholder('Risk Assessment Builder');
const MethodStatementBuilderPage     = builderPlaceholder('Method Statement Builder');
const IncidentReportBuilderPage      = builderPlaceholder('Incident Report Builder');
const HealthSafetyPolicyBuilderPage  = builderPlaceholder('Health & Safety Policy Builder');
const ComplaintsProcedureBuilderPage = builderPlaceholder('Complaints Procedure Builder');
const EqualityPolicyBuilderPage      = builderPlaceholder('Equality Policy Builder');
const CertificateBuilderPage         = builderPlaceholder('Certificate Builder');
const AssessmentBuilderPage          = builderPlaceholder('Assessment Builder');
const WorkbookBuilderPage            = builderPlaceholder('Workbook Builder');
const LessonPlanBuilderPage          = builderPlaceholder('Lesson Plan Builder');
const CourseBuilderPage              = builderPlaceholder('Course Builder');
const CourseOutlineBuilderPage       = builderPlaceholder('Course Outline Builder');
const TrainingCertificateBuilderPage = builderPlaceholder('Training Certificate Builder');
const MembershipFormBuilderPage      = builderPlaceholder('Membership Form Builder');
const MembershipCertificateBuilderPage = builderPlaceholder('Membership Certificate Builder');
const VolunteerAgreementBuilderPage  = builderPlaceholder('Volunteer Agreement Builder');
const TrusteeMinutesBuilderPage      = builderPlaceholder('Trustee Minutes Builder');
const GrantApplicationBuilderPage    = builderPlaceholder('Grant Application Builder');
const CharityPolicyBuilderPage       = builderPlaceholder('Charity Policy Builder');
const EventPlanBuilderPage           = builderPlaceholder('Event Plan Builder');

// Admin portal-nav management page
const AdminPortalNavPage = lazy(() => import('./pages/admin/portal-nav'));
const SigningDashboardPage = lazy(() => import('./pages/signing/index'));
const SigningNewPage = lazy(() => import('./pages/signing/new'));
const SigningDetailPage = lazy(() => import('./pages/signing/[id]'));
const PublicSignerPage = lazy(() => import('./pages/sign/[token]'));

const SpinnerFallback = () => (
  <div className="flex justify-center items-center h-screen bg-slate-950">
    <Spinner />
  </div>
);

function wrap(el: React.ReactElement) {
  return <Suspense fallback={<SpinnerFallback />}>{el}</Suspense>;
}

// Customer auth guards
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  if (typeof window === 'undefined') return children;
  if (isLoading) return <SpinnerFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RedirectIfAuth({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  if (typeof window === 'undefined') return children;
  if (isLoading) return <SpinnerFallback />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// Admin auth guards — completely separate from customer auth
// Uses the AdminContext (which calls /api/admin/auth/me) so the guard
// waits for the async session check before redirecting. This prevents
// the redirect loop that occurred when localStorage was empty on first
// load after the OIDC callback.
function RequireAdmin({ children }: { children: React.ReactElement }) {
  if (typeof window === 'undefined') return children;
  const { admin, isLoading } = useAdmin();
  if (isLoading) return <SpinnerFallback />;
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
}

function RedirectIfAdmin({ children }: { children: React.ReactElement }) {
  if (typeof window === 'undefined') return children;
  const { admin, isLoading } = useAdmin();
  if (isLoading) return <SpinnerFallback />;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

// Reseller auth guard
function RequireReseller({ children }: { children: React.ReactElement }) {
  const { reseller, isLoading } = useResellerAuth();
  if (typeof window === 'undefined') return children;
  if (isLoading) return <SpinnerFallback />;
  if (!reseller) return <Navigate to="/reseller/login" replace />;
  return children;
}

export const routes: RouteObject[] = [
  // ── Customer-facing routes ──────────────────────────────────────────
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: wrap(<RedirectIfAuth><LoginPage /></RedirectIfAuth>),
  },
  {
    path: '/register',
    element: <Navigate to="/auth/oidc/start" replace />,
  },
  // OIDC start — server intercepts this in production; React page is a
  // client-side fallback that fires the hard redirect immediately.
  {
    path: '/auth/oidc/start',
    element: wrap(<AuthOidcStartPage />),
  },
  // OIDC callback + logout — server handles these; React pages are fallbacks only
  {
    path: '/auth/callback',
    element: wrap(<AuthCallbackPage />),
  },
  {
    path: '/auth/logout',
    element: wrap(<AuthLogoutPage />),
  },
  {
    path: '/dashboard',
    element: wrap(<RequireAuth><DashboardPage /></RequireAuth>),
  },
  {
    path: '/documents',
    element: wrap(<RequireAuth><DocumentsPage /></RequireAuth>),
  },
  {
    path: '/documents/audit',
    element: wrap(<RequireAuth><DocumentAuditPage /></RequireAuth>),
  },
  {
    path: '/documents/:docId',
    element: wrap(<RequireAuth><DocumentViewPage /></RequireAuth>),
  },
  {
    path: '/builders',
    element: wrap(<RequireAuth><BuildersHubPage /></RequireAuth>),
  },
  {
    path: '/templates',
    element: <Navigate to="/builders" replace />,
  },
  {
    path: '/letter-builder',
    element: wrap(<RequireAuth><LetterBuilderPage /></RequireAuth>),
  },
  {
    path: '/email-builder',
    element: wrap(<RequireAuth><EmailBuilderPage /></RequireAuth>),
  },
  {
    // Redirect old URL to new
    path: '/email-templates',
    element: wrap(<Navigate to="/email-builder" replace />),
  },
  {
    path: '/invoice-builder',
    element: wrap(<RequireAuth><InvoiceBuilderPage /></RequireAuth>),
  },
  {
    path: '/contract-builder',
    element: wrap(<RequireAuth><ContractBuilderPage /></RequireAuth>),
  },
  {
    path: '/policy-builder',
    element: wrap(<RequireAuth><PolicyBuilderPage /></RequireAuth>),
  },
  {
    path: '/form-builder',
    element: wrap(<RequireAuth><FormBuilderPage /></RequireAuth>),
  },
  {
    path: '/report-builder',
    element: wrap(<RequireAuth><ReportBuilderPage /></RequireAuth>),
  },
  {
    path: '/minutes-builder',
    element: wrap(<RequireAuth><MinutesBuilderPage /></RequireAuth>),
  },
  {
    path: '/proposal-builder',
    element: wrap(<RequireAuth><ProposalBuilderPage /></RequireAuth>),
  },
  {
    path: '/checklist-builder',
    element: wrap(<RequireAuth><ChecklistBuilderPage /></RequireAuth>),
  },
  // ── New builder routes (placeholder pages) ─────────────────────────
  // Business builders
  { path: '/builders/quote',               element: wrap(<RequireAuth><QuoteBuilderPage /></RequireAuth>) },
  { path: '/builders/estimate',            element: wrap(<RequireAuth><EstimateBuilderPage /></RequireAuth>) },
  { path: '/builders/purchase-order',      element: wrap(<RequireAuth><PurchaseOrderBuilderPage /></RequireAuth>) },
  { path: '/builders/business-plan',       element: wrap(<RequireAuth><BusinessPlanBuilderPage /></RequireAuth>) },
  { path: '/builders/project-plan',        element: wrap(<RequireAuth><ProjectPlanBuilderPage /></RequireAuth>) },
  { path: '/builders/action-plan',         element: wrap(<RequireAuth><ActionPlanBuilderPage /></RequireAuth>) },
  { path: '/builders/service-agreement',   element: wrap(<RequireAuth><ServiceAgreementBuilderPage /></RequireAuth>) },
  { path: '/builders/consultancy-agreement', element: wrap(<RequireAuth><ConsultancyAgreementBuilderPage /></RequireAuth>) },
  { path: '/builders/supplier-agreement',  element: wrap(<RequireAuth><SupplierAgreementBuilderPage /></RequireAuth>) },
  // Governance builders
  { path: '/builders/agenda',              element: wrap(<RequireAuth><AgendaBuilderPage /></RequireAuth>) },
  { path: '/builders/resolution',          element: wrap(<RequireAuth><ResolutionBuilderPage /></RequireAuth>) },
  { path: '/builders/meeting-notice',      element: wrap(<RequireAuth><MeetingNoticeBuilderPage /></RequireAuth>) },
  { path: '/builders/board-minutes',       element: wrap(<RequireAuth><BoardMinutesBuilderPage /></RequireAuth>) },
  { path: '/builders/board-pack',          element: wrap(<RequireAuth><BoardPackBuilderPage /></RequireAuth>) },
  { path: '/builders/shareholder-resolution', element: wrap(<RequireAuth><ShareholderResolutionBuilderPage /></RequireAuth>) },
  { path: '/builders/director-resolution', element: wrap(<RequireAuth><DirectorResolutionBuilderPage /></RequireAuth>) },
  { path: '/builders/company-record',      element: wrap(<RequireAuth><CompanyRecordBuilderPage /></RequireAuth>) },
  // HR builders
  { path: '/builders/job-description',     element: wrap(<RequireAuth><JobDescriptionBuilderPage /></RequireAuth>) },
  { path: '/builders/employment-contract', element: wrap(<RequireAuth><EmploymentContractBuilderPage /></RequireAuth>) },
  { path: '/builders/offer-letter',        element: wrap(<RequireAuth><OfferLetterBuilderPage /></RequireAuth>) },
  { path: '/builders/staff-handbook',      element: wrap(<RequireAuth><StaffHandbookBuilderPage /></RequireAuth>) },
  { path: '/builders/recruitment-pack',    element: wrap(<RequireAuth><RecruitmentPackBuilderPage /></RequireAuth>) },
  { path: '/builders/appraisal',           element: wrap(<RequireAuth><AppraisalBuilderPage /></RequireAuth>) },
  { path: '/builders/training-record',     element: wrap(<RequireAuth><TrainingRecordBuilderPage /></RequireAuth>) },
  { path: '/builders/disciplinary-letter', element: wrap(<RequireAuth><DisciplinaryLetterBuilderPage /></RequireAuth>) },
  { path: '/builders/grievance-letter',    element: wrap(<RequireAuth><GrievanceLetterBuilderPage /></RequireAuth>) },
  // Compliance builders
  { path: '/builders/privacy-policy',      element: wrap(<RequireAuth><PrivacyPolicyBuilderPage /></RequireAuth>) },
  { path: '/builders/gdpr',                element: wrap(<RequireAuth><GdprBuilderPage /></RequireAuth>) },
  { path: '/builders/dpia',                element: wrap(<RequireAuth><DpiaBuilderPage /></RequireAuth>) },
  { path: '/builders/risk-assessment',     element: wrap(<RequireAuth><RiskAssessmentBuilderPage /></RequireAuth>) },
  { path: '/builders/method-statement',    element: wrap(<RequireAuth><MethodStatementBuilderPage /></RequireAuth>) },
  { path: '/builders/incident-report',     element: wrap(<RequireAuth><IncidentReportBuilderPage /></RequireAuth>) },
  { path: '/builders/health-safety-policy',element: wrap(<RequireAuth><HealthSafetyPolicyBuilderPage /></RequireAuth>) },
  { path: '/builders/complaints-procedure',element: wrap(<RequireAuth><ComplaintsProcedureBuilderPage /></RequireAuth>) },
  { path: '/builders/equality-policy',     element: wrap(<RequireAuth><EqualityPolicyBuilderPage /></RequireAuth>) },
  // Education builders
  { path: '/builders/certificate',         element: wrap(<RequireAuth><CertificateBuilderPage /></RequireAuth>) },
  { path: '/builders/assessment',          element: wrap(<RequireAuth><AssessmentBuilderPage /></RequireAuth>) },
  { path: '/builders/workbook',            element: wrap(<RequireAuth><WorkbookBuilderPage /></RequireAuth>) },
  { path: '/builders/lesson-plan',         element: wrap(<RequireAuth><LessonPlanBuilderPage /></RequireAuth>) },
  { path: '/builders/course',              element: wrap(<RequireAuth><CourseBuilderPage /></RequireAuth>) },
  { path: '/builders/course-outline',      element: wrap(<RequireAuth><CourseOutlineBuilderPage /></RequireAuth>) },
  { path: '/builders/training-certificate',element: wrap(<RequireAuth><TrainingCertificateBuilderPage /></RequireAuth>) },
  // Charity & Membership builders
  { path: '/builders/membership-form',        element: wrap(<RequireAuth><MembershipFormBuilderPage /></RequireAuth>) },
  { path: '/builders/membership-certificate', element: wrap(<RequireAuth><MembershipCertificateBuilderPage /></RequireAuth>) },
  { path: '/builders/volunteer-agreement',    element: wrap(<RequireAuth><VolunteerAgreementBuilderPage /></RequireAuth>) },
  { path: '/builders/trustee-minutes',        element: wrap(<RequireAuth><TrusteeMinutesBuilderPage /></RequireAuth>) },
  { path: '/builders/grant-application',      element: wrap(<RequireAuth><GrantApplicationBuilderPage /></RequireAuth>) },
  { path: '/builders/charity-policy',         element: wrap(<RequireAuth><CharityPolicyBuilderPage /></RequireAuth>) },
  { path: '/builders/event-plan',             element: wrap(<RequireAuth><EventPlanBuilderPage /></RequireAuth>) },
  {
    path: '/pricing',
    element: wrap(<PricingPage />),
  },
  {
    path: '/plans/free',
    element: <Navigate to="/pricing" replace />,
  },
  {
    path: '/plans/personal',
    element: wrap(<PlanPersonalPage />),
  },
  {
    path: '/plans/standard',
    element: wrap(<PlanStandardPage />),
  },
  {
    path: '/plans/professional',
    element: wrap(<PlanProfessionalPage />),
  },
  {
    path: '/plans/organisation',
    element: <Navigate to="/plans/org-starter" replace />,
  },
  {
    path: '/plans/org-starter',
    element: wrap(<PlanOrgStarterPage />),
  },
  {
    path: '/plans/org-growth',
    element: wrap(<PlanOrgGrowthPage />),
  },
  {
    path: '/plans/org-professional',
    element: wrap(<PlanOrgProfessionalPage />),
  },
  {
    path: '/settings',
    element: wrap(<RequireAuth><SettingsPage /></RequireAuth>),
  },
  {
    path: '/support',
    element: wrap(<RequireAuth><SupportPage /></RequireAuth>),
  },
  {
    path: '/privacy-settings',
    element: wrap(<RequireAuth><PrivacySettingsPage /></RequireAuth>),
  },
  {
    path: '/org/members',
    element: wrap(<RequireAuth><OrgMembersPage /></RequireAuth>),
  },
  {
    path: '/forgot-password',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/reset-password',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/terms',
    element: wrap(<TermsPage />),
  },
  {
    path: '/privacy',
    element: wrap(<PrivacyPage />),
  },
  {
    path: '/cookies',
    element: wrap(<CookiesPage />),
  },
  {
    path: '/acceptable-use',
    element: wrap(<AcceptableUsePage />),
  },
  {
    path: '/contact',
    element: wrap(<ContactPage />),
  },
  {
    path: '/affiliate',
    element: wrap(<AffiliatePage />),
  },
  {
    path: '/affiliate/dashboard',
    element: wrap(<AffiliateDashboardPage />),
  },
  // Partners hub + Reseller public pages
  {
    path: '/partners',
    element: wrap(<PartnersPage />),
  },
  {
    path: '/reseller/apply',
    element: wrap(<ResellerApplyPage />),
  },
  // Document Signing (customer)
  {
    path: '/signing',
    element: wrap(<SigningDashboardPage />),
  },
  {
    path: '/signing/new',
    element: wrap(<SigningNewPage />),
  },
  {
    path: '/signing/:id',
    element: wrap(<SigningDetailPage />),
  },
  // Public signer page — no auth required
  {
    path: '/sign/:token',
    element: wrap(<PublicSignerPage />),
  },

  // ── Platform Administration Portal ─────────────────────────────────
  // Completely separate from customer accounts. Platform staff only.
  // NOTE: Admin routes are exported separately as `adminRoutes` and
  // rendered outside RootLayout in App.tsx.
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Admin routes rendered outside RootLayout (no customer header/footer)
export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: wrap(<RedirectIfAdmin><AdminLoginPage /></RedirectIfAdmin>),
  },
  {
    path: '/admin/forgot-password',
    element: wrap(<AdminForgotPasswordPage />),
  },
  {
    path: '/admin/setup',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/admin/dashboard',
    element: wrap(<RequireAdmin><AdminDashboardPage /></RequireAdmin>),
  },
  {
    path: '/admin/users',
    element: wrap(<RequireAdmin><AdminUsersPage /></RequireAdmin>),
  },
  {
    path: '/admin/subscriptions',
    element: wrap(<RequireAdmin><AdminSubscriptionsPage /></RequireAdmin>),
  },
  {
    path: '/admin/templates',
    element: <Navigate to="/admin/builders" replace />,
  },
  {
    path: '/admin/content',
    element: wrap(<RequireAdmin><AdminContentPage /></RequireAdmin>),
  },
  {
    path: '/admin/legal',
    element: wrap(<RequireAdmin><AdminLegalPage /></RequireAdmin>),
  },
  {
    path: '/admin/pages',
    element: wrap(<RequireAdmin><AdminPagesPage /></RequireAdmin>),
  },
  {
    path: '/admin/builders',
    element: wrap(<RequireAdmin><AdminBuildersPage /></RequireAdmin>),
  },
  {
    path: '/admin/site-settings',
    element: wrap(<RequireAdmin><AdminSiteSettingsPage /></RequireAdmin>),
  },
  {
    path: '/admin/analytics',
    element: wrap(<RequireAdmin><AdminAnalyticsPage /></RequireAdmin>),
  },
  {
    path: '/admin/support',
    element: wrap(<RequireAdmin><AdminSupportPage /></RequireAdmin>),
  },
  {
    path: '/admin/audit',
    element: wrap(<RequireAdmin><AdminAuditPage /></RequireAdmin>),
  },
  {
    path: '/admin/security',
    element: wrap(<RequireAdmin><AdminSecurityPage /></RequireAdmin>),
  },
  {
    path: '/admin/gdpr',
    element: wrap(<RequireAdmin><AdminGdprPage /></RequireAdmin>),
  },
  {
    path: '/admin/system',
    element: wrap(<RequireAdmin><AdminSystemPage /></RequireAdmin>),
  },
  {
    path: '/admin/stripe-diagnostics',
    element: wrap(<RequireAdmin><AdminStripeDiagnosticsPage /></RequireAdmin>),
  },
  {
    path: '/admin/password-resets',
    element: wrap(<RequireAdmin><AdminPasswordResetsPage /></RequireAdmin>),
  },
  {
    path: '/admin/test-tools',
    element: wrap(<RequireAdmin><AdminTestToolsPage /></RequireAdmin>),
  },
  {
    path: '/admin/affiliate',
    element: wrap(<RequireAdmin><AdminAffiliatePage /></RequireAdmin>),
  },
  {
    path: '/admin/signing',
    element: wrap(<RequireAdmin><AdminSigningPage /></RequireAdmin>),
  },
  {
    path: '/admin/resellers',
    element: wrap(<RequireAdmin><AdminResellersPage /></RequireAdmin>),
  },
  {
    path: '/admin/portal-nav',
    element: wrap(<RequireAdmin><AdminPortalNavPage /></RequireAdmin>),
  },
];

// Reseller portal routes — outside RootLayout, own auth guard
export const resellerRoutes: RouteObject[] = [
  {
    path: '/reseller/login',
    element: wrap(<ResellerLoginPage />),
  },
  {
    path: '/reseller',
    element: wrap(<RequireReseller><ResellerDashboardPage /></RequireReseller>),
  },
  {
    path: '/reseller/customers',
    element: wrap(<RequireReseller><ResellerCustomersPage /></RequireReseller>),
  },
  {
    path: '/reseller/referrals',
    element: wrap(<RequireReseller><ResellerReferralsPage /></RequireReseller>),
  },
  {
    path: '/reseller/commissions',
    element: wrap(<RequireReseller><ResellerCommissionsPage /></RequireReseller>),
  },
  {
    path: '/reseller/resources',
    element: wrap(<RequireReseller><ResellerResourcesPage /></RequireReseller>),
  },
  {
    path: '/reseller/support',
    element: wrap(<RequireReseller><ResellerSupportPage /></RequireReseller>),
  },
  {
    path: '/reseller/settings',
    element: wrap(<RequireReseller><ResellerSettingsPage /></RequireReseller>),
  },
];

export type Path =
  | '/'
  | '/login'
  | '/register'
  | '/dashboard'
  | '/documents'
  | '/builders'
  | '/pricing'
  | '/settings'
  | '/admin'
  | '/admin/dashboard';

export type Params = Record<string, string | undefined>;

