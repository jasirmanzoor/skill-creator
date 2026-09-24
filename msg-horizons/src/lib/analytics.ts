"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Conversion analytics. One call fans out to Vercel Web Analytics custom events and,
 * if configured, Google Analytics 4 / GTM via window.dataLayer.
 *
 * Event taxonomy (keep stable — dashboards depend on it):
 *   cta_click        { cta, location }
 *   planner_step     { step, value }
 *   planner_complete { model, modules }
 *   plan_share       { channel }
 *   lead_submit      { interest, delivered }
 *   whatsapp_click   { location }
 *   lang_switch      { to }
 */
type Props = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, props: Props = {}) {
  try {
    vercelTrack(event, props);
  } catch {
    /* analytics must never break the UX */
  }
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
  }
}
