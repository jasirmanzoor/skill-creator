import { PARTNERS } from "@/content/experience";
import type { Dictionary, Locale } from "@/content/i18n";
import PartnerLogo from "../partners/PartnerLogo";

/** Partner and client brand tiles directly under the hero. */
export default function TrustBar({ t }: { t: Dictionary; lang?: Locale }) {
  return (
    <section id="partners" aria-label={t.proof.partnersTitle} className="scroll-mt-16 border-y border-line bg-surface/[0.62]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <p className="shrink-0 text-sm text-muted lg:max-w-[12rem]">{t.hero.partnersLead}</p>
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-between" dir="ltr">
          {PARTNERS.map((p) => (
            <li
              key={p.id}
              className="size-14 overflow-hidden rounded-2xl shadow-[0_8px_24px_-12px_rgba(17,26,51,0.35)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 sm:size-16"
            >
              <PartnerLogo id={p.id} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
