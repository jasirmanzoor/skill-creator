import ContactForm from "./ContactForm";
import Reveal from "../ui/Reveal";
import TrackedLink from "../ui/TrackedLink";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../ui/icons";
import { facts, whatsappLink } from "@/content/facts";
import type { Dictionary, Locale } from "@/content/i18n";

/** Arrives at night: set directly on the night sky, with the form as a lit card. */
export default function Contact({ t, lang }: { t: Dictionary; lang: Locale }) {
  const c = t.contact;
  const ch = c.channels;
  const row = "flex items-center gap-4 border-b border-white/15 py-4 transition-colors";
  return (
    <section id="contact" data-theme="dark" aria-labelledby="contact-title" className="on-dark scroll-mt-16 bg-[#07090f]/80 py-28 text-white backdrop-blur-[2px] lg:py-40">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[1fr_1.15fr] lg:px-8">
        <Reveal>
          <span className="label">{c.eyebrow}</span>
          <h2 id="contact-title" className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl rtl:tracking-normal">
            {c.title}
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/75">{c.lead}</p>

          <ul className="mt-10 border-t border-white/15">
            <li>
              <TrackedLink href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" event="whatsapp_click" props={{ location: "contact" }} className={`${row} hover:text-white`}>
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-[#25d366] text-white"><WhatsAppIcon /></span>
                <span className="flex-1">
                  <span className="block font-semibold">{ch.whatsapp}</span>
                  <span className="text-sm text-white/65">{ch.whatsappD}</span>
                </span>
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`tel:${facts.contact.phoneE164}`} event="cta_click" props={{ cta: "call", location: "contact" }} className={row}>
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-white/10"><PhoneIcon /></span>
                <span>
                  <span className="block text-sm text-white/65">{ch.call}</span>
                  <span className="num block font-semibold">{facts.contact.phoneDisplay}</span>
                </span>
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`mailto:${facts.contact.email}`} event="cta_click" props={{ cta: "email", location: "contact" }} className={row}>
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-white/10"><MailIcon /></span>
                <span>
                  <span className="block text-sm text-white/65">{ch.email}</span>
                  <span className="block font-semibold" dir="ltr">{facts.contact.email}</span>
                </span>
              </TrackedLink>
            </li>
            <li className={row}>
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-white/10"><PinIcon /></span>
              <span>
                <span className="block text-sm text-white/65">{ch.visit}</span>
                <address className="not-italic font-semibold">
                  {lang === "ar" ? "الملز، الرياض 12836، المملكة العربية السعودية" : facts.contact.addressDisplay}
                </address>
              </span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={100}>
          <ContactForm t={t} lang={lang} />
        </Reveal>
      </div>
    </section>
  );
}
