type Stage = { t: string; d: string };

/**
 * Peak demand, as the protocol MSG follows rather than a picture of a season: five stages on one route, from the
 * demand signal to the closeout, each with what happens there. No curve, no simulated volumes: the stages are the
 * claim, and they are MSG's own. The leg between stops draws in as the row arrives (the site's route motif; still
 * where scroll-driven animation is unsupported or motion is reduced).
 */
export default function DeploymentProtocol({ stages }: { stages: Stage[] }) {
  return (
    <ol data-protocol className="grid border-t border-ink sm:grid-cols-5">
      {stages.map((s, i) => (
        <li key={s.t} className={`relative border-b border-line py-5 sm:border-b-0 sm:py-6 sm:pe-5 ${i ? "sm:border-s sm:ps-5" : ""}`}>
          {/* the stop on the route, its number, and the leg to the next one */}
          <span className="relative mb-3 flex items-center gap-3">
            <span aria-hidden="true" className="size-3 shrink-0 bg-brand" />
            <span className="num font-mono text-xs text-brand" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
            {i < stages.length - 1 ? (
              <span aria-hidden="true" className="relative h-px flex-1 bg-line-strong max-sm:hidden">
                <span className="route-leg absolute inset-0 bg-brand" />
              </span>
            ) : null}
          </span>
          <h4 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] rtl:tracking-normal">{s.t}</h4>
          <p className="mt-1.5 text-sm text-muted text-pretty">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}
