/** MSG Horizons wordmark: a horizon line with a rising arc. */
export default function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  const ink = inverted ? "#ffffff" : "#0c0e11";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} dir="ltr">
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill={ink} style={{ transition: "fill 0.3s" }} />
        <path d="M8 20a8 8 0 0 1 16 0" fill="none" stroke={inverted ? "#0c0e11" : "#ffffff"} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M5.5 23.5h21" stroke="#1f43e0" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[17px] font-semibold leading-none tracking-[-0.01em] transition-colors duration-300" style={{ color: ink }}>
        MSG <span className="font-medium opacity-60">Horizons</span>
      </span>
    </span>
  );
}
