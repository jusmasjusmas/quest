"use client";

import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Simulates a live “others doing this whim” count: random walk with spring-smoothed display.
 */
export function usePeopleCount(): number {
  const initial = useMemo(() => randomInt(400, 900), []);

  const target = useMotionValue(initial);
  const smooth = useSpring(target, {
    stiffness: 90,
    damping: 24,
    mass: 0.75,
  });

  const [display, setDisplay] = useState(initial);

  useMotionValueEvent(smooth, "change", (v) => {
    setDisplay(Math.round(v));
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const base = Math.round(target.get());
      const delta = randomInt(-5, 8);
      const next = clamp(base + delta, 100, 1500);
      target.set(next);
      timeoutId = setTimeout(tick, randomInt(2000, 5000));
    };

    timeoutId = setTimeout(tick, randomInt(2000, 5000));
    return () => clearTimeout(timeoutId);
  }, [target]);

  return display;
}
