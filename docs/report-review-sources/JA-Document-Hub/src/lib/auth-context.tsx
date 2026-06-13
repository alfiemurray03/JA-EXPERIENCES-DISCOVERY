import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser, registerUser,
  refreshCurrentUser, type AuthUser,
} from './document-store';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company?: string,
    usageType?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshCurrentUser().then((serverUser) => {
      setUser(serverUser);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company?: string,
    usageType?: string,
  ) => {
    const result = await registerUser(email, password, firstName, lastName, company, usageType);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Full-page redirect to the server-side OIDC logout handler.
    // This clears the ja_session cookie AND terminates the Entra session.
    // For password-only users the server still clears the cookie and redirects to /login.
    window.location.href = '/auth/logout';
  }, []);

  const refreshUser = useCallback(() => {
    void refreshCurrentUser().then(setUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
