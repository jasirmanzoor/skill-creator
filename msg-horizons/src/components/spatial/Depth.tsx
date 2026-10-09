"use client";

import { useEffect, useRef } from "react";

/**
 * Section wrapper. It no longer moves the section: headings carry the one entrance (ui/Reveal). What it still
 * does is mark the section while it is away from the viewport, so the loops inside it rest (see [data-offscreen]
 * in globals.css).
 */
export default function Depth({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-offscreen", !e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
