"use client";

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Same on server and client so the first paint hydrates without mismatch. */
const HYDRATION_PLACEHOLDER = 650;

/** Smooth ease-in-out with a gentle settle toward the target (no spring jitter). */
const COUNT_EASE: [number, number, number, number] = [0.45, 0, 0.25, 1];

/** Hold steady on one reading before the next move (ms). */
const TICK_DELAY_MIN = 18_000;
const TICK_DELAY_MAX = 32_000;

/**
 * Simulates a live “others doing this whim” count: each update tweens with ease-in-out
 * (fast through the middle, easing into the final number).
 */
export function usePeopleCount(): number {
  const count = useMotionValue(HYDRATION_PLACEHOLDER);
  const [display, setDisplay] = useState(HYDRATION_PLACEHOLDER);
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
    const c = animate(count, randomInt(400, 900), {
      type: "tween",
      duration: 2.5,
      ease: COUNT_EASE,
    });
    animRef.current = c;
    return () => {
      c.stop();
      animRef.current = null;
    };
  }, [count]);

  useEffect(() => {
    let timeoutId = 0;

    const tick = () => {
      const from = Math.round(count.get());
      const delta = randomInt(-5, 8);
      const next = clamp(from + delta, 100, 1500);
      stopAnim();
      const dist = Math.abs(next - from);
      const duration = Math.min(3.6, Math.max(1.85, 1.15 + dist * 0.03));
      animRef.current = animate(count, next, {
        type: "tween",
        duration,
        ease: COUNT_EASE,
      });
      timeoutId = window.setTimeout(tick, randomInt(TICK_DELAY_MIN, TICK_DELAY_MAX));
    };

    timeoutId = window.setTimeout(tick, randomInt(TICK_DELAY_MIN, TICK_DELAY_MAX));
    return () => {
      window.clearTimeout(timeoutId);
      stopAnim();
    };
  }, [count]);

  return display;
}
