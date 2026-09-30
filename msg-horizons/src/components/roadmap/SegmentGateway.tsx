"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { roadmapCopy, SEGMENT_ORDERS, type Segment } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import EmbeddedPhoto from "../ui/EmbeddedPhoto";

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
  social: ["/photos/clean/doorstep.webp", "60% 40%"],
  neighborhood: ["/photos/clean/riyadh-night.webp", "50% 60%"],
  enterprise: ["/photos/clean/warehouse.webp", "50% 50%"],
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
    <div className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-xl font-semibold text-white sm:text-2xl">{g.hook}</p>
        <p className="text-sm text-white/65">{g.pick}</p>
      </div>
      <div role="radiogroup" aria-label={g.pick} className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {ORDER.map(({ id, group }) => (
          <Tile key={id} id={id} group={g[group]} t={g.segments[id].t} d={g.segments[id].d} on={value === id} dim={value !== null && value !== id} onPick={() => onChange(id)} reduce={reduce} />
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
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#4cc97a]/30 bg-[#0b7d36]/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-sm text-white/70">{g.selected}</p>
                <p className="mt-0.5 font-display text-xl font-semibold text-white">{g.segments[value].t}</p>
                <p className="mt-1 text-sm text-white/70">
                  {g.typical.replace("{n}", SEGMENT_ORDERS[value].toLocaleString("en-US"))} {g.change}
                </p>
              </div>
              {onWalk ? (
                <button type="button" onClick={onWalk} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0b7d36] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-6px_rgba(76,201,122,0.9)] hover:bg-[#12a84b]">
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

function Tile({ id, group, t, d, on, dim, onPick, reduce }: { id: Segment; group: string; t: string; d: string; on: boolean; dim: boolean; onPick: () => void; reduce: boolean }) {
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
      className={`seg-tile group relative min-h-[150px] overflow-hidden rounded-2xl text-start ring-1 transition-[box-shadow,opacity,transform] duration-500 sm:min-h-[180px] ${on ? "ring-2 ring-[#4cc97a] shadow-[0_0_40px_-6px_rgba(76,201,122,0.7)]" : "ring-white/10 hover:ring-white/25"} ${dim ? "opacity-60 hover:opacity-100" : ""}`}
    >
      <EmbeddedPhoto src={src} position={pos} tone="forest" fade="none" strength={on ? 0.9 : 0.55} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04110a] via-[#04110a]/45 to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(260px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(181,245,204,0.18),transparent_60%)]" />
      <span className="relative flex h-full flex-col justify-between p-4 [transform:translateZ(24px)]">
        <span className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8ee3ad] backdrop-blur rtl:tracking-normal">{group}</span>
          <span aria-hidden="true" className={`inline-flex size-6 items-center justify-center rounded-full border transition-colors ${on ? "border-[#4cc97a] bg-[#4cc97a] text-[#04110a]" : "border-white/40 bg-black/20"}`}>
            {on ? <svg viewBox="0 0 12 12" className="size-3"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
          </span>
        </span>
        <span className="mt-6 block">
          <span className="block font-display text-base font-semibold leading-snug text-white sm:text-lg">{t}</span>
          <span className="mt-0.5 block text-xs text-white/75 sm:text-sm">{d}</span>
        </span>
      </span>
    </button>
  );
}
