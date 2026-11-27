/* eslint-disable @next/next/no-img-element -- the film's still frame, shown in place of the player on phones */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePhone } from "@/lib/perf";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { fit } from "@/lib/img";

/**
 * MSG's brand film (the one behind the opening) as a quiet back layer: dimmed navy, muted, looping, and playing only
 * while it is on screen. Visitors who ask for less motion get its first frame. Used behind each chapter's opener so
 * the whole preface carries the opening's theme; the sections themselves are untouched.
 *
 * On a phone the player itself exists only while its opener is on screen: off screen it is the still first frame, so
 * the phone holds one video decoder at a time instead of nine (each costs graphics memory a phone tab can't spare).
 */
export default function ReelBackdrop({ dim = 0.35 }: { dim?: number }) {
  const v = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const phone = usePhone();
  const [near, setNear] = useState(false);
  // phone: mount the player only near the screen
  useEffect(() => {
    const el = box.current;
    if (!el || !phone) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "50px" });
    io.observe(el);
    return () => io.disconnect();
  }, [phone]);
  const live = !phone || near;
  useEffect(() => {
    const el = v.current;
    if (!el || reduce || !live) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => { io.disconnect(); el.pause(); };
  }, [reduce, live]);
  return (
    <div ref={box} aria-hidden="true" className="absolute inset-0 overflow-hidden bg-deep">
      {live ? <video ref={v} className="absolute inset-0 size-full object-cover" poster="/media/reel/reel-poster.jpg" muted loop playsInline preload="none" disablePictureInPicture>
        <source src="/media/reel/reel-720.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/media/reel/reel-1080.mp4" type="video/mp4" />
      </video> : <img src="/media/reel/reel-poster.jpg" {...fit("/media/reel/reel-poster.jpg", "100vw")} alt="" className="absolute inset-0 size-full object-cover" decoding="async" loading="lazy" />}
      <span className="absolute inset-0" style={{ background: `rgba(11,19,38,${dim})` }} />
    </div>
  );
}
