/**
 * Admin — Site Settings
 * Branding, navigation links, footer links, contact info, feature flags, and maintenance mode.
 * Tabbed interface. Platform Owner / Super Admin only.
 * All settings persisted to ja_site_settings via /api/admin/site-settings.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Save, CheckCircle2, AlertTriangle,
  Palette, ToggleLeft, ToggleRight, GripVertical,
  Building2, Navigation, Footprints, Accessibility,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavLink { id: string; label: string; href: string; openNewTab: boolean; }
interface FooterLink { id: string; label: string; href: string; group: string; }

interface A11yConfig {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  featFontSize: boolean;
  featContrast: boolean;
  featMotion: boolean;
  featDyslexia: boolean;
  featLinks: boolean;
  featGrayscale: boolean;
}

interface SiteConfig {
  siteName: string;
  brandName: string;       // public-facing brand — "JA Group Services"
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  companyName: string;     // legal entity — "JA Group Services Ltd"
  companyAddress: string;
  companyNumber: string;
  vatNumber: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  freeTrialEnabled: boolean;
  affiliateComingSoon: boolean;
  googleAnalyticsId: string;
  cookieBannerEnabled: boolean;
  navLinks: NavLink[];
  footerLinks: FooterLink[];
}

// ── Seed ──────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SiteConfig = {
  siteName:    'JA Document Hub',
  brandName:   'JA Group Services',
  tagline:     'Professional Documents, Generated in Minutes',
  supportEmail: 'support@jagroupservices.co.uk',
  supportPhone: '',
  companyName: 'JA Group Services Ltd',
  companyAddress: 'United Kingdom',
  companyNumber: '',
  vatNumber: '',
  primaryColor: '#1B4F8A',
  accentColor: '#8a561b',
  logoUrl: '',
  faviconUrl: '',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. We will be back shortly.',
  registrationEnabled: true,
  freeTrialEnabled: true,
  affiliateComingSoon: true,
  googleAnalyticsId: '',
  cookieBannerEnabled: true,
  navLinks: [
    { id: 'nl-1', label: 'Pricing', href: '/pricing', openNewTab: false },
    { id: 'nl-2', label: 'Contact', href: '/contact', openNewTab: false },
  ],
  footerLinks: [
    { id: 'fl-1', label: 'Privacy Policy',    href: '/privacy',     group: 'Legal' },
    { id: 'fl-2', label: 'Terms & Conditions', href: '/terms',       group: 'Legal' },
    { id: 'fl-3', label: 'Cookie Policy',      href: '/cookies',     group: 'Legal' },
    { id: 'fl-4', label: 'Pricing',            href: '/pricing',     group: 'Company' },
    { id: 'fl-5', label: 'Contact',            href: '/contact',     group: 'Company' },
  ],
};

const STORAGE_KEY = 'ja_admin_site_settings_v1';
const A11Y_STORAGE_KEY = 'ja_admin_a11y_settings_v1';

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiGetSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/admin/site-settings', { credentials: 'include' });
    const data = await res.json() as { success: boolean; settings?: Record<string, string> };
    if (data.success && data.settings) return data.settings;
  } catch { /* fallback */ }
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch { /* ignore */ }
  return {};
}

async function apiSaveSettings(settings: Record<string, string>): Promise<void> {
  await fetch('/api/admin/site-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ settings }),
  });
  // Also persist to localStorage as cache
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Record<string, string>;
      return settingsToConfig(s);
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

function settingsToConfig(s: Record<string, string>): SiteConfig {
  return {
    ...DEFAULT_CONFIG,
    siteName:            s['site_name']            ?? DEFAULT_CONFIG.siteName,
    brandName:           s['brand_name']           ?? DEFAULT_CONFIG.brandName,
    tagline:             s['tagline']              ?? DEFAULT_CONFIG.tagline,
    supportEmail:        s['support_email']        ?? DEFAULT_CONFIG.supportEmail,
    supportPhone:        s['support_phone']        ?? DEFAULT_CONFIG.supportPhone,
    companyName:         s['company_name']         ?? DEFAULT_CONFIG.companyName,
    companyAddress:      s['company_address']      ?? DEFAULT_CONFIG.companyAddress,
    companyNumber:       s['company_number']       ?? DEFAULT_CONFIG.companyNumber,
    vatNumber:           s['vat_number']           ?? DEFAULT_CONFIG.vatNumber,
    primaryColor:        s['primary_color']        ?? DEFAULT_CONFIG.primaryColor,
    accentColor:         s['accent_color']         ?? DEFAULT_CONFIG.accentColor,
    logoUrl:             s['logo_url']             ?? DEFAULT_CONFIG.logoUrl,
    faviconUrl:          s['favicon_url']          ?? DEFAULT_CONFIG.faviconUrl,
    maintenanceMode:     s['maintenance_mode']     === 'true',
    maintenanceMessage:  s['maintenance_message']  ?? DEFAULT_CONFIG.maintenanceMessage,
    registrationEnabled: s['registration_enabled'] !== 'false',
    freeTrialEnabled:    s['free_trial_enabled']   !== 'false',
    affiliateComingSoon: s['affiliate_coming_soon'] !== 'false',
    googleAnalyticsId:   s['google_analytics_id']  ?? DEFAULT_CONFIG.googleAnalyticsId,
    cookieBannerEnabled: s['cookie_banner_enabled'] !== 'false',
    navLinks:   s['nav_links']   ? JSON.parse(s['nav_links'])   as NavLink[]   : DEFAULT_CONFIG.navLinks,
    footerLinks: s['footer_links'] ? JSON.parse(s['footer_links']) as FooterLink[] : DEFAULT_CONFIG.footerLinks,
  };
}

function configToSettings(cfg: SiteConfig): Record<string, string> {
  return {
    site_name:            cfg.siteName,
    brand_name:           cfg.brandName,
    tagline:              cfg.tagline,
    support_email:        cfg.supportEmail,
    support_phone:        cfg.supportPhone,
    company_name:         cfg.companyName,
    company_address:      cfg.companyAddress,
    company_number:       cfg.companyNumber,
    vat_number:           cfg.vatNumber,
    primary_color:        cfg.primaryColor,
    accent_color:         cfg.accentColor,
    logo_url:             cfg.logoUrl,
    favicon_url:          cfg.faviconUrl,
    maintenance_mode:     String(cfg.maintenanceMode),
    maintenance_message:  cfg.maintenanceMessage,
    registration_enabled: String(cfg.registrationEnabled),
    free_trial_enabled:   String(cfg.freeTrialEnabled),
    affiliate_coming_soon: String(cfg.affiliateComingSoon),
    google_analytics_id:  cfg.googleAnalyticsId,
    cookie_banner_enabled: String(cfg.cookieBannerEnabled),
    nav_links:            JSON.stringify(cfg.navLinks),
    footer_links:         JSON.stringify(cfg.footerLinks),
  };
}

const DEFAULT_A11Y: A11yConfig = {
  enabled: true,
  position: 'bottom-right',
  featFontSize: true,
  featContrast: true,
  featMotion: true,
  featDyslexia: true,
  featLinks: true,
  featGrayscale: true,
};

function loadA11y(): A11yConfig {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw) return { ...DEFAULT_A11Y, ...JSON.parse(raw) as Partial<A11yConfig> };
  } catch { /* ignore */ }
  return DEFAULT_A11Y;
}

function saveA11y(cfg: A11yConfig) {
  localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(cfg));
}

// ── Toggle component ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-xs mt-0.5 text-gray-500 dark:text-slate-400">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className="shrink-0 mt-0.5">
        {checked
          ? <ToggleRight className="w-8 h-8 text-primary" />
          : <ToggleLeft className="w-8 h-8 text-gray-300 dark:text-slate-600" />
        }
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSiteSettings() {

  const [cfg, setCfg]           = useState<SiteConfig>(loadConfig);
  const [a11y, setA11y]         = useState<A11yConfig>(() => loadA11y());
  const [savedMsg, setSavedMsg] = useState('');
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [a11ySaving, setA11ySaving] = useState(false);
  const [a11ySaved, setA11ySaved]   = useState('');

  // Load from DB on mount
  useEffect(() => {
    apiGetSettings().then(s => {
      if (Object.keys(s).length > 0) setCfg(settingsToConfig(s));
    }).catch(() => {});
  }, []);

  function update(patch: Partial<SiteConfig>) {
    setCfg(c => ({ ...c, ...patch }));
    setDirty(true);
  }

  function updateA11y(patch: Partial<A11yConfig>) {
    setA11y(c => ({ ...c, ...patch }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiSaveSettings(configToSettings(cfg));
      setDirty(false);
      setSavedMsg('Settings saved successfully.');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      setSavedMsg('Save failed. Please try again.');
      setTimeout(() => setSavedMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  }

  const handleSaveA11y = useCallback(async () => {
    setA11ySaving(true);
    try {
      // Persist each key to the system-config DB via the admin API
      const keys: Array<[string, string]> = [
        ['a11y_enabled',        String(a11y.enabled)],
        ['a11y_position',       a11y.position],
        ['a11y_feat_font_size', String(a11y.featFontSize)],
        ['a11y_feat_contrast',  String(a11y.featContrast)],
        ['a11y_feat_motion',    String(a11y.featMotion)],
        ['a11y_feat_dyslexia',  String(a11y.featDyslexia)],
        ['a11y_feat_links',     String(a11y.featLinks)],
        ['a11y_feat_grayscale', String(a11y.featGrayscale)],
      ];
      for (const [key, value] of keys) {
        await fetch('/api/admin/system-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key, value }),
        });
      }
      saveA11y(a11y);
      setA11ySaved('Accessibility settings saved.');
      setTimeout(() => setA11ySaved(''), 3000);
    } catch {
      setA11ySaved('Failed to save. Please try again.');
    } finally {
      setA11ySaving(false);
    }
  }, [a11y]);

  // Load a11y settings from DB on mount
  useEffect(() => {
    fetch('/api/admin/system-config', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; config?: Record<string, string> }) => {
        if (!d.success || !d.config) return;
        const c = d.config;
        setA11y({
          enabled:      c['a11y_enabled']          !== 'false',
          position:     (c['a11y_position'] as A11yConfig['position']) ?? 'bottom-right',
          featFontSize: c['a11y_feat_font_size']   !== 'false',
          featContrast: c['a11y_feat_contrast']    !== 'false',
          featMotion:   c['a11y_feat_motion']      !== 'false',
          featDyslexia: c['a11y_feat_dyslexia']    !== 'false',
          featLinks:    c['a11y_feat_links']        !== 'false',
          featGrayscale: c['a11y_feat_grayscale']  !== 'false',
        });
      })
      .catch(() => { /* use localStorage fallback */ });
  }, []);

  // Nav links
  function addNavLink() {
    update({ navLinks: [...cfg.navLinks, { id: `nl-${Date.now()}`, label: '', href: '', openNewTab: false }] });
  }
  function updateNavLink(id: string, patch: Partial<NavLink>) {
    update({ navLinks: cfg.navLinks.map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  function removeNavLink(id: string) {
    update({ navLinks: cfg.navLinks.filter(l => l.id !== id) });
  }

  // Footer links
  function addFooterLink() {
    update({ footerLinks: [...cfg.footerLinks, { id: `fl-${Date.now()}`, label: '', href: '', group: 'Company' }] });
  }
  function updateFooterLink(id: string, patch: Partial<FooterLink>) {
    update({ footerLinks: cfg.footerLinks.map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  function removeFooterLink(id: string) {
    update({ footerLinks: cfg.footerLinks.filter(l => l.id !== id) });
  }

  const base = 'bg-white border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white';
  const muted = 'text-gray-500 dark:text-slate-400';
  const inputCls = 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500';
  const sectionCls = `rounded-xl border p-5 space-y-4 ${base}`;
  const divider = 'divide-gray-100 dark:divide-slate-800';
  const tabsCls = 'bg-gray-100 border-gray-200 dark:bg-slate-800 dark:border-slate-700';

  function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
      <div>
        <Label className={`text-xs font-medium mb-1 block ${'text-gray-700 dark:text-slate-300'}`}>{label}</Label>
        {hint && <p className={`text-[11px] mb-1.5 ${muted}`}>{hint}</p>}
        {children}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Site Settings — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminLayout title="Site Settings" subtitle="Branding, navigation, contact info, feature flags, and accessibility">
        <div className="space-y-5">

          {/* Maintenance mode banner */}
          {cfg.maintenanceMode && (
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3
              ${'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700/40 dark:text-amber-300'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Maintenance mode is currently <strong>enabled</strong>. The site is not accessible to the public.</p>
            </div>
          )}

          {savedMsg && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 border
              ${'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-700/40'}`}>
              <CheckCircle2 className="w-4 h-4" /> {savedMsg}
            </div>
          )}

          {/* Save bar */}
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${base}`}>
            <p className={`text-sm ${dirty ? ('text-amber-600 dark:text-amber-400') : muted}`}>
              {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <Button onClick={handleSave} disabled={!dirty || saving} className="bg-primary hover:bg-primary/90 text-white gap-1.5 h-9">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>

          <Tabs defaultValue="branding">
            <TabsList className={`border flex-wrap h-auto gap-1 ${tabsCls}`}>
              <TabsTrigger value="branding"       className="gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" /> Branding</TabsTrigger>
              <TabsTrigger value="company"        className="gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" /> Company</TabsTrigger>
              <TabsTrigger value="navigation"     className="gap-1.5 text-xs"><Navigation className="w-3.5 h-3.5" /> Navigation</TabsTrigger>
              <TabsTrigger value="footer"         className="gap-1.5 text-xs"><Footprints className="w-3.5 h-3.5" /> Footer</TabsTrigger>
              <TabsTrigger value="features"       className="gap-1.5 text-xs"><ToggleLeft className="w-3.5 h-3.5" /> Features</TabsTrigger>
              <TabsTrigger value="accessibility"  className="gap-1.5 text-xs"><Accessibility className="w-3.5 h-3.5" /> Accessibility</TabsTrigger>
            </TabsList>

            {/* ── Branding ── */}
            <TabsContent value="branding" className="mt-4 space-y-4">
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Platform Identity</h3>
                <p className={`text-xs ${muted}`}>The product/platform name shown in page titles, dashboards, and the browser tab.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Platform Name (Product)" hint='Shown in page titles and the browser tab — e.g. "JA Document Hub"'>
                    <Input value={cfg.siteName} onChange={e => update({ siteName: e.target.value })} className={`h-9 ${inputCls}`} />
                  </Field>
                  <Field label="Tagline">
                    <Input value={cfg.tagline} onChange={e => update({ tagline: e.target.value })} className={`h-9 ${inputCls}`} />
                  </Field>
                </div>
              </div>
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Brand Name</h3>
                <p className={`text-xs ${muted}`}>
                  The public-facing brand shown in the header, footer, marketing pages, and customer communications.
                  Do <strong>not</strong> include "Ltd" here — that belongs in the Company tab for legal use only.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label='Public Brand Name' hint='Used in header, footer, dashboards — e.g. "JA Group Services"'>
                    <Input value={cfg.brandName} onChange={e => update({ brandName: e.target.value })} className={`h-9 ${inputCls}`} />
                  </Field>
                </div>
                <div className={`rounded-lg border px-4 py-3 text-xs space-y-1 ${'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-700/40 dark:text-blue-300'}`}>
                  <p className="font-semibold">Brand vs Legal name — where each is used:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li><strong>Brand name</strong> — header, footer, login, register, dashboards, support, marketing, emails</li>
                    <li><strong>Legal name</strong> (Company tab) — Terms &amp; Conditions, Privacy Policy, Cookie Policy, contracts, invoices, compliance</li>
                  </ul>
                </div>
              </div>
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Logo &amp; Favicon</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Logo URL" hint="Hosted image URL or /assets/... path">
                    <Input value={cfg.logoUrl} onChange={e => update({ logoUrl: e.target.value })} placeholder="https://…" className={`h-9 ${inputCls}`} />
                  </Field>
                  <Field label="Favicon URL">
                    <Input value={cfg.faviconUrl} onChange={e => update({ faviconUrl: e.target.value })} placeholder="https://…" className={`h-9 ${inputCls}`} />
                  </Field>
                </div>
              </div>
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Colours</h3>
                <p className={`text-xs ${muted}`}>These values are informational — colour changes require a code deployment.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Primary Colour">
                    <div className="flex items-center gap-3">
                      <input type="color" value={cfg.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className="w-10 h-9 rounded cursor-pointer border border-gray-300 dark:border-slate-600" />
                      <Input value={cfg.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className={`h-9 font-mono text-sm flex-1 ${inputCls}`} />
                    </div>
                  </Field>
                  <Field label="Accent Colour">
                    <div className="flex items-center gap-3">
                      <input type="color" value={cfg.accentColor} onChange={e => update({ accentColor: e.target.value })} className="w-10 h-9 rounded cursor-pointer border border-gray-300 dark:border-slate-600" />
                      <Input value={cfg.accentColor} onChange={e => update({ accentColor: e.target.value })} className={`h-9 font-mono text-sm flex-1 ${inputCls}`} />
                    </div>
                  </Field>
                </div>
              </div>
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Analytics</h3>
                <Field label="Google Analytics ID" hint="e.g. G-XXXXXXXXXX">
                  <Input value={cfg.googleAnalyticsId} onChange={e => update({ googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" className={`h-9 font-mono text-sm ${inputCls}`} />
                </Field>
              </div>
            </TabsContent>

            {/* ── Company ── */}
            <TabsContent value="company" className="mt-4">
              <div className={sectionCls}>
                <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Legal Company Information</h3>
                <p className={`text-xs ${muted}`}>
                  Used only where the registered legal entity name is required — Terms &amp; Conditions, Privacy Policy, Cookie Policy, contracts, invoices, and compliance documents.
                  For the public-facing brand name, see the <strong>Branding</strong> tab.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label='Registered Legal Name' hint='Include "Ltd" here — e.g. "JA Group Services Ltd"'>
                    <Input value={cfg.companyName} onChange={e => update({ companyName: e.target.value })} className={`h-9 ${inputCls}`} />
                  </Field>
                  <Field label="Companies House Number">
                    <Input value={cfg.companyNumber} onChange={e => update({ companyNumber: e.target.value })} placeholder="12345678" className={`h-9 font-mono text-sm ${inputCls}`} />
                  </Field>
                  <Field label="VAT Number">
                    <Input value={cfg.vatNumber} onChange={e => update({ vatNumber: e.target.value })} placeholder="GB123456789" className={`h-9 font-mono text-sm ${inputCls}`} />
                  </Field>
                  <Field label="Support Email">
                    <Input value={cfg.supportEmail} onChange={e => update({ supportEmail: e.target.value })} type="email" className={`h-9 ${inputCls}`} />
                  </Field>
                  <Field label="Support Phone">
                    <Input value={cfg.supportPhone} onChange={e => update({ supportPhone: e.target.value })} type="tel" placeholder="+44 …" className={`h-9 ${inputCls}`} />
                  </Field>
                </div>
                <Field label="Registered Address">
                  <Textarea value={cfg.companyAddress} onChange={e => update({ companyAddress: e.target.value })} rows={3} className={`resize-none text-sm ${inputCls}`} />
                </Field>
              </div>
            </TabsContent>

            {/* ── Navigation ── */}
            <TabsContent value="navigation" className="mt-4">
              <div className={sectionCls}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Header Navigation Links</h3>
                  <Button onClick={addNavLink} size="sm" variant="outline"
                    className={`gap-1.5 h-8 text-xs ${'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </Button>
                </div>
                <div className="space-y-2">
                  {cfg.navLinks.map(link => (
                    <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border ${'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                      <GripVertical className={`w-4 h-4 shrink-0 ${muted}`} />
                      <Input value={link.label} onChange={e => updateNavLink(link.id, { label: e.target.value })}
                        placeholder="Label" className={`h-8 text-sm flex-1 ${inputCls}`} />
                      <Input value={link.href} onChange={e => updateNavLink(link.id, { href: e.target.value })}
                        placeholder="/path or https://…" className={`h-8 text-sm flex-1 font-mono ${inputCls}`} />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input type="checkbox" id={`nav-newtab-${link.id}`} checked={link.openNewTab}
                          onChange={e => updateNavLink(link.id, { openNewTab: e.target.checked })}
                          className="w-3.5 h-3.5 accent-primary" />
                        <label htmlFor={`nav-newtab-${link.id}`} className={`text-[11px] ${muted}`}>New tab</label>
                      </div>
                      <button onClick={() => removeNavLink(link.id)}
                        className={`p-1 rounded transition-colors shrink-0 ${'text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {cfg.navLinks.length === 0 && (
                    <p className={`text-sm text-center py-6 ${muted}`}>No navigation links configured.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Footer ── */}
            <TabsContent value="footer" className="mt-4">
              <div className={sectionCls}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Footer Links</h3>
                  <Button onClick={addFooterLink} size="sm" variant="outline"
                    className={`gap-1.5 h-8 text-xs ${'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </Button>
                </div>
                <div className="space-y-2">
                  {cfg.footerLinks.map(link => (
                    <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border ${'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                      <GripVertical className={`w-4 h-4 shrink-0 ${muted}`} />
                      <Input value={link.label} onChange={e => updateFooterLink(link.id, { label: e.target.value })}
                        placeholder="Label" className={`h-8 text-sm flex-1 ${inputCls}`} />
                      <Input value={link.href} onChange={e => updateFooterLink(link.id, { href: e.target.value })}
                        placeholder="/path" className={`h-8 text-sm flex-1 font-mono ${inputCls}`} />
                      <Input value={link.group} onChange={e => updateFooterLink(link.id, { group: e.target.value })}
                        placeholder="Group" className={`h-8 text-sm w-28 ${inputCls}`} />
                      <button onClick={() => removeFooterLink(link.id)}
                        className={`p-1 rounded transition-colors shrink-0 ${'text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {cfg.footerLinks.length === 0 && (
                    <p className={`text-sm text-center py-6 ${muted}`}>No footer links configured.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Features ── */}
            <TabsContent value="features" className="mt-4 space-y-4">
              <div className={`${sectionCls} divide-y ${divider}`}>
                <h3 className={`text-sm font-semibold pb-3 ${'text-gray-900 dark:text-white'}`}>Feature Flags</h3>
                <div className="py-4">
                  <Toggle checked={cfg.registrationEnabled} onChange={v => update({ registrationEnabled: v })}
                    label="User Registration" description="Allow new users to create accounts" />
                </div>
                <div className="py-4">
                  <Toggle checked={cfg.freeTrialEnabled} onChange={v => update({ freeTrialEnabled: v })}
                    label="Free Plan" description="Allow users to sign up on the free plan" />
                </div>
                <div className="py-4">
                  <Toggle checked={cfg.affiliateComingSoon} onChange={v => update({ affiliateComingSoon: v })}
                    label="Affiliate Programme — Coming Soon"
                    description="When enabled, the affiliate page shows a 'Coming Soon' banner and disables the application form" />
                </div>
                <div className="py-4">
                  <Toggle checked={cfg.cookieBannerEnabled} onChange={v => update({ cookieBannerEnabled: v })}
                    label="Cookie Banner" description="Show GDPR cookie consent banner to new visitors" />
                </div>
              </div>
              <div className={`${sectionCls} divide-y ${divider}`}>
                <h3 className={`text-sm font-semibold pb-3 ${'text-gray-900 dark:text-white'}`}>Maintenance Mode</h3>
                <div className="py-4">
                  <Toggle checked={cfg.maintenanceMode} onChange={v => update({ maintenanceMode: v })}
                    label="Enable Maintenance Mode"
                    description="Displays a maintenance page to all non-admin visitors. Use with caution." />
                </div>
                {cfg.maintenanceMode && (
                  <div className="pt-4">
                    <Field label="Maintenance Message">
                      <Textarea value={cfg.maintenanceMessage} onChange={e => update({ maintenanceMessage: e.target.value })}
                        rows={3} className={`resize-none text-sm ${inputCls}`} />
                    </Field>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Accessibility ── */}
            <TabsContent value="accessibility" className="mt-4 space-y-4">
              {a11ySaved && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 border
                  ${a11ySaved.includes('Failed')
                    ? ('text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700/40')
                    : ('text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-700/40')
                  }`}>
                  <CheckCircle2 className="w-4 h-4" /> {a11ySaved}
                </div>
              )}

              <div className={`${sectionCls} divide-y ${divider}`}>
                <div className="flex items-center justify-between pb-3">
                  <h3 className={`text-sm font-semibold ${'text-gray-900 dark:text-white'}`}>Accessibility Widget</h3>
                  <Button onClick={handleSaveA11y} disabled={a11ySaving} className="bg-primary hover:bg-primary/90 text-white gap-1.5 h-9">
                    <Save className="w-3.5 h-3.5" /> {a11ySaving ? 'Saving…' : 'Save Accessibility'}
                  </Button>
                </div>

                <div className="py-4">
                  <Toggle checked={a11y.enabled} onChange={v => updateA11y({ enabled: v })}
                    label="Enable Accessibility Bubble"
                    description="Show the floating accessibility widget on all public pages" />
                </div>

                {a11y.enabled && (
                  <>
                    <div className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-sm font-medium ${'text-gray-900 dark:text-white'}`}>Widget Position</p>
                          <p className={`text-xs mt-0.5 ${muted}`}>Where the bubble appears on the screen</p>
                        </div>
                        <div className="flex gap-2">
                          {(['bottom-right', 'bottom-left'] as const).map(pos => (
                            <button key={pos} onClick={() => updateA11y({ position: pos })}
                              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors
                                ${a11y.position === pos
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}>
                              {pos === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="py-3">
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${muted}`}>Enabled Features</p>
                      <div className="space-y-3">
                        <Toggle checked={a11y.featFontSize}  onChange={v => updateA11y({ featFontSize: v })}  label="Text Size Adjustment" description="Allow users to increase or decrease text size" />
                        <Toggle checked={a11y.featContrast}  onChange={v => updateA11y({ featContrast: v })}  label="High Contrast Mode" description="Increase colour contrast for better readability" />
                        <Toggle checked={a11y.featMotion}    onChange={v => updateA11y({ featMotion: v })}    label="Reduce Motion" description="Disable animations and transitions" />
                        <Toggle checked={a11y.featDyslexia}  onChange={v => updateA11y({ featDyslexia: v })}  label="Dyslexia-Friendly Font" description="Switch to a more readable font for dyslexic users" />
                        <Toggle checked={a11y.featLinks}     onChange={v => updateA11y({ featLinks: v })}     label="Underline All Links" description="Make all hyperlinks visually distinct" />
                        <Toggle checked={a11y.featGrayscale} onChange={v => updateA11y({ featGrayscale: v })} label="Grayscale Mode" description="Remove all colour from the page" />
                      </div>
                    </div>

                    {/* Live preview */}
                    <div className="pt-4">
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${muted}`}>Widget Preview</p>
                      <div className={`relative rounded-xl border overflow-hidden ${'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}
                        style={{ height: 180 }}>
                        <div className={`absolute inset-0 flex items-center justify-center ${muted} text-sm`}>
                          Public page content area
                        </div>
                        {/* Simulated bubble */}
                        <div className={`absolute ${a11y.position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'}`}>
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-lg">
                            <Accessibility className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        {/* Simulated support chat */}
                        <div className={`absolute bottom-4 ${a11y.position === 'bottom-right' ? 'right-4' : 'right-4'}`}
                          style={{ bottom: a11y.position === 'bottom-right' ? 64 : 16, right: a11y.position === 'bottom-right' ? 16 : undefined, left: a11y.position === 'bottom-left' ? 16 : undefined }}>
                        </div>
                      </div>
                      <p className={`text-[11px] mt-2 ${muted}`}>
                        The widget stacks above the support chat bubble when both are enabled.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
}
