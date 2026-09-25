import Logo from "./ui/Logo";
import { facts } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Footer({ t, lang }: { t: Dictionary; lang: Locale }) {
  const f = t.footer;
  const year = new Date().getFullYear();
  return (
    <footer data-theme="dark" className="border-t border-white/10 bg-[#07090f] pb-28 pt-16 text-white lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-white/65">{f.tagline}</p>
          <p className="mt-2 text-sm text-white/45">{facts.nameAr}</p>
        </div>
        <nav aria-label={f.company}>
          <p className="text-sm font-semibold">{f.company}</p>
          <ul className="mt-4 grid gap-2 text-sm text-white/65">
            <li><a className="hover:text-white" href="#planner">{t.nav.cta}</a></li>
            <li><a className="hover:text-white" href="#services">{t.nav.services}</a></li>
            <li><a className="hover:text-white" href="#enterprise">{t.nav.enterprise}</a></li>
            <li><a className="hover:text-white" href="#contact">{t.nav.contact}</a></li>
            <li><a className="hover:text-white" href={`/${lang === "en" ? "ar" : "en"}`} hrefLang={lang === "en" ? "ar" : "en"}>{t.nav.langSwitch}</a></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold">{f.legal}</p>
          <dl className="mt-4 grid gap-2 text-sm text-white/65">
            <div><dt className="inline">{f.cr}: </dt><dd className="num inline text-white/85">{facts.corporate.commercialRegistration}</dd></div>
            <div><dt className="inline">{f.vat}: </dt><dd className="num inline text-white/85">{facts.corporate.taxId}</dd></div>
            <div><dd className="text-white/85">{f.legalStatus}</dd></div>
            <div><dt className="inline">{f.hq}: </dt><dd className="inline text-white/85">{lang === "ar" ? "الرياض، المملكة العربية السعودية" : facts.corporate.headquarters}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs text-white/45 lg:px-8">
        © <span className="num">{year}</span> {facts.legalName}. {f.rights}
      </div>
    </footer>
  );
}
