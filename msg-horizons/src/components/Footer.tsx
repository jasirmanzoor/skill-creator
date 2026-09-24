import Logo from "./ui/Logo";
import { facts } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Footer({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.footer;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-ink pb-28 pt-16 lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-fog">{f.tagline}</p>
          <p className="mt-2 text-sm text-fog">{facts.nameAr}</p>
        </div>
        <nav aria-label={f.company}>
          <p className="text-sm font-semibold text-white">{f.company}</p>
          <ul className="mt-4 grid gap-2 text-sm text-fog">
            <li><a className="hover:text-white" href="#planner">{t.nav.cta}</a></li>
            <li><a className="hover:text-white" href="#services">{t.nav.services}</a></li>
            <li><a className="hover:text-white" href="#enterprise">{t.nav.enterprise}</a></li>
            <li><a className="hover:text-white" href="#contact">{t.nav.contact}</a></li>
            <li><a className="hover:text-white" href={`/${lang === "en" ? "ar" : "en"}`} hrefLang={lang === "en" ? "ar" : "en"}>{t.nav.langSwitch}</a></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold text-white">{f.legal}</p>
          <dl className="mt-4 grid gap-2 text-sm text-fog">
            <div><dt className="inline">{f.cr}: </dt><dd className="num inline text-mist">{facts.corporate.commercialRegistration}</dd></div>
            <div><dt className="inline">{f.vat}: </dt><dd className="num inline text-mist">{facts.corporate.taxId}</dd></div>
            <div><dd className="text-mist">{f.legalStatus}</dd></div>
            <div><dt className="inline">{f.hq}: </dt><dd className="inline text-mist">{lang === "ar" ? "الرياض، المملكة العربية السعودية" : facts.corporate.headquarters}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl px-5 text-xs text-fog lg:px-8">
        © <span className="num">{year}</span> {facts.legalName}. {f.rights}
      </div>
    </footer>
  );
}
