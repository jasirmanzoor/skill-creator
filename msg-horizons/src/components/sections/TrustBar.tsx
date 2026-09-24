import { facts } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";

/** Partner row directly under the hero (the 2026 profile's "Valued partners"; text wordmarks only). */
export default function TrustBar({ t }: { t: Dictionary }) {
  return (
    <section aria-label={t.proof.partnersTitle} className="border-y border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <p className="shrink-0 text-sm text-muted lg:max-w-[14rem]">{t.hero.partnersLead}</p>
        <ul className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-5" dir="ltr">
          {facts.partners.map((p) => (
            <li key={p} className="font-display text-xl font-semibold tracking-[-0.02em] text-ink/45 transition-colors hover:text-ink sm:text-center">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
