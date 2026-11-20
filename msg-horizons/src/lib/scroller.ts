/**
 * One way to scroll the page from code. The page scrolls natively (no smooth-scroll library), so this is the
 * browser's own smooth scroll, or an instant jump when asked or when the visitor prefers reduced motion.
 * `duration`, `force` and `easing` are accepted for older callers and ignored.
 */
export function scrollToY(y: number, { immediate = false }: { immediate?: boolean; duration?: number; force?: boolean; easing?: (t: number) => number } = {}) {
  const top = Math.max(0, Math.round(y));
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: immediate || reduce ? "instant" : "smooth" }); // "instant", not "auto": the page's CSS scroll-behavior is smooth
}

/** freeze the page behind a full-screen overlay, and let it move again afterwards */
export function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
