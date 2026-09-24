"use client";

import { useEffect, useState } from "react";

/**
 * 24-hour operations dial showing the live time in Riyadh.
 * Every hour segment is lit, because MSG operates 24/7 (source: 2026 profile).
 */
export default function OpsClock({ now, running, sub, lang }: { now: string; running: string; sub: string; lang: string }) {
  const [time, setTime] = useState<{ label: string; minutes: number } | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "numeric", minute: "numeric", hour12: false });
    const tick = () => {
      const d = new Date();
      const [h, m] = parts.format(d).split(":").map(Number);
      setTime({ label: fmt.format(d), minutes: (h % 24) * 60 + m });
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [lang]);

  const angle = time ? (time.minutes / 1440) * 360 : 0;
  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <svg viewBox="0 0 220 220" className="size-52 shrink-0" aria-hidden="true">
        <circle cx="110" cy="110" r="96" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = ((i / 24) * 360 - 90) * (Math.PI / 180);
          const a2 = (((i + 0.82) / 24) * 360 - 90) * (Math.PI / 180);
          const r = 96;
          const d = `M ${110 + r * Math.cos(a)} ${110 + r * Math.sin(a)} A ${r} ${r} 0 0 1 ${110 + r * Math.cos(a2)} ${110 + r * Math.sin(a2)}`;
          return <path key={i} d={d} stroke="#f6a623" strokeOpacity={0.35 + 0.65 * (i % 2 === 0 ? 1 : 0.7)} strokeWidth="16" fill="none" />;
        })}
        {[0, 6, 12, 18].map((h) => {
          const a = ((h / 24) * 360 - 90) * (Math.PI / 180);
          return (
            <text key={h} x={110 + 66 * Math.cos(a)} y={110 + 66 * Math.sin(a) + 4} textAnchor="middle" className="fill-fog font-mono text-[11px]">
              {String(h).padStart(2, "0")}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "110px 110px", transition: "transform 1s ease" }} opacity={time ? 1 : 0}>
          <line x1="110" y1="110" x2="110" y2="22" stroke="#4fe3c1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="110" cy="22" r="5" fill="#4fe3c1" />
        </g>
        <circle cx="110" cy="110" r="5" fill="#fff" />
      </svg>
      <div>
        <p className="text-fog">{now}</p>
        <p className="num mt-1 font-display text-6xl font-semibold tracking-tight text-white" suppressHydrationWarning>
          {time?.label ?? "--:--"}
        </p>
        <p className="mt-2 flex items-center gap-2 text-mist">
          <span className="relative inline-flex size-2.5">
            <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
          </span>
          {running}
        </p>
        <p className="mt-3 max-w-xs text-sm text-fog">{sub}</p>
      </div>
    </div>
  );
}
