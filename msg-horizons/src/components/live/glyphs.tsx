type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const BellGlyph = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

/** location arrow: "this phone is sharing where it is" */
export const LocateGlyph = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M20.5 3.5 3.5 10.8l6.6 2.3 2.3 6.6 8.1-16.2Z" fill="currentColor" fillOpacity="0.18" />
  </svg>
);

export const VanGlyph = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="M2.5 16.5V8.2c0-.7.6-1.2 1.2-1.2h9.6c.6 0 1.2.5 1.2 1.2V16.5" />
    <path d="M14.5 10h3.4l2.6 3v3.5h-6" />
    <circle cx="7" cy="17.3" r="1.9" />
    <circle cx="17.2" cy="17.3" r="1.9" />
  </svg>
);

export const BoxGlyph = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4v-9Z" />
    <path d="m3.8 7.7 8.2 4 8.2-4M12 11.7v8.5" />
  </svg>
);

export const HomeGlyph = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
    <path d="m4 11 8-6.5 8 6.5v8.5H4V11Z" />
    <path d="M10 19.5v-5h4v5" />
  </svg>
);
