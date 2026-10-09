import type { MustId, PillarId } from "@/content/covered";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Small stroke icons for the plan's checkpoints and the six areas MSG handles. */
export function CoverIcon({ id, className = "size-5" }: { id: MustId | PillarId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {id === "quote" && <><path {...base} d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path {...base} d="M9 8h6M9 12h6" /></>}
      {id === "pod" && <><path {...base} d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path {...base} d="M9 12l2.2 2.2L15.5 10" /></>}
      {id === "tracking" && <><path {...base} d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z" /><circle {...base} cx="12" cy="11" r="2.2" /></>}
      {id === "cod" && <><rect {...base} x="3" y="7" width="18" height="10" rx="2" /><circle {...base} cx="12" cy="12" r="2.4" /><path {...base} d="M6.5 12h.01M17.5 12h.01" /></>}
      {id === "legal" && <><path {...base} d="M12 4v16M5 20h14M5 8h14" /><path {...base} d="M5 8l-2.5 5a2.5 2.5 0 0 0 5 0zM19 8l-2.5 5a2.5 2.5 0 0 0 5 0z" /></>}
      {id === "infrastructure" && <><path {...base} d="M3 20V9l9-5 9 5v11" /><path {...base} d="M8 20v-6h8v6M8 11h8" /></>}
      {id === "licences" && <><rect {...base} x="4" y="4" width="16" height="16" rx="2" /><path {...base} d="M8 9h8M8 13h4" /><circle {...base} cx="16" cy="16" r="1.6" /></>}
      {id === "team" && <><circle {...base} cx="9" cy="8" r="3" /><path {...base} d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path {...base} d="M16 5.5a3 3 0 0 1 0 5.5M17.5 14.2A5.5 5.5 0 0 1 20.5 19" /></>}
      {id === "visibility" && <><path {...base} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle {...base} cx="12" cy="12" r="2.8" /></>}
      {id === "record" && <><circle {...base} cx="12" cy="9" r="5" /><path {...base} d="M9 13.5L7.5 21 12 18.5l4.5 2.5L15 13.5" /></>}
    </svg>
  );
}
