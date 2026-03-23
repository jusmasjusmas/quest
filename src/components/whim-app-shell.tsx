"use client";

import { usePathname } from "next/navigation";

import { AppRouteTransition } from "@/components/app-route-transition";
import { WhimBottomNav, type WhimNavTab } from "@/components/whim-bottom-nav";

function navActive(pathname: string): WhimNavTab {
  const p = (pathname.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (p === "/history" || p.startsWith("/history/")) return "history";
  if (p === "" || p === "/") return "whim";
  if (p.startsWith("/profile")) return "profile";
  return "whim";
}

/**
 * Fixed bottom nav + animated route layer. The nav stays mounted and visible; tab
 * content slides in the layer below (full-bleed pages still pass under the pill).
 */
export function WhimAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <AppRouteTransition>{children}</AppRouteTransition>
      <WhimBottomNav active={navActive(pathname)} />
    </>
  );
}
