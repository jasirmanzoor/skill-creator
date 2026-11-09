"use client";

import Image from "next/image";
import { facts } from "@/content/facts";
import type { Locale } from "@/content/i18n";
import ArcCarousel, { type ArcCard } from "../ui/ArcCarousel";

type Copy = {
  eyebrow: string; title: string; titleAccent: string; lead: string; visit: string; newTab: string;
  steps: { t: string; d: string }[];
  next: string; nextCta: string; separate: string; hint: string;
  labels: { prev: string; next: string; flip: string; back: string };
  cards: { tag: string; title: string; back: string; cta?: string }[];
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: "Launched on MSG",
    title: "Perfmix went live",
    titleAccent: "on MSG's infrastructure.",
    lead: "Perfmix, MSG's own perfume and beauty store, launched on the same hub, crews, fleet and licences that MSG offers every seller. It is the proof that the route from idea to doorstep works.",
    visit: "Visit perfmix.com",
    newTab: "opens in a new tab",
    steps: [
      { t: "Stored", d: "Stock on MSG's racks at the hub" },
      { t: "Packed", d: "Picked and packed by MSG's crews" },
      { t: "Delivered", d: "MSG's own vans and drivers" },
      { t: "Tracked & paid", d: "Live tracking, cash collected" },
    ],
    next: "Your brand could be next.",
    nextCta: "Build my plan",
    separate: "Perfmix is a separate store at perfmix.com; its product pictures are its own.",
    hint: "Drag the arc, or click a card to turn it over.",
    labels: { prev: "Previous card", next: "Next card", flip: "turn it over", back: "turn it back" },
    cards: [
      { tag: "Perfmix", title: "Men's perfumes", back: "One of Perfmix's collections, stocked, packed and delivered by MSG.", cta: "Shop men's perfumes" },
      { tag: "MSG hub", title: "On MSG's racks", back: "Perfmix's stock is stored at MSG's hub, counted and ready to pick the moment an order lands." },
      { tag: "Perfmix", title: "Unisex perfumes", back: "Orders from every collection go out through the same MSG line.", cta: "Shop unisex perfumes" },
      { tag: "MSG crews", title: "Picked and packed", back: "MSG's crews scan, pick and pack each order, so it leaves the hub the way the customer expects." },
      { tag: "Perfmix", title: "Perfume alternatives", back: "A growing range, carried by infrastructure that was already in place.", cta: "Shop perfume alternatives" },
      { tag: "MSG fleet", title: "Out with MSG's vans", back: "MSG's own vans and in-house drivers take Perfmix orders to the door, tracked live, cash on delivery collected." },
      { tag: "MSG outlet", title: "Licensed from day one", back: "Perfmix launched on MSG's licences and compliance, with nothing to set up first." },
    ],
  },
  ar: {
    eyebrow: "انطلق مع ام اس جي",
    title: "بيرفمكس انطلق",
    titleAccent: "على بنية ام اس جي.",
    lead: "بيرفمكس، متجر ام اس جي للعطور ومنتجات التجميل، انطلق على المركز والفرق والأسطول والتراخيص نفسها التي تقدّمها ام اس جي لكل بائع. وهو الدليل على أن الطريق من الفكرة إلى الباب يعمل.",
    visit: "زيارة perfmix.com",
    newTab: "يفتح في تبويب جديد",
    steps: [
      { t: "تخزين", d: "المخزون على رفوف ام اس جي في المركز" },
      { t: "تجهيز", d: "يُجهَّز ويُغلَّف بفرق ام اس جي" },
      { t: "توصيل", d: "مركبات ام اس جي ومناديبها" },
      { t: "تتبّع وتحصيل", d: "تتبّع مباشر وتحصيل النقد" },
    ],
    next: "علامتك قد تكون التالية.",
    nextCta: "ابنِ خطتي",
    separate: "بيرفمكس متجر مستقل على perfmix.com، وصور منتجاته من المتجر نفسه.",
    hint: "اسحب القوس، أو اضغط على بطاقة لقلبها.",
    labels: { prev: "البطاقة السابقة", next: "البطاقة التالية", flip: "اقلبها", back: "أعدها" },
    cards: [
      { tag: "بيرفمكس", title: "عطور رجالية", back: "إحدى مجموعات بيرفمكس، تُخزَّن وتُجهَّز وتُوصَّل مع ام اس جي.", cta: "تسوّق العطور الرجالية" },
      { tag: "مركز ام اس جي", title: "على رفوف ام اس جي", back: "مخزون بيرفمكس في مركز ام اس جي، معدود وجاهز للتجهيز لحظة وصول الطلب." },
      { tag: "بيرفمكس", title: "عطور للجنسين", back: "طلبات كل المجموعات تخرج عبر خط ام اس جي نفسه.", cta: "تسوّق العطور للجنسين" },
      { tag: "فرق ام اس جي", title: "تجهيز وتغليف", back: "فرق ام اس جي تمسح كل طلب وتجهّزه وتغلّفه، ليخرج من المركز كما ينتظره العميل." },
      { tag: "بيرفمكس", title: "بدائل العطور", back: "تشكيلة تكبر، تحملها بنية كانت جاهزة من قبل.", cta: "تسوّق بدائل العطور" },
      { tag: "أسطول ام اس جي", title: "مع مركبات ام اس جي", back: "مركبات ام اس جي ومناديبها يوصلون طلبات بيرفمكس إلى الباب، بتتبّع مباشر وتحصيل عند الاستلام." },
      { tag: "منفذ ام اس جي", title: "مرخّص من اليوم الأول", back: "انطلق بيرفمكس على تراخيص ام اس جي والتزامها، دون أي إعداد مسبق." },
    ],
  },
};

const S = facts.ownStore;
// front pictures: the store's own category banners (bottles sit on the left), then MSG's own photos
const FRONT = [
  { src: "/media/perfmix/mens.webp", pos: "18% 50%", href: S.categories.mens },
  { src: "/media/msg/hub-racks.webp", pos: "50% 60%" },
  { src: "/media/perfmix/unisex.webp", pos: "20% 50%", href: S.categories.unisex },
  { src: "/media/msg/hub-team-scan.webp", pos: "40% 45%" },
  { src: "/media/perfmix/alternatives.webp", pos: "18% 50%", href: S.categories.alternatives },
  { src: "/media/msg/fleet-hub-side.webp", pos: "40% 60%" },
  { src: "/media/msg/outlet-counter.webp", pos: "30% 50%" },
];

/**
 * Perfmix, MSG's own store, as MSG's launch story: what MSG put under it (stored, packed, delivered, tracked and
 * paid), then a fanned arc (ui/ArcCarousel, after Framer's "Flip Arc Carousel") mixing the store's collections with
 * MSG's hub, crews, fleet and outlet; each card turns over to say what MSG does there, and the store's cards link out
 * to that collection. It ends on the plan builder. No price, promotion or shipping claim of the store is repeated.
 */
export default function Perfmix({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const cards: ArcCard[] = c.cards.map((x, i) => ({
    ...x,
    src: FRONT[i].src,
    pos: FRONT[i].pos,
    alt: x.title,
    href: FRONT[i].href,
    cta: x.cta ? `${x.cta}` : undefined,
  }));
  return (
    <section id="perfmix" aria-labelledby="perfmix-title" data-theme="dark" className="relative isolate overflow-hidden bg-[#0b1730] py-24 text-white lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_80%_10%,rgba(0,157,248,0.20),transparent_70%),radial-gradient(45%_45%_at_10%_90%,rgba(196,30,58,0.14),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{c.eyebrow}</p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <Image src="/media/perfmix/wordmark.png" alt={S.name} width={500} height={78} priority className="h-6 w-auto" />
            </div>
            <h2 id="perfmix-title" data-mask-skip className="h-section mt-6 text-balance">
              {c.title} <span className="text-brand-mint">{c.titleAccent}</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/75 text-pretty">{c.lead}</p>
            <a href={S.url} target="_blank" rel="noopener" className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-[#0b1730] transition-transform hover:-translate-y-0.5">
              {c.visit}
              <span className="sr-only"> ({c.newTab})</span>
              <svg viewBox="0 0 24 24" className="size-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </a>
          </div>
          {/* what MSG put under the launch */}
          <ol className="grid grid-cols-2 gap-3">
            {c.steps.map((s, i) => (
              <li key={s.t} className="relative rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/12">
                <span className="num font-mono text-[11px] text-brand-bright" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-display text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-white/70">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-14">
        <ArcCarousel cards={cards} label={`${S.name} · ${c.eyebrow}`} labels={c.labels} rtl={lang === "ar"} />
        <p className="mt-3 text-center text-xs text-white/55">{c.hint}</p>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-start justify-between gap-5 px-5 sm:flex-row sm:items-center lg:px-8">
        <p className="font-display text-2xl font-semibold sm:text-3xl">{c.next}</p>
        <button type="button" data-plan-open className="btn-primary on-dark px-6 py-3.5">{c.nextCta}</button>
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-5 text-xs text-white/50 lg:px-8">{c.separate}</p>
    </section>
  );
}
