"use client";

import { useEffect, useState } from "react";
import { OBSERVED_SECTIONS, type NavId } from "@/content/nav";

/** Highlights the section currently under the sticky header. */
export function useActiveSection(): NavId | null {
  const [active, setActive] = useState<NavId | null>(null);

  useEffect(() => {
    const nodes = OBSERVED_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!nodes.length) return;

    const read = () => {
      const probe = 96;
      let current: NavId | null = null;
      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe + 40) {
          current = el.id as NavId;
          break;
        }
      }
      if (!current) {
        const first = nodes[0].getBoundingClientRect();
        const last = nodes[nodes.length - 1].getBoundingClientRect();
        if (first.top > probe) current = null;
        else if (last.bottom <= probe) current = nodes[nodes.length - 1].id as NavId;
      }
      setActive(current);
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("hashchange", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("hashchange", read);
    };
  }, []);

  return active;
}
