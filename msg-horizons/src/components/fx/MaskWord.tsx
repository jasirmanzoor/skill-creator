"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useLowPower } from "@/lib/perf";
import { FILL } from "./MaskedHeadings";

type MaskProps = Record<string, unknown> & { text: string };
const MaskedHeading = dynamic<MaskProps>(() => import("./MaskedHeading") as unknown as Promise<{ default: React.ComponentType<MaskProps> }>, { ssr: false });

/** letters only: anything with a digit stays plain type (figures have their own motion, ui/CountUp) */
const LETTERS_ONLY = /^[^0-9٠-٩]+$/;

/**
 * A big title cut out of MSG's brand film (React Bits' MaskedHeading): the words are windows onto the film, light on the
 * dark plates and stages it sits on, and they scale up into place as the title arrives. Words only, never figures.
 * Arabic letters join, and the mask cuts one letter at a time, so Arabic keeps its normal type. The film plays only
 * while the title is near the screen, and weaker devices keep plain type. The real text is beside it for search and
 * screen readers.
 */
export default function MaskWord({ text, lang, scale = 0.11, className = "", fallbackClassName = "" }: { text: string; lang: Locale; scale?: number; className?: string; fallbackClassName?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const plain = useLowPower();
  useEffect(() => {
    if (plain || !box.current) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "25% 0px" });
    io.observe(box.current);
    return () => io.disconnect();
  }, [plain]);
  if (lang === "ar" || !LETTERS_ONLY.test(text) || plain) return <span className={fallbackClassName}>{text}</span>;
  return (
    <span ref={box} className={`relative block ${className}`}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-30%_-10%] -z-10 bg-[radial-gradient(closest-side,rgba(11,19,38,0.62),rgba(11,19,38,0))]" />
      <span className="sr-only">{text}</span>
      {near ? (
        <MaskedHeading
          tag="span"
          aria-hidden="true"
          text={text}
          mediaType="video"
          src={FILL.light.src}
          poster={FILL.light.poster}
          fillScale={1.25}
          parallax={26}
          reveal="scale"
          trigger="view"
          spotlight={false}
          outline={false}
          duration={1.1}
          stagger={0.09}
          drift={18}
          hoverZoom={0}
          align="center"
          brightness={1}
          saturation={1}
          grayscale={false}
          weight={700}
          tracking={-0.03}
          lineHeight={1.06}
          textScale={scale}
          style={{ display: "block" }}
        />
      ) : (
        <span aria-hidden="true" className="block text-center font-semibold leading-[1.06] tracking-[-0.03em] opacity-0">{text}</span>
      )}
    </span>
  );
}
