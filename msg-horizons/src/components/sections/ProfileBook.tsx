/* eslint-disable @next/next/no-img-element -- pages of a book, drawn at a fixed design size and scaled as one; the photos are already sized for it */
"use client";

import { LICENCES, licenceCopy } from "@/content/licences";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { liveCopy } from "@/content/liveTracking";
import FolioFlow from "@/components/ui/FolioFlow";
import Logo from "@/components/ui/Logo";
import { ServiceIcon } from "@/components/ui/icons";

const copy: Record<Locale, {
  eyebrow: string; title: string; lead: string; hint: string; talk: string; open: string; deck: string; pdf: string;
  region: string; prev: string; next: string;
  cover: string; year: string; coverSub: string; who: string; hq: string; hqValue: string; legal: string; legalValue: string;
  cr: string; sector: string; sectorValue: string; hub: string; hubSub: string; fleet: string; fleetSub: string; team: string; teamSub: string;
  services: string; live: string; back: string; backSub: string;
}> = {
  en: {
    eyebrow: "Who we are",
    title: "Meet MSG Horizons.",
    lead: "MSG Horizons owns the vans, employs the drivers and runs the hub. Your stock is stored, delivered, tracked live and paid back by one accountable team, with the licences and compliance already in place.",
    hint: "Drag the pages, swipe sideways or use the arrows to leaf through.",
    talk: "Talk to MSG",
    open: "Open the full profile",
    deck: "Flip through the deck",
    pdf: "Download PDF",
    region: "MSG Horizons company profile",
    prev: "Previous pages",
    next: "Next pages",
    cover: "Who we are",
    year: "Company profile · 2026",
    coverSub: "Last-mile delivery and logistics · Riyadh",
    who: "Who we are",
    hq: "Headquarters",
    hqValue: "Riyadh, Kingdom of Saudi Arabia",
    legal: "Legal status",
    legalValue: "Limited Liability Company",
    cr: "Commercial registration",
    sector: "Sector",
    sectorValue: "Logistics & Integrated Solutions",
    hub: "Our Sabya hub",
    hubSub: "{n} m² of racks, sorting and dispatch, under one roof",
    fleet: "Our own fleet",
    fleetSub: "MSG-owned Toyota Hiace vans, driven by MSG's own drivers",
    team: "One accountable team",
    teamSub: "The people who store, sort and deliver your orders",
    services: "What we run",
    live: "The difference",
    back: "Let's move what matters.",
    backSub: "Talk to MSG on WhatsApp",
  },
  ar: {
    eyebrow: "من نحن",
    title: "تعرّف على ام اس جي هورايزونز.",
    lead: "ام اس جي هورايزونز تملك المركبات، ومناديبها من فريقها، وتدير مركزها بنفسها. مخزونك يُخزَّن ويُوصَّل ويُتتبَّع مباشرة وتعود أمواله إليك عبر فريق واحد مسؤول، مع التراخيص والامتثال جاهزة مسبقاً.",
    hint: "اسحب الصفحات أو مرّر جانبياً أو استخدم الأسهم للتصفّح.",
    talk: "تحدث مع ام اس جي",
    open: "افتح الملف التعريفي كاملًا",
    deck: "تصفّح الكتيّب",
    pdf: "تنزيل PDF",
    region: "الملف التعريفي لام اس جي هورايزونز",
    prev: "الصفحات السابقة",
    next: "الصفحات التالية",
    cover: "من نحن",
    year: "الملف التعريفي · 2026",
    coverSub: "التوصيل للميل الأخير والخدمات اللوجستية · الرياض",
    who: "من نحن",
    hq: "المقر الرئيسي",
    hqValue: "الرياض، المملكة العربية السعودية",
    legal: "الكيان القانوني",
    legalValue: "شركة ذات مسؤولية محدودة",
    cr: "السجل التجاري",
    sector: "القطاع",
    sectorValue: "الخدمات اللوجستية والحلول المتكاملة",
    hub: "مركزنا في صبيا",
    hubSub: "{n} م² من الأرفف والفرز والشحن، تحت سقف واحد",
    fleet: "أسطولنا الخاص",
    fleetSub: "شاحنات تويوتا هايس مملوكة لام اس جي، يقودها سائقو ام اس جي",
    team: "فريق واحد مسؤول",
    teamSub: "الفريق الذي يخزّن طلباتك ويفرزها ويوصلها",
    services: "ما نديره",
    live: "ما يميّزنا",
    back: "لننقل ما يهمك.",
    backSub: "تحدث مع ام اس جي على واتساب",
  },
};

/* the pages are designed at 420 x 560 and scaled as a whole by the book */
const PAGE = "relative h-[560px] w-[420px] overflow-hidden";
const label = "text-[11px] font-semibold uppercase tracking-[0.22em] rtl:tracking-normal";

function Folio({ n, dark = false }: { n: number; dark?: boolean }) {
  return <span className={`absolute bottom-7 end-8 text-[11px] font-semibold tabular-nums ${dark ? "text-white/50" : "text-[#8a93a6]"}`} dir="ltr">{String(n).padStart(2, "0")}</span>;
}

/** a full-bleed photograph page with its caption over a scrim */
function PhotoPage({ src, pos = "50% 50%", title, sub, n }: { src: string; pos?: string; title: string; sub: string; n: number }) {
  return (
    <div className={`${PAGE} bg-[#1c2c51]`}>
      <img src={src} alt="" draggable={false} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,19,38,0)_40%,rgba(11,19,38,0.86)_100%)]" />
      <div className="absolute inset-x-8 bottom-16 text-white">
        <p className="font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.02em] rtl:tracking-normal">{title}</p>
        <p className="mt-2 text-[14px] leading-snug text-white/80">{sub}</p>
      </div>
      <Folio n={n} dark />
    </div>
  );
}

/** a licence page: the certificate itself, with its name, issuer, number and dates */
function LicencePage({ id, k, total, lang, n }: { id: (typeof LICENCES)[number]["id"]; k: number; total: number; lang: "en" | "ar"; n: number }) {
  const lc = licenceCopy[lang];
  const l = LICENCES.find((x) => x.id === id)!;
  const it = lc.items[id];
  return (
    <div className={`${PAGE} flex flex-col bg-[#f8f9fb] p-9 text-[#111a33]`}>
      <span className={`${label} text-[#006bb6]`}>{lc.title} · <span dir="ltr">{k} / {total}</span></span>
      <span className="mt-3 font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] rtl:tracking-normal">{it.name}</span>
      <span className="mt-1 text-[13px] text-[#556079]">{it.issuer}</span>
      <div className="relative mt-5 flex-1 overflow-hidden rounded-2xl border border-[#e2e5ec] bg-white p-2 shadow-[0_20px_40px_-24px_rgba(17,26,51,0.45)]">
        <img src={`/media/licences/${id}.webp`} alt={it.name} draggable={false} loading="lazy" className="h-full w-full object-contain" />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div><dt className="text-[#8a93a6]">{lc.number}</dt><dd className="mt-0.5 font-semibold tabular-nums" dir="ltr">{l.number}</dd></div>
        <div><dt className="text-[#8a93a6]">{"validTo" in l ? lc.validTo : lc.issued}</dt><dd className="mt-0.5 font-semibold tabular-nums" dir="ltr">{"validTo" in l ? l.validTo : l.issued}</dd></div>
        <div><dt className="text-[#8a93a6]">&nbsp;</dt><dd className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#e5f3fe] px-2 py-0.5 font-semibold text-[#006bb6]">✓ {lc.active}</dd></div>
      </dl>
      <Folio n={n} />
    </div>
  );
}

/** a figure page: one number, set large, with what it counts */
function FigurePage({ value, what, d, n, tone = "paper" }: { value: string; what: string; d: string; n: number; tone?: "paper" | "navy" }) {
  const navy = tone === "navy";
  return (
    <div className={`${PAGE} flex flex-col justify-between p-9 ${navy ? "bg-[#1c2c51] text-white" : "bg-[#f8f9fb] text-[#111a33]"}`}>
      <span className={`${label} ${navy ? "text-[#7fcbfb]" : "text-[#006bb6]"}`}>{d}</span>
      <span>
        <span className="block font-display text-[104px] font-semibold leading-[0.9] tracking-[-0.05em] rtl:tracking-normal" dir="ltr">{value}</span>
        <span className={`mt-5 block h-[3px] w-14 rounded-full ${navy ? "bg-[#009df8]" : "bg-[#009df8]"}`} />
        <span className="mt-5 block text-[20px] font-semibold leading-snug">{what}</span>
      </span>
      <Folio n={n} dark={navy} />
    </div>
  );
}

/**
 * Who MSG is, as a book (components/ui/FolioFlow, after Framer's Folio Flow): its pages turn around the spine while the
 * rest fan out in 3D on either side. The book opens on the brand cover, then who MSG is, the Sabya hub, the fleet, the
 * team and the figures, what MSG runs, live tracking, the partners and a back cover. Every figure and name comes from
 * facts.ts and the dictionaries; the photographs are MSG's own.
 */
export default function ProfileBook({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = copy[lang];
  const live = liveCopy[lang];
  const ar = lang === "ar";
  const [couriers, vehicles, ops, revenue] = t.proof.metrics;

  const pages: React.ReactNode[] = [
    // 1 · cover
    <div key="cover" className={`${PAGE} flex flex-col justify-between bg-[#1c2c51] p-9 text-white`}>
      <span aria-hidden="true" className="absolute -end-[22%] -top-[8%] h-[64%] w-[74%] bg-[#009df8] [clip-path:polygon(28%_0,62%_0,100%_100%)] rtl:-scale-x-100" />
      <span aria-hidden="true" className="absolute -bottom-[18%] -start-[20%] h-[48%] w-[64%] bg-[#009df8]/15 [clip-path:polygon(0_0,40%_0,100%_100%,60%_100%)] rtl:-scale-x-100" />
      <Logo inverted variant="stacked" height={58} className="relative" />
      <span className="relative">
        <span className={`${label} block text-[#7fcbfb]`}>{c.year}</span>
        <span className="mt-3 block font-display text-[52px] font-semibold leading-[0.98] tracking-[-0.03em] rtl:tracking-normal">{c.cover}</span>
        <span className="mt-3 block text-[14px] text-white/75">{c.coverSub}</span>
      </span>
    </div>,
    // 2 · who we are
    <div key="who" className={`${PAGE} flex flex-col bg-[#f8f9fb] p-9 text-[#111a33]`}>
      <span className={`${label} text-[#006bb6]`}>{c.who}</span>
      <p className="mt-6 font-display text-[29px] font-semibold leading-[1.12] tracking-[-0.02em] text-balance rtl:tracking-normal">{ar ? "حلول لوجستية متكاملة رائدة في المملكة العربية السعودية" : facts.tagline}</p>
      <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#e2e5ec] pt-6 text-[13px]">
        {[[c.hq, c.hqValue], [c.legal, c.legalValue], [c.cr, facts.corporate.commercialRegistration], [c.sector, c.sectorValue]].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[#8a93a6]">{k}</dt>
            <dd className="mt-1 font-semibold leading-snug" dir={/^\d+$/.test(v) ? "ltr" : undefined}>{v}</dd>
          </div>
        ))}
      </dl>
      <Folio n={2} />
    </div>,
    // 3 · the hub
    <PhotoPage key="hub" src="/media/msg/hub-aerial.webp" title={c.hub} sub={c.hubSub.replace("{n}", facts.sabyaHub.areaM2.toLocaleString("en-US"))} n={3} />,
    // 4 · couriers
    <FigurePage key="couriers" value={couriers.value} what={couriers.label} d={couriers.d} n={4} />,
    // 5 · the fleet
    <PhotoPage key="fleet" src="/media/photos/fleet-depot.webp" pos="60% 55%" title={c.fleet} sub={c.fleetSub} n={5} />,
    // 6 · vehicles
    <FigurePage key="vehicles" value={vehicles.value} what={vehicles.label} d={vehicles.d} n={6} tone="navy" />,
    // 7 · the team
    <PhotoPage key="team" src="/media/msg/hub-team.webp" pos="60% 55%" title={c.team} sub={c.teamSub} n={7} />,
    // 8 · around the clock, and the revenue
    <div key="ops" className={`${PAGE} grid grid-rows-2 bg-[#f8f9fb] text-[#111a33]`}>
      {[ops, revenue].map((m, i) => (
        <div key={m.label} className={`flex flex-col justify-center px-9 ${i ? "border-t border-[#e2e5ec]" : ""}`}>
          <span className={`${label} text-[#006bb6]`}>{m.d}</span>
          <span className="mt-3 block font-display text-[64px] font-semibold leading-none tracking-[-0.04em] rtl:tracking-normal" dir={ar ? "rtl" : "ltr"}>{m.value}</span>
          <span className="mt-2 block text-[16px] font-semibold">{m.label}</span>
        </div>
      ))}
      <Folio n={8} />
    </div>,
    // 9 · what MSG runs
    <div key="services" className={`${PAGE} flex flex-col bg-[#f8f9fb] p-9 text-[#111a33]`}>
      <span className={`${label} text-[#006bb6]`}>{c.services}</span>
      <ul className="mt-6 grid gap-3">
        {facts.services.map((id) => (
          <li key={id} className="flex items-center gap-3 border-b border-[#e2e5ec] pb-3 text-[14.5px] font-semibold last:border-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e5f3fe] text-[#006bb6] [&_svg]:size-[18px]"><ServiceIcon id={id} /></span>
            {t.planner.services[id].name}
          </li>
        ))}
      </ul>
      <Folio n={9} />
    </div>,
    // 10 · live tracking, MSG's difference
    <div key="live" className={`${PAGE} flex flex-col bg-[#1c2c51] p-9 text-white`}>
      <span className={`${label} text-[#7fcbfb]`}>{c.live}</span>
      <p className="mt-5 font-display text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] rtl:tracking-normal">{live.title}</p>
      <ol className="mt-auto grid gap-4">
        {live.steps.map((s, i) => (
          <li key={s.t} className="flex gap-3">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold ${i === 2 ? "bg-[#009df8] text-white" : "bg-white/12 text-white ring-1 ring-white/25"}`}>{i + 1}</span>
            <span>
              <span className="block text-[14.5px] font-semibold leading-snug">{s.t}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-white/65">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>
      <Folio n={10} dark />
    </div>,
    // 11 · partners
    <div key="partners" className={`${PAGE} flex flex-col bg-[#f8f9fb] p-9 text-[#111a33]`}>
      <span className={`${label} text-[#006bb6]`}>{t.proof.partnersTitle}</span>
      <ul className="mt-8 grid grid-cols-2 gap-3" dir="ltr">
        {facts.partners.map((p) => (
          <li key={p} className="grid h-[68px] place-items-center rounded-2xl border border-[#e2e5ec] bg-white text-[17px] font-bold tracking-tight text-[#1c2c51]">{p}</li>
        ))}
      </ul>
      <Folio n={11} />
    </div>,
    // 12–14 · the licences, one to a page
    ...LICENCES.map((l, k) => <LicencePage key={`lic-${l.id}`} id={l.id} k={k + 1} total={LICENCES.length} lang={lang} n={12 + k} />),
    // back cover
    <div key="back" className={`${PAGE} flex flex-col justify-end bg-[#1c2c51] p-9 text-white`}>
      <span aria-hidden="true" className="absolute -start-[30%] -top-[10%] h-[70%] w-[82%] bg-[#009df8]/90 [clip-path:polygon(0_0,40%_0,100%_100%)] rtl:-scale-x-100" />
      <Logo inverted variant="mark" height={46} className="relative mb-auto" />
      <span className="relative font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.02em] rtl:tracking-normal">{c.back}</span>
      <span className="relative mt-4 text-[14px] text-white/75">{c.backSub}</span>
      <span className="relative mt-1 text-[18px] font-semibold tabular-nums" dir="ltr">{facts.contact.phoneDisplay}</span>
      <span className="relative mt-5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7fcbfb]" dir="ltr">www.msg-horizons.com</span>
    </div>,
  ];

  return (
    <section id="profile" aria-labelledby="profile-title" className="relative isolate overflow-hidden bg-deep text-white" data-theme="dark">
      {/* the brand's light, falling on the table the book lies on */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_68%_48%,rgba(0,157,248,0.20)_0%,rgba(28,44,81,0)_60%),radial-gradient(40%_40%_at_10%_90%,rgba(127,203,251,0.10)_0%,rgba(28,44,81,0)_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1.3px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_70%_at_60%_50%,#000,transparent)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-36 pt-24 lg:min-h-[100svh] lg:grid-cols-[0.66fr_1.34fr] lg:gap-2 lg:px-8 lg:pb-28">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{c.eyebrow}</p>
          <h2 id="profile-title" className="h-display mt-3 text-white">{c.title}</h2>
          <p className="mt-6 text-lg text-white/80 text-pretty">{c.lead}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {[couriers, vehicles, ops].map((m) => (
              <div key={m.label}>
                <dt className="text-xs text-white/70">{m.label}</dt>
                <dd className="num mt-1 font-display text-2xl font-semibold sm:text-3xl" dir="ltr">{m.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-deep transition-transform hover:-translate-y-0.5">{c.talk}</a>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10">{t.nav.whatsapp}</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
            <a href={`/${lang}/company-profile`} className="inline-flex items-center gap-2 text-brand-mint underline-offset-4 hover:underline">{c.open} <span aria-hidden="true" className="rtl:-scale-x-100">→</span></a>
            <a href={`/${lang}/company-profile/deck`} className="text-white/80 underline-offset-4 hover:text-white hover:underline">{c.deck}</a>
            <a href={`/media/profile/MSG-Horizons-Company-Profile-${lang.toUpperCase()}.pdf`} download className="text-white/80 underline-offset-4 hover:text-white hover:underline">{c.pdf}</a>
          </div>
        </div>
        <div>
          <div className="h-[min(64svh,560px)] min-h-[420px] w-full lg:h-[min(82svh,740px)]">
            <FolioFlow pages={pages} labels={{ region: c.region, prev: c.prev, next: c.next }} startPage={1} bookSize={98} fanStep={50} visible={4} />
          </div>
          <p className="mt-2 text-center text-xs text-white/55">{c.hint}</p>
        </div>
      </div>
    </section>
  );
}
