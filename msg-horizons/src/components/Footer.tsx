import Logo from "./ui/Logo";
import { facts, whatsappLink } from "@/content/facts";
import { FOOTER_NAV } from "@/content/nav";
import type { Dictionary, Locale } from "@/content/i18n";
import { SERVICE_SLUGS, servicePages } from "@/content/servicePages";

const LABEL: Record<string, keyof Dictionary["nav"]> = {
  services: "services",
  fleet: "fleet",
  enterprise: "enterprise",
  sellers: "sellers",
  planner: "planFull",
  proof: "proof",
  contact: "contact",
};

export default function Footer({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.footer;
  const year = new Date().getFullYear();
  return (
    <footer data-theme="dark" className="border-t border-white/10 bg-[#07090f] pb-28 pt-16 text-white lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-white/65">{f.tagline}</p>
          <p className="mt-2 text-sm text-white/45">{facts.nameAr}</p>
        </div>

        <nav aria-label={f.services}>
          <p className="text-sm font-semibold">{f.services}</p>
          <ul className="mt-4 grid gap-2 text-sm text-white/65">
            {SERVICE_SLUGS.map((slug) => (
              <li key={slug}>
                <a className="hover:text-white" href={`/${lang}/services/${slug}`}>
                  {servicePages[lang][slug].eyebrow}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={f.company}>
          <p className="text-sm font-semibold">{f.company}</p>
          <ul className="mt-4 grid gap-2 text-sm text-white/65">
            {FOOTER_NAV.company.map((item) => (
              <li key={item.id}>
                <a className="hover:text-white" href={`/${lang}${item.href}`}>
                  {t.nav[LABEL[item.id]]}
                </a>
              </li>
            ))}
            <li>
              <a className="hover:text-white" href={`/${lang === "en" ? "ar" : "en"}`} hrefLang={lang === "en" ? "ar" : "en"}>
                {t.nav.langSwitch}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold">{f.talk}</p>
          <ul className="mt-4 grid gap-2 text-sm text-white/65">
            <li>
              <a className="hover:text-white" href={`tel:${facts.contact.phoneE164}`}>
                {facts.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${facts.contact.email}`}>
                {facts.contact.email}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                {t.nav.whatsapp}
              </a>
            </li>
            <li>{lang === "ar" ? "الملز، الرياض 12836" : facts.contact.addressDisplay}</li>
          </ul>
          <p className="mt-6 text-sm font-semibold">{f.legal}</p>
          <dl className="mt-3 grid gap-1 text-sm text-white/65">
            <div>
              <dt className="inline">{f.cr}: </dt>
              <dd className="num inline text-white/85">{facts.corporate.commercialRegistration}</dd>
            </div>
            <div>
              <dt className="inline">{f.vat}: </dt>
              <dd className="num inline text-white/85">{facts.corporate.taxId}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs text-white/45 lg:px-8">
        © <span className="num">{year}</span> {facts.legalName}. {f.rights}
      </div>
    </footer>
  );
}
