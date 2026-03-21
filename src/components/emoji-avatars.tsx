"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const EMOJIS = ["🌸", "🌊", "🍄", "🌙", "☀️", "🦋", "🌿", "🍯"] as const;

const PASTEL_BG = [
  "#F3E8EE",
  "#E8F0F6",
  "#E9F3EC",
  "#F2EBF8",
  "#F8EEE6",
  "#E6F4F4",
  "#F0F4E8",
  "#EDE9F5",
] as const;

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

type AvatarItem = {
  key: string;
  emoji: (typeof EMOJIS)[number];
  bg: (typeof PASTEL_BG)[number];
  duration: number;
  delay: number;
};

function buildAvatars(): AvatarItem[] {
  const n = randomInt(5, 7);
  return Array.from({ length: n }, (_, i) => ({
    key: `${i}-${Math.random().toString(36).slice(2, 9)}`,
    emoji: EMOJIS[randomInt(0, EMOJIS.length - 1)],
    bg: PASTEL_BG[randomInt(0, PASTEL_BG.length - 1)],
    duration: 2.8 + Math.random() * 1.8,
    delay: Math.random() * 2.2,
  }));
}

export type EmojiAvatarsProps = {
  className?: string;
};

/** Max width for 7 avatars at 24px with 8px overlap */
const PLACEHOLDER_MIN_W = 7 * 24 - 6 * 8;

export function EmojiAvatars({ className }: EmojiAvatarsProps) {
  const [avatars, setAvatars] = useState<AvatarItem[] | null>(null);

  useEffect(() => {
    setAvatars(buildAvatars());
  }, []);

  if (!avatars) {
    return (
      <div
        className={cn("flex h-6 items-center", className)}
        style={{ minWidth: PLACEHOLDER_MIN_W }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn("flex items-center", className)}
      aria-hidden
    >
      {avatars.map((a, i) => (
        <motion.div
          key={a.key}
          className="relative flex size-6 shrink-0 items-center justify-center rounded-full text-[13px] leading-none shadow-[0_1px_2px_rgba(26,26,26,0.06)]"
          style={{
            backgroundColor: a.bg,
            zIndex: i + 1,
            marginLeft: i === 0 ? 0 : -8,
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: a.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: a.delay,
          }}
        >
          {a.emoji}
        </motion.div>
      ))}
    </div>
  );
}
