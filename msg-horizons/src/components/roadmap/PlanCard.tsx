"use client";

import { motion } from "motion/react";
import { roadmapCopy, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import { sizerCopy } from "@/content/sizerCopy";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { buildPlan, type PlanInput } from "@/lib/planner";
import { volumeBand, type SizerInput, type Structure } from "@/lib/sizer";
import { approxCost } from "@/lib/estimate";
import { planSummary } from "@/lib/plan-summary";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { usePlan } from "../PlanContext";
import { ServiceIcon, WhatsAppIcon } from "../ui/icons";

/**
 * Terminal state of the estimator: the Curated Recommendation Plan.
 * Configuration (MSG services + why), operational asset breakdown, and a cost block that shows a
 * real estimate only when MSG's rate card is filled in (src/content/rates.ts); otherwise it hands
 * pricing to MSG with the plan attached.
 */
export default function PlanCard({
  t, lang, segment, net, structure: s, onEdit,
}: { t: Dictionary; lang: Locale; segment: Segment; net: SizerInput; structure: Structure; onEdit: () => void }) {
  const c = roadmapCopy[lang].plan;
  const sc = sizerCopy[lang];
  const reduce = useReducedMotion();
  const { setPlan } = usePlan();
  const input: PlanInput = {
    persona: SEGMENT_PERSONA[segment],
    cargo: net.stock ? ["parcels", "storage"] : ["parcels"],
    volume: volumeBand(net.orders),
    priorities: [],
    net,
  };
  const plan = buildPlan(input);
  const cost = approxCost(net);
  const summary = planSummary(t, input, lang);
  const find = (id: string) => s.decisions.find((d) => d.id === id);
  const assets: [string, string | number][] = [
    [c.routes, s.baseRoutes],
    [c.couriers, s.baseCouriers],
    [c.peak, s.peakCouriers],
    [c.vehicles, find("vehicles") ? sc.decision(find("vehicles")!).title : "—"],
    [c.pickup, sc.decision(find("pickup")!).title],
    [c.dispatch, sc.decision(find("cadence")!).title],
  ];
  const stagger = (k: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + k * 0.05, duration: 0.4 } });

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.96, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {!reduce ? (
        <motion.span aria-hidden="true" initial={{ left: "-50%", opacity: 0 }}
              animate={{ left: ["-50%", "110%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
          className="pointer-events-none absolute inset-y-0 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#b5f5cc]/20 to-transparent" />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4cc97a] rtl:tracking-normal">{c.eyebrow}</p>
          <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-white rtl:tracking-normal">{t.planner.result.models[plan.model].name}</h3>
          <p className="mt-2 max-w-2xl text-white/70">{sc.headline(s, net)}</p>
        </div>
        <button type="button" onClick={onEdit} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/50 hover:text-white">{c.edit}</button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-white/80">{c.config}</h4>
          <ul className="mt-4 space-y-3">
            {plan.modules.map((m, k) => (
              <motion.li key={m.id} {...stagger(k)} className="flex items-center gap-3">
                <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${m.core ? "bg-[#0b7d36] text-white" : "bg-white/10 text-[#4cc97a]"}`}><ServiceIcon id={m.id} className="size-4" /></span>
                <span className="text-sm text-white/90">{t.planner.services[m.id].name}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-white/80">{c.assets}</h4>
          <dl className="mt-4 divide-y divide-white/10">
            {assets.map(([k, v], i) => (
              <motion.div key={k} {...stagger(i)} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-sm text-white/55">{k}</dt>
                <dd className={`text-end ${typeof v === "number" ? "num font-display text-2xl font-semibold text-white" : "text-sm font-medium text-white"}`}>{typeof v === "number" ? v.toLocaleString("en-US") : v}</dd>
              </motion.div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col rounded-2xl border border-[#4cc97a]/30 bg-gradient-to-b from-[#0f9641]/25 to-white/[0.03] p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-white/80">{c.cost}</h4>
          <p className="mt-4" data-rate-card>
            <span className="num font-display text-4xl font-semibold text-white" dir="ltr">
              <span className="text-xl text-white/70">≈ {lang === "ar" ? "ريال" : "SAR"}</span> {cost.perOrder}
            </span>
            <span className="mt-2 block text-sm text-white/70">
              {c.costMonthly.replace("{total}", cost.monthly.toLocaleString("en-US")).replace("{n}", cost.orders.toLocaleString("en-US"))}
            </span>
          </p>
          <p className="mt-3 text-sm text-white/65">{c.costNote}</p>
          <div className="mt-auto grid gap-2 pt-5">
            <a
              href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { track("whatsapp_click", { location: "roadmap_plan" }); track("plan_share", { channel: "whatsapp" }); }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#128c4a] px-4 py-3 font-semibold text-white hover:bg-[#0f7a40]"
            >
              <WhatsAppIcon className="size-5" /> {c.whatsapp}
            </a>
            <button
              type="button"
              onClick={() => {
                setPlan(input);
                track("plan_share", { channel: "form" });
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
                window.setTimeout(() => document.getElementById("lead-name")?.focus({ preventScroll: true }), 700);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-4 py-3 font-medium text-white hover:border-white/60"
            >
              {c.send}
            </button>
          </div>
        </section>
      </div>
      <p className="mt-4 text-xs text-white/50">{c.example}</p>
    </motion.div>
  );
}
