export type MoodId =
  | "neutral"
  | "good"
  | "great"
  | "creative"
  | "calm"
  | "grateful"
  | "energized"
  | "hopeful"
  | "tender"
  | "drawn";

const MOOD_IDS = new Set<string>([
  "neutral",
  "good",
  "great",
  "creative",
  "calm",
  "grateful",
  "energized",
  "hopeful",
  "tender",
  "drawn",
]);

/** Maps legacy stored ids; normalizes JSON from localStorage. */
export function coerceMoodId(raw: unknown): MoodId | null {
  if (typeof raw !== "string") return null;
  if (raw === "buzzed") return "energized";
  if (MOOD_IDS.has(raw)) return raw as MoodId;
  return null;
}

export type WhimReflection = {
  whimTitle: string;
  mood: MoodId | null;
  note: string;
  photoDataUrl: string | null;
  /** Doodle when mood is “drawn”; optional alongside a mirror photo in photoDataUrl. */
  sketchDataUrl?: string | null;
  savedAt: string;
  /** Stored id; illustration for UI comes from `getWhimForDate(savedAt)` when possible. */
  whimId?: string;
};

/** Canonical stored reflection (WhimContext + localStorage v2). */
export type WhimReflectionV2 = {
  whimId: string;
  whimText: string;
  date: string;
  feeling: MoodId | null;
  feelingText: string;
  note: string;
  photoUrl: string | null;
  /** Mood “drawn” doodle; optional when photoUrl holds an uploaded snapshot too. */
  sketchUrl?: string | null;
};

const REFLECTIONS_LIST_KEY = "quest-whim-reflections";
const LEGACY_SINGLE_KEY = "quest-whim-reflection";
const REFLECTIONS_V2_KEY = "whim-v2-reflections";
const RIPPLE_REACH_KEY = "whim-ripple-reach";
const WHIM_APP_STATE_KEY = "whim-app-state-v1";
const WHIM_PROFILE_KEY = "whim-profile-v1";

export const PROFILE_AVATAR_KEY = "whim-profile-avatar";

export function moodEmoji(mood: MoodId | null): string {
  if (!mood) return "✨";
  const map: Record<MoodId, string> = {
    neutral: "😐",
    good: "🙂",
    great: "😁",
    creative: "🎨",
    calm: "😌",
    grateful: "🙏",
    energized: "⚡",
    hopeful: "🌟",
    tender: "🤗",
    drawn: "✏️",
  };
  return map[mood];
}

export function moodFeelingText(mood: MoodId | null): string {
  if (!mood) return "Still taking it in.";
  const map: Record<MoodId, string> = {
    neutral: "It was okay.",
    good: "Pretty good.",
    great: "Freaking fantastic.",
    creative: "So inspired.",
    calm: "Peaceful and grounded.",
    grateful: "Full of gratitude.",
    energized: "I felt electric.",
    hopeful: "Something good is coming.",
    tender: "It hit me in the heart.",
    drawn: "Hard to put into words, so I drew it instead.",
  };
  return map[mood];
}

function migrateLegacyToV2(): WhimReflectionV2[] {
  const out: WhimReflectionV2[] = [];
  try {
    const listRaw = localStorage.getItem(REFLECTIONS_LIST_KEY);
    if (listRaw) {
      const arr = JSON.parse(listRaw) as WhimReflection[];
      if (Array.isArray(arr)) {
        for (const r of arr) {
          if (!r?.savedAt) continue;
          const mood = coerceMoodId(r.mood);
          out.push({
            whimId: "legacy",
            whimText: r.whimTitle ?? "Today's whim",
            date: r.savedAt,
            feeling: mood,
            feelingText: moodFeelingText(mood),
            note: r.note ?? "",
            photoUrl: r.photoDataUrl ?? null,
            sketchUrl: r.sketchDataUrl ?? undefined,
          });
        }
      }
    } else {
      const oneRaw = localStorage.getItem(LEGACY_SINGLE_KEY);
      if (oneRaw) {
        const r = JSON.parse(oneRaw) as WhimReflection;
        if (r?.savedAt) {
          const mood = coerceMoodId(r.mood);
          out.push({
            whimId: "legacy",
            whimText: r.whimTitle ?? "Today's whim",
            date: r.savedAt,
            feeling: mood,
            feelingText: moodFeelingText(mood),
            note: r.note ?? "",
            photoUrl: r.photoDataUrl ?? null,
            sketchUrl: r.sketchDataUrl ?? undefined,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function loadReflectionsV2(): WhimReflectionV2[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REFLECTIONS_V2_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as WhimReflectionV2[];
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map((row) => {
          const feeling = coerceMoodId(row.feeling);
          return {
            ...row,
            feeling,
            feelingText:
              feeling != null ? moodFeelingText(feeling) : row.feelingText,
          };
        });
      }
    }
    const migrated = migrateLegacyToV2();
    if (migrated.length > 0) {
      localStorage.setItem(REFLECTIONS_V2_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveReflectionsV2(entries: WhimReflectionV2[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFLECTIONS_V2_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function loadReflections(): WhimReflection[] {
  return loadReflectionsV2().map((v) => ({
    whimTitle: v.whimText,
    mood: v.feeling,
    note: v.note,
    photoDataUrl: v.photoUrl,
    sketchDataUrl: v.sketchUrl ?? null,
    savedAt: v.date,
    whimId: v.whimId,
  }));
}

/** @deprecated Prefer WhimContext.saveReflection; kept for direct storage writes. */
export function appendReflection(entry: WhimReflection): void {
  if (typeof window === "undefined") return;
  try {
    const v2: WhimReflectionV2 = {
      whimId: "legacy",
      whimText: entry.whimTitle,
      date: entry.savedAt,
      feeling: entry.mood,
      feelingText: moodFeelingText(entry.mood),
      note: entry.note,
      photoUrl: entry.photoDataUrl,
      sketchUrl: entry.sketchDataUrl ?? undefined,
    };
    const next = [...loadReflectionsV2(), v2];
    saveReflectionsV2(next);
    localStorage.removeItem(LEGACY_SINGLE_KEY);
    localStorage.removeItem(REFLECTIONS_LIST_KEY);
    incrementRippleReach();
  } catch {
    /* quota / private mode */
  }
}

/** Rough “people reached” counter; bumps a bit on each saved reflection. */
export function incrementRippleReach(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RIPPLE_REACH_KEY);
    const prev = raw ? parseInt(raw, 10) : NaN;
    const base = Number.isFinite(prev) && prev > 0 ? prev : 248;
    const add = 9 + Math.floor(Math.random() * 14);
    localStorage.setItem(RIPPLE_REACH_KEY, String(base + add));
  } catch {
    /* ignore */
  }
}

export function getRippleReach(): number {
  if (typeof window === "undefined") return 248;
  try {
    const v = parseInt(localStorage.getItem(RIPPLE_REACH_KEY) || "", 10);
    if (Number.isFinite(v) && v > 0) return v;
  } catch {
    /* ignore */
  }
  const n = loadReflections().length;
  return 248 + n * 17;
}

export function computeStreak(reflections: WhimReflection[]): number {
  if (reflections.length === 0) return 0;
  const days = new Set(reflections.map((r) => reflectionDateKey(r.savedAt)));
  const hasDay = (d: Date) => days.has(reflectionDateKey(d.toISOString()));
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  if (!hasDay(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  if (!hasDay(cursor)) return 0;
  let streak = 0;
  while (hasDay(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive calendar days with at least one completion. */
export function computeBestStreak(reflections: WhimReflection[]): number {
  const dayKeys = [
    ...new Set(reflections.map((r) => reflectionDateKey(r.savedAt))),
  ].sort();
  if (dayKeys.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dayKeys.length; i++) {
    const d0 = new Date(`${dayKeys[i - 1]}T12:00:00`);
    const d1 = new Date(`${dayKeys[i]}T12:00:00`);
    const diffDays = Math.round(
      (d1.getTime() - d0.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (diffDays === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function dominantMood(
  reflections: WhimReflection[],
): { mood: MoodId; count: number } | null {
  const counts = new Map<MoodId, number>();
  for (const r of reflections) {
    if (!r.mood) continue;
    counts.set(r.mood, (counts.get(r.mood) ?? 0) + 1);
  }
  let best: MoodId | null = null;
  let max = 0;
  for (const [m, c] of counts) {
    if (c > max) {
      max = c;
      best = m;
    }
  }
  return best && max > 0 ? { mood: best, count: max } : null;
}

export function favoriteMoodEmoji(reflections: WhimReflection[]): string {
  const counts = new Map<MoodId, number>();
  for (const r of reflections) {
    if (!r.mood) continue;
    counts.set(r.mood, (counts.get(r.mood) ?? 0) + 1);
  }
  let best: MoodId | null = null;
  let max = 0;
  for (const [m, c] of counts) {
    if (c > max) {
      max = c;
      best = m;
    }
  }
  return best ? moodEmoji(best) : "";
}

export function clearAllWhimLocalData(): void {
  if (typeof window === "undefined") return;
  [
    REFLECTIONS_LIST_KEY,
    LEGACY_SINGLE_KEY,
    REFLECTIONS_V2_KEY,
    RIPPLE_REACH_KEY,
    PROFILE_AVATAR_KEY,
    WHIM_APP_STATE_KEY,
    WHIM_PROFILE_KEY,
    "whim-profile-settings-v1",
    "whim-custom-whims-v1",
  ].forEach((k) => localStorage.removeItem(k));
}

/** Local calendar date key (YYYY-MM-DD) for grouping. */
export function reflectionDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatReflectionWeekday(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(iso),
  );
}

export function formatReflectionDateLong(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** e.g. "March 21st" */
export function formatReflectionDateOrdinal(iso: string): string {
  const d = new Date(iso);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(d);
  const day = d.getDate();
  const suf =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${month} ${day}${suf}`;
}
