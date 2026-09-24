/** Illustrative fleet profile (last-mile van + heavy freight truck). Replaced by real photos via content/media.ts. */
export default function FleetIllustration({ vans, trucks, caption }: { vans: string; trucks: string; caption: string }) {
  return (
    <figure className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-ink-3 to-ink p-6 sm:p-8">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-16 h-px bg-gradient-to-r from-transparent via-sun/50 to-transparent" />
      <div className="grid grid-cols-2 items-end gap-6" dir="ltr">
        <div>
          <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={vans}>
            <path d="M12 30h98l6 0 30 20 20 8v26H12z" fill="#131b2f" stroke="#2a3552" strokeWidth="1.5" />
            <path d="M118 34h22l20 18h-42z" fill="#1d2944" stroke="#3a4a70" />
            <rect x="12" y="46" width="98" height="6" fill="#f6a623" />
            <path d="M24 66a11 11 0 0 1 22 0" fill="none" stroke="#2a3552" />
            <circle cx="35" cy="84" r="11" fill="#0a0f1c" stroke="#9aa4b8" strokeWidth="2" />
            <circle cx="35" cy="84" r="4" fill="#9aa4b8" />
            <circle cx="140" cy="84" r="11" fill="#0a0f1c" stroke="#9aa4b8" strokeWidth="2" />
            <circle cx="140" cy="84" r="4" fill="#9aa4b8" />
            <g transform="translate(58 22)">
              <path d="M4 20a9 9 0 0 1 18 0Z" fill="#f6a623" />
              <path d="M1 23h24" stroke="#4fe3c1" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            <rect x="163" y="60" width="8" height="4" rx="1" fill="#ffd48a" />
          </svg>
          <figcaption className="mt-3 text-center text-sm font-medium text-mist">{vans}</figcaption>
        </div>
        <div>
          <svg viewBox="0 0 260 120" className="w-full" role="img" aria-label={trucks}>
            <rect x="6" y="14" width="170" height="70" rx="4" fill="#131b2f" stroke="#2a3552" strokeWidth="1.5" />
            <rect x="6" y="66" width="170" height="6" fill="#f6a623" />
            <path d="M182 34h40l26 26v30h-66z" fill="#1d2944" stroke="#3a4a70" strokeWidth="1.5" />
            <path d="M190 40h28l18 18h-46z" fill="#26375c" />
            <rect x="176" y="84" width="76" height="6" fill="#0a0f1c" />
            {[34, 62, 206, 234].map((x) => (
              <g key={x}>
                <circle cx={x} cy="96" r="12" fill="#0a0f1c" stroke="#9aa4b8" strokeWidth="2" />
                <circle cx={x} cy="96" r="4.5" fill="#9aa4b8" />
              </g>
            ))}
            <g transform="translate(76 26)">
              <path d="M4 22a10 10 0 0 1 20 0Z" fill="#f6a623" />
              <path d="M0 25h28" stroke="#4fe3c1" strokeWidth="2" strokeLinecap="round" />
            </g>
            <text x="110" y="52" className="fill-white font-sans text-[13px] font-semibold" letterSpacing="2">MSG</text>
          </svg>
          <figcaption className="mt-3 text-center text-sm font-medium text-mist">{trucks}</figcaption>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-fog">{caption}</p>
    </figure>
  );
}
