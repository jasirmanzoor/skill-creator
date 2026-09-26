import type { ServiceId } from "@/content/facts";

/**
 * A small, living diagram of each service — what the operation actually does, drawn in the same
 * visual language as the network panel. Pure SVG + CSS keyframes (see "svc-" rules in globals.css),
 * so it costs no JavaScript and freezes cleanly under prefers-reduced-motion.
 */
export default function ServiceScene({ id }: { id: ServiceId }) {
  return (
    <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true" direction="ltr">
      <rect width="320" height="180" fill="#0b0d12" />
      <g stroke="rgba(255,255,255,0.05)">
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="180" />)}
        {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 40 + 10} x2="320" y2={i * 40 + 10} />)}
      </g>
      {scenes[id]}
    </svg>
  );
}

const B = "#8ea2ff";
const W = "rgba(255,255,255,0.85)";
const DIM = "rgba(255,255,255,0.22)";

const scenes: Record<ServiceId, React.ReactNode> = {
  // A route leaves the hub and visits five doors in turn; each door lights as it is reached.
  "last-mile": (
    <g>
      <path d="M40 140 L90 140 L90 90 L150 90 L150 50 L220 50 L220 110 L280 110" fill="none" stroke={DIM} strokeWidth="2" strokeDasharray="4 5" />
      <path d="M40 140 L90 140 L90 90 L150 90 L150 50 L220 50 L220 110 L280 110" fill="none" stroke={B} strokeWidth="2" pathLength="1" className="svc-draw" />
      <rect x="28" y="130" width="22" height="20" rx="3" fill="none" stroke={W} strokeWidth="1.5" />
      {[[90, 90], [150, 50], [220, 50], [220, 110], [280, 110]].map(([x, y], i) => (
        <g key={i} className="svc-door" style={{ animationDelay: `${0.6 + i * 0.55}s` }}>
          <circle cx={x} cy={y} r="9" fill={B} opacity="0.18" />
          <circle cx={x} cy={y} r="3.5" fill={B} />
        </g>
      ))}
      <circle r="5" fill="#fff" className="svc-ride" style={{ offsetPath: "path('M40 140 L90 140 L90 90 L150 90 L150 50 L220 50 L220 110 L280 110')" }} />
    </g>
  ),
  // Racks fill shelf by shelf while a scan line checks stock.
  warehousing: (
    <g>
      {[0, 1, 2, 3].map((c) => (
        <g key={c} transform={`translate(${46 + c * 62} 28)`}>
          <rect width="48" height="124" fill="none" stroke={DIM} strokeWidth="1.5" />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x="6" y={8 + r * 30} width="36" height="20" rx="2" fill={r % 2 ? B : W} className="svc-fill" style={{ animationDelay: `${(c * 4 + r) * 0.18}s` }} />
          ))}
        </g>
      ))}
      <rect x="36" y="24" width="258" height="2" fill={B} className="svc-scan" />
    </g>
  ),
  // Two cities joined by a road; a truck runs the linehaul both ways.
  "land-freight": (
    <g>
      <path d="M52 120 C 120 120 150 60 268 60" fill="none" stroke={DIM} strokeWidth="10" strokeLinecap="round" />
      <path d="M52 120 C 120 120 150 60 268 60" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="6 8" className="svc-road" />
      {[[52, 120], [268, 60]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="16" fill={B} opacity="0.14" />
          <circle cx={x} cy={y} r="6" fill={B} />
        </g>
      ))}
      <rect x="-9" y="-5" width="18" height="10" rx="2" fill="#fff" className="svc-truck" style={{ offsetPath: "path('M52 120 C 120 120 150 60 268 60')" }} />
    </g>
  ),
  // Vehicles on the map, each sending a telematics ping in turn.
  fleet: (
    <g>
      {[[60, 50], [120, 120], [175, 70], [230, 135], [270, 45], [95, 150]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="4" fill="none" stroke={B} strokeWidth="1.5" className="svc-ping" style={{ animationDelay: `${i * 0.45}s` }} />
          <rect x="-7" y="-4" width="14" height="8" rx="2" fill={i % 3 ? W : B} />
        </g>
      ))}
    </g>
  ),
  // The workforce pipeline from the 2025 profile: source → screen → onboard → train.
  manpower: (
    <g>
      <line x1="40" y1="90" x2="280" y2="90" stroke={DIM} strokeWidth="2" />
      {[40, 120, 200, 280].map((x) => (
        <g key={x}>
          <circle cx={x} cy="90" r="14" fill="#0b0d12" stroke={B} strokeWidth="1.5" />
          <circle cx={x} cy="86" r="3" fill={W} />
          <path d={`M${x - 6} 98 a6 6 0 0 1 12 0`} fill="none" stroke={W} strokeWidth="1.5" />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} r="3" fill={B} className="svc-flow" style={{ offsetPath: "path('M40 90 L280 90')", animationDelay: `${i * 0.7}s` }} />
      ))}
    </g>
  ),
  // A shipment timeline: each scan ticks in, around the clock.
  tracking: (
    <g>
      <line x1="60" y1="36" x2="60" y2="150" stroke={DIM} strokeWidth="2" />
      {[36, 74, 112, 150].map((y, i) => (
        <g key={y} className="svc-tick" style={{ animationDelay: `${i * 0.6}s` }}>
          <circle cx="60" cy={y} r="7" fill={B} />
          <path d={`M56.5 ${y} l2.5 2.5 l4.5 -5`} fill="none" stroke="#0b0d12" strokeWidth="1.8" />
          <rect x="80" y={y - 5} width={150 - i * 22} height="4" rx="2" fill={W} opacity="0.8" />
          <rect x="80" y={y + 3} width={90 - i * 10} height="3" rx="1.5" fill={DIM} />
        </g>
      ))}
      <circle cx="262" cy="52" r="20" fill="none" stroke={DIM} strokeWidth="1.5" />
      <line x1="262" y1="52" x2="262" y2="38" stroke={B} strokeWidth="2" strokeLinecap="round" className="svc-hand" />
    </g>
  ),
  // Every part of the operation connects back to one accountable team.
  account: (
    <g>
      {[[50, 40], [60, 140], [270, 40], [260, 140], [160, 22], [160, 160]].map(([x, y], i) => (
        <g key={i}>
          <line x1="160" y1="90" x2={x} y2={y} stroke={B} strokeWidth="1.2" pathLength="1" className="svc-link" style={{ animationDelay: `${i * 0.3}s` }} />
          <circle cx={x} cy={y} r="5" fill={W} />
        </g>
      ))}
      <circle cx="160" cy="90" r="22" fill={B} opacity="0.16" className="svc-pulse" />
      <circle cx="160" cy="90" r="11" fill={B} />
    </g>
  ),
};
