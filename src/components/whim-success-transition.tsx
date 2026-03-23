"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { WHIM_SUCCESS_SWEEP_DURATION_SEC } from "@/lib/whim-success-timing";

/** Second line starts this many ms after the first line starts animating in. */
const PHASE2_SECOND_LINE_DELAY_MS = 800;
/** After the second line finishes its entrance, hold before `onComplete`. */
const HOLD_AFTER_SECOND_MS = 1000;

const easeInOut = [0.42, 0, 0.58, 1] as const;

const SWEEP_PAD = 12;

/** Use layout viewport width so the sweep spans the full screen (container width can be wrong on first paint). */
function sweepViewportWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
}

/** Left edge of text starts just past the right edge of the viewport. */
function sweepStartX(viewportWidth: number) {
  return viewportWidth + SWEEP_PAD;
}

/** Left edge ends so the whole word (through “t”) clears the left edge. */
function sweepEndX(textWidth: number) {
  return -textWidth - SWEEP_PAD;
}

type WhimSuccessTransitionProps = {
  onComplete: () => void;
};

export function WhimSuccessTransition({
  onComplete,
}: WhimSuccessTransitionProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [phase2, setPhase2] = useState(false);
  const xControl = useAnimationControls();
  const holdAfterLinesRef = useRef<number | null>(null);
  const secondLineHoldScheduledRef = useRef(false);
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;

    const runSweep = () => {
      const t = textRef.current;
      if (!t || cancelled) return;
      const vw = sweepViewportWidth();
      const tw = t.getBoundingClientRect().width;
      if (vw <= 0 || tw <= 0) return;
      const startX = sweepStartX(vw);
      const endX = sweepEndX(tw);
      void xControl.set({ x: startX, y: 0, z: 0 });
      void xControl.start({
        x: endX,
        y: 0,
        z: 0,
        transition: {
          duration: WHIM_SUCCESS_SWEEP_DURATION_SEC,
          ease: easeInOut,
          onComplete: () => {
            if (!cancelled) setPhase2(true);
          },
        },
      });
    };

    raf1 = requestAnimationFrame(() => {
      if (cancelled) return;
      raf2 = requestAnimationFrame(runSweep);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [xControl]);

  useEffect(() => {
    return () => {
      if (holdAfterLinesRef.current) {
        clearTimeout(holdAfterLinesRef.current);
        holdAfterLinesRef.current = null;
      }
    };
  }, []);

  const textMotion = reduceMotion
    ? undefined
    : {
        scale: [1, 1.055, 1.02, 1.06, 1],
      };

  const textTransition = {
    duration: WHIM_SUCCESS_SWEEP_DURATION_SEC,
    ease: easeInOut,
  };

  return (
    <motion.div
      className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#1B6B1B]"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: easeInOut }}
    >
      <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] flex w-full min-w-0 flex-col justify-center overflow-hidden">
          <motion.span
            animate={xControl}
            style={{ opacity: phase2 ? 0 : 1 }}
            className="inline-block self-start transition-opacity duration-500 ease-in-out"
          >
            <motion.span
              ref={textRef}
              {...(textMotion
                ? { animate: textMotion, transition: textTransition }
                : {})}
              className="inline-block origin-center whitespace-nowrap font-serif text-[min(18vw,4.75rem)] italic leading-none text-white drop-shadow-[0_0_36px_rgba(255,255,255,0.55)] drop-shadow-[0_6px_28px_rgba(0,0,0,0.35)] sm:text-[5.75rem] sm:drop-shadow-[0_0_52px_rgba(255,255,255,0.5)] sm:drop-shadow-[0_10px_40px_rgba(0,0,0,0.38)]"
              style={{
                textShadow:
                  "0 0 2px rgba(255,255,255,0.45), 0 2px 20px rgba(0,45,14,0.4)",
              }}
            >
              Sweeeeeeeeet
            </motion.span>
          </motion.span>
        </div>

        {phase2 ? (
          <motion.div
            className="absolute inset-0 z-[10] flex flex-col items-start justify-center px-7 sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05, ease: easeInOut }}
          >
            <div className="flex max-w-[min(34ch,100%)] flex-col gap-5 text-left sm:gap-6">
              <motion.p
                className="font-serif text-[min(8.5vw,2.1rem)] italic leading-snug text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.2)] sm:text-[2.45rem]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0, ease: easeInOut }}
              >
                Come back when you&apos;re done.
              </motion.p>
              <motion.p
                className="font-serif text-[min(8.5vw,2.1rem)] italic leading-snug text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.2)] sm:text-[2.45rem]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.42,
                  delay: PHASE2_SECOND_LINE_DELAY_MS / 1000,
                  ease: easeInOut,
                }}
                onAnimationComplete={() => {
                  if (secondLineHoldScheduledRef.current) return;
                  secondLineHoldScheduledRef.current = true;
                  if (holdAfterLinesRef.current)
                    clearTimeout(holdAfterLinesRef.current);
                  holdAfterLinesRef.current = window.setTimeout(() => {
                    holdAfterLinesRef.current = null;
                    onComplete();
                  }, HOLD_AFTER_SECOND_MS);
                }}
              >
                Don&apos;t stress, you&apos;ll get a reminder later today.
              </motion.p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
