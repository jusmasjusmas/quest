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
  note: string;
  /** Stable picsum seed → 480×480, or null for no photo */
  photoSeed: string | null;
};

const DEMO_DAYS: DemoDay[] = [
  {
    daysAgo: 1,
    mood: "good",
    note: "Did it walking the dog. Felt less dramatic in my head once I actually started.",
    photoSeed: "whimph-01",
  },
  {
    daysAgo: 2,
    mood: "great",
    note: "Okay full honesty I rolled my eyes at the prompt then did it anyway and I’m glad??? Sent a dumb meme to my cousin and we talked for like 40 min.",
    photoSeed: "whimph-02",
  },
  {
    daysAgo: 3,
    mood: "neutral",
    note: "Fine.",
    photoSeed: null,
  },
  {
    daysAgo: 5,
    mood: "grateful",
    note: "Small thing but I needed it. Left a note on the counter for my roommate. Nothing poetic, just thanks for dealing with my dishes pile.",
    photoSeed: "whimph-03",
  },
  {
    daysAgo: 6,
    mood: "calm",
    note: "Rainy day. Sat on the porch with tea and didn’t touch my phone for twenty minutes. That counts for me today.",
    photoSeed: null,
  },
  {
    daysAgo: 7,
    mood: "creative",
    note: "Doodled instead of scrolling. Bad art, good brain.",
    photoSeed: "whimph-04",
  },
  {
    daysAgo: 9,
    mood: "good",
    note: "Short one: texted “thinking of you” to someone I keep meaning to check on. Got a heart emoji back. I’ll take it.",
    photoSeed: null,
  },
  {
    daysAgo: 10,
    mood: "great",
    note: "Bragged on a coworker in the group chat when nobody asked. Felt a little awkward for two seconds then didn’t care.",
    photoSeed: "whimph-05",
  },
  {
    daysAgo: 11,
    mood: "neutral",
    note: "Meh day overall. Still showed up. That’s the bar sometimes.",
    photoSeed: null,
  },
  {
    daysAgo: 12,
    mood: "grateful",
    note: "Called my mom while folding laundry. She talked my ear off about the neighbor’s dog and I realized I miss that noise.",
    photoSeed: "whimph-06",
  },
  {
    daysAgo: 14,
    mood: "calm",
    note: "Took the long way home. Saw three dogs. 10/10 detour.",
    photoSeed: "whimph-07",
  },
  {
    daysAgo: 15,
    mood: "good",
    note: "Yep.",
    photoSeed: null,
  },
  {
    daysAgo: 17,
    mood: "creative",
    note: "Rearranged one shelf. Sounds silly but the living room actually feels different. My brain is embarrassingly easy to trick sometimes.",
    photoSeed: "whimph-08",
  },
  {
    daysAgo: 18,
    mood: "great",
    note: "Volunteered to grab coffee for the table. Got a “you’re a legend” from someone I barely know. Cheap dopamine but I’ll claim it.",
    photoSeed: null,
  },
  {
    daysAgo: 20,
    mood: "grateful",
    note: "Wrote three sentences in a journal instead of a whole essay. Progress not perfection etc etc.",
    photoSeed: "whimph-09",
  },
  {
    daysAgo: 21,
    mood: "calm",
    note: "Almost skipped. Didn’t. Proud of past-me for that.",
    photoSeed: null,
  },
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

    extras.push({
      whimId: String(whim.id),
      whimText: whim.text,
      date: dt.toISOString(),
      feeling: slot.mood,
      feelingText: moodFeelingText(slot.mood),
      note: slot.note,
      photoUrl,
    });
  }

  return [...existing, ...extras].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
