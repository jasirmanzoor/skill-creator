"use client";

import { facts } from "@/content/facts";
import { SLUG_FOR } from "@/content/servicePages";
import { serviceHud } from "@/content/serviceHud";
import type { Dictionary, Locale } from "@/content/i18n";
import { ServiceIcon } from "../ui/icons";
import { PHOTO } from "../services/ServiceView";
import ExpandList, { type ExpandItem } from "../ui/ExpandList";

/**
 * The seven services as one numbered list that opens a row at a time (Framer's "Expand OnHover List"): with a mouse
 * the row under the pointer opens, its text and key figure fold out and a photo of the service swings in; on a phone
 * the row in the middle of the screen opens as the page scrolls. Each row's arrow goes to that service's own page.
 */
export default function Services({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.services;
  const h = serviceHud[lang];
  const items: ExpandItem[] = facts.services.map((id) => {
    const svc = t.planner.services[id];
    const fact = s.facts[id];
    const slug = SLUG_FOR[id];
    return {
      id,
      title: svc.name,
      text: svc.desc,
      icon: <ServiceIcon id={id} />,
      extra: (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="num font-display text-3xl font-semibold leading-none tracking-[-0.03em] text-brand-mint rtl:tracking-normal">{fact.v}</span>
          <span className="text-sm text-white/65">{fact.l}</span>
        </p>
      ),
      image: { src: PHOTO[id].src, pos: PHOTO[id].pos, alt: svc.name },
      href: slug ? `/${lang}/services/${slug}` : "#planner",
      cta: slug ? h.details : s.explore,
    };
  });

  return (
    <section id="services" aria-labelledby="services-title" data-theme="dark" className="relative scroll-mt-16 bg-deep/[0.88] pb-24 pt-24 text-white lg:pb-32 lg:pt-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright rtl:tracking-normal">{s.eyebrow}</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 id="services-title" className="h-section text-balance">{s.title}</h2>
          <p className="max-w-md text-lg text-white/75 text-pretty lg:justify-self-end">{s.lead}</p>
        </div>
        <div className="mt-12 lg:mt-16">
          <ExpandList items={items} label={s.title} rtl={lang === "ar"} />
        </div>
      </div>
    </section>
  );
}
