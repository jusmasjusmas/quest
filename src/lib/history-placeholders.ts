import { getWhimForDate } from "@/data/whims";

import {
  moodFeelingText,
  reflectionDateKey,
  type MoodId,
  type WhimReflectionV2,
} from "@/lib/whim-reflections";

/**
 * Demo history for the last ~3 weeks only (merged in UI, not persisted).
 * Picsum `seed` URLs are stable and tend to hotlink more reliably than random Unsplash permalinks.
 */
type DemoDay = {
  daysAgo: number;
  mood: MoodId;
  /** Stable picsum seed → 480×480, or null for no photo */
  photoSeed: string | null;
};

/** Demo Past Whims copy is chosen from the whim for that calendar day (`getWhimForDate`). */
const PLACEHOLDER_NOTE_BY_WHIM_ID: Record<number, string> = {
  1: "Grabbed a small bouquet for a friend who’s been stressed. She put them by her laptop and said it shifted her whole afternoon.",
  2: "Ten minutes down a side street I’d only ever driven past. Found a mural I never knew was there.",
  3: "Texted someone I hadn’t talked to in weeks. We picked up like no time had passed—lots of exclamation points.",
  4: "Made scrambled eggs with whatever was in the fridge. Ate them standing at the counter. Felt oddly accomplished.",
  5: "Told my coworker I admire how calm they stay in messy meetings. They said nobody had put it that way before.",
  6: "Complimented someone’s work on a small project. They lit up—I forget how rare it is to say it out loud.",
  7: "Said something genuine about a stranger’s dog sweater. Got a laugh and a wave. Cheap joy, high return.",
  8: "Jotted down one thing I learned about sleep this week—obvious in hindsight, but I needed it on paper.",
};

const DEMO_DAYS: DemoDay[] = [
  { daysAgo: 1, mood: "good", photoSeed: "whimph-01" },
  { daysAgo: 2, mood: "great", photoSeed: "whimph-02" },
  { daysAgo: 3, mood: "neutral", photoSeed: null },
  { daysAgo: 5, mood: "grateful", photoSeed: "whimph-03" },
  { daysAgo: 6, mood: "calm", photoSeed: null },
  { daysAgo: 7, mood: "creative", photoSeed: "whimph-04" },
  { daysAgo: 9, mood: "good", photoSeed: null },
  { daysAgo: 10, mood: "great", photoSeed: "whimph-05" },
  { daysAgo: 11, mood: "neutral", photoSeed: null },
  { daysAgo: 12, mood: "grateful", photoSeed: "whimph-06" },
  { daysAgo: 14, mood: "calm", photoSeed: "whimph-07" },
  { daysAgo: 15, mood: "good", photoSeed: null },
  { daysAgo: 17, mood: "creative", photoSeed: "whimph-08" },
  { daysAgo: 18, mood: "great", photoSeed: null },
  { daysAgo: 20, mood: "grateful", photoSeed: "whimph-09" },
  { daysAgo: 21, mood: "calm", photoSeed: null },
];

/**
 * Appends demo reflections for recent days that don’t already have a save (same calendar day).
 * Not written to localStorage; history UI only.
 */
export function mergeWithPlaceholderReflections(
  existing: WhimReflectionV2[],
): WhimReflectionV2[] {
  const seen = new Set(existing.map((r) => reflectionDateKey(r.date)));
  const extras: WhimReflectionV2[] = [];

  for (const slot of DEMO_DAYS) {
    const dt = new Date();
    dt.setHours(12, 0, 0, 0);
    dt.setDate(dt.getDate() - slot.daysAgo);
    const key = reflectionDateKey(dt.toISOString());
    if (seen.has(key)) continue;
    seen.add(key);

    const whim = getWhimForDate(dt);
    const photoUrl = slot.photoSeed
      ? `https://picsum.photos/seed/${slot.photoSeed}/480/480`
      : null;
    const note =
      PLACEHOLDER_NOTE_BY_WHIM_ID[whim.id] ??
      "Showed up for today’s whim. Glad I did.";

    extras.push({
      whimId: String(whim.id),
      whimText: whim.text,
      date: dt.toISOString(),
      feeling: slot.mood,
      feelingText: moodFeelingText(slot.mood),
      note,
      photoUrl,
    });
  }

  return [...existing, ...extras].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
