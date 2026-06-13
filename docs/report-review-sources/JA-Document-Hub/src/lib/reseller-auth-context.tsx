import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ResellerProfile {
  uuid: string;
  fullName: string;
  email: string;
  company: string | null;
  status: string;
  referralCode: string | null;
  referralLink: string | null;
  commissionType: string;
  commissionRate: number;
  commissionRecurring: boolean;
  notifyNewSignup: boolean;
  notifyCommission: boolean;
  notifyAnnouncements: boolean;
}

interface ResellerAuthCtx {
  reseller: ResellerProfile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<ResellerAuthCtx>({
  reseller: null,
  isLoading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function ResellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [reseller, setReseller] = useState<ResellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/reseller/auth/me', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        setReseller(d.reseller ?? null);
      } else {
        setReseller(null);
      }
    } catch {
      setReseller(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/reseller/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setReseller(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <Ctx.Provider value={{ reseller, isLoading, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useResellerAuth() {
  return useContext(Ctx);
}
