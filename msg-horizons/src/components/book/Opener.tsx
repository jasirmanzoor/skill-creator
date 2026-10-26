import { fmt, type Locale } from "@/content/i18n";
import { bookCopy, CHAPTERS } from "@/content/chapters";
import ScrollExpand from "../fx/ScrollExpand";
import TechWord from "../fx/TechWord";

/** each chapter's opening plate: one of MSG's own photographs (public/media/msg) */
const PLATE: Record<string, { src: string; pos: string }> = {
  why: { src: "/media/msg/hub-open.webp", pos: "50% 55%" },
  estimate: { src: "/media/msg/hub-cartons.webp", pos: "50% 60%" },
  planner: { src: "/media/msg/hub-aisles.webp", pos: "50% 55%" },
  "live-tracking": { src: "/media/msg/van-road-wide.webp", pos: "90% 62%" },
  fleet: { src: "/media/msg/hub-aerial.webp", pos: "50% 50%" },
  proof: { src: "/media/msg/hub-team.webp", pos: "60% 55%" },
  enterprise: { src: "/media/msg/hub-sorting.webp", pos: "50% 55%" },
  contact: { src: "/media/msg/facade.jpg", pos: "50% 45%" },
};

/**
 * A chapter opens on a plate (React Bits' ScrollExpand): the chapter's name, drawn in light, over a framed MSG
 * photograph. Scrolling in, the frame opens to the whole screen and the name gives way to the chapter's promise;
 * then the chapter itself begins. The cover chapter has its own hero and no plate.
 */
export default function Opener({ n, lang }: { n: number; lang: Locale }) {
  const ch = CHAPTERS[n];
  const plate = PLATE[ch.id];
  if (!plate) return null;
  const c = bookCopy[lang];
  const label = fmt(c.chapter, { n: n + 1, total: CHAPTERS.length });
  return (
    <ScrollExpand
      src={plate.src}
      mediaPosition={plate.pos}
      startWidth={50}
      startHeight={58}
      mobileStart={[86, 50]}
      startRadius={28}
      mediaZoom={1.25}
      scrollDistance={0.7}
      holdDistance={0.2}
      overlayScrim={0.5}
      className="chapter-plate"
      title={
        <div className="w-[min(86vw,44rem)] text-center text-white">
          <p className="num mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{label}</p>
          <TechWord text={ch.title[lang]} lang={lang} className="h-[clamp(5rem,18vh,10rem)] w-full font-display" fallbackClassName="block font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[1.2]" />
        </div>
      }
    >
      <div className="mx-auto grid h-full max-w-7xl content-end px-5 pb-44 text-white lg:px-8 lg:pb-32">
        <p className="num text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint rtl:tracking-normal">{label}</p>
        <p className="mt-3 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{ch.title[lang]}</p>
        <p className="mt-4 max-w-xl text-lg text-white/85">{ch.hint[lang]}</p>
      </div>
    </ScrollExpand>
  );
}
