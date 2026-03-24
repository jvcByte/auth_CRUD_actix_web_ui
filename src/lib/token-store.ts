const KEY = "refresh_token";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  // autoSave: false so we control exactly when it flushes to disk
  return load("auth.json");
}

export async function saveRefreshToken(token: string): Promise<void> {
  if (isTauri()) {
    const store = await getStore();
    await store.set(KEY, token);
    await store.save(); // flush to disk immediately
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
    await store.save(); // flush to disk immediately
  } else {
    localStorage.removeItem(KEY);
  }
}
