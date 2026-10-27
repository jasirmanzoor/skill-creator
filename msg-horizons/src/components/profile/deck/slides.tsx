"use client";

/* eslint-disable @next/next/no-img-element -- slides are a fixed 1920 × 1080 canvas; every image is already sized for it */
import { useEffect, useRef } from "react";
import { PARTNER_LOGOS, type ProfileCopy } from "@/content/profile";
import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";
import { CITY_XY, KSA, KSA_DOTS, KH, KW } from "@/lib/ksaGeo";
import { ServiceIcon } from "@/components/ui/icons";
import { Skyline, Sun } from "../Dawn";

/**
 * The deck's slides: MSG's company profile as ten 1920 × 1080 pages, curated from the same copy as the one-page
 * profile (content/profile.ts) and the site's dictionaries. Every element marked `data-in` arrives when its slide
 * lands (staggered by its --i); the route draws itself and the figures count up. In print every slide is shown as
 * it ends.
 */

export type SlideProps = { c: ProfileCopy; t: Dictionary; lang: string; active: boolean };

const ink = "#05070c";
const In = ({ i, className = "", children, as: Tag = "div", style }: { i: number; className?: string; children: React.ReactNode; as?: "div" | "p" | "h2" | "h3" | "li" | "span"; style?: React.CSSProperties }) => (
  <Tag data-in="" className={className} style={{ ["--i" as string]: i, ...style }}>
    {children}
  </Tag>
);

const Eyebrow = ({ i, children, tone = "#7fcbfb" }: { i: number; children: React.ReactNode; tone?: string }) => (
  <In i={i} as="p" className="font-mono text-[18px] uppercase tracking-[0.2em] rtl:tracking-normal" style={{ color: tone }}>
    {children}
  </In>
);

/** a number that counts up the first time its slide lands */
function Count({ value, prefix = "", suffix = "", text, active }: { value: number; prefix?: string; suffix?: string; text?: string; active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => (el.textContent = text ?? `${prefix}${value.toLocaleString("en-US")}${suffix}`);
    if (!active || text || document.documentElement.hasAttribute("data-print")) return void done();
    let raf = 0;
    const t0 = performance.now() + 350;
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1400));
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = k >= 1 && text ? text : `${prefix}${Math.round(value * e).toLocaleString("en-US")}${suffix}`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, value, prefix, suffix, text]);
  return <span ref={ref}>{text ?? `${prefix}${value.toLocaleString("en-US")}${suffix}`}</span>;
}

const Folio = ({ n, c }: { n: number; c: ProfileCopy }) => (
  <div className="absolute inset-x-[96px] bottom-[54px] flex items-center justify-between font-mono text-[15px] uppercase tracking-[0.18em] text-white/40 rtl:tracking-normal">
    <span className="flex items-center gap-3">
      <img src="/brand/msg-mark-white.svg" alt="" className="h-[18px] w-auto opacity-70" />
      {c.meta.title}
    </span>
    <span dir="ltr">{String(n).padStart(2, "0")} / 10</span>
  </div>
);

/* 1 · Cover */
function Cover({ c, lang }: SlideProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: ink }}>
      <img src="/media/profile/sky.webp" alt="" className="absolute inset-x-0 top-[-16%] h-[104%] w-full object-cover object-bottom" />
      <div className="absolute inset-0"><Sun /></div>
      <div className="absolute inset-0"><Skyline /></div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.55)_0%,rgba(5,7,12,0)_35%,rgba(5,7,12,0)_62%,rgba(5,7,12,0.92)_100%)]" />
      <In i={0} className="absolute start-[96px] top-[80px]"><img src="/brand/msg-logo-white.svg" alt="MSG Horizons Logistics" className="h-[54px] w-auto" /></In>
      <In i={1} as="p" className="absolute end-[96px] top-[96px] font-mono text-[18px] uppercase tracking-[0.2em] text-white/80 rtl:tracking-normal">{c.meta.title} · 2026</In>
      <div className="absolute inset-x-0 top-[250px] text-center" dir="ltr">
        <In i={2} as="h2" className="dk-title font-display text-[200px] font-semibold leading-none text-white [text-shadow:0_8px_60px_rgb(20_10_0/0.45)]">{c.hero.title}</In>
        <In i={3} as="p" className="mt-8 font-mono text-[22px] uppercase tracking-[0.22em] text-white/85" >
          <span dir={lang === "ar" ? "rtl" : "ltr"}>{c.hero.kicker}</span>
        </In>
      </div>
      <In i={4} className="absolute inset-x-[96px] bottom-[70px] flex items-end justify-between font-mono text-[17px] uppercase tracking-[0.18em] text-white/70 rtl:tracking-normal">
        <span>{c.hero.site}</span>
        <span dir="ltr">{c.web}</span>
      </In>
    </div>
  );
}

/* 2 · Who we are */
function Who({ c }: SlideProps) {
  const stats = c.scale.metrics.slice(0, 3);
  return (
    <div className="absolute inset-0 grid grid-cols-[1.05fr_0.95fr]" style={{ background: ink }}>
      <div className="flex flex-col justify-center ps-[96px] pe-[80px]">
        <Eyebrow i={0}>{c.day.eyebrow}</Eyebrow>
        <In i={1} as="h2" className="mt-7 font-display text-[80px] font-semibold leading-[1.04] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{c.day.heading}</In>
        <In i={2} as="p" className="mt-9 max-w-[760px] text-[28px] leading-[1.55] text-white/70">{c.day.body}</In>
        <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/15 pt-9">
          {stats.map((m, k) => (
            <In key={m.label} i={3 + k}>
              <div className="font-display text-[64px] font-semibold leading-none text-white tabular-nums" dir="ltr">{m.text ?? `${m.prefix ?? ""}${m.value.toLocaleString("en-US")}${m.suffix}`}</div>
              <div className="mt-3 text-[20px] text-white/60">{m.label}</div>
            </In>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden">
        <In i={1} className="dk-reveal-img absolute inset-0">
          <img src="/media/msg/hub-open.webp" alt="" className="size-full object-cover" style={{ objectPosition: "50% 55%" }} />
        </In>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070c_0%,rgba(5,7,12,0)_30%)] rtl:bg-[linear-gradient(270deg,#05070c_0%,rgba(5,7,12,0)_30%)]" />
      </div>
    </div>
  );
}

/* 3 · A day at the hub */
function Day({ c }: SlideProps) {
  return (
    <div className="absolute inset-0 px-[96px] pt-[100px]" style={{ background: ink }}>
      <Eyebrow i={0}>{c.nav[0].label}</Eyebrow>
      <In i={1} as="h2" className="mt-6 max-w-[1300px] font-display text-[66px] font-semibold leading-[1.06] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{c.day.cards.map((x) => x.tag).join(" · ")}</In>
      <ol className="mt-14 grid grid-cols-5 gap-6">
        {c.day.cards.map((x, k) => (
          <In key={x.tag} i={2 + k} as="li">
            <div className="relative h-[520px] overflow-hidden rounded-[10px] bg-[#0b1326]">
              <img src={x.image} alt="" className="size-full object-cover" style={{ objectPosition: x.pos }} />
              <span className="absolute start-4 top-4 rounded-[4px] bg-[#05070c]/70 px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.16em] text-white rtl:tracking-normal">{x.tag}</span>
            </div>
            <div className="mt-5 flex gap-4">
              <span className="font-mono text-[16px] text-[#7fcbfb]" dir="ltr">0{k + 1}</span>
              <span>
                <span className="block text-[24px] font-semibold text-white">{x.title}</span>
                <span className="mt-1.5 block text-[18px] leading-snug text-white/60">{x.body}</span>
              </span>
            </div>
          </In>
        ))}
      </ol>
      <Folio n={3} c={c} />
    </div>
  );
}

/* 4 · The network */
const R = CITY_XY.riyadh;
const S = CITY_XY.sabya;
const REACH = Math.sqrt(facts.sabyaHub.coverageKm2 / Math.PI) / 2.22;
const OUTLINE = `M${KSA.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
const ROUTE = `M${R.x} ${R.y} C ${R.x + 60} ${R.y + 170}, ${S.x + 150} ${S.y - 210}, ${S.x} ${S.y}`;
function Network({ c, active }: SlideProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-[1.1fr_0.9fr]" style={{ background: ink }}>
      <div className="relative">
        <svg viewBox={`-40 -20 ${KW + 80} ${KH + 40}`} className="absolute inset-[70px] h-[calc(100%-140px)] w-[calc(100%-140px)]" aria-hidden="true">
          <defs>
            <clipPath id="dk-ksa"><path d={OUTLINE} /></clipPath>
            <radialGradient id="dk-reach"><stop offset="0" stopColor="#009df8" stopOpacity="0.6" /><stop offset="1" stopColor="#009df8" stopOpacity="0.05" /></radialGradient>
          </defs>
          <path d={OUTLINE} fill="#0b1326" stroke="#7fcbfb" strokeOpacity="0.35" strokeWidth="1.5" />
          <g fill="#c9d6ea" clipPath="url(#dk-ksa)">
            {KSA_DOTS.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r="1.7" opacity={0.12 + ((k * 37) % 40) / 200} />)}
          </g>
          <circle cx={S.x} cy={S.y} r={REACH} fill="url(#dk-reach)" clipPath="url(#dk-ksa)" className="dk-grow" style={{ transformOrigin: `${S.x}px ${S.y}px` }} />
          <path d={ROUTE} fill="none" stroke="#009df8" strokeWidth="3" strokeLinecap="round" pathLength={1} className="dk-draw" />
          {[R, S].map((p, k) => (
            <g key={k}>
              <circle cx={p.x} cy={p.y} r="22" fill="#7fcbfb" opacity="0.25" />
              <circle cx={p.x} cy={p.y} r="7" fill="#fff" />
            </g>
          ))}
          <g fontFamily="var(--font-pf-mono), ui-monospace, monospace" fontSize="20" fill="#9fb0c9" textAnchor="middle">
            <text x={R.x} y={R.y + 50}>{c.network.riyadh}</text>
            <text x={S.x + 95} y={S.y + 8}>{c.network.sabya}</text>
          </g>
        </svg>
      </div>
      <div className="flex flex-col justify-center pe-[96px]">
        <Eyebrow i={0}>{c.network.eyebrow}</Eyebrow>
        <In i={1} as="h2" className="mt-6 font-display text-[60px] font-semibold leading-[1.08] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{c.network.deckHeading}</In>
        <ol className="mt-12 space-y-7">
          {c.network.legs.map((l, k) => (
            <In key={l.title} i={2 + k} as="li" className="grid grid-cols-[56px_1fr] gap-4">
              <span className="font-mono text-[18px] text-[#7fcbfb]" dir="ltr">0{k + 1}</span>
              <span>
                <span className="block text-[26px] font-semibold text-white">{l.title}</span>
                <span className="mt-1 block text-[20px] leading-snug text-white/60">{l.body}</span>
              </span>
            </In>
          ))}
        </ol>
        <In i={6} className="mt-12 border-t border-white/15 pt-7">
          <div className="font-display text-[72px] font-semibold leading-none text-white tabular-nums" dir="ltr">
            <Count value={facts.sabyaHub.coverageKm2} active={active} /> <span className="text-[34px] text-white/60">{c.network.counterUnit}</span>
          </div>
          <div className="mt-3 font-mono text-[16px] uppercase tracking-[0.18em] text-white/50 rtl:tracking-normal">{c.network.counterLabel}</div>
        </In>
      </div>
    </div>
  );
}

/* 5 · Seven services */
function Services({ c, t }: SlideProps) {
  return (
    <div className="absolute inset-0 px-[96px] pt-[100px]" style={{ background: ink }}>
      <Eyebrow i={0}>{c.paths.servicesTitle}</Eyebrow>
      <In i={1} as="h2" className="mt-6 max-w-[1400px] font-display text-[66px] font-semibold leading-[1.06] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{t.services.title}</In>
      <ul className="mt-14 grid grid-cols-4 gap-6">
        {c.services.map((s, k) => (
          <In key={s.id} i={2 + k} as="li" className={`rounded-[12px] bg-[#0b1326] p-8 ring-1 ring-white/10 ${k === 0 ? "col-span-2 bg-[linear-gradient(135deg,#0d2a4d,#0b1326)] ring-[#009df8]/50" : ""}`}>
            <span className="grid size-[64px] place-items-center rounded-[10px] bg-white/[0.06] text-[#7fcbfb] ring-1 ring-white/10 [&_svg]:size-[30px]"><ServiceIcon id={s.id} /></span>
            <span className="mt-7 block text-[28px] font-semibold leading-tight text-white">{s.name}</span>
            <span className="mt-3 block text-[19px] leading-snug text-white/60">{t.planner.services[s.id].desc}</span>
          </In>
        ))}
      </ul>
      <Folio n={5} c={c} />
    </div>
  );
}

/* 6 · Three ways in */
function Ways({ c }: SlideProps) {
  return (
    <div className="absolute inset-0 px-[96px] pt-[100px]" style={{ background: ink }}>
      <Eyebrow i={0}>{c.paths.eyebrow}</Eyebrow>
      <In i={1} as="h2" className="mt-6 max-w-[1300px] font-display text-[66px] font-semibold leading-[1.06] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{c.paths.heading}</In>
      <ol className="mt-16 grid grid-cols-3 gap-7">
        {c.paths.items.map((m, k) => (
          <In key={m.name} i={2 + k} as="li" className={`relative overflow-hidden rounded-[12px] p-10 ring-1 ${m.featured ? "bg-[#0b1326] ring-[#009df8]/60 shadow-[0_40px_100px_-40px_rgb(0_157_248/0.5)]" : "bg-[#0b1326]/60 ring-white/10"}`}>
            <p className="font-mono text-[15px] uppercase tracking-[0.16em] text-white/55 rtl:tracking-normal">{m.who}</p>
            <h3 className="mt-6 font-display text-[64px] font-semibold leading-none text-white">{m.name}</h3>
            <ul className="mt-9 space-y-4 border-t border-white/10 pt-8">
              {m.lines.map((l) => (
                <li key={l} className="flex gap-4 text-[22px] text-white/80">
                  <span className="mt-3 size-2 shrink-0 rounded-full bg-[#009df8]" />
                  {l}
                </li>
              ))}
            </ul>
          </In>
        ))}
      </ol>
      <Folio n={6} c={c} />
    </div>
  );
}

/* 7 · People and peaks */
function People({ c, t }: SlideProps) {
  const w = t.enterprise.workforce;
  const pk = t.enterprise.peak;
  const steps = (items: { t: string; d: string }[], from: number, tone: string) => (
    <ol className="mt-7 flex gap-3">
      {items.map((s, k) => (
        <In key={s.t} i={from + k} as="li" className="dk-chev flex-1 rounded-[8px] bg-[#0b1326] px-7 py-6 ring-1 ring-white/10">
          <span className="font-mono text-[15px]" style={{ color: tone }} dir="ltr">0{k + 1}</span>
          <span className="mt-2 block text-[26px] font-semibold text-white">{s.t}</span>
          <span className="mt-1 block text-[18px] leading-snug text-white/55">{s.d}</span>
        </In>
      ))}
    </ol>
  );
  return (
    <div className="absolute inset-0 px-[96px] pt-[96px]" style={{ background: ink }}>
      <Eyebrow i={0}>{t.enterprise.eyebrow}</Eyebrow>
      <In i={1} as="h2" className="mt-6 max-w-[1400px] font-display text-[62px] font-semibold leading-[1.06] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{t.enterprise.title}</In>
      <In i={2} as="h3" className="mt-12 text-[28px] font-semibold text-white">{w.title}</In>
      {steps([...facts.workforceStages.map((k) => w.stages[k]), w.site], 3, "#7fcbfb")}
      <In i={9} as="h3" className="mt-12 text-[28px] font-semibold text-white">{pk.title}</In>
      {steps(facts.peakStages.map((k) => pk.stages[k]), 10, "#ffc777")}
      <In i={15} className="mt-9 flex flex-wrap gap-3">
        {w.roles.map((r) => <span key={r} className="rounded-full bg-white/[0.05] px-5 py-2 text-[18px] text-white/75 ring-1 ring-white/10">{r}</span>)}
      </In>
      <Folio n={7} c={c} />
    </div>
  );
}

/* 8 · Scale */
function Scale({ c, active }: SlideProps) {
  return (
    <div className="absolute inset-0 px-[96px] pt-[100px]" style={{ background: `radial-gradient(60% 70% at 50% 0%, rgba(0,157,248,0.18), transparent 70%), ${ink}` }}>
      <Eyebrow i={0}>{c.scale.eyebrow}</Eyebrow>
      <In i={1} as="h2" className="mt-6 font-display text-[72px] font-semibold leading-[1.05] tracking-[-0.02em] text-white rtl:leading-[1.3] rtl:tracking-normal">{c.scale.heading}</In>
      <dl className="mt-16 grid grid-cols-4 gap-px overflow-hidden rounded-[12px] bg-white/10 ring-1 ring-white/10">
        {c.scale.metrics.map((m, k) => (
          <In key={m.label} i={2 + k} className="bg-[#05070c] p-10">
            <dd className={`font-display font-semibold leading-none tracking-[-0.03em] text-white tabular-nums ${(m.prefix ?? "").length + m.suffix.length > 5 ? "text-[84px]" : "text-[110px]"}`} dir="ltr">
              {/* a long unit (Arabic "million riyals") sits on its own line under the figure */}
              <Count value={m.value} prefix={m.prefix} suffix={m.suffix.length > 3 ? "" : m.suffix} text={m.text} active={active} />
              {m.suffix.length > 3 ? <span className="mt-3 block text-[40px] tracking-normal text-white/80" dir="auto">{m.suffix.trim()}</span> : null}
            </dd>
            <dt className="mt-6 text-[24px] font-medium text-white">{m.label}</dt>
            <dd className="mt-1 font-mono text-[15px] uppercase tracking-[0.16em] text-white/45 rtl:tracking-normal">{m.d}</dd>
          </In>
        ))}
      </dl>
      <In i={6} as="p" className="mt-16 font-mono text-[16px] uppercase tracking-[0.18em] text-white/50 rtl:tracking-normal">{c.scale.partners}</In>
      <ul className="mt-6 flex gap-9" dir="ltr">
        {PARTNER_LOGOS.map((p, k) => (
          <In key={p.name} i={7 + k} as="li" className="flex flex-col items-center gap-3">
            {p.src ? <img src={p.src} alt={p.name} className="size-[104px] rounded-[26px] object-cover ring-1 ring-white/10" /> : <span className="grid size-[104px] place-items-center rounded-[26px] bg-[#fff] text-[17px] font-bold uppercase text-[#1c2c51]">{p.name}</span>}
            <span className="font-mono text-[14px] uppercase tracking-[0.14em] text-white/50">{p.name}</span>
          </In>
        ))}
      </ul>
      <Folio n={8} c={c} />
    </div>
  );
}

/* 9 · Vision */
function Vision({ c }: SlideProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: ink }}>
      <img src="/media/profile/sky.webp" alt="" className="absolute inset-0 size-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.85),rgba(5,7,12,0.35)_45%,rgba(5,7,12,0.9))]" />
      <div className="absolute inset-x-[160px] top-1/2 -translate-y-1/2 text-center">
        <Eyebrow i={0} tone="#ffc777">{c.scale.visionTitle}</Eyebrow>
        <In i={1} as="p" className="mx-auto mt-10 max-w-[1500px] font-display text-[64px] font-medium leading-[1.22] text-white rtl:leading-[1.5]">“{c.scale.vision}”</In>
        <In i={2} as="p" className="mt-12 font-mono text-[18px] uppercase tracking-[0.2em] text-white/70 rtl:tracking-normal">{c.scale.vision2030}</In>
      </div>
      <Folio n={9} c={c} />
    </div>
  );
}

/* 10 · Back cover */
function Back({ c, lang }: SlideProps) {
  const ar = lang === "ar";
  const rows = [
    { label: ar ? "واتساب" : "WhatsApp", value: facts.contact.phoneDisplay, ltr: true },
    { label: ar ? "البريد الإلكتروني" : "Email", value: facts.contact.email, ltr: true },
    { label: ar ? "الموقع" : "Web", value: c.web, ltr: true },
    ...c.contact.corporate,
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#0b1326" }}>
      <span aria-hidden="true" className="absolute -end-[160px] -top-[120px] h-[760px] w-[900px] bg-[#009df8] [clip-path:polygon(28%_0,62%_0,100%_100%)] rtl:-scale-x-100" />
      <div className="absolute inset-0 grid grid-cols-[1.1fr_0.9fr] px-[96px] py-[100px]">
        <div className="flex flex-col">
          <In i={0}><img src="/brand/msg-logo-stacked-white.svg" alt="MSG Horizons Logistics" className="h-[150px] w-auto" /></In>
          <In i={1} as="h2" className="mt-auto font-display text-[110px] font-semibold leading-[1] tracking-[-0.03em] text-white rtl:leading-[1.25] rtl:tracking-normal">{c.contact.heading}</In>
          <In i={2} as="p" className="mt-8 max-w-[820px] text-[28px] leading-[1.5] text-white/75">{c.contact.body}</In>
        </div>
        <dl className="relative mt-auto grid gap-7 self-end rounded-[14px] bg-[#05070c]/80 p-11 ring-1 ring-white/10 backdrop-blur">
          {rows.map((r, k) => (
            <In key={r.label} i={3 + k}>
              <dt className="font-mono text-[15px] uppercase tracking-[0.16em] text-white/45 rtl:tracking-normal">{r.label}</dt>
              <dd className="mt-1.5 text-[26px] text-white" dir={r.ltr ? "ltr" : undefined}>{r.value}</dd>
            </In>
          ))}
        </dl>
      </div>
    </div>
  );
}

export const SLIDES = [Cover, Who, Day, Network, Services, Ways, People, Scale, Vision, Back];
