"use client";

import { ChevronRight, Pencil, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProfileAvatarModal } from "@/components/profile-avatar-modal";
import {
  ProfileStatsModal,
  type ProfileStatsDetail,
} from "@/components/profile-stats-modal";
import { WhimBottomNav } from "@/components/whim-bottom-nav";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";
import { mergeWithPlaceholderReflections } from "@/lib/history-placeholders";
import {
  computeBestStreak,
  computeStreak,
  dominantMood,
  formatReflectionDateOrdinal,
  type WhimReflection,
} from "@/lib/whim-reflections";

export default function ProfilePage() {
  const {
    reflections,
    profile,
    setProfileEmoji,
    setProfileAvatarImage,
    clearAllData,
  } = useWhim();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  /** Same merge as Past Whims so profile stats match what you see in history. */
  const reflectionsMerged = useMemo(
    () => mergeWithPlaceholderReflections(reflections),
    [reflections],
  );

  const legacyMerged: WhimReflection[] = useMemo(
    () =>
      reflectionsMerged.map((r) => ({
        whimTitle: r.whimText,
        mood: r.feeling,
        note: r.note,
        photoDataUrl: r.photoUrl,
        savedAt: r.date,
        whimId: r.whimId,
      })),
    [reflectionsMerged],
  );

  const completed = reflectionsMerged.length;
  const streakForDisplay = useMemo(
    () => computeStreak(legacyMerged),
    [legacyMerged],
  );

  const statsDetail: ProfileStatsDetail = useMemo(() => {
    const sorted = [...reflectionsMerged].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const first = sorted[0]?.date;
    const last = sorted[sorted.length - 1]?.date;
    return {
      completed: reflectionsMerged.length,
      currentStreak: computeStreak(legacyMerged),
      bestStreak: computeBestStreak(legacyMerged),
      dominantMood: dominantMood(legacyMerged),
      withPhoto: reflectionsMerged.filter((r) => r.photoUrl).length,
      withNote: reflectionsMerged.filter((r) => r.note?.trim()).length,
      firstCompletionLabel: first ? formatReflectionDateOrdinal(first) : null,
      lastCompletionLabel: last ? formatReflectionDateOrdinal(last) : null,
    };
  }, [reflectionsMerged, legacyMerged]);

  const handleDeleteAll = () => {
    const ok = window.confirm(
      "Delete all whims, reflections, and profile data stored on this device? This can’t be undone.",
    );
    if (!ok) return;
    clearAllData();
  };

  const handleChooseEmoji = (emoji: string) => {
    setProfileAvatarImage(null);
    setProfileEmoji(emoji);
  };

  return (
    <div className="flex h-dvh max-h-dvh w-full min-w-0 flex-col overflow-hidden bg-whim-sky">
      <header className="flex shrink-0 items-center justify-end px-4 pb-2 pt-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] sm:pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
        <Link
          href="/profile/settings"
          className={cn(
            "z-20 flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/55 px-3 text-[#1A1A1A] shadow-sm ring-1 ring-black/[0.08] backdrop-blur-sm transition-transform hover:bg-white/70 active:scale-[0.96] sm:h-10 sm:gap-2 sm:px-3.5",
          )}
          aria-label="Settings"
        >
          <Settings
            className="size-[1.05rem] shrink-0 stroke-[2.2] sm:size-[1.15rem] sm:stroke-[2.25]"
            aria-hidden
          />
          <span className="font-sans text-xs font-medium sm:text-sm">Settings</span>
        </Link>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6">
        <div className="flex min-h-safari-scroll-slack flex-col space-y-10 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))]">
        <section className="text-center">
          <h1 className="font-serif text-4xl italic leading-tight text-[#1A1A1A]">
            Hey, {profile.name}.
          </h1>
          <div className="relative mx-auto mt-5 inline-block">
            <div
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white text-5xl shadow-md ring-2 ring-[#1A1A1A]/18"
              aria-hidden
            >
              {profile.avatarImageUrl ? (
                <Image
                  src={profile.avatarImageUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span>{profile.emoji}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-whim-sky bg-[#1A1A1A] text-white shadow-md transition-transform active:scale-95"
              aria-label="Edit profile picture"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </section>

        <ProfileAvatarModal
          open={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          currentEmoji={profile.emoji}
          currentImageUrl={profile.avatarImageUrl}
          onChooseEmoji={handleChooseEmoji}
          onChooseImage={setProfileAvatarImage}
        />

        <section>
          <button
            type="button"
            onClick={() => setStatsModalOpen(true)}
            className="group w-full rounded-2xl text-left transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B6B1B]/40 active:scale-[0.99]"
          >
            <div className="overflow-hidden rounded-2xl bg-white/60 shadow-sm ring-1 ring-black/5 transition-colors group-hover:bg-white/85 group-active:bg-white/90">
              <div className="grid grid-cols-2 gap-4 px-4 pb-5 pt-6">
                <div className="text-center">
                  <p className="font-serif text-3xl font-bold tabular-nums text-[#1A1A1A]">
                    {completed}
                  </p>
                  <p className="mt-2 font-sans text-[0.65rem] font-medium leading-tight tracking-wide text-black">
                    Whims
                    <br />
                    Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-serif text-3xl font-bold tabular-nums text-[#1A1A1A]">
                    {streakForDisplay}
                  </p>
                  <p className="mt-2 font-sans text-[0.65rem] font-medium leading-tight tracking-wide text-black">
                    Current
                    <br />
                    Streak
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 border-t border-[#1A1A1A]/10 bg-white/35 px-3 py-2.5 transition-colors group-hover:bg-white/55 sm:gap-1.5 sm:py-3">
                <span className="font-sans text-[0.8rem] font-medium leading-none tracking-tight text-[#1A1A1A]/88 sm:text-[0.875rem]">
                  See More Stats
                </span>
                <ChevronRight
                  className="size-[1rem] shrink-0 text-[#1A1A1A]/70 sm:size-[1.05rem]"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </div>
          </button>
        </section>

        <ProfileStatsModal
          open={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
          stats={statsDetail}
        />

        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_28px_rgba(0,0,0,0.06)] ring-1 ring-[#1A1A1A]/10">
          <div className="border-b border-[#1A1A1A]/10 px-6 py-5">
            <h2 className="font-serif text-2xl italic leading-tight text-[#1A1A1A]">
              About Whims
            </h2>
          </div>
          <div className="space-y-4 px-6 py-6">
            <p className="font-sans text-[1.05rem] font-normal leading-relaxed tracking-[-0.02em] text-[#1A1A1A]/90">
              Whims is built on a simple idea: the best thing for your head and
              heart is often something small, for you or someone else. No
              leaderboards, no selling your data. Just one shared whim a day and
              a moment to reflect when you&apos;re done.
            </p>
            <p className="border-l-2 border-[#1B6B1B]/35 pl-4 font-sans text-[1.05rem] font-normal leading-relaxed tracking-[-0.02em] text-[#1A1A1A]/90">
              We believe tiny, kind actions add up. Whims is here to make them
              easy to notice and easy to remember.
            </p>
          </div>
        </section>

        <section className="space-y-4 pb-2">
          <h2 className="font-serif text-lg italic text-[#1A1A1A]">
            Your Data
          </h2>
          <ul className="space-y-3 font-sans text-sm leading-relaxed text-[#1A1A1A]/85">
            <li>
              <span className="font-medium text-[#1A1A1A]">We store:</span>{" "}
              which whims you completed and how they made you feel.
            </li>
            <li>
              <span className="font-medium text-[#1A1A1A]">
                We don&apos;t store:
              </span>{" "}
              your identity, your location, your contacts, or anything else.
            </li>
            <li>You can delete everything anytime.</li>
          </ul>
          <button
            type="button"
            onClick={handleDeleteAll}
            className="mt-2 w-full rounded-full border-2 border-red-600/70 bg-transparent px-6 py-3.5 font-sans text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Delete My Data
          </button>
        </section>
        </div>
      </main>

      <WhimBottomNav active="profile" />
    </div>
  );
}
