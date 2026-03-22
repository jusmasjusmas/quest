"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "framer-motion";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { cn } from "@/lib/utils";

const MESSAGES = [
  "Someone just started this whim",
  "12 people joined in the last hour",
  "You won't be alone",
  "3 people completed this in the last 5 minutes",
] as const;

/** Longer than horizontal float (~7.2s) so each message finishes crossing. */
const ROTATE_MS = 8000;

export type ActivityTickerProps = {
  className?: string;
};

function ThoughtBubble({ text }: { text: string }) {
  return (
    <div className="relative w-max max-w-[min(100%,18rem)]">
      <div
        className={cn(
          "relative rounded-[1.35rem] border border-white/55 px-4 py-2.5 font-serif text-sm italic leading-snug text-[#1A1A1A]",
          "bg-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(255,255,255,0.25)]",
          "backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        {text}
      </div>
      <div
        className="absolute -bottom-1 left-5 h-3 w-3 rotate-45 rounded-[3px] border border-white/45 border-t-0 border-l-0 bg-white/30 shadow-sm backdrop-blur-md"
        aria-hidden
      />
    </div>
  );
}

function FloatingBubble({
  message,
  containerRef,
}: {
  message: string;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useLayoutEffect(() => {
    const c = containerRef.current;
    const b = bubbleRef.current;
    if (!c || !b) return;
    const cw = c.clientWidth;
    const bw = b.offsetWidth;
    void controls.set({ x: cw + 20 });
    void controls.start({
      x: -bw - 28,
      transition: { duration: 7.2, ease: "linear" },
    });
  }, [message, controls, containerRef]);

  return (
    <motion.div
      ref={bubbleRef}
      className="absolute left-0 top-1/2 w-max -translate-y-1/2 will-change-transform"
      animate={controls}
    >
      <ThoughtBubble text={message} />
    </motion.div>
  );
}

export function ActivityTicker({ className }: ActivityTickerProps) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[3.25rem] w-full max-w-md overflow-hidden",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={MESSAGES[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <FloatingBubble
            message={MESSAGES[index]}
            containerRef={containerRef}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
