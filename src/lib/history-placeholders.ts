import { getWhimForDate } from "@/data/whims";

import {
  moodFeelingText,
  reflectionDateKey,
  type MoodId,
  type WhimReflectionV2,
} from "@/lib/whim-reflections";

const DEMO_NOTES = [
  "Nice little reset.",
  "Harder than I thought — still glad I did it.",
  "Kept it small and it worked.",
  "Made someone’s afternoon.",
  "Forgot how good this feels.",
  "Will try again tomorrow.",
  "Short and sweet.",
  "Actually laughed out loud.",
];

const MOOD_CYCLE: MoodId[] = [
  "good",
  "great",
  "neutral",
  "creative",
  "good",
  "great",
];

/** Sparse offsets over ~7 weeks so the carousel stays scrollable even with few real saves. */
const DEMO_DAY_OFFSETS = [
  1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 21, 22, 24, 26, 28, 29, 31,
  33, 35, 36, 38, 40, 42, 44, 45, 47, 49,
];

/**
 * Appends demo reflections for past days that don’t already have a save (same calendar day).
 * Not written to localStorage — history UI only.
 */
export function mergeWithPlaceholderReflections(
  existing: WhimReflectionV2[],
): WhimReflectionV2[] {
  const seen = new Set(existing.map((r) => reflectionDateKey(r.date)));
  const extras: WhimReflectionV2[] = [];
  let moodI = 0;
  let noteI = 0;

  for (const off of DEMO_DAY_OFFSETS) {
    const dt = new Date();
    dt.setHours(12, 0, 0, 0);
    dt.setDate(dt.getDate() - off);
    const key = reflectionDateKey(dt.toISOString());
    if (seen.has(key)) continue;
    seen.add(key);

    const whim = getWhimForDate(dt);
    const mood = MOOD_CYCLE[moodI % MOOD_CYCLE.length]!;
    moodI++;

    extras.push({
      whimId: String(whim.id),
      whimText: whim.text,
      date: dt.toISOString(),
      feeling: mood,
      feelingText: moodFeelingText(mood),
      note: DEMO_NOTES[noteI % DEMO_NOTES.length] ?? "",
      photoUrl: null,
    });
    noteI++;
  }

  return [...existing, ...extras].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
