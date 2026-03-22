"use client";

import { AnimatePresence, motion } from "framer-motion";

import { ReflectionDrawer } from "@/components/reflection-drawer";
import { WhimHomeShell } from "@/components/whim-home-shell";
import { WhimSuccessTransition } from "@/components/whim-success-transition";
import { useWhim } from "@/context/WhimContext";

export default function Home() {
  const { whimState } = useWhim();

  return (
    <div className="relative mx-auto min-h-screen max-w-sm overflow-hidden rounded-2xl">
      <WhimHomeShell />
      <AnimatePresence>
        {whimState === "joined" ? (
          <motion.div
            key="success-overlay"
            className="absolute inset-0 z-50 overflow-hidden rounded-2xl"
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
            className="pointer-events-none fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] left-1/2 z-[60] max-w-sm -translate-x-1/2 rounded-full bg-[#1A1A1A] px-6 py-3 font-sans text-sm font-medium text-white shadow-lg"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            Saved!
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
