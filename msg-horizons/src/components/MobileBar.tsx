"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/content/facts";
import type { Dictionary } from "@/content/i18n";
import { WhatsAppIcon } from "./ui/icons";

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
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-line bg-surface/95 p-2 shadow-[0_20px_50px_-20px_rgba(12,14,17,0.35)] backdrop-blur transition-all duration-500 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
      }`}
      aria-hidden={!show}
    >
      <a href="#planner" tabIndex={show ? 0 : -1} onClick={() => track("cta_click", { cta: "plan", location: "mobile_bar" })}
        className="rounded-md bg-ink px-5 py-3 text-center font-medium text-white">
        {t.mobileBar.plan}
      </a>
      <a href={whatsappLink(t.wa.general)} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1}
        onClick={() => track("whatsapp_click", { location: "mobile_bar" })}
        className="inline-flex items-center gap-2 rounded-md bg-[#128c4a] px-4 py-3 font-medium text-white" aria-label={t.mobileBar.whatsapp}>
        <WhatsAppIcon className="size-5" />
        <span className="sr-only sm:not-sr-only">{t.mobileBar.whatsapp}</span>
      </a>
    </div>
  );
}
