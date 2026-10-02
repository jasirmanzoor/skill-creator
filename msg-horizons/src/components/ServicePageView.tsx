import Logo from "./ui/Logo";
import Footer from "./Footer";
import ServiceScene from "./scenes/ServiceScene";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "./ui/icons";
import { whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";
import { pageChrome, servicePages, type ServiceSlug } from "@/content/servicePages";

/** Server-rendered search landing page for one service cluster. Light, fast, fully crawlable. */
export default function ServicePageView({ t, lang, slug }: { t: Dictionary; lang: Locale; slug: ServiceSlug }) {
  const pg = servicePages[lang][slug];
  const c = pageChrome[lang];
  const other: Locale = lang === "en" ? "ar" : "en";
  const planHref = `/${lang}?persona=${pg.persona}#planner`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <a href={`/${lang}`} className="rounded" aria-label="MSG Horizons">
            <Logo />
          </a>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href={`/${other}/services/${slug}`} hrefLang={other} className="rounded px-2 py-1 text-sm text-muted hover:text-ink">
              {c.langSwitch}
            </a>
            <a href={planHref} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-3">
              {t.nav.cta}
            </a>
          </nav>
        </div>
      </header>

      <main id="main" className="bg-paper">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-6 text-sm text-muted lg:px-8">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a className="hover:text-ink" href={`/${lang}`}>{c.home}</a></li>
            <li aria-hidden="true">/</li>
            <li><a className="hover:text-ink" href={`/${lang}/services`}>{c.services}</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{pg.eyebrow}</li>
          </ol>
        </nav>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24">
          <div>
            <span className="label">{pg.eyebrow}</span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-ink text-balance sm:text-5xl lg:text-6xl rtl:tracking-normal rtl:leading-[1.25]">
              {pg.h1}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted text-pretty">{pg.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={planHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 font-medium text-white hover:bg-ink-3">
                {c.plan} <ArrowIcon />
              </a>
              <a
                href={whatsappLink(c.waIntro(pg.h1))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-6 py-3.5 font-medium text-ink hover:border-ink"
              >
                <WhatsAppIcon className="size-5 text-whatsapp" /> {c.whatsapp}
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line shadow-[0_40px_80px_-40px_rgba(12,14,17,0.45)]">
            <ServiceScene id={pg.scene} />
          </div>
        </section>

        <section aria-labelledby="scale-title" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <h2 id="scale-title" className="sr-only">{c.scaleTitle}</h2>
            <dl className="grid grid-cols-3 gap-4 text-center sm:text-start">
              {c.scale.map((s) => (
                <div key={s.l} className="flex flex-col-reverse items-center sm:items-start">
                  <dt className="text-sm text-muted">{s.l}</dt>
                  <dd className="num font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="included-title" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 id="included-title" className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl rtl:tracking-normal">{c.includedTitle}</h2>
              <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                {pg.included.map((x) => (
                  <li key={x.t} className="bg-surface p-6">
                    <CheckIcon className="size-5 text-brand" />
                    <h3 className="mt-3 font-semibold text-ink">{x.t}</h3>
                    <p className="mt-1.5 text-sm text-muted">{x.d}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl rtl:tracking-normal">{c.forTitle}</h2>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {pg.forWho.map((w) => (
                  <li key={w} className="py-4 text-ink">{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-title" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 id="how-title" className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl rtl:tracking-normal">{c.howTitle}</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {c.how.map((h, i) => (
                <li key={h.t}>
                  <span className="num inline-flex size-8 items-center justify-center rounded-full border border-line-strong text-sm font-medium text-ink">{i + 1}</span>
                  <h3 className="mt-4 font-semibold text-ink">{h.t}</h3>
                  <p className="mt-1.5 text-sm text-muted">{h.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <h2 id="faq-title" className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl rtl:tracking-normal">{c.faqTitle}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {pg.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  <h3>{f.q}</h3>
                  <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="related-title" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
            <h2 id="related-title" className="font-display text-2xl font-semibold text-ink">{c.relatedTitle}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {pg.related.map((r) => (
                <li key={r}>
                  <a href={`/${lang}/services/${r}`} className="group flex h-full items-center justify-between gap-3 rounded-lg border border-line p-5 hover:border-ink">
                    <span className="font-medium text-ink">{servicePages[lang][r].h1}</span>
                    <ArrowIcon className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] rtl:tracking-normal">{c.ctaTitle}</h2>
              <p className="mt-3 text-white/70">{c.ctaBody}</p>
            </div>
            <a href={planHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-medium text-ink hover:bg-white/90">
              {c.plan} <ArrowIcon />
            </a>
          </div>
        </section>
      </main>
      <Footer t={t} lang={lang} />
    </>
  );
}
