"use client";

import { ChevronLeft, ChevronRight, Sparkles, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

import { WhimBottomNav } from "@/components/whim-bottom-nav";
import {
  loadCustomWhims,
  loadNotificationSettings,
  saveCustomWhims,
  saveNotificationSettings,
  type ProfileNotificationSettings,
} from "@/lib/profile-settings-storage";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const [notifications, setNotifications] = useState<ProfileNotificationSettings>(
    () => ({
      dailyWhimReminder: true,
      reflectionReminder: false,
    }),
  );
  const [customLines, setCustomLines] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const addId = useId();

  useEffect(() => {
    setNotifications(loadNotificationSettings());
    setCustomLines(loadCustomWhims());
    setHydrated(true);
  }, []);

  const persistNotifications = useCallback((next: ProfileNotificationSettings) => {
    setNotifications(next);
    saveNotificationSettings(next);
  }, []);

  const addCustom = useCallback(() => {
    const t = draft.trim();
    if (!t || customLines.length >= 24) return;
    const next = [...customLines, t];
    setCustomLines(next);
    saveCustomWhims(next);
    setDraft("");
  }, [customLines, draft]);

  const removeCustom = useCallback((index: number) => {
    const next = customLines.filter((_, i) => i !== index);
    setCustomLines(next);
    saveCustomWhims(next);
  }, [customLines]);

  return (
    <div className="flex h-dvh max-h-dvh w-full min-w-0 flex-col overflow-hidden bg-whim-sky">
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] sm:pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1A1A1A] transition-colors hover:bg-black/5"
          aria-label="Back to profile"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 top-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] -translate-x-1/2 translate-y-2 font-serif text-lg italic text-[#1A1A1A] sm:top-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
          Settings
        </h1>
        <span className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <main className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] pt-2">
        <section className="space-y-3">
          <h2 className="font-serif text-base italic text-[#1A1A1A]">Account</h2>
          <Link
            href="/profile/settings/account"
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/75 px-4 py-3.5 shadow-sm ring-1 ring-black/[0.06] transition-colors hover:bg-white/90 active:scale-[0.99]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-whim-sky text-[#1A1A1A] ring-1 ring-[#1A1A1A]/10">
                <UserRound className="size-[1.05rem]" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 text-left">
                <span className="block font-sans text-sm font-medium text-[#1A1A1A]">
                  Account settings
                </span>
                <span className="mt-0.5 block font-sans text-xs font-light text-[#1A1A1A]/55">
                  Name, avatar, and how your data is stored
                </span>
              </span>
            </span>
            <ChevronRight
              className="size-5 shrink-0 text-[#1A1A1A]/35"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-serif text-base italic text-[#1A1A1A]">
            <Sparkles className="size-4 text-[#1B6B1B]" strokeWidth={2} aria-hidden />
            Notifications
          </h2>
          <p className="font-sans text-xs font-light leading-relaxed text-[#1A1A1A]/58">
            We can&apos;t push real system notifications from the browser yet, so
            these flags are here so Whims knows what you want when we add them
            (or if you install Whims as an app later).
          </p>
          <div className="space-y-2.5">
            <SettingToggle
              label="Daily Whims reminder"
              description="A gentle heads-up to peek at today’s shared whim."
              disabled={!hydrated}
              pressed={notifications.dailyWhimReminder}
              onToggle={() =>
                persistNotifications({
                  ...notifications,
                  dailyWhimReminder: !notifications.dailyWhimReminder,
                })
              }
            />
            <SettingToggle
              label="Reflection nudge"
              description="If you joined but haven’t reflected, remind me later that day."
              disabled={!hydrated}
              pressed={notifications.reflectionReminder}
              onToggle={() =>
                persistNotifications({
                  ...notifications,
                  reflectionReminder: !notifications.reflectionReminder,
                })
              }
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-base italic text-[#1A1A1A]">
            Custom whims
          </h2>
          <p className="font-sans text-xs font-light leading-relaxed text-[#1A1A1A]/58">
            Your personal prompt stash for days when you want to riff outside the
            daily catalog. We&apos;ll hook these into the flow soon; for now
            they&apos;re saved here so you don&apos;t forget them.
          </p>
          <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/[0.06]">
            <label htmlFor={addId} className="sr-only">
              Add a custom whim idea
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                id={addId}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="e.g. Send one honest compliment to someone shy"
                className="min-h-11 flex-1 rounded-xl border border-[#1A1A1A]/12 bg-white px-3.5 py-2.5 font-sans text-sm font-light text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B6B1B]/35 focus:outline-none focus:ring-2 focus:ring-[#1B6B1B]/15"
                maxLength={200}
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.trim() || customLines.length >= 24}
                className="shrink-0 rounded-xl bg-[#1A1A1A] px-4 py-2.5 font-sans text-sm font-medium text-white transition-opacity disabled:opacity-40"
              >
                Add
              </button>
            </div>
            {customLines.length > 0 ? (
              <ul className="mt-4 space-y-2 border-t border-[#1A1A1A]/08 pt-4">
                {customLines.map((line, i) => (
                  <li
                    key={`${i}-${line.slice(0, 12)}`}
                    className="flex items-start gap-2 rounded-lg bg-whim-sky/80 px-3 py-2.5 ring-1 ring-[#1A1A1A]/06"
                  >
                    <p className="min-w-0 flex-1 font-sans text-sm font-light leading-snug text-[#1A1A1A]">
                      {line}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeCustom(i)}
                      className="shrink-0 rounded-full p-1.5 text-[#1A1A1A]/45 transition-colors hover:bg-black/[0.05] hover:text-red-700"
                      aria-label="Remove this whim"
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-sans text-xs font-light italic text-[#1A1A1A]/45">
                No custom whims yet. Add one when inspiration strikes.
              </p>
            )}
            <p className="mt-3 font-sans text-[0.65rem] font-light text-[#1A1A1A]/45">
              {customLines.length}/24 saved
            </p>
          </div>
        </section>
      </main>

      <WhimBottomNav active="profile" />
    </div>
  );
}

function SettingToggle({
  label,
  description,
  pressed,
  onToggle,
  disabled,
}: {
  label: string;
  description: string;
  pressed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white/75 px-4 py-3.5 text-left shadow-sm ring-1 ring-black/[0.06] transition-opacity disabled:opacity-50"
    >
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-[#1A1A1A]">{label}</p>
        <p className="mt-0.5 font-sans text-xs font-light leading-snug text-[#1A1A1A]/55">
          {description}
        </p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
          pressed ? "bg-[#1B6B1B]" : "bg-zinc-200",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 block h-6 w-6 rounded-full bg-white shadow-md transition-transform",
            pressed ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
