"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { WhimBottomNav } from "@/components/whim-bottom-nav";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";
import {
  favoriteMoodEmoji,
  getRippleReach,
  type WhimReflection,
} from "@/lib/whim-reflections";

const AVATAR_OPTIONS = ["😊", "🌸", "🦋", "✨", "🌿", "🐚", "🦊", "☀️"];

export default function ProfilePage() {
  const { reflections, profile, setProfileEmoji, clearAllData } = useWhim();
  const [aboutOpen, setAboutOpen] = useState(false);

  const legacyForFavorite = useMemo((): WhimReflection[] => {
    return reflections.map((r) => ({
      whimTitle: r.whimText,
      mood: r.feeling,
      note: r.note,
      photoDataUrl: r.photoUrl,
      savedAt: r.date,
    }));
  }, [reflections]);

  const favorite = useMemo(
    () => favoriteMoodEmoji(legacyForFavorite),
    [legacyForFavorite],
  );

  const completed = reflections.length;
  const streak = profile.streak;
  const rippleReach = getRippleReach();

  const handleDeleteAll = () => {
    const ok = window.confirm(
      "Delete all whims, reflections, and profile data stored on this device? This can’t be undone.",
    );
    if (!ok) return;
    clearAllData();
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col overflow-hidden rounded-2xl bg-[#ECFAFF]">
      <header className="flex shrink-0 items-center px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1A1A1A] transition-colors hover:bg-black/5"
          aria-label="Back to home"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
      </header>

      <main className="min-h-0 flex-1 space-y-10 overflow-y-auto px-6 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))]">
        <section className="text-center">
          <h1 className="font-serif text-4xl italic leading-tight text-[#1A1A1A]">
            Hey, {profile.name}.
          </h1>
          <p className="mt-2 font-sans text-sm text-[#1A1A1A]/55">
            Tap your avatar to pick a mood
          </p>
          <button
            type="button"
            className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-md ring-2 ring-white ring-offset-2 ring-offset-[#ECFAFF] transition-transform active:scale-95"
            aria-label="Choose avatar emoji"
            onClick={() => {
              const i = AVATAR_OPTIONS.indexOf(profile.emoji);
              const next = AVATAR_OPTIONS[(i + 1) % AVATAR_OPTIONS.length];
              setProfileEmoji(next);
            }}
          >
            <span aria-hidden>{profile.emoji}</span>
          </button>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {AVATAR_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setProfileEmoji(e)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-xl transition-transform",
                  e === profile.emoji
                    ? "bg-white shadow-md ring-2 ring-[#1B6B1B] ring-offset-2 ring-offset-[#ECFAFF]"
                    : "bg-white/80 hover:bg-white",
                )}
                aria-label={`Use ${e} avatar`}
                aria-pressed={e === profile.emoji}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/60 px-3 py-6 shadow-sm ring-1 ring-black/5">
            <div className="text-center">
              <p className="font-serif text-3xl font-bold tabular-nums text-[#1A1A1A]">
                {completed}
              </p>
              <p className="mt-2 font-sans text-[0.65rem] font-medium uppercase tracking-wide text-[#1A1A1A]/55">
                Whims
                <br />
                completed
              </p>
            </div>
            <div className="border-x border-[#1A1A1A]/10 text-center">
              <p className="font-serif text-3xl font-bold tabular-nums text-[#1A1A1A]">
                {streak}
              </p>
              <p className="mt-2 font-sans text-[0.65rem] font-medium uppercase tracking-wide text-[#1A1A1A]/55">
                Current streak
                <br />
                <span className="normal-case">days</span>
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl font-bold leading-none text-[#1A1A1A]">
                {favorite}
              </p>
              <p className="mt-2 font-sans text-[0.65rem] font-medium uppercase tracking-wide text-[#1A1A1A]/55">
                Favorite
                <br />
                feeling
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#1B6B1B] px-5 py-8 text-white shadow-md">
          <RippleGraphic className="mx-auto mb-6 text-white/25" />
          <p className="text-center font-serif text-xl font-bold leading-snug">
            Your whims have rippled to{" "}
            <span className="whitespace-nowrap">{rippleReach} people</span>
          </p>
          <p className="mx-auto mt-4 max-w-[28ch] text-center font-serif text-sm italic leading-relaxed text-white/85">
            Every time you complete a whim, you inspire others to start theirs.
          </p>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setAboutOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/70 px-5 py-4 text-left shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white"
            aria-expanded={aboutOpen}
          >
            <span className="font-serif text-lg italic text-[#1A1A1A]">
              About Whim
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-[#1A1A1A]/60 transition-transform",
                aboutOpen && "rotate-180",
              )}
            />
          </button>
          {aboutOpen ? (
            <div className="mt-3 rounded-2xl border border-[#1A1A1A]/10 bg-white/50 px-5 py-4">
              <p className="font-sans text-[0.95rem] leading-relaxed text-[#1A1A1A]/90">
                Whim is built on a simple idea: the best thing for your mental
                health is often doing something small — for yourself or someone
                else. No tracking, no scores, no data we can sell. Just one whim
                a day.
              </p>
            </div>
          ) : null}
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
      </main>

      <WhimBottomNav active="profile" />
    </div>
  );
}

function RippleGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-28 w-28", className)}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="8" fill="currentColor" className="text-white/90" />
      <circle
        cx="60"
        cy="60"
        r="28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity={0.5}
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity={0.35}
      />
      <circle
        cx="60"
        cy="60"
        r="58"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity={0.2}
      />
    </svg>
  );
}
