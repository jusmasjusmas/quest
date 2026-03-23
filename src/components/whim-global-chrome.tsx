"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

import { useWhim } from "@/context/WhimContext";
import {
  clearRootPaint,
  NIGHT_GRADIENT,
  paintRootStack,
  SUCCESS_EDGE_BG,
  THEME_NIGHT,
  THEME_SKY,
  THEME_SUCCESS,
} from "@/lib/whim-chrome";

const SHELL_ID = "whim-app-root";

/**
 * Paints html/body/shell + theme-color for the join success sweep (green), or when
 * today’s whim is done only on `/` so safe areas match the night home. Other routes
 * stay sky; history/profile keep default light styling.
 */
export function WhimGlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { whimState, reflectedToday } = useWhim();
  const inWhimFlow =
    whimState === "joined" ||
    whimState === "active" ||
    whimState === "reflecting";
  const nightCompleteDay = reflectedToday && !inWhimFlow;
  const successSweep = whimState === "joined";
  const paintNightHome = nightCompleteDay && pathname === "/";

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const shell = document.getElementById(SHELL_ID);
    const meta = document.querySelector('meta[name="theme-color"]');
    const stack = [html, body, ...(shell ? [shell as HTMLElement] : [])];

    const prevTheme = meta?.getAttribute("content");
    let paintedMeta = false;

    if (successSweep) {
      paintRootStack(stack, { solid: SUCCESS_EDGE_BG, image: null });
      meta?.setAttribute("content", THEME_SUCCESS);
      paintedMeta = true;
    } else if (paintNightHome) {
      paintRootStack(stack, { solid: THEME_NIGHT, image: NIGHT_GRADIENT });
      meta?.setAttribute("content", THEME_NIGHT);
      paintedMeta = true;
    } else {
      clearRootPaint(stack);
      if (prevTheme != null) meta?.setAttribute("content", prevTheme);
      else meta?.setAttribute("content", THEME_SKY);
    }

    shell?.setAttribute("data-whim-chrome", successSweep ? "success" : "day");

    return () => {
      clearRootPaint(stack);
      shell?.setAttribute("data-whim-chrome", "day");
      if (paintedMeta) {
        if (prevTheme != null) meta?.setAttribute("content", prevTheme);
        else meta?.setAttribute("content", THEME_SKY);
      }
    };
  }, [successSweep, paintNightHome]);

  return <>{children}</>;
}
