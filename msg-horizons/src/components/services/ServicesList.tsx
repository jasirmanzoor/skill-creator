"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { ServiceIcon } from "../ui/icons";
import { facts, type ServiceId } from "@/content/facts";
import ServiceView from "./ServiceView";
import { SLUG_FOR } from "@/content/servicePages";
import type { Dictionary, Locale } from "@/content/i18n";

/**
 * The seven services: a list that opens one service at a time, and beside it that service's view (MSG's photo,
 * a live panel of the service at work, its key fact). A highlight slides to the open row; rows answer the
 * pointer before they are clicked.
 */
export default function ServicesList({ t, lang }: { t: Dictionary; lang: Locale }) {
  const s = t.services;
  const [open, setOpen] = useState<ServiceId>("last-mile");
  const index = facts.services.indexOf(open);

  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-16 border-t border-line bg-paper/[0.94] sec">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <h2 id="services-title" className="h-section text-ink">
              {s.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-muted text-pretty lg:justify-self-end">{s.lead}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <ul className="relative">
            {facts.services.map((id, i) => {
              const svc = t.planner.services[id];
              const isOpen = open === id;
              return (
                <li key={id} className="relative">
                  {/* the open row's highlight slides from row to row */}
                  {isOpen ? (
                    <motion.span layoutId="svc-open" transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      className="absolute inset-0 rounded-2xl bg-surface shadow-[0_18px_40px_-24px_rgba(11,58,64,0.5)] ring-1 ring-line" />
                  ) : null}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`svc-${id}`}
                    onClick={() => setOpen(id)}
                    data-press="soft"
                    className="group relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-start transition-colors duration-200 hover:bg-surface/60"
                  >
                    <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-105 ${isOpen ? "bg-brand text-white shadow-[0_10px_20px_-10px_rgba(11,125,54,0.8)]" : "bg-subtle text-ink group-hover:bg-ink group-hover:text-white"}`}>
                      <ServiceIcon id={id} className="size-[18px]" />
                    </span>
                    <span className={`flex-1 font-display text-xl tracking-[-0.015em] transition-[color,translate] duration-300 ease-[cubic-bezier(.23,1,.32,1)] sm:text-2xl rtl:tracking-normal ${isOpen ? "font-semibold text-ink" : "font-medium text-muted group-hover:translate-x-1 group-hover:text-ink rtl:group-hover:-translate-x-1"}`}>
                      {svc.name}
                    </span>
                    <span aria-hidden="true" className="num text-xs font-semibold text-muted" dir="ltr">0{i + 1}</span>
                    <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full text-lg transition-[transform,background-color,color] duration-300 ${isOpen ? "rotate-45 bg-ink text-white" : "bg-subtle text-muted group-hover:bg-line"}`}>+</span>
                  </button>
                  {isOpen ? (
                    <div id={`svc-${id}`} className="relative animate-[fade-in_200ms_var(--ease-out)_both] px-4 pb-4">
                      <p className="max-w-lg ps-14 text-muted">{svc.desc}</p>
                      {SLUG_FOR[id] ? (
                        <a href={`/${lang}/services/${SLUG_FOR[id]}`} className="mt-1 inline-flex min-h-11 items-center ps-14 text-sm font-medium text-brand hover:underline">
                          {lang === "ar" ? "تفاصيل الخدمة" : "Service details"}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <aside aria-label={t.planner.services[open].name} className="lg:sticky lg:top-24 lg:self-start">
            <ServiceView
              id={open}
              index={index}
              total={facts.services.length}
              lang={lang}
              name={t.planner.services[open].name}
              fact={s.facts[open]}
              href={SLUG_FOR[open] ? `/${lang}/services/${SLUG_FOR[open]}` : undefined}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
