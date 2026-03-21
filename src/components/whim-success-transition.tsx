"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const easeInOut = [0.42, 0, 0.58, 1] as const;

type WhimSuccessTransitionProps = {
  onComplete: () => void;
};

export function WhimSuccessTransition({
  onComplete,
}: WhimSuccessTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [marquee, setMarquee] = useState<{
    from: number;
    to: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = measureRef.current;
    if (!container || !text) return;
    const cw = container.clientWidth;
    const tw = text.getBoundingClientRect().width;
    setMarquee({ from: cw, to: -tw });
  }, []);

  useEffect(() => {
    const id = window.setTimeout(onComplete, 3000);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  return (
    <motion.div
      className="flex min-h-screen flex-col overflow-hidden rounded-2xl bg-[#1B6B1B]"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: easeInOut }}
    >
      <div
        ref={containerRef}
        className="relative w-full shrink-0 overflow-hidden pt-14 pb-6"
      >
        {!marquee ? (
          <span
            ref={measureRef}
            className="invisible absolute left-0 top-0 whitespace-nowrap font-serif text-[min(22vw,6.5rem)] italic leading-none text-white sm:text-[6.25rem]"
            aria-hidden
          >
            Sweeeeeeeeet
          </span>
        ) : (
          <motion.span
            className="inline-block whitespace-nowrap font-serif text-[min(22vw,6.5rem)] italic leading-none text-white sm:text-[6.25rem]"
            initial={{ x: marquee.from }}
            animate={{ x: marquee.to }}
            transition={{ duration: 3, ease: easeInOut }}
          >
            Sweeeeeeeeet
          </motion.span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-10 px-6 pb-16 pt-4">
        <motion.p
          className="text-center font-serif text-2xl italic leading-snug text-white sm:text-[1.75rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.55,
            ease: easeInOut,
          }}
        >
          Come back when you&apos;re done.
        </motion.p>

        <motion.p
          className="text-center font-serif text-2xl italic leading-snug text-white sm:text-[1.75rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.72,
            duration: 0.55,
            ease: easeInOut,
          }}
        >
          Don&apos;t stress, you&apos;ll get a reminder later today.
        </motion.p>
      </div>
    </motion.div>
  );
}
