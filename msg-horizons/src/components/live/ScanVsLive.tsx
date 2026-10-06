import type { LiveCopy } from "@/content/liveTracking";

const CELL = (i: number) => `${12.5 + 25 * i}%`;

/**
 * Same four moments, two ways of seeing them. Scan-based tracking only speaks at a scan, so the gaps are
 * silent; live tracking never goes quiet once the driver has approved. The picture does the arguing:
 * no competitor is named and no claim is made about anyone else.
 */
export default function ScanVsLive({ c }: { c: LiveCopy }) {
  const k = c.compare;
  return (
    <figure aria-labelledby="live-compare-title" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <figcaption id="live-compare-title" className="font-display text-lg font-semibold sm:text-xl">{k.title}</figcaption>
      <p className="sr-only">{k.summary}</p>

      <div aria-hidden="true" className="mt-4 grid gap-y-3 lg:grid-cols-[13rem_1fr] lg:gap-x-8">
        <span className="hidden lg:block" />
        <ol className="grid grid-cols-4 text-center text-[11px] font-medium leading-tight text-white/80 sm:text-[12px]">
          {k.stages.map((s) => <li key={s} className="px-1">{s}</li>)}
        </ol>

        {/* scan-based: four dots, long silences */}
        <div className="lg:pt-1.5">
          <p className="font-semibold text-white/85">{k.scan.t}</p>
          <p className="mt-0.5 text-xs text-white/65">{k.scan.d}</p>
        </div>
        <div className="relative h-8">
          <span className="absolute inset-x-[12.5%] top-1/2 border-t-2 border-dashed border-white/25" />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute top-1/2 -ms-[7px] size-3.5 -translate-y-1/2 rounded-full border-2 border-white/60 bg-[#08262b]" style={{ insetInlineStart: CELL(i) }} />
          ))}
          <span className="absolute inset-x-[37.5%] top-[calc(50%+12px)] text-center text-[10px] font-medium text-white/50">{k.scan.gap}</span>
        </div>

        {/* MSG live: one unbroken line with the driver moving along it */}
        <div className="lg:pt-1.5">
          <p className="font-semibold text-[#4cc97a]">{k.live.t}</p>
          <p className="mt-0.5 text-xs text-white/65">{k.live.d}</p>
        </div>
        <div className="relative h-8">
          <span className="absolute inset-x-[12.5%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#4cc97a]/25 via-[#4cc97a] to-[#4cc97a]/25 rtl:bg-gradient-to-l" />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute top-1/2 -ms-1 size-2 -translate-y-1/2 rounded-full bg-white/70" style={{ insetInlineStart: CELL(i) }} />
          ))}
          <span
            className="live-run absolute top-1/2 -ms-2 size-4 -translate-y-1/2 rounded-full bg-[#4cc97a] shadow-[0_0_0_6px_rgba(76,201,122,0.25)] motion-reduce:[animation:none]"
            style={{ insetInlineStart: CELL(2) }}
          />
        </div>
      </div>
    </figure>
  );
}
