"use client";

import Image from "next/image";
import { useState } from "react";
import { experience, NEED_STAGES, NEEDS_BY_STAGE } from "@/content/experience";
import { heroCopy } from "@/content/hero";
import type { Locale } from "@/content/i18n";

/** the photograph each stage is watched through: MSG's own pictures of the Sabya hub */
const VIEW = [
  { src: "/media/msg/hub-open.webp", pos: "50% 55%", cam: "01", where: { en: "Entrance", ar: "المدخل" } },
  { src: "/media/msg/hub-racks.webp", pos: "50% 60%", cam: "02", where: { en: "Racks", ar: "الرفوف" } },
  { src: "/media/msg/fleet-hub-row.webp", pos: "50% 60%", cam: "03", where: { en: "Dispatch", ar: "الشحن" } },
  { src: "/media/msg/hub-sorting.webp", pos: "50% 55%", cam: "04", where: { en: "Sorting", ar: "الفرز" } },
];

const ui: Record<Locale, { idx: string; hub: string; photo: string }> = {
  en: { idx: "MSG Control", hub: "Sabya hub", photo: "MSG photograph · not a live feed" },
  ar: { idx: "تحكّم ام اس جي", hub: "مركز صبيا", photo: "صورة من ام اس جي · ليست بثاً مباشراً" },
};

/**
 * One order through MSG, as a control panel: the four stages on a rail (set up, store, deliver, settle), and for the
 * stage in view the place where it happens and every question a seller asks there, answered. The rail is a set of
 * buttons (arrow keys move along it); nothing plays by itself. The photographs are MSG's own and say so: a camera is
 * only called live where a real feed exists, and none is wired here.
 */
export default function OrderSequence({ lang }: { lang: Locale }) {
  const n = experience[lang].needs;
  const c = heroCopy[lang];
  const u = ui[lang];
  const [stage, setStage] = useState(0);
  const total = NEED_STAGES.length;
  const pad = (k: number) => String(k).padStart(2, "0");
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const fwd = lang === "ar" ? "ArrowLeft" : "ArrowRight";
    const back = lang === "ar" ? "ArrowRight" : "ArrowLeft";
    const next = e.key === fwd || e.key === "ArrowDown" ? i + 1 : e.key === back || e.key === "ArrowUp" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const k = (next + total) % total;
    setStage(k);
    (e.currentTarget.parentElement?.parentElement?.children[k]?.querySelector("button") as HTMLButtonElement | null)?.focus();
  };

  return (
    <section id="sellers" aria-labelledby="sellers-title" data-theme="dark" className="scroll-mt-16 bg-deep text-white">
      <div className="mx-auto grid max-w-[88rem] gap-x-12 gap-y-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-28">
        <div className="lg:col-span-4">
          <p className="lbl idx text-brand-bright">{u.idx}</p>
          <h2 id="sellers-title" className="mt-6 font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{n.title}</h2>
          <p className="mt-5 max-w-md text-white/70 text-pretty">{n.lead}</p>
          <nav aria-label={c.kingdom.rail} className="mt-10">
            <ol className="grid grid-cols-4 border-t border-white/15 lg:grid-cols-1">
              {NEED_STAGES.map((st, i) => (
                <li key={st} className="border-b border-white/15 max-lg:border-e max-lg:last:border-e-0">
                  <button
                    type="button"
                    onClick={() => setStage(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    aria-current={i === stage ? "step" : undefined}
                    className={`group relative flex w-full items-baseline gap-3 py-4 text-start transition-colors max-lg:flex-col max-lg:gap-1 max-lg:px-2 ${i === stage ? "text-white" : "text-white/55 hover:text-white"}`}
                  >
                    <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-0.5 bg-brand-bright transition-opacity max-lg:inset-x-0 max-lg:top-auto max-lg:h-0.5 max-lg:w-auto ${i === stage ? "opacity-100" : "opacity-0"}`} />
                    <span className="num font-mono text-xs text-brand-bright lg:ps-4" dir="ltr">{pad(i + 1)}</span>
                    <span className="font-display text-base font-semibold sm:text-lg">{n.stages[st].t}</span>
                    <span className="ms-auto hidden text-sm text-white/50 xl:inline">{n.stages[st].d}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="lg:col-span-8">
          {NEED_STAGES.map((st, i) => {
            const v = VIEW[i];
            const on = i === stage;
            return (
              <div key={st} hidden={!on}>
                <figure className="plate relative aspect-[16/10] overflow-hidden bg-night">
                  <Image src={v.src} alt="" fill sizes="(min-width: 1024px) 860px, 100vw" className="object-cover" style={{ objectPosition: v.pos }} />
                  <span aria-hidden="true" className="reg reg-ts" />
                  <span aria-hidden="true" className="reg reg-te" />
                  <span aria-hidden="true" className="reg reg-bs" />
                  <span aria-hidden="true" className="reg reg-be" />
                  <figcaption className="lbl absolute start-5 top-5 flex flex-wrap gap-2 sm:start-7 sm:top-7">
                    <span className="bg-graphite px-2 py-1 text-white">CAM {v.cam}</span>
                    <span className="bg-graphite/80 px-2 py-1 text-white">{u.hub} · {v.where[lang]}</span>
                  </figcaption>
                  <span className="lbl absolute bottom-5 end-5 bg-graphite/80 px-2 py-1 text-white/80 sm:bottom-7 sm:end-7">{u.photo}</span>
                </figure>
                <div className="mt-8 flex items-baseline justify-between gap-6 border-b border-white/15 pb-4">
                  <p className="font-display text-2xl font-semibold tracking-[-0.02em] rtl:tracking-normal">
                    <span className="num me-3 font-mono text-sm text-brand-bright" dir="ltr">{pad(i + 1)} / {pad(total)}</span>
                    {n.stages[st].t}
                  </p>
                  <p className="lbl text-white/55">{n.owner}</p>
                </div>
                <ul data-stage-answers className="divide-y divide-white/10">
                  {NEEDS_BY_STAGE[st].map((id) => (
                    <li key={id} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8">
                      <p className="text-sm text-white/60">{n.items[id].q}</p>
                      <p className="font-medium text-white text-pretty">{n.items[id].a}</p>
                    </li>
                  ))}
                </ul>
                {st === "settle" ? <p className="mt-4 text-xs text-white/55">{n.note}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
