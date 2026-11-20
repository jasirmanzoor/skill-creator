import { fmt, type Locale } from "@/content/i18n";
import { bookCopy, CHAPTERS } from "@/content/chapters";

/** each chapter's photograph (public/media/msg): used by the menu and the side map, not by the chapter itself */
export const PLATE: Record<string, { src: string; pos: string; srcAr?: string }> = {
  why: { src: "/media/msg/hub-open.webp", pos: "50% 55%" },
  estimate: { src: "/media/photos/price-en.webp", srcAr: "/media/photos/price-ar.webp", pos: "50% 50%" }, // MSG's rate set against SMSA, Aramex and iMile (names only)
  planner: { src: "/media/photos/plan-fleet.webp", pos: "85% 30%" }, // MSG vans on a Riyadh highway, plan → dispatch → track → deliver (supplied by MSG)
  "live-tracking": { src: "/media/photos/van-desert.webp", pos: "74% 62%" }, // the van in the new livery, on the road out of town
  fleet: { src: "/media/msg/hub-aerial.webp", pos: "50% 50%" },
  proof: { src: "/media/msg/hub-team.webp", pos: "60% 55%" },
  enterprise: { src: "/media/photos/sorting.webp", pos: "50% 50%" },
  contact: { src: "/media/msg/facade.jpg", pos: "50% 45%" },
};

/** chapters whose first section sits on a light ground: their stop is set on paper so the two read as one */
const LIGHT = new Set(["proof", "network", "fleet", "estimate"]);
/** chapters whose first section opens on the same line as the hint: the stop leaves it out rather than say it twice */
const SAID = new Set<string>();

/**
 * A chapter opens on a stop of the route. The page is read as one delivery route with a stop per chapter: the marker
 * shows every stop, the ones already passed, and this one, and the leg that leads here draws itself in as the stop
 * comes into view (CSS scroll-driven; a still line where that is not supported or motion is reduced). It orients the
 * reader in one glance and takes one band of the page, not two screens. The cover chapter has its own hero and no stop.
 */
export default function Opener({ n, lang }: { n: number; lang: Locale }) {
  if (n === 0) return null;
  const ch = CHAPTERS[n];
  const total = CHAPTERS.length;
  const c = bookCopy[lang];
  const num = String(n + 1).padStart(2, "0");
  const light = LIGHT.has(ch.id);
  const tone = light
    ? { band: "bg-paper text-ink", rail: "bg-ink/12", done: "bg-brand", here: "bg-brand ring-brand/20", todo: "bg-ink/25", num: "text-brand", hint: "text-muted" }
    : { band: "bg-deep text-white", rail: "bg-white/15", done: "bg-brand-bright", here: "bg-brand-bright ring-brand-bright/25", todo: "bg-white/30", num: "text-brand-bright", hint: "text-white/65" };
  return (
    <div className={`route-stop relative ${tone.band}`} data-theme={light ? undefined : "dark"}>
      <div className="mx-auto max-w-7xl px-5 pb-2 pt-12 lg:px-8 lg:pb-4 lg:pt-16">
        {/* the route: one dot a chapter, the passed legs solid, this leg drawing in */}
        <div aria-hidden="true" className="route-line relative flex items-center justify-between" dir={lang === "ar" ? "rtl" : "ltr"}>
          <span className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 ${tone.rail}`} />
          <span className={`absolute start-0 top-1/2 h-px -translate-y-1/2 ${tone.done}`} style={{ width: `${((n - 1) / (total - 1)) * 100}%` }} />
          <span
            className={`route-leg absolute top-1/2 h-0.5 -translate-y-1/2 ${tone.done}`}
            style={{ insetInlineStart: `${((n - 1) / (total - 1)) * 100}%`, width: `${(1 / (total - 1)) * 100}%` }}
          />
          {CHAPTERS.map((s, i) => (
            <span
              key={s.id}
              className={`relative rounded-full ${i === n ? `route-here size-3 ring-4 ${tone.here}` : i < n ? `size-1.5 ${tone.done}` : `size-1.5 ${tone.todo}`}`}
            />
          ))}
        </div>
        <div className="mt-8 grid items-end gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr] lg:mt-10">
          <p className={`num font-mono text-sm ${tone.num}`} dir="ltr">
            <span className="sr-only">{fmt(c.chapter, { n: n + 1, total })} · </span>
            <span aria-hidden="true">{num} / {String(total).padStart(2, "0")}</span>
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
            <p className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] rtl:leading-[1.3] rtl:tracking-normal">{ch.title[lang]}</p>
            {SAID.has(ch.id) ? null : <p className={`text-base ${tone.hint}`}>{ch.hint[lang]}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
