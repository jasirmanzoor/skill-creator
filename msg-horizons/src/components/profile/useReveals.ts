"use client";

import { useEffect, useRef } from "react";

/**
 * Watches every `[data-reveal]` inside the returned ref's element and adds `.is-in` the first time each is seen
 * (from the template). Each section owns its observer, so elements that mount later are never left hidden.
 */
export function useReveals<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const watch = () => root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return ref;
}
