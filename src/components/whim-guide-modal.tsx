"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Brain, Camera, CircleHelp, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { GLASS_CIRCLE_TRIGGER_CLASS } from "@/lib/glass-circle-button";
import { cn } from "@/lib/utils";

const STEP_COUNT = 3;

const ease = [0.22, 1, 0.36, 1] as const;

/** Matches whims catalog; daily kindness vibe for step 1 */
const FLOWER_ILLUSTRATION = "/illustrations/flower.png";

/** Trigger sits in normal flow; parent should use `flex justify-end` so it lines up with header content. */
export function WhimGuideHelp() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const next = () => {
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(GLASS_CIRCLE_TRIGGER_CLASS, "shrink-0")}
        aria-label="How Whims works"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CircleHelp className="size-[1.15rem] stroke-[2.25] sm:size-5 sm:stroke-[2]" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="guide-backdrop"
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-5 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whim-guide-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          >
            <motion.div
              className="relative w-full max-w-[min(100%,24rem)] overflow-hidden rounded-[1.35rem] bg-[#fdfcfa] shadow-2xl ring-1 ring-black/10"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full text-[#1A1A1A]/55 transition-colors hover:bg-black/[0.05] hover:text-[#1A1A1A]"
                aria-label="Close"
              >
                <X className="size-5" strokeWidth={2} />
              </button>

              <div className="px-6 pb-6 pt-8 sm:px-7 sm:pb-7 sm:pt-9">
                <h2 id="whim-guide-title" className="sr-only">
                  How Whims works
                </h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    {step === 0 ? <StepOne /> : null}
                    {step === 1 ? <StepTwo /> : null}
                    {step === 2 ? <StepThree /> : null}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
                  {Array.from({ length: STEP_COUNT }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i === step
                          ? "h-2 w-6 rounded-full bg-[#1A1A1A]"
                          : "size-2 rounded-full bg-[#1A1A1A]/18"
                      }
                    />
                  ))}
                </div>

                <div className="mt-5 flex gap-2.5">
                  {step === 0 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="min-h-11 w-full rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                    >
                      Next
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={back}
                        className="min-h-11 flex-1 rounded-full border border-[#1A1A1A]/22 bg-transparent py-3 font-sans text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-black/[0.04]"
                      >
                        Back
                      </button>
                      {step < STEP_COUNT - 1 ? (
                        <button
                          type="button"
                          onClick={next}
                          className="min-h-11 flex-1 rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={close}
                          className="min-h-11 flex-1 rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                        >
                          Got it
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function StepOne() {
  return (
    <>
      <div className="mx-auto mb-5 flex h-[7.5rem] w-full max-w-[11rem] items-center justify-center overflow-hidden rounded-2xl bg-[#f3faf6] ring-1 ring-[#1A1A1A]/8">
        <div className="relative h-full w-full">
          <Image
            src={FLOWER_ILLUSTRATION}
            alt=""
            fill
            className="object-contain object-center p-2"
            sizes="176px"
          />
        </div>
      </div>
      <h3 className="text-center font-serif text-[1.35rem] font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-2xl">
        The same whim, for everyone
      </h3>
      <p className="mt-3 text-center font-sans text-[0.95rem] font-normal leading-relaxed text-black sm:text-base">
        <span className="font-semibold text-[#1A1A1A]">
          Every day, one prompt—and we all get the exact same one.
        </span>{" "}
        Not different ideas for different people; the whole community is looking
        at the same small kindness until the calendar flips, then we move on
        together. It might be for you, for someone else, or a little of both.
        Nothing dramatic—just a shared nudge that tends to feel pretty good.
      </p>
    </>
  );
}

function StepTwo() {
  return (
    <>
      <div className="mx-auto mb-5 flex h-[7.5rem] w-full max-w-[11rem] items-center justify-center rounded-2xl bg-gradient-to-b from-whim-sky to-[#e0f4e8] ring-1 ring-[#1A1A1A]/8">
        <div className="flex size-[4.5rem] items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/[0.06]">
          <Brain className="size-9 text-[#1A1A1A]" strokeWidth={1.5} aria-hidden />
        </div>
      </div>
      <h3 className="text-center font-serif text-[1.35rem] font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-2xl">
        Kind of a mood boost, honestly
      </h3>
      <p className="mt-3 text-center font-sans text-[0.95rem] font-normal leading-relaxed text-black sm:text-base">
        When you actually do the thing, even if it&apos;s small and a little
        random, your brain tends to perk up. Not magic, just the nice side effect
        of tiny wins piling up until the day feels a bit kinder.
      </p>
    </>
  );
}

function StepThree() {
  return (
    <>
      <div className="mx-auto mb-5 flex h-[7.5rem] w-full max-w-[11rem] items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-violet-100/80 via-white/50 to-amber-50/90 p-3 ring-1 ring-[#1A1A1A]/8">
        <div className="flex size-[3.25rem] items-center justify-center rounded-xl bg-white/95 shadow-sm ring-1 ring-[#1A1A1A]/10 sm:size-14">
          <BookOpen className="size-6 text-[#1A1A1A] sm:size-7" strokeWidth={1.65} aria-hidden />
        </div>
        <div className="flex size-[3.25rem] items-center justify-center rounded-xl bg-white/95 shadow-sm ring-1 ring-[#1A1A1A]/10 sm:size-14">
          <Camera className="size-6 text-[#1A1A1A] sm:size-7" strokeWidth={1.65} aria-hidden />
        </div>
      </div>
      <h3 className="text-center font-serif text-[1.35rem] font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-2xl">
        Reflect when you&apos;re done
      </h3>
      <p className="mt-3 text-center font-sans text-[0.95rem] font-normal leading-relaxed text-black sm:text-base">
        After you wrap up, open the reflection sheet and scribble how it felt.
        Toss in a photo if you want something to remember it by. It all ends up
        in Past Whims whenever you feel like scrolling back.
      </p>
    </>
  );
}
