import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration, useLocation } from 'react-router-dom';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import MaintenanceGate from '@/components/MaintenanceGate';
import AccessibilityBubble from '@/components/AccessibilityBubble';
import { useFeatureConfig } from '@/lib/feature-config-context';
import type { A11ySettings } from '@/components/AccessibilityBubble';

// Pages that manage their own full-screen layout (no shared header/footer)
const STANDALONE_PATHS = [
  '/dashboard',
  '/documents',
  '/builders',
  '/settings',
  '/pricing',
  '/login',
  '/register',
  '/forgot-password',
];

function isStandalone(pathname: string) {
  return STANDALONE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

interface RootLayoutProps {
  children: ReactElement;
}

function A11yBubbleWrapper({ hasSupportBubble }: { hasSupportBubble?: boolean }) {
  const { config } = useFeatureConfig();
  const a11ySettings: Partial<A11ySettings> = {
    enabled: config.a11y_enabled,
    position: config.a11y_position,
    features: {
      fontSize:      config.a11y_feat_font_size,
      highContrast:  config.a11y_feat_contrast,
      reduceMotion:  config.a11y_feat_motion,
      dyslexiaFont:  config.a11y_feat_dyslexia,
      underlineLinks: config.a11y_feat_links,
      grayscale:     config.a11y_feat_grayscale,
    },
  };
  return <AccessibilityBubble settings={a11ySettings} hasSupportBubble={hasSupportBubble} />;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();
  const standalone = isStandalone(location.pathname);

  if (standalone) {
    return (
      <Website>
        <Helmet>
          <title>JA Document Hub — Professional Document Builder</title>
          <meta name="description" content="Generate professional documents in minutes. Employment letters, board minutes, privacy policies, HR documents and more. Operated by JA Group Services." />
        </Helmet>
        <ScrollRestoration />
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <MaintenanceGate>
          <main id="main-content">
            {children}
          </main>
        </MaintenanceGate>
        <A11yBubbleWrapper hasSupportBubble />
      </Website>
    );
  }

  return (
    <Website>
      <Helmet>
        <title>JA Document Hub — Professional Document Builder</title>
        <meta name="description" content="Generate professional documents in minutes. Employment letters, board minutes, privacy policies, HR documents and more. Operated by JA Group Services." />
      </Helmet>
      <ScrollRestoration />
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <Header />
      <MaintenanceGate>
        <main id="main-content">
          {children}
        </main>
      </MaintenanceGate>
      <Footer />
      <A11yBubbleWrapper hasSupportBubble />
    </Website>
  );
}
