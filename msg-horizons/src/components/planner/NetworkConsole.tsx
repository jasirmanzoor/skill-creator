"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { consoleCopy, planVisual } from "@/content/planVisual";
import type { Locale } from "@/content/i18n";
import { facts } from "@/content/facts";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { NetworkSim, W, H, ROWS, COLS, rowY, colX, node, type SimConfig, type SimEvent, type Phase } from "@/lib/networkSim";

type Mode = "network" | "follow" | "coverage";
type Feature = "pickup" | "courier" | "warehouse" | "truck" | "shift";

const TEAL = "#137179";
const DEEP = "#0b3a40";
const GREEN = "#0b7d36";
const GOLD = "#c9962e";

// districts are labels only, so the canvas reads like a real city map
const DISTRICTS: [string, string, number, number][] = [
  ["Olaya", "العليا", 0.24, 0.24], ["Al Malaz", "الملز", 0.62, 0.66], ["Al Naseem", "النسيم", 0.86, 0.3],
  ["Al Rawdah", "الروضة", 0.78, 0.74], ["Al Sulay", "السلي", 0.3, 0.82], ["King Fahd", "الملك فهد", 0.12, 0.55],
];

/**
 * Live network console, in daylight: a clean city map (blocks, parks, ring road, district names)
 * with MSG couriers, pickup vans and line-haul running in real time. A side rail carries the live
 * counters, the tracked parcel and the event feed, so the map itself stays calm and readable.
 * The visitor's answers reshape the network in place (see PlanStage).
 */
export default function NetworkConsole({
  locale, cfg, complete = false,
}: { locale: Locale; cfg: SimConfig; statusIdle?: boolean; complete?: boolean }) {
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
    const font = locale === "ar" ? "system-ui, sans-serif" : "Inter, system-ui, sans-serif";

    // city blocks: each cell between roads, with a stable land-use tint
    const blocks: { pts: { x: number; y: number }[]; fill: string }[] = [];
    for (let r = -2; r < ROWS + 1; r++) {
      for (let cc = -2; cc < COLS + 1; cc++) {
        const k = Math.abs(Math.sin((r + 3) * 12.9898 + (cc + 3) * 78.233) * 43758.5453) % 1;
        const fill = k < 0.12 ? "#d9efe0" : k < 0.2 ? "#f2ecdd" : "#ffffff";
        const a = node(cc, r), b = node(cc + 1, r), d = node(cc + 1, r + 1), e = node(cc, r + 1);
        const inset = (p: { x: number; y: number }, q: { x: number; y: number }) => ({ x: p.x + (q.x - p.x) * 0.1, y: p.y + (q.y - p.y) * 0.1 });
        const cx = (a.x + b.x + d.x + e.x) / 4, cy = (a.y + b.y + d.y + e.y) / 4;
        const ctr = { x: cx, y: cy };
        blocks.push({ pts: [inset(a, ctr), inset(b, ctr), inset(d, ctr), inset(e, ctr)], fill });
      }
    }

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

    const fit = () => Math.max(view.w / W, view.h / H) * 0.98; // cover: the map always fills the frame
    const toScreen = (p: { x: number; y: number }) => {
      const z = fit() * cam.z;
      return { x: view.w / 2 + (p.x - cam.x) * z, y: view.h / 2 + (p.y - cam.y) * z };
    };

    function pin(x: number, y: number, fill: string, glyph: (cx: number, cy: number) => void, r = 11) {
      ctx.save();
      ctx.shadowColor = "rgba(11,58,64,0.35)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y - r - 6, r, Math.PI * 0.85, Math.PI * 0.15);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      glyph(x, y - r - 6);
    }
    function pill(text: string, x: number, y: number, bg: string, fg: string, bold = true) {
      ctx.font = `${bold ? 600 : 500} 11px ${font}`;
      const w = ctx.measureText(text).width + 14;
      ctx.save();
      ctx.shadowColor = "rgba(11,58,64,0.18)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - 10, w, 20, 10);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 0.5);
    }

    function draw() {
      const m = modeRef.current;
      const target = m === "follow" ? { x: s.hero.pos.x, y: s.hero.pos.y, z: 2 } : { x: W / 2, y: H / 2, z: 1 };
      const k = reduce ? 1 : 0.07;
      cam = { x: cam.x + (target.x - cam.x) * k, y: cam.y + (target.y - cam.y) * k, z: cam.z + (target.z - cam.z) * k };
      const z = fit() * cam.z;

      ctx.clearRect(0, 0, view.w, view.h);
      ctx.fillStyle = "#e7efee";
      ctx.fillRect(0, 0, view.w, view.h);

      ctx.save();
      ctx.translate(view.w / 2, view.h / 2);
      ctx.scale(z, z);
      ctx.translate(-cam.x, -cam.y);

      // land use
      for (const b of blocks) {
        ctx.fillStyle = b.fill;
        ctx.beginPath();
        b.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fill();
      }
      // streets: casing then fill, arterials wider
      const art = { r: [1, 4, 6], c: [2, 6, 9] };
      const street = (wide: boolean, pass: "case" | "fill") => {
        ctx.strokeStyle = pass === "case" ? "#cfdcdb" : wide ? "#fdf7e3" : "#f7fbfb";
        ctx.lineWidth = (wide ? (pass === "case" ? 9 : 6.5) : pass === "case" ? 4.5 : 2.8) / Math.sqrt(cam.z);
      };
      for (const pass of ["case", "fill"] as const) {
        for (let r = -3; r < ROWS + 3; r++) {
          street(art.r.includes(r), pass);
          ctx.beginPath();
          for (let x = -500; x <= W + 500; x += 12) (x === -500 ? ctx.moveTo : ctx.lineTo).call(ctx, x, rowY(r, x));
          ctx.stroke();
        }
        for (let cc = -6; cc < COLS + 6; cc++) {
          street(art.c.includes(cc), pass);
          ctx.beginPath();
          for (let y = -300; y <= H + 300; y += 12) (y === -300 ? ctx.moveTo : ctx.lineTo).call(ctx, colX(cc, y), y);
          ctx.stroke();
        }
      }
      // ring road
      ctx.strokeStyle = "rgba(19,113,121,0.13)";
      ctx.lineWidth = 5 / Math.sqrt(cam.z);
      ctx.beginPath();
      ctx.ellipse(s.hub.x, s.hub.y, 370, 210, -0.08, 0, Math.PI * 2);
      ctx.stroke();

      // coverage: delivered zones glow
      if (m === "coverage") {
        for (const p of s.heat) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 48);
          g.addColorStop(0, "rgba(19,113,121,0.18)");
          g.addColorStop(1, "rgba(19,113,121,0)");
          ctx.fillStyle = g;
          ctx.fillRect(p.x - 48, p.y - 48, 96, 96);
        }
      }

      // the followed parcel's route
      const heroCarrier = s.vehicles.find((v) => v.load.includes(s.hero.id));
      if (m === "follow" && heroCarrier && heroCarrier.state === "out") {
        ctx.strokeStyle = TEAL;
        ctx.setLineDash([7 / cam.z, 6 / cam.z]);
        ctx.lineWidth = 3 / Math.sqrt(cam.z);
        ctx.beginPath();
        heroCarrier.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // trails along the streets
      ctx.lineCap = "round";
      if (m !== "coverage") {
        for (const v of s.vehicles) {
          if (v.trail.length < 2) continue;
          const col = v.kind === "truck" ? "201,150,46" : v.kind === "courier" ? "19,113,121" : "11,125,54";
          for (let i = 1; i < v.trail.length; i++) {
            const a = i / v.trail.length;
            ctx.strokeStyle = `rgba(${col},${(v.state === "back" ? 0.18 : 0.55) * a})`;
            ctx.lineWidth = (v.kind === "courier" ? 3 : 4.5) * a / Math.sqrt(cam.z);
            ctx.beginPath();
            ctx.moveTo(v.trail[i - 1].x, v.trail[i - 1].y);
            ctx.lineTo(v.trail[i].x, v.trail[i].y);
            ctx.stroke();
          }
        }
      }
      // delivery pings
      for (const p of s.pings) {
        if (p.age < 0 || p.age > 1.6) continue;
        const a = 1 - p.age / 1.6;
        ctx.strokeStyle = `rgba(11,125,54,${a})`;
        ctx.lineWidth = 2 / Math.sqrt(cam.z);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, (5 + p.age * 20) / Math.sqrt(cam.z)), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ---- screen-space layer ----
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // district names
      ctx.font = `600 10px ${font}`;
      ctx.fillStyle = "rgba(11,58,64,0.32)";
      for (const [en, ar, fx, fy] of DISTRICTS) {
        const q = toScreen({ x: fx * W, y: fy * H });
        ctx.fillText((locale === "ar" ? ar : en).toUpperCase(), q.x, q.y);
      }

      // pickups
      for (const o of s.origins) {
        const q = toScreen(o.p);
        pin(q.x, q.y, "#ffffff", (x, y) => {
          ctx.fillStyle = TEAL;
          ctx.fillRect(x - 4.5, y - 2, 9, 6);
          ctx.fillRect(x - 5.5, y - 5, 11, 3);
        }, 9);
      }
      if (s.origins[0]) { const q = toScreen(s.origins[0].p); pill(c.legend.pickup, q.x, q.y + 12, "rgba(255,255,255,0.95)", DEEP, false); }

      if (s.cfg.storage) {
        const q = toScreen(s.warehouse);
        pin(q.x, q.y, GREEN, (x, y) => {
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.moveTo(x - 6, y - 1); ctx.lineTo(x, y - 6); ctx.lineTo(x + 6, y - 1); ctx.closePath(); ctx.fill();
          ctx.fillRect(x - 5, y - 1, 10, 6);
        }, 10);
        pill(c.warehouse, q.x, q.y + 12, GREEN, "#fff");
      }
      if (s.cfg.freight) {
        const q = toScreen({ x: W - 70, y: rowY(4, W - 70) - 26 });
        ctx.font = `600 11px ${font}`;
        const half = ctx.measureText(`${c.corridor} →`).width / 2 + 14;
        pill(`${c.corridor} →`, Math.min(q.x, view.w - half), q.y, "#fff6e0", "#7a5410");
      }

      // vehicles
      for (const v of s.vehicles) {
        if (v.state === "idle") continue;
        const q = toScreen(v.pos);
        const hero = v.load.includes(s.hero.id);
        const ahead = v.path[Math.min(v.path.length - 1, Math.max(1, v.path.findIndex((_, i) => v.lens[i] > v.d)))];
        const ang = ahead ? Math.atan2(ahead.y - v.pos.y, ahead.x - v.pos.x) : 0;
        ctx.save();
        ctx.translate(q.x, q.y);
        ctx.shadowColor = "rgba(11,58,64,0.35)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        if (v.kind === "courier") {
          ctx.fillStyle = v.state === "back" ? "#9fb9bb" : "#ffffff";
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.rotate(ang);
          ctx.fillStyle = v.state === "back" ? "#ffffff" : TEAL;
          ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3.2, -4); ctx.lineTo(-1.2, 0); ctx.lineTo(-3.2, 4); ctx.closePath(); ctx.fill();
        } else {
          ctx.rotate(ang);
          ctx.fillStyle = v.kind === "truck" ? GOLD : v.kind === "shuttle" ? "#2f9f63" : GREEN;
          const L = v.kind === "truck" ? 18 : 13;
          ctx.beginPath(); ctx.roundRect(-L / 2, -4.5, L, 9, 2.5); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(L / 2 - 4, -3, 2.5, 6);
        }
        ctx.restore();
        if (hero) {
          const pulse = (Math.sin(s.t * 4) + 1) / 2;
          ctx.strokeStyle = TEAL;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(q.x, q.y, 12 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
          if (m === "follow") pill(`${c.following} · ${v.id}`, q.x, q.y - 26, DEEP, "#fff");
        }
      }

      // hub on top
      const hub = toScreen(s.hub);
      const pulse = (Math.sin(s.t * 2.6) + 1) / 2;
      ctx.fillStyle = `rgba(19,113,121,${0.1 + pulse * 0.1})`;
      ctx.beginPath(); ctx.arc(hub.x, hub.y - 4, 20 + pulse * 10, 0, Math.PI * 2); ctx.fill();
      pin(hub.x, hub.y, DEEP, (x, y) => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x - 6, y - 4, 12, 9);
        ctx.fillStyle = DEEP;
        ctx.fillRect(x - 2, y + 1, 4, 4);
      }, 13);
      pill(`${c.hub}${s.queue.length ? ` · ${s.queue.length}` : ""}`, hub.x, hub.y + 13, DEEP, "#fff");
      if (s.cfg.people) {
        for (let i = 0; i < 4; i++) {
          const x = hub.x + 26 + i * 8, y = hub.y - 30;
          ctx.fillStyle = i < 3 ? TEAL : "rgba(19,113,121,0.35)";
          ctx.beginPath(); ctx.arc(x, y - 3, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(x - 2.4, y, 4.8, 4.5);
        }
      }
    }

    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
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
            setFeed((f) => [...fresh.slice(-3).reverse(), ...f].slice(0, 6));
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      for (let i = 0; i < 600; i++) s.step(1 / 30);
      draw();
      setHud({ moving: s.moving(), delivered: s.delivered, queued: s.queue.length, phase: s.hero.phase, carrier: s.hero.carrier });
      setFeed(s.events.slice(-6).reverse());
    } else {
      for (let i = 0; i < 900; i++) s.step(1 / 30); // open mid-shift, never empty
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce, locale, c, sim]);

  useEffect(() => { if (reduce) window.dispatchEvent(new Event("resize")); }, [mode, reduce]);

  const phaseIx = complete ? 4 : ["origin", "hub", "road", "door"].indexOf(hud.phase) + 1;
  // the status always matches the tracked parcel, so the headline never contradicts the tracker
  const status = complete ? pv.status.delivered : pv.status[hud.phase];
  const fmt = (e: SimEvent) => c.events[e.key].replace("{id}", e.id ?? "").replace("{n}", String(e.n ?? ""));

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f3fbfb,#ffffff)] text-teal-deep">
      <div className="grid lg:grid-cols-[1fr_300px]">
        {/* the map */}
        <div ref={box} className="relative h-[340px] w-full overflow-hidden sm:h-[420px] lg:h-[480px]">
          <canvas ref={canvas} className="absolute inset-0 size-full" role="img" aria-label={pv.canvasLabel} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3 sm:p-4">
            <div role="radiogroup" aria-label={pv.live} className="pointer-events-auto flex rounded-full bg-white/90 p-1 shadow-[0_12px_30px_-16px_rgba(11,58,64,0.6)] ring-1 ring-teal/10 backdrop-blur">
              {(["network", "follow", "coverage"] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${mode === m ? "bg-teal-deep text-white" : "text-teal-deep/70 hover:text-teal-deep"}`}>
                  {c.modes[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 start-3 rounded-2xl bg-white/90 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_30px_-16px_rgba(11,58,64,0.6)] ring-1 ring-teal/10 backdrop-blur sm:bottom-4 sm:start-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b7d36] rtl:tracking-normal">
                <span className="relative inline-flex size-2">
                  <span className="absolute inset-0 rounded-full bg-[#0b7d36] plan-ping" />
                  <span className="relative size-2 rounded-full bg-[#0b7d36]" />
                </span>
                {pv.live}
              </p>
              <p className="mt-0.5 font-display text-base font-semibold tracking-[-0.01em] sm:text-lg rtl:tracking-normal" aria-live="polite">{status}</p>
              <p className="text-[11px] text-teal-deep/65">{pv.hq} · <span className="num">{facts.metrics.operations.display}</span> {pv.ops}</p>
          </div>
          <p className="pointer-events-none absolute bottom-3 end-3 hidden max-w-[45%] rounded-full bg-white/80 px-2.5 py-1 text-end text-[10px] text-teal-deep/70 backdrop-blur sm:bottom-4 sm:end-4 sm:block">{c.note}</p>
        </div>
        <p className="border-t border-teal/10 bg-white/70 px-4 py-2 text-[10px] text-teal-deep/70 sm:hidden">{c.note}</p>

        {/* side rail */}
        <aside className="flex flex-col gap-3 border-t border-teal/10 bg-white/70 p-4 lg:border-s lg:border-t-0">
          <dl className="grid grid-cols-3 gap-2">
            {([["moving", hud.moving], ["delivered", hud.delivered], ["queued", hud.queued]] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-sea-50 px-2.5 py-2 ring-1 ring-teal/10">
                <dt className="text-[10px] leading-tight text-teal-deep/70">{c.stats[k]}</dt>
                <dd className="num font-display text-xl font-semibold leading-tight">{v.toLocaleString("en-US")}</dd>
              </div>
            ))}
          </dl>

          {/* the tracked parcel */}
          <div className="rounded-xl bg-teal-deep p-3 text-white">
            <p className="flex items-center justify-between text-[11px] text-white/70">
              <span>{c.following}</span>
              {hud.carrier ? <span className="num rounded-full bg-white/15 px-2 py-0.5 text-white">{hud.carrier}</span> : null}
            </p>
            <ol className="mt-2.5 grid grid-cols-4 gap-1">
              {pv.stages.map((st, i) => {
                const on = phaseIx >= i + 1;
                const now = phaseIx === i + 1;
                return (
                  <li key={st.id} className="text-center">
                    <span className={`mx-auto block h-1.5 rounded-full transition-colors duration-500 ${on ? "bg-[#4cc97a]" : "bg-white/20"} ${now ? "shadow-[0_0_10px_rgba(76,201,122,0.9)]" : ""}`} />
                    <span className={`mt-1.5 block text-[10px] leading-tight ${now ? "font-semibold text-white" : on ? "text-white/80" : "text-white/55"}`}>{st.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* live events */}
          <ol className="min-h-0 flex-1 space-y-1.5 overflow-hidden" aria-live="off">
            {feed.map((e, i) => (
              <li key={`${e.t}-${e.key}-${i}`} className="feed-in flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[11.5px] ring-1 ring-teal/10" style={{ opacity: 1 - i * 0.12 }}>
                <span className={`size-1.5 shrink-0 rounded-full ${e.key === "delivered" ? "bg-[#0b7d36]" : e.key === "linehaul" ? "bg-[#c9962e]" : "bg-teal"}`} />
                <span className="truncate">{fmt(e)}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* what the plan has added to the network */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-teal/10 bg-white/80 px-4 py-2.5 sm:px-5">
        {(["pickup", "courier", "warehouse", "truck", "shift"] as const).map((f) => {
          const on = features.includes(f);
          const name = { pickup: c.legend.pickup, courier: c.legend.courier, warehouse: c.legend.warehouse, truck: c.legend.truck, shift: c.legend.shift }[f];
          const dot = { pickup: "bg-teal", courier: "bg-teal", warehouse: "bg-[#0b7d36]", truck: "bg-[#c9962e]", shift: "bg-teal-deep" }[f];
          return (
            <span key={f} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-all duration-500 ${on ? "bg-sea-50 text-teal-deep ring-teal/20" : "text-teal-deep/60 ring-teal/10"} ${fresh === f ? "ring-[#0b7d36] shadow-[0_0_18px_-4px_rgba(11,125,54,0.7)]" : ""}`}>
              <span className={`size-1.5 rounded-full ${on ? dot : "bg-teal/25"}`} />
              {name}
              {fresh === f ? <span className="font-semibold text-[#0b7d36]">· {c.added}</span> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
