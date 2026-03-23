"use client";

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
 * Paints html/body/shell + theme-color + `data-whim-chrome` for global CSS when today’s whim is done
 * (night) or during the join success sweep (green). Home page no longer owns this alone.
 */
export function WhimGlobalChrome({ children }: { children: React.ReactNode }) {
  const { whimState, reflectedToday } = useWhim();
  const inWhimFlow =
    whimState === "joined" ||
    whimState === "active" ||
    whimState === "reflecting";
  const nightCompleteDay = reflectedToday && !inWhimFlow;
  const successSweep = whimState === "joined";

  const mode =
    successSweep ? "success" : nightCompleteDay ? "night" : "day";

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const shell = document.getElementById(SHELL_ID);
    const meta = document.querySelector('meta[name="theme-color"]');
    const stack = [html, body, ...(shell ? [shell as HTMLElement] : [])];

    const prevTheme = meta?.getAttribute("content");
    let paintedMeta = false;

    if (mode === "night") {
      paintRootStack(stack, { solid: THEME_NIGHT, image: NIGHT_GRADIENT });
      meta?.setAttribute("content", THEME_NIGHT);
      paintedMeta = true;
    } else if (mode === "success") {
      paintRootStack(stack, { solid: SUCCESS_EDGE_BG, image: null });
      meta?.setAttribute("content", THEME_SUCCESS);
      paintedMeta = true;
    } else {
      clearRootPaint(stack);
      if (prevTheme != null) meta?.setAttribute("content", prevTheme);
      else meta?.setAttribute("content", THEME_SKY);
    }

    shell?.setAttribute("data-whim-chrome", mode);

    return () => {
      clearRootPaint(stack);
      shell?.setAttribute("data-whim-chrome", "day");
      if (paintedMeta) {
        if (prevTheme != null) meta?.setAttribute("content", prevTheme);
        else meta?.setAttribute("content", THEME_SKY);
      }
    };
  }, [mode]);

  return <>{children}</>;
}
