/* eslint-disable @next/next/no-img-element -- pages of a small book; the photos are already sized for it */
import { media } from "@/content/media";
import type { Dictionary, Locale } from "@/content/i18n";
import FlipBook from "@/components/ui/FlipBook";
import Logo from "@/components/ui/Logo";
import Reveal from "@/components/ui/Reveal";

const copy: Record<Locale, { eyebrow: string; title: string; lead: string; cover: string; coverSub: string; back: string; backSub: string; next: string; prev: string; again: string; page: string }> = {
  en: {
    eyebrow: "Company profile",
    title: "Flip through MSG.",
    lead: "Tap the book to turn its pages: MSG's own Sabya hub, and the numbers behind it.",
    cover: "Company profile",
    coverSub: "Last-mile delivery and logistics · Riyadh",
    back: "Let's move what matters.",
    backSub: "Talk to MSG on WhatsApp, or send your plan.",
    next: "Turn the page",
    prev: "Previous page",
    again: "Close the book",
    page: "{n} / {total}",
  },
  ar: {
    eyebrow: "الملف التعريفي",
    title: "تصفّح ام اس جي.",
    lead: "اضغط على الكتاب لتقليب صفحاته: مركز ام اس جي في صبيا، والأرقام التي تقف خلفه.",
    cover: "الملف التعريفي",
    coverSub: "التوصيل للميل الأخير والخدمات اللوجستية · الرياض",
    back: "لننقل ما يهمك.",
    backSub: "تحدث مع ام اس جي على واتساب، أو أرسل خطتك.",
    next: "اقلب الصفحة",
    prev: "الصفحة السابقة",
    again: "أغلق الكتاب",
    page: "{n} / {total}",
  },
};

/**
 * The company profile as a small book (components/ui/FlipBook): a cover, then MSG's own Sabya hub photographs facing
 * the figures from the proof section, then a back cover. Every figure and caption comes from the dictionaries and
 * content/media.ts; nothing here is new copy about the company beyond the book's own labels.
 */
export default function ProfileBook({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = copy[lang];
  const photos = media.warehouse.slice(0, 4);
  const metrics = t.proof.metrics.slice(0, 4);
  if (photos.length < metrics.length) return null;

  const pages: React.ReactNode[] = [
    <div key="cover" className="relative flex h-full flex-col justify-between overflow-hidden bg-deep p-[9%] text-white">
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_0%,rgba(19,113,121,0.7),transparent_70%),radial-gradient(70%_50%_at_0%_100%,rgba(11,125,54,0.45),transparent_70%)]" />
      <Logo inverted className="relative" />
      <span className="relative">
        <span className="block font-display text-[clamp(1.1rem,3.2vw,2rem)] font-semibold leading-tight">{c.cover}</span>
        <span className="mt-2 block text-[clamp(0.6rem,1.4vw,0.85rem)] text-white/70">{c.coverSub}</span>
      </span>
    </div>,
  ];
  metrics.forEach((m, i) => {
    const p = photos[i];
    pages.push(
      <div key={`p${i}`} className="relative h-full bg-subtle">
        <img src={p.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
        {p.caption ? <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[8%] pb-[7%] pt-10 text-[clamp(0.55rem,1.2vw,0.8rem)] font-medium text-white">{p.caption[lang]}</span> : null}
      </div>,
      <div key={`m${i}`} className="flex h-full flex-col justify-between bg-surface p-[10%] text-ink">
        <span className="text-[clamp(0.5rem,1.1vw,0.7rem)] font-semibold uppercase tracking-[0.18em] text-teal">{m.d}</span>
        <span>
          <span className="num block font-display text-[clamp(1.6rem,5.5vw,3.6rem)] font-semibold leading-none tracking-[-0.04em]" dir="ltr">{m.value}</span>
          <span className="mt-3 block text-[clamp(0.7rem,1.5vw,1rem)] font-medium">{m.label}</span>
        </span>
        <span className="num text-[clamp(0.5rem,1vw,0.7rem)] text-faint">{String(i * 2 + 3).padStart(2, "0")}</span>
      </div>,
    );
  });
  pages.push(
    <div key="back" className="flex h-full flex-col justify-end bg-brand-deep p-[10%] text-white">
      <span className="font-display text-[clamp(1rem,2.8vw,1.75rem)] font-semibold leading-tight">{c.back}</span>
      <span className="mt-2 text-[clamp(0.6rem,1.3vw,0.85rem)] text-white/70">{c.backSub}</span>
    </div>,
  );

  return (
    <section aria-labelledby="profile-book-title" className="relative overflow-hidden border-t border-line bg-paper/[0.94] sec">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold text-teal">{c.eyebrow}</p>
          <h2 id="profile-book-title" className="h-section mt-2 text-ink">{c.title}</h2>
          <p className="mt-5 max-w-md text-lg text-muted">{c.lead}</p>
        </Reveal>
        <FlipBook pages={pages} rtl={lang === "ar"} labels={{ next: c.next, prev: c.prev, again: c.again, page: c.page }} />
      </div>
    </section>
  );
}
