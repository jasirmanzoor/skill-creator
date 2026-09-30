"use client";

import { motion } from "motion/react";
import { roadmapCopy, type Segment } from "@/content/roadmap";
import type { Locale } from "@/content/i18n";

const GROUPS: { key: "individual" | "business"; ids: Segment[] }[] = [
  { key: "individual", ids: ["offline", "social", "neighborhood"] },
  { key: "business", ids: ["enterprise", "sme", "aggregator"] },
];

/** "Who are you?" — two glass columns, six profiles; the selection glow morphs between chips (shared layout). */
export default function SegmentGateway({ lang, value, onChange }: { lang: Locale; value: Segment | null; onChange: (s: Segment) => void }) {
  const g = roadmapCopy[lang].gate;
  return (
    <div className="glass rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-xl font-semibold text-white sm:text-2xl">{g.hook}</p>
        <p className="text-sm text-white/60">{g.pick}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {GROUPS.map((grp) => (
          <fieldset key={grp.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4cc97a] rtl:tracking-normal">{g[grp.key]}</legend>
            <div role="radiogroup" aria-label={g[grp.key]} className="grid gap-2">
              {grp.ids.map((id) => {
                const on = value === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onChange(id)}
                    className="group relative flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-start transition-colors hover:bg-white/[0.06]"
                  >
                    {on ? (
                      <motion.span
                        layoutId="segment-glow"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-xl border border-[#4cc97a]/50 bg-[#0f9641]/20 shadow-[0_0_30px_-6px_rgba(76,201,122,0.55)]"
                      />
                    ) : null}
                    <span className="relative">
                      <span className="block font-medium text-white">{g.segments[id].t}</span>
                      <span className="block text-sm text-white/55">{g.segments[id].d}</span>
                    </span>
                    <span aria-hidden="true" className={`relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${on ? "border-[#4cc97a] bg-[#4cc97a]" : "border-white/30"}`}>
                      {on ? <span className="size-2 rounded-full bg-[#04110a]" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
