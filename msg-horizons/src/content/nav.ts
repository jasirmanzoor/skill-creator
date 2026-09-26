/**
 * Information architecture — single source of truth for site movement.
 *
 * Hash destinations map to existing section ids on the homepage.
 * When a section becomes a real route later, change `href` here only.
 * Keep PRIMARY_NAV at 7 items or fewer. New pages join SECONDARY or FOOTER first.
 */

export type NavId =
  | "planner"
  | "sellers"
  | "services"
  | "fleet"
  | "proof"
  | "gallery"
  | "enterprise"
  | "contact";

export type NavItem = {
  id: NavId;
  href: `#${NavId}`;
};

/** Top-level menu. Labels live in the dictionary (`t.nav.*`). */
export const PRIMARY_NAV: readonly NavItem[] = [
  { id: "services", href: "#services" },
  { id: "fleet", href: "#fleet" },
  { id: "enterprise", href: "#enterprise" },
  { id: "contact", href: "#contact" },
] as const;

/** Sections observed for active-state + breadcrumb + search landing. */
export const OBSERVED_SECTIONS: readonly NavId[] = [
  "planner",
  "sellers",
  "services",
  "fleet",
  "proof",
  "gallery",
  "enterprise",
  "contact",
] as const;

export const FOOTER_NAV = {
  services: [
    { id: "services", href: "#services" },
    { id: "fleet", href: "#fleet" },
    { id: "enterprise", href: "#enterprise" },
  ] as const,
  company: [
    { id: "sellers", href: "#sellers" },
    { id: "planner", href: "#planner" },
    { id: "proof", href: "#proof" },
    { id: "contact", href: "#contact" },
  ] as const,
} as const;
