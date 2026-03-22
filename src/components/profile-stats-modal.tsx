"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import type { MoodId } from "@/lib/whim-reflections";
import { moodEmoji, moodFeelingText } from "@/lib/whim-reflections";

export type ProfileStatsDetail = {
  completed: number;
  currentStreak: number;
  bestStreak: number;
  dominantMood: { mood: MoodId; count: number } | null;
  withPhoto: number;
  withNote: number;
  firstCompletionLabel: string | null;
  lastCompletionLabel: string | null;
};

type ProfileStatsModalProps = {
  open: boolean;
  onClose: () => void;
  stats: ProfileStatsDetail;
};

function StatRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-200/70 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-[#1A1A1A]">{label}</p>
        {sub ? (
          <p className="mt-0.5 font-sans text-xs leading-snug text-[#1A1A1A]/55">
            {sub}
          </p>
        ) : null}
      </div>
      <p className="shrink-0 text-right font-serif text-base font-semibold tabular-nums text-[#1A1A1A]">
        {value}
      </p>
    </div>
  );
}

export function ProfileStatsModal({
  open,
  onClose,
  stats,
}: ProfileStatsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const dom = stats.dominantMood;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="profile-stats-modal"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-stats-title"
            className="flex max-h-[min(88dvh,640px)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-[#fdfcfa] shadow-2xl ring-1 ring-black/10"
            initial={{ y: 24, opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200/80 px-5 py-4">
              <h2
                id="profile-stats-title"
                className="font-serif text-lg italic text-[#1A1A1A]"
              >
                Your stats
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A]/70 transition-colors hover:bg-black/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5 pt-1">
              {stats.completed === 0 ? (
                <p className="py-6 text-center font-serif text-base italic leading-relaxed text-[#1A1A1A]/65">
                  Complete a whim and save a reflection to see streaks, moods,
                  and more here.
                </p>
              ) : (
                <div className="pb-2">
                  <StatRow
                    label="Whims completed"
                    value={String(stats.completed)}
                  />
                  <StatRow
                    label="Current Streak"
                    value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`}
                    sub="Consecutive days with a saved reflection, counting back from today."
                  />
                  <StatRow
                    label="Best streak"
                    value={`${stats.bestStreak} day${stats.bestStreak === 1 ? "" : "s"}`}
                    sub="Longest run of back-to-back days you’ve completed."
                  />
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-200/70 py-3.5">
                    <p className="min-w-0 pt-0.5 font-sans text-sm font-medium text-[#1A1A1A]">
                      Most common feeling
                    </p>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                      <p className="font-serif text-base font-semibold tabular-nums text-[#1A1A1A]">
                        {dom != null
                          ? `${dom.count}× (${Math.round((dom.count / stats.completed) * 100)}%)`
                          : "None yet"}
                      </p>
                      {dom != null ? (
                        <div className="flex max-w-[min(72vw,16rem)] flex-row flex-wrap items-start justify-end gap-x-2 gap-y-0.5 font-sans text-xs leading-snug text-[#1A1A1A]/55 sm:max-w-[17rem]">
                          <span
                            className="shrink-0 text-[1.15rem] leading-none"
                            aria-hidden
                          >
                            {moodEmoji(dom.mood)}
                          </span>
                          <span className="text-right">
                            {moodFeelingText(dom.mood)}
                          </span>
                        </div>
                      ) : (
                        <p className="max-w-[14rem] font-sans text-xs leading-snug text-[#1A1A1A]/55">
                          No mood picked yet across reflections.
                        </p>
                      )}
                    </div>
                  </div>
                  <StatRow
                    label="Reflections with a photo"
                    value={String(stats.withPhoto)}
                  />
                  <StatRow
                    label="Reflections with a note"
                    value={String(stats.withNote)}
                  />
                  <StatRow
                    label="First completion"
                    value={stats.firstCompletionLabel ?? "Not yet"}
                  />
                  <StatRow
                    label="Latest completion"
                    value={stats.lastCompletionLabel ?? "Not yet"}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
