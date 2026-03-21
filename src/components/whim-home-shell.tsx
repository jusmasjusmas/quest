"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { ActivityTicker } from "@/components/activity-ticker";
import { EmojiAvatars } from "@/components/emoji-avatars";
import { WhimBottomNav } from "@/components/whim-bottom-nav";
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

  const mode = whimState === "active" || whimState === "reflecting" ? "active" : "idle";

  return (
    <div className="flex min-h-screen flex-col overflow-hidden rounded-2xl bg-[#1B6B1B] text-[#1A1A1A]">
      <header className="relative z-10 flex min-h-[58vh] flex-col bg-[#D4E8E8] px-6 pb-36 pt-11">
        <div className="relative min-h-[11.5rem]">
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
                  Hey, {profile.name}. Lets get whimsical.
                </p>
                <h1 className="mt-5 max-w-[20ch] font-serif text-[2.25rem] font-bold leading-[1.12] tracking-tight text-[#1A1A1A] sm:text-[2.5rem]">
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
                <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.12] tracking-tight text-[#1A1A1A]">
                  You and{" "}
                  <span className="tabular-nums">{peopleCount}</span> others are
                  on today&apos;s whim together.
                </h1>
                <p className="mt-3 font-serif text-lg font-semibold leading-snug text-[#1A1A1A]/90">
                  {currentWhim.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LayoutGroup id="whim-ctas">
          <motion.div layout className="mt-8 flex w-full flex-col gap-2.5">
            <ActivityTicker />
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
                      You passed today. Tomorrow brings a new whim.
                    </p>
                  ) : null}
                  {!passedToday ? <EmojiAvatars /> : null}
                  <motion.button
                    type="button"
                    layout
                    layoutId="whim-primary-cta"
                    disabled={passedToday}
                    onClick={joinWhim}
                    className="inline-flex items-center self-start rounded-full bg-[#1A1A1A] px-8 py-4 font-sans text-base font-medium text-white transition-transform enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
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
                    onClick={passToday}
                    className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full border border-[#1A1A1A] bg-transparent px-4 py-3.5 font-sans text-sm font-medium text-[#1A1A1A] transition-transform active:scale-[0.98]"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    Pass today ×
                  </motion.button>
                  <motion.button
                    type="button"
                    layout
                    layoutId="whim-primary-cta"
                    onClick={openReflecting}
                    className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full bg-[#1A1A1A] px-4 py-3.5 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    I&apos;m done →
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

        <div className="relative -mt-[min(22vw,5.5rem)] flex flex-1 flex-col bg-[#1B6B1B]">
          <svg
            className="-mt-px block h-[4.5rem] w-full shrink-0 text-[#1B6B1B]"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,72 Q200,6 400,72 L400,120 L0,120 Z"
            />
          </svg>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
            <p className="text-center font-serif text-base italic leading-relaxed text-white">
              Let&apos;s make a difference today.
            </p>

            <div className="mt-auto pt-10">
              <WhimBottomNav active="whim" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
