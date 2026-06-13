import { lazy, Suspense } from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';

import AiroErrorBoundary from '../dev-tools/src/AiroErrorBoundary';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
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
import SupportChatbot from '@/components/SupportChatbot';

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

const routeTree: RouteObject[] = [
  // Customer routes — wrapped in RootLayout (header + footer)
  {
    element:
      import.meta.env.MODE === 'development' ? (
        <AiroErrorBoundary>{rootElement}</AiroErrorBoundary>
      ) : (
        rootElement
      ),
    children: routes,
  },
  // Admin routes — rendered WITHOUT RootLayout (own dark shell)
  ...adminRoutes,
  // Reseller portal routes — rendered WITHOUT RootLayout (own sidebar shell)
  ...resellerRoutes,
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
              {/* Support chatbot — visible on all customer-facing pages */}
              <SupportChatbot />
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
