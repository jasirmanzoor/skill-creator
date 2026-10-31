"use client";

import { motion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const copy: Record<Locale, { pause: string; play: string; soundOn: string; soundOff: string }> = {
  en: { pause: "Pause the film", play: "Play the film", soundOn: "Turn the sound on", soundOff: "Turn the sound off" },
  ar: { pause: "إيقاف الفيلم مؤقتاً", play: "تشغيل الفيلم", soundOn: "تشغيل الصوت", soundOff: "إيقاف الصوت" },
};

/**
 * The opening: MSG's 15-second brand film (reel/, rendered from code), full-bleed behind the promise. A parcel becomes
 * the MSG arrow becomes the network, and loops. Phones get the 720p cut, larger screens 1080p with its soundtrack (off
 * until asked). It plays only while it is the scene, rests on its first frame for visitors who ask for less motion,
 * and can always be paused. Scrolling on, the camera pushes into it (zoom, fx) on the way into the hub.
 */
export default function Reel({ zoom, fx, idle, lang }: { zoom?: MotionValue<number>; fx?: MotionValue<string>; idle?: boolean; lang: Locale }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const c = copy[lang];

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduce || paused || idle) v.pause();
    else v.play().catch(() => {});
  }, [reduce, paused, idle]);

  useEffect(() => {
    if (video.current) video.current.muted = !sound;
  }, [sound]);

  return (
    <>
      <motion.div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-deep" style={{ scale: zoom, filter: fx }}>
        <video
          ref={video}
          className="absolute inset-0 size-full object-cover"
          poster="/media/reel/reel-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
        >
          <source src="/media/reel/reel-720.mp4" type="video/mp4" media="(max-width: 900px)" />
          <source src="/media/reel/reel-1080.mp4" type="video/mp4" />
        </video>
        {/* the promise sits on the left and low: the film is dimmed there (and all over on phones) so the words read */}
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,19,38,0.9)_0%,rgba(11,19,38,0.76)_50%,rgba(11,19,38,0.3)_80%,rgba(11,19,38,0.1)_100%)] max-sm:bg-[linear-gradient(180deg,rgba(11,19,38,0.55)_0%,rgba(11,19,38,0.82)_40%,rgba(11,19,38,0.92)_100%)]" />
      </motion.div>
      {reduce || idle ? null : (
        <div className="absolute end-4 top-20 z-[8] flex gap-2 sm:end-6 sm:top-24">
          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? c.play : c.pause} className="tap grid size-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-black/60">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">{paused ? <path d="M7 5l12 7-12 7z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}</svg>
          </button>
          <button type="button" onClick={() => setSound((s) => !s)} aria-label={sound ? c.soundOff : c.soundOn} aria-pressed={sound} className="tap hidden size-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-black/60 min-[901px]:grid">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
              {sound ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
