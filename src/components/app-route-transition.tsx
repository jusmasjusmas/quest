"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/** Snappy ease-out — quick start, smooth settle */
const ease = [0.32, 0.72, 0, 1] as const;

/**
 * Bottom nav tab reading order: History → Whims → Profile.
 * Used to pick slide direction (forward = enter from right, back = enter from left).
 */
function navRank(path: string): number | null {
  const p = path.replace(/\/$/, "") || "/";
  if (p === "/history" || p.startsWith("/history/")) return 0;
  if (p === "" || p === "/") return 1;
  if (p.startsWith("/profile")) return 2;
  return null;
}

function pathKeyFromPathname(pathname: string): string {
  return pathname.split("?")[0] || "/";
}

export function AppRouteTransition({
  children,
  onSlideActiveChange,
}: {
  children: React.ReactNode;
  /** True while the horizontal route slide runs — hide fixed chrome (e.g. bottom nav). */
  onSlideActiveChange?: (active: boolean) => void;
}) {
  const pathname = usePathname();
  const pathKey = pathKeyFromPathname(pathname);
  const reduceMotion = useReducedMotion() ?? false;
  const prevKeyRef = useRef<string | null>(null);
  const deltaRef = useRef(0);
  const firstPathKeyRef = useRef(true);

  if (prevKeyRef.current === null) {
    prevKeyRef.current = pathKey;
  } else if (prevKeyRef.current !== pathKey) {
    const a = navRank(prevKeyRef.current);
    const b = navRank(pathKey);
    deltaRef.current = a !== null && b !== null ? b - a : 0;
    prevKeyRef.current = pathKey;
  }

  const duration = reduceMotion ? 0.04 : 0.3;

  useLayoutEffect(() => {
    if (!onSlideActiveChange) return;
    if (firstPathKeyRef.current) {
      firstPathKeyRef.current = false;
      return;
    }
    const d = deltaRef.current;
    const willSlide = d !== 0 && !reduceMotion;
    if (!willSlide) return;

    onSlideActiveChange(true);
    const ms = Math.round(duration * 1000) + 60;
    const id = window.setTimeout(() => onSlideActiveChange(false), ms);
    return () => {
      window.clearTimeout(id);
      onSlideActiveChange(false);
    };
  }, [pathKey, duration, reduceMotion, onSlideActiveChange]);

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={pathKey}
          className="absolute inset-0 flex min-h-0 min-w-0 flex-col overflow-x-hidden"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: () => {
              const d = deltaRef.current;
              if (d === 0 || reduceMotion) return { x: 0 };
              return { x: d > 0 ? "100%" : "-100%" };
            },
            animate: {
              x: 0,
            },
            exit: () => {
              const d = deltaRef.current;
              if (d === 0 || reduceMotion) return { x: 0 };
              return { x: d > 0 ? "-100%" : "100%" };
            },
          }}
          transition={{ duration, ease }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
