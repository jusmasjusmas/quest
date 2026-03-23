"use client";

import { AnimatePresence, motion } from "framer-motion";

import { ReflectionDrawer } from "@/components/reflection-drawer";
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
  const successTransition = whimState === "joined";

  return (
    <div
      className={cn(
        "relative flex h-dvh max-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-visible overflow-hidden",
        doneHome
          ? "bg-gradient-to-b from-whim-night-top via-whim-night-mid to-whim-night"
          : successTransition
            ? "bg-[#1B6B1B]"
            : "bg-whim-sky",
      )}
    >
      <WhimHomeShell />
      <AnimatePresence>
        {whimState === "joined" ? (
          <motion.div
            key="success-overlay"
            className="absolute inset-0 z-[70] overflow-hidden"
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
    </div>
  );
}
