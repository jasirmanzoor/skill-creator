import Lenis from "lenis";

/**
 * The profile's motion engine, from the Selene template: one requestAnimationFrame loop for the whole page. Lenis
 * advances first, then every scroll-driven section reads its own rect and writes styles directly, so scrolling
 * never re-renders React. With `?film` in the URL there is no smooth scroll and no loop of its own: the film
 * renderer (reel/profile-film.mjs) scrolls the page and calls `window.__profileTick(time)` once per frame.
 */

type Tick = (time: number) => void;

const subscribers = new Set<Tick>();
let lenis: Lenis | null = null;

export const isFilm = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("film");

export function startScroll(reduced: boolean): () => void {
  if (isFilm()) {
    (window as unknown as { __profileTick: Tick }).__profileTick = (t) => subscribers.forEach((fn) => fn(t));
    document.documentElement.dataset.film = "";
    return () => {};
  }
  if (!reduced) lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    subscribers.forEach((fn) => fn(time));
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** Smooth-scrolls to an in-page hash like `#network`, or to the top for `#top`. */
export function scrollToHash(hash: string) {
  const target = hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === "number") window.scrollTo({ top: target });
  else target.scrollIntoView();
  history.replaceState(null, "", hash === "#top" ? " " : hash);
}

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Where `v` sits between `a` and `b`, clamped to 0–1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scroll progress through a tall section whose child is `position: sticky`: 0 when the section's top meets the
 * viewport top, 1 when the sticky child is about to unpin.
 */
export function pinProgress(el: HTMLElement): { p: number; rect: DOMRect; vh: number } {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = Math.max(1, rect.height - vh);
  return { p: clamp(-rect.top / span), rect, vh };
}
