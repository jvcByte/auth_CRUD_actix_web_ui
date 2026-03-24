"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, AuthUser } from "./api";
import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from "./token-store";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, isLoading: true });
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = state.accessToken;

  const setAuth = useCallback((accessToken: string, user: AuthUser, refreshToken: string) => {
    setState({ user, accessToken, isLoading: false });
    saveRefreshToken(refreshToken);
  }, []);

  const clearAuth = useCallback(() => {
    setState({ user: null, accessToken: null, isLoading: false });
    clearRefreshToken();
  }, []);

  const scheduleRefresh = useCallback((expiresIn: number) => {
    const delay = Math.max((expiresIn - 60) * 1000, 0);
    const timer = setTimeout(async () => {
      const stored = await loadRefreshToken();
      if (!stored) return;
      try {
        const res = await api.auth.refresh(stored);
        const user = await api.auth.me(res.access_token);
        setAuth(res.access_token, user, res.refresh_token);
        scheduleRefresh(res.expires_in);
      } catch {
        clearAuth();
      }
    }, delay);
    return timer;
  }, [setAuth, clearAuth]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const safetyTimer = setTimeout(() => {
      setState((s) => (s.isLoading ? { ...s, isLoading: false } : s));
    }, 8000);

    (async () => {
      try {
        const stored = await loadRefreshToken();
        if (!stored) { setState((s) => ({ ...s, isLoading: false })); return; }
        try {
          const res = await api.auth.refresh(stored);
          const user = await api.auth.me(res.access_token);
          setAuth(res.access_token, user, res.refresh_token);
          timer = scheduleRefresh(res.expires_in);
        } catch { clearAuth(); }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      } finally {
        clearTimeout(safetyTimer);
      }
    })();

    return () => { clearTimeout(timer); clearTimeout(safetyTimer); };
  }, [setAuth, clearAuth, scheduleRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    const user = await api.auth.me(res.access_token);
    setAuth(res.access_token, user, res.refresh_token);
    scheduleRefresh(res.expires_in);
  }, [setAuth, scheduleRefresh]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    const user = await api.auth.me(res.access_token);
    setAuth(res.access_token, user, res.refresh_token);
    scheduleRefresh(res.expires_in);
  }, [setAuth, scheduleRefresh]);

  const logout = useCallback(async () => {
    const stored = await loadRefreshToken();
    if (stored) await api.auth.logout(stored).catch(() => {});
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
