/**
 * Admin Portal Theme Context
 * Separate from the customer-facing ThemeProvider.
 * The selected mode is cached locally and persisted to Admin site settings.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminTheme = 'light' | 'dark' | 'system';

interface AdminThemeContextType {
  theme: AdminTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | null>(null);
const STORAGE_KEY = 'ja_admin_theme';

function validTheme(value: unknown): value is AdminTheme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY);
    return validTheme(stored) ? stored : 'light';
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) return;
    fetch('/api/site-settings/public', { cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(response => response.json() as Promise<{ settings?: Record<string, string> }>)
      .then(data => {
        const saved = data.settings?.admin_theme_mode;
        if (!validTheme(saved)) return;
        setThemeState(saved);
        localStorage.setItem(STORAGE_KEY, saved);
      })
      .catch(() => { /* retain the local preference */ });
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  function setTheme(next: AdminTheme) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (!window.location.pathname.startsWith('/admin')) return;
    void fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ settings: { admin_theme_mode: next } }),
    }).catch(() => { /* the local preference still remains effective */ });
  }

  // Apply the class to the root only while an Admin route is active. A DOM
  // observer keeps this correct during React Router navigation, including
  // pushState changes that do not emit a browser popstate event.
  useEffect(() => {
    const root = document.getElementById('admin-theme-root');
    if (!root) return;

    const syncTheme = () => {
      const adminActive = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
      root.classList.toggle('dark', adminActive && resolvedTheme === 'dark');
      root.dataset.adminTheme = adminActive ? resolvedTheme : 'inactive';
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener('popstate', syncTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncTheme);
      root.classList.remove('dark');
      delete root.dataset.adminTheme;
    };
  }, [resolvedTheme]);

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return context;
}
