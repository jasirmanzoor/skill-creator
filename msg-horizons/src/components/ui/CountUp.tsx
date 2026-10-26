"use client";

import NumberFlow from "@number-flow/react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A company figure arriving on screen ("1,000+", "100+", "SAR 20M+"), after Skiper UI's Skiper37 animated numbers
 * (skiper-ui.com, free version: attribution in the footer). Only the arrival is animated; the value is the one in
 * content/facts.ts and is what the HTML, screen readers and reduced-motion visitors get.
 *
 *  • roll (Skiper37 · 004): the digits roll up from zero with Number Flow each time the figure comes into view.
 *  • shuffle (Skiper37 · 003): the figure shuffles through rising numbers and lands on the real one; used once on the
 *    page, for revenue, so it stays a moment.
 *
 * Values with "/" (24/7) are left as they are.
 */
export default function CountUp({ value, className = "", mode }: { value: string; className?: string; mode?: "roll" | "shuffle" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.6 });
  const [live, setLive] = useState(false);
  const m = value.match(/\d[\d,.]*/);
  const target = m ? Number(m[0].replace(/,/g, "")) : NaN;
  const prefix = m ? value.slice(0, m.index) : "";
  const suffix = m ? value.slice((m.index ?? 0) + m[0].length) : "";
  const grouped = !!m && m[0].includes(",");
  const still = !m || value.includes("/") || Number.isNaN(target);
  const kind = mode ?? (/M\+?$/.test(value) ? "shuffle" : "roll");

  useEffect(() => {
    if (still || reduce) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the animated figure takes over after hydration
    setLive(true);
  }, [still, reduce]);

  if (still || !live) return <span ref={ref} className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" dir="ltr" className="inline-block">
        {kind === "shuffle" ? (
          <Shuffle target={target} prefix={prefix} suffix={suffix} grouped={grouped} go={inView} />
        ) : (
          <NumberFlow
            value={inView ? target : 0}
            prefix={prefix}
            suffix={suffix}
            locales="en-US"
            format={{ useGrouping: grouped }}
            transformTiming={{ duration: 1400, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
            spinTiming={{ duration: 1400, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}
          />
        )}
      </span>
    </span>
  );
}

const STEPS = 12;

function Shuffle({ target, prefix, suffix, grouped, go }: { target: number; prefix: string; suffix: string; grouped: boolean; go: boolean }) {
  const [shown, setShown] = useState(target);
  useEffect(() => {
    if (!go) return;
    let step = 0;
    const floor = target / 2;
    const id = window.setInterval(() => {
      step++;
      if (step > STEPS) {
        setShown(target);
        window.clearInterval(id);
        return;
      }
      // each step's floor rises toward the figure, so the shuffle closes in on it
      const min = floor + (step * (target - floor)) / STEPS;
      setShown(Math.floor(min + Math.random() * (target * 1.1 - min)));
    }, 80);
    return () => window.clearInterval(id);
  }, [go, target]);
  const text = grouped ? shown.toLocaleString("en-US") : String(shown);
  return <span className="tabular-nums">{prefix}{text}{suffix}</span>;
}
