/* eslint-disable @next/next/no-img-element -- small static brand files; next/image adds nothing here */
import { PARTNERS, type PartnerId } from "@/content/experience";
import type { Locale } from "@/content/i18n";

/** Official partner artwork where supplied; otherwise a restrained name wordmark (never an imitation of the mark). */
export default function PartnerLogo({ id, lang, className = "h-9" }: { id: PartnerId; lang: Locale; className?: string }) {
  const p = PARTNERS.find((x) => x.id === id)!;
  if (p.logo) {
    const src = (lang === "ar" && p.logo.ar) || p.logo.en;
    return <img src={src} alt={p.name} width={p.logo.w} height={p.logo.h} loading="lazy" decoding="async" className={`${className} w-auto object-contain`} />;
  }
  return (
    <span className={`inline-flex items-center font-display font-semibold tracking-[-0.02em] text-ink ${className}`} style={{ fontSize: "1.35em" }} dir="ltr">
      {p.name}
    </span>
  );
}
