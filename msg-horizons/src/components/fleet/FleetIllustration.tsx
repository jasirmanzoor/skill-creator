/**
 * Illustrative fleet profile: last-mile van + heavy freight truck on a moving road.
 * Replaced by real photography via content/media.ts. Scene is direction-neutral (LTR).
 */
function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#05070d" stroke="#2b3550" strokeWidth="2" />
      <g className="fl-spin">
        <circle r={r * 0.55} fill="#9aa4b8" />
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-r * 0.08} y={-r * 0.5} width={r * 0.16} height={r} fill="#5b6478" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={r * 0.16} fill="#dfe4ee" />
    </g>
  );
}

export default function FleetIllustration({ vans, trucks, caption }: { vans: string; trucks: string; caption: string }) {
  return (
    <figure className="glass relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-ink-3 to-ink">
      <svg viewBox="0 0 640 300" className="block w-full" role="img" aria-label={`${vans} · ${trucks}`}>
        <defs>
          <linearGradient id="fl-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0f1c" />
            <stop offset="1" stopColor="#1a1712" />
          </linearGradient>
          <radialGradient id="fl-horizon" cx="0.5" cy="1" r="0.7">
            <stop offset="0" stopColor="#f6a623" stopOpacity="0.35" />
            <stop offset="1" stopColor="#f6a623" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fl-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4efe6" />
            <stop offset="1" stopColor="#c9c1b3" />
          </linearGradient>
          <linearGradient id="fl-cab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f2b47" />
            <stop offset="1" stopColor="#111829" />
          </linearGradient>
          <linearGradient id="fl-beam" x1="0" x2="1">
            <stop offset="0" stopColor="#ffd48a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd48a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="640" height="300" fill="url(#fl-sky)" />
        <ellipse cx="320" cy="215" rx="420" ry="120" fill="url(#fl-horizon)" />
        {/* distant skyline (abstract) */}
        <rect y="206" width="640" height="14" fill="#0d1322" opacity="0.9" />
        <path d="M0 196 h40 v-18 h22 v10 h30 v-26 h18 v34 h40 v-14 h26 v14 h60 v-22 h16 v22 h70 v-30 h24 v30 h60 v-12 h30 v12 h60 v-20 h20 v20 h40 v12 H0z" fill="#0d1322" opacity="0.9" />
        {/* road */}
        <rect y="219" width="640" height="81" fill="#0b0f19" />
        <rect y="219" width="640" height="2" fill="#f6a623" opacity="0.45" />
        <g className="fl-lanes">
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={i * 96} y="262" width="48" height="4" rx="2" fill="#f4efe6" opacity="0.35" />
          ))}
        </g>

        {/* van */}
        <g className="fl-bob" style={{ animationDelay: "-0.4s" }}>
          <path d="M268 172 L330 158 L330 200 Z" fill="url(#fl-beam)" />
          <g transform="translate(60 128)">
            <path d="M0 18 q0-10 10-10 h120 l6 0 34 26 18 6 v38 H0z" fill="url(#fl-body)" />
            <path d="M140 12 h22 l26 26 h-48z" fill="url(#fl-cab)" />
            <rect x="0" y="50" width="206" height="7" fill="#f6a623" />
            <g transform="translate(46 22)">
              <path d="M4 20a10 10 0 0 1 20 0Z" fill="#f6a623" />
              <path d="M0 24h28" stroke="#0b7a64" strokeWidth="2.4" strokeLinecap="round" />
            </g>
            <rect x="200" y="42" width="8" height="5" rx="1.5" fill="#ffe7b0" />
          </g>
          <Wheel cx={100} cy={203} r={17} />
          <Wheel cx={222} cy={203} r={17} />
        </g>

        {/* truck */}
        <g className="fl-bob">
          <path d="M612 179 L640 170 L640 196 Z" fill="url(#fl-beam)" />
          <g transform="translate(330 96)">
            <rect x="0" y="0" width="200" height="94" rx="6" fill="url(#fl-body)" />
            <rect x="0" y="74" width="200" height="8" fill="#f6a623" />
            <g transform="translate(24 26)">
              <path d="M5 26a13 13 0 0 1 26 0Z" fill="#f6a623" />
              <path d="M0 30h36" stroke="#0b7a64" strokeWidth="2.6" strokeLinecap="round" />
            </g>
            <text x="74" y="56" fontSize="22" fontWeight="800" fill="#17140f" letterSpacing="3">MSG</text>
            <path d="M206 30 h44 l30 32 v38 h-74z" fill="url(#fl-cab)" />
            <path d="M214 38 h32 l22 24 h-54z" fill="#2c3d64" />
            <rect x="200" y="100" width="84" height="8" fill="#05070d" />
            <rect x="274" y="80" width="8" height="6" rx="1.5" fill="#ffe7b0" />
          </g>
          <Wheel cx={368} cy={204} r={16} />
          <Wheel cx={404} cy={204} r={16} />
          <Wheel cx={560} cy={204} r={16} />
          <Wheel cx={598} cy={204} r={16} />
        </g>
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-6 py-4 text-sm">
        <span className="flex items-center gap-4 whitespace-nowrap font-medium text-mist">
          <span>{vans}</span>
          <span className="h-3 w-px bg-line" />
          <span>{trucks}</span>
        </span>
        <figcaption className="text-xs text-fog">{caption}</figcaption>
      </div>
      <style>{`
        .fl-lanes { animation: fl-lanes 1.1s linear infinite; }
        @keyframes fl-lanes { to { transform: translateX(-96px); } }
        .fl-spin { animation: fl-spin .6s linear infinite; }
        @keyframes fl-spin { to { transform: rotate(360deg); } }
        .fl-bob { animation: fl-bob 1.4s ease-in-out infinite; }
        @keyframes fl-bob { 50% { transform: translateY(-1.2px); } }
        @media (prefers-reduced-motion: reduce) { .fl-lanes, .fl-spin, .fl-bob { animation: none; } }
      `}</style>
    </figure>
  );
}
