"use client";

import { motion } from "framer-motion";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useWhim } from "@/context/WhimContext";
import { cn } from "@/lib/utils";
import { moodFeelingText, type MoodId } from "@/lib/whim-reflections";

const MOODS: { id: MoodId; emoji: string; label: string }[] = [
  { id: "neutral", emoji: "😐", label: "Neutral" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "great", emoji: "😁", label: "Great" },
  { id: "creative", emoji: "🎨", label: "Creative" },
];

export function ReflectionDrawer() {
  const { whimState, setReflectingOpen, saveReflection, currentWhim } =
    useWhim();
  const open = whimState === "reflecting";

  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [noteText, setNoteText] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(() => {
    saveReflection({
      feeling: selectedMood,
      feelingText: moodFeelingText(selectedMood),
      note: noteText,
      photoUrl: photoDataUrl,
    });
    setSelectedMood(null);
    setNoteText("");
    setPhotoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [noteText, photoDataUrl, saveReflection, selectedMood]);

  const handleShare = useCallback(async () => {
    const whimTitle = currentWhim.text;
    const text =
      noteText.trim() ||
      `On a whim I ${whimTitle.toLowerCase().replace(/\.$/, "")}.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Whim reflection",
          text,
        });
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.warn(e);
        }
      }
      return;
    }
    window.alert(
      "Native share isn’t available in this browser. For the hackathon, copy your notes or try a mobile device.",
    );
  }, [currentWhim.text, noteText]);

  return (
    <Drawer open={open} onOpenChange={setReflectingOpen}>
      <DrawerContent
        className="mx-auto w-full max-w-sm border-0 bg-transparent p-0 shadow-none before:hidden data-[vaul-drawer-direction=bottom]:mb-0 data-[vaul-drawer-direction=bottom]:mt-3 data-[vaul-drawer-direction=bottom]:h-[85vh] data-[vaul-drawer-direction=bottom]:max-h-[85vh]"
      >
        <DrawerTitle className="sr-only">Reflect on your whim</DrawerTitle>
        <DrawerDescription className="sr-only">
          Record how your whim felt, add notes and a photo, then save or share.
        </DrawerDescription>

        <div className="flex h-full min-h-0 flex-col rounded-t-[1.75rem] border border-b-0 border-zinc-200/80 bg-[#f7f6f3] shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4 pt-1">
            <p className="font-serif text-base italic text-[#1A1A1A]">
              On a whim, I decided to...
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight text-[#1A1A1A]">
              {currentWhim.text}
            </h2>

            <p className="mt-8 font-serif text-base italic text-[#1A1A1A]">
              It made me feel...
            </p>
            <div className="mt-4 flex w-full justify-between gap-2 px-1">
              {MOODS.map(({ id, emoji, label }) => (
                <MoodButton
                  key={id}
                  emoji={emoji}
                  label={label}
                  isNeutral={id === "neutral"}
                  selected={selectedMood === id}
                  selectedMood={selectedMood}
                  onSelect={() => setSelectedMood(id)}
                />
              ))}
            </div>

            <label
              htmlFor="reflection-notes"
              className="mt-10 block font-serif text-base italic text-[#1A1A1A]"
            >
              Notes (optional)
            </label>
            <textarea
              id="reflection-notes"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="How did it go?"
              rows={5}
              className="mt-2 w-full resize-none bg-transparent font-serif text-base leading-relaxed text-[#1A1A1A] placeholder:text-zinc-400 focus:outline-none focus:ring-0"
            />

            <div className="mt-8 flex gap-3">
              <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-md ring-1 ring-black/5">
                {photoDataUrl ? (
                  <Image
                    src={photoDataUrl}
                    alt="Your upload"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="100px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100/80 font-serif text-xs text-zinc-400">
                    No photo
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[100px] w-[100px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 bg-zinc-100/60 text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
              >
                <ImagePlus className="h-7 w-7 stroke-[1.25]" aria-hidden />
                <span className="font-sans text-[0.7rem] font-medium">
                  Select file
                </span>
              </button>
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

          <div className="shrink-0 border-t border-zinc-200/70 bg-[#f7f6f3] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full border border-[#1A1A1A] bg-white px-4 py-3 font-sans text-sm font-medium text-[#1A1A1A] transition-transform active:scale-[0.98]"
              >
                Share ×
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full bg-[#1A1A1A] px-4 py-3 font-sans text-sm font-medium text-white transition-transform active:scale-[0.98]"
              >
                Save →
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MoodButton({
  emoji,
  label,
  isNeutral,
  selected,
  selectedMood,
  onSelect,
}: {
  emoji: string;
  label: string;
  isNeutral: boolean;
  selected: boolean;
  selectedMood: MoodId | null;
  onSelect: () => void;
}) {
  const none = selectedMood === null;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition-colors",
        isNeutral &&
          none &&
          "border-dashed border-amber-500/80 bg-transparent",
        isNeutral &&
          !none &&
          !selected &&
          "border-dashed border-zinc-300 bg-transparent",
        isNeutral &&
          selected &&
          "border-dashed border-amber-600/90 bg-amber-50/50 shadow-sm",
        !isNeutral && !selected && "border-transparent bg-transparent",
        !isNeutral &&
          selected &&
          "border-solid border-amber-400/90 bg-amber-50/60 shadow-sm",
      )}
      animate={{
        scale: selected ? 1.1 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <span aria-hidden>{emoji}</span>
    </motion.button>
  );
}
