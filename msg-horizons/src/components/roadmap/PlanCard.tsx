"use client";

import { EASE_OUT, EASE_IN_OUT } from "@/lib/motion";
import { motion } from "motion/react";
import { roadmapCopy, SEGMENT_PERSONA, type Segment } from "@/content/roadmap";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { buildPlan, type PlanInput } from "@/lib/planner";
import { volumeBand, type SizerInput } from "@/lib/sizer";
import { approxCost } from "@/lib/estimate";
import { planSummary } from "@/lib/plan-summary";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { usePlan } from "../PlanContext";
import { ServiceIcon, WhatsAppIcon } from "../ui/icons";
import { CoverIcon } from "../ui/coverIcons";
import { coveredCopy } from "@/content/covered";

/**
 * Terminal state of the estimator: the Curated Recommendation Plan.
 * Configuration (MSG services + why), operational asset breakdown, and a cost block that shows a
 * real estimate only when MSG's rate card is filled in (src/content/rates.ts); otherwise it hands
 * pricing to MSG with the plan attached.
 */
export default function PlanCard({
  t, lang, segment, net, onEdit,
}: { t: Dictionary; lang: Locale; segment: Segment; net: SizerInput; onEdit: () => void }) {
  const c = roadmapCopy[lang].plan;
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
  const cur = (n: number) => n.toLocaleString("en-US");
  const summary = planSummary(t, input, lang);
  const stagger = (k: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + k * 0.05, duration: 0.4 } });

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.16, ease: EASE_OUT } }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="relative"
    >
      {!reduce ? (
        <motion.span aria-hidden="true" initial={{ transform: "translateX(-50%)", opacity: 0 }}
              animate={{ transform: ["translateX(-50%)", "translateX(110%)"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.3, ease: EASE_IN_OUT }}
              className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <span className="absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-brand-mint/20 to-transparent" />
            </motion.span>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal rtl:tracking-normal">{c.eyebrow}</p>
          <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em] text-teal-deep rtl:tracking-normal">{t.planner.result.models[plan.model].name}</h3>
          
        </div>
        <button type="button" onClick={onEdit} className="rounded-full border border-teal/28 px-4 py-2 text-sm text-teal-deep/85 hover:border-teal/40 hover:text-teal-deep">{c.edit}</button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-teal/18 bg-white/75 p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-teal-deep/85">{c.config}</h4>
          <ul className="mt-4 space-y-3">
            {plan.modules.map((m, k) => (
              <motion.li key={m.id} {...stagger(k)} className="flex items-center gap-3">
                <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${m.core ? "bg-brand text-white" : "bg-white text-teal"}`}><ServiceIcon id={m.id} className="size-4" /></span>
                <span className="text-sm text-teal-deep/95">{t.planner.services[m.id].name}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-teal/18 bg-white/75 p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-teal-deep/85">{c.covered}</h4>
          <ul className="mt-4 space-y-3">
            {coveredCopy[lang].musts.map((m, k) => (
              <motion.li key={m.id} {...stagger(k)} className="flex items-center gap-3">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white"><CoverIcon id={m.id} className="size-4" /></span>
                <span className="text-sm text-teal-deep/95">{m.t}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col rounded-2xl border border-teal/30 bg-gradient-to-b from-sea-100 to-white/80 p-5 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-teal-deep/85">{c.cost}</h4>
          <p className="mt-4" data-rate-card>
            <span className="num block font-display text-4xl font-semibold text-teal-deep" dir={lang === "ar" ? "rtl" : "ltr"}>
              <span className="text-xl text-teal-deep/80">≈ </span>
              {lang === "ar" ? <>{cur(cost.perOrder)} <span className="text-xl text-teal-deep/80">ريال</span></> : <><span className="text-xl text-teal-deep/80">SAR</span> {cur(cost.perOrder)}</>}
            </span>
            <span className="mt-2 block text-sm text-teal-deep/80">
              {c.costMonthly.replace("{total}", cost.monthly.toLocaleString("en-US")).replace("{n}", cost.orders.toLocaleString("en-US"))}
            </span>
          </p>
          <p className="mt-3 text-sm text-teal-deep/75">{c.costNote}</p>
          <div className="mt-auto grid gap-2 pt-5">
            <a
              href={whatsappLink(`${t.wa.planIntro}\n\n${summary}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { track("whatsapp_click", { location: "roadmap_plan" }); track("plan_share", { channel: "whatsapp" }); }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 font-semibold text-white hover:bg-[#0f7a40]"
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
              className="inline-flex items-center justify-center rounded-xl border border-teal/33 px-4 py-3 font-medium text-teal-deep hover:border-teal/40"
            >
              {c.send}
            </button>
          </div>
        </section>
      </div>
      <p className="mt-4 text-xs text-teal-deep/65">{c.example}</p>
    </motion.div>
  );
}
