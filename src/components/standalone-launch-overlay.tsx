"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flower2 } from "lucide-react";
import { useLayoutEffect, useState } from "react";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  if (mq.matches) return true;
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  );
}

/**
 * Shown only when the app runs as an installed PWA (e.g. “Add to Home Screen” on
 * Safari). iOS does not support animated native launch screens — only static
 * apple-touch-startup-image PNGs — so this in-app overlay provides a short branded
 * moment after the webview starts.
 */
export function StandaloneLaunchOverlay() {
  const reduceMotion = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!isStandaloneDisplay()) return;
    setVisible(true);
    const holdMs = reduceMotion ? 400 : 950;
    const id = window.setTimeout(() => setVisible(false), holdMs);
    return () => clearTimeout(id);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="pwa-launch"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#E0F4FF]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.42,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden
        >
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Flower2
              className="size-[4.25rem] text-[#2B621F] sm:size-20"
              strokeWidth={1.65}
              aria-hidden
            />
            <p className="font-serif text-[1.85rem] italic leading-none text-[#1A1A1A]/88 sm:text-[2rem]">
              Whims
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
