"use client";

import { useCallback, useEffect, useRef } from "react";

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

type Props = {
  src: string;
  alt?: string;
  mediaPosition?: string;
  title?: React.ReactNode;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  /** the frame's starting size on phones, where the desktop proportions are too narrow to read */
  mobileStart?: [number, number];
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  enabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * A framed photo that opens up to the whole screen as the page scrolls, then hands the stage to its content, after
 * React Bits' ScrollExpand (window-scroll mode). The stage holds while the frame's clip grows from a rounded card to
 * full bleed and the photo settles from its zoom; the title lifts away and the content arrives once the frame is
 * open. One requestAnimationFrame loop eases toward the scroll position; no React renders while scrolling. The
 * content stays in the HTML, and is inert until it shows.
 */
export default function ScrollExpand({
  src,
  alt = "",
  mediaPosition = "50% 50%",
  title,
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  mobileStart = [84, 46],
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  enabled = true,
  className = "",
  children,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const props = useRef({ startWidth, startHeight, mobileStart, startRadius, endRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, enabled });
  useEffect(() => {
    props.current = { startWidth, startHeight, mobileStart, startRadius, endRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, enabled };
  });

  const apply = useCallback((p: number) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = props.current;
    const phone = window.innerWidth < 640;
    const sw = phone ? c.mobileStart[0] : c.startWidth;
    const sh = phone ? c.mobileStart[1] : c.startHeight;
    const e = smoothstep(0, 1, p);
    const w = sw + (100 - sw) * e;
    const h = sh + (100 - sh) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;
    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;
    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
      titleRef.current.style.visibility = out > 0.99 ? "hidden" : "";
    }
    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }
    if (overlayRef.current) {
      const inn = smoothstep(0.68, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      overlayRef.current.toggleAttribute("inert", inn < 0.5);
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      const c = props.current;
      stageH = window.innerHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;
    };
    const read = () => {
      const c = props.current;
      if (!c.enabled || reduce) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      return clamp(-track.getBoundingClientRect().top / span, 0, 1);
    };
    const tick = () => {
      const c = props.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      apply(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      target = read();
      if (props.current.smoothing <= 0 || reduce) {
        current = target;
        apply(current);
        return;
      }
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      target = read();
      current = target;
      apply(current);
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [apply]);

  return (
    <div className={`scroll-expand ${className}`}>
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- transformed every frame; next/image adds nothing here */}
            <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} decoding="async" style={{ objectPosition: mediaPosition }} />
            <div className="scroll-expand__shade" />
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
