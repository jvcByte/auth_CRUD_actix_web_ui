const BASE_URL = import.meta.env.VITE_API_URL ?? "https://auth-crud-actix.onrender.com";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error("Unable to reach the server. Please check your connection.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message: string;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? json.detail ?? text;
    } catch {
      message = text || res.statusText;
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    refresh: (refresh_token: string) =>
      request<RefreshResponse>("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),
    logout: (refresh_token: string) =>
      request<void>("/api/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token }) }),
    me: (access_token: string) =>
      request<AuthUser>("/api/auth/me", { headers: { Authorization: `Bearer ${access_token}` } }),
  },
};
