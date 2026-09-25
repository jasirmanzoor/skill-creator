"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon, ServiceIcon } from "../ui/icons";
import { facts, type ServiceId } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/** Flexport-style service index: a quiet list that opens one service at a time, with its key fact beside it. */
export default function Services({ t }: { t: Dictionary }) {
  const s = t.services;
  const [open, setOpen] = useState<ServiceId>("last-mile");
  const fact = t.services.facts[open];

  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-16 border-t border-line bg-paper/90 py-24 backdrop-blur lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="label">{s.eyebrow}</span>
            <h2 id="services-title" className="mt-4 font-display text-4xl font-semibold tracking-[-0.025em] text-ink text-balance sm:text-5xl rtl:tracking-normal">
              {s.title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-muted text-pretty lg:justify-self-end">{s.lead}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <ul className="border-t border-line">
            {facts.services.map((id) => {
              const svc = t.planner.services[id];
              const isOpen = open === id;
              return (
                <li key={id} className="border-b border-line">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`svc-${id}`}
                    onClick={() => setOpen(id)}
                    className="flex w-full items-center gap-4 py-5 text-start"
                  >
                    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors ${isOpen ? "bg-brand text-white" : "bg-subtle text-ink"}`}>
                      <ServiceIcon id={id} className="size-[18px]" />
                    </span>
                    <span className={`flex-1 font-display text-xl tracking-[-0.015em] transition-colors sm:text-2xl rtl:tracking-normal ${isOpen ? "font-semibold text-ink" : "font-medium text-muted hover:text-ink"}`}>
                      {svc.name}
                    </span>
                    <span aria-hidden="true" className={`text-xl text-muted transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`svc-${id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-lg pb-6 ps-[3.25rem] text-muted">{svc.desc}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={open}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(12,14,17,0.04)]"
              >
                <p className="text-sm font-semibold text-muted">{t.planner.services[open].name}</p>
                <p className="num mt-6 font-display text-6xl font-semibold tracking-[-0.03em] text-ink rtl:tracking-normal">{fact.v}</p>
                <p className="mt-3 text-lg text-muted">{fact.l}</p>
                <TrackedLink
                  href="#planner"
                  event="cta_click"
                  props={{ cta: "plan", location: `services_${open}` }}
                  className="mt-8 inline-flex items-center gap-2 font-medium text-brand hover:text-brand-strong"
                >
                  {s.explore} <ArrowIcon />
                </TrackedLink>
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </section>
  );
}
