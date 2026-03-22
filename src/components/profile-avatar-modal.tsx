"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Pencil, Smile, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const DISPLAY = 260;
const EXPORT_MAX = 320;

export const PROFILE_EMOJI_OPTIONS = [
  "😊",
  "🌸",
  "🦋",
  "✨",
  "🌿",
  "🐚",
  "🦊",
  "☀️",
  "🌙",
  "⭐",
  "💫",
  "🌈",
  "🍀",
  "🌻",
  "🎨",
  "📷",
] as const;

type Tab = "emoji" | "photo" | "draw";

function resizeDataUrl(dataUrl: string, maxSide: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      const ctx = c.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      resolve(c.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

type ProfileAvatarModalProps = {
  open: boolean;
  onClose: () => void;
  currentEmoji: string;
  currentImageUrl: string | null;
  onChooseEmoji: (emoji: string) => void;
  onChooseImage: (dataUrl: string | null) => void;
};

export function ProfileAvatarModal({
  open,
  onClose,
  currentEmoji,
  currentImageUrl,
  onChooseEmoji,
  onChooseImage,
}: ProfileAvatarModalProps) {
  const [tab, setTab] = useState<Tab>("emoji");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab("emoji");
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== "string") return;
      try {
        const resized = await resizeDataUrl(reader.result, EXPORT_MAX);
        setPhotoPreview(resized);
      } catch {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const applyPhoto = useCallback(() => {
    if (!photoPreview) return;
    onChooseImage(photoPreview);
    onClose();
  }, [onChooseImage, onClose, photoPreview]);

  const pickEmoji = useCallback(
    (e: string) => {
      onChooseEmoji(e);
      onClose();
    },
    [onChooseEmoji, onClose],
  );

  const removeCustomImage = useCallback(() => {
    onChooseImage(null);
    onClose();
  }, [onChooseImage, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="profile-avatar-modal"
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
            aria-labelledby="profile-avatar-title"
            className="flex max-h-[min(88dvh,640px)] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-[#fdfcfa] shadow-2xl ring-1 ring-black/10"
            initial={{ y: 24, opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200/80 px-5 py-4">
              <h2
                id="profile-avatar-title"
                className="font-serif text-lg italic text-[#1A1A1A]"
              >
                Profile picture
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

            <div className="flex shrink-0 gap-1 border-b border-zinc-100 bg-zinc-100/50 p-1.5">
              <TabButton
                active={tab === "emoji"}
                onClick={() => setTab("emoji")}
                icon={<Smile className="h-4 w-4" aria-hidden />}
                label="Emoji"
              />
              <TabButton
                active={tab === "photo"}
                onClick={() => setTab("photo")}
                icon={<ImagePlus className="h-4 w-4" aria-hidden />}
                label="Photo"
              />
              <TabButton
                active={tab === "draw"}
                onClick={() => setTab("draw")}
                icon={<Pencil className="h-4 w-4" aria-hidden />}
                label="Draw"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {tab === "emoji" ? (
                <div>
                  <p className="font-sans text-sm text-[#1A1A1A]/65">
                    Choose an emoji for your avatar.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {PROFILE_EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => pickEmoji(e)}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform active:scale-95",
                          e === currentEmoji && !currentImageUrl
                            ? "bg-white shadow-md ring-2 ring-[#1B6B1B]"
                            : "bg-white/90 ring-1 ring-black/5 hover:bg-white",
                        )}
                        aria-label={`Use ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  {currentImageUrl ? (
                    <button
                      type="button"
                      onClick={removeCustomImage}
                      className="mt-6 w-full rounded-full border border-zinc-300 py-3 font-sans text-sm font-medium text-[#1A1A1A]/80 transition-colors hover:bg-zinc-50"
                    >
                      Remove photo, use emoji only
                    </button>
                  ) : null}
                </div>
              ) : null}

              {tab === "photo" ? (
                <div>
                  <p className="font-sans text-sm text-[#1A1A1A]/65">
                    Upload a photo from your device (same idea as reflection
                    photos).
                  </p>
                  <input
                    ref={fileInputRef}
                    id={fileId}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFile}
                  />
                  <div className="mt-4 flex flex-col items-center gap-4">
                    {photoPreview ? (
                      <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-md ring-1 ring-black/10">
                        <Image
                          src={photoPreview}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
                      >
                        <ImagePlus className="h-10 w-10 stroke-[1.25]" />
                        <span className="font-sans text-xs font-medium">
                          Choose image
                        </span>
                      </button>
                    )}
                    <div className="flex w-full gap-2">
                      {photoPreview ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="flex-1 rounded-full border border-zinc-300 py-3 font-sans text-sm font-medium text-[#1A1A1A]"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={applyPhoto}
                            className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white"
                          >
                            Use photo
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white"
                        >
                          Select file
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "draw" ? (
                <AvatarSketchPad
                  onUseDrawing={(dataUrl) => {
                    onChooseImage(dataUrl);
                    onClose();
                  }}
                />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 font-sans text-xs font-medium transition-colors",
        active
          ? "bg-white text-[#1A1A1A] shadow-sm"
          : "text-[#1A1A1A]/55 hover:text-[#1A1A1A]/85",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function setupSketchCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2,
  );
  canvas.width = Math.round(DISPLAY * dpr);
  canvas.height = Math.round(DISPLAY * dpr);
  canvas.style.width = `${DISPLAY}px`;
  canvas.style.height = `${DISPLAY}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 3;
  return ctx;
}

function AvatarSketchPad({
  onUseDrawing,
}: {
  onUseDrawing: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupSketchCanvas(canvas);
    setHasInk(false);
  }, []);

  const pos = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    },
    [],
  );

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
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#1A1A1A";
        ctx.fill();
        setHasInk(true);
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
      setHasInk(true);
    },
    [pos],
  );

  const onPointerUp = useCallback(() => {
    drawing.current = false;
    last.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupSketchCanvas(canvas);
    setHasInk(false);
  }, []);

  const useDrawing = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    const dataUrl = canvas.toDataURL("image/png");
    try {
      const resized = await resizeDataUrl(dataUrl, EXPORT_MAX);
      onUseDrawing(resized);
    } catch {
      onUseDrawing(dataUrl);
    }
  }, [hasInk, onUseDrawing]);

  return (
    <div>
      <p className="font-sans text-sm text-[#1A1A1A]/65">
        Sketch something, same spirit as doodling on a reflection.
      </p>
      <div className="mt-4 flex justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl border-2 border-zinc-200 bg-white shadow-inner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={clear}
          className="flex-1 rounded-full border border-zinc-300 py-3 font-sans text-sm font-medium text-[#1A1A1A]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={useDrawing}
          disabled={!hasInk}
          className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-sans text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Use drawing
        </button>
      </div>
    </div>
  );
}
