/* eslint-disable @next/next/no-img-element -- small static brand tiles; next/image adds nothing here */
import { PARTNERS, type PartnerId } from "@/content/experience";

/** A partner's own square brand tile, exactly as supplied in MSG's company profile. */
export default function PartnerLogo({ id, className = "" }: { id: PartnerId; className?: string }) {
  const p = PARTNERS.find((x) => x.id === id)!;
  return (
    <img
      src={p.src}
      alt={p.name ?? "MSG Horizons partner"}
      loading="lazy"
      decoding="async"
      className={`block h-full w-full object-contain ${p.wide ? "bg-white p-2" : ""} ${className}`}
    />
  );
}
