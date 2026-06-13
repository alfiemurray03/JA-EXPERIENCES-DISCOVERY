/**
 * Admin authentication context — Microsoft Entra ID only.
 *
 * Authentication is handled entirely by Microsoft. There is no username/password
 * login, no PIN verification, and no password reset in this context.
 *
 * Session flow:
 *  1. User clicks "Sign In" on /admin → redirected to /auth/admin/oidc/start
 *  2. Microsoft authenticates the user and redirects back to /auth/admin/oidc/callback
 *  3. Callback verifies the tenant, extracts identity, creates ja_admin_session cookie
 *  4. On every page load, GET /api/admin/auth/me restores the session from the cookie
 *
 * The session cookie (ja_admin_session) is httpOnly — it cannot be read by JS.
 * localStorage is used only as a fast-read cache for the admin profile so the
 * UI can render immediately without waiting for the /me round-trip.
 *
 * Platform operator: JA Group Services Ltd
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  email:                 string;
  name:                  string;
  roles:                 string[];
  tid:                   string;
  isSystemAdministrator: boolean;
  authMethod:            'oidc';
  operator:              string;
}

interface AdminContextType {
  admin:     AdminUser | null;
  isLoading: boolean;
  logout:    () => Promise<void>;
}

// ── localStorage cache helpers ────────────────────────────────────────────────

const CACHE_KEY = 'ja_admin_profile';

function getCachedAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch { return null; }
}

function setCachedAdmin(admin: AdminUser): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(admin)); } catch { /* ignore */ }
}

function clearCachedAdmin(): void {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin]       = useState<AdminUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // On mount: restore session from the httpOnly cookie via /me endpoint.
  // Use localStorage cache for instant render while the request is in-flight.
  useEffect(() => {
    const cached = getCachedAdmin();
    if (cached) setAdmin(cached); // optimistic render

    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { success: boolean; admin?: AdminUser }) => {
        if (d.success && d.admin) {
          setCachedAdmin(d.admin);
          setAdmin(d.admin);
        } else {
          clearCachedAdmin();
          setAdmin(null);
        }
      })
      .catch(() => {
        // Network error — keep cached value so UI doesn't flicker
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* best-effort */ }
    clearCachedAdmin();
    setAdmin(null);
    // Redirect to admin login page after logout
    window.location.href = '/admin';
  }, []);

  return (
    <AdminContext.Provider value={{ admin, isLoading, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
