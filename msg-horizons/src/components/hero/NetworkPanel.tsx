import CourierField from "./CourierField";
import NetworkStats from "./NetworkStats";
import type { Dictionary } from "@/content/i18n";

/** MSG's real scale as a product-style panel, floating over the defocused horizon. */
export default function NetworkPanel({ t }: { t: Dictionary }) {
  const h = t.hero;
  return (
    <section aria-label={h.panelTitle} className="relative px-5 pb-20 lg:px-8">
      <figure className="mx-auto grid max-w-6xl overflow-hidden rounded-xl border border-white/60 bg-surface/95 shadow-[0_30px_80px_-30px_rgba(12,14,17,0.35)] backdrop-blur lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[1000/860] border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-e">
          <CourierField ariaLabel={h.canvasLabel} hqLabel={h.hq} />
        </div>
        <div className="flex flex-col lg:min-h-full">
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <span className="text-sm font-semibold text-ink">{h.panelTitle}</span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              {h.panelLive}
            </span>
          </div>
          <NetworkStats labels={{ couriers: h.stats[0].label, vehicles: h.stats[1].label, operations: h.stats[2].label }} />
          <figcaption className="mt-auto grid gap-2 border-t border-line bg-paper px-6 py-4 text-sm text-muted">
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-ink/50" />{h.legend.courier}</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-brand ring-[1.5px] ring-white shadow-[0_0_0_2.5px_rgba(31,67,224,0.25)]" />{h.legend.vehicle}</span>
            <span className="text-xs text-muted">{h.caption}</span>
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
