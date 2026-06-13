import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';

import CorporatePage from './pages/corporate';
import AboutUsPage from './pages/about-us';

import AboutOurDivisionsPage from './pages/about-our-divisions';
import OurGroupStructurePage from './pages/our-group-structure';
import RecommendedServicesPage from './pages/recommended-services';
import FindActivitiesToursPage from './pages/find-activities-tours';
import CookiesPolicyPage from './pages/cookies-policy';
import ContactUsPage from './pages/contact-us';
import ComplaintsPolicyPage from './pages/complaints-policy';
import PrivacyPolicyPage from './pages/privacy-policy';
import TermsOfServicePage from './pages/terms-of-service';
import JSDSGroupPage from './pages/jsds-group';

import AnnouncementsPage from './pages/announcements';
import SitemapPage from './pages/sitemap';
import TidePartnershipPage from './pages/partners-tide';

// Lazy load components for code splitting
const isDevelopment = import.meta.env.MODE === 'development';
const NotFoundPage = isDevelopment ? lazy(() => import('../dev-tools/src/PageNotFound')) : lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },

  {
    path: '/corporate',
    element: <CorporatePage />,
  },
  {
    path: '/about-us',
    element: <AboutUsPage />,
  },

  {
    path: '/about-our-divisions',
    element: <AboutOurDivisionsPage />,
  },
  {
    path: '/our-group-structure',
    element: <OurGroupStructurePage />,
  },
  {
    path: '/recommended-services',
    element: <RecommendedServicesPage />,
  },
  {
    path: '/find-activities-tours',
    element: <FindActivitiesToursPage />,
  },
  {
    path: '/cookies-policy',
    element: <CookiesPolicyPage />,
  },
  {
    path: '/contactus',
    element: <ContactUsPage />,
  },
  {
    path: '/complaints-policy',
    element: <ComplaintsPolicyPage />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms-of-service',
    element: <TermsOfServicePage />,
  },
  {
    path: '/announcements',
    element: <AnnouncementsPage />,
  },
  {
    path: '/sitemap',
    element: <SitemapPage />,
  },
  {
    path: '/partners/tide',
    element: <TidePartnershipPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Standalone routes (no header/footer)
export const standaloneRoutes: RouteObject[] = [
  {
    path: '/jsds-group',
    element: <JSDSGroupPage />,
  },
];

// Types for type-safe navigation
export type Path = '/' | '/about-us' | '/about-our-divisions' | '/our-group-structure' | '/recommended-services' | '/find-activities-tours' | '/cookies-policy' | '/contactus' | '/complaints-policy' | '/privacy-policy' | '/terms-of-service' | '/announcements' | '/sitemap' | '/jsds-group' | '/partners/tide';

export type Params = Record<string, string | undefined>;
