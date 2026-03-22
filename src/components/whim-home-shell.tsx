"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

import { ActivityTicker } from "@/components/activity-ticker";
import { WhimBottomNav } from "@/components/whim-bottom-nav";
import { WhimPaperCard } from "@/components/whim-paper-card";
import { useWhim } from "@/context/WhimContext";
import { usePeopleCount } from "@/hooks/usePeopleCount";

const crossEase = [0.4, 0, 0.2, 1] as const;

export function WhimHomeShell() {
  const {
    currentWhim,
    whimState,
    profile,
    passedToday,
    joinWhim,
    passToday,
    openReflecting,
  } = useWhim();

  const peopleCount = usePeopleCount();
  const [passConfirmOpen, setPassConfirmOpen] = useState(false);

  const mode = whimState === "active" || whimState === "reflecting" ? "active" : "idle";

  const confirmPass = () => {
    setPassConfirmOpen(false);
    passToday();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden rounded-2xl bg-[#1B6B1B] text-[#1A1A1A]">
      <header className="relative z-10 flex min-h-[58vh] flex-col bg-[#ECFAFF] px-6 pb-36 pt-11">
        <div className="relative min-h-[10rem]">
          <AnimatePresence mode="sync" initial={false}>
            {mode === "idle" ? (
              <motion.div
                key="idle-copy"
                className="left-0 right-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: crossEase }}
              >
                <p className="font-serif text-lg italic leading-snug text-[#1A1A1A]">
                  Hey, {profile.name}. Let&apos;s get whimsical.
                </p>
                <h1 className="mt-2 max-w-[20ch] font-serif text-[2.25rem] font-normal leading-[1.12] tracking-tight text-[#1A1A1A] sm:text-[2.5rem]">
                  {currentWhim.text}
                </h1>
              </motion.div>
            ) : (
              <motion.div
                key="active-copy"
                className="left-0 right-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: crossEase }}
              >
                <p className="font-serif text-lg italic leading-snug text-[#1A1A1A]">
                  Whims In Progress
                </p>
                <h1 className="mt-2 font-serif text-4xl font-normal leading-[1.12] tracking-tight text-[#1A1A1A]">
                  You and{" "}
                  <span className="tabular-nums">{peopleCount}</span> others are
                  on today&apos;s whim together.
                </h1>
                <div className="mt-5">
                  <WhimPaperCard>
                    <p className="font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-[#1A1A1A] sm:text-2xl">
                      {currentWhim.text}
                    </p>
                  </WhimPaperCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LayoutGroup id="whim-ctas">
          <motion.div layout className="mt-8 flex w-full flex-col gap-2.5">
            <AnimatePresence mode="sync" initial={false}>
              {mode === "idle" ? (
                <motion.div
                  key="row-idle"
                  layout
                  className="flex w-full flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: crossEase }}
                >
                  {passedToday ? (
                    <p className="max-w-md font-serif text-base italic text-[#1A1A1A]/75">
                      You passed earlier — you can still join anytime below.
                    </p>
                  ) : null}
                  <motion.button
                    type="button"
                    layout
                    layoutId="whim-primary-cta"
                    onClick={joinWhim}
                    className="inline-flex items-center self-start rounded-full bg-[#1A1A1A] px-8 py-4 font-sans text-base font-medium text-white transition-transform enabled:active:scale-[0.98]"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    Join <span className="tabular-nums">{peopleCount}</span>{" "}
                    others →
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="row-active"
                  layout
                  className="flex w-full gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: crossEase }}
                >
                  <motion.button
                    type="button"
                    layout
                    onClick={() => setPassConfirmOpen(true)}
                    className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-full border border-[#1A1A1A] bg-transparent px-4 py-3.5 font-sans text-sm font-medium text-[#1A1A1A] transition-transform active:scale-[0.98]"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    Pass today
                    <X className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  </motion.button>
                  <motion.button
                    type="button"
                    layout
                    layoutId="whim-primary-cta"
                    onClick={openReflecting}
                    className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-3.5 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    I&apos;m done
                    <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </header>

      <div className="relative z-20 -mt-28 flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none relative z-30 mx-auto w-[min(88%,280px)] -translate-y-[42%]">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={currentWhim.illustration}
              alt=""
              fill
              className="object-contain object-bottom drop-shadow-sm"
              sizes="280px"
              priority
            />
          </div>
        </div>

        <div className="relative z-[25] -mt-4 w-full px-3 sm:-mt-5">
          <ActivityTicker className="mx-auto h-[3.5rem] max-w-none" />
        </div>

        <div className="relative -mt-[min(12vw,2.75rem)] flex min-h-0 flex-1 flex-col bg-[#1B6B1B]">
          <svg
            className="relative z-[1] -mt-px block h-[4.75rem] w-full shrink-0 overflow-visible text-[#1B6B1B]"
            viewBox="0 0 400 72"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,56 C100,4 300,4 400,56 L400,72 L0,72 Z"
            />
          </svg>

          <div className="relative z-[2] -mt-px flex min-h-[5.5rem] flex-1 flex-col justify-center px-6 pb-[max(7rem,calc(env(safe-area-inset-bottom)+6rem))] pt-5">
            <p className="text-center font-serif text-xl italic leading-snug text-white sm:text-2xl">
              Let&apos;s make a difference today.
            </p>
          </div>
        </div>
      </div>

      <WhimBottomNav active="whim" />

      <AnimatePresence>
        {passConfirmOpen ? (
          <motion.div
            key="pass-backdrop"
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pass-confirm-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setPassConfirmOpen(false)}
          >
            <motion.div
              className="w-full max-w-[min(100%,20rem)] rounded-2xl bg-[#fdfcfa] px-6 py-6 shadow-xl ring-1 ring-black/10"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p
                id="pass-confirm-title"
                className="text-center font-serif text-lg leading-snug text-[#1A1A1A]"
              >
                Are you sure you want to cancel?
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setPassConfirmOpen(false)}
                  className="w-full rounded-full border border-[#1A1A1A]/25 bg-transparent py-3.5 font-sans text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-black/[0.03]"
                >
                  No, keep going
                </button>
                <button
                  type="button"
                  onClick={confirmPass}
                  className="w-full rounded-full bg-[#1A1A1A] py-3.5 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                >
                  Yes, cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
