"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { experience, STAGE_IDS, type StageId } from "@/content/experience";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Enquiry → requirements → standard guide → recommendations → agreement → testing → go live.
 *
 * Desktop: the section pins and scroll drives a horizontal camera across seven stage cards while a
 * parcel travels the progress rail; each stage's scene plays as it becomes active.
 * Mobile / reduced motion: a vertical timeline where each scene plays as it scrolls into view.
 */
export default function Journey({ lang }: { lang: Locale }) {
  const c = experience[lang].journey;
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const rtl = lang === "ar";

  useIsoLayout(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.04, 0.92], [0, (rtl ? 1 : -1) * distance]);
  const rail = useTransform(scrollYProgress, [0.04, 0.92], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STAGE_IDS.length - 1, Math.max(0, Math.floor(((v - 0.04) / 0.88) * STAGE_IDS.length)));
    setActive(i);
  });

  const header = (
    <div className="max-w-3xl">
      <span className="label">{c.eyebrow}</span>
      <h2 id="journey-title" className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-white text-balance sm:text-5xl rtl:tracking-normal">
        {c.title}
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-white/65 text-pretty">{c.lead}</p>
    </div>
  );

  return (
    <section
      id="journey"
      ref={section}
      aria-labelledby="journey-title"
      data-theme="dark"
      className={`on-dark relative scroll-mt-16 bg-[#07090f] text-white ${reduce ? "" : "lg:h-[460vh]"}`}
    >
      {/* Desktop: pinned horizontal journey */}
      <div className={`sticky top-0 hidden h-[100svh] flex-col overflow-hidden ${reduce ? "" : "lg:flex"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-8 pt-24">{header}</div>

        <div className="relative mt-10 flex-1">
          <motion.div ref={track} style={{ x }} className="flex h-full items-start gap-6 px-8 will-change-transform">
            <div aria-hidden="true" className="w-[max(0px,calc((100vw-80rem)/2))] shrink-0" />
            {STAGE_IDS.map((id, i) => (
              <StageCard key={id} id={id} i={i} lang={lang} active={i === active} passed={i < active} />
            ))}
            <div className="flex w-[22rem] shrink-0 flex-col justify-center self-stretch pb-24">
              <TrackedLink
                href="#contact"
                event="cta_click"
                props={{ cta: "enquire", location: "journey" }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-medium text-ink transition-colors hover:bg-white/90"
              >
                {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
              </TrackedLink>
            </div>
          </motion.div>
        </div>

        {/* progress rail with a travelling parcel */}
        <div className="relative mx-auto w-full max-w-7xl px-8 pb-10">
          <div className="relative h-px bg-white/15">
            <motion.div style={{ width: rail }} className="absolute inset-y-0 start-0 bg-[#4cc97a]" />
            <motion.span style={{ insetInlineStart: rail }} className="absolute top-1/2 size-3 -translate-y-1/2 rounded-[3px] bg-white shadow-[0_0_16px_4px_rgba(76,201,122,0.6)] ltr:-translate-x-1/2 rtl:translate-x-1/2" />
          </div>
          <ol className="mt-4 grid grid-cols-7 gap-2 text-xs">
            {STAGE_IDS.map((id, i) => (
              <li key={id} className={`transition-colors duration-300 ${i === active ? "text-white" : i < active ? "text-white/55" : "text-white/35"}`}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>{" "}
                {c.stages[id].t}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Mobile + reduced motion: vertical timeline */}
      <div className={`relative mx-auto max-w-7xl px-5 py-24 ${reduce ? "" : "lg:hidden"}`}>
        {header}
        <ol className="relative mt-12 space-y-5 border-s border-white/15 ps-6">
          {STAGE_IDS.map((id, i) => (
            <InViewStage key={id} id={id} i={i} lang={lang} />
          ))}
        </ol>
        <TrackedLink
          href="#contact"
          event="cta_click"
          props={{ cta: "enquire", location: "journey" }}
          className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-medium text-ink"
        >
          {c.cta} <ArrowIcon className="size-4 rtl:rotate-180" />
        </TrackedLink>
      </div>
    </section>
  );
}

function StageCard({ id, i, lang, active, passed }: { id: StageId; i: number; lang: Locale; active: boolean; passed: boolean }) {
  const s = experience[lang].journey.stages[id];
  return (
    <article
      data-active={active || undefined}
      className={`journey-card relative w-[min(30rem,36vw)] shrink-0 overflow-hidden rounded-2xl border transition-all duration-500 ${
        active ? "border-[#4cc97a]/50 bg-white/[0.07] shadow-[0_30px_80px_-30px_rgba(76,201,122,0.45)]" : "border-white/10 bg-white/[0.03]"
      } ${active ? "scale-100 opacity-100" : passed ? "scale-[0.97] opacity-60" : "scale-[0.97] opacity-45"}`}
    >
      <StageScene id={id} lang={lang} />
      <div className="p-6">
        <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-[#4cc97a] rtl:tracking-normal">
          <span className="num text-white/50">{String(i + 1).padStart(2, "0")}</span>
          {s.tag}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-white rtl:tracking-normal">{s.t}</h3>
        <p className="mt-2 text-white/65">{s.d}</p>
      </div>
    </article>
  );
}

function InViewStage({ id, i, lang }: { id: StageId; i: number; lang: Locale }) {
  const s = experience[lang].journey.stages[id];
  const ref = useRef<HTMLLIElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} data-active={on || undefined} className="journey-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <span aria-hidden="true" className={`absolute -start-[1.95rem] top-6 size-3 rounded-full border-2 border-[#07090f] transition-colors ${on ? "bg-[#4cc97a]" : "bg-white/30"}`} />
      <StageScene id={id} lang={lang} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#4cc97a] rtl:tracking-normal">
          <span className="num me-2 text-white/50">{String(i + 1).padStart(2, "0")}</span>
          {s.tag}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-semibold text-white">{s.t}</h3>
        <p className="mt-1.5 text-white/65">{s.d}</p>
      </div>
    </li>
  );
}

const PHOTO: Record<StageId, string> = {
  enquiry: "/photos/business.webp",
  requirements: "/photos/office.webp",
  guide: "/photos/team.webp",
  recommendations: "/photos/warehouse.webp",
  agreement: "/photos/riyadh-night.webp",
  testing: "/photos/fleet-car.webp",
  live: "/photos/doorstep.webp",
};

/** MSG's own photography with a small, familiar app card that slides in when the stage is active. */
function StageScene({ id, lang }: { id: StageId; lang: Locale }) {
  const u = experience[lang].journey.ui;
  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#0b0d12]">
      {/* eslint-disable-next-line @next/next/no-img-element -- local, pre-optimised webp */}
      <img src={PHOTO[id]} alt="" loading="lazy" decoding="async" className="js-photo absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <div aria-hidden="true" className="js-ui absolute bottom-4 start-4 end-4 max-w-[17rem] rounded-xl bg-white/95 p-3 text-[13px] text-ink shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur">
        <UICard id={id} u={u} />
      </div>
    </div>
  );
}

const Tick = () => (
  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0f9641] text-white">
    <svg viewBox="0 0 12 12" className="size-2.5"><path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

function UICard({ id, u }: { id: StageId; u: (typeof experience)["en"]["journey"]["ui"] }) {
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
            {[0, 1, 2].map((k) => <span key={k} className="js-bar h-1.5 rounded-full bg-[#0f9641]" style={{ animationDelay: `${0.2 + k * 0.35}s` }} />)}
          </div>
        </div>
      );
    case "live":
      return (
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0f9641] text-white">
            <svg viewBox="0 0 20 20" className="size-5"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-semibold">{u.liveTitle}</p>
            <p className="text-[12px] text-muted">{u.liveBody}</p>
          </div>
          <span className="ms-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f9641]"><span className="js-live size-2 rounded-full bg-[#0f9641]" />LIVE</span>
        </div>
      );
  }
}
