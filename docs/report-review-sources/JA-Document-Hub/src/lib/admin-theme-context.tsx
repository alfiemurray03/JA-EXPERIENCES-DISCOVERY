/**
 * Admin Portal Theme Context
 * Separate from the customer-facing ThemeProvider.
 * Defaults to 'light' — admins can switch to dark or system.
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

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(STORAGE_KEY) as AdminTheme) ?? 'light';
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  // Apply resolved theme to a dedicated admin root element so Tailwind dark: variants
  // work throughout the entire admin portal without affecting the customer-facing site.
  useEffect(() => {
    const root = document.getElementById('admin-theme-root');
    if (!root) return;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return ctx;
}
