"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { consoleCopy, planVisual } from "@/content/planVisual";
import type { Locale } from "@/content/i18n";
import { facts } from "@/content/facts";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { NetworkSim, W, H, ROWS, COLS, rowY, colX, type SimConfig, type SimEvent, type Phase } from "@/lib/networkSim";

type Mode = "network" | "follow" | "coverage";
type Feature = "pickup" | "courier" | "warehouse" | "truck" | "shift";

const GREEN = "#4cc97a";
const GOLD = "#e0b95c";

/**
 * Live network console: a canvas map of an MSG network running in real time (deck.gl-style trips
 * with glowing trails), three view modes, and a feature legend that lights up as the visitor's
 * answers add pickups, a warehouse, line-haul or shift teams. The hero parcel drives the status
 * line and the four-stage tracker.
 */
export default function NetworkConsole({
  locale, cfg, statusIdle, complete = false,
}: { locale: Locale; cfg: SimConfig; statusIdle: boolean; complete?: boolean }) {
  const pv = planVisual[locale];
  const c = consoleCopy[locale];
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("network");
  const [mode, setMode] = useState<Mode>("network");
  const [hud, setHud] = useState({ moving: 0, delivered: 0, queued: 0, phase: "origin" as Phase, carrier: "" });
  const [feed, setFeed] = useState<SimEvent[]>([]);
  const [fresh, setFresh] = useState<Feature | null>(null);

  // features on the map, derived from the plan
  const features = useMemo<Feature[]>(() => {
    const f: Feature[] = ["pickup", "courier"];
    if (cfg.storage) f.push("warehouse");
    if (cfg.freight) f.push("truck");
    if (cfg.people) f.push("shift");
    return f;
  }, [cfg.storage, cfg.freight, cfg.people]);
  const prevFeatures = useRef<Feature[]>(features);
  useEffect(() => {
    const added = features.find((f) => !prevFeatures.current.includes(f));
    prevFeatures.current = features;
    if (!added) return;
    setFresh(added);
    const id = window.setTimeout(() => setFresh(null), 2600);
    return () => window.clearTimeout(id);
  }, [features]);

  // create once, reshape in place when the plan changes
  const [sim] = useState(() => new NetworkSim(cfg));
  useEffect(() => { sim.configure(cfg); }, [sim, cfg]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const s = sim;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let cam = { x: W / 2, y: H / 2, z: 1 };
    let lastHud = 0;
    let seen = s.events.length ? s.events[s.events.length - 1].t : -1;

    const size = () => {
      const r = box.current!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: r.width, h: r.height };
    };
    let view = size();
    const ro = new ResizeObserver(() => { view = size(); if (reduce) draw(); });
    ro.observe(box.current!);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(cv);

    const toScreen = (p: { x: number; y: number }) => {
      const fit = Math.min(view.w / W, view.h / H);
      const z = fit * cam.z;
      return { x: view.w / 2 + (p.x - cam.x) * z, y: view.h / 2 + (p.y - cam.y) * z, z };
    };

    function draw() {
      const m = modeRef.current;
      const fit = Math.min(view.w / W, view.h / H);
      // camera easing
      const target = m === "follow" ? { x: s.hero.pos.x, y: s.hero.pos.y, z: 2.1 } : { x: W / 2, y: H / 2, z: 1 };
      const k = reduce ? 1 : 0.08;
      cam = { x: cam.x + (target.x - cam.x) * k, y: cam.y + (target.y - cam.y) * k, z: cam.z + (target.z - cam.z) * k };
      const z = fit * cam.z;

      ctx.save();
      ctx.clearRect(0, 0, view.w, view.h);
      const bg = ctx.createRadialGradient(view.w * 0.55, view.h * 0.45, 10, view.w * 0.55, view.h * 0.45, Math.max(view.w, view.h) * 0.8);
      bg.addColorStop(0, "#0d1a14");
      bg.addColorStop(1, "#06090d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, view.w, view.h);

      ctx.translate(view.w / 2, view.h / 2);
      ctx.scale(z, z);
      ctx.translate(-cam.x, -cam.y);

      // districts
      for (const [x, y, r, a] of [[260, 150, 190, 0.1], [700, 330, 230, 0.08], [520, 260, 150, 0.12], [150, 420, 140, 0.06]] as const) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(11,125,54,${a})`);
        g.addColorStop(1, "rgba(11,125,54,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // ring road
      ctx.strokeStyle = "rgba(76,201,122,0.09)";
      ctx.lineWidth = 6 / z;
      ctx.beginPath();
      ctx.ellipse(s.hub.x, s.hub.y, 360, 205, -0.08, 0, Math.PI * 2);
      ctx.stroke();
      // street grid
      const arterialRows = [1, 4, 6];
      const arterialCols = [2, 6, 9];
      for (let r = -4; r < ROWS + 4; r++) {
        const art = arterialRows.includes(r);
        ctx.strokeStyle = art ? "rgba(76,201,122,0.2)" : "rgba(170,190,205,0.09)";
        ctx.lineWidth = (art ? 2.2 : 1) / z;
        ctx.beginPath();
        for (let x = -700; x <= W + 700; x += 12) (x === -700 ? ctx.moveTo : ctx.lineTo).call(ctx, x, rowY(r, x));
        ctx.stroke();
      }
      for (let cc = -9; cc < COLS + 9; cc++) {
        const art = arterialCols.includes(cc);
        ctx.strokeStyle = art ? "rgba(76,201,122,0.2)" : "rgba(170,190,205,0.09)";
        ctx.lineWidth = (art ? 2.2 : 1) / z;
        ctx.beginPath();
        for (let y = -300; y <= H + 300; y += 12) (y === -300 ? ctx.moveTo : ctx.lineTo).call(ctx, colX(cc, y), y);
        ctx.stroke();
      }

      // coverage heat
      if (m === "coverage" || m === "network") {
        ctx.globalCompositeOperation = "lighter";
        for (const p of s.heat) {
          const r = m === "coverage" ? 46 : 22;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          g.addColorStop(0, m === "coverage" ? "rgba(76,201,122,0.16)" : "rgba(76,201,122,0.05)");
          g.addColorStop(1, "rgba(76,201,122,0)");
          ctx.fillStyle = g;
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // hero route in follow mode
      const heroCarrier = s.vehicles.find((v) => v.load.includes(s.hero.id));
      if (m === "follow" && heroCarrier && heroCarrier.state === "out") {
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.setLineDash([6 / z, 6 / z]);
        ctx.lineWidth = 2 / z;
        ctx.beginPath();
        heroCarrier.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // trails
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const v of s.vehicles) {
        if (v.trail.length < 2 || m === "coverage") continue;
        const col = v.kind === "truck" ? "224,185,92" : v.kind === "courier" ? "150,235,185" : "76,201,122";
        for (let i = 1; i < v.trail.length; i++) {
          const a = i / v.trail.length;
          ctx.strokeStyle = `rgba(${col},${(v.state === "back" ? 0.25 : 0.7) * a})`;
          ctx.lineWidth = ((v.kind === "courier" ? 2.2 : 3.2) * a + 0.4) / Math.sqrt(z / fit);
          ctx.beginPath();
          ctx.moveTo(v.trail[i - 1].x, v.trail[i - 1].y);
          ctx.lineTo(v.trail[i].x, v.trail[i].y);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";

      // delivery pings
      for (const p of s.pings) {
        const a = 1 - p.age / 1.6;
        ctx.strokeStyle = `rgba(76,201,122,${a})`;
        ctx.lineWidth = 1.5 / z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (4 + p.age * 22) / Math.sqrt(cam.z), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // --- screen-space layer: nodes, vehicles, labels (crisp at any zoom) ---
      const pulse = (Math.sin(s.t * 3) + 1) / 2;
      const hub = toScreen(s.hub);
      ctx.fillStyle = `rgba(76,201,122,${0.12 + pulse * 0.1})`;
      ctx.beginPath(); ctx.arc(hub.x, hub.y, 18 + pulse * 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b7d36"; ctx.strokeStyle = GREEN; ctx.lineWidth = 2;
      roundRect(ctx, hub.x - 9, hub.y - 9, 18, 18, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.fillRect(hub.x - 3, hub.y - 3, 6, 6);
      label(ctx, c.hub, hub.x, hub.y + 24, "#fff", locale);
      if (s.queue.length) label(ctx, `${s.queue.length}`, hub.x + 16, hub.y - 14, GREEN, locale, true);

      for (const o of s.origins) {
        const p = toScreen(o.p);
        ctx.fillStyle = "#101820"; ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5;
        roundRect(ctx, p.x - 6, p.y - 6, 12, 12, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      if (s.origins[0]) { const p = toScreen(s.origins[0].p); label(ctx, c.legend.pickup, p.x, p.y + 19, "rgba(255,255,255,0.75)", locale); }

      if (s.cfg.storage) {
        const p = toScreen(s.warehouse);
        ctx.fillStyle = "#132016"; ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5;
        roundRect(ctx, p.x - 13, p.y - 9, 26, 18, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = GREEN; ctx.fillRect(p.x - 8, p.y - 4, 6, 8); ctx.fillStyle = "rgba(76,201,122,0.5)"; ctx.fillRect(p.x + 1, p.y - 4, 6, 8);
        label(ctx, c.warehouse, p.x, p.y + 22, GREEN, locale);
      }
      if (s.cfg.freight) {
        const p = toScreen({ x: W - 60, y: rowY(4, W - 60) - 16 });
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        const half = ctx.measureText(`${c.corridor} →`).width / 2 + 10;
        label(ctx, `${c.corridor} →`, Math.min(p.x, view.w - half), p.y, GOLD, locale);
      }
      if (s.cfg.people) {
        for (let i = 0; i < 4; i++) {
          const p = toScreen({ x: s.hub.x - 34 + i * 9, y: s.hub.y - 26 });
          ctx.fillStyle = i < 3 ? "#fff" : "rgba(255,255,255,0.35)";
          ctx.beginPath(); ctx.arc(p.x, p.y - 3, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(p.x - 2.2, p.y, 4.4, 4);
        }
      }

      for (const v of s.vehicles) {
        if (v.state === "idle" && v.kind !== "courier") continue;
        if (v.state === "idle" && v.kind === "courier") continue;
        const p = toScreen(v.pos);
        const hero = v.load.includes(s.hero.id);
        if (v.kind === "courier") {
          ctx.fillStyle = "rgba(76,201,122,0.35)";
          ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = v.state === "back" ? "rgba(255,255,255,0.55)" : "#fff";
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill();
        } else {
          const col = v.kind === "truck" ? GOLD : v.kind === "shuttle" ? "#9be7b8" : GREEN;
          ctx.fillStyle = col;
          ctx.shadowColor = col; ctx.shadowBlur = 10;
          roundRect(ctx, p.x - (v.kind === "truck" ? 7 : 5), p.y - 3.5, v.kind === "truck" ? 14 : 10, 7, 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
        if (hero) {
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(p.x, p.y, 11 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
          if (m === "follow") label(ctx, `${c.following} · ${v.id}`, p.x, p.y - 20, "#fff", locale, true);
        }
      }
      if (m === "follow" && s.hero.phase !== "road" && s.hero.phase !== "origin") {
        const p = toScreen(s.hero.pos);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, 13 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
      }
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) {
        s.step(dt);
        draw();
        if (now - lastHud > 400) {
          lastHud = now;
          setHud({ moving: s.moving(), delivered: s.delivered, queued: s.queue.length, phase: s.hero.phase, carrier: s.hero.carrier });
          const fresh = s.events.filter((e) => e.t > seen);
          if (fresh.length) {
            seen = fresh[fresh.length - 1].t;
            setFeed((f) => [...fresh.slice(-2).reverse(), ...f].slice(0, 4));
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      for (let i = 0; i < 600; i++) s.step(1 / 30);
      draw();
      setHud({ moving: s.moving(), delivered: s.delivered, queued: s.queue.length, phase: s.hero.phase, carrier: s.hero.carrier });
      setFeed(s.events.slice(-4).reverse());
    } else {
      for (let i = 0; i < 900; i++) s.step(1 / 30); // start mid-shift, not empty
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce, locale, c, sim]);

  // redraw once on mode change when motion is reduced
  useEffect(() => { if (reduce) window.dispatchEvent(new Event("resize")); }, [mode, reduce]);

  const phaseIx = complete ? 4 : ["origin", "hub", "road", "door"].indexOf(hud.phase) + 1;
  const status = complete ? pv.status.delivered : statusIdle ? pv.status.idle : pv.status[hud.phase];
  const fmt = (e: SimEvent) => c.events[e.key].replace("{id}", e.id ?? "").replace("{n}", String(e.n ?? ""));

  return (
    <div className="relative overflow-hidden bg-[#06090d] text-white">
      {/* header */}
      <div className="relative flex flex-wrap items-start justify-between gap-3 px-5 pt-4 sm:px-7">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4cc97a] rtl:tracking-normal">
            <span className="relative inline-flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-[#4cc97a] plan-ping" />
              <span className="relative size-1.5 rounded-full bg-[#4cc97a]" />
            </span>
            {pv.live}
          </p>
          <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] sm:text-xl rtl:tracking-normal" aria-live="polite">{status}</p>
          <p className="mt-0.5 text-xs text-white/55">{pv.hq} · <span className="num">{facts.metrics.operations.display}</span> {pv.ops}</p>
        </div>
        <div role="radiogroup" aria-label={pv.live} className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
          {(["network", "follow", "coverage"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${mode === m ? "bg-[#0b7d36] text-white shadow-[0_0_18px_-4px_rgba(76,201,122,0.9)]" : "text-white/65 hover:text-white"}`}
            >
              {c.modes[m]}
            </button>
          ))}
        </div>
      </div>

      {/* the map */}
      <div ref={box} className="relative mt-3 h-[280px] w-full sm:h-[340px]">
        <canvas ref={canvas} className="absolute inset-0 size-full" role="img" aria-label={pv.canvasLabel} />
        {/* counters */}
        <dl className="pointer-events-none absolute start-3 top-3 grid grid-cols-3 gap-1.5 sm:start-5 sm:top-4">
          {([["moving", hud.moving], ["delivered", hud.delivered], ["queued", hud.queued]] as const).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-black/45 px-2.5 py-1.5 ring-1 ring-white/10 backdrop-blur">
              <dt className="text-[10px] text-white/55">{c.stats[k]}</dt>
              <dd className="num font-display text-base font-semibold leading-tight">{v.toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>
        {/* live event feed */}
        <ol className="pointer-events-none absolute bottom-3 end-3 hidden w-[17rem] space-y-1 sm:block">
          {feed.map((e, i) => (
            <li key={`${e.t}-${e.key}-${i}`} className="feed-in flex items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1.5 text-[11px] text-white/85 ring-1 ring-white/10 backdrop-blur" style={{ opacity: 1 - i * 0.2 }}>
              <span className={`size-1.5 shrink-0 rounded-full ${e.key === "delivered" ? "bg-[#4cc97a]" : e.key === "linehaul" ? "bg-[#e0b95c]" : "bg-white/70"}`} />
              <span className="truncate">{fmt(e)}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* features on your network: they light up as the plan adds them */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 px-5 py-2.5 sm:px-7">
        {(["pickup", "courier", "warehouse", "truck", "shift"] as const).map((f) => {
          const on = features.includes(f);
          const name = { pickup: c.legend.pickup, courier: c.legend.courier, warehouse: c.legend.warehouse, truck: c.legend.truck, shift: c.legend.shift }[f];
          const dot = { pickup: "bg-white", courier: "bg-[#96ebb9]", warehouse: "bg-[#4cc97a]", truck: "bg-[#e0b95c]", shift: "bg-white" }[f];
          return (
            <span key={f} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ring-1 transition-all duration-500 ${on ? "bg-white/[0.07] text-white/85 ring-white/15" : "text-white/30 ring-white/5"} ${fresh === f ? "ring-[#4cc97a] shadow-[0_0_20px_-4px_rgba(76,201,122,0.9)]" : ""}`}>
              <span className={`size-1.5 rounded-full ${on ? dot : "bg-white/20"}`} />
              {name}
              {fresh === f ? <span className="font-semibold text-[#4cc97a]">· {c.added}</span> : null}
            </span>
          );
        })}
      </div>

      {/* hero parcel tracker */}
      <div className="grid grid-cols-4 gap-px border-t border-white/10 bg-white/5">
        {pv.stages.map((st, i) => {
          const on = phaseIx >= i + 1;
          const now = phaseIx === i + 1;
          return (
            <div key={st.id} className={`relative px-2 py-2.5 text-center sm:px-3 ${on ? "bg-white/10" : ""}`}>
              <p className={`num text-[10px] font-semibold uppercase tracking-[0.12em] ${on ? "text-[#4cc97a]" : "text-white/35"}`}>0{i + 1}</p>
              <p className={`mt-0.5 text-xs ${on ? "text-white" : "text-white/45"}`}>{st.label}</p>
              {now ? <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[#4cc97a]" /> : null}
            </div>
          );
        })}
      </div>
      <p className="border-t border-white/10 px-5 py-2.5 text-[11px] text-white/45 sm:px-7">{c.note}</p>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, locale: Locale, pill = false) {
  ctx.font = `600 11px ${locale === "ar" ? "system-ui, sans-serif" : "Inter, system-ui, sans-serif"}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (pill) {
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundRect(ctx, x - w / 2, y - 9, w, 18, 9);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
