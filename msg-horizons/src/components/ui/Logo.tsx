/* eslint-disable @next/next/no-img-element -- small vector brand marks, served as-is */

type Variant = "horizontal" | "stacked" | "centered" | "mark";

const FILE: Record<Variant, { src: string; ratio: number }> = {
  horizontal: { src: "/brand/msg-logo", ratio: 268.4 / 51.9 },
  stacked: { src: "/brand/msg-logo-stacked", ratio: 126.2 / 44.1 },
  centered: { src: "/brand/msg-logo-centered", ratio: 118.6 / 79.8 },
  mark: { src: "/brand/msg-mark", ratio: 75.3 / 65.3 },
};

/**
 * The MSG Horizons Logistics logo, from the 2026 brand guidelines (vector paths taken from the guidelines PDF):
 * the parcel-and-arrow mark with the wordmark. Navy on light grounds; inverted = white for dark grounds. Both are
 * stacked and cross-fade, so the header can change ground without animating a filter.
 */
export default function Logo({ className = "", inverted = false, variant = "horizontal", height = 36 }: { className?: string; inverted?: boolean; variant?: Variant; height?: number }) {
  const f = FILE[variant];
  const width = Math.round(height * f.ratio);
  const img = "block h-[var(--logo-h)] w-auto transition-opacity duration-200";
  return (
    <span className={`relative inline-flex items-center ${className}`} dir="ltr" style={{ ["--logo-h" as string]: `${height}px` }}>
      <img src={`${f.src}.svg`} alt="MSG Horizons Logistics" width={width} height={height} className={`${img} ${inverted ? "opacity-0" : "opacity-100"}`} />
      <img src={`${f.src}-white.svg`} alt="" aria-hidden="true" width={width} height={height} className={`absolute inset-0 ${img} ${inverted ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}
