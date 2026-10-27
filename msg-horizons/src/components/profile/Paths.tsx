"use client";

import type { ProfileCopy } from "@/content/profile";
import { whatsappLink } from "@/content/facts";
import { ServiceIcon } from "@/components/ui/icons";
import { useReveals } from "./useReveals";

/**
 * Three ways to work with MSG, after the template's missions: each card carries a nest of the MSG mark's hexagon,
 * one ring for each step up in scale, and turns slowly on hover. Under them, the seven services in one line each.
 */

const HEX = "M-40 0 L-20 -34.6 L20 -34.6 L40 0 L20 34.6 L-20 34.6 Z";

export default function Paths({ c, lang }: { c: ProfileCopy; lang: string }) {
  const ref = useReveals<HTMLElement>();
  const href = (i: number) => (i === 0 ? whatsappLink(c.paths.items[0].cta) : i === 1 ? `/${lang}#planner` : "#contact");
  return (
    <section ref={ref} id="paths" aria-labelledby="paths-title" className="relative bg-[#05070c] px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#7fcbfb] rtl:tracking-normal">{c.paths.eyebrow}</p>
          <h2 id="paths-title" className="pf-display mt-4 max-w-[24ch] text-white">{c.paths.heading}</h2>
        </div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal">{c.paths.note}</p>
      </div>

      <ol className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
        {c.paths.items.map((m, i) => (
          <li
            key={m.name}
            data-reveal
            style={{ transitionDelay: `${i * 110}ms` }}
            className={`group relative flex flex-col overflow-hidden rounded-[8px] p-6 ring-1 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 md:p-8 ${
              m.featured ? "bg-[#0b1326] ring-[#009df8]/60 hover:shadow-[0_30px_80px_-30px_rgb(0_157_248/0.45)]" : "bg-[#0b1326]/60 ring-white/10 hover:ring-white/25"
            }`}
          >
            <svg aria-hidden="true" viewBox="-100 -100 200 200" className="absolute -end-10 -top-10 size-48 text-white/10 transition-transform duration-[1.2s] group-hover:rotate-[30deg]">
              {Array.from({ length: i + 1 }, (_, k) => (
                <path key={k} d={HEX} fill="none" stroke="currentColor" transform={`scale(${1 + k * 0.55}) rotate(${k * 10})`} vectorEffect="non-scaling-stroke" />
              ))}
              <path d={HEX} fill="currentColor" transform="scale(0.22)" />
            </svg>

            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-white/55 rtl:tracking-normal">{m.who}</p>
            <h3 className="mt-5 font-display text-[2.6rem] font-semibold leading-none tracking-[-0.02em] text-white">{m.name}</h3>
            <ul className="mt-8 space-y-2.5 border-t border-white/10 pt-6">
              {m.lines.map((l) => (
                <li key={l} className="flex gap-3 text-[0.9375rem] text-white/80">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-[#009df8]" />
                  {l}
                </li>
              ))}
            </ul>
            <a
              href={href(i)}
              {...(i === 0 ? { target: "_blank", rel: "noopener" } : {})}
              className={`mt-10 rounded-[4px] px-5 py-3.5 text-center font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors rtl:tracking-normal ${
                m.featured ? "bg-[#009df8] text-[#05070c] hover:bg-white" : "text-white ring-1 ring-white/25 hover:bg-white hover:text-[#05070c]"
              }`}
            >
              {m.cta}
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-20 border-t border-white/10 pt-10" data-reveal>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/50 rtl:tracking-normal">{c.paths.servicesTitle}</p>
        <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.services.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-[0.9375rem] text-white/85">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/[0.05] text-[#7fcbfb] ring-1 ring-white/10 [&_svg]:size-[1.15rem]">
                <ServiceIcon id={s.id} />
              </span>
              <span>
                <span className="me-2 font-mono text-[0.625rem] text-white/40" dir="ltr">0{i + 1}</span>
                {s.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
