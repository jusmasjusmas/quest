"use client";

import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WhimPaperCard } from "@/components/whim-paper-card";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";
import { moodFeelingText, type MoodId } from "@/lib/whim-reflections";

/** Match history `WhimDetailDrawer` sheet surface. */
const REFLECTION_SHEET_BG = {
  backgroundImage:
    "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.65) 0%, transparent 42%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.03) 0%, transparent 35%)",
} as const;

/** Clears fixed `WhimBottomNav`; higher = sheet opens farther up (more of the form, incl. photo, visible). */
const reflectionDrawerBottom =
  "bottom-[max(7.35rem,calc(env(safe-area-inset-bottom)+6.65rem))]";

const MOODS: { id: MoodId; emoji: string; menuLabel: string }[] = [
  { id: "neutral", emoji: "😐", menuLabel: "Okay" },
  { id: "good", emoji: "🙂", menuLabel: "Good" },
  { id: "great", emoji: "😁", menuLabel: "Great" },
  { id: "tender", emoji: "🤗", menuLabel: "Tender" },
  { id: "calm", emoji: "😌", menuLabel: "Calm" },
  { id: "grateful", emoji: "🙏", menuLabel: "Grateful" },
  { id: "energized", emoji: "⚡", menuLabel: "Energized" },
  { id: "hopeful", emoji: "🌟", menuLabel: "Hopeful" },
  { id: "creative", emoji: "🎨", menuLabel: "Creative" },
  { id: "drawn", emoji: "✏️", menuLabel: "Sketch" },
];

/** Compact canvas so the full reflection form fits on one screen with the drawer nearly full-height. */
const SKETCH_DISPLAY = 168;

function setupReflectionSketchCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2,
  );
  canvas.width = Math.round(SKETCH_DISPLAY * dpr);
  canvas.height = Math.round(SKETCH_DISPLAY * dpr);
  canvas.style.width = `${SKETCH_DISPLAY}px`;
  canvas.style.height = `${SKETCH_DISPLAY}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#fafaf9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 2.5;
  return ctx;
}

function FeelingSketchField({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasInkRef = useRef(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupReflectionSketchCanvas(canvas);
    hasInkRef.current = false;
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset once on mount
  }, []);

  const pos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const syncPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInkRef.current) return;
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = true;
      const p = pos(e);
      last.current = p;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = "#1A1A1A";
        ctx.fill();
        hasInkRef.current = true;
      }
    },
    [pos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas || !last.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last.current = p;
      hasInkRef.current = true;
    },
    [pos],
  );

  const onPointerUp = useCallback(() => {
    drawing.current = false;
    last.current = null;
    syncPng();
  }, [syncPng]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupReflectionSketchCanvas(canvas);
    hasInkRef.current = false;
    onChange(null);
  }, [onChange]);

  return (
    <div className="mt-2">
      <p className="font-sans text-[0.65rem] font-medium text-[#1A1A1A]/55 sm:text-xs">
        Sketch how it felt. It saves with your reflection.
      </p>
      <div className="mt-2 flex justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-xl border-2 border-zinc-200 bg-[#fafaf9] shadow-inner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 w-full rounded-full border border-zinc-300 py-2 font-sans text-xs font-medium text-[#1A1A1A]/80"
      >
        Clear sketch
      </button>
    </div>
  );
}

export function ReflectionDrawer() {
  const router = useRouter();
  const { whimState, setReflectingOpen, saveReflection, currentWhim } =
    useWhim();
  const open = whimState === "reflecting";

  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [noteText, setNoteText] = useState("");
  const [attachmentPhotoUrl, setAttachmentPhotoUrl] = useState<string | null>(
    null,
  );
  const [feelingSketchUrl, setFeelingSketchUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setSelectedMood(null);
    setNoteText("");
    setAttachmentPhotoUrl(null);
    setFeelingSketchUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open]);

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAttachmentPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (selectedMood === "drawn" && !feelingSketchUrl) return;
    const savedAt = saveReflection({
      feeling: selectedMood,
      feelingText: moodFeelingText(selectedMood),
      note: noteText,
      photoUrl: attachmentPhotoUrl,
      sketchUrl:
        selectedMood === "drawn" ? feelingSketchUrl : null,
    });
    setSelectedMood(null);
    setNoteText("");
    setAttachmentPhotoUrl(null);
    setFeelingSketchUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      sessionStorage.setItem("whim-history-celebrate-at", savedAt);
    } catch {
      /* private mode */
    }
    router.push(`/history?focus=${encodeURIComponent(savedAt)}`);
  }, [
    attachmentPhotoUrl,
    feelingSketchUrl,
    noteText,
    router,
    saveReflection,
    selectedMood,
  ]);

  const canSave =
    selectedMood != null &&
    (selectedMood !== "drawn" || feelingSketchUrl != null);

  return (
    <Drawer
      open={open}
      onOpenChange={setReflectingOpen}
      shouldScaleBackground={false}
      snapPoints={[1]}
      fadeFromIndex={0}
    >
      <DrawerContent
        overlayClassName="z-[52] bg-black/40 supports-backdrop-filter:backdrop-blur-[2px]"
        className={cn(
          "z-[53] flex w-full max-w-none flex-col border-0 bg-transparent !p-0 shadow-none outline-none",
          "before:!hidden [&_[data-slot=drawer-handle]]:!hidden",
          "!inset-x-0 !left-0 !right-0 !mt-0",
          reflectionDrawerBottom,
          "!top-auto !max-h-none",
          "data-[vaul-drawer-direction=bottom]:!mb-0",
        )}
      >
        <DrawerTitle className="sr-only">Reflect on your whim</DrawerTitle>
        <DrawerDescription className="sr-only">
          Record how your whim felt, add optional notes or a photo, then save.
        </DrawerDescription>

        <div
          className={cn(
            "flex w-full max-w-none flex-col overflow-hidden rounded-t-[1.75rem] border border-b-0 border-zinc-200/70 bg-[#faf8f5] shadow-[0_-16px_48px_rgba(0,0,0,0.18)]",
            "max-h-[calc(100dvh-max(7.35rem,calc(env(safe-area-inset-bottom)+6.65rem)))]",
            "h-[min(92dvh,calc(100dvh-max(7.35rem,calc(env(safe-area-inset-bottom)+6.65rem))))]",
          )}
          style={REFLECTION_SHEET_BG}
        >
          <div
            className="flex w-full shrink-0 flex-col px-6 pb-2 pt-4"
            aria-hidden
          >
            <div className="mx-auto h-1 w-9 shrink-0 rounded-full bg-zinc-300/90" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-h-safari-scroll-slack">
            <p className="font-serif text-xs italic leading-snug text-[#1A1A1A]/85">
              On a whim, I decided to...
            </p>
            <div className="mt-2">
              <WhimPaperCard innerClassName="rounded-t-[1.05rem] px-4 pb-3 pt-3 sm:px-4 sm:pb-3.5 sm:pt-3.5">
                <h2 className="font-serif text-xl font-normal leading-snug text-[#1A1A1A] sm:text-[1.35rem]">
                  {currentWhim.text}
                </h2>
              </WhimPaperCard>
            </div>

            <p className="mt-4 font-serif text-xs italic leading-snug text-[#1A1A1A]/85 sm:mt-5">
              It made me feel...
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2 px-0 sm:mt-3 sm:gap-2.5">
              {MOODS.map(({ id, emoji, menuLabel }) => (
                <MoodButton
                  key={id}
                  dense
                  emoji={emoji}
                  menuLabel={menuLabel}
                  isDraw={id === "drawn"}
                  selected={selectedMood === id}
                  onSelect={() => {
                    setSelectedMood(id);
                    if (id !== "drawn") setFeelingSketchUrl(null);
                  }}
                />
              ))}
            </div>

            {selectedMood ? (
              <p className="mt-2 text-center font-serif text-sm leading-snug text-[#1A1A1A] sm:mt-2.5">
                {moodFeelingText(selectedMood)}
              </p>
            ) : null}

            {selectedMood === "drawn" ? (
              <FeelingSketchField onChange={setFeelingSketchUrl} />
            ) : null}

            <label
              htmlFor="reflection-notes"
              className="mt-3 block font-serif text-xs italic leading-snug text-[#1A1A1A]/85 sm:mt-4"
            >
              Notes (optional)
            </label>
            <div className="mt-1.5 rounded-xl border border-zinc-200/85 bg-[#f5f3ef] px-4 py-3.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.025)] sm:px-5 sm:py-4">
              <textarea
                id="reflection-notes"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={currentWhim.notesPlaceholder}
                rows={3}
                className="min-h-[4.75rem] w-full resize-none bg-transparent font-serif text-sm leading-relaxed text-[#1A1A1A] placeholder:text-zinc-500/90 focus:outline-none focus:ring-0 sm:min-h-[5rem] sm:text-base"
              />
            </div>

            <p className="mt-3 font-serif text-xs italic leading-snug text-[#1A1A1A]/85 sm:mt-4">
              Add a photo (Optional)
            </p>
            <div className="mt-1.5 flex w-full">
              {attachmentPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-[5.25rem] w-[7rem] shrink-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100/60 text-left shadow-md ring-1 ring-black/[0.06] transition-colors hover:border-zinc-300 hover:bg-zinc-100/80 sm:h-[5.5rem] sm:w-[7.35rem]"
                >
                  <Image
                    src={attachmentPhotoUrl}
                    alt="Your upload. Tap to change."
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="120px"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1 pt-5 text-center font-sans text-[0.55rem] font-medium leading-tight text-white sm:text-[0.6rem]">
                    Tap to change
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[5.25rem] w-[7rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-100/70 text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-100 sm:h-[5.5rem] sm:w-[7.35rem]"
                >
                  <ImagePlus
                    className="h-5 w-5 stroke-[1.35] sm:h-5 sm:w-5"
                    aria-hidden
                  />
                  <span className="px-1 text-center font-sans text-[0.65rem] font-medium leading-tight sm:text-[0.7rem]">
                    Select file
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
            </div>
            </div>
            </div>

          <div className="shrink-0 border-t border-zinc-200/80 bg-[#faf8f5] px-6 pb-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom)))] pt-4 sm:pb-[max(1.75rem,calc(1.15rem+env(safe-area-inset-bottom)))] sm:pt-4">
            <div className="flex w-full gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setReflectingOpen(false)}
                aria-label="Close reflection"
                className="inline-flex min-h-[2.85rem] flex-1 items-center justify-center gap-2 rounded-full border border-[#1A1A1A] bg-white px-3 py-2.5 font-sans text-sm font-medium text-[#1A1A1A] transition-transform active:scale-[0.98] sm:min-h-[3.1rem] sm:px-4 sm:py-3"
              >
                <X className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="inline-flex min-h-[2.85rem] flex-1 items-center justify-center rounded-full bg-[#1A1A1A] px-3 py-2.5 font-sans text-sm font-medium text-white transition-transform enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[3.1rem] sm:px-4 sm:py-3"
              >
                Save →
              </button>
            </div>
          </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MoodButton({
  emoji,
  menuLabel,
  isDraw,
  selected,
  onSelect,
  dense = false,
}: {
  emoji: string;
  menuLabel: string;
  isDraw: boolean;
  selected: boolean;
  onSelect: () => void;
  dense?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={menuLabel}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 transition-colors",
        dense
          ? "w-[3.55rem] gap-0.5 py-1.5 sm:w-[3.7rem] sm:py-2"
          : "w-[4.25rem] gap-1 py-2.5",
        isDraw &&
          !selected &&
          "border-dashed border-violet-300/55 bg-gradient-to-b from-violet-50/40 to-stone-50/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        isDraw &&
          selected &&
          "border-solid border-violet-400/55 bg-violet-50/95 shadow-sm ring-1 ring-violet-200/40",
        !isDraw && !selected && "border-transparent bg-white/60",
        !isDraw &&
          selected &&
          "border-solid border-amber-400/90 bg-amber-50/60 shadow-sm",
      )}
      animate={{
        scale: selected ? 1.04 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <span className={dense ? "text-lg sm:text-xl" : "text-2xl"} aria-hidden>
        {emoji}
      </span>
      <span
        className={cn(
          "font-sans font-medium",
          isDraw
            ? "text-[0.55rem] font-semibold text-violet-800/72 sm:text-[0.58rem]"
            : "text-[#1A1A1A]/70",
          dense && !isDraw ? "text-[0.58rem] sm:text-[0.6rem]" : null,
          dense && isDraw ? "text-[0.52rem] sm:text-[0.55rem]" : null,
          !dense && !isDraw ? "text-[0.65rem]" : null,
        )}
      >
        {menuLabel}
      </span>
    </motion.button>
  );
}
