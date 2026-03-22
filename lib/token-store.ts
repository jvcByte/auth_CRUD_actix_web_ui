/**
 * Abstracts refresh token persistence.
 * - In Tauri (mobile/desktop): uses @tauri-apps/plugin-store for secure OS storage.
 * - In browser (webapp): falls back to localStorage.
 */

import { load } from "@tauri-apps/plugin-store";

const KEY = "refresh_token";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function getStore() {
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
