"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * MSG's brand film (the one behind the opening) as a quiet back layer: dimmed navy, muted, looping, and playing only
 * while it is on screen. Visitors who ask for less motion get its first frame. Used behind each chapter's opener so
 * the whole preface carries the opening's theme; the sections themselves are untouched.
 */
export default function ReelBackdrop({ dim = 0.35 }: { dim?: number }) {
  const v = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = v.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-deep">
      <video ref={v} className="absolute inset-0 size-full object-cover" poster="/media/reel/reel-poster.jpg" muted loop playsInline preload="none" disablePictureInPicture>
        <source src="/media/reel/reel-720.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/media/reel/reel-1080.mp4" type="video/mp4" />
      </video>
      <span className="absolute inset-0" style={{ background: `rgba(11,19,38,${dim})` }} />
    </div>
  );
}
