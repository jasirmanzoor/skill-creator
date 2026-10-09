import type Lenis from "lenis";

/**
 * One way to scroll the page from code. When momentum scrolling (Lenis) is running it must do the moving,
 * otherwise it would fight a native smooth scroll; without it we fall back to the browser's own.
 */
let lenis: Lenis | null = null;
export const registerScroller = (l: Lenis | null) => { lenis = l; };

const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;

export function scrollToY(y: number, { immediate = false, duration = 1.15 }: { immediate?: boolean; duration?: number } = {}) {
  const top = Math.max(0, Math.round(y));
  if (lenis) lenis.scrollTo(top, { immediate, duration, easing: easeOutQuart });
  else window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}

/** freeze the page behind a full-screen overlay, and let it move again afterwards */
export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
