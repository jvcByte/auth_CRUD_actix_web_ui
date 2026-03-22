"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // Keep accessToken in a ref so the refresh timer always has the latest value
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = state.accessToken;

  const setAuth = useCallback(
    (accessToken: string, user: AuthUser, refreshToken: string) => {
      setState({ user, accessToken, isLoading: false });
      saveRefreshToken(refreshToken);
    },
    []
  );

  const clearAuth = useCallback(() => {
    setState({ user: null, accessToken: null, isLoading: false });
    clearRefreshToken();
  }, []);

  // Silently refresh tokens before expiry
  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
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
    },
    [setAuth, clearAuth]
  );

  // On mount, try to restore session from stored refresh token
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const stored = await loadRefreshToken();
      if (!stored) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }
      try {
        const res = await api.auth.refresh(stored);
        const user = await api.auth.me(res.access_token);
        setAuth(res.access_token, user, res.refresh_token);
        timer = scheduleRefresh(res.expires_in);
      } catch {
        clearAuth();
      }
    })();
    return () => clearTimeout(timer);
  }, [setAuth, clearAuth, scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password });
      setAuth(res.access_token, res.user, res.refresh_token);
      scheduleRefresh(res.expires_in);
    },
    [setAuth, scheduleRefresh]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.auth.register({ name, email, password });
      setAuth(res.access_token, res.user, res.refresh_token);
      scheduleRefresh(res.expires_in);
    },
    [setAuth, scheduleRefresh]
  );

  const logout = useCallback(async () => {
    const stored = await loadRefreshToken();
    if (stored) {
      await api.auth.logout(stored).catch(() => {});
    }
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
