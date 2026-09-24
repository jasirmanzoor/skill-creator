"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Counters that roll up in step with the network deploying on the map. */
export default function NetworkStats({ labels }: { labels: { couriers: string; vehicles: string; operations: string } }) {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setOn(true), reduced ? 0 : 700);
    return () => window.clearTimeout(id);
  }, [reduced]);
  const flow = { transformTiming: { duration: 1600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" } };
  return (
    <dl className="grid grid-cols-3 border-t border-line [&>*+*]:border-s [&>*+*]:border-line">
      {[
        { n: 1000, suffix: "+", l: labels.couriers },
        { n: 100, suffix: "+", l: labels.vehicles },
      ].map((s) => (
        <div key={s.l} className="px-5 py-4">
          <dd className="num font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl" dir="ltr">
            <NumberFlow value={on ? s.n : 0} suffix={s.suffix} format={{ useGrouping: true }} locales="en-US" {...flow} />
          </dd>
          <dt className="mt-0.5 text-sm text-muted">{s.l}</dt>
        </div>
      ))}
      <div className="px-5 py-4">
        <dd className="num font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">24/7</dd>
        <dt className="mt-0.5 text-sm text-muted">{labels.operations}</dt>
      </div>
    </dl>
  );
}
