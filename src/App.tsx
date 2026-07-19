import { lazy, Suspense } from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';

import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import RouteErrorPage from '@/components/RouteErrorPage';
import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import { routes, adminRoutes, resellerRoutes } from './routes';
import { AuthProvider } from './lib/auth-context';
import { AdminProvider } from './lib/admin-context';
import { ThemeProvider } from './lib/theme-context';
import { AdminThemeProvider } from './lib/admin-theme-context';
import { FeatureConfigProvider } from './lib/feature-config-context';
import { SiteSettingsProvider } from './lib/site-settings-context';
import { ResellerAuthProvider } from './lib/reseller-auth-context';
import AIHelpChatbot from '@/components/AIHelpChatbot';

const StandardBusinessHomePage = lazy(() => import('./pages/home'));
const StandardBusinessPlansPage = lazy(() => import('./pages/plans'));
const AdminAIChatbotPage = lazy(() => import('./pages/admin/ai-chatbot'));

const CookieBanner = lazy(() =>
  import('@/components/CookieBanner').catch((error) => {
    console.warn('Failed to load CookieBanner:', error);
    return { default: () => null };
  })
);

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

const rootElement = (
  <Suspense fallback={<SpinnerFallback />}>
    <RootLayout>
      <Outlet />
    </RootLayout>
  </Suspense>
);

const retainedCustomerRoutes = routes.filter(route => !['/', '/pricing'].includes(String(route.path || '')));
const customerRoutes: RouteObject[] = [
  { path: '/', element: <StandardBusinessHomePage /> },
  { path: '/home', element: <StandardBusinessHomePage /> },
  { path: '/plans', element: <StandardBusinessPlansPage /> },
  { path: '/pricing', element: <StandardBusinessPlansPage /> },
  ...retainedCustomerRoutes,
];

const errorElement = <RouteErrorPage />;
const withErrorPage = (route: RouteObject): RouteObject => ({
  ...route,
  errorElement: route.errorElement ?? errorElement,
});

const routeTree: RouteObject[] = [
  {
    element: rootElement,
    errorElement,
    children: customerRoutes,
  },
  {
    path: '/admin/ai-chatbot',
    element: (
      <Suspense fallback={<SpinnerFallback />}>
        <AdminAIChatbotPage />
      </Suspense>
    ),
    errorElement,
  },
  ...adminRoutes.map(withErrorPage),
  ...resellerRoutes.map(withErrorPage),
];

const router = createBrowserRouter(routeTree);

export default function App() {
  return (
    <SiteSettingsProvider>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <AdminThemeProvider>
            <div id="admin-theme-root">
            <FeatureConfigProvider>
            <ResellerAuthProvider>
            <>
              <RouterProvider router={router} />
              <CookieBannerErrorBoundary>
                <Suspense fallback={null}>
                  <CookieBanner />
                </Suspense>
              </CookieBannerErrorBoundary>
              <AIHelpChatbot />
            </>
            </ResellerAuthProvider>
            </FeatureConfigProvider>
            </div>
          </AdminThemeProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
    </SiteSettingsProvider>
  );
}
