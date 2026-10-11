import type { experience, NeedId, NeedStage } from "@/content/experience";

/*
 * The pieces of one order's four stages (set up, store, deliver, settle), shown over the Kingdom map in the
 * hero: the glass card each stage carries, and the small animated icon beside each answer.
 */

export type NeedsCopy = (typeof experience)["en"]["needs"];

/** the glass card each stage carries over the map */
export function StageCard({ stage, c, guide }: { stage: NeedStage; c: NeedsCopy; guide: string[] }) {
  const shell = "rounded-2xl bg-white/92 p-4 text-teal-deep shadow-[0_20px_40px_-20px_rgba(11,58,64,0.7)] ring-1 ring-white/60 backdrop-blur sm:max-w-sm";
  const tick = (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal text-white">
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  if (stage === "setup" || stage === "settle") {
    const rows = stage === "setup" ? guide : c.cards.settleRows;
    return (
      <div className={shell}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal rtl:tracking-normal">{stage === "setup" ? c.cards.setup : c.cards.settle}</p>
        <ul className="mt-2.5 space-y-2">
          {rows.map((r) => <li key={r} className="flex items-center gap-2.5 text-sm font-medium">{tick}{r}</li>)}
        </ul>
      </div>
    );
  }
  if (stage === "store") {
    return (
      <div className={shell}>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal rtl:tracking-normal">{c.cards.store}</p>
        <div aria-hidden="true" className="mt-3 grid grid-cols-6 gap-1.5">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} className={`h-4 rounded-[4px] ${[2, 7, 11, 16].includes(i) ? "bg-sea-200" : i % 5 === 3 ? "bg-sand-500/80" : "bg-teal"}`} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={shell}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep text-white">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <p className="font-display text-base font-semibold">{c.pod}</p>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1">
        {c.track.map((t) => (
          <li key={t} className="text-center">
            <span className="block h-1.5 rounded-full bg-teal" />
            <span className="mt-1.5 block text-[10px] font-medium leading-tight text-teal-deep/75">{t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const B = "#a7f0e6";
export function NeedIcon({ id }: { id: NeedId }) {
  const common = { width: 34, height: 34, viewBox: "0 0 34 34", fill: "none", "aria-hidden": true } as const;
  switch (id) {
    case "cod": // coin drops into the wallet
      return (
        <svg {...common}>
          <rect x="5" y="14" width="24" height="15" rx="3" stroke="#fff" strokeWidth="1.8" />
          <path d="M23 21.5h6" stroke="#fff" strokeWidth="1.8" />
          <g className="nd-drop"><circle cx="17" cy="8" r="4.2" fill={B} /><path d="M17 6v4" stroke="#0b0d12" strokeWidth="1.4" /></g>
        </svg>
      );
    case "remittance": // money travels from MSG to the seller, on a cycle
      return (
        <svg {...common}>
          <rect x="3" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <rect x="22" y="11" width="9" height="12" rx="2" stroke="#fff" strokeWidth="1.6" />
          <path d="M12 17h10" stroke="rgba(255,255,255,.3)" strokeWidth="1.6" strokeDasharray="2 2.5" />
          <circle className="nd-slide" cx="12" cy="17" r="2.6" fill={B} />
        </svg>
      );
    case "packaging": // tape seals the box
      return (
        <svg {...common}>
          <path d="M5 12l12-5 12 5v14l-12 5-12-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M5 12l12 5 12-5M17 17v14" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path className="nd-tape" d="M11 9.5l12 5" stroke={B} strokeWidth="2.4" strokeLinecap="round" pathLength={1} />
        </svg>
      );
    case "storage": // shelves fill
      return (
        <svg {...common}>
          <path d="M5 29V6M29 29V6M5 13h24M5 21h24M5 29h24" stroke="#fff" strokeWidth="1.6" />
          <rect className="nd-pop" x="8" y="15" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "0s" }} />
          <rect className="nd-pop" x="16" y="15" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".35s" }} />
          <rect className="nd-pop" x="11" y="23" width="6" height="6" rx="1" fill="#fff" style={{ animationDelay: ".7s" }} />
          <rect className="nd-pop" x="19" y="23" width="6" height="6" rx="1" fill={B} style={{ animationDelay: "1.05s" }} />
        </svg>
      );
    case "returns": // the parcel comes back round
      return (
        <svg {...common}>
          <g className="nd-spin"><path d="M26 11a11 11 0 1 0 2 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /><path d="M27 5v7h-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></g>
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill={B} />
        </svg>
      );
    case "pod": // delivered: tick draws on the phone
      return (
        <svg {...common}>
          <rect x="9" y="3" width="16" height="28" rx="3" stroke="#fff" strokeWidth="1.6" />
          <path className="nd-tick" d="M12.5 17.5l3.2 3.2 6-6.5" stroke={B} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
      );
    case "overseas": // a route arcs in from abroad
      return (
        <svg {...common}>
          <circle cx="17" cy="17" r="12" stroke="rgba(255,255,255,.35)" strokeWidth="1.4" />
          <path d="M5 17h24M17 5c4 3.5 4 20.5 0 24M17 5c-4 3.5-4 20.5 0 24" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
          <path className="nd-arc" d="M6 11C12 3 24 5 26 20" stroke={B} strokeWidth="2" strokeLinecap="round" pathLength={1} />
          <circle cx="26" cy="21" r="2.6" fill="#fff" />
        </svg>
      );
    case "pickups": // three origins join one route
      return (
        <svg {...common}>
          <path d="M6 8c6 0 7 9 11 9M6 17h11M6 26c6 0 7-9 11-9M17 17h11" stroke="rgba(255,255,255,.4)" strokeWidth="1.6" />
          <path className="nd-flow" d="M6 8c6 0 7 9 11 9h11" stroke={B} strokeWidth="2" pathLength={1} />
          {[8, 17, 26].map((y) => <circle key={y} cx="6" cy={y} r="2.6" fill="#fff" />)}
          <circle cx="28" cy="17" r="3" fill={B} />
        </svg>
      );
    case "damages": // shield pulses, every scan logged
      return (
        <svg {...common}>
          <path className="nd-pulse" d="M17 4l10 4v8c0 7-4.5 11-10 14C11.5 27 7 23 7 16V8z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12.5 16.5l3 3 6-6" stroke={B} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
