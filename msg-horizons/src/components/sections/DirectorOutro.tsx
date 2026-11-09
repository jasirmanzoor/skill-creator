"use client";

import Image from "next/image";
import type { Locale } from "@/content/i18n";
import Logo from "../ui/Logo";
import LanyardPass from "../ui/LanyardPass";

const NAME = "Jasir Manzoor";
const copy: Record<Locale, { eyebrow: string; role: string; roleShort: string; quote: [string, string]; label: string; flip: string; hint: string; tier: string }> = {
  en: {
    eyebrow: "Leadership", role: "Operations Director, MSG Horizons", roleShort: "Operations Director",
    quote: ["Turning strategy into action.", "Delivering excellence every day."],
    label: "Jasir Manzoor's MSG Horizons pass", flip: "Turn the pass over", hint: "Grab the pass and swing it, or click to turn it over.", tier: "Executive",
  },
  ar: {
    eyebrow: "القيادة", role: "مدير العمليات، ام اس جي هورايزونز", roleShort: "مدير العمليات",
    quote: ["نحوّل الاستراتيجية إلى عمل.", "ونقدّم التميّز كل يوم."],
    label: "بطاقة Jasir Manzoor في ام اس جي هورايزونز", flip: "اقلب البطاقة", hint: "امسك البطاقة وأرجحها، أو اضغط لقلبها.", tier: "تنفيذي",
  },
};

/**
 * The outro before the footer: MSG's Operations Director on an MSG staff pass hanging from a branded lanyard
 * (ui/LanyardPass, after Kern's Lanyard Pass). The strap carries MSG and his name and title; the pass shows his
 * portrait, name and position, and turns over to his line.
 */
export default function DirectorOutro({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const front = (
    <span className="flex size-full flex-col bg-[#0b1730] text-white">
      <span className="flex items-center justify-between px-5 pb-3 pt-6">
        <Logo inverted variant="horizontal" height={22} />
        <span className="rounded-full bg-[#c9a24a]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e6c77a] ring-1 ring-[#c9a24a]/50 rtl:tracking-normal">{c.tier}</span>
      </span>
      <span className="relative mx-5 flex-1 overflow-hidden rounded-xl">
        <Image src="/leadership/coo.jpg" alt="" fill sizes="304px" className="object-cover [object-position:50%_18%]" draggable={false} />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(11,23,48,0.9),transparent)]" />
      </span>
      <span className="px-5 pb-5 pt-4">
        <span className="block font-display text-[1.6rem] font-semibold leading-none tracking-[-0.02em]" dir="ltr">{NAME}</span>
        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7fcbfb] rtl:tracking-normal">{c.roleShort}</span>
        <span className="mt-3 flex items-center gap-2">
          <span className="h-[3px] w-8 rounded-full bg-[#009df8]" />
          <span className="h-[3px] w-4 rounded-full bg-[#c9a24a]" />
          <span className="ms-auto font-mono text-[10px] text-white/55" dir="ltr">msg-horizons.com</span>
        </span>
      </span>
    </span>
  );
  const back = (
    <span className="flex size-full flex-col justify-between bg-[linear-gradient(160deg,#13264a,#070f1f)] p-6 text-white">
      <Logo inverted variant="mark" height={34} />
      <span>
        <span className="block font-display text-2xl font-semibold leading-snug">{c.quote[0]} <span className="text-[#7fcbfb]">{c.quote[1]}</span></span>
        <span className="mt-5 block h-[2px] w-10 bg-[#c9a24a]" />
        <span className="mt-3 block font-semibold" dir="ltr">{NAME}</span>
        <span className="block text-xs text-white/65">{c.role}</span>
      </span>
    </span>
  );
  return (
    <section aria-labelledby="director-title" data-theme="dark" className="relative overflow-hidden bg-[#0b1326] px-5 py-14 text-white lg:px-8 lg:py-16">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(45%_60%_at_70%_30%,rgba(0,157,248,0.16),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{c.eyebrow}</p>
          <p className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-balance rtl:tracking-normal">
            {c.quote[0]} <span className="text-brand-mint">{c.quote[1]}</span>
          </p>
          <h2 id="director-title" data-mask-skip className="mt-6 font-display text-xl font-semibold" dir="ltr">{NAME}</h2>
          <p className="mt-1 text-sm text-white/65">{c.role}</p>
          <p className="mt-6 text-xs text-white/45">{c.hint}</p>
        </div>
        <div className="order-1 h-[42rem] sm:h-[44rem] lg:order-2">
          <LanyardPass front={front} back={back} strapText={`MSG HORIZONS · ${NAME.toUpperCase()}`} label={c.label} flipLabel={c.flip} />
        </div>
      </div>
    </section>
  );
}
