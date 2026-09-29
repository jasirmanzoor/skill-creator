import { PARTNERS } from "@/content/experience";
import type { Dictionary, Locale } from "@/content/i18n";
import PartnerLogo from "../partners/PartnerLogo";

/** Partner logo row directly under the hero (the 2026 profile's "Valued partners"). */
export default function TrustBar({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <section aria-label={t.proof.partnersTitle} className="border-y border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <p className="shrink-0 text-sm text-muted lg:max-w-[12rem]">{t.hero.partnersLead}</p>
        <ul className="grid flex-1 grid-cols-3 items-center gap-x-8 gap-y-6 sm:grid-cols-5" dir="ltr">
          {PARTNERS.map((p) => (
            <li key={p.id} className="flex justify-center opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
              <PartnerLogo id={p.id} lang={lang} className={p.id === "keeta" ? "h-10" : "h-7 sm:h-8"} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
