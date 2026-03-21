"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const MESSAGES = [
  "Someone just started this whim",
  "12 people joined in the last hour",
  "You won't be alone",
  "3 people completed this in the last 5 minutes",
] as const;

const ROTATE_MS = 4000;

const crossfade = {
  duration: 0.55,
  ease: [0.4, 0, 0.2, 1] as const,
};

export type ActivityTickerProps = {
  className?: string;
};

export function ActivityTicker({ className }: ActivityTickerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "relative grid min-h-[2.625rem] max-w-md place-items-start",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.p
          key={MESSAGES[index]}
          className="col-start-1 row-start-1 w-full font-serif text-sm italic leading-snug text-[#1A1A1A]/48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={crossfade}
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
