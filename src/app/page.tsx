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

  return (
    <div
      className={cn(
        "relative flex min-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-visible overflow-hidden",
        doneHome ? "bg-whim-sunset" : "bg-whim-sky",
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
            className="pointer-events-none fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] left-1/2 z-[60] w-[min(calc(100vw-1.5rem),32rem)] -translate-x-1/2 rounded-2xl bg-[#1A1A1A] px-5 py-3.5 text-center font-sans text-sm font-medium text-white shadow-lg"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            Today’s whim completed.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
