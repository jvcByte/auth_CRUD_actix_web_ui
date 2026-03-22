const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";

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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    refresh: (refresh_token: string) =>
      request<RefreshResponse>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      }),

    logout: (refresh_token: string) =>
      request<void>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      }),

    me: (access_token: string) =>
      request<AuthUser>("/api/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
  },
};
