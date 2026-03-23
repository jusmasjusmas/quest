"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useWhim } from "@/context/WhimContext";

export default function AccountSettingsPage() {
  const { profile, reflections } = useWhim();

  return (
    <div className="flex min-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col bg-whim-sky">
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] sm:pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
        <Link
          href="/profile/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1A1A1A] transition-colors hover:bg-black/5"
          aria-label="Back to settings"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 top-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] -translate-x-1/2 translate-y-2 font-serif text-lg italic text-[#1A1A1A] sm:top-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
          Account
        </h1>
        <span className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <main className="px-6 pt-2">
        <div className="flex flex-col space-y-8 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))]">
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-3xl shadow-md ring-2 ring-[#1A1A1A]/14">
              {profile.avatarImageUrl ? (
                <Image
                  src={profile.avatarImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span aria-hidden>{profile.emoji}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-xl italic leading-tight text-[#1A1A1A]">
                {profile.name}
              </p>
              <p className="mt-1 font-sans text-xs font-light leading-snug text-[#1A1A1A]/58">
                {reflections.length} reflection
                {reflections.length === 1 ? "" : "s"} saved on this device
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1A1A1A] px-8 py-3 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
          >
            Edit on profile
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base italic text-[#1A1A1A]">
            How this works
          </h2>
          <p className="font-sans text-sm font-light leading-relaxed text-[#1A1A1A]/72">
            Whims doesn&apos;t use logins or passwords. Your name, avatar, whims,
            and reflections live in this browser only unless you clear site data
            or use another device.
          </p>
          <p className="font-sans text-sm font-light leading-relaxed text-[#1A1A1A]/72">
            To wipe everything at once, open your profile and use{" "}
            <span className="font-medium text-[#1A1A1A]/88">Delete my data</span>
            .
          </p>
        </section>
        </div>
      </main>
    </div>
  );
}
