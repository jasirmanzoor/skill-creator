/* eslint-disable @next/next/no-img-element -- tiny brand PNG, served as-is */

/** Official MSG HORIZONS logo (from the 2026 company profile). Inverted = solid white for dark backgrounds. */
export default function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center ${className}`} dir="ltr">
      <img
        src="/brand/msg-logo.png"
        alt="MSG Horizons"
        width={356}
        height={168}
        className="h-9 w-auto transition-[filter] duration-300"
        style={{ filter: inverted ? "brightness(0) invert(1)" : "none" }}
      />
    </span>
  );
}
