"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Counters roll up when the panel comes into view, in step with the map deploying. */
export default function NetworkStats({ labels }: { labels: { couriers: string; vehicles: string; operations: string } }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDListElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { window.setTimeout(() => setOn(true), reduced ? 0 : 150); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  const flow = { transformTiming: { duration: 1200, easing: "cubic-bezier(0.16, 1, 0.3, 1)" } };
  const rows = [
    { n: 1000, suffix: "+", l: labels.couriers },
    { n: 100, suffix: "+", l: labels.vehicles },
  ];
  return (
    <dl ref={ref} className="flex flex-1 flex-col divide-y divide-line">
      {rows.map((s) => (
        <div key={s.l} className="flex flex-1 items-center justify-between gap-4 px-6 py-5">
          <dt className="text-muted">{s.l}</dt>
          <dd className="num font-display text-4xl font-semibold tracking-tight text-ink" dir="ltr">
            <NumberFlow value={on ? s.n : 0} suffix={s.suffix} format={{ useGrouping: true }} locales="en-US" {...flow} />
          </dd>
        </div>
      ))}
      <div className="flex flex-1 items-center justify-between gap-4 px-6 py-5">
        <dt className="text-muted">{labels.operations}</dt>
        <dd className="num font-display text-4xl font-semibold tracking-tight text-ink">24/7</dd>
      </div>
    </dl>
  );
}
