"use client";

import Image from "next/image";
import type { Locale } from "@/content/i18n";

const NAME = "Jasir Manzoor";
const EMAIL = "abdullah@msg-horizons.com";
const copy: Record<Locale, { eyebrow: string; role: string; roleShort: string; quote: [string, string]; label: string; flip: string; tier: string }> = {
  en: {
    eyebrow: "Leadership", role: "Operations Director, MSG Horizons", roleShort: "Operations Director",
    quote: ["Turning strategy into action.", "Delivering excellence every day."],
    label: "Jasir Manzoor's MSG Horizons pass", flip: "Turn the pass over", tier: "Executive",
  },
  ar: {
    eyebrow: "القيادة", role: "مدير العمليات، ام اس جي هورايزونز", roleShort: "مدير العمليات",
    quote: ["نحوّل الاستراتيجية إلى عمل.", "ونقدّم التميّز كل يوم."],
    label: "بطاقة Jasir Manzoor في ام اس جي هورايزونز", flip: "اقلب البطاقة", tier: "تنفيذي",
  },
};

/**
 * The outro before the footer: MSG's Operations Director, set as a plate and a line. His portrait, his words, his
 * name, role and address; nothing swings or turns over.
 */
export default function DirectorOutro({ lang }: { lang: Locale }) {
  const c = copy[lang];
  return (
    <section aria-labelledby="director-title" data-theme="dark" className="border-t border-white/10 bg-night text-white">
      <div className="mx-auto grid max-w-[88rem] items-end gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-20">
        <figure className="lg:col-span-3">
          <div className="plate relative aspect-[4/5] overflow-hidden bg-ink">
            <Image src="/leadership/coo.jpg" alt={`${NAME}, ${c.roleShort}`} fill sizes="(min-width: 1024px) 320px, 60vw" className="object-cover [object-position:50%_18%]" />
            <span aria-hidden="true" className="reg reg-ts" />
            <span aria-hidden="true" className="reg reg-be" />
          </div>
        </figure>
        <div className="lg:col-span-8 lg:col-start-5">
          <p className="lbl idx text-brand-bright">{c.eyebrow}</p>
          <p className="mt-6 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance rtl:leading-[1.35] rtl:tracking-normal">
            {c.quote[0]} <span className="text-white/60">{c.quote[1]}</span>
          </p>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-white/15 pt-5">
            <h2 id="director-title" className="font-display text-xl font-semibold" dir="ltr">{NAME}</h2>
            <p className="lbl text-white/65">{c.role}</p>
            <a href={`mailto:${EMAIL}`} dir="ltr" className="ms-auto text-sm font-semibold text-brand-bright underline-offset-4 hover:underline">{EMAIL}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
