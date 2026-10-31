/* eslint-disable @next/next/no-img-element -- pages of a small book; the photos are already sized for it */
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { media } from "@/content/media";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import FlipBook from "@/components/ui/FlipBook";
import Logo from "@/components/ui/Logo";
import { ServiceIcon } from "@/components/ui/icons";
import { useLowPower } from "@/lib/perf";

type SpiralProps = { items: { src: string; alt: string }[] } & Record<string, unknown>;
const InfiniteSpiral = dynamic<SpiralProps>(() => import("../fx/InfiniteSpiral") as unknown as Promise<{ default: React.ComponentType<SpiralProps> }>, { ssr: false });

const copy: Record<Locale, {
  eyebrow: string; title: string; lead: string; talk: string;
  cover: string; year: string; coverSub: string; who: string; whoLead: string; hq: string; cr: string;
  services: string; back: string; backSub: string; next: string; prev: string; again: string; page: string;
  open: string; deck: string; pdf: string;
}> = {
  en: {
    eyebrow: "Company profile",
    title: "Flip through MSG.",
    lead: "MSG Horizons in one small book: who we are, MSG's own Sabya hub, the services, and the numbers behind them. Tap it to turn the pages.",
    talk: "Talk to MSG",
    cover: "Company profile",
    year: "2026",
    coverSub: "Last-mile delivery and logistics · Riyadh",
    who: "Who we are",
    whoLead: facts.tagline,
    hq: "Headquarters",
    cr: "Commercial registration",
    services: "What we run",
    back: "Let's move what matters.",
    backSub: "Talk to MSG on WhatsApp, or send your plan.",
    next: "Turn the page",
    prev: "Previous page",
    again: "Close the book",
    page: "{n} / {total}",
    open: "Open the full profile",
    deck: "Flip through the deck",
    pdf: "Download PDF",
  },
  ar: {
    eyebrow: "الملف التعريفي",
    title: "تصفّح ام اس جي.",
    lead: "ام اس جي هورايزونز في كتاب صغير: من نحن، ومركز ام اس جي في صبيا، والخدمات، والأرقام التي تقف خلفها. اضغط على الكتاب لتقليب صفحاته.",
    talk: "تحدث مع ام اس جي",
    cover: "الملف التعريفي",
    year: "2026",
    coverSub: "التوصيل للميل الأخير والخدمات اللوجستية · الرياض",
    who: "من نحن",
    whoLead: "حلول لوجستية متكاملة رائدة في المملكة العربية السعودية",
    hq: "المقر الرئيسي",
    cr: "السجل التجاري",
    services: "ما نديره",
    back: "لننقل ما يهمك.",
    backSub: "تحدث مع ام اس جي على واتساب، أو أرسل خطتك.",
    next: "اقلب الصفحة",
    prev: "الصفحة السابقة",
    again: "أغلق الكتاب",
    page: "{n} / {total}",
    open: "افتح الملف التعريفي كاملًا",
    deck: "تصفّح الكتيّب",
    pdf: "تنزيل PDF",
  },
};

/**
 * The company profile as its own chapter, a second cover for the site: MSG in a small book (components/ui/FlipBook)
 * held over a slow spiral of MSG's own Sabya hub photographs (React Bits' InfiniteSpiral). The book opens on the new
 * brand cover, then who MSG is, the hub photographs facing the figures from the proof section, the services, and a
 * back cover. Every figure and caption comes from the dictionaries, facts.ts and content/media.ts.
 */
export default function ProfileBook({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = copy[lang];
  const low = useLowPower();
  // the spiral (and its photos) only exists once this chapter is open and near the screen
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);
  const photos = media.warehouse.slice(0, 4);
  const metrics = t.proof.metrics.slice(0, 4);
  const ar = lang === "ar";
  const spiral = [...media.warehouse, ...media.operations].map((m) => ({ src: m.src, alt: "" }));

  const pages: React.ReactNode[] = [
    <div key="cover" className="relative flex h-full flex-col justify-between overflow-hidden bg-deep p-[9%] text-white">
      {/* the brand shard, as on the guidelines' covers */}
      <span aria-hidden="true" className="absolute -end-[18%] -top-[6%] h-[62%] w-[70%] bg-brand-bright [clip-path:polygon(28%_0,62%_0,100%_100%)] rtl:-scale-x-100" />
      <Logo inverted variant="stacked" height={44} className="relative" />
      <span className="relative">
        <span className="block text-[clamp(0.55rem,1.2vw,0.75rem)] font-semibold uppercase tracking-[0.22em] text-brand-mint rtl:tracking-normal">{c.year}</span>
        <span className="mt-1 block font-display text-[clamp(1.2rem,3.4vw,2.2rem)] font-semibold leading-tight">{c.cover}</span>
        <span className="mt-2 block text-[clamp(0.6rem,1.4vw,0.85rem)] text-white/75">{c.coverSub}</span>
      </span>
    </div>,
    <div key="who" className="flex h-full flex-col justify-between bg-surface p-[10%] text-ink">
      <span className="text-[clamp(0.5rem,1.1vw,0.7rem)] font-semibold uppercase tracking-[0.18em] text-brand rtl:tracking-normal">{c.who}</span>
      <span className="font-display text-[clamp(0.95rem,2.4vw,1.5rem)] font-semibold leading-snug text-pretty">{c.whoLead}</span>
      <span className="grid gap-2 text-[clamp(0.55rem,1.1vw,0.75rem)]">
        <span><span className="block text-muted">{c.hq}</span><span className="font-medium">{ar ? "الرياض، المملكة العربية السعودية" : facts.corporate.headquarters}</span></span>
        <span><span className="block text-muted">{c.cr}</span><span className="num font-medium" dir="ltr">{facts.corporate.commercialRegistration}</span></span>
      </span>
    </div>,
  ];
  metrics.forEach((m, i) => {
    const p = photos[i];
    if (!p) return;
    pages.push(
      <div key={`p${i}`} className="relative h-full bg-subtle">
        <img src={p.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
        {p.caption ? <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[8%] pb-[7%] pt-10 text-[clamp(0.55rem,1.2vw,0.8rem)] font-medium text-white">{p.caption[lang]}</span> : null}
      </div>,
      <div key={`m${i}`} className="flex h-full flex-col justify-between bg-surface p-[10%] text-ink">
        <span className="text-[clamp(0.5rem,1.1vw,0.7rem)] font-semibold uppercase tracking-[0.18em] text-brand rtl:tracking-normal">{m.d}</span>
        <span>
          <span className="num block font-display text-[clamp(1.6rem,5.5vw,3.6rem)] font-semibold leading-none tracking-[-0.04em]" dir="ltr">{m.value}</span>
          <span className="mt-3 block text-[clamp(0.7rem,1.5vw,1rem)] font-medium">{m.label}</span>
        </span>
        <span className="num text-[clamp(0.5rem,1vw,0.7rem)] text-muted">{String(i * 2 + 5).padStart(2, "0")}</span>
      </div>,
    );
  });
  pages.push(
    <div key="services" className="flex h-full flex-col bg-surface p-[9%] text-ink">
      <span className="text-[clamp(0.5rem,1.1vw,0.7rem)] font-semibold uppercase tracking-[0.18em] text-brand rtl:tracking-normal">{c.services}</span>
      <ul className="mt-[8%] grid flex-1 content-start gap-[5%]">
        {facts.services.map((id) => (
          <li key={id} className="flex items-center gap-2.5 text-[clamp(0.6rem,1.3vw,0.85rem)] font-medium">
            <span className="grid size-[1.9em] shrink-0 place-items-center rounded-md bg-brand-soft text-brand [&_svg]:size-[1.1em]"><ServiceIcon id={id} /></span>
            {t.planner.services[id].name}
          </li>
        ))}
      </ul>
    </div>,
    <div key="back" className="relative flex h-full flex-col justify-end overflow-hidden bg-deep p-[10%] text-white">
      <span aria-hidden="true" className="absolute -start-[30%] -top-[10%] h-[70%] w-[80%] bg-brand-bright/90 [clip-path:polygon(0_0,40%_0,100%_100%)] rtl:-scale-x-100" />
      <Logo inverted variant="mark" height={34} className="relative mb-auto" />
      <span className="relative font-display text-[clamp(1rem,2.8vw,1.75rem)] font-semibold leading-tight">{c.back}</span>
      <span className="relative mt-2 text-[clamp(0.6rem,1.3vw,0.85rem)] text-white/75">{c.backSub}</span>
    </div>,
  );

  return (
    <section ref={root} id="profile" aria-labelledby="profile-title" className="relative isolate min-h-[100svh] overflow-hidden bg-deep text-white" data-theme="dark">
      {/* MSG's own hub, in a slow spiral behind the book */}
      <div aria-hidden="true" className="absolute inset-y-0 end-0 -z-10 w-full opacity-70 lg:w-[62%]">
        {low || !near ? null : (
          <InfiniteSpiral
            items={spiral}
            animationMode="auto"
            speed={0.32}
            radius={320}
            cardWidth={200}
            cardHeight={140}
            verticalSpacing={92}
            perspective={1200}
            cardRadius={14}
            centerScale={1.15}
            edgeBlur={0}
            cardsPerTurn={7}
            pauseOnHover={false}
            direction="up"
            edgeFade={0.45}
            imageFit="cover"
            grayscale={0.35}
          />
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_70%_50%,rgba(28,44,81,0)_0%,rgba(28,44,81,0.75)_70%,#1c2c51_100%)]" />
      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 pb-36 pt-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:px-8 lg:pb-28">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{c.eyebrow}</p>
          <h2 id="profile-title" className="h-display mt-3 text-white">{c.title}</h2>
          <p className="mt-6 text-lg text-white/80 text-pretty">{c.lead}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {metrics.slice(0, 3).map((m) => (
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
          {/* the company profile on its own: the one-page version, the flip-book deck and its PDF */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
            <a href={`/${lang}/company-profile`} className="inline-flex items-center gap-2 text-brand-mint underline-offset-4 hover:underline">{c.open} <span aria-hidden="true" className="rtl:-scale-x-100">→</span></a>
            <a href={`/${lang}/company-profile/deck`} className="text-white/80 underline-offset-4 hover:text-white hover:underline">{c.deck}</a>
            <a href={`/media/profile/MSG-Horizons-Company-Profile-${lang.toUpperCase()}.pdf`} download className="text-white/80 underline-offset-4 hover:text-white hover:underline">{c.pdf}</a>
          </div>
        </div>
        <div className="profile-book">
          <FlipBook pages={pages} rtl={ar} labels={{ next: c.next, prev: c.prev, again: c.again, page: c.page }} />
        </div>
      </div>
    </section>
  );
}
