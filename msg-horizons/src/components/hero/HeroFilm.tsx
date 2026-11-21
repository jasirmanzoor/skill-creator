"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const copy: Record<Locale, { on: string; off: string }> = {
  en: { on: "Turn the sound on", off: "Turn the sound off" },
  ar: { on: "تشغيل الصوت", off: "إيقاف الصوت" },
};

/**
 * MSG's brand film as the background of the whole site: fixed behind every section, playing muted and looping while
 * the page is open (browsers only allow sound after a tap), with one control, the sound, always within reach. Every
 * section scrolls over it. It rests while the tab is hidden, and visitors who ask for less motion see its poster frame.
 * Phones get the 720p cut, larger screens 1080p.
 */
export default function HeroFilm({ lang }: { lang: Locale }) {
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [sound, setSound] = useState(false);
  const c = copy[lang];

  // always playing behind the page; resting only while the tab is hidden
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduce) { v.pause(); return; }
    const sync = () => { if (document.hidden) v.pause(); else v.play().catch(() => {}); };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
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
    <>
    <div ref={wrap} aria-hidden="true" className="site-film pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-navy">
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
    </div>
    {/* the one control, fixed so it is always within reach */}
    <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? c.off : c.on}
        title={sound ? c.off : c.on}
        className="fixed bottom-5 end-5 z-50 grid size-11 place-items-center rounded-[3px] bg-[#111b36]/80 text-white ring-1 ring-white/25 transition-colors hover:bg-[#111b36] max-lg:bottom-[9.5rem] lg:bottom-24"
      >
        {sound ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="m17 9 5 6M22 9l-5 6" /></svg>
        )}
    </button>
    </>
  );
}
