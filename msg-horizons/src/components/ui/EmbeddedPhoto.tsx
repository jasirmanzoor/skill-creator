/* eslint-disable @next/next/no-img-element -- MSG's own photography, local files */

type Tone = "teal" | "forest" | "sand";

const BASE: Record<Tone, string> = {
  teal: "linear-gradient(160deg,#0b3a40 0%,#137179 55%,#6cc3c3 100%)",
  forest: "linear-gradient(160deg,#04110a 0%,#0b3a26 50%,#0f9641 100%)",
  sand: "linear-gradient(160deg,#5a3a12 0%,#b98a45 55%,#f3dfb6 100%)",
};
const SHEEN: Record<Tone, string> = {
  teal: "radial-gradient(70% 60% at 75% 20%,rgba(226,244,243,0.55),transparent 70%)",
  forest: "radial-gradient(70% 60% at 75% 20%,rgba(76,201,122,0.35),transparent 70%)",
  sand: "radial-gradient(70% 60% at 75% 20%,rgba(255,246,220,0.6),transparent 70%)",
};
const MASK: Record<"all" | "bottom" | "start" | "end" | "soft" | "none", string | undefined> = {
  all: "radial-gradient(120% 95% at 50% 45%,#000 55%,transparent 100%)",
  bottom: "linear-gradient(180deg,#000 35%,transparent 100%)",
  start: "linear-gradient(to var(--fade-end,right),transparent 0%,#000 35%)",
  end: "linear-gradient(to var(--fade-end,right),#000 30%,transparent 95%)",
  soft: "radial-gradient(closest-side,#000 35%,transparent 100%)",
  none: undefined,
};

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * A photograph dissolved into the page instead of pasted on it: the image is reduced to its light
 * (luminosity blend) over a brand-colour field, a soft sheen lifts the highlights, a fine grain ties
 * it to the surface, and a mask melts its edges into whatever is behind. Use it for MSG's own
 * warehouse and operations photography.
 */
export default function EmbeddedPhoto({
  src, alt = "", tone = "teal", fade = "all", position = "50% 50%", className = "", strength = 1, children,
}: {
  src: string;
  alt?: string;
  tone?: Tone;
  fade?: keyof typeof MASK;
  position?: string;
  className?: string;
  /** 0–1: how much of the photo's own colour survives (0 = pure duotone) */
  strength?: number;
  children?: React.ReactNode;
}) {
  const mask = MASK[fade];
  return (
    <div
      className={`isolate overflow-hidden ${/\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative"} ${className}`}
      style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
    >
      <div aria-hidden="true" className="absolute inset-0" style={{ background: BASE[tone] }} />
      <img
        src={src}
        alt={alt}
        decoding="async"
        className="absolute inset-0 size-full object-cover [filter:grayscale(1)_contrast(1.15)_brightness(1.05)]"
        style={{ objectPosition: position, mixBlendMode: "luminosity", opacity: 0.92 }}
      />
      {strength > 0 ? (
        <img
          aria-hidden="true"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: position, mixBlendMode: "soft-light", opacity: 0.5 * strength }}
        />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 mix-blend-soft-light" style={{ background: SHEEN[tone] }} />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}
