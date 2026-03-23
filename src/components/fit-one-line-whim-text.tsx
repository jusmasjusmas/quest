"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const LINE_HEIGHT = 1.22;

type FitOneLineWhimTextProps = {
  text: string;
  className?: string;
  /** Smallest font size (px) before clipping. */
  minPx?: number;
  /** Largest font size (px) when the line is short. */
  maxPx?: number;
};

export function FitOneLineWhimText({
  text,
  className,
  minPx = 14,
  maxPx = 38,
}: FitOneLineWhimTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontPx, setFontPx] = useState(maxPx);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    const mq = window.matchMedia("(min-width: 640px)");

    const fit = () => {
      const w = wrap.clientWidth;
      if (w <= 0) return;

      const capMax = Math.min(maxPx, mq.matches ? 38 : 33);
      const capMin = Math.max(minPx, mq.matches ? 15 : 14);

      let s = capMax;
      el.style.fontSize = `${s}px`;
      while (s > capMin && el.scrollWidth > w + 0.5) {
        s -= 0.5;
        el.style.fontSize = `${s}px`;
      }
      setFontPx(s);
    };

    fit();
    mq.addEventListener("change", fit);
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => {
      mq.removeEventListener("change", fit);
      ro.disconnect();
    };
  }, [text, minPx, maxPx]);

  return (
    <div
      ref={wrapRef}
      className="min-w-0 w-full overflow-hidden"
      style={{ minHeight: `${Math.min(maxPx, 38) * LINE_HEIGHT}px` }}
    >
      <p
        ref={textRef}
        className={cn(
          "font-serif font-normal tracking-tight whitespace-nowrap",
          className,
        )}
        style={{
          fontSize: `${fontPx}px`,
          lineHeight: LINE_HEIGHT,
        }}
      >
        {text}
      </p>
    </div>
  );
}
