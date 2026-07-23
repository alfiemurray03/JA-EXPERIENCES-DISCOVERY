/**
 * SiteSettingsContext — global, cached public site settings.
 *
 * Provides three distinct naming fields:
 *   siteName    — product/platform name  (e.g. "Planyx")
 *   brandName   — public-facing brand    (e.g. "JA Group Services")
 *   companyName — legal entity name      (e.g. "JA Group Services Ltd")
 *
 * Rule:
 *   • Customer-facing UI, page titles, dashboards → siteName / brandName
 *   • Legal pages (T&C, Privacy, Cookies, Contracts, Invoices) → companyName
 *
 * Settings are fetched once on app load and cached in context.
 * Components consume via the `useSiteSettings()` hook.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SiteSettings {
  siteName:    string;   // product name  — "Planyx"
  brandName:   string;   // public brand  — "JA Group Services"
  companyName: string;   // legal entity  — "JA Group Services Ltd"
  tagline:     string;
  supportEmail: string;
  logoUrl:     string;
  googleAnalyticsId: string;
}

const DEFAULTS: SiteSettings = {
  siteName:    'Planyx',
  brandName:   'JA Group Services',
  companyName: 'JA Group Services Ltd',
  tagline:     'Personalised Plans, Generated in Minutes',
  supportEmail: 'japlanstudio@jagroupservices.co.uk',
  logoUrl:     '',
  googleAnalyticsId: 'G-50QJHHL7H7',
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULTS);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch('/api/site-settings/public')
      .then(r => r.json() as Promise<{ success: boolean; settings?: Record<string, string> }>)
      .then(d => {
        if (!d.success || !d.settings) return;
        const s = d.settings;
        setSettings({
          siteName:    s['site_name']    || DEFAULTS.siteName,
          brandName:   s['brand_name']   || DEFAULTS.brandName,
          companyName: s['company_name'] || DEFAULTS.companyName,
          tagline:     s['tagline']      || DEFAULTS.tagline,
          supportEmail: DEFAULTS.supportEmail,
          logoUrl:     s['logo_url']     || DEFAULTS.logoUrl,
          googleAnalyticsId: s['google_analytics_id'] || DEFAULTS.googleAnalyticsId,
        });
      })
      .catch(() => { /* use defaults */ });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
