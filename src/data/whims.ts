export type WhimType = "inward" | "outward";

export type Whim = {
  id: number;
  text: string;
  shortText: string;
  type: WhimType;
  illustration: string;
};

export const WHIMS: Whim[] = [
  {
    id: 1,
    text: "Let's give a friend some flowers today.",
    shortText: "Flowers for a friend",
    type: "outward",
    illustration: "/illustrations/flower.png",
  },
  {
    id: 2,
    text: "Take a 10-minute walk somewhere you've never been.",
    shortText: "Walk somewhere new",
    type: "inward",
    illustration: "/illustrations/walk.png",
  },
  {
    id: 3,
    text: "Text someone you haven't talked to in 2 weeks.",
    shortText: "Text someone missed",
    type: "outward",
    illustration: "/illustrations/phone.png",
  },
  {
    id: 4,
    text: "Cook something from scratch, even if it's just eggs.",
    shortText: "Cook from scratch",
    type: "inward",
    illustration: "/illustrations/cook.png",
  },
  {
    id: 5,
    text: "Tell a friend one specific thing you admire about them.",
    shortText: "Name one admiration",
    type: "outward",
    illustration: "/illustrations/wave.png",
  },
  {
    id: 6,
    text: "Sit outside for 15 minutes with no phone.",
    shortText: "Outside, no phone",
    type: "inward",
    illustration: "/illustrations/sitting.png",
  },
  {
    id: 7,
    text: "Send an encouraging message to someone who's grinding right now.",
    shortText: "Encourage a grinder",
    type: "outward",
    illustration: "/illustrations/phone.png",
  },
  {
    id: 8,
    text: "Write down one thing you learned this week that you didn't know last month.",
    shortText: "One thing you learned",
    type: "inward",
    illustration: "/illustrations/writing.png",
  },
];

function dateSeedLocal(d: Date): number {
  return d.getFullYear() * 10_000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function hashSeed(seed: number): number {
  let h = Math.imul(seed, 0x9e37_79b9) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85eb_ca6b) | 0;
  h ^= h >>> 13;
  return Math.abs(h);
}

/** Same whim for everyone on a given local calendar day. */
export function getWhimForDate(date: Date): Whim {
  const idx = hashSeed(dateSeedLocal(date)) % WHIMS.length;
  return WHIMS[idx]!;
}
