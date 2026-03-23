"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { ReflectionDrawer } from "@/components/reflection-drawer";
import { whimToastAboveNavBottomClass } from "@/components/whim-bottom-nav";
import { WhimHomeShell } from "@/components/whim-home-shell";
import { WhimSuccessTransition } from "@/components/whim-success-transition";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";

export default function Home() {
  const { whimState, reflectedToday } = useWhim();
  const inWhimFlow =
    whimState === "joined" ||
    whimState === "active" ||
    whimState === "reflecting";
  /** Matches `WhimHomeShell` `copyMode === "doneToday"` — reflected, not mid-flow. */
  const doneHome = reflectedToday && !inWhimFlow;

  return (
    <div
      className={cn(
        "relative flex h-dvh max-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-visible overflow-hidden",
        doneHome
          ? "bg-gradient-to-b from-whim-night-top via-whim-night-mid to-whim-night"
          : "bg-whim-sky",
      )}
    >
      <WhimHomeShell />
      <AnimatePresence>
        {whimState === "joined" ? (
          <motion.div
            key="success-overlay"
            className="absolute inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <WhimSuccessTransition onComplete={() => {}} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <ReflectionDrawer />
      <AnimatePresence>
        {whimState === "completed" ? (
          <motion.div
            key="saved-toast"
            role="status"
            className={cn(
              "pointer-events-none fixed left-1/2 z-[60] w-[min(calc(100vw-1.5rem),22rem)] -translate-x-1/2 rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-white shadow-[0_12px_40px_rgba(27,107,27,0.45),0_0_0_1px_rgba(255,255,255,0.22)_inset,0_2px_12px_rgba(0,0,0,0.12)] ring-2 ring-white/30",
              whimToastAboveNavBottomClass,
              "bg-gradient-to-br from-[#3fcb4a] via-[#2a9e36] to-[#1B6B1B]",
            )}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <span className="flex items-center justify-center gap-2.5 text-center tracking-tight drop-shadow-sm">
              <Sparkles
                className="size-[1.05rem] shrink-0 text-white/95"
                strokeWidth={2.25}
                aria-hidden
              />
              Today&apos;s whim completed
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
