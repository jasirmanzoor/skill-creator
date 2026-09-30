/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp from MSG's company profile */
import { experience, type StageId } from "@/content/experience";
import type { Locale } from "@/content/i18n";

export const PHOTO: Record<StageId, string> = {
  enquiry: "/photos/business.webp",
  requirements: "/photos/office.webp",
  guide: "/photos/team.webp",
  recommendations: "/photos/warehouse.webp",
  agreement: "/photos/riyadh-night.webp",
  testing: "/photos/fleet-car.webp",
  live: "/photos/doorstep.webp",
};

/** MSG's own photography with a small, familiar app card that slides in when the stage is active. */
export function StageScene({ id, lang }: { id: StageId; lang: Locale }) {
  const u = experience[lang].journey.ui;
  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#0b0d12]">
      <img src={PHOTO[id]} alt="" loading="lazy" decoding="async" className="js-photo absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <div aria-hidden="true" className="js-ui absolute bottom-4 start-4 end-4 max-w-[17rem] rounded-xl bg-white/95 p-3 text-[13px] text-ink shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur">
        <UICard id={id} u={u} />
      </div>
    </div>
  );
}

const Tick = () => (
  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0b7d36] text-white">
    <svg viewBox="0 0 12 12" className="size-2.5"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

export function UICard({ id, u }: { id: StageId; u: (typeof experience)["en"]["journey"]["ui"] }) {
  switch (id) {
    case "enquiry":
      return (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#128c4a]"><span className="size-2 rounded-full bg-[#25d366]" />WhatsApp · {u.chatName}</p>
          <p className="ms-auto w-fit max-w-[90%] rounded-lg rounded-se-sm bg-[#dcf8c6] px-2.5 py-1.5">{u.chatMsg}</p>
          <p className="w-fit max-w-[90%] rounded-lg rounded-ss-sm bg-subtle px-2.5 py-1.5">{u.chatReply}</p>
        </div>
      );
    case "requirements":
      return (
        <div>
          <p className="text-[11px] font-semibold text-muted">{u.reqTitle}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {u.reqChips.map((c) => <span key={c} className="num rounded-full bg-brand-soft px-2 py-0.5 text-[12px] font-medium text-brand-strong">{c}</span>)}
          </div>
        </div>
      );
    case "guide":
      return (
        <div>
          <p className="text-[11px] font-semibold text-muted">{u.guideTitle}</p>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
            {u.guideItems.map((g) => <li key={g} className="flex items-center gap-1.5"><Tick />{g}</li>)}
          </ul>
        </div>
      );
    case "recommendations":
      return (
        <div>
          <p className="flex items-center justify-between text-[11px]"><span className="font-semibold text-muted">{u.planTag}</span><span className="font-semibold text-brand">{u.planName}</span></p>
          <dl className="mt-1.5 grid grid-cols-3 gap-2">
            {u.planStats.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-subtle px-2 py-1.5">
                <dt className="text-[10px] text-muted">{k}</dt>
                <dd className="num font-display text-lg font-semibold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "agreement":
      return (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted">{u.signTitle}</p>
            <svg viewBox="0 0 120 30" className="mt-0.5 h-7 w-28"><path className="js-sign" d="M4 22c8-14 14 8 22-4s10 10 18 0 9-8 16 2 12-12 20-4 10 6 18-2" fill="none" stroke="#0c2a8a" strokeWidth="2" strokeLinecap="round" pathLength={1} /></svg>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[12px] font-semibold text-brand-strong"><Tick />{u.signed}</span>
        </div>
      );
    case "testing":
      return (
        <div>
          <p className="flex items-center justify-between text-[11px]"><span className="font-semibold text-muted">{u.testTitle}</span><span className="num font-semibold text-brand">{u.testDone}</span></p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((k) => <span key={k} className="js-bar h-1.5 rounded-full bg-[#0b7d36]" style={{ animationDelay: `${0.2 + k * 0.35}s` }} />)}
          </div>
        </div>
      );
    case "live":
      return (
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0b7d36] text-white">
            <svg viewBox="0 0 20 20" className="size-5"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-semibold">{u.liveTitle}</p>
            <p className="text-[12px] text-muted">{u.liveBody}</p>
          </div>
          <span className="ms-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f9641]"><span className="js-live size-2 rounded-full bg-[#0b7d36]" />LIVE</span>
        </div>
      );
  }
}
