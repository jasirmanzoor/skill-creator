"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { askTopics, askUi, type AskItem, type TopicId } from "@/content/ask";
import { experience, NEED_STAGES } from "@/content/experience";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { EASE_OUT } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { track } from "@/lib/analytics";
import TrackedLink from "../ui/TrackedLink";
import { WhatsAppIcon } from "../ui/icons";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ْ]/g, "").replace(/[إأآ]/g, "ا").replace(/ة/g, "ه");

/**
 * Ask MSG: the logistics explorer. Not an accordion: a topic rail, the questions of that topic, and a focused
 * answer panel. Choosing a question carries it into the panel (a shared layout transition), the answer sets in,
 * the place it happens rises beside it (MSG's own photograph, and for the seller questions the stage of one order
 * it belongs to), and the rest of the topic waits underneath as the next things to ask. A search box filters every
 * question at once, Arabic spellings normalised. Everything reads and works with motion off.
 */
export default function AskMSG({ t, lang }: { t: Dictionary; lang: Locale }) {
  const u = askUi[lang];
  const topics = useMemo(() => askTopics(lang), [lang]);
  const stages = experience[lang].needs.stages;
  const reduce = useReducedMotion();
  const ids = useId();
  const [topic, setTopic] = useState<TopicId>("delivery");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string>(topics[0].items[0].key);

  const all = useMemo(() => topics.flatMap((tp) => tp.items.map((it) => ({ ...it, topic: tp.id }))), [topics]);
  const q = norm(query.trim());
  const list: (AskItem & { topic: TopicId })[] = q ? all.filter((it) => norm(it.q + " " + it.a).includes(q)) : all.filter((it) => it.topic === topic);
  const current = list.find((it) => it.key === open) ?? list[0] ?? all.find((it) => it.key === open) ?? all[0];
  const tp = topics.find((x) => x.id === current.topic)!;
  const followUps = tp.items.filter((it) => it.key !== current.key).slice(0, 3);
  const ease = { duration: reduce ? 0 : 0.35, ease: EASE_OUT };

  const choose = (key: string) => { setOpen(key); track("cta_click", { cta: "ask", location: key }); };
  const pickTopic = (id: TopicId) => { setTopic(id); setQuery(""); setOpen(topics.find((x) => x.id === id)!.items[0].key); };

  const cta = tp.cta === "whatsapp"
    ? <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "ask" }} className="btn-ind on-dark"><WhatsAppIcon className="size-4 text-whatsapp" /> {u.ctas.whatsapp}</TrackedLink>
    : tp.cta === "price"
      ? <a href="#hero-quote" className="btn-ind on-dark">{u.ctas.price} <span aria-hidden="true" className="rtl:-scale-x-100">→</span></a>
      : <a href="#planner" data-plan-open className="btn-ind on-dark">{u.ctas.plan} <span aria-hidden="true" className="rtl:-scale-x-100">→</span></a>;

  return (
    <section id="ask" aria-labelledby="ask-title" data-theme="dark" data-mask-skip className="scroll-mt-16 bg-deep text-white">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <h2 id="ask-title" className="h-section">{u.title}</h2>
          </div>
          <p className="max-w-xl text-white/75 text-pretty lg:col-span-5 lg:col-start-8">{u.lead}</p>
        </div>

        <LayoutGroup id={ids}>
          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* topics and search */}
            <div className="min-w-0 lg:col-span-3">
              <label htmlFor={`${ids}-s`} className="sr-only">{u.searchLabel}</label>
              <div className="relative">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-white/60" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
                <input id={`${ids}-s`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={u.search}
                  className="w-full rounded-[3px] border border-white/20 bg-white/[0.06] py-3 pe-3 ps-9 text-sm text-white placeholder:text-white/60 focus:border-brand-bright focus:outline-none" />
              </div>
              {q ? <p aria-live="polite" className="lbl mt-3 text-brand-mint">{u.results.replace("{n}", String(list.length))}</p> : null}
              <ul role="tablist" aria-label={u.idx} className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible">
                {topics.map((x) => {
                  const on = !q && x.id === topic;
                  return (
                    <li key={x.id} role="presentation" className="shrink-0">
                      <button type="button" role="tab" aria-selected={on} onClick={() => pickTopic(x.id)}
                        className={`relative flex w-full items-baseline justify-between gap-4 rounded-[3px] px-3 py-2.5 text-start text-sm transition-colors max-lg:border max-lg:border-white/15 lg:border-b lg:border-white/10 lg:px-0 lg:py-3 ${on ? "text-white" : "text-white/70 hover:text-white"}`}>
                        {on ? <motion.span layoutId={`${ids}-tab`} transition={ease} className="absolute inset-y-0 start-0 w-0.5 bg-brand-bright max-lg:inset-x-0 max-lg:top-auto max-lg:h-0.5 max-lg:w-auto" /> : null}
                        <span className="font-semibold lg:ps-4">{x.title}</span>
                        <span className="num font-mono text-xs text-white/60" dir="ltr">{String(x.items.length).padStart(2, "0")}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* questions */}
            <ol aria-label={q ? u.results.replace("{n}", String(list.length)) : tp.title} className="min-w-0 border-t border-white/15 lg:col-span-4">
              {list.length === 0 ? <li className="py-6 text-white/75">{u.none}</li> : null}
              <AnimatePresence initial={false} mode="popLayout">
                {list.map((it, k) => {
                  const on = it.key === current.key;
                  return (
                    <motion.li key={it.key} layout={!reduce} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { ...ease, delay: reduce ? 0 : k * 0.03 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      className="border-b border-white/10">
                      <button type="button" onClick={() => choose(it.key)} aria-expanded={on} aria-controls={`${ids}-a`}
                        className={`group flex w-full items-start gap-4 py-4 text-start transition-colors ${on ? "text-white" : "text-white/75 hover:text-white"}`}>
                        <span className="num mt-1 font-mono text-xs text-brand-mint" dir="ltr">{String(k + 1).padStart(2, "0")}</span>
                        <span className={`flex-1 font-display text-lg leading-snug ${on ? "font-semibold" : "font-medium"}`}>{it.q}</span>
                        <span aria-hidden="true" className={`mt-1.5 text-sm transition-transform duration-200 rtl:-scale-x-100 ${on ? "translate-x-0.5 text-brand-bright" : "text-white/40 group-hover:text-white/80"}`}>→</span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>

            {/* the answer */}
            <div id={`${ids}-a`} aria-live="polite" className="min-w-0 lg:col-span-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article key={current.key} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: ease }} exit={{ opacity: 0, y: -8, transition: { duration: reduce ? 0 : 0.15 } }}
                  className="border border-white/15 bg-white/[0.04]">
                  <motion.figure initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)", transition: { duration: reduce ? 0 : 0.55, ease: [0.77, 0, 0.175, 1] } }}
                    className="plate relative aspect-[16/7] overflow-hidden bg-night">
                    <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1, transition: { duration: reduce ? 0 : 1.2, ease: EASE_OUT } }}>
                      <Image src={tp.photo.src} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" style={{ objectPosition: tp.photo.pos }} />
                    </motion.div>
                    <span aria-hidden="true" className="reg reg-ts" /><span aria-hidden="true" className="reg reg-be" />
                    <figcaption className="lbl absolute bottom-3 start-3 bg-graphite/85 px-2 py-1 text-white">{tp.title}</figcaption>
                  </motion.figure>
                  <div className="p-6 sm:p-7">
                    <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-balance rtl:tracking-normal">{current.q}</h3>
                    <p className="mt-4 text-lg leading-relaxed text-white/85 text-pretty">{current.a}</p>
                    <p className="lbl mt-4 text-white/60">{u.source}</p>
                    {current.stage ? (
                      <div className="mt-6">
                        <p className="lbl text-white/60">{u.stages}</p>
                        <ol className="mt-3 grid grid-cols-4 gap-1" aria-label={u.stages}>
                          {NEED_STAGES.map((st) => {
                            const here = st === current.stage;
                            return (
                              <li key={st} aria-current={here ? "step" : undefined}>
                                <span className="block h-0.5 overflow-hidden bg-white/15">
                                  <motion.span className="block h-full origin-left bg-brand-bright rtl:origin-right" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: here ? 1 : 0, transition: { ...ease, delay: reduce ? 0 : 0.25 } }} />
                                </span>
                                <span className={`mt-2 block text-xs ${here ? "font-semibold text-white" : "text-white/60"}`}>{stages[st].t}</span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    ) : null}
                    {followUps.length ? (
                      <div className="mt-7 border-t border-white/15 pt-5">
                        <p className="lbl text-white/60">{u.next}</p>
                        <ul className="mt-2">
                          {followUps.map((f) => (
                            <li key={f.key}>
                              <button type="button" onClick={() => { if (q) setQuery(""); setTopic(tp.id); choose(f.key); }} className="group flex w-full items-baseline gap-3 py-2 text-start text-white/80 hover:text-white">
                                <span aria-hidden="true" className="text-brand-bright rtl:-scale-x-100">↳</span>
                                <span className="underline decoration-white/20 underline-offset-4 group-hover:decoration-white/70">{f.q}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="mt-7">{cta}</div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
