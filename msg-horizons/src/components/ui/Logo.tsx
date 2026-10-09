/* eslint-disable @next/next/no-img-element -- tiny brand PNG, served as-is */

/**
 * Official MSG HORIZONS logo (from the 2026 company profile). Inverted = solid white for dark backgrounds.
 * Both versions are stacked and cross-fade, so the header can change ground without animating a filter.
 */
export default function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`relative inline-flex items-center ${className}`} dir="ltr">
      <img
        src="/brand/msg-logo.png"
        alt="MSG Horizons"
        width={356}
        height={168}
        className={`h-9 w-auto transition-opacity duration-200 ${inverted ? "opacity-0" : "opacity-100"}`}
      />
      <img
        src="/brand/msg-logo.png"
        alt=""
        aria-hidden="true"
        width={356}
        height={168}
        className={`absolute inset-0 h-9 w-auto transition-opacity duration-200 [filter:brightness(0)_invert(1)] ${inverted ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
