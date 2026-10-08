"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { roadmapCopy, SEGMENT_ORDERS, type Segment } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const ORDER: { id: Segment; group: "individual" | "business" }[] = [
  { id: "offline", group: "individual" },
  { id: "social", group: "individual" },
  { id: "neighborhood", group: "individual" },
  { id: "enterprise", group: "business" },
  { id: "sme", group: "business" },
  { id: "aggregator", group: "business" },
];
const PHOTO: Record<Segment, [string, string]> = {
  offline: ["/photos/clean/courier-mall.webp", "35% 50%"],
  social: ["/photos/msg/warehouse-floor.webp", "50% 55%"],
  neighborhood: ["/photos/clean/riyadh-night.webp", "50% 60%"],
  enterprise: ["/photos/msg/warehouse-front.webp", "50% 40%"],
  sme: ["/photos/clean/fleet-car.webp", "50% 65%"],
  aggregator: ["/photos/clean/team.webp", "50% 100%"],
};

/**
 * "Who are you?": six profile tiles, each with MSG photography dissolved into the glass. Tiles lean
 * toward the pointer; choosing one opens a profile strip that personalises the roadmap below and
 * offers the guided walk-through.
 */
export default function SegmentGateway({
  lang, value, onChange, onWalk,
}: { lang: Locale; value: Segment | null; onChange: (s: Segment) => void; onWalk?: () => void }) {
  const g = roadmapCopy[lang].gate;
  const reduce = useReducedMotion();
  return (
    <div className="sea-glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-xl font-semibold text-teal-deep sm:text-2xl">{g.hook}</p>
        <p className="text-sm text-teal-deep/75">{g.pick}</p>
      </div>
      <div role="radiogroup" aria-label={g.pick} className="mt-6 space-y-5">
        {(["individual", "business"] as const).map((grp) => (
          <div key={grp}>
            <p className="mb-2.5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-teal rtl:tracking-normal">
              {g[grp]}
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-brand-bright/40 to-transparent rtl:bg-gradient-to-l" />
            </p>
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {ORDER.filter((o) => o.group === grp).map(({ id }) => (
                <Tile key={id} id={id} t={g.segments[id].t} d={g.segments[id].d} on={value === id} dim={value !== null && value !== id} onPick={() => onChange(id)} reduce={reduce} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {value ? (
          <motion.div
            key="profile"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-brand-bright/30 bg-brand/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-sm text-teal-deep/80">{g.selected}</p>
                <p className="mt-0.5 font-display text-xl font-semibold text-teal-deep">{g.segments[value].t}</p>
                <p className="mt-1 text-sm text-teal-deep/80">
                  {g.typical.replace("{n}", SEGMENT_ORDERS[value].toLocaleString("en-US"))} {g.change}
                </p>
              </div>
              {onWalk ? (
                <button type="button" onClick={onWalk} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-6px_rgba(76,201,122,0.9)] hover:bg-[#12a84b]">
                  <svg viewBox="0 0 12 12" className="size-3 rtl:-scale-x-100" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor" /></svg>
                  {g.walk}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Tile({ id, t, d, on, dim, onPick, reduce }: { id: Segment; t: string; d: string; on: boolean; dim: boolean; onPick: () => void; reduce: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    ref.current!.style.setProperty("--rx", "0deg");
    ref.current!.style.setProperty("--ry", "0deg");
  };
  const [src, pos] = PHOTO[id];
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`seg-tile group relative aspect-[4/3] w-[68%] shrink-0 snap-start overflow-hidden sm:w-auto rounded-2xl text-start shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition-[box-shadow,filter] duration-500 sm:aspect-[16/10] ${on ? "ring-[3px] ring-brand-bright shadow-[0_0_0_6px_rgba(76,201,122,0.18),0_24px_50px_-20px_rgba(76,201,122,0.55)]" : "ring-1 ring-white/15 hover:ring-white/40"} ${dim ? "saturate-[0.55] brightness-90 hover:saturate-100 hover:brightness-100" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- MSG's own photography */}
      <img src={src} alt="" loading="lazy" decoding="async" style={{ objectPosition: pos }} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(240px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,0.18),transparent_60%)]" />
      <span aria-hidden="true" className={`absolute end-3 top-3 inline-flex size-7 items-center justify-center rounded-full transition-ui duration-300 ${on ? "scale-100 bg-brand-bright text-[#04110a] shadow-[0_0_20px_rgba(76,201,122,0.8)]" : "scale-90 border-2 border-white/80 bg-black/25 backdrop-blur"}`}>
        {on ? <svg viewBox="0 0 12 12" className="size-3.5"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
      </span>
      <span className="absolute inset-x-0 bottom-0 block p-3 sm:p-4 [transform:translateZ(24px)]">
        <span className="block font-display text-[15px] font-semibold leading-snug text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-lg">{t}</span>
        <span className="mt-0.5 block text-xs text-white/85 sm:text-sm">{d}</span>
      </span>
    </button>
  );
}
