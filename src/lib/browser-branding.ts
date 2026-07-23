export interface BrowserBrandingSettings {
  browserTabName: string;
  adminTabName: string;
  faviconUrl: string;
}

const DEFAULTS: BrowserBrandingSettings = {
  browserTabName: 'Planyx',
  adminTabName: 'Planyx Admin Portal',
  faviconUrl: '/favicon.svg?v=20260718-4',
};

const CACHE_KEY = 'ja_browser_branding_v1';
const EVENT_NAME = 'ja-browser-branding-change';
let activeSettings: BrowserBrandingSettings = DEFAULTS;
let headObserver: MutationObserver | null = null;

function cleanName(value: unknown, fallback: string): string {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, 90) : fallback;
}

function cleanFavicon(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return DEFAULTS.faviconUrl;
  if (text.startsWith('/') || /^https:\/\//i.test(text) || /^data:image\/(png|x-icon|vnd\.microsoft\.icon|svg\+xml|webp);/i.test(text)) {
    return text.slice(0, 400_000);
  }
  return DEFAULTS.faviconUrl;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normaliseBrowserBranding(value: Partial<BrowserBrandingSettings> = {}): BrowserBrandingSettings {
  return {
    browserTabName: cleanName(value.browserTabName, DEFAULTS.browserTabName),
    adminTabName: cleanName(value.adminTabName, DEFAULTS.adminTabName),
    faviconUrl: cleanFavicon(value.faviconUrl),
  };
}

export function getCachedBrowserBranding(): BrowserBrandingSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    return stored ? normaliseBrowserBranding(JSON.parse(stored) as Partial<BrowserBrandingSettings>) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function updateIconLinks(url: string) {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="shortcut icon"]'));
  if (!links.length) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.dataset.jaManagedFavicon = 'true';
    link.href = url;
    document.head.appendChild(link);
    return;
  }

  const resolvedUrl = new URL(url, window.location.href).href;
  for (const link of links) {
    if (link.href !== resolvedUrl) link.href = url;
  }
}

function updateTitle(settings: BrowserBrandingSettings, previous: BrowserBrandingSettings) {
  const admin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  const configuredName = admin ? settings.adminTabName : settings.browserTabName;
  const current = String(document.title || '').trim();
  let next = current;

  if (!current || current === window.location.hostname || current === window.location.href) {
    next = configuredName;
  } else {
    const knownNames = Array.from(new Set([
      DEFAULTS.browserTabName,
      DEFAULTS.adminTabName,
      previous.browserTabName,
      previous.adminTabName,
      activeSettings.browserTabName,
      activeSettings.adminTabName,
    ].filter(Boolean))).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(knownNames.map(escapeRegExp).join('|'), 'gi');
    next = pattern.test(current) ? current.replace(pattern, configuredName) : current;
  }

  // Reassigning the same title triggers the head MutationObserver again in
  // some browsers. Only mutate the DOM when the visible value really changes.
  if (next !== current) document.title = next;
}

export function applyBrowserBranding(value: Partial<BrowserBrandingSettings>) {
  if (typeof window === 'undefined') return;
  const previous = getCachedBrowserBranding();
  const settings = normaliseBrowserBranding(value);
  updateIconLinks(settings.faviconUrl);
  updateTitle(settings, previous);
  activeSettings = settings;
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(settings)); } catch { /* cache is optional */ }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }));
}

async function fetchBrowserBranding(): Promise<BrowserBrandingSettings | null> {
  const endpoints = ['/api/site-settings/public', '/site-settings'];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) continue;
      const data = await response.json() as {
        settings?: Record<string, string>;
        browser?: { tab_name?: string; admin_tab_name?: string; favicon_url?: string };
      };
      const values = data.settings
        ? {
            browserTabName: data.settings.browser_tab_name,
            adminTabName: data.settings.admin_tab_name,
            faviconUrl: data.settings.favicon_url,
          }
        : {
            browserTabName: data.browser?.tab_name,
            adminTabName: data.browser?.admin_tab_name,
            faviconUrl: data.browser?.favicon_url,
          };
      return normaliseBrowserBranding(values);
    } catch {
      // Try the next runtime endpoint.
    }
  }
  return null;
}

export async function loadBrowserBranding(): Promise<BrowserBrandingSettings> {
  const cached = getCachedBrowserBranding();
  applyBrowserBranding(cached);
  const loaded = await fetchBrowserBranding();
  if (!loaded) return cached;
  applyBrowserBranding(loaded);
  return loaded;
}

function installHeadObserver() {
  if (headObserver || typeof document === 'undefined') return;
  let queued = false;
  headObserver = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      updateIconLinks(activeSettings.faviconUrl);
      updateTitle(activeSettings, activeSettings);
    });
  });
  headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
}

export function installBrowserBranding() {
  if (typeof window === 'undefined') return;
  activeSettings = getCachedBrowserBranding();
  installHeadObserver();
  void loadBrowserBranding();
}

export const browserBrandingEventName = EVENT_NAME;
export const defaultBrowserBranding = DEFAULTS;
