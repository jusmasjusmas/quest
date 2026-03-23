"use client";

import type { ReactNode } from "react";
import { BookOpen, Flower2, Smile } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const ACTIVE_ICON = "#2B621F";

/**
 * Bottom padding so home CTAs sit ~12px above the top of the fixed nav pill.
 * Nav offset from bottom: 1rem + safe-area; ~5.875rem ≈ nav chrome (icons + labels + padding).
 */
export const whimHomeShellPaddingBottomClass =
  "pb-[calc(1rem+env(safe-area-inset-bottom)+5.875rem+12px)]";

/**
 * `bottom` offset for fixed UI (e.g. completion toast) so it sits just above the nav pill.
 * Matches nav stack: 1rem + safe-area + ~5.875rem chrome + gap.
 */
export const whimToastAboveNavBottomClass =
  "bottom-[calc(1rem+env(safe-area-inset-bottom)+5.875rem+0.75rem)]";

export type WhimNavTab = "history" | "whim" | "profile";

const iconStroke = "size-[22px] stroke-[1.75]";

export function WhimBottomNav({ active }: { active: WhimNavTab }) {
  return (
    <nav
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(100%-1.25rem,26rem)] -translate-x-1/2 rounded-[1.75rem] border-[0.5px] border-white/78 bg-white/22 px-4 pb-3 pt-3 shadow-[0_10px_40px_rgba(27,107,27,0.12),0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl backdrop-saturate-150"
      aria-label="Primary"
    >
      <div className="flex w-full items-end justify-between gap-1">
        <NavItem
          label="History"
          href="/history"
          active={active === "history"}
          icon={<BookOpen className={iconStroke} aria-hidden />}
        />
        <NavItem
          label="Whims"
          href="/"
          active={active === "whim"}
          icon={<Flower2 className={iconStroke} aria-hidden />}
        />
        <NavItem
          label="Profile"
          href="/profile"
          active={active === "profile"}
          icon={<Smile className={iconStroke} aria-hidden />}
        />
      </div>
    </nav>
  );
}

function NavItem({
  label,
  href,
  active,
  icon,
}: {
  label: string;
  href: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-1 flex-col items-center gap-[8px] font-sans text-[#1A1A1A]"
      aria-current={active ? "page" : undefined}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200 sm:h-12 sm:w-12",
          active
            ? "bg-white/92 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-[0.5px] ring-white/85"
            : "bg-transparent",
        )}
        aria-hidden
      >
        <span
          className="flex items-center justify-center"
          style={{ color: active ? ACTIVE_ICON : "rgba(26,26,26,0.72)" }}
        >
          {icon}
        </span>
      </div>
      <span
        className={cn(
          "text-center text-[0.68rem] leading-none",
          active ? "font-bold text-[#1A1A1A]" : "font-normal text-[#1A1A1A]/68",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
