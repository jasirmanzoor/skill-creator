"use client";

import { useEffect, useState } from "react";

/**
 * 24-hour dial with the live time in Riyadh. The full ring is drawn because MSG operates 24/7
 * (2026 profile); the hand marks "now".
 */
export default function OpsClock({ now, running, sub, lang }: { now: string; running: string; sub: string; lang: string }) {
  const [time, setTime] = useState<{ label: string; minutes: number } | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", {
      timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hour12: false,
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
    <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
      <svg viewBox="0 0 200 200" className="size-44 shrink-0" aria-hidden="true">
        <circle cx="100" cy="100" r="86" fill="none" stroke="#1f43e0" strokeWidth="3" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = ((i / 24) * 360 - 90) * (Math.PI / 180);
          const r1 = i % 6 === 0 ? 72 : 77;
          return <line key={i} x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)} x2={100 + 81 * Math.cos(a)} y2={100 + 81 * Math.sin(a)} stroke="#0c0e11" strokeOpacity={i % 6 === 0 ? 0.7 : 0.25} strokeWidth={i % 6 === 0 ? 2 : 1} />;
        })}
        {[0, 6, 12, 18].map((h) => {
          const a = ((h / 24) * 360 - 90) * (Math.PI / 180);
          return <text key={h} x={100 + 58 * Math.cos(a)} y={100 + 58 * Math.sin(a) + 4} textAnchor="middle" fontSize="11" fill="#585e67">{String(h).padStart(2, "0")}</text>;
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform 1s ease" }} opacity={time ? 1 : 0}>
          <line x1="100" y1="100" x2="100" y2="24" stroke="#0c0e11" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="24" r="4" fill="#1f43e0" />
        </g>
        <circle cx="100" cy="100" r="3.5" fill="#0c0e11" />
      </svg>
      <div>
        <p className="text-muted">{now}</p>
        <p className="num mt-1 font-display text-6xl font-semibold tracking-[-0.03em] text-ink" suppressHydrationWarning>
          {time?.label ?? "--:--"}
        </p>
        <p className="mt-2 flex items-center gap-2 text-ink">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-brand" />
          </span>
          {running}
        </p>
        <p className="mt-3 max-w-xs text-sm text-muted">{sub}</p>
      </div>
    </div>
  );
}
