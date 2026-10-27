"use client";

import { useEffect, useRef } from "react";
import type { ProfileCopy } from "@/content/profile";
import { clamp, onFrame, pinProgress, range } from "./engine";

/**
 * Who MSG is, then a day at the hub as a reel of stills, after the template's mission log: the section pins and the
 * reel slides sideways with the scroll; the still nearest the focus line is sharp, the rest dim back, and each
 * photograph drifts against its frame. Right-to-left in Arabic.
 */

const SECTION_VH = 360;

export default function DayReel({ c, rtl }: { c: ProfileCopy; rtl: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const n = c.day.cards.length;

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, 0.04, 0.96);
      const dir = rtl ? 1 : -1;
      // offsetLeft is the untransformed layout position, so this stays stable while the track moves
      const travel = rtl
        ? Math.max(0, vw * 0.06 + track.scrollWidth - (track.offsetLeft + track.offsetWidth))
        : Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${dir * k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      const focus = rtl ? 0.38 : 0.62;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * focus) / vw;
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        imgRefs.current[i].style.transform = `translate3d(${off * -60}px, 0, 0) scale(1.15)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = `0${nearest + 1}`;
    });
  }, [rtl]);

  return (
    <section ref={rootRef} id="day" aria-labelledby="day-title" className="relative bg-[#05070c]" style={{ height: `${SECTION_VH}svh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:justify-start md:pt-0">
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:flex md:w-[34vw] md:flex-col md:justify-center md:self-stretch md:bg-[#05070c] md:pe-10 md:ps-[6vw]">
          {/* the reel slides under this column: a short fade at its edge */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -end-20 hidden w-20 bg-gradient-to-r from-[#05070c] to-transparent md:block rtl:bg-gradient-to-l" />
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.day.eyebrow}</p>
          <h2 id="day-title" className="pf-display mt-4 text-white md:!text-[clamp(1.75rem,2.9vw,3.1rem)]">{c.day.heading}</h2>
          <p className="mt-5 max-w-[27rem] text-[clamp(0.9375rem,1.05vw,1.0625rem)] leading-relaxed text-white/70 max-md:hidden">{c.day.body}</p>
          <div className="mt-8 flex items-center gap-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/60 max-md:hidden" aria-hidden="true">
            <span dir="ltr">
              <span ref={countRef} className="text-white">01</span> / 0{n}
            </span>
            <span className="relative h-px w-32 bg-white/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-[#009df8] rtl:origin-right" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>

        <ol ref={trackRef} className="mt-8 flex gap-5 ps-4 will-change-transform sm:ps-6 md:mt-0 md:gap-7 md:ps-0">
          {c.day.cards.map((entry, i) => (
            <li
              key={entry.tag}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="w-[70vw] shrink-0 origin-bottom sm:w-[44vw] md:w-[clamp(16rem,23vw,22rem)]"
            >
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-[#0b1326]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- transformed every frame */}
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={entry.image}
                    alt={`${entry.title}: ${entry.body}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover will-change-transform"
                    style={{ objectPosition: entry.pos }}
                  />
                  <span className="absolute start-3 top-3 rounded-[3px] bg-[#05070c]/70 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white backdrop-blur rtl:tracking-normal">
                    {entry.tag}
                  </span>
                </div>
                <figcaption className="mt-4 flex gap-4">
                  <span className="font-mono text-[0.6875rem] text-[#7fcbfb]" dir="ltr">0{i + 1}</span>
                  <span>
                    <span className="block font-display text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-white rtl:tracking-normal">{entry.title}</span>
                    <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-white/65">{entry.body}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
