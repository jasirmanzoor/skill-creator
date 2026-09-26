"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useState } from "react";

type Stage = { t: string; d: string };

/** Source → Screen → Onboard → Train → On site, as a clean stepper; a marker travels the line. */
export default function WorkforcePipeline({ stages, site }: { stages: Stage[]; site: Stage }) {
  const all = [...stages, site];
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="relative hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute inset-x-[10%] top-1/2 h-px bg-white/15" />
        {!reduce ? (
          <motion.span
            className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-brand-bright shadow-[0_0_12px_rgba(142,162,255,0.8)]"
            animate={{ left: ["10%", "90%"] }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          />
        ) : null}
        {all.map((_, i) => (
          <span
            key={i}
            className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors rtl:translate-x-1/2 ${
              i === active ? "border-brand-bright bg-brand-bright" : "border-white/40 bg-ink"
            }`}
            style={{ insetInlineStart: `${10 + i * 20}%` }}
          />
        ))}
      </div>
      <ol className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-5">
        {all.map((s, i) => (
          <li key={s.t}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`h-full w-full p-5 text-start transition-colors ${i === active ? "bg-white/[0.08]" : "bg-ink-2/90 hover:bg-white/[0.05]"}`}
            >
              <span className={`num text-sm ${i === active ? "text-white" : "text-brand-bright"}`}>{i < 4 ? `0${i + 1}` : "→"}</span>
              <span className="mt-2 block font-semibold text-white">{s.t}</span>
              <span className="mt-1 block text-sm text-white/65">{s.d}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
