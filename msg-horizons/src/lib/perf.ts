import { useSyncExternalStore } from "react";

/**
 * Whether this visitor should get the lighter version of the site's heavy motion (the drawn headings and the rays of
 * light). Three things decide it, in order:
 *   1. `?perf=full` or `?perf=low` in the address, for testing;
 *   2. the visitor's own settings and kit: less motion, data saver, very little memory or only one or two cores;
 *   3. the page itself: if it cannot hold about 30 frames a second after it has loaded (`watchFrameRate`), it steps
 *      down for the rest of the visit.
 * Browser only; on the server the answer is false, so the HTML is the same for everyone.
 */
const KEY = "msg-perf";
const listeners = new Set<() => void>();
let slow = false;
let forced: boolean | null = null;
let watching = false;

if (typeof window !== "undefined") {
  const q = new URLSearchParams(location.search).get("perf");
  if (q === "full") forced = false;
  if (q === "low") forced = true;
  try {
    slow = sessionStorage.getItem(KEY) === "low";
  } catch {}
}

/** mirrors the verdict on <html data-perf="low"> so the stylesheet can rest ambient loops too */
function mark() {
  if (typeof document !== "undefined") document.documentElement.dataset.perf = lowPower() ? "low" : "full";
}

function kit(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true;
  return !!nav.hardwareConcurrency && nav.hardwareConcurrency <= 2;
}

export function lowPower(): boolean {
  if (typeof window === "undefined") return false;
  if (forced !== null) return forced;
  return slow || kit();
}

/** a touch phone or tablet: fewer animated words at once, to spare the battery */
export function isTouch(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

if (typeof window !== "undefined") mark();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

/** `lowPower()` as a React value: false while rendering on the server, the real answer once on the client */
export function useLowPower(): boolean {
  return useSyncExternalStore(subscribe, lowPower, () => false);
}

/**
 * Times the page's own frames once it has settled. Two slow windows in a row (average frame over 30 ms) mean the
 * device cannot keep up, so the heavy motion steps down for the rest of the visit. Called once, from PerfGovernor.
 */
export function watchFrameRate(): () => void {
  if (watching || forced !== null || slow || kit()) return () => {};
  watching = true;
  let strikes = 0;
  let timer = 0;
  let raf = 0;
  let stopped = false;

  const sample = () => {
    if (stopped) return;
    if (document.visibilityState === "hidden") {
      timer = window.setTimeout(sample, 2000);
      return;
    }
    const started = performance.now();
    let last = started;
    let frames = 0;
    const tick = (now: number) => {
      frames++;
      last = now;
      if (frames < 45 && now - started < 4000) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const avg = (last - started) / Math.max(1, frames);
      strikes = avg > 30 ? strikes + 1 : 0;
      if (strikes >= 2) {
        slow = true;
        try { sessionStorage.setItem(KEY, "low"); } catch {}
        mark();
        listeners.forEach((l) => l());
        return;
      }
      timer = window.setTimeout(sample, 2500);
    };
    raf = requestAnimationFrame(tick);
  };

  timer = window.setTimeout(sample, 3500);
  return () => {
    stopped = true;
    watching = false;
    clearTimeout(timer);
    cancelAnimationFrame(raf);
  };
}
