'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, TokenPair } from '@/types';
import { apiClient } from '@/lib/api';
import { setTokens, clearTokens, hasTokens } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate auth on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        if (hasTokens()) {
          const userData = await apiClient.getMe();
          setUser(userData);
        }
      } catch (err) {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const tokens = await apiClient.login(username, password);
      setTokens(tokens.access, tokens.refresh);
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (err) {
      clearTokens();
      setUser(null);
      if (typeof err === 'object' && err && 'detail' in err) {
        setError((err as any).detail || 'Login failed');
      } else {
        setError('Login failed');
      }
      throw err;
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setError(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAdmin: user?.role === 'admin' ?? false,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
