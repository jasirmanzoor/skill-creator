import ContactForm from "./ContactForm";
import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../ui/icons";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

export default function Contact({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = t.contact;
  const ch = c.channels;
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-16 overflow-hidden bg-ink py-24 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(246,166,35,0.14),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.25fr] lg:px-8">
        <Reveal>
          <p className="eyebrow text-sun">{c.eyebrow}</p>
          <h2 id="contact-title" className="mt-4 font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl rtl:tracking-normal">
            {c.title}
          </h2>
          <p className="mt-6 max-w-md text-lg text-mist">{c.lead}</p>

          <ul className="mt-10 grid gap-3">
            <li>
              <TrackedLink
                href={whatsappLink(t.wa.general)}
                target="_blank"
                rel="noopener noreferrer"
                event="whatsapp_click"
                props={{ location: "contact" }}
                className="group flex items-center gap-4 rounded-2xl border border-signal/30 bg-signal/10 p-4 transition hover:border-signal"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-signal text-ink"><WhatsAppIcon /></span>
                <span>
                  <span className="block font-semibold text-white">{ch.whatsapp}</span>
                  <span className="text-sm text-signal">{ch.whatsappD}</span>
                </span>
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={`tel:${facts.contact.phoneE164}`}
                event="cta_click"
                props={{ cta: "call", location: "contact" }}
                className="flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-white/25"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/5 text-sun"><PhoneIcon /></span>
                <span>
                  <span className="block text-sm text-fog">{ch.call}</span>
                  <span className="num block font-semibold text-white">{facts.contact.phoneDisplay}</span>
                </span>
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={`mailto:${facts.contact.email}`}
                event="cta_click"
                props={{ cta: "email", location: "contact" }}
                className="flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-white/25"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/5 text-sun"><MailIcon /></span>
                <span>
                  <span className="block text-sm text-fog">{ch.email}</span>
                  <span className="block font-semibold text-white" dir="ltr">{facts.contact.email}</span>
                </span>
              </TrackedLink>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-line p-4">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/5 text-sun"><PinIcon /></span>
              <span>
                <span className="block text-sm text-fog">{ch.visit}</span>
                <address className="not-italic font-semibold text-white">
                  {lang === "ar" ? "الملز، الرياض 12836، المملكة العربية السعودية" : facts.contact.addressDisplay}
                </address>
              </span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <ContactForm t={t} lang={lang} />
        </Reveal>
      </div>
    </section>
  );
}
