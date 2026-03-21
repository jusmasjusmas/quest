"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type WhimNavTab = "history" | "whim" | "profile";

export function WhimBottomNav({ active }: { active: WhimNavTab }) {
  return (
    <nav
      className="flex items-end justify-between gap-2 pb-2 pt-6"
      aria-label="Primary"
    >
      <NavItem
        label="History"
        href="/history"
        active={active === "history"}
      />
      <NavItem label="Whim" href="/" active={active === "whim"} />
      <NavItem
        label="Profile"
        href="/profile"
        active={active === "profile"}
      />
    </nav>
  );
}

function NavItem({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  const inner = (
    <>
      <div
        className={
          active
            ? "h-14 w-14 shrink-0 rounded-full bg-white shadow-sm"
            : "h-8 w-8 shrink-0 rounded-full bg-[#2a8f2a]"
        }
        aria-hidden
      />
      <span
        className={cn(
          "leading-none",
          active
            ? "text-xs font-semibold"
            : "text-[0.65rem] font-medium text-white/55",
        )}
      >
        {label}
      </span>
    </>
  );
  const className = cn(
    "flex flex-col items-center gap-2 font-sans text-white",
    active && "-mt-3",
  );
  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {inner}
    </Link>
  );
}
