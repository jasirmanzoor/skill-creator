import { PARTNERS } from "@/content/experience";
import { facts } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import PartnerLogo from "../partners/PartnerLogo";

const copy: Record<Locale, {
  idx: string; title: string; lead: string; partners: string; profile: string; deck: string; pdf: string;
  rows: [string, string][];
}> = {
  en: {
    idx: "Scale",
    title: "Licensed, registered and already running.",
    lead: "Everything a seller would otherwise have to set up is already in place, on the record.",
    partners: "Partner and client networks",
    profile: "Company profile",
    deck: "Profile deck",
    pdf: "Download PDF",
    rows: [
      ["Legal entity", `${facts.legalName} · LLC`],
      ["Commercial registration", facts.corporate.commercialRegistration],
      ["VAT registration", facts.corporate.taxId],
      ["Headquarters", "Al Malaz, Riyadh 12836"],
      ["Operating hub", `Sabya, Jazan · ${facts.sabyaHub.areaM2.toLocaleString("en-US")} m²`],
      ["Fleet", "MSG-owned Toyota Hiace vans · in-house drivers"],
      ["Reach from Sabya", `≈ ${facts.sabyaHub.coverageKm2.toLocaleString("en-US")} km²`],
      ["Annual revenue", facts.metrics.revenueSAR.display],
    ],
  },
  ar: {
    idx: "الحجم",
    title: "مرخّصون ومسجّلون ونعمل بالفعل.",
    lead: "كل ما كان على البائع إعداده بنفسه جاهز مسبقاً، وموثّق رسمياً.",
    partners: "شبكات الشركاء والعملاء",
    profile: "الملف التعريفي",
    deck: "الكتيّب",
    pdf: "تنزيل PDF",
    rows: [
      ["الكيان القانوني", "شركة ام اس جي هورايزونز · ذات مسؤولية محدودة"],
      ["السجل التجاري", facts.corporate.commercialRegistration],
      ["رقم ضريبة القيمة المضافة", facts.corporate.taxId],
      ["المقر الرئيسي", "الملز، الرياض 12836"],
      ["مركز التشغيل", `صبيا، جازان · ${facts.sabyaHub.areaM2.toLocaleString("en-US")} م²`],
      ["الأسطول", "مركبات تويوتا هايس مملوكة لام اس جي · سائقون من فريقنا"],
      ["التغطية من صبيا", `≈ ${facts.sabyaHub.coverageKm2.toLocaleString("en-US")} كم²`],
      ["الإيرادات السنوية", "+20 مليون ريال"],
    ],
  },
};

/**
 * Operational scale and partner credibility, as a record rather than a boast: the company's registered facts and
 * its own operation in one specification table, the partner and client networks MSG runs alongside, and MSG's stated
 * vision. Figures shown in the hero are not repeated here. The full profile, deck and PDF are one step away.
 */
export default function Proof({ t, lang = "en" }: { t: Dictionary; lang?: Locale }) {
  const c = copy[lang];
  const digits = (v: string) => /^[\d\s·≈.,+A-Za-z²]+$/.test(v) && /\d{5,}/.test(v);
  return (
    <section id="proof" aria-labelledby="proof-title" className="scroll-mt-16 border-t border-line bg-paper text-ink">
      <div className="mx-auto grid max-w-[88rem] gap-x-12 gap-y-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-28">
        <div className="lg:col-span-4">
          <p className="lbl idx text-brand">{c.idx}</p>
          <h2 id="proof-title" className="mt-6 font-display text-[clamp(2rem,3.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance rtl:leading-[1.3] rtl:tracking-normal">{c.title}</h2>
          <p className="mt-5 max-w-md text-muted text-pretty">{c.lead}</p>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a href={`/${lang}/company-profile`} className="text-brand underline-offset-4 hover:underline">{c.profile} →</a>
            <a href={`/${lang}/company-profile/deck`} className="text-ink underline-offset-4 hover:underline">{c.deck}</a>
            <a href={`/media/profile/MSG-Horizons-Company-Profile-${lang.toUpperCase()}.pdf`} download className="text-ink underline-offset-4 hover:underline">{c.pdf}</a>
          </p>
        </div>

        <div className="lg:col-span-8">
          <dl className="border-t border-ink">
            {c.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="lbl pt-1 text-muted">{k}</dt>
                <dd className={`font-display text-lg font-semibold ${digits(v) ? "num" : ""}`} dir={digits(v) ? "ltr" : undefined}>{v}</dd>
              </div>
            ))}
          </dl>

          <div id="partners" className="mt-14 scroll-mt-24">
            <p className="lbl text-muted">{c.partners}</p>
            <ul aria-label={t.proof.partnersTitle} className="mt-4 grid grid-cols-4 border-s border-t border-line sm:grid-cols-7" dir="ltr">
              {PARTNERS.map((p) => (
                <li key={p.id} className="grid aspect-square place-items-center border-b border-e border-line bg-surface">
                  <span className="block size-12 overflow-hidden rounded-md sm:size-14"><PartnerLogo id={p.id} /></span>
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="mt-14 border-s-2 border-brand ps-5">
            <p className="font-display text-xl font-medium leading-snug text-ink text-pretty sm:text-2xl">“{t.proof.vision}”</p>
            <p className="lbl mt-3 text-muted">{t.proof.vision2030}</p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
