import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { ArrowIcon } from "../ui/icons";
import type { Dictionary } from "@/content/i18n";

/** Approachable, light section: "this is for me" for sellers and small businesses. */
export default function Sellers({ t }: { t: Dictionary }) {
  const s = t.sellers;
  return (
    <section id="sellers" aria-labelledby="sellers-title" className="scroll-mt-16 bg-paper py-24 text-paper-ink lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow text-sun-deep">{s.eyebrow}</p>
            <h2 id="sellers-title" className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal">
              {s.title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-fog text-pretty">{s.lead}</p>
          </Reveal>
          <Reveal delay={120}>
            <OrderJourney />
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {s.cards.map((c, i) => (
            <Reveal as="li" key={c.t} delay={i * 100} className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(60,40,10,0.25)]">
              <span className="inline-flex rounded-full bg-paper px-3 py-1 text-xs font-semibold text-sun-deep">{c.tag}</span>
              <h3 className="mt-6 font-display text-2xl font-semibold">{c.t}</h3>
              <p className="mt-3 leading-relaxed text-paper-fog">{c.d}</p>
              <span aria-hidden="true" className="absolute -bottom-10 -end-10 size-32 rounded-full bg-sun/10 transition-transform duration-700 group-hover:scale-150" />
            </Reveal>
          ))}
        </ul>

        <div className="mt-20">
          <h3 className="font-display text-2xl font-semibold">{s.howTitle}</h3>
          <ol className="relative mt-8 grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden="true" className="absolute inset-x-4 top-5 hidden h-px bg-gradient-to-r from-sun/0 via-sun/60 to-sun/0 md:block" />
            {s.how.map((h, i) => (
              <Reveal as="li" key={h.t} delay={i * 90} className="relative">
                <span className="num relative inline-flex size-10 items-center justify-center rounded-full bg-paper-ink font-mono text-sm font-semibold text-sun">
                  0{i + 1}
                </span>
                <p className="mt-4 font-semibold">{h.t}</p>
                <p className="mt-1 text-paper-fog">{h.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-paper-ink p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <p className="font-display text-2xl font-semibold text-balance sm:text-3xl">{s.launchpad}</p>
          <TrackedLink
            href="#planner"
            event="cta_click"
            props={{ cta: "plan", location: "sellers" }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sun px-6 py-3.5 font-semibold text-ink transition hover:bg-sun-soft"
          >
            {s.cta} <ArrowIcon />
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

/** A parcel travelling store → MSG → customer. Pure SVG + CSS, direction-agnostic. */
function OrderJourney() {
  return (
    <div className="relative rounded-3xl bg-paper-2 p-6" aria-hidden="true">
      <svg viewBox="0 0 360 150" className="w-full rtl:-scale-x-100">
        <defs>
          <path id="oj-path" d="M40 95 C 110 20, 170 20, 180 75 S 270 140, 320 60" />
        </defs>
        <use href="#oj-path" fill="none" stroke="#d8cdbb" strokeWidth="2" strokeDasharray="4 6" />
        <use href="#oj-path" fill="none" stroke="#f6a623" strokeWidth="2.5" strokeDasharray="420" strokeDashoffset="420" className="[animation:oj-draw_3.6s_ease-in-out_infinite]" />
        {/* store */}
        <g transform="translate(18 88)">
          <rect width="44" height="36" rx="6" fill="#17140f" />
          <path d="M4 10h36" stroke="#f6a623" strokeWidth="3" />
          <rect x="16" y="18" width="12" height="18" rx="2" fill="#f4efe6" />
        </g>
        {/* hub */}
        <g transform="translate(162 58)">
          <circle cx="18" cy="18" r="20" fill="#17140f" />
          <path d="M8 22a10 10 0 0 1 20 0Z" fill="#f6a623" />
          <path d="M5 25h26" stroke="#4fe3c1" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* customer home */}
        <g transform="translate(300 34)">
          <path d="M0 18 20 2l20 16v22H0z" fill="#17140f" />
          <rect x="15" y="24" width="10" height="16" rx="1.5" fill="#f6a623" />
        </g>
        {/* parcel */}
        <g>
          <rect x="-7" y="-7" width="14" height="14" rx="2.5" fill="#f6a623" stroke="#17140f" strokeWidth="1.5" />
          <path d="M-7 -1h14" stroke="#17140f" strokeWidth="1.2" />
          <animateMotion dur="3.6s" repeatCount="indefinite" rotate="0" keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear">
            <mpath href="#oj-path" />
          </animateMotion>
        </g>
      </svg>
      <style>{`@keyframes oj-draw{0%{stroke-dashoffset:420}85%,100%{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){animateMotion{display:none}}`}</style>
    </div>
  );
}
