import { lazy, Suspense } from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
  useLocation,
} from 'react-router-dom';

import AiroErrorBoundary from '../dev-tools/src/AiroErrorBoundary';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import Spinner from './components/Spinner';
import { routes } from './routes';
import { SiteThemeProvider } from './lib/site-theme';
import AccessibilityWidget from '@/components/AccessibilityWidget';

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

/** Renders accessibility + cookie widgets only on the public homepage */
function HomepageWidgets() {
  const location = useLocation();
  if (location.pathname !== '/') return null;
  return (
    <>
      <CookieBannerErrorBoundary>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </CookieBannerErrorBoundary>
      <AccessibilityWidget />
    </>
  );
}

function RootShell() {
  return (
    <>
      <Suspense fallback={<SpinnerFallback />}>
        <Outlet />
      </Suspense>
      <HomepageWidgets />
    </>
  );
}

const routeTree: RouteObject[] = [
  {
    element:
      import.meta.env.MODE === 'development' ? (
        <AiroErrorBoundary><RootShell /></AiroErrorBoundary>
      ) : (
        <RootShell />
      ),
    children: routes,
  },
];

const router = createBrowserRouter(routeTree);

export default function App() {
  return (
    <SiteThemeProvider>
      <RouterProvider router={router} />
    </SiteThemeProvider>
  );
}
