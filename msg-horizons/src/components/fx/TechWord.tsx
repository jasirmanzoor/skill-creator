"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useLowPower } from "@/lib/perf";
import type { Locale } from "@/content/i18n";

const TechText = dynamic(() => import("./TechText"), { ssr: false });

/** letters only: anything with a digit stays plain type (figures have their own motion, ui/CountUp) */
const LETTERS_ONLY = /^[^0-9٠-٩]+$/;

/**
 * Words drawn by React Bits' TechText: a light sweeps along the word, each letter it passes turns to a dashed outline
 * inside a technical selection frame, and a tap kicks the letters up like a wave (drag a letter and it springs
 * back). Used for words only, never figures. Arabic letters join, and TechText draws one letter at a time, so Arabic
 * keeps its normal type. The canvas is decoration: the real text is beside it for search and screen readers. It is
 * drawn only while the word is near the screen, and weaker devices keep plain type.
 */
export default function TechWord({ text, lang, className = "", fallbackClassName = "" }: { text: string; lang: Locale; className?: string; fallbackClassName?: string }) {
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
    <span ref={box} className={`relative flex flex-col ${className}`}>
      <span className="sr-only">{text}</span>
      {lines(text).map((line) => (
        <span key={line} aria-hidden="true" className="relative block min-h-0 flex-1">
          {near ? <Draw text={line} /> : null}
        </span>
      ))}
    </span>
  );
}

/** a long name goes on two lines (TechText draws one), split at the space nearest the middle */
function lines(text: string) {
  if (text.length <= 16) return [text];
  const mid = text.length / 2;
  let at = -1;
  for (let i = 0; i < text.length; i++) if (text[i] === " " && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
  return at < 0 ? [text] : [text.slice(0, at), text.slice(at + 1)];
}

function Draw({ text }: { text: string }) {
  return (
    <span className="absolute inset-0">
        <TechText
          text={text}
          fontWeight={600}
          fontSize={150}
          reveal="letter"
          dashLength={4}
          dashGap={2}
          specks={15}
          intro="assemble"
          introDuration={1.6}
          clickKick
          guides={false}
          letterSpacing={-0.04}
          accentColor="#4cc97a"
          reach={200}
          softness={0.7}
          lineStyle="dashed"
          strokeWidth={1.5}
          speed={1}
          bounce={0.4}
          selection
          labels={false}
          color="currentColor"
          align="center"
          draggable
          sweep
          style={{ width: "100%", height: "100%" }}
        />
    </span>
  );
}
