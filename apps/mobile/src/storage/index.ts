import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatThread, Entitlement, UserSettings } from "@skonga/shared";
import { defaultEntitlement, defaultSettings } from "@skonga/shared";

const KEYS = {
  threads: "skonga.threads",
  settings: "skonga.settings",
  entitlement: "skonga.entitlement",
  activeId: "skonga.activeId",
};

export async function loadAppState(): Promise<{
  threads: ChatThread[];
  settings: UserSettings;
  entitlement: Entitlement;
  activeId: string | null;
}> {
  const [threadsRaw, settingsRaw, entRaw, activeRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.threads),
    AsyncStorage.getItem(KEYS.settings),
    AsyncStorage.getItem(KEYS.entitlement),
    AsyncStorage.getItem(KEYS.activeId),
  ]);
  return {
    threads: threadsRaw ? (JSON.parse(threadsRaw) as ChatThread[]) : [],
    settings: settingsRaw ? { ...defaultSettings(), ...JSON.parse(settingsRaw) } : defaultSettings(),
    entitlement: entRaw ? { ...defaultEntitlement(), ...JSON.parse(entRaw) } : defaultEntitlement(),
    activeId: activeRaw,
  };
}

export async function saveThreads(threads: ChatThread[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.threads, JSON.stringify(threads));
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function saveEntitlement(entitlement: Entitlement): Promise<void> {
  await AsyncStorage.setItem(KEYS.entitlement, JSON.stringify(entitlement));
}

export async function saveActiveId(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEYS.activeId, id);
  else await AsyncStorage.removeItem(KEYS.activeId);
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.threads, KEYS.activeId]);
}
