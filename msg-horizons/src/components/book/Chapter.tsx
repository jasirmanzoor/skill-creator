import { fmt, type Locale } from "@/content/i18n";
import { bookCopy, CHAPTERS } from "@/content/chapters";

/**
 * One page of the book. The first chapter is marked open in the HTML so the cover paints at once; RouteBook opens
 * the others. Every chapter but the last ends on a page-turn card that invites the next chapter (a plain #link, so it
 * also works as a jump without JavaScript, where the chapters simply stack).
 */
export default function Chapter({ n, lang, children }: { n: number; lang: Locale; children: React.ReactNode }) {
  const ch = CHAPTERS[n];
  const next = CHAPTERS[n + 1];
  return (
    <div data-chapter={ch.id} data-current={n === 0 ? "" : undefined} tabIndex={-1} aria-label={ch.title[lang]} className="chapter">
      {children}
      {next ? <TurnPage n={n} lang={lang} /> : null}
    </div>
  );
}

function TurnPage({ n, lang }: { n: number; lang: Locale }) {
  const c = bookCopy[lang];
  const total = CHAPTERS.length;
  const next = CHAPTERS[n + 1];
  const prev = CHAPTERS[n - 1];
  const num = (i: number) => String(i + 1).padStart(2, "0");
  return (
    <nav aria-label={c.next} className="turn-wrap relative px-5 pb-36 pt-10 lg:px-8 lg:pb-40">
      <div className="mx-auto max-w-7xl">
        <a href={`#${next.id}`} className="turn-card group relative block overflow-hidden rounded-[2rem] border border-line bg-surface/85 p-7 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-10 lg:p-12">
          <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="text-brand">{c.next}</span>
            <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
            <span className="tabular-nums">{fmt(c.chapter, { n: n + 2, total })}</span>
          </span>
          <span className="mt-6 flex items-end justify-between gap-6">
            <span className="min-w-0">
              {/* the big chapter number is drawn by CSS (::before), so it is decoration, not text */}
              <span aria-hidden="true" data-num={num(n + 1)} className="turn-num block font-display text-[clamp(4rem,12vw,9rem)] font-semibold leading-[0.8] tracking-[-0.05em] text-ink/[0.07]" />
              <span className="-mt-[0.35em] block h-display text-ink">{next.title[lang]}</span>
              <span className="mt-3 block max-w-xl text-lg text-muted">{next.hint[lang]}</span>
            </span>
            <span aria-hidden="true" className="turn-arrow grid size-16 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:scale-110 sm:size-20">
              <svg viewBox="0 0 24 24" className="size-7 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </span>
          {/* the page corner: it lifts as you reach for it */}
          <span aria-hidden="true" className="turn-curl" />
        </a>
        {prev ? (
          <a href={`#${prev.id}`} className="tap mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-ink">
            <svg viewBox="0 0 24 24" className="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            {c.previous}: {prev.title[lang]}
          </a>
        ) : null}
      </div>
    </nav>
  );
}
