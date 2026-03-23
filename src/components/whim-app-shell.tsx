"use client";

import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { AppRouteTransition } from "@/components/app-route-transition";
import { WhimBottomNav, type WhimNavTab } from "@/components/whim-bottom-nav";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";

function navActive(pathname: string): WhimNavTab {
  const p = (pathname.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (p === "/history" || p.startsWith("/history/")) return "history";
  if (p === "" || p === "/") return "whim";
  if (p.startsWith("/profile")) return "profile";
  return "whim";
}

/** Same ranks as `AppRouteTransition` — used to know when the horizontal slide runs. */
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

/**
 * Fixed bottom nav + animated route layer; nav hides during horizontal slides and the
 * join success overlay so it never sits above the transition.
 */
/** Must match `AppRouteTransition` slide duration + small buffer for Framer to settle. */
const TAB_SLIDE_MS = Math.round(0.3 * 1000) + 100;

export function WhimAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { whimState } = useWhim();
  const reduceMotion = useReducedMotion() ?? false;
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  const [navHiddenForSlide, setNavHiddenForSlide] = useState(false);
  const prevPathnameRef = useRef<string | null>(null);

  const navHiddenForJoin = whimState === "joined";
  const navChromeHidden = navHiddenForSlide || navHiddenForJoin;

  useLayoutEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prev === null) return;

    const prevKey = pathKeyFromPathname(prev);
    const pathKey = pathKeyFromPathname(pathname);
    if (prevKey === pathKey) {
      setNavHiddenForSlide(false);
      return;
    }

    const a = navRank(prevKey);
    const b = navRank(pathKey);
    const d = a !== null && b !== null ? b - a : 0;
    if (d === 0 || reduceMotionRef.current) {
      setNavHiddenForSlide(false);
      return;
    }

    setNavHiddenForSlide(true);
    const id = window.setTimeout(() => setNavHiddenForSlide(false), TAB_SLIDE_MS);
    /** Only clear the timer — do not force visible here, or the nav flashes between routes. */
    return () => {
      window.clearTimeout(id);
    };
  }, [pathname]);

  return (
    <>
      <AppRouteTransition>{children}</AppRouteTransition>
      <div
        className={cn(
          navChromeHidden
            ? "pointer-events-none invisible opacity-0"
            : "opacity-100",
        )}
        aria-hidden={navChromeHidden}
      >
        <WhimBottomNav active={navActive(pathname)} />
      </div>
    </>
  );
}
