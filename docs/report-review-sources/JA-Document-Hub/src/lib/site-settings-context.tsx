/**
 * SiteSettingsContext — global, cached public site settings.
 *
 * Provides three distinct naming fields:
 *   siteName    — product/platform name  (e.g. "JA Document Hub")
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
  siteName:    string;   // product name  — "JA Document Hub"
  brandName:   string;   // public brand  — "JA Group Services"
  companyName: string;   // legal entity  — "JA Group Services Ltd"
  tagline:     string;
  supportEmail: string;
  logoUrl:     string;
}

const DEFAULTS: SiteSettings = {
  siteName:    'JA Document Hub',
  brandName:   'JA Group Services',
  companyName: 'JA Group Services Ltd',
  tagline:     'Professional Documents, Generated in Minutes',
  supportEmail: 'support@jagroupservices.co.uk',
  logoUrl:     '',
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
          supportEmail: s['support_email'] || DEFAULTS.supportEmail,
          logoUrl:     s['logo_url']     || DEFAULTS.logoUrl,
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
