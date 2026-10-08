"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";
import { WhatsAppIcon } from "./ui/icons";

/** where the route's progress button docks while the bar is showing (components/journey) */
export const ROUTE_SLOT_ID = "route-slot";
export const MOBILE_BAR_EVENT = "msg-mobilebar";
export const MOBILE_BAR_ATTR = "data-mobilebar";

/** Thumb-reach actions on mobile, shown after the hero and hidden over the contact section. */
export default function MobileBar({ t }: { t: Dictionary }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const contact = document.getElementById("contact");
      const inContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      setShow(window.scrollY > window.innerHeight * 0.8 && !inContact);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // the route docks its progress button here instead of floating over the page
  useEffect(() => {
    document.documentElement.toggleAttribute(MOBILE_BAR_ATTR, show);
    window.dispatchEvent(new Event(MOBILE_BAR_EVENT));
  }, [show]);
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-[var(--shadow-float)] backdrop-blur transition-ui duration-[240ms] lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+0.75rem)] opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div id={ROUTE_SLOT_ID} className="contents" />
      <a href="#planner" tabIndex={show ? 0 : -1} onClick={() => track("cta_click", { cta: "plan", location: "mobile_bar" })}
        className="btn-primary min-h-12 flex-1 px-5 py-3">
        {t.mobileBar.plan}
      </a>
      <a href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1}
        onClick={() => track("whatsapp_click", { location: "mobile_bar" })}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-whatsapp px-4 py-3 font-medium text-white" aria-label={t.mobileBar.whatsapp}>
        <WhatsAppIcon className="size-5" />
        <span className="sr-only sm:not-sr-only">{t.mobileBar.whatsapp}</span>
      </a>
    </div>
  );
}
