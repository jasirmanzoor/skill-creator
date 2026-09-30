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
        <div className="absolute inset-x-[10%] top-1/2 h-px bg-teal/25" />
        {!reduce ? (
          <motion.span
            className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_12px_rgba(19,113,121,0.6)]"
            animate={{ left: ["10%", "90%"] }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          />
        ) : null}
        {all.map((_, i) => (
          <span
            key={i}
            className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors rtl:translate-x-1/2 ${
              i === active ? "border-teal bg-teal" : "border-teal/40 bg-white"
            }`}
            style={{ insetInlineStart: `${10 + i * 20}%` }}
          />
        ))}
      </div>
      <ol className="grid gap-px overflow-hidden rounded-lg border border-teal/15 bg-teal/10 sm:grid-cols-5">
        {all.map((s, i) => (
          <li key={s.t}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`h-full w-full p-5 text-start transition-colors ${i === active ? "bg-sea-100" : "bg-white/80 hover:bg-sea-50"}`}
            >
              <span className={`num text-sm ${i === active ? "text-teal-deep" : "text-teal"}`}>{i < 4 ? `0${i + 1}` : "→"}</span>
              <span className="mt-2 block font-semibold text-teal-deep">{s.t}</span>
              <span className="mt-1 block text-sm text-teal-deep/75">{s.d}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
