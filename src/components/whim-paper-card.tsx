import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Jagged bottom edge (torn paper); viewBox 360×14, scales full width */
const TEAR_PATH =
  "M0,0 H360 V5 L352,12 L344,3 L336,11 L328,4 L320,12 L312,5 L304,11 L296,4 L288,12 L280,6 L272,11 L264,4 L256,12 L248,5 L240,11 L232,4 L224,12 L216,6 L208,11 L200,4 L192,12 L184,5 L176,11 L168,4 L160,12 L152,6 L144,11 L136,4 L128,12 L120,5 L112,11 L104,4 L96,12 L88,6 L80,11 L72,4 L64,12 L56,5 L48,11 L40,4 L32,12 L24,6 L16,11 L8,4 L0,10 Z";

type WhimPaperCardProps = {
  children: ReactNode;
  className?: string;
  /** Padding / radius overrides for the inner sheet (e.g. larger join card). */
  innerClassName?: string;
};

export function WhimPaperCard({
  children,
  className,
  innerClassName,
}: WhimPaperCardProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative z-[1] rounded-t-[1.15rem] bg-[#fdfcfa] px-5 pb-4 pt-4",
          "shadow-[0_4px_28px_rgba(0,0,0,0.07)] ring-1 ring-[#1A1A1A]/8",
          innerClassName,
        )}
      >
        {children}
      </div>
      <svg
        className="relative z-[2] -mt-px block h-[14px] w-full text-[#fdfcfa] drop-shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        viewBox="0 0 360 14"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill="currentColor" d={TEAR_PATH} />
      </svg>
    </div>
  );
}
