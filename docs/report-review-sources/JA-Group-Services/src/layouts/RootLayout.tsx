import { Component, lazy, ReactElement, ReactNode, Suspense, type ErrorInfo, useEffect, useState } from 'react';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { AppBottomNav } from '@/components/AppBottomNav';
import { AppHeader } from '@/components/AppHeader';
import ScrollToTop from '@/components/ScrollToTop';
import { useLocation } from 'react-router-dom';

// Lazy load CookieBanner - if blocked by ad blockers, the app continues without it
const CookieBanner = lazy(() =>
import('@/components/CookieBanner').catch((error) => {
  console.warn('Failed to load CookieBanner:', error);
  return {
    default: () => null
  };
})
);

// Error boundary to catch any render errors from CookieBanner
class CookieBannerErrorBoundary extends Component<
  {children: ReactNode;},
  {hasError: boolean;}>
{
  constructor(props: {children: ReactNode;}) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(error: unknown): {hasError: boolean;} {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('CookieBanner error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/**
 * Root layout component - Production ready, no beta banners
 */
interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isPWA, setIsPWA] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Detect if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isIOSStandalone);
  }, []);

  // Ensure page always opens at the top (multiple methods for reliability)
  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Force scroll on document and body elements
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    
    // Delayed scroll to catch late renders
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location]);

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/find-activities-tours') return 'Activities & Tours';
    if (path === '/recommended-services') return 'Services';
    if (path === '/contactus') return 'Contact Us';
    if (path === '/about-us') return 'About Us';
    if (path === '/about-our-divisions') return 'Our Divisions';
    if (path === '/corporate') return 'Corporate';

    return 'JA Group Services';
  };

  // PWA Mode - App-like layout
  if (isPWA) {
    return (
      <Website>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <AppHeader title={getPageTitle()} />
          <main className="pb-8">
            {children}
          </main>
          <AppBottomNav />
        </div>
        <CookieBannerErrorBoundary>
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
        </CookieBannerErrorBoundary>
      </Website>);

  }

  // Browser Mode - Traditional layout (PRODUCTION READY - NO BANNERS)
  return (
    <Website>
      <ScrollToTop />
      <Header />
      {children}
      <Footer />
      <CookieBannerErrorBoundary>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </CookieBannerErrorBoundary>
    </Website>);

}