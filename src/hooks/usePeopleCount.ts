"use client";

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Smooth ease-in-out with a gentle settle toward the target (no spring jitter). */
const COUNT_EASE: [number, number, number, number] = [0.45, 0, 0.25, 1];

/** Hold steady on one reading before the next move (ms). */
const TICK_DELAY_MIN = 52_000;
const TICK_DELAY_MAX = 88_000;

const COUNT_FLOOR = 520;
const COUNT_CEIL = 720;

/**
 * Simulates a live “others doing this whim” count: starts at 0 and counts up to the
 * first target, then eases on small random ticks.
 */
export function usePeopleCount(): number {
  const reduceMotion = useReducedMotion() ?? false;
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const stopAnim = () => {
    animRef.current?.stop();
    animRef.current = null;
  };

  useMotionValueEvent(count, "change", (v) => {
    setDisplay(Math.round(v));
  });

  useEffect(() => {
    stopAnim();
    const target = randomInt(COUNT_FLOOR + 20, COUNT_CEIL - 20);
    if (reduceMotion) {
      count.set(target);
      return;
    }
    const duration = Math.min(6.2, Math.max(3.8, 2.4 + target * 0.006));
    const c = animate(count, target, {
      type: "tween",
      duration,
      ease: COUNT_EASE,
    });
    animRef.current = c;
    return () => {
      c.stop();
      animRef.current = null;
    };
  }, [count, reduceMotion]);

  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      const from = Math.round(count.get());
      const delta = randomInt(-2, 2);
      const next = clamp(from + delta, COUNT_FLOOR, COUNT_CEIL);
      stopAnim();
      if (reduceMotion) {
        count.set(next);
      } else {
        const dist = Math.abs(next - from);
        const duration = Math.min(8.5, Math.max(4.5, 3.2 + dist * 0.45));
        animRef.current = animate(count, next, {
          type: "tween",
          duration,
          ease: COUNT_EASE,
        });
      }
      timeoutId = window.setTimeout(
        tick,
        randomInt(TICK_DELAY_MIN, TICK_DELAY_MAX),
      ) as unknown as number;
    };

    timeoutId = window.setTimeout(
      tick,
      randomInt(TICK_DELAY_MIN, TICK_DELAY_MAX),
    ) as unknown as number;
    return () => {
      window.clearTimeout(timeoutId);
      stopAnim();
    };
  }, [count, reduceMotion]);

  return display;
}
