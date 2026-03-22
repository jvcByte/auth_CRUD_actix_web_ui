/**
 * Refresh token persistence.
 * - Tauri (mobile/desktop): @tauri-apps/plugin-store (secure OS storage)
 * - Browser (webapp): localStorage
 */

const KEY = "refresh_token";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load("auth.json");
}

export async function saveRefreshToken(token: string): Promise<void> {
  if (isTauri()) {
    const store = await getStore();
    await store.set(KEY, token);
  } else {
    localStorage.setItem(KEY, token);
  }
}

export async function loadRefreshToken(): Promise<string | null> {
  if (isTauri()) {
    const store = await getStore();
    return (await store.get<string>(KEY)) ?? null;
  }
  return localStorage.getItem(KEY);
}

export async function clearRefreshToken(): Promise<void> {
  if (isTauri()) {
    const store = await getStore();
    await store.delete(KEY);
  } else {
    localStorage.removeItem(KEY);
  }
}
