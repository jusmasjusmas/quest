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

import { WHIM_JOINED_STATE_MIN_MS } from "@/lib/whim-success-timing";
import { getDailyWhim, type CatalogWhim } from "@/lib/whims-catalog";
import {
  PROFILE_AVATAR_KEY,
  clearAllWhimLocalData as clearLegacyWhimKeys,
  computeStreak,
  incrementRippleReach,
  loadReflectionsV2,
  moodFeelingText,
  reflectionDateKey,
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
  /** Custom circular avatar (data URL); when set, shown instead of emoji. */
  avatarImageUrl: string | null;
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

type PersistedProfile = {
  name: string;
  emoji: string;
  avatarImageUrl?: string | null;
};

function loadProfileBasics(): PersistedProfile {
  if (typeof window === "undefined") {
    return { name: "Justin", emoji: "😊", avatarImageUrl: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PersistedProfile>;
      if (p.name && p.emoji) {
        return {
          name: p.name,
          emoji: p.emoji,
          avatarImageUrl:
            typeof p.avatarImageUrl === "string" ? p.avatarImageUrl : null,
        };
      }
    }
    const avatar = localStorage.getItem(PROFILE_AVATAR_KEY);
    if (avatar) return { name: "Justin", emoji: avatar, avatarImageUrl: null };
  } catch {
    /* ignore */
  }
  return { name: "Justin", emoji: "😊", avatarImageUrl: null };
}

function saveProfileBasics(p: PersistedProfile) {
  try {
    localStorage.setItem(
      STORAGE_PROFILE,
      JSON.stringify({
        name: p.name,
        emoji: p.emoji,
        avatarImageUrl: p.avatarImageUrl ?? null,
      }),
    );
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
  if (Date.now() - joinedAtMs >= WHIM_JOINED_STATE_MIN_MS) {
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
  /** True when there is a reflection saved for the device’s local calendar day. */
  reflectedToday: boolean;
  joinWhim: () => void;
  passToday: () => void;
  openReflecting: () => void;
  setReflectingOpen: (open: boolean) => void;
  saveReflection: (payload: {
    feeling: MoodId | null;
    feelingText: string;
    note: string;
    photoUrl: string | null;
    /** Mood “drawn” doodle; optional alongside `photoUrl`. */
    sketchUrl?: string | null;
  }) => string;
  setProfileEmoji: (emoji: string) => void;
  setProfileName: (name: string) => void;
  setProfileAvatarImage: (dataUrl: string | null) => void;
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
  const [profileAvatarImageUrl, setProfileAvatarImageUrl] = useState<
    string | null
  >(null);

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
    setProfileAvatarImageUrl(pb.avatarImageUrl ?? null);
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
    saveProfileBasics({
      name: profileName,
      emoji: profileEmoji,
      avatarImageUrl: profileAvatarImageUrl,
    });
  }, [hydrated, profileName, profileEmoji, profileAvatarImageUrl]);

  const currentWhim = useMemo(() => getDailyWhim(), []);

  const legacyReflectionsForStreak = useMemo((): WhimReflection[] => {
    return reflections.map((r) => ({
      whimTitle: r.whimText,
      mood: r.feeling,
      note: r.note,
      photoDataUrl: r.photoUrl,
      sketchDataUrl: r.sketchUrl ?? null,
      savedAt: r.date,
    }));
  }, [reflections]);

  const profile: WhimProfile = useMemo(
    () => ({
      name: profileName,
      emoji: profileEmoji,
      avatarImageUrl: profileAvatarImageUrl,
      streak: computeStreak(legacyReflectionsForStreak),
    }),
    [
      legacyReflectionsForStreak,
      profileAvatarImageUrl,
      profileEmoji,
      profileName,
    ],
  );

  const passedToday = skippedDateKey === todayKey();

  const reflectedToday = useMemo(() => {
    const k = todayKey();
    return reflections.some((r) => reflectionDateKey(r.date) === k);
  }, [reflections]);

  const joinWhim = useCallback(() => {
    setSkippedDateKey(null);
    const now = Date.now();
    setWhimState("joined");
    setJoinedAtMs(now);
  }, []);

  useEffect(() => {
    if (whimState !== "joined" || joinedAtMs == null) {
      if (joinedTimerRef.current) {
        clearTimeout(joinedTimerRef.current);
        joinedTimerRef.current = null;
      }
      return;
    }
    const elapsed = Date.now() - joinedAtMs;
    const wait = Math.max(0, WHIM_JOINED_STATE_MIN_MS - elapsed);
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
      sketchUrl?: string | null;
    }): string => {
      const savedAt = new Date().toISOString();
      const sketch =
        payload.feeling === "drawn" && payload.sketchUrl
          ? payload.sketchUrl
          : null;
      const entry: WhimReflectionEntry = {
        whimId: String(currentWhim.id),
        whimText: currentWhim.text,
        date: savedAt,
        feeling: payload.feeling,
        feelingText:
          payload.feelingText || moodFeelingText(payload.feeling),
        note: payload.note,
        photoUrl: payload.photoUrl,
        ...(sketch ? { sketchUrl: sketch } : {}),
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
      return savedAt;
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

  const setProfileAvatarImageCb = useCallback((dataUrl: string | null) => {
    setProfileAvatarImageUrl(dataUrl);
  }, []);

  const clearAllData = useCallback(() => {
    clearLegacyWhimKeys();
    setWhimState("idle");
    setSkippedDateKey(null);
    setJoinedAtMs(null);
    setReflections([]);
    setProfileNameState("Justin");
    setProfileEmojiState("😊");
    setProfileAvatarImageUrl(null);
  }, []);

  const value = useMemo<WhimContextValue>(
    () => ({
      currentWhim,
      whimState,
      reflections,
      profile,
      passedToday,
      reflectedToday,
      joinWhim,
      passToday,
      openReflecting,
      setReflectingOpen,
      saveReflection,
      setProfileEmoji: setProfileEmojiCb,
      setProfileName: setProfileNameCb,
      setProfileAvatarImage: setProfileAvatarImageCb,
      clearAllData,
    }),
    [
      currentWhim,
      whimState,
      reflections,
      profile,
      passedToday,
      reflectedToday,
      joinWhim,
      passToday,
      openReflecting,
      setReflectingOpen,
      saveReflection,
      setProfileEmojiCb,
      setProfileNameCb,
      setProfileAvatarImageCb,
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
