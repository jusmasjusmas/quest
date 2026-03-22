"use client";

import { CalendarDays, ChevronLeft, ChevronRight, GalleryHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";

import { WhimBottomNav } from "@/components/whim-bottom-nav";
import { WhimPaperCard } from "@/components/whim-paper-card";
import { getWhimForDate } from "@/data/whims";
import { cn } from "@/lib/utils";
import { useWhim } from "@/context/WhimContext";
import { mergeWithPlaceholderReflections } from "@/lib/history-placeholders";
import {
  formatReflectionDateOrdinal,
  formatReflectionWeekday,
  moodEmoji,
  moodFeelingText,
  reflectionDateKey,
  type WhimReflection,
} from "@/lib/whim-reflections";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type ViewMode = "carousel" | "calendar";

function HistoryPageFallback() {
  return (
    <div className="flex h-dvh max-h-dvh w-full min-w-0 flex-col items-center justify-center bg-whim-sky">
      <p className="font-serif text-lg italic text-[#1A1A1A]/45">
        Loading…
      </p>
    </div>
  );
}

function HistoryPageContent() {
  const { reflections: rawReflections } = useWhim();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusFromSave = searchParams.get("focus");
  const focusHandledRef = useRef<string | null>(null);

  const reflections = useMemo(() => {
    const merged = mergeWithPlaceholderReflections(rawReflections);
    const list: WhimReflection[] = merged.map((r) => ({
      whimTitle: r.whimText,
      mood: r.feeling,
      note: r.note,
      photoDataUrl: r.photoUrl,
      sketchDataUrl: r.sketchUrl ?? null,
      savedAt: r.date,
      whimId: r.whimId,
    }));
    return list.sort(
      (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
    );
  }, [rawReflections]);

  const [view, setView] = useState<ViewMode>("carousel");
  const [activeIndex, setActiveIndex] = useState(0);
  const seededNewest = useRef(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  useLayoutEffect(() => {
    const n = reflections.length;
    if (n === 0) return;
    if (!seededNewest.current) {
      seededNewest.current = true;
      setActiveIndex(n - 1);
      return;
    }
    setActiveIndex((i) => clamp(i, 0, n - 1));
  }, [reflections.length]);

  const active = reflections[activeIndex] ?? null;

  const reflectionsByDay = useMemo(() => {
    const map = new Map<string, WhimReflection[]>();
    for (const r of reflections) {
      const k = reflectionDateKey(r.savedAt);
      const arr = map.get(k) ?? [];
      arr.push(r);
      map.set(k, arr);
    }
    return map;
  }, [reflections]);

  const selectReflection = useCallback((r: WhimReflection) => {
    const idx = reflections.findIndex((x) => x.savedAt === r.savedAt);
    if (idx >= 0) setActiveIndex(idx);
  }, [reflections]);

  useLayoutEffect(() => {
    if (view !== "calendar" || !active) return;
    const d = new Date(active.savedAt);
    const y = d.getFullYear();
    const mo = d.getMonth();
    setCalendarMonth((prev) =>
      prev.y === y && prev.m === mo ? prev : { y, m: mo },
    );
  }, [view, active?.savedAt]);

  useLayoutEffect(() => {
    if (!focusFromSave) {
      focusHandledRef.current = null;
      return;
    }
    if (reflections.length === 0) return;
    const idx = reflections.findIndex((r) => r.savedAt === focusFromSave);
    if (idx < 0) return;
    setActiveIndex(idx);
    setView("carousel");
    if (focusHandledRef.current !== focusFromSave) {
      focusHandledRef.current = focusFromSave;
      router.replace("/history", { scroll: false });
    }
  }, [focusFromSave, reflections, router]);

  return (
    <div className="flex h-dvh max-h-dvh w-full min-w-0 flex-col overflow-hidden bg-whim-sky">
      <header className="flex shrink-0 items-center justify-between gap-3 px-6 pb-3 pt-[max(2.75rem,calc(env(safe-area-inset-top)+2rem))] sm:px-7 sm:pb-4 sm:pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))]">
        <h1 className="min-w-0 flex-1 font-serif text-[1.2rem] italic leading-snug text-[#1A1A1A] sm:text-[1.35rem]">
          Past Whims
        </h1>
        {reflections.length > 0 ? (
          <div className="flex shrink-0 rounded-full bg-black/5 p-1 sm:p-1.5">
            <button
              type="button"
              aria-pressed={view === "carousel"}
              aria-label="Carousel view"
              onClick={() => setView("carousel")}
              className={cn(
                "flex min-h-11 min-w-[3.25rem] items-center justify-center rounded-full px-3 py-2.5 transition-colors sm:min-h-12 sm:min-w-[3.75rem] sm:px-3.5 sm:py-3",
                view === "carousel"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#1A1A1A]/60",
              )}
            >
              <GalleryHorizontal
                className="size-5 stroke-[1.75] sm:size-[1.35rem] sm:stroke-[1.85]"
                aria-hidden
              />
            </button>
            <button
              type="button"
              aria-pressed={view === "calendar"}
              aria-label="Calendar view"
              onClick={() => setView("calendar")}
              className={cn(
                "flex min-h-11 min-w-[3.25rem] items-center justify-center rounded-full px-3 py-2.5 transition-colors sm:min-h-12 sm:min-w-[3.75rem] sm:px-3.5 sm:py-3",
                view === "calendar"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#1A1A1A]/60",
              )}
            >
              <CalendarDays
                className="size-5 stroke-[1.75] sm:size-[1.35rem] sm:stroke-[1.85]"
                aria-hidden
              />
            </button>
          </div>
        ) : null}
      </header>

      {reflections.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-8 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))] text-center">
          <p className="font-serif text-lg italic text-[#1A1A1A]/80">
            No past whims yet. Complete a whim and save a reflection to see it
            here.
          </p>
          <Link
            href="/"
            className="rounded-full bg-[#1A1A1A] px-6 py-3 font-sans text-sm font-medium text-white"
          >
            Go home
          </Link>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {view === "carousel" ? (
            <HistorySnapCarousel
              reflections={reflections}
              activeIndex={activeIndex}
              onSelectIndex={setActiveIndex}
            />
          ) : (
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-whim-sky">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain">
                <div className="flex w-full flex-col items-center justify-start px-2 pb-2 pt-[max(0.5rem,2.5dvh)] sm:px-3 sm:pb-2.5 sm:pt-[max(0.75rem,3dvh)]">
                  {active ? (
                    <HistoryReflectionHeroCluster
                      reflection={active}
                      isActive
                    />
                  ) : null}
                </div>
              </div>
              <div className="shrink-0">
                <div
                  className="flex flex-col overflow-hidden rounded-t-[1.75rem] border border-b-0 border-zinc-200/70 bg-[#faf8f5] shadow-[0_-10px_36px_rgba(0,0,0,0.12)]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.65) 0%, transparent 42%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.03) 0%, transparent 35%)",
                  }}
                >
                  <div className="flex flex-col px-1 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+6.85rem))] pt-2 sm:px-2 sm:pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+6.85rem))] sm:pt-2.5">
                    <CalendarPanel
                      year={calendarMonth.y}
                      month={calendarMonth.m}
                      onPrevMonth={() =>
                        setCalendarMonth(({ y, m }) => {
                          const d = new Date(y, m - 1, 1);
                          return { y: d.getFullYear(), m: d.getMonth() };
                        })
                      }
                      onNextMonth={() =>
                        setCalendarMonth(({ y, m }) => {
                          const d = new Date(y, m + 1, 1);
                          return { y: d.getFullYear(), m: d.getMonth() };
                        })
                      }
                      reflectionsByDay={reflectionsByDay}
                      activeSavedAt={active?.savedAt ?? null}
                      onSelectDay={selectReflection}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {active ? (
            <WhimDetailDrawer
              key={active.savedAt}
              reflection={active}
              dockedVisible={view === "carousel"}
            />
          ) : null}
        </div>
      )}

      <WhimBottomNav active="history" />
    </div>
  );
}

/** ~85% width slides so previous/next whims peek on the sides. Leading/trailing spacers (½ remainder) let the first/last slide center exactly. */
const CAROUSEL_SLIDE_WIDTH_FRAC = 0.85;

function scrollToCarouselIndex(
  el: HTMLDivElement,
  index: number,
  n: number,
  slideW: number,
  spacerW: number,
) {
  const w = el.clientWidth;
  if (w <= 0 || n <= 0 || slideW <= 0) return;
  const i = clamp(index, 0, n - 1);
  const target = spacerW + i * slideW + slideW / 2 - w / 2;
  const maxLeft = Math.max(0, el.scrollWidth - w);
  el.scrollTo({ left: Math.max(0, Math.min(target, maxLeft)), behavior: "instant" });
}

function readCarouselIndexFromScroll(
  el: HTMLDivElement,
  n: number,
  slideW: number,
  spacerW: number,
): number {
  const w = el.clientWidth;
  if (w <= 0 || n <= 0 || slideW <= 0) return 0;
  const center = el.scrollLeft + w / 2;
  const estimate = (center - spacerW - slideW / 2) / slideW;
  return clamp(Math.round(estimate), 0, n - 1);
}

function HistorySnapCarousel({
  reflections,
  activeIndex,
  onSelectIndex,
}: {
  reflections: WhimReflection[];
  activeIndex: number;
  onSelectIndex: (i: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ slide: 0, spacer: 0 });
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [layout, setLayout] = useState({ slide: 0, spacer: 0 });
  const n = reflections.length;

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      const slide = w * CAROUSEL_SLIDE_WIDTH_FRAC;
      const spacer = (w - slide) / 2;
      metricsRef.current = { slide, spacer };
      setLayout({ slide, spacer });
      scrollToCarouselIndex(el, activeIndex, n, slide, spacer);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIndex, n]);

  const scheduleSettleIndex = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      const el = scrollerRef.current;
      if (!el) return;
      const { slide, spacer } = metricsRef.current;
      if (slide <= 0) return;
      onSelectIndex(readCarouselIndexFromScroll(el, n, slide, spacer));
    }, 120);
  }, [n, onSelectIndex]);

  const onScroll = useCallback(() => {
    scheduleSettleIndex();
  }, [scheduleSettleIndex]);

  const slidePx = layout.slide;
  const spacerPx = layout.spacer;

  return (
    <div className="absolute inset-0 min-h-0 w-full overflow-hidden">
      <div
        ref={scrollerRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={onScroll}
      >
        <div
          className="shrink-0"
          style={{ width: spacerPx, minWidth: spacerPx }}
          aria-hidden
        />
        {reflections.map((r, i) => (
          <section
            key={r.savedAt}
            className={cn(
              "flex h-full shrink-0 snap-center snap-always flex-col items-center justify-start px-2 pb-3 pt-[max(1.25rem,4dvh)] sm:px-3 sm:pt-[max(1.5rem,5dvh)]",
              slidePx <= 0 && "w-[85%] min-w-[85%] max-w-[85%]",
            )}
            style={
              slidePx > 0
                ? {
                    width: slidePx,
                    minWidth: slidePx,
                    maxWidth: slidePx,
                  }
                : undefined
            }
            aria-current={i === activeIndex ? "true" : undefined}
          >
            <HistoryReflectionHeroCluster
              reflection={r}
              isActive={i === activeIndex}
            />
          </section>
        ))}
        <div
          className="shrink-0"
          style={{ width: spacerPx, minWidth: spacerPx }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function CarouselSlideVisual({
  reflection,
  isActive,
}: {
  reflection: WhimReflection;
  isActive: boolean;
}) {
  const dayWhim = getWhimForDate(new Date(reflection.savedAt));
  const photo = reflection.photoDataUrl;
  const sketch = reflection.sketchDataUrl ?? null;
  const polaroidSrc = photo || sketch;
  const isRemotePhoto =
    polaroidSrc?.startsWith("http://") ||
    polaroidSrc?.startsWith("https://");
  const emoji = moodEmoji(reflection.mood);

  return (
    <div
      className={cn(
        "flex w-full max-w-[min(100%,300px)] flex-col items-center transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-[0.72]",
      )}
    >
      {/* Tight cluster: polaroid + emoji sit just above the illustration (mockup) */}
      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="flex w-full max-w-[300px] items-end justify-center gap-x-2 gap-y-0 sm:gap-x-2.5">
          <div
            className={cn(
              "w-[min(26vw,96px)] shrink-0 -rotate-[7deg] p-1.5 pb-3 sm:w-[102px] sm:p-2 sm:pb-3.5",
              polaroidSrc
                ? "bg-white shadow-md ring-1 ring-black/10"
                : "pointer-events-none opacity-0 ring-0 shadow-none",
            )}
            style={{ transformStyle: "preserve-3d" }}
            aria-hidden
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-zinc-100">
              {polaroidSrc ? (
                <>
                  <Image
                    src={polaroidSrc}
                    alt=""
                    fill
                    unoptimized={!isRemotePhoto}
                    draggable={false}
                    className="pointer-events-none object-cover"
                    sizes="104px"
                  />
                  {photo && sketch ? (
                    <div className="pointer-events-none absolute bottom-0.5 left-0.5 z-[1] h-[28%] w-[28%] overflow-hidden rounded-sm border border-white/90 bg-white shadow-md ring-1 ring-black/10 sm:bottom-1 sm:left-1">
                      <Image
                        src={sketch}
                        alt=""
                        fill
                        unoptimized
                        draggable={false}
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
          <span
            className="shrink-0 select-none text-[min(13vw,3.1rem)] leading-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.92)] sm:text-[3.35rem]"
            aria-hidden
          >
            {emoji}
          </span>
        </div>

        <div className="-mt-4 flex w-full justify-center sm:-mt-5">
          <img
            src={dayWhim.illustration}
            alt=""
            draggable={false}
            className="pointer-events-none max-h-[min(22dvh,200px)] w-[min(84%,220px)] object-contain object-bottom drop-shadow-[0_8px_20px_rgba(0,0,0,0.1)] sm:max-h-[min(24dvh,220px)] sm:w-[min(86%,236px)]"
          />
        </div>
      </div>

      <div className="mt-2 w-full shrink-0 text-center">
        <span className="block font-serif text-sm leading-snug text-[#1A1A1A]/80">
          {formatReflectionWeekday(reflection.savedAt)}
        </span>
        <span className="mt-0.5 block font-serif text-xl font-semibold leading-tight text-[#1A1A1A]">
          {formatReflectionDateOrdinal(reflection.savedAt)}
        </span>
      </div>
    </div>
  );
}

/** Polaroid / emoji / illustration / date for each carousel slide. */
function HistoryReflectionHeroCluster({
  reflection,
  isActive,
}: {
  reflection: WhimReflection;
  isActive: boolean;
}) {
  return (
    <div className="flex -translate-y-9 flex-col items-center sm:-translate-y-12">
      <CarouselSlideVisual reflection={reflection} isActive={isActive} />
    </div>
  );
}

function reflectionHasExpandableBody(r: WhimReflection): boolean {
  const note = r.note?.trim() ?? "";
  return note.length > 0 || Boolean(r.photoDataUrl);
}

const historyDrawerDockSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 28,
  mass: 1,
};

function WhimDetailDrawer({
  reflection,
  dockedVisible = true,
}: {
  reflection: WhimReflection;
  /** When false (calendar view), sheet slides off-screen so it doesn’t cover the grid. */
  dockedVisible?: boolean;
}) {
  const feeling = moodFeelingText(reflection.mood);
  const emoji = moodEmoji(reflection.mood);
  const whimForDay = getWhimForDate(new Date(reflection.savedAt));
  const photo = reflection.photoDataUrl;
  const isRemotePhoto =
    photo?.startsWith("http://") || photo?.startsWith("https://");
  const canExpand = reflectionHasExpandableBody(reflection);

  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const handlePointerY0 = useRef<number | null>(null);
  const handleDraggedRef = useRef(false);

  useLayoutEffect(() => {
    if (!canExpand) setExpanded(false);
  }, [canExpand, reflection.savedAt]);

  useLayoutEffect(() => {
    if (!dockedVisible) setExpanded(false);
  }, [dockedVisible]);

  const onBodyWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!canExpand || expanded) return;
      if (e.deltaY < 0) {
        e.preventDefault();
        setExpanded(true);
      }
    },
    [canExpand, expanded],
  );

  const onHandlePointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      handlePointerY0.current = e.clientY;
      handleDraggedRef.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const onHandlePointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!canExpand || expanded) return;
      if (handlePointerY0.current == null) return;
      const dy = handlePointerY0.current - e.clientY;
      if (dy > 16) {
        handleDraggedRef.current = true;
        setExpanded(true);
        handlePointerY0.current = null;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* released */
        }
      }
    },
    [canExpand, expanded],
  );

  const onHandlePointerUp = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    handlePointerY0.current = null;
  }, []);

  const onHandleClick = useCallback(() => {
    if (!canExpand) return;
    if (handleDraggedRef.current) {
      handleDraggedRef.current = false;
      return;
    }
    setExpanded((v) => !v);
  }, [canExpand]);

  /** Clears fixed WhimBottomNav; inner `pb-3` adds 12px below last content. */
  const drawerBottom =
    "bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+5rem))]";

  return (
    <motion.div
      initial={false}
      animate={dockedVisible ? { y: 0 } : { y: "122%" }}
      transition={historyDrawerDockSpring}
      className={cn(
        "absolute left-0 right-0 z-30 flex flex-col overflow-hidden rounded-t-[1.75rem] border border-b-0 border-zinc-200/70 bg-[#faf8f5] shadow-[0_-16px_48px_rgba(0,0,0,0.18)] transition-[height,max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        drawerBottom,
        !dockedVisible && "pointer-events-none",
        expanded
          ? "h-[70%] max-h-[70%] min-h-0"
          : "h-[min(42dvh,520px)] min-h-[min(42dvh,520px)] max-h-[min(42dvh,520px)] sm:h-[min(40dvh,540px)] sm:min-h-[min(40dvh,540px)] sm:max-h-[min(40dvh,540px)]",
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.65) 0%, transparent 42%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.03) 0%, transparent 35%)",
      }}
    >
      {canExpand ? (
        <button
          type="button"
          className="flex w-full shrink-0 touch-none flex-col px-6 pb-2 pt-4 select-none"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse detail" : "Expand detail"}
          onClick={onHandleClick}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <motion.div
            className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full bg-zinc-300/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.52,
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </button>
      ) : (
        <div
          className="flex w-full shrink-0 flex-col px-6 pb-2 pt-4 select-none"
          aria-hidden
        >
          <motion.div
            className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full bg-zinc-200/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.52,
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      )}

      <motion.div
        ref={bodyRef}
        className={cn(
          "min-h-0 w-full flex-1 px-6",
          expanded
            ? "overflow-y-auto overscroll-y-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-y-auto overscroll-y-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        onWheel={onBodyWheel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-serif text-xs italic leading-snug text-[#1A1A1A]/85">
          On a whim, I decided to...
        </p>
        <div className="mt-2">
          <WhimPaperCard innerClassName="rounded-t-[1.05rem] px-4 pb-3 pt-3 sm:px-4 sm:pb-3.5 sm:pt-3.5">
            <h2 className="font-serif text-xl font-normal leading-snug text-[#1A1A1A] sm:text-[1.35rem]">
              {whimForDay.text}
            </h2>
          </WhimPaperCard>
        </div>

        <div className="mt-4 border-t border-zinc-200/80 pt-4">
          <p className="font-serif text-xs italic leading-snug text-[#1A1A1A]/85">
            It made me feel...
          </p>
          <div className="mt-1 flex flex-row items-center gap-3">
            <span
              className="shrink-0 text-3xl leading-none drop-shadow-sm sm:text-[2.5rem]"
              aria-hidden
            >
              {emoji}
            </span>
            <p className="min-w-0 flex-1 text-right font-serif text-xl font-normal leading-snug text-[#1A1A1A] sm:text-[1.35rem]">
              {feeling}
            </p>
          </div>
        </div>

        {reflection.note.trim() ? (
          <p className="mt-4 font-serif text-sm leading-relaxed text-[#1A1A1A]/88">
            {reflection.note.trim()}
          </p>
        ) : null}

        <div
          className={cn(
            "relative aspect-[4/3] w-full max-w-full shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-black/5",
            reflection.note.trim() ? "mt-3" : "mt-4",
            photo ? "bg-zinc-100" : "bg-zinc-100/35 ring-zinc-200/60",
          )}
        >
          {photo ? (
            <Image
              src={photo}
              alt="Reflection photo"
              fill
              unoptimized={!isRemotePhoto}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 28rem"
            />
          ) : null}
        </div>
      </motion.div>
      {/* 12px breathing room above fixed nav; outside scroll so it stays visible when collapsed. */}
      <div className="h-3 w-full shrink-0" aria-hidden />
    </motion.div>
  );
}

function CalendarPanel({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  reflectionsByDay,
  activeSavedAt,
  onSelectDay,
}: {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  reflectionsByDay: Map<string, WhimReflection[]>;
  activeSavedAt: string | null;
  onSelectDay: (r: WhimReflection) => void;
}) {
  const label = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rowCount = Math.max(1, cells.length / 7);

  return (
    <div className="flex w-full shrink-0 flex-col">
      <div className="flex shrink-0 items-center justify-between px-0.5 pb-1 pt-0.5">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/[0.06]"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <span className="font-serif text-sm italic text-[#1A1A1A] sm:text-[0.95rem]">
          {label}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/[0.06]"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      <div className="grid shrink-0 grid-cols-7 gap-y-0 pb-0.5 text-center text-[0.55rem] font-sans font-medium leading-none tracking-wide text-[#1A1A1A]/45 sm:text-[0.58rem]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid shrink-0 grid-cols-7 gap-x-0.5 gap-y-0.5"
        style={{
          gridTemplateRows: `repeat(${rowCount}, auto)`,
        }}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="min-h-[2px]" aria-hidden />;
          }
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayRefs = reflectionsByDay.get(key) ?? [];
          const has = dayRefs.length > 0;
          const primary = dayRefs[0];
          const isSelected =
            Boolean(primary && activeSavedAt && primary.savedAt === activeSavedAt);

          return (
            <button
              key={key}
              type="button"
              disabled={!has}
              onClick={() => has && primary && onSelectDay(primary)}
              className={cn(
                "flex min-h-[3.35rem] w-full min-w-0 flex-col items-center justify-center gap-px rounded-lg border p-px transition-colors sm:min-h-[3.5rem] sm:gap-0.5 sm:rounded-xl sm:p-0.5",
                has
                  ? "border-[#1A1A1A]/12 bg-white shadow-sm hover:bg-white"
                  : "cursor-default border-transparent bg-white/[0.22] text-[#1A1A1A]/25",
                isSelected &&
                  "ring-2 ring-[#1A1A1A]/22 ring-offset-1 ring-offset-[#faf8f5]",
              )}
            >
              <span
                className={cn(
                  "font-sans text-[0.6rem] font-medium leading-none sm:text-[0.62rem]",
                  has ? "text-[#1A1A1A]" : "text-[#1A1A1A]/35",
                )}
              >
                {day}
              </span>
              {has && primary ? (
                <>
                  <span className="text-[0.7rem] leading-none sm:text-xs" aria-hidden>
                    {moodEmoji(primary.mood)}
                  </span>
                  <div
                    className={cn(
                      "relative mt-px h-6 w-6 shrink-0 overflow-hidden rounded-md sm:h-7 sm:w-7",
                      primary.photoDataUrl
                        ? "ring-1 ring-black/8"
                        : "pointer-events-none opacity-0 ring-0",
                    )}
                    aria-hidden
                  >
                    {primary.photoDataUrl ? (
                      <Image
                        src={primary.photoDataUrl}
                        alt=""
                        fill
                        unoptimized={
                          !(
                            primary.photoDataUrl.startsWith("http://") ||
                            primary.photoDataUrl.startsWith("https://")
                          )
                        }
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : null}
                  </div>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageFallback />}>
      <HistoryPageContent />
    </Suspense>
  );
}
