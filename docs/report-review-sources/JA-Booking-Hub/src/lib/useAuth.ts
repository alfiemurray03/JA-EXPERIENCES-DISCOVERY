/**
 * useAuth — lightweight hook that fetches the current user from /api/auth/me.
 * Returns { user, loading, authenticated }.
 * Uses a simple in-memory cache so multiple components don't fire duplicate requests.
 */
import { useState, useEffect } from 'react';

export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  given_name?: string;
  family_name?: string;
  roles: string[];
}

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
}

let cache: AuthState | null = null;
const listeners: Array<(s: AuthState) => void> = [];

function notify(state: AuthState) {
  cache = state;
  listeners.forEach((fn) => fn(state));
}

async function fetchMe(endpoint: string) {
  try {
    const res = await fetch(endpoint, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      notify({ loading: false, authenticated: false, user: null });
      return;
    }
    const data = await res.json() as { authenticated: boolean; user?: AuthUser };
    notify({ loading: false, authenticated: data.authenticated, user: data.user ?? null });
  } catch {
    notify({ loading: false, authenticated: false, user: null });
  }
}

export function useAuth(endpoint = '/api/auth/me'): AuthState {
  const [state, setState] = useState<AuthState>(
    cache ?? { loading: true, authenticated: false, user: null },
  );

  useEffect(() => {
    listeners.push(setState);
    if (!cache) {
      fetchMe(endpoint);
    } else {
      setState(cache);
    }
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [endpoint]);

  return state;
}

export function useAdminAuth(): AuthState {
  return useAuth('/api/admin/auth/me');
}

/** Call after a successful logout to clear the in-memory cache. */
export function clearAuthCache() {
  cache = null;
}
