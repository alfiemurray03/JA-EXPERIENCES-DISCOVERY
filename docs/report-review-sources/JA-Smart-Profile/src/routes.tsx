import { RouteObject, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import HomePage from './pages/index';
import ProdNotFoundPage from './pages/_404';
import { AuthProvider } from './lib/auth';
import { AdminAuthProvider } from './lib/admin-auth';
import AdminGuard from './lib/AdminGuard';

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : ProdNotFoundPage;

// Auth pages
const LoginPage = lazy(() => import('./pages/login'));
const AdminLoginPage = lazy(() => import('./pages/admin/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const LoggedOutPage = lazy(() => import('./pages/logged-out'));
const AdminLoggedOutPage = lazy(() => import('./pages/admin/logged-out'));
const ConversationPage = lazy(() => import('./pages/conversation'));

// Dashboard pages
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/dashboard/overview'));
const DashboardProfile = lazy(() => import('./pages/dashboard/profile'));
const DashboardLinks = lazy(() => import('./pages/dashboard/links'));
const DashboardQR = lazy(() => import('./pages/dashboard/qr-code'));
const DashboardEnquiries = lazy(() => import('./pages/dashboard/enquiries'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/analytics'));
const DashboardThemes = lazy(() => import('./pages/dashboard/themes'));
const DashboardBilling = lazy(() => import('./pages/dashboard/billing'));
const DashboardReferral = lazy(() => import('./pages/dashboard/referral'));
const DashboardAffiliate = lazy(() => import('./pages/dashboard/affiliate'));
const DashboardMessages = lazy(() => import('./pages/dashboard/messages'));
const DashboardSettings = lazy(() => import('./pages/dashboard/settings'));
const DashboardAccount = lazy(() => import('./pages/dashboard/account'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/index'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const AdminProfiles = lazy(() => import('./pages/admin/profiles'));
const AdminEnquiries = lazy(() => import('./pages/admin/enquiries'));
const AdminPlans = lazy(() => import('./pages/admin/plans'));
const AdminAnalytics = lazy(() => import('./pages/admin/analytics'));
const AdminSettings = lazy(() => import('./pages/admin/settings'));
const AdminAudit = lazy(() => import('./pages/admin/audit'));
const AdminLegal = lazy(() => import('./pages/admin/legal'));
const AdminPartnerEnquiries = lazy(() => import('./pages/admin/partner-enquiries'));
const AdminSupportRequests = lazy(() => import('./pages/admin/support-requests'));
const AdminReferrals = lazy(() => import('./pages/admin/referrals'));
const AdminAffiliates = lazy(() => import('./pages/admin/affiliates'));
const AdminPoints = lazy(() => import('./pages/admin/points'));
const AdminIssueReports = lazy(() => import('./pages/admin/issue-reports'));

// Public profile
const PublicProfile = lazy(() => import('./pages/profile'));
const BusinessProfile = lazy(() => import('./pages/business-profile'));
const PartnersPage = lazy(() => import('./pages/partners'));

// Legal pages
const PrivacyPage = lazy(() => import('./pages/legal/privacy'));
const TermsPage = lazy(() => import('./pages/legal/terms'));
const CookiesPage = lazy(() => import('./pages/legal/cookies'));
const ReportIssuePage = lazy(() => import('./pages/report-issue'));

const Spin = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Spin />}>{children}</Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    ),
  },
  {
    path: '/login',
    element: <AuthProvider><S><LoginPage /></S></AuthProvider>,
  },
  {
    path: '/register',
    element: <S><RegisterPage /></S>,
  },
  {
    path: '/logged-out',
    element: <S><LoggedOutPage /></S>,
  },
  {
    path: '/admin/logged-out',
    element: <S><AdminLoggedOutPage /></S>,
  },
  {
    // Public visitor conversation page — no auth required
    path: '/conversation/:threadId',
    element: <S><ConversationPage /></S>,
  },
  {
    path: '/admin/login',
    element: <AdminAuthProvider><S><AdminLoginPage /></S></AdminAuthProvider>,
  },
  // Dashboard routes
  {
    path: '/dashboard',
    element: <AuthProvider><S><DashboardLayout /></S></AuthProvider>,
    children: [
      { path: 'overview', element: <S><DashboardOverview /></S> },
      { path: 'profile', element: <S><DashboardProfile /></S> },
      { path: 'links', element: <S><DashboardLinks /></S> },
      { path: 'qr-code', element: <S><DashboardQR /></S> },
      { path: 'enquiries', element: <S><DashboardEnquiries /></S> },
      { path: 'analytics', element: <S><DashboardAnalytics /></S> },
      { path: 'themes', element: <S><DashboardThemes /></S> },
      { path: 'billing', element: <S><DashboardBilling /></S> },
      { path: 'points', element: <Navigate to="/dashboard/referral" replace /> },
      { path: 'referral', element: <S><DashboardReferral /></S> },
      { path: 'affiliate', element: <S><DashboardAffiliate /></S> },
      { path: 'messages', element: <S><DashboardMessages /></S> },
      { path: 'settings', element: <S><DashboardSettings /></S> },
      { path: 'account', element: <S><DashboardAccount /></S> },
    ],
  },
  // Admin routes — AdminAuthProvider loads session; AdminGuard enforces role=admin
  // AdminLayout is the shell; AdminGuard sits between provider and layout.
  {
    path: '/admin',
    element: (
      <AdminAuthProvider>
        <AdminGuard />
      </AdminAuthProvider>
    ),
    children: [
      {
        element: <S><AdminLayout /></S>,
        children: [
          { index: true, element: <S><AdminDashboard /></S> },
          { path: 'users', element: <S><AdminUsers /></S> },
          { path: 'profiles', element: <S><AdminProfiles /></S> },
          { path: 'enquiries', element: <S><AdminEnquiries /></S> },
          { path: 'plans', element: <S><AdminPlans /></S> },
          { path: 'analytics', element: <S><AdminAnalytics /></S> },
          { path: 'settings', element: <S><AdminSettings /></S> },
          { path: 'audit', element: <S><AdminAudit /></S> },
          { path: 'legal', element: <S><AdminLegal /></S> },
          { path: 'partner-enquiries', element: <S><AdminPartnerEnquiries /></S> },
          { path: 'support-requests', element: <S><AdminSupportRequests /></S> },
          { path: 'referrals', element: <S><AdminReferrals /></S> },
          { path: 'affiliates', element: <S><AdminAffiliates /></S> },
          { path: 'points', element: <S><AdminPoints /></S> },
          { path: 'issue-reports', element: <S><AdminIssueReports /></S> },
        ],
      },
    ],
  },
  // Partners page
  {
    path: '/partners',
    element: <S><PartnersPage /></S>,
  },
  // Legal pages
  {
    path: '/legal/privacy',
    element: <S><PrivacyPage /></S>,
  },
  {
    path: '/legal/terms',
    element: <S><TermsPage /></S>,
  },
  {
    path: '/legal/cookies',
    element: <S><CookiesPage /></S>,
  },
  {
    path: '/report-issue',
    element: <S><ReportIssuePage /></S>,
  },
  // Public profile pages — plan-prefixed personal: /F/username  /S/username  /P/username
  {
    path: '/:prefix/:username',
    element: <S><PublicProfile /></S>,
  },
  // Business profiles: /Smith-Design-Studio/Jane-Smith
  {
    path: '/:bizSlug/:personSlug',
    element: <S><BusinessProfile /></S>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export type Path = '/' | '/login' | '/admin/login';
export type Params = Record<string, string | undefined>;
