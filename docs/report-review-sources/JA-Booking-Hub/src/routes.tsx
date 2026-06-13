import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import ProdNotFoundPage from './pages/_404';

// Marketing pages
const PricingPage = lazy(() => import('./pages/pricing'));
const CategoriesPage = lazy(() => import('./pages/categories'));
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));

// Public business pages
const BusinessPage = lazy(() => import('./pages/b/BusinessPage'));
const BookingFlow = lazy(() => import('./pages/book/BookingFlow'));

// Auth callback + logout pages
const AuthCallbackPage = lazy(() => import('./pages/auth/callback'));
const AdminAuthCallbackPage = lazy(() => import('./pages/admin/auth/callback'));
const LogoutPage = lazy(() => import('./pages/logout'));
const AdminLogoutPage = lazy(() => import('./pages/admin/logout'));

// Dashboard pages
const DashboardHome = lazy(() => import('./pages/dashboard/index'));
const AppointmentsPage = lazy(() => import('./pages/dashboard/appointments'));
const ServicesPage = lazy(() => import('./pages/dashboard/services'));
const StaffPage = lazy(() => import('./pages/dashboard/staff'));
const CustomersPage = lazy(() => import('./pages/dashboard/customers'));
const PaymentsPage = lazy(() => import('./pages/dashboard/payments'));
const ReviewsPage = lazy(() => import('./pages/dashboard/reviews'));
const ReportsPage = lazy(() => import('./pages/dashboard/reports'));
const GalleryPage = lazy(() => import('./pages/dashboard/gallery'));
const MembershipsPage = lazy(() => import('./pages/dashboard/memberships'));
const LoyaltyPage = lazy(() => import('./pages/dashboard/loyalty'));
const ProfileSettingsPage = lazy(() => import('./pages/dashboard/settings/profile'));
const AvailabilitySettingsPage = lazy(() => import('./pages/dashboard/settings/availability'));
const DomainSettingsPage = lazy(() => import('./pages/dashboard/settings/domain'));
const BillingSettingsPage = lazy(() => import('./pages/dashboard/settings/billing'));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/login'));
const AdminDashboard = lazy(() => import('./pages/admin/index'));
const AdminBusinesses = lazy(() => import('./pages/admin/businesses'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const AdminBilling = lazy(() => import('./pages/admin/billing'));
const AdminCategories = lazy(() => import('./pages/admin/categories'));
const AdminBookings = lazy(() => import('./pages/admin/bookings'));

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : ProdNotFoundPage;

export const routes: RouteObject[] = [
  // ── Marketing ──────────────────────────────────────────────────────────────
  { path: '/', element: <HomePage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/categories', element: <CategoriesPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // ── Auth callbacks + logout ────────────────────────────────────────────────
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/logout', element: <LogoutPage /> },
  { path: '/admin/auth/callback', element: <AdminAuthCallbackPage /> },
  { path: '/admin/logout', element: <AdminLogoutPage /> },

  // ── Public business pages ──────────────────────────────────────────────────
  { path: '/b/:businessSlug', element: <BusinessPage /> },
  { path: '/book/:businessSlug', element: <BookingFlow /> },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  { path: '/dashboard', element: <DashboardHome /> },
  { path: '/dashboard/appointments', element: <AppointmentsPage /> },
  { path: '/dashboard/services', element: <ServicesPage /> },
  { path: '/dashboard/staff', element: <StaffPage /> },
  { path: '/dashboard/customers', element: <CustomersPage /> },
  { path: '/dashboard/payments', element: <PaymentsPage /> },
  { path: '/dashboard/reviews', element: <ReviewsPage /> },
  { path: '/dashboard/reports', element: <ReportsPage /> },
  { path: '/dashboard/gallery', element: <GalleryPage /> },
  { path: '/dashboard/memberships', element: <MembershipsPage /> },
  { path: '/dashboard/loyalty', element: <LoyaltyPage /> },
  { path: '/dashboard/settings/profile', element: <ProfileSettingsPage /> },
  { path: '/dashboard/settings/availability', element: <AvailabilitySettingsPage /> },
  { path: '/dashboard/settings/domain', element: <DomainSettingsPage /> },
  { path: '/dashboard/settings/billing', element: <BillingSettingsPage /> },

  // ── Admin ──────────────────────────────────────────────────────────────────
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/businesses', element: <AdminBusinesses /> },
  { path: '/admin/users', element: <AdminUsers /> },
  { path: '/admin/billing', element: <AdminBilling /> },
  { path: '/admin/categories', element: <AdminCategories /> },
  { path: '/admin/bookings', element: <AdminBookings /> },

  // ── 404 ────────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
];

export type Path =
  | '/'
  | '/pricing'
  | '/categories'
  | '/login'
  | '/register'
  | '/auth/callback'
  | '/admin/auth/callback'
  | '/dashboard'
  | '/dashboard/appointments'
  | '/dashboard/services'
  | '/dashboard/staff'
  | '/dashboard/customers'
  | '/dashboard/payments'
  | '/dashboard/reviews'
  | '/dashboard/reports'
  | '/dashboard/gallery'
  | '/dashboard/memberships'
  | '/dashboard/loyalty'
  | '/dashboard/settings/profile'
  | '/dashboard/settings/availability'
  | '/dashboard/settings/domain'
  | '/dashboard/settings/billing'
  | '/admin/login'
  | '/admin'
  | '/admin/businesses'
  | '/admin/users'
  | '/admin/billing'
  | '/admin/categories'
  | '/admin/bookings';

export type Params = Record<string, string | undefined>;
