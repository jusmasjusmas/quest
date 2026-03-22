"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const easeInOut = [0.42, 0, 0.58, 1] as const;

/** Extra offset so “Sweeeeeeeeet” starts clearly off the right edge. */
function sweepStartX(containerWidth: number, textWidth: number) {
  return containerWidth / 2 + textWidth + containerWidth * 0.12 + 48;
}

type WhimSuccessTransitionProps = {
  onComplete: () => void;
};

const PHASE2_MS = 12_000;

export function WhimSuccessTransition({
  onComplete,
}: WhimSuccessTransitionProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [phase2, setPhase2] = useState(false);
  const xControl = useAnimationControls();

  useLayoutEffect(() => {
    const c = measureRef.current;
    const t = textRef.current;
    if (!c || !t) return;
    const cw = c.clientWidth;
    const tw = t.getBoundingClientRect().width;
    const startX = sweepStartX(cw, tw);
    void xControl.set({ x: startX });
    void xControl.start({
      x: 0,
      transition: {
        duration: 2.55,
        ease: easeInOut,
        onComplete: () => setPhase2(true),
      },
    });
  }, [xControl]);

  useEffect(() => {
    if (!phase2) return;
    const id = window.setTimeout(onComplete, PHASE2_MS);
    return () => window.clearTimeout(id);
  }, [phase2, onComplete]);

  return (
    <motion.div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden rounded-2xl bg-[#1B6B1B]"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: easeInOut }}
    >
      <div
        ref={measureRef}
        className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      >
        <motion.span
          ref={textRef}
          animate={xControl}
          style={{ opacity: phase2 ? 0 : 1 }}
          className="pointer-events-none absolute left-1/2 top-1/2 inline-block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-serif text-[min(22vw,6.75rem)] italic leading-none text-white transition-opacity duration-500 ease-in-out sm:text-[7.5rem]"
        >
          Sweeeeeeeeet
        </motion.span>

        {phase2 ? (
          <motion.div
            className="absolute inset-0 z-[1] flex items-center justify-center px-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.15, ease: easeInOut }}
          >
            <div className="flex max-w-[min(32ch,100%)] flex-col gap-9 text-center">
              <p className="font-serif text-[min(6.2vw,1.55rem)] italic leading-snug text-white sm:text-[1.85rem]">
                Come back when you&apos;re done.
              </p>
              <p className="font-serif text-[min(6.2vw,1.55rem)] italic leading-snug text-white sm:text-[1.85rem]">
                Don&apos;t stress, you&apos;ll get a reminder later today.
              </p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
