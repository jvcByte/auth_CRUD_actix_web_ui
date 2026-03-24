/**
 * Refresh token persistence.
 * Uses localStorage for both web and Tauri — it persists across app restarts
 * on Android WebView just like a browser. The Tauri store plugin is unreliable
 * across process kills on Android.
 */

const KEY = "refresh_token";

export async function saveRefreshToken(token: string): Promise<void> {
  localStorage.setItem(KEY, token);
  console.log("[token-store] saved");
}

export async function loadRefreshToken(): Promise<string | null> {
  const token = localStorage.getItem(KEY);
  console.log("[token-store] loaded:", token ? "exists" : "null");
  return token;
}

export async function clearRefreshToken(): Promise<void> {
  localStorage.removeItem(KEY);
  console.log("[token-store] cleared");
}
