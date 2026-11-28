"use client";

/* eslint-disable @next/next/no-img-element -- small thumbnails of MSG's own photographs, sized by fit() */
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useId, useState } from "react";
import { configuratorCopy, CHAPTER_IDS, CHAPTER_PHOTO, PERSONA_PHOTO, type ChapterId } from "@/content/configurator";
import { coveredCopy } from "@/content/covered";
import { cockpitCopy } from "@/content/cockpit";
import { sizerCopy } from "@/content/sizerCopy";
import { whatsappLink } from "@/content/facts";
import { fmt, type Dictionary, type Locale } from "@/content/i18n";
import { priceFor } from "@/lib/configure";
import { fit } from "@/lib/img";
import { EASE_OUT } from "@/lib/motion";
import { PERSONAS, PRIORITIES, buildPlan, type Cargo, type Persona, type PlanInput, type Priority } from "@/lib/planner";
import { planSummary } from "@/lib/plan-summary";
import { AREAS, PROFILES, WINDOWS, ordersFromSlider, sliderFromOrders, ORDER_MAX, ORDER_MIN, type SizerInput } from "@/lib/sizer";
import { track } from "@/lib/analytics";
import { ArrowIcon, CheckIcon, ServiceIcon, WhatsAppIcon } from "../ui/icons";
import { MustList, Pillars } from "../planner/Covered";
import PlanStage from "../planner/PlanStage";
import { RouteMap, SpeedTimeline, StagePhoto, VolumeField } from "./Stage";

export const TOTAL = CHAPTER_IDS.length; // 5 chapters; step 5 is the blueprint
export type Step = 0 | 1 | 2 | 3 | 4 | 5;

type Props = {
  t: Dictionary;
  lang: Locale;
  reduce: boolean;
  step: Step;
  setStep: (s: Step) => void;
  reached: number;
  persona: Persona | null;
  onPersona: (p: Persona) => void;
  cargo: Cargo[];
  setCargo: (c: Cargo[]) => void;
  net: SizerInput;
  onNet: (v: SizerInput) => void;
  priorities: Priority[];
  setPriorities: (p: Priority[]) => void;
  input: PlanInput | null;
  liveInput: PlanInput | null;
  onFinish: () => void;
  onClose: () => void;
  onRestart: () => void;
  onSend: () => void;
  onCopy: () => void;
  copied: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  scroller: React.RefObject<HTMLDivElement | null>;
};

const SERVICES: Cargo[] = ["storage", "b2b", "freight", "people"];

/**
 * Build My Plan as MSG's configurator: a split screen with a visual stage on one side and the chapter on the
 * other, five chapters (business, volume, route, speed, services) and a blueprint at the end. All state lives in
 * the Planner section (URL sharing, deep links and the contact hand-off are unchanged); this draws it.
 * Phones get the stage as a band on top, the chapter below and a thumb bar at the foot, and swipe between chapters.
 */
export default function Configurator(props: Props) {
  const { t, lang, reduce, step, setStep, reached, persona, net, onClose, headingRef, scroller } = props;
  const c = configuratorCopy[lang];
  const rtl = lang === "ar";
  const [dir, setDir] = useState(1);
  const drag = useDragControls();
  const id = step < 5 ? CHAPTER_IDS[step] : null;

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };
  const canNext = step === 0 ? persona !== null : step < 5;
  const next = () => {
    if (step === 4) return props.onFinish();
    if (step < 4 && canNext) {
      track("planner_step", { step: step + 1, value: CHAPTER_IDS[step] });
      go((step + 1) as Step);
    }
  };
  const back = () => { if (step > 0) go((step - 1) as Step); };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x * (rtl ? -1 : 1);
    if (Math.abs(info.offset.x) < 70 || Math.abs(info.offset.y) > Math.abs(info.offset.x)) return;
    if (dx < 0) next(); else back();
  };
  const sign = rtl ? -1 : 1;
  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: 36 * dir * sign },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 * dir * sign },
        transition: { duration: 0.32, ease: EASE_OUT },
      };

  return (
    <div className="flex h-full flex-col bg-[#0b0f17] text-white">
      {/* the bar: the product, and the way out */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/10 px-4 sm:px-6 lg:h-16 lg:px-10">
        <p id="plan-window-title" className="flex min-w-0 items-baseline gap-2.5 font-display text-lg font-semibold tracking-[-0.02em] rtl:tracking-normal">
          <span className="truncate">{c.brand}</span>
          <span aria-hidden="true" className="text-[#009df8]">/</span>
          <span className="truncate font-normal text-white/70">{c.product}</span>
        </p>
        <span className="ms-auto hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55 md:block rtl:tracking-normal">{id ? c.chapters[id].label : c.blueprint.eyebrow}</span>
        <button type="button" onClick={onClose} aria-label={c.close} title={c.close}
          className="ms-auto grid size-10 shrink-0 place-items-center rounded-full text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white md:ms-0">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>

      {step === 5 ? (
        <div ref={scroller} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Blueprint {...props} go={go} />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:grid-rows-1">
          {/* the stage */}
          <div className="relative h-[26svh] min-h-[10rem] overflow-hidden lg:h-auto">
            <StageFor id={id!} {...props} />
          </div>

          {/* the chapter */}
          <div className="relative flex min-h-0 flex-col border-white/10 lg:border-s">
            <div ref={scroller} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <motion.div
                drag={reduce ? false : "x"}
                dragControls={drag}
                dragListener={false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={onDragEnd}
                onPointerDown={(e) => {
                  if (e.pointerType !== "touch") return;
                  if ((e.target as HTMLElement).closest("input, textarea, select, [data-no-swipe]")) return;
                  drag.start(e);
                }}
                className="mx-auto max-w-[44rem] px-5 pb-8 pt-6 sm:px-8 lg:px-12 lg:pb-12 lg:pt-12"
                style={{ touchAction: "pan-y" }}
              >
                <Progress step={step} reached={reached} lang={lang} onGo={go} />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={step} {...slide}>
                    <p className="lbl-cfg mt-8 text-[#7fcbfb]">{c.chapters[id!].label}</p>
                    <h3 ref={headingRef} tabIndex={-1} style={{ outline: "none" }} className="mt-3 font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.035em] outline-none text-balance rtl:leading-[1.3] rtl:tracking-normal">
                      {c.chapters[id!].title}
                    </h3>
                    <p className="mt-3 max-w-lg text-white/70 text-pretty">{c.chapters[id!].lead}</p>
                    <div className="mt-8">
                      <ChapterBody id={id!} {...props} go={go} />
                    </div>
                  </motion.div>
                </AnimatePresence>
                <p className="mt-8 text-center text-xs text-white/40 lg:hidden">{c.swipe}</p>
              </motion.div>
            </div>

            {/* the thumb bar: back, the estimate so far, continue */}
            <div className="shrink-0 border-t border-white/10 bg-[#0b0f17]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 lg:px-12 lg:py-5">
              <div className="mx-auto flex max-w-[44rem] items-center gap-3">
                <button type="button" onClick={back} disabled={step === 0}
                  className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent">
                  <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" /> <span className="max-sm:sr-only">{t.planner.back}</span>
                </button>
                <div className="min-w-0 flex-1">{step >= 1 ? <PriceInline net={net} lang={lang} reduce={reduce} /> : null}</div>
                <button type="button" onClick={next} disabled={!canNext}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#0b0f17] transition-[background-color,transform] hover:bg-[#dff1ff] active:scale-[0.98] disabled:opacity-40 sm:px-6">
                  {step === 4 ? t.planner.build : t.planner.next} <ArrowIcon className="size-4 rtl:-scale-x-100" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── progress ───────────────────────── */

function Progress({ step, reached, lang, onGo }: { step: number; reached: number; lang: Locale; onGo: (s: Step) => void }) {
  const c = configuratorCopy[lang];
  return (
    <nav aria-label={c.product} className="flex items-center gap-4">
      <ol className="flex flex-1 gap-1.5">
        {CHAPTER_IDS.map((cid, i) => {
          const can = i <= reached && i !== step;
          return (
            <li key={cid} className="flex-1">
              <button type="button" disabled={!can} onClick={() => onGo(i as Step)} aria-current={i === step ? "step" : undefined}
                aria-label={`${i + 1}. ${c.chapters[cid].label}`} className="group block w-full py-2">
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/12">
                  <motion.span className="block h-full rounded-full bg-[#009df8] origin-left rtl:origin-right" initial={false}
                    animate={{ scaleX: i < step ? 1 : i === step ? 0.5 : 0 }} transition={{ duration: 0.45, ease: EASE_OUT }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="num shrink-0 font-display text-base" dir="ltr">
        <span className="font-semibold text-[#7fcbfb]">{String(step + 1).padStart(2, "0")}</span>
        <span className="text-white/45"> / {String(TOTAL).padStart(2, "0")}</span>
      </p>
    </nav>
  );
}

/* ───────────────────────── the stage, per chapter ───────────────────────── */

function StageFor({ id, t, lang, reduce, persona, net, liveInput }: Props & { id: ChapterId }) {
  const c = configuratorCopy[lang];
  const ch = c.chapters[id];
  const photo = id === "profile" ? (persona ? PERSONA_PHOTO[persona] : CHAPTER_PHOTO.profile) : id === "route" ? null : CHAPTER_PHOTO[id];
  const plan = liveInput ? buildPlan(liveInput) : null;
  return (
    <>
      {photo ? <StagePhoto src={photo.src} pos={photo.pos} reduce={reduce} dim={id === "profile" ? 0.25 : 0.55} /> : <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_45%_55%,#122244,#0b0f17)]" />}
      <div className="relative flex h-full flex-col justify-end p-5 sm:p-8 lg:p-12">
        {id === "route" ? (
          <div className="absolute inset-x-6 top-6 bottom-[42%] flex items-center justify-center max-lg:inset-x-3 max-lg:top-2 max-lg:bottom-2 lg:bottom-[34%]">
            <div className="h-full max-h-full w-full max-w-[34rem] [&>svg]:h-full [&>svg]:w-full"><RouteMap area={net.area} lang={lang} reduce={reduce} /></div>
          </div>
        ) : null}
        {id === "volume" ? <div className="mb-8 max-lg:hidden"><VolumeField net={net} lang={lang} reduce={reduce} /></div> : null}
        {id === "speed" ? <div className="mb-10 max-lg:mb-4"><SpeedTimeline window={net.window} lang={lang} reduce={reduce} /></div> : null}
        <div className={id === "route" ? "max-lg:hidden" : ""}>
          <p className="lbl-cfg flex items-center gap-2.5 text-white/75 max-lg:hidden"><span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-[#009df8]" />{c.eyebrow}</p>
          <p className="mt-4 font-display text-[clamp(1.5rem,3.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-balance max-lg:hidden rtl:leading-[1.3] rtl:tracking-normal">{ch.stage}</p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75 text-pretty max-lg:hidden">{id === "profile" && persona ? c.personaStage[persona] : ch.stageLead}</p>
        </div>
        {/* what the answers have switched on so far */}
        {plan && id !== "route" ? (
          <aside aria-label={t.planner.preview.title} className="mt-6 max-lg:hidden">
            <ul className="flex flex-wrap gap-1.5">
              {plan.modules.map((m) => (
                <li key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] text-white/85 ring-1 ring-white/10">
                  <ServiceIcon id={m.id} className="size-3.5 text-[#7fcbfb]" /> {t.planner.services[m.id].name}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </>
  );
}

/* ───────────────────────── chapters ───────────────────────── */

function ChapterBody(p: Props & { id: ChapterId; go: (s: Step) => void }) {
  switch (p.id) {
    case "profile": return <ProfileChapter {...p} />;
    case "volume": return <VolumeChapter {...p} />;
    case "route": return <RouteChapter {...p} />;
    case "speed": return <SpeedChapter {...p} />;
    case "services": return <ServicesChapter {...p} />;
  }
}

function ProfileChapter({ t, persona, onPersona, go }: Props & { go: (s: Step) => void }) {
  const o = t.planner.steps.persona;
  return (
    <div role="radiogroup" aria-label={o.q} className="grid gap-2.5">
      {PERSONAS.map((k) => {
        const on = persona === k;
        const ph = PERSONA_PHOTO[k];
        return (
          <button key={k} type="button" role="radio" aria-checked={on}
            onClick={() => { onPersona(k); go(1); }}
            className={`group relative flex items-center gap-4 rounded-2xl p-2.5 pe-4 text-start ring-1 transition-[background-color,box-shadow] duration-200 ${on ? "bg-white/[0.07] ring-[#009df8]" : "ring-white/12 hover:bg-white/[0.04] hover:ring-white/30"}`}>
            <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-[4.5rem] sm:w-28">
              <img src={ph.src} {...fit(ph.src, "112px")} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: ph.pos }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] sm:text-lg rtl:tracking-normal">{o.options[k].t}</span>
              <span className="mt-1 block text-sm leading-snug text-white/60">{o.options[k].d}</span>
            </span>
            <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors ${on ? "bg-[#009df8] text-white" : "text-white/50 group-hover:text-white"}`}>
              {on ? <CheckIcon className="size-4" /> : <ArrowIcon className="size-4 rtl:-scale-x-100" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function VolumeChapter({ net, onNet, lang, reduce }: Props) {
  const c = configuratorCopy[lang].volume;
  const z = sizerCopy[lang].inputs;
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const set = <K extends keyof SizerInput>(k: K, v: SizerInput[K]) => onNet({ ...net, [k]: v });
  const commit = (raw: string) => {
    const n = Math.round(Number(raw.replace(/[^\d]/g, "")));
    if (Number.isFinite(n) && n > 0) set("orders", Math.min(ORDER_MAX, Math.max(ORDER_MIN, n)));
    setDraft(null);
  };
  return (
    <div className="grid gap-8">
      <div>
        <label htmlFor={`${id}-n`} className="text-sm font-medium text-white/80">{c.custom}</label>
        <div className="mt-2 flex items-baseline gap-3">
          <input id={`${id}-n`} inputMode="numeric" autoComplete="off" dir="ltr"
            value={draft ?? net.orders.toLocaleString("en-US")}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit((e.target as HTMLInputElement).value); }}
            className="num w-[7ch] min-w-0 border-b border-white/25 bg-transparent pb-1 font-display text-5xl font-semibold tracking-[-0.04em] text-white outline-none transition-colors focus:border-[#009df8] sm:text-6xl"
            aria-describedby={`${id}-h`} />
          <span className="text-white/60">{c.perDay}</span>
        </div>
        <p id={`${id}-h`} className="mt-1 text-xs text-white/45">{c.customHint}</p>
        <input type="range" min={0} max={1000} step={1} aria-label={c.custom}
          value={Math.round(sliderFromOrders(net.orders) * 1000)}
          aria-valuetext={`${net.orders.toLocaleString("en-US")} ${c.perDay}`}
          onChange={(e) => { setDraft(null); set("orders", ordersFromSlider(+e.target.value / 1000)); }}
          className="cfg-range mt-5 w-full" />
      </div>
      <div className="lg:hidden"><VolumeField net={net} lang={lang} reduce={reduce} /></div>
      <Chips label={z.peak} hint={z.peakHint} options={["1", "1.5", "2", "2.5", "3", "4", "5"] as const} labels={(v) => `${v}×`} value={String(net.peak)} onChange={(v) => set("peak", +v)} />
      <Chips label={c.size} options={PROFILES} labels={(v) => z.profiles[v]} value={net.profile} onChange={(v) => set("profile", v)} />
    </div>
  );
}

function RouteChapter({ net, onNet, lang }: Props) {
  const z = sizerCopy[lang].inputs;
  const c = configuratorCopy[lang].route;
  return (
    <>
      <Choices label={z.area} options={AREAS} value={net.area} onChange={(v) => onNet({ ...net, area: v })}
        title={(v) => z.areas[v]} desc={(v) => c.areaLead[v]} />
      <p className="mt-5 text-xs leading-relaxed text-white/45">{c.note}</p>
    </>
  );
}

function SpeedChapter({ net, onNet, lang }: Props) {
  const z = sizerCopy[lang].inputs;
  const c = configuratorCopy[lang].speed;
  const order = ["nextday", "sameday", "scheduled"] as const;
  return (
    <>
      <Choices label={z.window} options={order.filter((w) => (WINDOWS as readonly string[]).includes(w))} value={net.window} onChange={(v) => onNet({ ...net, window: v })}
        title={(v) => z.windows[v]} desc={(v) => c.lead[v]} />
      <p className="mt-5 text-xs leading-relaxed text-white/45">{c.note}</p>
    </>
  );
}

function ServicesChapter({ t, lang, cargo, setCargo, net, onNet, priorities, setPriorities }: Props) {
  const c = configuratorCopy[lang].services;
  const o = t.planner.steps.cargo.options;
  const pr = t.planner.steps.priorities;
  const toggleCargo = (k: Cargo) => {
    const on = cargo.includes(k);
    const nextCargo = on ? cargo.filter((x) => x !== k) : [...cargo, k];
    setCargo(nextCargo);
    if (k === "storage") onNet({ ...net, stock: !on });
  };
  const codOn = net.cod > 0;
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <Module role="checkbox" checked={cargo.includes("parcels")} title={o.parcels.t} desc={c.baseD} icon="last-mile" onClick={() => toggleCargo("parcels")} />
        <p className="lbl-cfg mt-4 text-white/50">{c.extras}</p>
        {SERVICES.map((k) => (
          <Module key={k} role="checkbox" checked={cargo.includes(k)} title={o[k].t} desc={o[k].d}
            icon={k === "storage" ? "warehousing" : k === "people" ? "manpower" : k === "freight" ? "fleet" : "land-freight"} onClick={() => toggleCargo(k)} />
        ))}
        <Module role="checkbox" checked={codOn} title={sizerCopy[lang].inputs.cod} desc={`${net.cod}%`} icon="account" onClick={() => onNet({ ...net, cod: codOn ? 0 : 30 })}>
          {codOn ? (
            <input type="range" min={5} max={100} step={5} value={net.cod} aria-label={c.codShare} aria-valuetext={`${net.cod}%`}
              onChange={(e) => onNet({ ...net, cod: +e.target.value })} onClick={(e) => e.stopPropagation()} className="cfg-range mt-3 w-full" data-no-swipe />
          ) : null}
        </Module>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="lbl-cfg text-white/50">{c.matters}</p>
          <p className="text-xs text-white/45">{c.mattersHint}</p>
        </div>
        <div role="group" aria-label={pr.q} className="mt-3 flex flex-wrap gap-2">
          {PRIORITIES.map((k) => {
            const on = priorities.includes(k);
            const disabled = !on && priorities.length >= 3;
            return (
              <button key={k} type="button" role="checkbox" aria-checked={on} aria-disabled={disabled}
                onClick={() => { if (!disabled) setPriorities(on ? priorities.filter((x) => x !== k) : [...priorities, k]); }}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors ${on ? "bg-white text-[#0b0f17]" : disabled ? "cursor-not-allowed text-white/30 ring-1 ring-white/10" : "text-white/85 ring-1 ring-white/20 hover:ring-white/50"}`}>
                {on ? <CheckIcon className="size-3.5" /> : null}{pr.options[k].t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── controls ───────────────────────── */

function Choices<T extends string>({ label, options, value, onChange, title, desc }: {
  label: string; options: readonly T[]; value: T; onChange: (v: T) => void; title: (v: T) => string; desc: (v: T) => string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2.5">
      {options.map((v) => {
        const on = v === value;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} aria-label={title(v)} onClick={() => onChange(v)}
            className={`relative flex items-start gap-4 rounded-2xl px-5 py-4 text-start ring-1 transition-[background-color,box-shadow] duration-200 ${on ? "bg-white/[0.07] ring-[#009df8]" : "ring-white/12 hover:bg-white/[0.04] hover:ring-white/30"}`}>
            <span aria-hidden="true" className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full ring-2 transition-colors ${on ? "bg-[#009df8] ring-[#009df8]" : "ring-white/30"}`}>
              {on ? <span className="size-2 rounded-full bg-white" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold leading-tight">{title(v)}</span>
              <span className="mt-1 block text-sm leading-snug text-white/60">{desc(v)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Chips<T extends string>({ label, hint, options, labels, value, onChange }: {
  label: string; hint?: string; options: readonly T[]; labels: (v: T) => string; value: string; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-white/80">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-white/45">{hint}</p> : null}
      <div role="radiogroup" aria-label={label} className="mt-3 flex flex-wrap gap-1.5">
        {options.map((v) => {
          const on = v === value;
          return (
            <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)}
              className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${on ? "bg-white text-[#0b0f17]" : "text-white/80 ring-1 ring-white/18 hover:ring-white/45"}`}>
              <span className="num">{labels(v)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Module({ role, checked, title, desc, icon, onClick, children }: {
  role: "checkbox"; checked: boolean; title: string; desc: string; icon: string; onClick: () => void; children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl ring-1 transition-[background-color,box-shadow] duration-200 ${checked ? "bg-white/[0.07] ring-[#009df8]/70" : "ring-white/12 hover:ring-white/30"}`}>
      <button type="button" role={role} aria-checked={checked} aria-label={title} onClick={onClick} className="flex w-full items-center gap-4 px-4 py-3.5 text-start">
        <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${checked ? "bg-[#009df8] text-white" : "bg-white/[0.06] text-white/70"}`}>
          <ServiceIcon id={icon} className="size-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight">{title}</span>
          <span className="mt-0.5 block text-sm leading-snug text-white/55">{desc}</span>
        </span>
        <span aria-hidden="true" className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? "bg-[#009df8]" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ${checked ? "start-[1.125rem]" : "start-0.5"}`} />
        </span>
      </button>
      {children ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

/* ───────────────────────── price ───────────────────────── */

function PriceInline({ net, lang, reduce }: { net: SizerInput; lang: Locale; reduce: boolean }) {
  const c = configuratorCopy[lang].price;
  const p = priceFor(net);
  const ar = lang === "ar";
  return (
    <aside data-rate-card aria-label={cockpitCopy[lang].estimate} className="min-w-0 text-center sm:text-start">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 rtl:tracking-normal">{c.title}</span>
      {p.kind === "estimate" ? (
        <>
        {/* the rolling figure is drawn for the eye; the plain value is what screen readers (and copied text) get */}
        <span className="sr-only">{ar ? `≈ ${p.perOrder} ريال ${c.perOrder}` : `≈ SAR ${p.perOrder} ${c.perOrder}`}</span>
        <span aria-hidden="true" className="flex items-baseline justify-center gap-1 font-display font-semibold sm:justify-start">
          <span className="text-xs text-white/60">≈</span>
          {ar ? null : <span className="text-xs text-white/60">SAR</span>}
          <span className="num text-xl" dir="ltr">{reduce ? p.perOrder : <NumberFlow value={p.perOrder} locales="en-US" />}</span>
          {ar ? <span className="text-xs text-white/60">ريال</span> : null}
          <span className="ms-1 text-xs font-normal text-white/55">{c.perOrder}</span>
        </span>
        </>
      ) : (
        <span className="block truncate font-display text-base font-semibold text-[#7fcbfb]">{c.confirm}</span>
      )}
    </aside>
  );
}

function PriceCard({ net, lang }: { net: SizerInput; lang: Locale }) {
  const c = configuratorCopy[lang].price;
  const p = priceFor(net);
  const n = (v: number) => v.toLocaleString("en-US");
  const ar = lang === "ar";
  return (
    <aside data-rate-card aria-label={coveredCopy[lang].ui.quoteTitle} className="rounded-2xl bg-white p-6 text-[#0b0f17] sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006bb6] rtl:tracking-normal">{c.title}</p>
      {p.kind === "estimate" ? (
        <>
          <p className="num mt-3 font-display text-5xl font-semibold tracking-[-0.04em]" dir={ar ? "rtl" : "ltr"}>
            <span className="text-2xl text-black/55">≈ </span>
            {ar ? <>{n(p.perOrder)} <span className="text-2xl text-black/55">ريال</span></> : <><span className="text-2xl text-black/55">SAR</span> {n(p.perOrder)}</>}
            <span className="ms-2 text-base font-normal tracking-normal text-black/60">{c.perOrder}</span>
          </p>
          <p className="mt-2 text-sm text-black/70">{fmt(c.perMonth, { total: n(p.monthly), n: n(p.orders) })}</p>
          <p className="mt-3 text-xs text-black/55">{c.basis}</p>
        </>
      ) : (
        <>
          <p className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-[#006bb6] rtl:tracking-normal">{c.confirm}</p>
          <p className="mt-2 text-sm text-black/70">{p.reason === "window" ? c.confirmWindow : c.confirmProfile}</p>
          <p className="mt-2 text-xs text-black/55">{fmt(c.reference, { n: n(p.reference.perOrder) })}</p>
        </>
      )}
      <ul className="mt-5 grid gap-2 border-t border-black/10 pt-4 text-[13px] leading-snug text-black/65">
        {c.conditions.map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-black/40" />{x}</li>)}
      </ul>
    </aside>
  );
}

/* ───────────────────────── the blueprint ───────────────────────── */

type TabId = "quote" | "handled" | "services" | "next";

function Blueprint(p: Props & { go: (s: Step) => void }) {
  const { t, lang, input, persona, net, cargo, priorities, onSend, onCopy, copied, onRestart, headingRef, go, reduce } = p;
  const c = configuratorCopy[lang];
  const b = c.blueprint;
  const r = t.planner.result;
  const k = cockpitCopy[lang];
  const z = sizerCopy[lang].inputs;
  const [tab, setTab] = useState<TabId>("quote");
  if (!input || !persona) return null;
  const plan = buildPlan(input);
  const model = r.models[plan.model];
  const summary = planSummary(t, input, lang);
  const ph = PERSONA_PHOTO[persona];
  const extras = cargo.filter((x) => x !== "parcels").map((x) => t.planner.steps.cargo.options[x].t);
  if (net.cod > 0) extras.push(`${z.cod} ${net.cod}%`);
  const rows: { id: keyof typeof b.rows; step: Step; value: string }[] = [
    { id: "profile", step: 0, value: t.planner.steps.persona.options[persona].t },
    { id: "volume", step: 1, value: `${net.orders.toLocaleString("en-US")} ${c.volume.perDay} · ${fmt(b.peak, { x: net.peak })} · ${z.profiles[net.profile]}` },
    { id: "route", step: 2, value: z.areas[net.area] },
    { id: "speed", step: 3, value: z.windows[net.window] },
    { id: "services", step: 4, value: [cargo.includes("parcels") ? t.planner.steps.cargo.options.parcels.t : null, ...extras].filter(Boolean).join(" · ") || b.servicesNone },
  ];
  const ids: TabId[] = ["quote", "handled", "services", "next"];
  const onTabKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const nx = ids[(ids.indexOf(tab) + d * (lang === "ar" ? -1 : 1) + ids.length) % ids.length];
    setTab(nx);
    document.getElementById(`plan-tab-${nx}`)?.focus();
    e.preventDefault();
  };
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.08 * i, ease: EASE_OUT } });

  return (
    <div className="mx-auto max-w-[88rem] px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">
      {/* the opening: the profile's photograph and the operating model */}
      <motion.div {...rise(0)} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0">
          <img src={ph.src} {...fit(ph.src, "100vw")} alt="" className="size-full object-cover" style={{ objectPosition: ph.pos }} />
          <span className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/75 to-[#0b0f17]/30 rtl:bg-gradient-to-t" />
        </div>
        <div className="relative px-6 pb-8 pt-28 sm:px-10 sm:pt-36 lg:pb-12">
          <p className="lbl-cfg text-[#7fcbfb]">{b.eyebrow}</p>
          <p className="mt-3 text-sm text-white/70">{b.model}</p>
          <h3 ref={headingRef} tabIndex={-1} style={{ outline: "none" }} className="mt-1 font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-semibold leading-[1] tracking-[-0.045em] outline-none rtl:leading-[1.25] rtl:tracking-normal">{model.name}</h3>
          <p className="mt-4 max-w-2xl text-lg text-white/80 text-pretty">{model.desc}</p>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* the setup, line by line, each one editable */}
        <motion.section {...rise(1)} aria-labelledby="bp-setup" className="rounded-3xl p-6 ring-1 ring-white/10 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h4 id="bp-setup" className="font-display text-xl font-semibold">{b.yourSetup}</h4>
            <p className="text-sm text-white/55 max-sm:hidden">{b.lead.split(".")[0]}.</p>
          </div>
          <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-4 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
                <dt className="lbl-cfg text-white/50">{b.rows[row.id]}</dt>
                <dd className="min-w-0 font-medium text-white/90">{row.value}</dd>
                <dd><button type="button" onClick={() => go(row.step)} className="text-sm font-semibold text-[#7fcbfb] underline-offset-4 hover:underline" aria-label={`${c.edit}: ${b.rows[row.id]}`}>{c.edit}</button></dd>
              </div>
            ))}
          </dl>
          {priorities.length ? (
            <p className="mt-4 text-sm text-white/60">{c.services.matters}: <span className="text-white/85">{priorities.map((x) => t.planner.steps.priorities.options[x].t).join(" · ")}</span></p>
          ) : null}
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {plan.modules.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/8">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${m.core ? "bg-[#009df8] text-white" : "bg-white/10 text-white/80"}`}><ServiceIcon id={m.id} className="size-4" /></span>
                <span className="min-w-0 text-sm font-semibold leading-tight">{t.planner.services[m.id].name}</span>
                <span className="ms-auto shrink-0 text-[11px] text-white/45">{m.core ? r.core : r.addon}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* the estimate and the way forward */}
        <motion.section {...rise(2)} aria-label={b.request} className="flex flex-col gap-4">
          <PriceCard net={net} lang={lang} />
          <div className="rounded-3xl p-6 ring-1 ring-white/10 sm:p-7">
            <p className="text-sm text-white/70">{b.requestLead}</p>
            <button type="button" onClick={onSend} className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#0b0f17] transition-colors hover:bg-[#dff1ff]">
              {r.send} <ArrowIcon className="size-4 rtl:-scale-x-100" />
            </button>
            <a href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)} target="_blank" rel="noopener noreferrer"
              onClick={() => { track("plan_share", { channel: "whatsapp" }); track("whatsapp_click", { location: "planner" }); }}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/[0.06]">
              <WhatsAppIcon className="size-5 text-[#25d366]" /> {r.whatsapp}
            </a>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <button type="button" onClick={onCopy} className="text-white/60 underline-offset-4 hover:text-white hover:underline"><span aria-live="polite">{copied ? r.copied : r.copy}</span></button>
              <button type="button" onClick={onRestart} className="text-white/60 underline-offset-4 hover:text-white hover:underline">{t.planner.restart}</button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* the detail, in tabs: what is covered, what MSG handles, why each service, what happens next */}
      <motion.section {...rise(3)} aria-labelledby="bp-detail" className="mt-6 rounded-3xl bg-white p-6 text-[#111a33] sm:p-8">
        <h4 id="bp-detail" className="sr-only">{b.detail}</h4>
        <div role="tablist" aria-label={k.tabsLabel} onKeyDown={onTabKey} className="flex gap-1 rounded-full bg-[#eef1f5] p-1">
          {ids.map((tid) => (
            <button key={tid} id={`plan-tab-${tid}`} type="button" role="tab" aria-selected={tab === tid} aria-controls="plan-tabpanel" tabIndex={tab === tid ? 0 : -1}
              onClick={() => setTab(tid)} className={`relative min-w-0 flex-1 rounded-full px-2 py-2.5 text-xs font-semibold leading-tight transition-colors sm:text-sm ${tab === tid ? "text-[#111a33]" : "text-[#5a6478] hover:text-[#111a33]"}`}>
              {tab === tid ? <motion.span layoutId="bp-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(17,26,51,0.15)]" /> : null}
              <span className="relative">{k.tabs[tid]}</span>
            </button>
          ))}
        </div>
        <div id="plan-tabpanel" role="tabpanel" aria-labelledby={`plan-tab-${tab}`} className="mt-6">
          {tab === "quote" && (<><p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6478] rtl:tracking-normal">{coveredCopy[lang].ui.included}</p><MustList lang={lang} /></>)}
          {tab === "handled" && <Pillars lang={lang} />}
          {tab === "services" && (
            <ol className="divide-y divide-[#e2e5ec] border-y border-[#e2e5ec]">
              {plan.modules.map((m) => {
                const s = t.planner.services[m.id];
                const reasons = m.reasons.map((x) => t.planner.reasons[x]).filter(Boolean);
                return (
                  <li key={m.id} className="flex items-start gap-3.5 py-3.5">
                    <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${m.core ? "bg-[#006bb6] text-white" : "bg-[#e5f3fe] text-[#006bb6]"}`}><ServiceIcon id={m.id} className="size-[18px]" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold">{s.name}</h5>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${m.core ? "bg-[#111a33] text-white" : "bg-[#eef1f5] text-[#5a6478]"}`}>{m.core ? r.core : r.addon}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-[#5a6478]">{s.desc}</p>
                      {reasons.length ? <p className="mt-1 text-sm text-[#006bb6]">{reasons.join(" · ")}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {tab === "next" && (
            <ol className="grid gap-4 sm:grid-cols-3">
              {r.next.map((n, i) => (
                <li key={n.t} className="flex gap-4">
                  <span className="num inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[#c9ced8] text-sm font-medium">{i + 1}</span>
                  <div><p className="font-medium">{n.t}</p><p className="text-sm text-[#5a6478]">{n.d}</p></div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.section>

      {/* the plan, running on MSG's network */}
      <section aria-labelledby="bp-run" className="mt-6 overflow-hidden rounded-3xl ring-1 ring-white/10">
        <div className="px-6 pt-6 sm:px-8">
          <h4 id="bp-run" className="font-display text-xl font-semibold">{b.run}</h4>
          <p className="mt-1 max-w-2xl text-sm text-white/60">{b.runLead}</p>
        </div>
        <div className="mt-4 min-h-[24rem] bg-white text-[#111a33]">
          <PlanStage locale={lang} input={input} complete compact />
        </div>
      </section>
    </div>
  );
}

