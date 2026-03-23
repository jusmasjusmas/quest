"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { AppRouteTransition } from "@/components/app-route-transition";
import { WhimBottomNav, type WhimNavTab } from "@/components/whim-bottom-nav";
import { cn } from "@/lib/utils";

function navActive(pathname: string): WhimNavTab {
  const p = (pathname.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (p === "/history" || p.startsWith("/history/")) return "history";
  if (p === "" || p === "/") return "whim";
  if (p.startsWith("/profile")) return "profile";
  return "whim";
}

/**
 * Fixed bottom nav + animated route layer; nav hides for the horizontal slide only.
 */
export function WhimAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navHiddenForSlide, setNavHiddenForSlide] = useState(false);
  const onSlideActiveChange = useCallback((active: boolean) => {
    setNavHiddenForSlide(active);
  }, []);

  return (
    <>
      <AppRouteTransition onSlideActiveChange={onSlideActiveChange}>
        {children}
      </AppRouteTransition>
      <div
        className={cn(
          "transition-opacity duration-75",
          navHiddenForSlide && "pointer-events-none opacity-0",
        )}
        aria-hidden={navHiddenForSlide}
      >
        <WhimBottomNav active={navActive(pathname)} />
      </div>
    </>
  );
}
