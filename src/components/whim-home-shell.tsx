"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useState } from "react";

import {
  WhimBottomNav,
  whimHomeShellPaddingBottomClass,
} from "@/components/whim-bottom-nav";
import { WhimGuideHelp } from "@/components/whim-guide-modal";
import { WhimPaperCard } from "@/components/whim-paper-card";
import { useWhim } from "@/context/WhimContext";
import { usePeopleCount } from "@/hooks/usePeopleCount";
import { cn } from "@/lib/utils";

const crossEase = [0.4, 0, 0.2, 1] as const;
/** Soft ease-in-out for staged home entrance */
const enterEase = [0.22, 1, 0.36, 1] as const;

const HOME_ENTRANCE_KEY = "quest-home-entrance-v4";

/** Italic line under the main headline (join / active / done); larger than body, smaller than h1. */
const HOME_HEADLINE_SUBTEXT =
  "font-serif text-lg italic leading-snug sm:text-xl";

function TodayCalendarChip() {
  const [parts, setParts] = useState<{
    weekday: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    const d = new Date();
    setParts({
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }, []);

  return (
    <div
      className="flex min-w-0 shrink-0 flex-col items-end justify-center gap-0.5 font-sans leading-none text-right text-[#1A1A1A]"
      aria-label={
        parts
          ? `Today is ${parts.weekday}, ${parts.date}`
          : "Today’s date"
      }
    >
      {parts ? (
        <>
          <span className="text-[0.5625rem] font-light uppercase tracking-[0.08em] text-[#1A1A1A]/68 sm:text-[0.625rem]">
            {parts.weekday}
          </span>
          <span className="text-[0.8125rem] font-light tabular-nums tracking-tight sm:text-[0.9375rem]">
            {parts.date}
          </span>
        </>
      ) : (
        <>
          <span className="min-h-[0.5625rem] w-8 animate-pulse text-[0.5625rem] font-light uppercase tracking-[0.08em] text-[#1A1A1A]/25 sm:min-h-[0.625rem] sm:w-9 sm:text-[0.625rem]">
            ···
          </span>
          <span className="min-h-[0.8125rem] w-10 animate-pulse text-[0.8125rem] font-light tabular-nums text-[#1A1A1A]/25 sm:min-h-[0.9375rem] sm:w-11 sm:text-[0.9375rem]">
            ···
          </span>
        </>
      )}
    </div>
  );
}

function useHomeEntrance() {
  const reduceMotionPref = useReducedMotion();
  const reduceMotion = reduceMotionPref ?? false;
  const [phase, setPhase] = useState<"play" | "done">("play");

  useLayoutEffect(() => {
    if (reduceMotion) {
      setPhase("done");
      return;
    }
    try {
      if (sessionStorage.getItem(HOME_ENTRANCE_KEY) === "1") {
        setPhase("done");
      }
    } catch {
      /* private mode */
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (phase !== "play" || reduceMotion) return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(HOME_ENTRANCE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 4200);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  const instant = phase === "done" || reduceMotion;

  const t = (delay: number, duration: number) =>
    instant
      ? { delay: 0, duration: reduceMotion ? 0.01 : 0.28, ease: enterEase }
      : { delay, duration, ease: enterEase };

  /** Top to bottom: header icon, greeting, whim block, CTAs, hill, illustration, tag line. */
  return {
    instant,
    t,
    icons: t(0, 0.5),
    hey: t(0.06, 0.55),
    whim: t(0.2, 0.7),
    cta: t(0.88, 0.62),
    hill: t(1.08, 0.86),
    illus: t(1.34, 0.8),
    tag: t(1.58, 0.68),
  };
}

/** Hill center & radii — iPhone 393×852 frame ellipse. */
const HILL_CX = 196.5;
const HILL_CY = 828;
const HILL_RX = 414.5;
const HILL_RY = 226;

/** Horizontal radius — wider than half the viewBox; SVG uses overflow-visible so the arc reads fuller on device. */
const HILL_RX_FIT = 220;
const HILL_X_SCALE = HILL_RX_FIT / HILL_RX;

function hillSpaceX(localX: number) {
  return HILL_CX + (localX - HILL_CX) * HILL_X_SCALE;
}

const hillWaveTransition = {
  duration: 11.2,
  repeat: Infinity,
  ease: "easeInOut" as const,
  times: [0, 0.28, 0.52, 0.75, 1],
};

function HillFlower({
  x,
  y,
  scale = 1,
  opacity = 0.2,
  rotation = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
}) {
  const angles = [0, 72, 144, 216, 288];
  return (
    <g
      transform={`translate(${x},${y}) rotate(${rotation}) scale(${scale})`}
      opacity={opacity}
    >
      {angles.map((deg) => (
        <ellipse
          key={deg}
          cx={0}
          cy={-5.4}
          rx={2.35}
          ry={5.4}
          fill="rgba(255, 252, 245, 0.72)"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx={0} cy={0} r={2.35} fill="rgba(255, 255, 255, 0.38)" />
    </g>
  );
}

/** iPhone 393×852 frame: ellipse 829×452 with top-left (-218, 602) → center (196.5, 828), radii (414.5, 226). */
function HomeHillEllipse({
  intro,
  instant,
}: {
  intro: { delay: number; duration: number; ease: readonly [number, number, number, number] };
  instant: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const waveOn = !reduceMotion;
  const rid = useId().replace(/:/g, "");
  const clipId = `whim-hill-clip-${rid}`;
  const grainId = `whim-hill-grain-${rid}`;

  return (
    <motion.svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible -translate-y-[min(13dvh,112px)] sm:-translate-y-[min(14dvh,124px)]"
      viewBox="0 0 393 852"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      initial={instant ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={intro}
      style={{ transformOrigin: "50% 96%" }}
    >
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={HILL_CX} cy={HILL_CY} rx={HILL_RX_FIT} ry={HILL_RY} />
        </clipPath>
        <pattern
          id={grainId}
          width={9}
          height={9}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={1.8} cy={2.2} r={0.42} fill="#fff" opacity={0.038} />
          <circle cx={6.2} cy={5.8} r={0.38} fill="#062108" opacity={0.024} />
          <circle cx={4.5} cy={1.4} r={0.28} fill="#fff" opacity={0.03} />
          <circle cx={2.8} cy={6.9} r={0.32} fill="#fff" opacity={0.028} />
        </pattern>
      </defs>

      <g transform={`translate(${HILL_CX},${HILL_CY})`}>
        <motion.g
          animate={
            waveOn
              ? {
                  rotate: [0, 0.32, 0, -0.24, 0],
                  y: [0, -2.1, 0, 1.4, 0],
                }
              : { rotate: 0, y: 0 }
          }
          transition={hillWaveTransition}
          style={{ transformOrigin: "0px 0px" }}
        >
          <g transform={`translate(${-HILL_CX},${-HILL_CY})`}>
            <ellipse
              cx={HILL_CX}
              cy={HILL_CY}
              rx={HILL_RX_FIT}
              ry={HILL_RY}
              fill="#1B6B1B"
            />
            <g clipPath={`url(#${clipId})`}>
              <rect
                x={-240}
                y={508}
                width={900}
                height={400}
                fill={`url(#${grainId})`}
                opacity={0.26}
              />
              <ellipse
                cx={HILL_CX - 120 * HILL_X_SCALE}
                cy={HILL_CY - 118}
                rx={140 * HILL_X_SCALE}
                ry={48}
                fill="rgba(255, 255, 255, 0.032)"
              />
              <ellipse
                cx={HILL_CX + 160 * HILL_X_SCALE}
                cy={HILL_CY - 78}
                rx={110 * HILL_X_SCALE}
                ry={38}
                fill="rgba(255, 255, 255, 0.028)"
              />
              <ellipse
                cx={HILL_CX + 40 * HILL_X_SCALE}
                cy={HILL_CY - 132}
                rx={95 * HILL_X_SCALE}
                ry={32}
                fill="rgba(0, 0, 0, 0.034)"
              />
            </g>
            <ellipse
              cx={HILL_CX}
              cy={HILL_CY}
              rx={HILL_RX_FIT}
              ry={HILL_RY}
              fill="none"
              stroke="#1A1A1A"
              strokeWidth={3}
              vectorEffect="nonScalingStroke"
            />

            <g opacity={0.9}>
              <HillFlower
                x={hillSpaceX(88)}
                y={718}
                scale={0.72}
                opacity={0.18}
                rotation={-8}
              />
              <HillFlower
                x={hillSpaceX(168)}
                y={688}
                scale={0.95}
                opacity={0.2}
                rotation={14}
              />
              <HillFlower
                x={hillSpaceX(268)}
                y={732}
                scale={0.78}
                opacity={0.16}
                rotation={-18}
              />
              <HillFlower
                x={hillSpaceX(318)}
                y={778}
                scale={0.55}
                opacity={0.14}
                rotation={22}
              />
              <HillFlower
                x={hillSpaceX(132)}
                y={758}
                scale={0.62}
                opacity={0.15}
                rotation={-4}
              />
            </g>

            <g opacity={0.22} fill="rgba(255, 252, 245, 0.9)">
              <ellipse
                cx={hillSpaceX(52)}
                cy={752}
                rx={5.5 * HILL_X_SCALE}
                ry={3.2}
                transform={`rotate(-32 ${hillSpaceX(52)} 752)`}
              />
              <ellipse
                cx={hillSpaceX(228)}
                cy={702}
                rx={6 * HILL_X_SCALE}
                ry={3.4}
                transform={`rotate(18 ${hillSpaceX(228)} 702)`}
              />
              <ellipse
                cx={hillSpaceX(340)}
                cy={718}
                rx={4.8 * HILL_X_SCALE}
                ry={2.8}
                transform={`rotate(48 ${hillSpaceX(340)} 718)`}
              />
            </g>
            <circle cx={196} cy={722} r={3.2} fill="rgba(255, 255, 255, 0.12)" />
            <circle cx={hillSpaceX(250)} cy={748} r={2.4} fill="rgba(255, 255, 255, 0.1)" />
            <circle cx={hillSpaceX(118)} cy={738} r={2.1} fill="rgba(255, 255, 255, 0.09)" />
          </g>
        </motion.g>
      </g>
    </motion.svg>
  );
}

const ENCOURAGEMENT_LINES = [
  "Nice work today!",
  "You showed up.",
  "Small wins count.",
  "That mattered.",
  "Proud of you.",
  "Keep that energy.",
];

function FloatingEncouragementBubbles({ visible }: { visible: boolean }) {
  const reduceMotionPref = useReducedMotion();
  const reduceMotion = reduceMotionPref ?? false;
  if (!visible) return null;

  const lanes = ["42%", "50%", "58%", "66%", "46%", "62%"] as const;

  if (reduceMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-x-0 top-[38%] bottom-[28%] z-[4] flex flex-col items-center justify-center gap-2 px-8 opacity-[0.38]"
        aria-hidden
      >
        {ENCOURAGEMENT_LINES.slice(0, 4).map((text) => (
          <div
            key={text}
            className="max-w-[min(100%,18rem)] rounded-full bg-white/88 px-4 py-2 text-center font-sans text-xs font-medium text-[#1A1A1A]/85 shadow-md ring-1 ring-black/[0.08]"
          >
            {text}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[36%] bottom-[22%] z-[4] overflow-hidden"
      aria-hidden
    >
      {ENCOURAGEMENT_LINES.map((text, i) => (
        <motion.div
          key={`${text}-${i}`}
          className="absolute whitespace-nowrap rounded-full bg-white/90 px-3.5 py-1.5 font-sans text-[0.7rem] font-medium text-[#1A1A1A]/88 shadow-md ring-1 ring-black/[0.08] sm:px-4 sm:py-2 sm:text-xs"
          style={{ top: lanes[i % lanes.length] }}
          initial={{ x: "105vw" }}
          animate={{ x: "-130vw" }}
          transition={{
            duration: 19 + i * 2.4,
            repeat: Infinity,
            ease: "linear",
            delay: i * 3.1,
          }}
        >
          {text}
        </motion.div>
      ))}
    </div>
  );
}

export function WhimHomeShell() {
  const {
    currentWhim,
    whimState,
    profile,
    passedToday,
    joinWhim,
    passToday,
    openReflecting,
    reflectedToday,
  } = useWhim();

  const peopleCount = usePeopleCount();
  const [passConfirmOpen, setPassConfirmOpen] = useState(false);

  const inWhimFlow =
    whimState === "joined" ||
    whimState === "active" ||
    whimState === "reflecting";
  const copyMode = inWhimFlow
    ? "active"
    : reflectedToday
      ? "doneToday"
      : "join";

  const entrance = useHomeEntrance();
  const reduceMotion = useReducedMotion() ?? false;
  const [illusFloating, setIllusFloating] = useState(
    () => entrance.instant || reduceMotion,
  );

  useEffect(() => {
    if (entrance.instant || reduceMotion) setIllusFloating(true);
  }, [entrance.instant, reduceMotion]);

  const fadeUp = (instant: boolean) =>
    instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 };

  const confirmPass = () => {
    setPassConfirmOpen(false);
    passToday();
  };

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-visible overflow-y-hidden bg-whim-sky text-[#1A1A1A]">
      <HomeHillEllipse intro={entrance.hill} instant={entrance.instant} />
      <div className="relative z-[1] flex w-full flex-1 flex-col overflow-x-visible">
        <div
          className={cn("flex min-w-0 flex-col", whimHomeShellPaddingBottomClass)}
        >
          <FloatingEncouragementBubbles visible={copyMode === "doneToday"} />

      <header className="relative z-10 shrink-0 bg-transparent px-6 pb-6 pt-[max(1.125rem,calc(env(safe-area-inset-top)+0.65rem))] sm:px-7 sm:pb-7 sm:pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.85rem))]">
        <div className="mb-3 flex w-full items-center justify-between gap-3 sm:mb-4">
          <AnimatePresence mode="sync">
            <motion.p
              key={copyMode}
              className="min-w-0 flex-1 font-serif text-[1.2rem] italic leading-snug text-[#1A1A1A] sm:text-[1.35rem]"
              initial={
                copyMode === "active"
                  ? { opacity: 0, y: 8 }
                  : fadeUp(entrance.instant)
              }
              animate={{ opacity: 1, y: 0 }}
              transition={
                copyMode === "active"
                  ? { duration: 0.45, ease: crossEase }
                  : entrance.hey
              }
            >
              Hey, {profile.name}.
            </motion.p>
          </AnimatePresence>
          <motion.div
            key={copyMode}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-end sm:min-h-10 sm:min-w-10"
            initial={
              reduceMotion
                ? { opacity: 1, y: 0, visibility: "visible" as const }
                : copyMode === "active"
                  ? { opacity: 0, y: 8, visibility: "hidden" as const }
                  : {
                      ...fadeUp(entrance.instant),
                      ...(!entrance.instant
                        ? { visibility: "hidden" as const }
                        : {}),
                    }
            }
            animate={{
              opacity: 1,
              y: 0,
              visibility: "visible",
            }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : copyMode === "active"
                  ? { duration: 0.42, delay: 0.14, ease: crossEase }
                  : entrance.icons
            }
          >
            <WhimGuideHelp />
          </motion.div>
        </div>
        <div className="relative flex w-full flex-col">
          {/* initial must stay default (true): initial={false} skips nested motion initial/animate on first mount */}
          <AnimatePresence mode="sync">
            {copyMode === "join" ? (
              <motion.div
                key="join-copy"
                className="left-0 right-0 top-0"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: crossEase }}
              >
                <motion.div
                  className="mt-2 sm:mt-3"
                  initial={fadeUp(entrance.instant)}
                  animate={{ opacity: 1, y: 0 }}
                  transition={entrance.whim}
                >
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <h1 className="max-w-[18ch] min-w-0 font-serif text-[2.25rem] font-bold leading-[1.1] tracking-tight text-[#1A1A1A] sm:max-w-[22ch] sm:text-[2.5rem]">
                      Today&apos;s whim
                    </h1>
                    <TodayCalendarChip />
                  </div>
                  <div className="mt-6">
                    <WhimPaperCard
                      innerClassName="rounded-t-[1.35rem] px-6 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6"
                    >
                      <p className="font-serif text-[1.5rem] font-normal leading-snug tracking-tight text-[#1A1A1A] sm:text-[1.7rem]">
                        {currentWhim.text}
                      </p>
                    </WhimPaperCard>
                  </div>
                </motion.div>
              </motion.div>
            ) : copyMode === "active" ? (
              <motion.div
                key="active-copy"
                className="left-0 right-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: crossEase }}
              >
                <div className="mt-2 min-w-0 sm:mt-3">
                  <h1 className="min-w-0 font-serif text-[2.25rem] font-bold leading-[1.1] tracking-tight text-[#1A1A1A] sm:text-[2.5rem]">
                    You and{" "}
                    <span className="tabular-nums">{peopleCount}</span> others
                    are on today&apos;s whim together.
                  </h1>
                </div>
                <p
                  className={cn(
                    HOME_HEADLINE_SUBTEXT,
                    "mt-2 max-w-[30ch] text-[#1A1A1A]/72",
                  )}
                >
                  Reflect when you&apos;re done.
                </p>
                <div className="mt-6">
                  <WhimPaperCard>
                    <p className="font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-[#1A1A1A] sm:text-2xl">
                      {currentWhim.text}
                    </p>
                  </WhimPaperCard>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done-copy"
                className="left-0 right-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: crossEase }}
              >
                <motion.div
                  className="mt-2 sm:mt-3"
                  initial={fadeUp(entrance.instant)}
                  animate={{ opacity: 1, y: 0 }}
                  transition={entrance.whim}
                >
                  <h1 className="max-w-[20ch] min-w-0 font-serif text-[2.25rem] font-bold leading-[1.1] tracking-tight text-[#1A1A1A] sm:max-w-[24ch] sm:text-[2.5rem]">
                    Great job today
                  </h1>
                  <p
                    className={cn(
                      HOME_HEADLINE_SUBTEXT,
                      "mt-2 max-w-[30ch] text-[#1A1A1A]/72",
                    )}
                  >
                    Today&apos;s whim is in the books.
                  </p>
                  <div className="mt-6">
                    <WhimPaperCard
                      innerClassName="rounded-t-[1.35rem] px-6 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6"
                    >
                      <p className="font-serif text-[1.5rem] font-normal leading-snug tracking-tight text-[#1A1A1A]/55 line-through decoration-[#1A1A1A]/40 decoration-2 sm:text-[1.7rem]">
                        {currentWhim.text}
                      </p>
                    </WhimPaperCard>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        <LayoutGroup id="whim-ctas">
          <motion.div
            layout
            className={
              copyMode === "join"
                ? "mt-3 flex w-full flex-col items-stretch gap-2.5"
                : "mt-4 flex w-full flex-col items-stretch gap-2.5 sm:mt-5"
            }
          >
            <AnimatePresence mode="sync">
              {copyMode === "join" ? (
                <motion.div
                  key="row-join"
                  layout
                  className="flex w-full flex-col items-start gap-4"
                  initial={fadeUp(entrance.instant)}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={entrance.cta}
                >
                  {passedToday ? (
                    <p
                      className={cn(
                        HOME_HEADLINE_SUBTEXT,
                        "max-w-md text-[#1A1A1A]/75",
                      )}
                    >
                      You passed earlier, but you can still join anytime below.
                    </p>
                  ) : null}
                  <motion.button
                    type="button"
                    layout
                    layoutId="whim-primary-cta"
                    onClick={joinWhim}
                    className="inline-flex items-center justify-center self-start rounded-full bg-[#1A1A1A] px-10 py-[1.125rem] font-sans text-lg font-medium text-white transition-transform enabled:active:scale-[0.98] sm:px-11 sm:py-5 sm:text-xl"
                    transition={{
                      layout: { duration: 0.45, ease: crossEase },
                    }}
                  >
                    <span className="inline-flex flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:gap-x-4">
                      <span>Join</span>
                      <span className="tabular-nums">{peopleCount}</span>
                      <span className="inline-flex items-center gap-2 sm:gap-2.5">
                        <span>others</span>
                        <ArrowRight
                          className="size-5 shrink-0 sm:size-[1.35rem]"
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      </span>
                    </span>
                  </motion.button>
                </motion.div>
              ) : copyMode === "active" ? (
                <motion.div
                  key="row-active"
                  layout
                  className="flex w-full gap-3"
                  initial={
                    entrance.instant ? { opacity: 0, y: 10 } : fadeUp(entrance.instant)
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={
                    entrance.instant
                      ? { duration: 0.42, delay: 0.55, ease: crossEase }
                      : entrance.cta
                  }
                >
                  <motion.button
                    type="button"
                    layout
                    onClick={() => setPassConfirmOpen(true)}
                    className="inline-flex min-h-[3.25rem] min-w-0 shrink-0 basis-[38%] items-center justify-center gap-2 rounded-full border border-[#1A1A1A] bg-transparent px-3 py-3.5 font-sans text-sm font-medium text-[#1A1A1A] transition-transform active:scale-[0.98] sm:basis-[36%]"
                    transition={{
                      layout: {
                        duration: 0.5,
                        delay: 0.55,
                        ease: crossEase,
                      },
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
                    className="inline-flex min-h-[3.25rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-3.5 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
                    transition={{
                      layout: {
                        duration: 0.5,
                        delay: 0.55,
                        ease: crossEase,
                      },
                    }}
                  >
                    Reflect
                    <BookOpen className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="row-done"
                  layout
                  className="flex w-full flex-col items-start gap-3"
                  initial={
                    entrance.instant ? { opacity: 0, y: 10 } : fadeUp(entrance.instant)
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={
                    entrance.instant
                      ? { duration: 0.4, delay: 0.55, ease: crossEase }
                      : entrance.cta
                  }
                >
                  <motion.div
                    layout
                    layoutId="whim-primary-cta"
                    transition={{
                      layout: {
                        duration: 0.5,
                        delay: 0.55,
                        ease: crossEase,
                      },
                    }}
                  >
                    <Link
                      href="/history"
                      className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3.5 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98] sm:px-10 sm:text-base"
                    >
                      View today&apos;s reflection
                      <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        </div>
      </header>

      <div className="relative z-[2] flex min-h-0 min-w-0 flex-1 flex-col items-stretch justify-end overflow-visible px-1 pb-1 pt-4 sm:px-2 sm:pb-2 sm:pt-6">
        <motion.div
          className="pointer-events-none relative z-[2] mx-auto w-full max-w-[min(100vw-0.5rem,19.5rem)] shrink-0 translate-y-1 sm:max-w-[min(100vw-1rem,21.5rem)] sm:translate-y-1.5"
          initial={
            entrance.instant
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={entrance.illus}
          onAnimationComplete={() => {
            if (!reduceMotion) setIllusFloating(true);
          }}
        >
          <motion.div
            className="relative mx-auto h-[min(23dvh,186px)] w-full min-h-[min(14dvh,104px)] overflow-visible sm:h-[min(25dvh,204px)] sm:min-h-[min(15dvh,116px)]"
            animate={
              illusFloating && !reduceMotion
                ? {
                    y: [0, -3.5, -0.8, -5.5, 0],
                    rotate: [0, 0.35, 0, -0.25, 0],
                  }
                : { y: 0, rotate: 0 }
            }
            transition={
              illusFloating && !reduceMotion
                ? {
                    y: {
                      duration: 3.65,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1],
                      times: [0, 0.22, 0.48, 0.78, 1],
                    },
                    rotate: {
                      duration: 3.65,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1],
                      times: [0, 0.22, 0.48, 0.78, 1],
                    },
                  }
                : { duration: 0 }
            }
          >
            <Image
              src={currentWhim.illustration}
              alt=""
              fill
              className="object-contain object-bottom drop-shadow-md"
              sizes="(max-width: 640px) 56vw, 14rem"
              priority
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        className="pointer-events-none relative z-[5] mt-1 shrink-0 px-6 text-center font-serif text-xl font-normal leading-snug text-white sm:mt-2 sm:px-8 sm:text-2xl"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
        initial={fadeUp(entrance.instant)}
        animate={{ opacity: 1, y: 0 }}
        transition={entrance.tag}
      >
        {copyMode === "doneToday"
          ? "See you tomorrow for a new whim."
          : "Let's make a difference today."}
      </motion.p>

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
