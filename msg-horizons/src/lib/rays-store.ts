/**
 * How many section-level rays of light (components/fx/RaysLayer) are on screen. The site-wide backdrop
 * (components/fx/RaysBackdrop) rests while one is, so only one WebGL light runs at a time.
 */
let open = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function layerOpened() {
  open++;
  emit();
}
export function layerClosed() {
  open = Math.max(0, open - 1);
  emit();
}
export function subscribeLayers(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
export const layersOpen = () => open > 0;
