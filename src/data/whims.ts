export type WhimType = "inward" | "outward";

export type Whim = {
  id: number;
  text: string;
  shortText: string;
  type: WhimType;
  illustration: string;
  /** Reflection notes field placeholder; should match the whim’s activity. */
  notesPlaceholder: string;
};

export const WHIMS: Whim[] = [
  {
    id: 1,
    text: "Give a friend some flowers today.",
    shortText: "Flowers for a friend",
    type: "outward",
    illustration: "/illustrations/flower.png",
    notesPlaceholder:
      "e.g. Who got the flowers, how you gave them, and how it felt.",
  },
  {
    id: 2,
    text: "Take a short walk around a new area.",
    shortText: "Walk a new area",
    type: "inward",
    illustration: "/illustrations/walk.png",
    notesPlaceholder:
      "e.g. Where you walked and what felt different about the route.",
  },
  {
    id: 3,
    text: "Text someone you haven't talked to in a while.",
    shortText: "Text someone you miss",
    type: "outward",
    illustration: "/illustrations/phone.png",
    notesPlaceholder:
      "e.g. Who you texted, what you said, and how the chat felt.",
  },
  {
    id: 4,
    text: "Cook something new from scratch.",
    shortText: "Cook something new",
    type: "inward",
    illustration: "/illustrations/cook.png",
    notesPlaceholder:
      "e.g. What you made, whether it worked out, and how it tasted.",
  },
  {
    id: 5,
    text: "Tell a friend one specific thing you admire about them.",
    shortText: "Name one admiration",
    type: "outward",
    illustration: "/illustrations/wave.png",
    notesPlaceholder:
      "e.g. What you admired, how you told them, and how they reacted.",
  },
  {
    id: 6,
    text: "Give someone a genuine compliment today.",
    shortText: "Compliment someone",
    type: "outward",
    illustration: "/illustrations/wave.png",
    notesPlaceholder:
      "e.g. What you complimented, who it was for, and how it landed.",
  },
  {
    id: 7,
    text: "Give someone a genuine compliment today.",
    shortText: "Compliment someone",
    type: "outward",
    illustration: "/illustrations/wave.png",
    notesPlaceholder:
      "e.g. What you complimented, who it was for, and how it landed.",
  },
  {
    id: 8,
    text: "Make a list of new things you learned recently.",
    shortText: "List what you learned",
    type: "inward",
    illustration: "/illustrations/writing.png",
    notesPlaceholder:
      "e.g. A few items on your list and which one surprised you most.",
  },
];

function hashSeed(seed: number): number {
  let h = Math.imul(seed, 0x9e37_79b9) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85eb_ca6b) | 0;
  h ^= h >>> 13;
  return Math.abs(h);
}

/**
 * Stable shuffle of WHIMS indices 0..7. Each calendar day maps to the next
 * slot (mod 8), so no whim repeats on back-to-back days; over every 8-day
 * window each catalog entry appears exactly once.
 */
const WHIM_SLOT_ORDER: number[] = (() => {
  const a = [0, 1, 2, 3, 4, 5, 6, 7];
  let s = hashSeed(42_069);
  for (let i = 7; i > 0; i--) {
    s = hashSeed(s ^ i * 0xcafe);
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
})();

/** Local calendar day as a UTC-day count (noon avoids DST edge cases). */
function localCalendarDayNumber(d: Date): number {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  return Math.floor(x.getTime() / 86_400_000);
}

function isMarch23Local(d: Date): boolean {
  return d.getMonth() === 2 && d.getDate() === 23;
}

/** Same whim for everyone on a given local calendar day. */
export function getWhimForDate(date: Date): Whim {
  if (isMarch23Local(date)) {
    const cook = WHIMS.find((w) => w.id === 4);
    if (cook) return cook;
  }
  const slot =
    ((localCalendarDayNumber(date) % WHIMS.length) + WHIMS.length) %
    WHIMS.length;
  const idx = WHIM_SLOT_ORDER[slot]!;
  return WHIMS[idx]!;
}
