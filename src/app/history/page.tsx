"use client";

import {
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { WhimBottomNav } from "@/components/whim-bottom-nav";
import { getWhimForDate } from "@/data/whims";
import { cn } from "@/lib/utils";
import { useWhim } from "@/context/WhimContext";
import { mergeWithPlaceholderReflections } from "@/lib/history-placeholders";
import {
  formatReflectionDateLong,
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

export default function HistoryPage() {
  const { reflections: rawReflections } = useWhim();

  const reflections = useMemo(() => {
    const merged = mergeWithPlaceholderReflections(rawReflections);
    const list: WhimReflection[] = merged.map((r) => ({
      whimTitle: r.whimText,
      mood: r.feeling,
      note: r.note,
      photoDataUrl: r.photoUrl,
      savedAt: r.date,
      whimId: r.whimId,
    }));
    return list.sort(
      (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
    );
  }, [rawReflections]);

  const [view, setView] = useState<ViewMode>("carousel");
  const [activeIndex, setActiveIndex] = useState(0);
  const hasSeededNewest = useRef(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  useEffect(() => {
    const n = reflections.length;
    if (n === 0) return;
    if (!hasSeededNewest.current) {
      setActiveIndex(n - 1);
      hasSeededNewest.current = true;
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

  const openReflection = useCallback(
    (r: WhimReflection) => {
      const idx = reflections.findIndex((x) => x.savedAt === r.savedAt);
      if (idx >= 0) setActiveIndex(idx);
    },
    [reflections],
  );

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col overflow-hidden rounded-2xl bg-[#ECFAFF]">
      <header className="relative flex shrink-0 items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1A1A1A] transition-colors hover:bg-black/5"
          aria-label="Back to home"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-lg italic text-[#1A1A1A]">
          Past Whims
        </h1>
        <div className="flex rounded-full bg-black/5 p-0.5">
          <button
            type="button"
            aria-pressed={view === "carousel"}
            aria-label="Carousel view"
            onClick={() => setView("carousel")}
            className={cn(
              "rounded-full p-2 transition-colors",
              view === "carousel"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#1A1A1A]/60",
            )}
          >
            <GalleryHorizontal className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-pressed={view === "calendar"}
            aria-label="Calendar view"
            onClick={() => setView("calendar")}
            className={cn(
              "rounded-full p-2 transition-colors",
              view === "calendar"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#1A1A1A]/60",
            )}
          >
            <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {reflections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-[max(8rem,calc(env(safe-area-inset-bottom)+6.5rem))] text-center">
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
      ) : view === "carousel" ? (
        <>
          <WhimCarousel
            reflections={reflections}
            activeIndex={activeIndex}
            onSelectIndex={setActiveIndex}
          />
          {active ? (
            <p className="shrink-0 px-6 pb-4 text-center">
              <span className="block font-serif text-sm text-[#1A1A1A]/80">
                {formatReflectionWeekday(active.savedAt)}
              </span>
              <span className="mt-0.5 block font-serif text-xl font-bold text-[#1A1A1A]">
                {formatReflectionDateLong(active.savedAt)}
              </span>
            </p>
          ) : null}
        </>
      ) : (
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
          onSelectDay={(r) => {
            openReflection(r);
            setView("carousel");
          }}
        />
      )}

      {reflections.length > 0 && active ? (
        <WhimDetailCard key={active.savedAt} reflection={active} />
      ) : null}

      <WhimBottomNav active="history" />
    </div>
  );
}

function WhimCarousel({
  reflections,
  activeIndex,
  onSelectIndex,
}: {
  reflections: WhimReflection[];
  activeIndex: number;
  onSelectIndex: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const gap = 8;
  const slideRatio = 0.66;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.offsetWidth));
    ro.observe(el);
    setCw(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const slideW = cw > 0 ? cw * slideRatio : 0;
  const stride = slideW + gap;
  const n = reflections.length;
  const centerOffset = cw > 0 ? (cw - slideW) / 2 : 0;
  const minX = n > 0 ? centerOffset - (n - 1) * stride : centerOffset;
  const maxX = centerOffset;

  const x = useMotionValue(0);
  const xInitialized = useRef(false);

  useEffect(() => {
    xInitialized.current = false;
  }, [n]);

  useEffect(() => {
    if (!cw || !n) return;
    const target = centerOffset - activeIndex * stride;
    if (!xInitialized.current) {
      x.set(target);
      xInitialized.current = true;
      return;
    }
    animate(x, target, {
      type: "spring",
      stiffness: 380,
      damping: 38,
    });
  }, [activeIndex, centerOffset, cw, n, stride, x]);

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (!cw || !n) return;
      const current = x.get();
      let idx = Math.round((centerOffset - current) / stride);
      const v = info.velocity.x;
      if (v < -220) idx += 1;
      if (v > 220) idx -= 1;
      idx = clamp(idx, 0, n - 1);
      onSelectIndex(idx);
      animate(x, centerOffset - idx * stride, {
        type: "spring",
        stiffness: 380,
        damping: 38,
      });
    },
    [centerOffset, cw, n, onSelectIndex, stride, x],
  );

  return (
    <div ref={containerRef} className="relative w-full shrink-0 overflow-hidden py-4">
      {cw > 0 && slideW > 0 ? (
        <motion.div
          className="flex cursor-grab select-none touch-none active:cursor-grabbing"
          style={{ x, gap }}
          drag="x"
          dragConstraints={{ left: minX, right: maxX }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {reflections.map((r, i) => {
            const dist = Math.abs(i - activeIndex);
            const dayWhim = getWhimForDate(new Date(r.savedAt));
            const scale =
              dist === 0 ? 1.06 : dist === 1 ? 0.9 : Math.max(0.78, 0.9 - dist * 0.04);
            const opacity =
              dist === 0 ? 1 : dist === 1 ? 0.82 : Math.max(0.55, 0.82 - dist * 0.1);
            return (
              <div
                key={`${r.savedAt}-${i}`}
                className="relative shrink-0 select-none"
                style={{ width: slideW }}
              >
                <motion.div
                  className="pointer-events-none relative mx-auto flex h-[220px] max-w-[220px] items-end justify-center"
                  animate={{ scale, opacity }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                >
                  {r.photoDataUrl ? (
                    <motion.div
                      className="absolute -left-1 top-2 z-10 w-[72px] origin-bottom-right rotate-[-8deg] bg-white p-1.5 pb-4 shadow-lg ring-1 ring-black/10"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{
                        rotate: dist === 0 ? -8 : -10,
                        y: dist === 0 ? 0 : 4,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                        <Image
                          src={r.photoDataUrl}
                          alt=""
                          fill
                          unoptimized
                          draggable={false}
                          className="pointer-events-none object-cover"
                          sizes="72px"
                        />
                      </div>
                    </motion.div>
                  ) : null}

                  <motion.div
                    className="absolute -right-1 top-0 z-10 text-5xl leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]"
                    animate={{
                      rotate: dist === 0 ? 8 : 12,
                      scale: dist === 0 ? 1 : 0.88,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    aria-hidden
                  >
                    {moodEmoji(r.mood)}
                  </motion.div>

                  <div className="relative isolate h-[160px] w-[140px] bg-[#ECFAFF]">
                    <Image
                      src={dayWhim.illustration}
                      alt=""
                      fill
                      draggable={false}
                      className="pointer-events-none object-contain object-bottom mix-blend-screen drop-shadow-[0_6px_14px_rgba(0,0,0,0.07)]"
                      sizes="140px"
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      ) : null}
    </div>
  );
}

function CalendarPanel({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  reflectionsByDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  reflectionsByDay: Map<string, WhimReflection[]>;
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
  while (cells.length < 42) cells.push(null);

  return (
    <div className="shrink-0 px-4 pb-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/5"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-serif text-base italic text-[#1A1A1A]">
          {label}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/5"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[0.65rem] font-sans font-medium uppercase tracking-wide text-[#1A1A1A]/45">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayRefs = reflectionsByDay.get(key) ?? [];
          const has = dayRefs.length > 0;
          const primary = dayRefs[0];

          return (
            <button
              key={key}
              type="button"
              disabled={!has}
              onClick={() => has && primary && onSelectDay(primary)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-xs transition-colors",
                has
                  ? "border-[#1A1A1A]/15 bg-white/70 shadow-sm hover:bg-white"
                  : "cursor-default border-transparent bg-white/20 text-[#1A1A1A]/25",
              )}
            >
              <span
                className={cn(
                  "font-sans text-[0.7rem] font-medium",
                  has ? "text-[#1A1A1A]" : "text-[#1A1A1A]/35",
                )}
              >
                {day}
              </span>
              {has && primary ? (
                <>
                  <span className="text-lg leading-none" aria-hidden>
                    {moodEmoji(primary.mood)}
                  </span>
                  {primary.photoDataUrl ? (
                    <div className="relative h-5 w-5 overflow-hidden rounded-md ring-1 ring-black/10">
                      <Image
                        src={primary.photoDataUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="20px"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WhimDetailCard({ reflection }: { reflection: WhimReflection }) {
  const feeling = moodFeelingText(reflection.mood);
  const emoji = moodEmoji(reflection.mood);
  const whimForDay = getWhimForDate(new Date(reflection.savedAt));

  return (
    <motion.div
      initial={{ y: 28, opacity: 0.92 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="mt-auto rounded-t-[1.75rem] border border-b-0 border-zinc-200/80 bg-[#fdfcfa] px-6 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] pt-3 shadow-[0_-8px_36px_rgba(0,0,0,0.1)]"
    >
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300/90" />

      <p className="font-serif text-sm italic text-[#1A1A1A]/85">
        On a whim, I decided to...
      </p>
      <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-[#1A1A1A]">
        {whimForDay.text}
      </h2>

      <p className="mt-6 font-serif text-sm italic text-[#1A1A1A]/85">
        It made me feel...
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-serif text-2xl font-bold leading-snug text-[#1A1A1A]">
          {feeling}
        </p>
        <span
          className="shrink-0 text-4xl leading-none drop-shadow-sm"
          aria-hidden
        >
          {emoji}
        </span>
      </div>

      {reflection.note.trim() ? (
        <p className="mt-6 border-t border-zinc-200/80 pt-4 font-serif text-base leading-relaxed text-[#1A1A1A]/90">
          {reflection.note.trim()}
        </p>
      ) : null}

      {reflection.photoDataUrl ? (
        <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100 shadow-md ring-1 ring-black/5">
          <Image
            src={reflection.photoDataUrl}
            alt="Reflection photo"
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 384px) 100vw, 384px"
          />
        </div>
      ) : null}
    </motion.div>
  );
}
