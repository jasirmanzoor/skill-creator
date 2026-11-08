import type { Locale } from "@/content/i18n";
import { facts } from "@/content/facts";
import { LICENCES, licenceCopy } from "@/content/licences";
import { CheckIcon } from "../ui/icons";

/**
 * The art that fills each panel of Why MSG. On your own: a tangle of broken routes and dead ends (no words). With
 * MSG: a glass card with the service that answers it and what it brings, drawn in the panel's own colour; the licence
 * panel shows MSG's registrations from facts.ts. Everything is in currentColor, so it sits on any panel.
 */

const kit: Record<Locale, { title: string; items: string[] }[]> = {
  en: [
    { title: "Your plan, with one MSG team", items: ["Who you are", "What you move", "Your numbers", "What matters"] },
    { title: "Warehousing & Inventory", items: ["Stored on our racks", "Picked and packed", "Dispatched the same day"] },
    { title: "Shipping & Last-Mile Delivery", items: ["Our own vans and drivers", "City streets to remote villages", "Tracked live to the door"] },
    { title: "Cash on delivery, on time", items: ["Collected at the door", "Reconciled and paid to you", "Returns handled and tracked"] },
    { title: "", items: [] }, // the licences
    { title: "Manpower & Peak Support", items: [`${facts.metrics.couriers.display} couriers`, "Sourced, screened, trained", "Scaled up for every peak"] },
  ],
  ar: [
    { title: "خطتك مع فريق واحد من ام اس جي", items: ["من أنت", "ماذا تنقل", "أرقامك", "ما يهمك"] },
    { title: "التخزين وإدارة المخزون", items: ["مخزّن على رفوفنا", "يُجهَّز ويُغلَّف", "يُشحن في اليوم نفسه"] },
    { title: "الشحن وتوصيل الميل الأخير", items: ["مركباتنا ومناديبنا", "من شوارع المدن إلى القرى النائية", "تتبّع مباشر حتى الباب"] },
    { title: "الدفع عند الاستلام في موعده", items: ["يُحصَّل عند الباب", "يُطابق ويُحوَّل إليك", "المرتجعات مُدارة ومتتبَّعة"] },
    { title: "", items: [] },
    { title: "القوى العاملة ودعم المواسم", items: [`${facts.metrics.couriers.display} مندوب`, "استقطاب وفحص وتدريب", "جاهزية لكل موسم ذروة"] },
  ],
};

/** on your own: routes that break off, cross back and end in question marks */
export function OwnArt({ i }: { i: number }) {
  const r = (k: number) => ((i * 37 + k * 53) % 100) / 100; // a fixed shuffle per panel
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" className="w-full max-w-[26rem] text-[#e5735c] lg:max-w-[36rem]">
      {[0, 1, 2, 3].map((k) => {
        const y = 30 + k * 45, x2 = 120 + r(k) * 150;
        return (
          <g key={k} opacity={0.85 - k * 0.12}>
            <path d={`M10 ${y} C ${60 + r(k + 1) * 40} ${y - 40}, ${100 + r(k + 2) * 60} ${y + 50}, ${x2} ${y + (r(k + 3) - 0.5) * 30}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 6" strokeLinecap="round" />
            <g transform={`translate(${x2 + 8} ${y + (r(k + 3) - 0.5) * 30})`}>
              {k % 2 ? (
                <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <text x="0" y="6" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">?</text>
              )}
            </g>
          </g>
        );
      })}
      <circle cx="10" cy="30" r="4" fill="currentColor" />
      <circle cx="10" cy="75" r="4" fill="currentColor" opacity="0.7" />
      <circle cx="10" cy="120" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="10" cy="165" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/** a small picture on top of each service card: the plan's steps, a rack filling, a route, the cash path, the crew */
function Picture({ i }: { i: number }) {
  if (i === 1)
    return (
      <div aria-hidden="true" className="grid grid-cols-6 gap-1">
        {Array.from({ length: 18 }, (_, k) => (
          <span key={k} className={`h-3 rounded-[3px] bg-current ${[2, 7, 11, 16].includes(k) ? "opacity-20" : k % 5 === 3 ? "opacity-90" : "opacity-55"}`} />
        ))}
      </div>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 240 46" aria-hidden="true" className="w-full">
        <path d="M8 34 C 60 4, 110 44, 160 18 S 220 16, 232 12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" opacity="0.7" />
        {[8, 84, 160, 232].map((x, k) => <circle key={x} cx={x} cy={[34, 26, 18, 12][k]} r={k === 3 ? 5 : 3.5} fill="currentColor" />)}
        <rect x="112" y="18" width="22" height="13" rx="3" fill="currentColor" />
      </svg>
    );
  if (i === 3)
    return (
      <div aria-hidden="true" className="flex items-center gap-2 text-[11px] font-semibold">
        {["COD", "MSG", "✓"].map((t, k) => (
          <span key={t} className="contents">
            {k ? <span className="h-px flex-1 bg-current opacity-50" /> : null}
            <span className="grid size-9 place-items-center rounded-full ring-1 ring-current/50">{t}</span>
          </span>
        ))}
      </div>
    );
  if (i === 5)
    return (
      <div aria-hidden="true" className="flex -space-x-2 rtl:space-x-reverse">
        {Array.from({ length: 7 }, (_, k) => (
          <span key={k} className="grid size-8 place-items-center rounded-full bg-current ring-2 ring-[color:var(--panel-bg)]" style={{ opacity: 0.45 + k * 0.07 }}>
            <svg viewBox="0 0 24 24" className="size-4 text-[color:var(--panel-bg)]" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 4.5-7 8-7s7 2 8 7z" /></svg>
          </span>
        ))}
      </div>
    );
  return (
    <div aria-hidden="true" className="flex gap-1.5">
      {[0, 1, 2, 3].map((k) => <span key={k} className="h-1.5 flex-1 rounded-full bg-current" style={{ opacity: 0.4 + k * 0.17 }} />)}
    </div>
  );
}

export function WinArt({ i, lang, bg }: { i: number; lang: Locale; bg: string }) {
  if (i === 4) {
    const lc = licenceCopy[lang];
    return (
      <div className="w-full max-w-[26rem] space-y-2 lg:max-w-[34rem] lg:space-y-3">
        {LICENCES.map((l, k) => {
          const it = lc.items[l.id];
          return (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-current/[0.08] p-3 ring-1 ring-current/25 backdrop-blur-sm lg:gap-4 lg:p-4" style={{ transform: `translateX(${(lang === "ar" ? -1 : 1) * k * 10}px)` }}>
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-current/15">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-tight sm:text-sm lg:text-base">{it.name}</span>
                <span className="block truncate text-[11px] opacity-75">{it.issuer}</span>
              </span>
              <span className="shrink-0 text-end">
                <span className="num block font-mono text-[11px] font-semibold" dir="ltr">{l.number}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold opacity-80"><CheckIcon className="size-3" />{lc.active}</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  const k = kit[lang][i];
  return (
    <div className="w-full max-w-[22rem] rounded-3xl bg-current/[0.08] p-4 ring-1 ring-current/25 backdrop-blur-sm sm:p-5 lg:max-w-[30rem] lg:p-7" style={{ ["--panel-bg" as string]: bg }}>
      <Picture i={i} />
      <p className="mt-4 text-sm font-semibold sm:text-base lg:mt-6 lg:text-xl">{k.title}</p>
      <ul className="mt-2 space-y-1.5">
        {k.items.map((t) => (
          <li key={t} className="flex items-center gap-2 text-[13px] opacity-90 sm:text-sm lg:gap-3 lg:text-base">
            <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center rounded-full bg-current/20"><CheckIcon className="size-2.5" /></span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
