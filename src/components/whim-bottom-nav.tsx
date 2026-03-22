"use client";

import type { ReactNode } from "react";
import { Clock, Sparkles, User } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Reference palette — same on every route (solid bar, no blur). */
const INACTIVE_CIRCLE = "#4B8A3E";
const ACTIVE_ICON = "#2B621F";

export type WhimNavTab = "history" | "whim" | "profile";

const iconStroke = "size-[22px] stroke-[1.75]";

export function WhimBottomNav({ active }: { active: WhimNavTab }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-t-2xl rounded-b-2xl bg-[#2B621F] px-5 pt-4 shadow-[0_-8px_28px_rgba(0,0,0,0.18)]"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
      aria-label="Primary"
    >
      <div className="flex w-full items-end justify-between gap-2">
        <NavItem
          label="History"
          href="/history"
          active={active === "history"}
          icon={<Clock className={iconStroke} aria-hidden />}
        />
        <NavItem
          label="Whim"
          href="/"
          active={active === "whim"}
          icon={<Sparkles className={iconStroke} aria-hidden />}
        />
        <NavItem
          label="Profile"
          href="/profile"
          active={active === "profile"}
          icon={<User className={iconStroke} aria-hidden />}
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
      className="flex min-w-0 flex-1 flex-col items-center gap-1.5 font-sans text-white"
      aria-current={active ? "page" : undefined}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
          active ? "bg-white shadow-sm" : "shadow-sm",
        )}
        style={
          active
            ? undefined
            : { backgroundColor: INACTIVE_CIRCLE }
        }
        aria-hidden
      >
        <span
          className="flex items-center justify-center"
          style={{ color: active ? ACTIVE_ICON : "#ffffff" }}
        >
          {icon}
        </span>
      </div>
      <span
        className={cn(
          "text-center text-[0.68rem] leading-none text-white",
          active ? "font-bold" : "font-normal",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
