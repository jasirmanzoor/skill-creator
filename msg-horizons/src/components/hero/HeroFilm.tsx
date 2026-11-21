"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const copy: Record<Locale, { on: string; off: string }> = {
  en: { on: "Turn the sound on", off: "Turn the sound off" },
  ar: { on: "تشغيل الصوت", off: "إيقاف الصوت" },
};

/**
 * MSG's brand film behind the hero: it plays muted and loops (browsers only allow sound after a tap), with one
 * control, the sound. It rests while the hero is off screen, so it costs nothing further down the page, and visitors
 * who ask for less motion see its poster frame. Phones get the 720p cut, larger screens 1080p.
 */
export default function HeroFilm({ lang }: { lang: Locale }) {
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [sound, setSound] = useState(false);
  const c = copy[lang];

  // AMBIENT: playing only while the hero is in view
  useEffect(() => {
    const v = video.current, el = wrap.current;
    if (!v || !el) return;
    if (reduce) { v.pause(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    const next = !sound;
    v.muted = !next;
    if (next) v.play().catch(() => {});
    setSound(next);
  };

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden bg-navy">
      <video
        ref={video}
        className="absolute inset-0 size-full object-cover"
        poster="/media/reel/reel-poster.jpg"
        muted
        loop
        playsInline
        autoPlay={!reduce}
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/media/reel/reel-720.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/media/reel/reel-1080.mp4" type="video/mp4" />
      </video>
      {/* the words always read: a navy scrim on the reading side and along the foot */}
      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,27,54,0.88)_0%,rgba(17,27,54,0.62)_42%,rgba(17,27,54,0.15)_75%)] rtl:bg-[linear-gradient(270deg,rgba(17,27,54,0.88)_0%,rgba(17,27,54,0.62)_42%,rgba(17,27,54,0.15)_75%)]" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(17,27,54,0.85)] to-transparent" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? c.off : c.on}
        title={sound ? c.off : c.on}
        className="absolute end-5 top-24 z-10 grid size-11 place-items-center rounded-[3px] bg-[#111b36]/70 text-white ring-1 ring-white/25 transition-colors hover:bg-[#111b36] sm:end-8 lg:end-10 lg:top-28"
      >
        {sound ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="m17 9 5 6M22 9l-5 6" /></svg>
        )}
      </button>
    </div>
  );
}
