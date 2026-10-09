"use client";

import { EASE_OUT } from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import type { LiveCopy } from "@/content/liveTracking";
import { BellGlyph, LocateGlyph } from "./glyphs";

/**
 * The driver's side of the handshake. A request arrives; nothing is shared until the driver taps Approve.
 * Generic UI on purpose: no driver names, plates, times or numbers.
 */
export default function DriverPhone({
  c, live, reduce, onApprove, onReplay,
}: { c: LiveCopy; live: boolean; reduce: boolean; onApprove: () => void; onReplay: () => void }) {
  const d = c.driver;
  const ease = EASE_OUT;
  const swap = reduce ? { duration: 0 } : { duration: 0.45, ease };

  return (
    <div
      role="group"
      aria-label={d.label}
      className="relative w-[15.5rem] shrink-0 rounded-[2.4rem] bg-[#0a1316] p-[7px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.1)]"
    >
      <div className="relative flex h-[29rem] flex-col overflow-hidden rounded-[2rem] bg-[#f3f8f7] text-ink">
        <span aria-hidden="true" className="absolute left-1/2 top-2 z-10 h-5 w-[4.5rem] -translate-x-1/2 rounded-full bg-[#0a1316]" />

        <div className="flex items-center justify-between px-4 pb-3 pt-10">
          <span className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand text-[9px] font-extrabold tracking-tight text-white" aria-hidden="true">MSG</span>
            <span className="font-display text-[14px] font-semibold text-teal-deep">{d.app}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-teal-deep ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {d.online}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!live ? (
            <motion.div
              key="request"
              className="flex flex-1 flex-col"
              initial={reduce ? false : { opacity: 0, transform: "translateY(14px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-14px)" }}
              transition={swap}
            >
              <div className="mx-4 rounded-2xl bg-white p-3.5 shadow-[0_10px_30px_-18px_rgba(11,58,64,0.45)] ring-1 ring-line">
                <p className="flex items-center gap-2.5 text-[14px] font-semibold">
                  <span className="relative grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand/30 motion-reduce:hidden" aria-hidden="true" />
                    <BellGlyph className="relative size-4" />
                  </span>
                  {d.request}
                </p>
                <ol className="mt-3.5">
                  <li className="relative flex gap-3 pb-3.5">
                    <span className="relative z-10 mt-1 size-2.5 shrink-0 rounded-full border-2 border-teal-deep bg-white" aria-hidden="true" />
                    <span aria-hidden="true" className="absolute start-[4px] top-4 h-full w-px bg-line-strong" />
                    <span>
                      <span className="block text-[11px] text-muted">{d.pickup}</span>
                      <span className="block text-[13px] font-semibold">{d.pickupPlace}</span>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    <span>
                      <span className="block text-[11px] text-muted">{d.drop}</span>
                      <span className="block text-[13px] font-semibold">{d.dropPlace}</span>
                    </span>
                  </li>
                </ol>
              </div>
              <p className="mx-5 mt-3.5 text-[12px] leading-snug text-muted">{d.consent}</p>
              <div className="relative mx-4 mb-4 mt-auto">
                <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-2xl bg-brand/35 motion-reduce:hidden" />
                <button
                  type="button"
                  onClick={onApprove}
                  className="relative w-full rounded-2xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(11,125,54,0.9)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  {d.approve}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="live"
              className="flex flex-1 flex-col"
              initial={reduce ? false : { opacity: 0, transform: "translateY(14px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-14px)" }}
              transition={swap}
            >
              <div className="mx-4 rounded-2xl bg-gradient-to-br from-brand to-[#075f29] p-4 text-white shadow-[0_18px_36px_-20px_rgba(11,125,54,0.9)]">
                <span className="relative grid size-12 place-items-center rounded-full bg-white/15">
                  <span className="plan-ping absolute inset-0 rounded-full bg-white/35 motion-reduce:hidden" aria-hidden="true" />
                  <LocateGlyph className="relative size-6" />
                </span>
                <p className="mt-3 font-display text-[17px] font-semibold leading-tight">{d.liveTitle}</p>
                <p className="mt-1 text-[12px] leading-snug text-white/85">{d.liveBody}</p>
              </div>
              <div className="mx-4 mt-3 rounded-2xl bg-white p-3.5 ring-1 ring-line">
                <p className="text-[11px] font-medium text-muted">{d.seeing}</p>
                <ul className="mt-2 space-y-2">
                  {d.viewers.map((v) => (
                    <li key={v} className="flex items-center justify-between text-[13px] font-semibold">
                      {v}
                      <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mx-4 mb-4 mt-auto">
                <button
                  type="button"
                  onClick={onReplay}
                  className="w-full rounded-2xl bg-white py-3 text-[13px] font-semibold text-teal-deep ring-1 ring-line-strong transition-colors hover:bg-subtle"
                >
                  {c.replay}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
