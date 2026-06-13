import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  plan_id: number;
  lifetime_access: number;
  created_at: string;
  plan_name: string | null;
  plan_slug: string | null;
  subscription_status: string | null;
  billing_interval: string | null;
  current_period_end: string | null;
  is_paused: number;
  pause_reason: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginCustomer: () => void;
  loginAdmin: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  /** Redirect to Microsoft Entra External ID (customer tenant) */
  const loginCustomer = () => {
    window.location.href = '/auth/login';
  };

  /** Redirect to Microsoft Entra workforce tenant (admin only) */
  const loginAdmin = () => {
    window.location.href = '/admin/login';
  };

  const logout = () => {
    window.location.href = '/auth/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCustomer, loginAdmin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
