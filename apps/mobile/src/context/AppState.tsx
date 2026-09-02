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
  type Note,
  type PlanId,
  type UserSettings,
} from "@skonga/shared";
import { fetchEntitlement, isApiConfigured, sendChat, setAuthToken } from "../api/client";
import {
  clearHistory,
  loadAppState,
  saveActiveId,
  saveEntitlement,
  saveNotes,
  saveSettings,
  saveThreads,
  saveToken,
} from "../storage";

type AppContextValue = {
  ready: boolean;
  online: boolean;
  sending: boolean;
  threads: ChatThread[];
  activeId: string | null;
  active: ChatThread | null;
  settings: UserSettings;
  entitlement: Entitlement;
  remaining: number;
  notes: Note[];
  setActiveId: (id: string | null) => void;
  startNewChat: () => void;
  send: (text: string) => Promise<"ok" | "limit" | "empty" | "busy">;
  updateSettings: (patch: Partial<UserSettings>) => void;
  unlockPro: (planId: PlanId) => void;
  applyEntitlement: (next: Entitlement) => void;
  refreshEntitlement: (phone?: string) => Promise<void>;
  rememberToken: (token: string | null) => void;
  wipeHistory: () => void;
  addNote: (title: string, body: string) => void;
  updateNote: (id: string, title: string, body: string) => void;
  deleteNote: (id: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
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
        setNotes(s.notes);
        if (s.token) setAuthToken(s.token);
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

  useEffect(() => {
    if (ready) void saveNotes(notes);
  }, [notes, ready]);

  const setActiveId = useCallback((id: string | null) => {
    setActiveIdState(id);
    void saveActiveId(id);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveId(null);
  }, [setActiveId]);

  const applyEntitlement = useCallback((next: Entitlement) => {
    setEntitlement(next);
    void saveEntitlement(next);
  }, []);

  const refreshEntitlement = useCallback(
    async (phone?: string) => {
      if (!isApiConfigured()) return;
      const next = await fetchEntitlement(phone);
      applyEntitlement(next);
    },
    [applyEntitlement]
  );

  const rememberToken = useCallback((token: string | null) => {
    setAuthToken(token);
    void saveToken(token);
  }, []);

  const send = useCallback(
    async (text: string): Promise<"ok" | "limit" | "empty" | "busy"> => {
      if (sending) return "busy";
      const trimmed = text.trim();
      if (!trimmed) return "empty";
      const left = remainingFreeMessages(threads, entitlement.isPro);
      if (left <= 0) return "limit";

      setSending(true);
      try {
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
      } finally {
        setSending(false);
      }
    },
    [activeId, entitlement.isPro, online, sending, setActiveId, settings.responseStyle, threads]
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
    applyEntitlement({ isPro: true, planId, expiresAt: expires.toISOString() });
  }, [applyEntitlement]);

  const wipeHistory = useCallback(() => {
    setThreads([]);
    setActiveId(null);
    void clearHistory();
  }, [setActiveId]);

  const addNote = useCallback((title: string, body: string) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: newId("note"),
      title: title.trim() || "Untitled",
      body: body.trim(),
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, title: string, body: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title: title.trim() || "Untitled", body: body.trim(), updatedAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const remaining = remainingFreeMessages(threads, entitlement.isPro);

  const value = useMemo(
    () => ({
      ready,
      online,
      sending,
      threads,
      activeId,
      active,
      settings,
      entitlement,
      remaining,
      notes,
      setActiveId,
      startNewChat,
      send,
      updateSettings,
      unlockPro,
      applyEntitlement,
      refreshEntitlement,
      rememberToken,
      wipeHistory,
      addNote,
      updateNote,
      deleteNote,
    }),
    [
      ready,
      online,
      sending,
      threads,
      activeId,
      active,
      settings,
      entitlement,
      remaining,
      notes,
      setActiveId,
      startNewChat,
      send,
      updateSettings,
      unlockPro,
      applyEntitlement,
      refreshEntitlement,
      rememberToken,
      wipeHistory,
      addNote,
      updateNote,
      deleteNote,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
