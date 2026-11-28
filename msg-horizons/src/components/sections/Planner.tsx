"use client";

import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_UI } from "@/lib/motion";
import { RiyadhClock } from "../hero/Command";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { lockScroll } from "@/lib/scroller";
import { PLAN_OPEN } from "@/lib/deck";
import {
  CARGO, PERSONAS, PRIORITIES, buildPlan, decodePlan, encodePlan,
  type Cargo, type Persona, type PlanInput, type Priority,
} from "@/lib/planner";
import {
  DEFAULT_SIZER, ORIGINS, PROFILES, WINDOWS, ordersFromSlider, sliderFromOrders, volumeBand, type SizerInput,
} from "@/lib/sizer";
import { quote, quoteRef, type Quote } from "@/lib/quote";
import { normalizePhone } from "@/lib/lead";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import { sizerCopy } from "@/content/sizerCopy";
import { studioCopy } from "@/content/studio";
import { coveredCopy } from "@/content/covered";
import { fmt, type Dictionary, type Locale } from "@/content/i18n";
import { usePlan } from "../PlanContext";
import { ArrowIcon, CheckIcon, OptionIcon, ServiceIcon, WhatsAppIcon } from "../ui/icons";
import PlanStage from "../planner/PlanStage";
import { MustList, Pillars } from "../planner/Covered";

/**
 * MSG Plan Studio. One screen: every input on the left, and the plan, the itemised quote and the live network on the
 * right, all recomputed on every change. Prices come only from MSG's rate card (lib/quote.ts); anything it does not
 * cover is listed as confirmed by MSG. "Lock this quote" sends the plan and its reference to MSG (/api/lead).
 */

/** Starting numbers per persona, so the studio opens on a realistic picture instead of a blank. */
const PRESET: Record<Persona, Partial<SizerInput>> = {
  seller: { orders: 15, peak: 2, cod: 40 },
  startup: { orders: 60, peak: 2.5, cod: 30 },
  ecommerce: { orders: 600, peak: 2.5, cod: 25, area: "multi", split: 40 },
  enterprise: { orders: 3000, peak: 2, cod: 15, area: "kingdom", profile: "mixed" },
  platform: { orders: 5000, peak: 1.5, cod: 20, window: "sameday" },
};
const CARGO_FOR: Record<Persona, Cargo[]> = {
  seller: ["parcels"], startup: ["parcels"], ecommerce: ["parcels"], enterprise: ["parcels", "b2b"], platform: ["people"],
};
const START: Persona = "seller";
const startNet = (p: Persona): SizerInput => ({ ...DEFAULT_SIZER, ...PRESET[p] });

const VISITOR = "msg-estimator-visitor"; // shared with the old estimator sign-in, so returning visitors stay known
type Visitor = { name: string; phone: string; company?: string };

const sar = (lang: Locale, v: number) => (lang === "ar" ? `${v.toLocaleString("en-US")} ريال` : `SAR ${v.toLocaleString("en-US")}`);

/** WhatsApp / lead text: the visitor's choices, the itemised quote and the services, nothing operational. */
function studioSummary(t: Dictionary, lang: Locale, input: PlanInput, q: Quote, ref: string): string {
  const c = studioCopy[lang];
  const s = c.summary;
  const net = input.net ?? DEFAULT_SIZER;
  const p = t.planner.steps;
  const plan = buildPlan(input);
  const route = `${c.origins[net.origin ?? "riyadh"]} → ${c.dests[net.area]}${net.area === "multi" ? ` (${fmt(c.split, { n: net.split ?? 50 })})` : ""}`;
  const lines = [
    s.intro, "",
    `${s.ref}: ${ref}`,
    `${t.planner.result.models[plan.model].name}`,
    `• ${s.profile}: ${p.persona.options[input.persona].t}`,
    `• ${(input.cargo.length ? input.cargo : (["parcels"] as Cargo[])).map((x) => p.cargo.options[x].t).join(", ")}`,
    `• ${fmt(s.orders, { n: net.orders.toLocaleString("en-US") })} · ${fmt(s.peak, { x: `${net.peak}×` })}`,
    `• ${s.route}: ${route}`,
    `• ${sizerCopy[lang].inputs.windows[net.window]} · ${sizerCopy[lang].inputs.profiles[net.profile]}`,
    ...(net.cod ? [`• ${fmt(s.cod, { n: net.cod })}`] : []),
    ...(net.stock ? [`• ${s.stock}`] : []),
    ...(input.priorities.length ? [`• ${input.priorities.map((x) => p.priorities.options[x].t).join(", ")}`] : []),
    "",
    `${s.quote}: ≈ ${sar(lang, q.subtotal)} ${c.quote.month} (≈ ${sar(lang, q.perOrder)} ${c.quote.perOrder})`,
    ...q.lanes.map((l) => `  ${c.quote.lanes[l.lane]}: ${fmt(c.quote.shipments, { n: l.shipments.toLocaleString("en-US"), rate: l.rate })}`),
    ...q.extras.map((x) => `  ${c.quote.extras[x.id]}: ${x.total == null ? s.byMsg : sar(lang, x.total)}`),
    "",
    `${s.services}: ${plan.modules.map((m) => t.planner.services[m.id].name).join(", ")}`,
  ];
  return lines.join("\n");
}

export default function Planner({ t, lang }: { t: Dictionary; lang: Locale }) {
  const p = t.planner;
  const c = studioCopy[lang];
  const { setPlan, seed } = usePlan();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<Persona>(START);
  const [cargo, setCargo] = useState<Cargo[]>(CARGO_FOR[START]);
  const [net, setNet] = useState<SizerInput>(startNet(START));
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const opener = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const show = () => { opener.current = document.activeElement as HTMLElement | null; setOpen(true); };
  const choose = (k: Persona) => {
    setPersona(k);
    setCargo(CARGO_FOR[k]);
    setNet(startNet(k));
    track("planner_step", { step: 1, value: k });
  };

  // shared links (?plan=…), service pages (?persona=…) and ?build open the studio on arrival
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = decodePlan(params.get("plan"));
    const start = params.get("persona");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from the URL */
    if (shared) {
      setPersona(shared.persona);
      setCargo(shared.cargo);
      if (shared.net) setNet(shared.net);
      setPriorities(shared.priorities);
      setOpen(true);
    } else if (start && (PERSONAS as readonly string[]).includes(start)) {
      choose(start as Persona);
      setOpen(true);
    } else if (params.has("build")) {
      setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // the hero's quick start opens the studio with a persona already chosen
  const [seenSeed, setSeenSeed] = useState(0);
  if (seed && seed.n !== seenSeed) {
    setSeenSeed(seed.n);
    setPersona(seed.persona);
    setCargo(CARGO_FOR[seed.persona]);
    setNet(startNet(seed.persona));
    setOpen(true);
    track("planner_step", { step: 1, value: seed.persona });
  }

  // the header's button and any [data-plan-open] element open the studio
  useEffect(() => {
    const onSignal = () => show();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("[data-plan-open]");
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      show();
    };
    window.addEventListener(PLAN_OPEN, onSignal);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener(PLAN_OPEN, onSignal); document.removeEventListener("click", onClick, true); };
  }, []);

  // while open the page behind stays still; Escape closes and focus returns to the opener
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      opener.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const input: PlanInput = useMemo(
    () => ({ persona, cargo, volume: volumeBand(net.orders), priorities, net }),
    [persona, cargo, net, priorities],
  );
  const code = encodePlan(input);

  // the address always carries the current plan, so a copied link opens exactly this quote
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("plan", code);
      url.searchParams.delete("persona");
      url.searchParams.delete("build");
      url.hash = "planner";
      window.history.replaceState(null, "", url);
    }, 250);
    return () => window.clearTimeout(id);
  }, [code, open]);

  const reset = () => {
    setPriorities([]);
    choose(START);
  };

  return (
    <section id="planner" aria-labelledby="planner-title" className="relative scroll-mt-16 py-8 text-white lg:py-10">
      <div className="mx-auto max-w-[88rem] px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.05] p-6 ring-1 ring-white/10 sm:p-10">
          <div aria-hidden="true" className="plan-glow pointer-events-none absolute inset-0 rounded-[2rem] opacity-60" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <span className="label on-dark">{p.eyebrow}</span>
              <h2 id="planner-title" className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl rtl:leading-[1.3] rtl:tracking-normal">
                {c.launchTitle}
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/75 text-pretty">{c.launchLead}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {c.launchPoints.map((x) => (
                  <li key={x} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-sm text-white/85 ring-1 ring-white/12">
                    <CheckIcon className="size-3.5 text-brand-bright" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <button
                type="button"
                onClick={() => { track("cta_click", { cta: "plan", location: "planner_launch" }); show(); }}
                className="btn-primary on-dark w-full justify-center px-6 py-4 text-base"
              >
                {c.open} <ArrowIcon />
              </button>
              <p className="mt-6 text-sm font-semibold text-white/75">{c.quickStart}</p>
              <div role="group" aria-label={c.quickStart} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PERSONAS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { choose(k); show(); }}
                    className="flex min-h-12 items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2.5 text-start ring-1 ring-white/12 transition-colors hover:bg-white/[0.12] hover:ring-brand-bright/50"
                  >
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-bright/15 text-brand-bright [&_svg]:size-4"><OptionIcon id={k} /></span>
                    <span className="text-[13px] font-semibold leading-tight text-white">{p.steps.persona.options[k].t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div id="plan-window" role="dialog" aria-modal="true" aria-labelledby="plan-window-title" className="fixed inset-0 z-[100] bg-[#030b16]/85 backdrop-blur-md">
              <motion.div
                className="flex h-full flex-col"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
              >
                <Studio
                  t={t} lang={lang} input={input} code={code} titleRef={titleRef}
                  setPersona={choose} setCargo={setCargo} setNet={setNet} setPriorities={setPriorities}
                  onClose={() => setOpen(false)} onReset={reset} onLocked={() => setPlan(input)}
                />
              </motion.div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

/* ───────────────────────── The studio window ───────────────────────── */

function Studio({
  t, lang, input, code, titleRef, setPersona, setCargo, setNet, setPriorities, onClose, onReset, onLocked,
}: {
  t: Dictionary; lang: Locale; input: PlanInput; code: string;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  setPersona: (p: Persona) => void;
  setCargo: React.Dispatch<React.SetStateAction<Cargo[]>>;
  setNet: React.Dispatch<React.SetStateAction<SizerInput>>;
  setPriorities: React.Dispatch<React.SetStateAction<Priority[]>>;
  onClose: () => void; onReset: () => void; onLocked: () => void;
}) {
  const p = t.planner;
  const c = studioCopy[lang];
  const sz = sizerCopy[lang].inputs;
  const net = input.net ?? DEFAULT_SIZER;
  const plan = useMemo(() => buildPlan(input), [input]);
  const q = useMemo(() => quote(net), [net]);
  const ref = quoteRef(code);
  const summary = studioSummary(t, lang, input, q, ref);
  const model = p.result.models[plan.model];
  const [copied, setCopied] = useState(false);
  const [locking, setLocking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quoteBox = useRef<HTMLDivElement>(null);
  // below lg the quote sits after the inputs: a small price bar floats until it scrolls into view
  const [quoteHidden, setQuoteHidden] = useState(false);
  useEffect(() => {
    const el = quoteBox.current;
    if (!el || !window.matchMedia("(max-width: 1023px)").matches) return;
    const io = new IntersectionObserver(([e]) => setQuoteHidden(!e.isIntersecting), { root: scrollRef.current, threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const set = <K extends keyof SizerInput>(k: K, v: SizerInput[K]) => setNet((n) => ({ ...n, [k]: v }));
  const toggle = <T,>(list: T[], v: T, max = 99) =>
    list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      track("plan_share", { channel: "copy" });
      window.setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard unavailable */ }
  };
  const wa = whatsappLink(summary);
  const onWa = () => { track("plan_share", { channel: "whatsapp" }); track("whatsapp_click", { location: "planner" }); };

  return (
    <>
      {/* console bar: what this is, the live model and its quote reference */}
      <div className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-white sm:px-6">
        <span aria-hidden="true" className="flex gap-1.5"><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-brand-bright/80" /></span>
        <h2 id="plan-window-title" ref={titleRef} tabIndex={-1} style={{ outline: "none" }} className="truncate font-display text-base font-semibold outline-none focus-visible:outline-none sm:text-lg">{c.console}</h2>
        <span className="hidden items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold ring-1 ring-white/10 md:inline-flex">
          <span className="relative inline-flex size-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-brand-bright/70 motion-reduce:hidden" /><span className="relative size-1.5 rounded-full bg-brand-bright" /></span>
          {c.live} · {model.name}
        </span>
        <span className="num hidden rounded-full bg-white/[0.08] px-3 py-1 font-mono text-xs text-white/85 ring-1 ring-white/10 sm:inline-block" title={c.ref}>{ref}</span>
        <span className="ms-auto hidden sm:block"><RiyadhClock label={lang === "ar" ? "الرياض" : "Riyadh"} /></span>
        <button type="button" onClick={onClose} aria-label={c.close} title={c.close}
          className="ms-auto grid size-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition-colors hover:bg-white/20 sm:ms-0">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      <div className="relative mx-2 mb-2 min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-surface text-ink ring-1 ring-white/10 sm:mx-4 sm:mb-4">
        <div ref={scrollRef} data-lenis-prevent className="grid h-full overflow-y-auto overscroll-contain lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)_minmax(0,25rem)] xl:overflow-hidden">
          {/* ── inputs ── */}
          <div data-lenis-prevent className="border-line p-4 pb-24 sm:p-5 lg:border-e lg:pb-5 xl:overflow-y-auto xl:overscroll-contain">
            <Group n={1} title={c.groups.you}>
              <div role="radiogroup" aria-label={p.steps.persona.q} className="flex flex-wrap gap-1.5">
                {PERSONAS.map((k) => (
                  <Chip key={k} role="radio" on={input.persona === k} icon={k} label={p.steps.persona.options[k].t} hint={p.steps.persona.options[k].d} onClick={() => setPersona(k)} />
                ))}
              </div>
            </Group>

            <Group n={2} title={c.groups.move}>
              <div role="group" aria-label={p.steps.cargo.q} className="flex flex-wrap gap-1.5">
                {CARGO.map((k) => (
                  <Chip key={k} role="checkbox" on={input.cargo.includes(k)} icon={k} label={p.steps.cargo.options[k].t} hint={p.steps.cargo.options[k].d} onClick={() => setCargo((x) => toggle(x, k))} />
                ))}
              </div>
            </Group>

            <Group n={3} title={c.groups.volume}>
              <Orders value={net.orders} onChange={(v) => set("orders", v)} lang={lang} />
              <Slider label={sz.peak} hint={sz.peakHint} min={1} max={5} step={0.5} value={net.peak} display={`${net.peak}×`} onChange={(v) => set("peak", v)} />
            </Group>

            <Group n={4} title={c.groups.route}>
              <Seg label={c.origin} options={ORIGINS} labels={c.origins} value={net.origin ?? "riyadh"} onChange={(v) => set("origin", v)} />
              <Seg label={c.dest} options={["riyadh", "multi", "kingdom"] as const} labels={c.dests} value={net.area} onChange={(v) => set("area", v)} />
              <AnimatePresence initial={false}>
                {net.area === "multi" ? (
                  <motion.div key="split" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: EASE_OUT }} className="overflow-hidden">
                    <Slider label={fmt(c.split, { n: net.split ?? 50 })} min={5} max={95} step={5} value={net.split ?? 50} display={`${net.split ?? 50}%`} onChange={(v) => set("split", v)} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Group>

            <Group n={5} title={c.groups.service}>
              <Seg label={c.window} options={WINDOWS} labels={sz.windows} value={net.window} onChange={(v) => set("window", v)} />
              <Seg label={c.profile} hint={c.profileHint} options={PROFILES} labels={sz.profiles} value={net.profile} onChange={(v) => set("profile", v)} />
              <Slider label={sz.cod} min={0} max={100} step={5} value={net.cod} display={`${net.cod}%`} onChange={(v) => set("cod", v)} />
              <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-subtle px-3 py-2.5">
                <span className="text-sm font-medium text-ink">{c.stock}</span>
                <input type="checkbox" role="switch" checked={net.stock} onChange={(e) => set("stock", e.target.checked)} className="peer sr-only" />
                <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2">
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ${net.stock ? "start-[1.375rem]" : "start-0.5"}`} />
                </span>
              </label>
            </Group>

            <Group n={6} title={c.groups.matters} hint={c.mattersHint} last>
              <div role="group" aria-label={p.steps.priorities.q} className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((k) => {
                  const on = input.priorities.includes(k);
                  const disabled = !on && input.priorities.length >= 3;
                  return (
                    <button key={k} type="button" role="checkbox" aria-checked={on} aria-disabled={disabled}
                      onClick={() => !disabled && setPriorities((x) => toggle(x, k, 3))}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-brand bg-brand text-white" : disabled ? "cursor-not-allowed border-line text-muted/70" : "border-line-strong text-ink hover:border-ink"}`}>
                      {on ? <CheckIcon className="size-3.5" /> : null}
                      {p.steps.priorities.options[k].t}
                    </button>
                  );
                })}
              </div>
            </Group>
          </div>

          {/* ── the plan: services, what's covered, the live network ── */}
          <div data-lenis-prevent data-col="plan" className="min-w-0 border-t border-line bg-paper/50 lg:order-3 lg:col-span-2 xl:order-none xl:col-span-1 xl:overflow-y-auto xl:overscroll-contain xl:border-e xl:border-t-0">
            <div className="p-4 sm:p-5">
              <p className="label">{p.result.eyebrow}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.h3 key={plan.model} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink rtl:tracking-normal">
                    {model.name}
                  </motion.h3>
                </AnimatePresence>
              </div>
              <p className="mt-1 text-sm text-muted">{model.desc}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{c.plan.title}</p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {plan.modules.map((m) => {
                    const s = p.services[m.id];
                    const why = m.reasons.map((x) => p.reasons[x]).filter(Boolean)[0];
                    return (
                      <motion.li key={m.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", ...SPRING_UI }}
                        className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-2.5">
                        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${m.core ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}><ServiceIcon id={m.id} className="size-4" /></span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold leading-tight text-ink">{s.name}</span>
                            <span className={`rounded px-1 py-px text-[10px] font-semibold ${m.core ? "bg-ink text-white" : "bg-subtle text-muted"}`}>{m.core ? c.plan.core : c.plan.addon}</span>
                          </span>
                          {why ? <span className="mt-0.5 block text-xs leading-snug text-brand">{why}</span> : null}
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{coveredCopy[lang].ui.included}</p>
              <MustList lang={lang} compact />
              <details className="group mt-3 rounded-xl border border-line bg-surface p-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
                  <span className="me-1 inline-block transition-transform group-open:rotate-90 rtl:group-open:-rotate-90">›</span>
                  {coveredCopy[lang].ui.handled}
                </summary>
                <div className="mt-3"><Pillars lang={lang} /></div>
              </details>
            </div>
            <div className="h-[26rem] border-t border-line">
              <PlanStage locale={lang} input={input} complete compact />
            </div>
          </div>

          {/* ── the quote ── */}
          <div id="studio-quote" ref={quoteBox} data-lenis-prevent className="flex min-w-0 flex-col border-t border-line lg:order-2 lg:border-t-0 xl:order-none xl:overflow-y-auto xl:overscroll-contain">
            <div className="flex-1 p-4 sm:p-5">
              <Ledger q={q} lang={lang} peak={net.peak} />
            </div>
            {/* actions stay in reach: pinned to the bottom of the window on small screens */}
            <div className="sticky bottom-0 z-10 border-t border-line bg-surface/95 p-3 backdrop-blur sm:p-4">
              <AnimatePresence initial={false} mode="wait">
                {locking ? (
                  <motion.div key="lock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
                    <LockForm lang={lang} code={code} refId={ref} summary={summary} wa={wa} onSent={onLocked} onCancel={() => setLocking(false)} />
                  </motion.div>
                ) : (
                  <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid gap-2">
                    <button type="button" onClick={() => { setLocking(true); track("cta_click", { cta: "lock_quote", location: "planner" }); }} className="btn-primary w-full justify-center px-5 py-3">
                      {c.lock.cta} <span className="num font-mono text-xs opacity-75">{ref}</span>
                    </button>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                      <a href={wa} target="_blank" rel="noopener noreferrer" onClick={onWa}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink">
                        <WhatsAppIcon className="size-4 text-whatsapp" /> {c.whatsapp}
                      </a>
                      <button type="button" onClick={copy} className="rounded-full border border-line-strong px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink">
                        <span aria-live="polite">{copied ? c.copied : c.copy}</span>
                      </button>
                      <button type="button" onClick={onReset} className="rounded-full px-3 py-2.5 text-sm text-muted transition-colors hover:text-ink">{c.reset}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {quoteHidden ? (
            <motion.aside data-rate-card aria-label={c.quote.title} key="bar"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.2, ease: EASE_OUT }}
              className="absolute inset-x-2 bottom-2 z-20 flex items-center gap-3 rounded-2xl bg-teal-deep p-2 ps-4 text-white shadow-[0_20px_40px_-12px_rgba(3,11,22,0.6)] lg:hidden">
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-white/70">{c.quote.title} · {c.quote.month}</span>
                <span className="num block font-display text-xl font-semibold" dir="ltr">≈ {sar(lang, q.subtotal)}</span>
              </span>
              <button type="button" onClick={() => quoteBox.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-teal-deep">{c.seeQuote}</button>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ───────────────────────── The quote ledger ───────────────────────── */

function Ledger({ q, lang, peak }: { q: Quote; lang: Locale; peak: number }) {
  const c = studioCopy[lang].quote;
  const reduce = useReducedMotion();
  const ar = lang === "ar";
  const num = (v: number, decimals = 0, compact = false) => {
    const format = { maximumFractionDigits: decimals, ...(compact ? { notation: "compact" as const } : {}) };
    return reduce ? <>{v.toLocaleString("en-US", format)}</> : <NumberFlow value={v} locales="en-US" format={format} />;
  };
  const money = (v: number, decimals = 0, compact = false) => (
    <span dir="ltr" className="num whitespace-nowrap">{ar ? null : <span className="me-1 text-[0.6em] text-ink/60">SAR</span>}{num(v, decimals, compact)}{ar ? <span className="ms-1 text-[0.6em] text-ink/60">ريال</span> : null}</span>
  );
  const progress = Math.min(1, q.monthly / q.tier.from);
  return (
    <aside data-rate-card aria-label={c.title}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand rtl:tracking-normal">{c.title}</p>
        <p className="text-[11px] text-muted">{c.noVat}</p>
      </div>

      {/* the headline: per month, per order, per year */}
      <p className="mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-ink">
        <span className="text-2xl text-ink/50">≈ </span>{money(q.subtotal)}
      </p>
      <p className="text-sm text-muted">{c.month}</p>
      <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
        {[
          { k: c.perOrder, v: money(q.perOrder, 1) },
          { k: c.year, v: money(q.annual, 1, true) },
          { k: c.day, v: money(q.day) },
        ].map((x) => (
          <div key={x.k} className="bg-surface px-2 py-2.5">
            <dd className="font-display text-base font-semibold text-ink">{x.v}</dd>
            <dt className="mt-0.5 text-[11px] text-muted">{x.k}</dt>
          </div>
        ))}
      </dl>

      {/* each lane, itemised */}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {q.lanes.map((l) => (
          <li key={l.lane} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="block font-medium text-ink">{c.lanes[l.lane]}</span>
              <span className="num block text-xs text-muted" dir="ltr">{fmt(c.shipments, { n: l.shipments.toLocaleString("en-US"), rate: l.rate })}</span>
            </span>
            <span className="font-semibold text-ink">{money(l.total)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="text-muted">{fmt(c.peakDay, { x: `${peak}×` })}</span>
          <span className="font-semibold text-ink">{money(q.peakDay)}</span>
        </li>
      </ul>

      {/* the volume tier: how close the visitor is, and what it saves */}
      <div className="mt-4 rounded-xl bg-brand-soft/70 p-3">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-brand">
          <span>{fmt(c.tierLabel, { n: q.tier.from })}</span>
          {q.tier.reached ? <CheckIcon className="size-4" /> : null}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] rtl:origin-right" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="mt-2 text-xs text-ink/80">
          {q.tier.reached
            ? fmt(c.tierReached, { saving: q.tier.saving.toLocaleString("en-US") })
            : fmt(c.tierToGo, { n: q.tier.toGo.toLocaleString("en-US"), saving: q.tier.saving.toLocaleString("en-US") })}
        </p>
      </div>

      {/* everything the rate card does not cover, itemised and owned by MSG */}
      <p className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">{c.extrasTitle}</p>
      <ul className="grid gap-1">
        <AnimatePresence initial={false}>
          {q.extras.map((x) => (
            <motion.li key={x.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}
              className="flex items-center justify-between gap-3 overflow-hidden text-sm">
              <span className="text-ink">{c.extras[x.id]}{x.shipments ? <span className="num ms-1.5 text-xs text-muted">× {x.shipments.toLocaleString("en-US")}</span> : null}</span>
              {x.total != null
                ? <span className="font-semibold text-ink">{money(x.total)}</span>
                : <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted">{x.rate != null ? fmt(c.perShipment, { rate: x.rate }) : c.byMsg}</span>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">{c.basis}</p>
    </aside>
  );
}

/* ───────────────────────── Lock this quote ───────────────────────── */

function LockForm({
  lang, code, refId, summary, wa, onSent, onCancel,
}: { lang: Locale; code: string; refId: string; summary: string; wa: string; onSent: () => void; onCancel: () => void }) {
  const c = studioCopy[lang].lock;
  const id = useId();
  const stored = useMemo<Visitor | null>(() => {
    try { const v = localStorage.getItem(VISITOR); return v ? (JSON.parse(v) as Visitor) : null; } catch { return null; }
  }, []);
  const [name, setName] = useState(stored?.name ?? "");
  const [phone, setPhone] = useState(stored?.phone ?? "");
  const [company, setCompany] = useState(stored?.company ?? "");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "consent" | "form", string>>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "handoff">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    const ph = normalizePhone(phone);
    if (!name.trim()) err.name = c.errors.required;
    if (!phone.trim()) err.phone = c.errors.required;
    else if (!ph) err.phone = c.errors.phone;
    if (!consent) err.consent = c.errors.consent;
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`${id}-${err.name ? "name" : err.phone ? "phone" : "consent"}`)?.focus();
      return;
    }
    setState("busy");
    const v: Visitor = { name: name.trim(), phone: ph!, company: company.trim() || undefined };
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, website: trap, lang, source: "plan-studio", interest: "quote_locked", plan: code, message: summary }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { delivered?: boolean };
      try { localStorage.setItem(VISITOR, JSON.stringify(v)); } catch { /* fine */ }
      track("lead_submit", { location: "planner" });
      onSent();
      setState(j.delivered ? "done" : "handoff");
    } catch {
      setErrors({ form: c.errors.network });
      setState("idle");
    }
  };

  if (state === "done" || state === "handoff") {
    return (
      <div role="status" className="grid gap-2">
        <p className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <span className="grid size-6 place-items-center rounded-full bg-brand text-white"><CheckIcon className="size-3.5" /></span>
          {fmt(c.done, { ref: refId })}
        </p>
        <p className="text-sm text-muted">{state === "done" ? c.doneBody : c.handoff}</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 font-semibold text-white">
          <WhatsAppIcon className="size-4" /> WhatsApp
        </a>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none";
  const err = (k: keyof typeof errors) => (errors[k] ? <p id={`${id}-${k}-err`} className="mt-1 text-xs text-danger">{errors[k]}</p> : null);
  return (
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`} className="font-semibold text-ink">{c.title} <span className="num font-mono text-xs text-muted">{refId}</span></p>
      <p className="text-xs text-muted">{c.body}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-xs font-medium text-ink">{c.name}</label>
          <input id={`${id}-name`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-err` : undefined} className={field} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="text-xs font-medium text-ink">{c.phone}</label>
          <input id={`${id}-phone`} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={c.phoneHint} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-err` : undefined} className={`${field} text-start rtl:text-right`} />
          {err("phone")}
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-company`} className="text-xs font-medium text-ink">{c.company} <span className="font-normal text-muted">({c.optional})</span></label>
          <input id={`${id}-company`} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} className={field} />
        </div>
      </div>
      <input type="text" name="studio-website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -start-[9999px] size-px opacity-0" />
      <label className="mt-2 flex items-start gap-2 text-xs text-ink/80">
        <input id={`${id}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-err` : undefined} className="mt-0.5 size-4 shrink-0 accent-brand" />
        {c.consent}
      </label>
      {err("consent")}
      {err("form")}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button type="submit" disabled={state === "busy"} className="btn-primary justify-center px-5 py-2.5 disabled:opacity-60">{state === "busy" ? c.sending : c.submit}</button>
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2.5 text-sm text-muted hover:text-ink">{c.back}</button>
      </div>
    </form>
  );
}

/* ───────────────────────── Controls ───────────────────────── */

function Group({ n, title, hint, last = false, children }: { n: number; title: string; hint?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className={`min-w-0 ${last ? "" : "mb-4 border-b border-line pb-4"}`}>
      <legend className="mb-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">
        <span className="num grid size-5 place-items-center rounded-full bg-ink text-[10px] text-white">{n}</span>
        {title}
        {hint ? <span className="ms-auto font-normal normal-case tracking-normal">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function Chip({ role, on, icon, label, hint, onClick }: { role: "radio" | "checkbox"; on: boolean; icon: string; label: string; hint: string; onClick: () => void }) {
  return (
    <button type="button" role={role} aria-checked={on} onClick={onClick} title={hint || undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border py-1 pe-3 ps-1 text-[13px] transition-colors ${on ? "border-brand bg-brand-soft font-semibold text-ink shadow-[0_0_0_1px_var(--color-brand)]" : "border-line-strong text-ink hover:border-ink"}`}>
      <span aria-hidden="true" className={`grid size-6 place-items-center rounded-full ${on ? "bg-brand text-white" : "bg-subtle text-ink-3"}`}><OptionIcon id={icon} className="size-3.5" /></span>
      {label}
      {hint ? <span className="sr-only">{hint}</span> : null}
    </button>
  );
}

function Seg<T extends string>({ label, hint, options, labels, value, onChange }: { label: string; hint?: string; options: readonly T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink">{label}{hint ? <span className="text-[11px] font-normal text-muted">{hint}</span> : null}</p>
      <div role="radiogroup" aria-label={label} className="mt-1.5 grid gap-1 rounded-lg bg-subtle p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
            className={`rounded-md px-1.5 py-1.5 text-[13px] leading-tight transition-ui duration-200 ${value === o ? "bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(17,26,51,0.12)]" : "text-muted hover:text-ink"}`}>
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, hint, min, max, step, value, display, onChange }: { label: string; hint?: string; min: number; max: number; step: number; value: number; display: string; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
        <output htmlFor={id} className="num font-display text-lg font-semibold text-ink">{display}</output>
      </div>
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={display}
        onChange={(e) => onChange(+e.target.value)} className="sizer-range mt-1.5 w-full" />
    </div>
  );
}

/** orders a day: type the exact number, nudge it, or slide (the slider is logarithmic so 1 and 50,000 both fit) */
function Orders({ value, onChange, lang }: { value: number; onChange: (v: number) => void; lang: Locale }) {
  const c = studioCopy[lang];
  const u = sizerCopy[lang].inputs;
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(50_000, Math.max(1, Math.round(n)));
  const nudge = (d: 1 | -1) => onChange(clamp(value < 20 ? value + d : value * (d > 0 ? 1.1 : 1 / 1.1)));
  const btn = "grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-lg text-ink transition-colors hover:border-ink";
  return (
    <div>
      <label htmlFor={`${id}-n`} className="text-sm font-medium text-ink">{c.ordersInput}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <button type="button" onClick={() => nudge(-1)} aria-label={c.ordersMinus} className={btn}>−</button>
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5 rounded-xl bg-subtle px-3 py-1.5">
          <input id={`${id}-n`} type="text" inputMode="numeric" dir="ltr"
            value={draft ?? value.toLocaleString("en-US")}
            onFocus={(e) => { setDraft(String(value)); e.target.select(); }}
            onChange={(e) => {
              const raw = e.target.value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[^\d]/g, "");
              setDraft(raw);
              if (raw) onChange(clamp(+raw));
            }}
            onBlur={() => setDraft(null)}
            className="num w-full min-w-0 bg-transparent font-display text-2xl font-semibold tracking-[-0.02em] text-ink outline-none" />
          <span className="shrink-0 text-xs text-muted">{u.ordersUnit}</span>
        </div>
        <button type="button" onClick={() => nudge(1)} aria-label={c.ordersPlus} className={btn}>+</button>
      </div>
      <input type="range" min={0} max={1000} step={1} aria-label={c.ordersInput}
        value={Math.round(sliderFromOrders(value) * 1000)}
        aria-valuetext={`${value.toLocaleString("en-US")} ${u.ordersUnit}`}
        onChange={(e) => onChange(ordersFromSlider(+e.target.value / 1000))}
        className="sizer-range mt-2 w-full" />
    </div>
  );
}
