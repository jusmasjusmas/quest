"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getDailyWhim, type CatalogWhim } from "@/lib/whims-catalog";
import {
  PROFILE_AVATAR_KEY,
  clearAllWhimLocalData as clearLegacyWhimKeys,
  computeStreak,
  incrementRippleReach,
  loadReflectionsV2,
  moodFeelingText,
  saveReflectionsV2,
  type MoodId,
  type WhimReflection,
  type WhimReflectionV2,
} from "@/lib/whim-reflections";

export type WhimState =
  | "idle"
  | "joined"
  | "active"
  | "reflecting"
  | "completed";

export type CurrentWhim = CatalogWhim;

export type WhimReflectionEntry = WhimReflectionV2;

export type WhimProfile = {
  name: string;
  emoji: string;
  streak: number;
};

const STORAGE_STATE = "whim-app-state-v1";
const STORAGE_PROFILE = "whim-profile-v1";

type PersistedAppState = {
  whimState: WhimState;
  skippedDateKey: string | null;
  joinedAtMs: number | null;
};

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadPersistedState(): PersistedAppState {
  if (typeof window === "undefined") {
    return {
      whimState: "idle",
      skippedDateKey: null,
      joinedAtMs: null,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_STATE);
    if (!raw) {
      return {
        whimState: "idle",
        skippedDateKey: null,
        joinedAtMs: null,
      };
    }
    const p = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      whimState:
        p.whimState === "idle" ||
        p.whimState === "joined" ||
        p.whimState === "active" ||
        p.whimState === "reflecting" ||
        p.whimState === "completed"
          ? p.whimState
          : "idle",
      skippedDateKey:
        typeof p.skippedDateKey === "string" ? p.skippedDateKey : null,
      joinedAtMs:
        typeof p.joinedAtMs === "number" ? p.joinedAtMs : null,
    };
  } catch {
    return {
      whimState: "idle",
      skippedDateKey: null,
      joinedAtMs: null,
    };
  }
}

function savePersistedState(s: PersistedAppState) {
  try {
    localStorage.setItem(STORAGE_STATE, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

type PersistedProfile = { name: string; emoji: string };

function loadProfileBasics(): PersistedProfile {
  if (typeof window === "undefined") {
    return { name: "Justin", emoji: "😊" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PersistedProfile>;
      if (p.name && p.emoji) return { name: p.name, emoji: p.emoji };
    }
    const avatar = localStorage.getItem(PROFILE_AVATAR_KEY);
    if (avatar) return { name: "Justin", emoji: avatar };
  } catch {
    /* ignore */
  }
  return { name: "Justin", emoji: "😊" };
}

function saveProfileBasics(p: PersistedProfile) {
  try {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
    localStorage.setItem(PROFILE_AVATAR_KEY, p.emoji);
  } catch {
    /* ignore */
  }
}

function reconcileJoinedState(
  whimState: WhimState,
  joinedAtMs: number | null,
): { whimState: WhimState; joinedAtMs: number | null } {
  if (whimState !== "joined" || joinedAtMs == null) {
    return { whimState, joinedAtMs };
  }
  if (Date.now() - joinedAtMs >= 3000) {
    return { whimState: "active", joinedAtMs: null };
  }
  return { whimState, joinedAtMs };
}

function reconcileCompletedState(whimState: WhimState): WhimState {
  return whimState === "completed" ? "idle" : whimState;
}

type WhimContextValue = {
  currentWhim: CurrentWhim;
  whimState: WhimState;
  reflections: WhimReflectionEntry[];
  profile: WhimProfile;
  passedToday: boolean;
  joinWhim: () => void;
  passToday: () => void;
  openReflecting: () => void;
  setReflectingOpen: (open: boolean) => void;
  saveReflection: (payload: {
    feeling: MoodId | null;
    feelingText: string;
    note: string;
    photoUrl: string | null;
  }) => void;
  setProfileEmoji: (emoji: string) => void;
  setProfileName: (name: string) => void;
  clearAllData: () => void;
};

const WhimContext = createContext<WhimContextValue | null>(null);

export function WhimProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [whimState, setWhimState] = useState<WhimState>("idle");
  const [skippedDateKey, setSkippedDateKey] = useState<string | null>(null);
  const [joinedAtMs, setJoinedAtMs] = useState<number | null>(null);
  const [reflections, setReflections] = useState<WhimReflectionEntry[]>([]);
  const [profileName, setProfileNameState] = useState("Justin");
  const [profileEmoji, setProfileEmojiState] = useState("😊");

  const joinedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const persisted = loadPersistedState();
    let ws = reconcileCompletedState(persisted.whimState);
    const joined = reconcileJoinedState(ws, persisted.joinedAtMs);
    ws = joined.whimState;
    setWhimState(ws);
    setSkippedDateKey(persisted.skippedDateKey);
    setJoinedAtMs(joined.joinedAtMs);
    setReflections(loadReflectionsV2());
    const pb = loadProfileBasics();
    setProfileNameState(pb.name);
    setProfileEmojiState(pb.emoji);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedState({
      whimState,
      skippedDateKey,
      joinedAtMs,
    });
  }, [hydrated, whimState, skippedDateKey, joinedAtMs]);

  useEffect(() => {
    if (!hydrated) return;
    saveReflectionsV2(reflections);
  }, [hydrated, reflections]);

  useEffect(() => {
    if (!hydrated) return;
    saveProfileBasics({ name: profileName, emoji: profileEmoji });
  }, [hydrated, profileName, profileEmoji]);

  const currentWhim = useMemo(() => getDailyWhim(), []);

  const legacyReflectionsForStreak = useMemo((): WhimReflection[] => {
    return reflections.map((r) => ({
      whimTitle: r.whimText,
      mood: r.feeling,
      note: r.note,
      photoDataUrl: r.photoUrl,
      savedAt: r.date,
    }));
  }, [reflections]);

  const profile: WhimProfile = useMemo(
    () => ({
      name: profileName,
      emoji: profileEmoji,
      streak: computeStreak(legacyReflectionsForStreak),
    }),
    [legacyReflectionsForStreak, profileEmoji, profileName],
  );

  const passedToday = skippedDateKey === todayKey();

  const joinWhim = useCallback(() => {
    if (passedToday) return;
    const now = Date.now();
    setWhimState("joined");
    setJoinedAtMs(now);
  }, [passedToday]);

  useEffect(() => {
    if (whimState !== "joined" || joinedAtMs == null) {
      if (joinedTimerRef.current) {
        clearTimeout(joinedTimerRef.current);
        joinedTimerRef.current = null;
      }
      return;
    }
    const elapsed = Date.now() - joinedAtMs;
    const wait = Math.max(0, 3000 - elapsed);
    joinedTimerRef.current = setTimeout(() => {
      setWhimState("active");
      setJoinedAtMs(null);
      joinedTimerRef.current = null;
    }, wait);
    return () => {
      if (joinedTimerRef.current) {
        clearTimeout(joinedTimerRef.current);
        joinedTimerRef.current = null;
      }
    };
  }, [whimState, joinedAtMs]);

  const passToday = useCallback(() => {
    const key = todayKey();
    setSkippedDateKey(key);
    setWhimState("idle");
    setJoinedAtMs(null);
  }, []);

  const openReflecting = useCallback(() => {
    setWhimState("reflecting");
  }, []);

  const setReflectingOpen = useCallback((open: boolean) => {
    if (open) {
      setWhimState("reflecting");
      return;
    }
    setWhimState((s) => (s === "reflecting" ? "active" : s));
  }, []);

  const saveReflection = useCallback(
    (payload: {
      feeling: MoodId | null;
      feelingText: string;
      note: string;
      photoUrl: string | null;
    }) => {
      const entry: WhimReflectionEntry = {
        whimId: String(currentWhim.id),
        whimText: currentWhim.text,
        date: new Date().toISOString(),
        feeling: payload.feeling,
        feelingText:
          payload.feelingText || moodFeelingText(payload.feeling),
        note: payload.note,
        photoUrl: payload.photoUrl,
      };
      setReflections((prev) => [...prev, entry]);
      incrementRippleReach();
      setWhimState("completed");
      if (completedTimerRef.current) clearTimeout(completedTimerRef.current);
      completedTimerRef.current = setTimeout(() => {
        setWhimState("idle");
        setJoinedAtMs(null);
        completedTimerRef.current = null;
      }, 1600);
    },
    [currentWhim.id, currentWhim.text],
  );

  useEffect(() => {
    return () => {
      if (completedTimerRef.current) clearTimeout(completedTimerRef.current);
    };
  }, []);

  const setProfileEmojiCb = useCallback((emoji: string) => {
    setProfileEmojiState(emoji);
  }, []);

  const setProfileNameCb = useCallback((name: string) => {
    setProfileNameState(name);
  }, []);

  const clearAllData = useCallback(() => {
    clearLegacyWhimKeys();
    setWhimState("idle");
    setSkippedDateKey(null);
    setJoinedAtMs(null);
    setReflections([]);
    setProfileNameState("Justin");
    setProfileEmojiState("😊");
  }, []);

  const value = useMemo<WhimContextValue>(
    () => ({
      currentWhim,
      whimState,
      reflections,
      profile,
      passedToday,
      joinWhim,
      passToday,
      openReflecting,
      setReflectingOpen,
      saveReflection,
      setProfileEmoji: setProfileEmojiCb,
      setProfileName: setProfileNameCb,
      clearAllData,
    }),
    [
      currentWhim,
      whimState,
      reflections,
      profile,
      passedToday,
      joinWhim,
      passToday,
      openReflecting,
      setReflectingOpen,
      saveReflection,
      setProfileEmojiCb,
      setProfileNameCb,
      clearAllData,
    ],
  );

  return (
    <WhimContext.Provider value={value}>{children}</WhimContext.Provider>
  );
}

export function useWhim(): WhimContextValue {
  const ctx = useContext(WhimContext);
  if (!ctx) {
    throw new Error("useWhim must be used within WhimProvider");
  }
  return ctx;
}
