/** MSG Horizons wordmark: a rising sun over a route line — the "horizon". */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="size-8 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="msg-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd48a" />
            <stop offset="1" stopColor="#f6a623" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="#0f1628" />
        <path d="M9 25a11 11 0 0 1 22 0Z" fill="url(#msg-sun)" />
        <path d="M6 29h28" stroke="#4fe3c1" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="30" cy="29" r="2.4" fill="#dffcf4" />
      </svg>
      <span className="font-display text-[17px] font-semibold leading-none tracking-tight" dir="ltr">
        MSG<span className="font-normal text-fog"> Horizons</span>
      </span>
    </span>
  );
}
