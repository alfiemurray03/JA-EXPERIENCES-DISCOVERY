import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'c2_analytics_consent';
const COOKIE_CONSENT_EXPIRES_DAYS = 365;

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  // Set cookie with SameSite=Lax for better compatibility across domains
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;Secure`;
}

interface CookieConsent {
  analytics: boolean;
  timestamp: number;
}

declare global {
  interface Window {
    _signalsDataLayer?: unknown[];
    revokeAnalyticsConsent?: () => void;
    openCookieSettings?: () => void;
    __SCC_INIT__?: boolean;
    dataLayer?: unknown[];
  }
}

// Load Google Analytics
async function initGoogleAnalytics(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Fetch GA ID from backend API
    const response = await fetch('/api/config/analytics');
    const data = await response.json();
    const GA_ID = data.gaId;
    
    if (!GA_ID) return;

    // Load gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
}

// Inline C2 tracking - loads script and tracks clicks/pageviews
function initC2Tracking(): void {
  if (typeof window === 'undefined' || window.__SCC_INIT__) return;
  window.__SCC_INIT__ = true;
  window._signalsDataLayer = window._signalsDataLayer || [];

  const track = (eid: string, type: string, label: string, props?: Record<string, unknown>) => {
    window._signalsDataLayer!.push({
      schema: 'add_event', version: 'v1',
      data: { eid, type, event_label: label, custom_properties: { ...props, timestamp: new Date().toISOString(), source: 'airo-app-builder' } }
    });
  };

  const getSection = (el: HTMLElement): string => {
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    if (el.closest('nav')) return 'nav';
    if (el.closest('main')) return 'main';
    return 'page';
  };

  const getDevice = (): string => {
    const w = window.innerWidth;
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  };

  // Initial events
  track('airo.website.session', 'session', 'start', { page_path: location.pathname, referrer: document.referrer });
  track('airo.website.pageview', 'pageview', document.title, { page_path: location.pathname, referrer: document.referrer });

  // Click tracking
  // Capture phase (true) ensures we track clicks even if event.stopPropagation() is called
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement)?.closest('a, button, [role="button"]') as HTMLElement;
    if (!el) return;
    const text = el.textContent?.trim()?.substring(0, 100) || '';
    const href = (el as HTMLAnchorElement).href || '';
    const type = el.tagName.toLowerCase() === 'a' ? 'link' : 'button';

    let isExternal: boolean | undefined;
    if (href) {
      try {
        isExternal = new URL(href, location.origin).origin !== location.origin;
      } catch {
        // Malformed URL, treat as internal
      }
    }

    track('airo.website.click', 'click', text || type, {
      element_type: type,
      element_text: text,
      element_id: el.id || undefined,
      section: getSection(el),
      page_path: location.pathname,
      page_title: document.title,
      href: href || undefined,
      is_external: href ? isExternal : undefined,
      device: getDevice(),
      viewport_width: window.innerWidth
    });
  }, true);

  // Route tracking
  let lastUrl = location.href;
  const trackPage = () => {
    if (location.href !== lastUrl) {
      track('airo.website.pageview', 'pageview', document.title, { page_path: location.pathname, referrer: lastUrl });
      lastUrl = location.href;
    }
  };
  window.addEventListener('popstate', trackPage);
  const push = history.pushState, replace = history.replaceState;
  history.pushState = (...args) => { push.apply(history, args); setTimeout(trackPage, 0); };
  history.replaceState = (...args) => { replace.apply(history, args); setTimeout(trackPage, 0); };

  // Load SCC script
  const h = location.hostname;
  const url = h === 'localhost' || h.includes('dev-airoapp')
    ? 'https://img1.dev-wsimg.com/signals/js/clients/scc-c2/scc-c2.js'
    : h.includes('test-airoapp')
      ? 'https://img1.test-wsimg.com/signals/js/clients/scc-c2/scc-c2.min.js'
      : 'https://img1.wsimg.com/signals/js/clients/scc-c2/scc-c2.min.js';
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Cookie banner component for C2 analytics consent
 *
 * Displays a consent banner for C2 analytics tracking. Manages user consent
 * preferences in localStorage and controls whether analytics scripts are loaded.
 */
export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(function checkConsent() {
    if (typeof window === 'undefined') return;

    // Check both cookie and localStorage for backwards compatibility
    const cookieData = getCookie(COOKIE_CONSENT_KEY);
    const localStorageData = localStorage.getItem(COOKIE_CONSENT_KEY);
    const consentData = cookieData || localStorageData;

    if (!consentData) {
      setShowBanner(true);
      setIsLoaded(true);
      return;
    }

    try {
      const consent: CookieConsent = JSON.parse(consentData);
      const daysSinceConsent = (Date.now() - consent.timestamp) / (1000 * 60 * 60 * 24);

      if (daysSinceConsent > COOKIE_CONSENT_EXPIRES_DAYS) {
        deleteCookie(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setShowBanner(true);
      } else if (consent.analytics) {
        initC2Tracking();
        initGoogleAnalytics();
      }
    } catch {
      deleteCookie(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      setShowBanner(true);
    }

    setIsLoaded(true);
  }, []);

  function saveConsent(analytics: boolean) {
    const consentData = JSON.stringify({ analytics, timestamp: Date.now() });
    // Save to both cookie and localStorage for maximum compatibility
    setCookie(COOKIE_CONSENT_KEY, consentData, COOKIE_CONSENT_EXPIRES_DAYS);
    localStorage.setItem(COOKIE_CONSENT_KEY, consentData);
    if (analytics) {
      initC2Tracking();
      initGoogleAnalytics();
    }
    setShowBanner(false);
  }

  function revokeConsent() {
    if (typeof window === 'undefined') return;
    deleteCookie(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setShowBanner(true);
  }

  function openSettings() {
    if (typeof window === 'undefined') return;
    // Trigger the footer's cookie settings dialog
    const event = new CustomEvent('openCookieSettings');
    window.dispatchEvent(event);
  }

  useEffect(function exposeRevokeFunction() {
    if (typeof window === 'undefined') return;
    window.revokeAnalyticsConsent = revokeConsent;
    window.openCookieSettings = openSettings;
    return () => { 
      delete window.revokeAnalyticsConsent;
      delete window.openCookieSettings;
    };
  }, []);

  if (!isLoaded || !showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A1F44]/95 backdrop-blur-sm border-t border-white/10 shadow-lg"
      role="alertdialog"
      aria-live="polite"
      aria-label="Cookie consent banner"
      aria-describedby="cookie-banner-description"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p id="cookie-banner-description" className="text-sm text-white">
              We use cookies to improve your experience. We use essential cookies to make this website work and optional cookies to help us understand how the site is used, improve performance, and support our services.{' '}
              <a href="/cookies-policy" className="underline hover:text-white/80">Cookie Policy</a>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => saveConsent(false)} className="whitespace-nowrap border-white/20 text-white hover:bg-white/10">Decline</Button>
            <Button size="sm" variant="outline" onClick={openSettings} className="whitespace-nowrap border-white/20 text-white hover:bg-white/10">Settings</Button>
            <Button size="sm" onClick={() => saveConsent(true)} className="whitespace-nowrap bg-[#2563EB] hover:bg-[#2563EB]/90 text-white" autoFocus>Accept</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
