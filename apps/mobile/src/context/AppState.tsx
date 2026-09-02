import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  createMessage,
  mockAssistantReply,
  newId,
  remainingFreeMessages,
  type ChatThread,
  type Entitlement,
  type PlanId,
  type UserSettings,
} from "@skonga/shared";
import { isApiConfigured, sendChat } from "../api/client";
import {
  clearHistory,
  loadAppState,
  saveActiveId,
  saveEntitlement,
  saveSettings,
  saveThreads,
} from "../storage";

type AppContextValue = {
  ready: boolean;
  online: boolean;
  threads: ChatThread[];
  activeId: string | null;
  active: ChatThread | null;
  settings: UserSettings;
  entitlement: Entitlement;
  remaining: number;
  setActiveId: (id: string | null) => void;
  startNewChat: () => void;
  send: (text: string) => Promise<"ok" | "limit" | "empty">;
  updateSettings: (patch: Partial<UserSettings>) => void;
  unlockPro: (planId: PlanId) => void;
  wipeHistory: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    preferredName: "",
    theme: "dark",
    responseStyle: "balanced",
    saveHistory: true,
  });
  const [entitlement, setEntitlement] = useState<Entitlement>({
    isPro: false,
    planId: null,
    expiresAt: null,
  });

  useEffect(() => {
    loadAppState()
      .then((s) => {
        setThreads(s.threads);
        setSettings(s.settings);
        setEntitlement(s.entitlement);
        setActiveIdState(s.activeId);
      })
      .finally(() => setReady(true));
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (ready && settings.saveHistory) void saveThreads(threads);
  }, [threads, ready, settings.saveHistory]);

  const setActiveId = useCallback((id: string | null) => {
    setActiveIdState(id);
    void saveActiveId(id);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveId(null);
  }, [setActiveId]);

  const send = useCallback(
    async (text: string): Promise<"ok" | "limit" | "empty"> => {
      const trimmed = text.trim();
      if (!trimmed) return "empty";
      const left = remainingFreeMessages(threads, entitlement.isPro);
      if (left <= 0) return "limit";

      let threadId = activeId;
      if (!threadId) {
        const thread: ChatThread = {
          id: newId("chat"),
          title: trimmed.slice(0, 36),
          messages: [],
          updatedAt: new Date().toISOString(),
        };
        threadId = thread.id;
        setThreads((prev) => [thread, ...prev]);
        setActiveId(threadId);
      }

      const user = createMessage("user", trimmed);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, user], updatedAt: new Date().toISOString() }
            : t
        )
      );

      let replyText = mockAssistantReply(trimmed, settings.responseStyle);
      if (isApiConfigured() && online) {
        try {
          const res = await sendChat({
            threadId: threadId!,
            message: trimmed,
            style: settings.responseStyle,
          });
          replyText = res.reply;
        } catch {
          replyText =
            mockAssistantReply(trimmed, settings.responseStyle) +
            "\n\n(Backend not reachable — showing local fallback.)";
        }
      }

      const assistant = createMessage("assistant", replyText);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, assistant], updatedAt: new Date().toISOString() }
            : t
        )
      );
      return "ok";
    },
    [activeId, entitlement.isPro, online, setActiveId, settings.responseStyle, threads]
  );

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const unlockPro = useCallback((planId: PlanId) => {
    const days = planId === "day" ? 1 : planId === "week" ? 7 : planId === "month" ? 30 : 365;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    const next: Entitlement = { isPro: true, planId, expiresAt: expires.toISOString() };
    setEntitlement(next);
    void saveEntitlement(next);
  }, []);

  const wipeHistory = useCallback(() => {
    setThreads([]);
    setActiveId(null);
    void clearHistory();
  }, [setActiveId]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const remaining = remainingFreeMessages(threads, entitlement.isPro);

  const value = useMemo(
    () => ({
      ready,
      online,
      threads,
      activeId,
      active,
      settings,
      entitlement,
      remaining,
      setActiveId,
      startNewChat,
      send,
      updateSettings,
      unlockPro,
      wipeHistory,
    }),
    [ready, online, threads, activeId, active, settings, entitlement, remaining, setActiveId, startNewChat, send, updateSettings, unlockPro, wipeHistory]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
