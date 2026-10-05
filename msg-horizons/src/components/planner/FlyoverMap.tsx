"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibre, Marker, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import type { Feature, FeatureCollection, LineString } from "geojson";
import { useEffect, useRef, type MutableRefObject } from "react";
import type { Locale } from "@/content/i18n";
import { routeCopy, type Site } from "@/content/routeConsole";
import { placeLL } from "@/content/routeGeo";
import { angleDiff, arc, bearing, clamp, haversine, makePath, metresPerPixel, offsetPath, pointAt, slicePath, type LngLat, type Path } from "@/lib/geoRoute";
import { roadRoute } from "@/lib/routing";
import type { Beat, RoutePlan } from "@/lib/routePlan";

/**
 * The route console as a real map. The camera flies the route the way a navigation app does: it chases
 * the vehicle at a tilt, swoops between legs, pulls up on long hops and circles when the parcel is being
 * handled at a site. Streets, buildings and labels come from the map style; the route follows real roads
 * (driving routes) and crosses cities on a smooth arc. If the map or the routes cannot load, the parent
 * falls back to the flat console.
 */

// served from /public by scripts/copy-maplibre-worker.mjs: the bundle cannot locate the worker itself
if (typeof window !== "undefined") setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);

type Copy = (typeof routeCopy)["en"];
export type Timeline = { plan: RoutePlan; starts: number[]; durs: number[]; total: number };
type Props = {
  plan: RoutePlan;
  c: Copy;
  locale: Locale;
  styleUrl: string;
  playing: boolean;
  reduce: boolean;
  clock: MutableRefObject<number>;
  progBar: MutableRefObject<HTMLSpanElement | null>;
  onTimeline: (t: Timeline) => void;
  onBeat: (i: number) => void;
  onStatus: (s: "ready" | "failed") => void;
};

const TEAL = "#137179";
const DEEP = "#0b3a40";
const GREEN = "#0b7d36";
const GOLD = "#c9962e";
const CORAL = "#d0573f";
const LANE_M = 9;
const LANE: Record<string, number> = { cash: LANE_M, return: -LANE_M };
const LIFT: Record<string, number> = { parcel: 0.16, order: 0.16, cash: -0.12, return: -0.26 };
const colorOf = (b: Beat) => (b.flow === "cash" ? GOLD : b.flow === "return" ? CORAL : b.flow === "order" ? DEEP : b.who === "you" ? DEEP : TEAL);

type Leg = {
  b: Beat;
  moving: boolean;
  far: boolean;
  path: Path | null;
  len: number;
  dur: number;
  color: string;
  zoom: number;
  pitch: number;
  at: LngLat;
  icon: string;
  full: Feature<LineString>;
};

const empty: FeatureCollection = { type: "FeatureCollection", features: [] };
const widthExpr = (m: number) => ["interpolate", ["exponential", 1.6], ["zoom"], 5, 2.2 * m, 10, 3.2 * m, 14, 6 * m, 17, 11 * m, 19, 18 * m] as never;

/** resolve every beat to geometry; null when a road route is unavailable */
async function buildLegs(plan: RoutePlan): Promise<Leg[] | null> {
  const out: Leg[] = [];
  const routes = await Promise.all(
    plan.beats.map(async (b) => {
      const a = placeLL(b.from);
      const z = placeLL(b.to);
      if (b.from === b.to || (a[0] === z[0] && a[1] === z[1])) return { pts: null as LngLat[] | null, far: false, ok: true };
      if (b.from.city !== b.to.city) return { pts: arc(a, z, LIFT[b.flow] ?? 0.16), far: true, ok: true };
      const r = await roadRoute(a, z);
      return r ? { pts: LANE[b.flow] ? offsetPath(r, LANE[b.flow]) : r, far: false, ok: true } : { pts: null, far: false, ok: false };
    }),
  );
  for (let i = 0; i < plan.beats.length; i++) {
    const b = plan.beats[i];
    const r = routes[i];
    if (!r.ok) return null;
    const path = r.pts ? makePath(r.pts) : null;
    const moving = !!path && path.len > 30;
    const len = path?.len ?? 0;
    const color = colorOf(b);
    const kind = b.flow === "cash" ? "cash" : b.flow === "order" ? "order" : b.vehicle ?? "courier";
    out.push({
      b,
      moving,
      far: r.far,
      path: moving ? path : null,
      len,
      dur: moving ? (r.far ? 7 : clamp(len / 550, 3.4, 9.5)) : 2.6,
      color,
      zoom: r.far ? clamp(8.4 - Math.log2(Math.max(1, len / 120000)), 5.2, 7.4) : 15.6,
      pitch: r.far ? 50 : 60,
      at: placeLL(b.from),
      icon: `${kind}-${color.slice(1)}`,
      full: { type: "Feature", properties: { color }, geometry: { type: "LineString", coordinates: path?.pts ?? [] } },
    });
  }
  return out;
}

/** top-down vehicle and token pictures that lie flat on the road, pointing north */
function drawIcon(name: string): ImageData {
  const [kind, hex] = name.split("-");
  const S = 96;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.translate(S / 2, S / 2);
  g.shadowColor = "rgba(11,58,64,0.45)";
  g.shadowBlur = 8;
  g.fillStyle = `#${hex}`;
  g.strokeStyle = "#fff";
  g.lineWidth = 5;
  g.lineJoin = "round";
  const rr = (x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.stroke(); };
  if (kind === "van") {
    rr(-17, -34, 34, 68, 9);
    g.shadowBlur = 0; g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(-11, -28, 22, 11);
  } else if (kind === "truck") {
    rr(-17, -42, 34, 22, 7);
    rr(-19, -16, 38, 58, 5);
    g.shadowBlur = 0; g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(-11, -38, 22, 8);
  } else if (kind === "cash" || kind === "order") {
    g.beginPath(); g.arc(0, 0, 26, 0, Math.PI * 2); g.fill(); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 4;
    g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); g.stroke();
  } else {
    g.beginPath(); g.moveTo(0, -36); g.lineTo(27, 30); g.lineTo(0, 16); g.lineTo(-27, 30); g.closePath(); g.fill(); g.stroke();
  }
  return g.getImageData(0, 0, S, S);
}

function arrowImage(): ImageData {
  const S = 48;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.strokeStyle = "#fff";
  g.lineWidth = 7;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath(); g.moveTo(16, 12); g.lineTo(32, 24); g.lineTo(16, 36); g.stroke();
  return g.getImageData(0, 0, S, S);
}

function pinEl(label: string, color: string) {
  const el = document.createElement("div");
  el.className = "pointer-events-none flex flex-col items-center";
  const pill = document.createElement("span");
  pill.className = "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(11,58,64,0.7)] ring-2 ring-white";
  pill.style.background = color;
  pill.textContent = label;
  const stem = document.createElement("span");
  stem.className = "h-3 w-0.5 bg-white";
  const dot = document.createElement("span");
  dot.className = "size-3 rounded-full ring-2 ring-white";
  dot.style.background = color;
  el.append(pill, stem, dot);
  return el;
}

export default function FlyoverMap(p: Props) {
  const box = useRef<HTMLDivElement>(null);
  const props = useRef(p);
  // the frame loop reads the latest props from here (assigned after each render, ahead of the effects below)
  useEffect(() => { props.current = p; });
  const api = useRef<{ setModel: (plan: RoutePlan) => void } | null>(null);

  // the map and its loop live for as long as the style does
  useEffect(() => {
    const host = box.current!;
    const map = new MapLibre({
      container: host,
      style: p.styleUrl,
      center: placeLL(p.plan.places[0]),
      zoom: 11.5,
      pitch: 40,
      bearing: 0,
      maxPitch: 80,
      interactive: false,
      fadeDuration: 0,
      attributionControl: { compact: true },
      renderWorldCopies: false,
    });
    const cam = { lng: placeLL(p.plan.places[0])[0], lat: placeLL(p.plan.places[0])[1], zoom: 11.5, pitch: 40, bearing: 0 };
    const M = { legs: [] as Leg[], starts: [] as number[], total: 0, shown: -1, orbit: 0, dwellBase: 0, plan: null as RoutePlan | null };
    const markers: Marker[] = [];
    const tag = document.createElement("span");
    tag.className = "pointer-events-none whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-deep shadow-[0_8px_18px_-8px_rgba(11,58,64,0.7)] ring-1 ring-teal/15";
    const tagMarker = new Marker({ element: tag, anchor: "bottom", offset: [0, -24] });
    let loaded = false;
    let disposed = false;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let lastDone = 0;
    let lastCam = 0;
    let token = 0;
    let failed = false;
    const fail = () => { if (failed || disposed) return; failed = true; props.current.onStatus("failed"); };
    const loadTimer = window.setTimeout(() => { if (!loaded) fail(); }, 14000);

    const kindLabel = (leg: Leg) => (leg.b.vehicle === "courier" || leg.b.vehicle === "van" || leg.b.vehicle === "truck" ? props.current.c.kinds[leg.b.vehicle] : props.current.c.who[leg.b.who]);

    const addLayers = () => {
      map.addSource("ahead", { type: "geojson", data: empty });
      map.addSource("done", { type: "geojson", data: empty });
      map.addSource("veh", { type: "geojson", data: empty });
      map.addImage("arrow", arrowImage(), { pixelRatio: 2 });
      map.addLayer({ id: "ahead", type: "line", source: "ahead", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-opacity": 0.8, "line-width": widthExpr(0.6), "line-dasharray": [0.1, 2.4] } });
      map.addLayer({ id: "done-case", type: "line", source: "done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": widthExpr(1.6) } });
      map.addLayer({ id: "done", type: "line", source: "done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-width": widthExpr(1) } });
      map.addLayer({ id: "arrows", type: "symbol", source: "done", layout: { "symbol-placement": "line", "symbol-spacing": 64, "icon-image": "arrow", "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.35, 17, 0.7], "icon-rotation-alignment": "map", "icon-pitch-alignment": "map", "icon-allow-overlap": true, "icon-ignore-placement": true } });
      map.addLayer({ id: "pulse", type: "circle", source: "veh", filter: ["==", ["get", "k"], "pulse"], paint: { "circle-radius": ["get", "r"], "circle-color": ["get", "color"], "circle-opacity": ["get", "a"], "circle-pitch-alignment": "map", "circle-blur": 0.5 } });
      map.addLayer({ id: "halo", type: "circle", source: "veh", filter: ["==", ["get", "k"], "veh"], paint: { "circle-radius": ["get", "r"], "circle-color": ["get", "color"], "circle-opacity": 0.22, "circle-pitch-alignment": "map" } });
      map.addLayer({ id: "veh", type: "symbol", source: "veh", filter: ["==", ["get", "k"], "veh"], layout: { "icon-image": ["get", "icon"], "icon-size": ["get", "s"], "icon-rotate": ["get", "hdg"], "icon-rotation-alignment": "map", "icon-pitch-alignment": "map", "icon-allow-overlap": true, "icon-ignore-placement": true } });
    };

    const apply = () => {
      const P = props.current;
      if (!loaded || !M.legs.length || !M.plan) return;
      (map.getSource("ahead") as GeoJSONSource).setData({ type: "FeatureCollection", features: M.legs.filter((l) => l.moving).map((l) => l.full) });
      for (const l of M.legs) if (!map.hasImage(l.icon)) map.addImage(l.icon, drawIcon(l.icon), { pixelRatio: 2 });
      markers.splice(0).forEach((m) => m.remove());
      const seen = new Set<string>();
      for (const pl of M.plan.places) {
        if (!pl.pin) continue;
        const key = `${pl.pin}:${pl.city}:${pl.fx}:${pl.fy}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const label = pl.pin === "site" ? P.c.siteName[pl.city as Site] : pl.pin === "you" ? P.c.pins.you : pl.pin === "drop" ? P.c.pins.drop : P.c.pins.door;
        const colour = pl.pin === "door" || pl.pin === "drop" ? GREEN : DEEP;
        markers.push(new Marker({ element: pinEl(label, colour), anchor: "bottom" }).setLngLat(placeLL(pl)).addTo(map));
      }
      tagMarker.setLngLat(M.legs[0].at).addTo(map);
      M.shown = -1;
      if (P.reduce) {
        // a still picture of the whole route: nothing flies under reduced motion
        const all = M.legs.filter((l) => l.moving).map((l) => l.full) as Feature<LineString>[];
        (map.getSource("done") as GeoJSONSource).setData({ type: "FeatureCollection", features: all });
        let w = 180, s = 90, e = -180, n = -90;
        for (const pl of M.plan.places) { const [x, y] = placeLL(pl); w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
        map.fitBounds([[w, s], [e, n]], { padding: 90, pitch: 30, bearing: 0, duration: 0, maxZoom: 15 });
        tagMarker.remove();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const P = props.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden || !loaded || !M.legs.length || P.reduce) return;
      if (P.playing) {
        P.clock.current += dt;
        if (P.clock.current > M.total + 1.8) P.clock.current = 0;
      }
      const t = P.clock.current;
      let cur = 0;
      for (let i = 0; i < M.starts.length; i++) if (t >= M.starts[i]) cur = i;
      const leg = M.legs[cur];
      const prog = clamp((t - M.starts[cur]) / leg.dur, 0, 1);
      if (P.progBar.current) P.progBar.current.style.transform = `scaleX(${prog})`;
      if (cur !== M.shown) {
        M.shown = cur;
        M.dwellBase = cam.bearing;
        M.orbit = 0;
        P.onBeat(cur);
        tag.textContent = `${cur + 1} · ${kindLabel(leg)}`;
      }

      // where the vehicle is, and where the camera wants to be
      let pos: LngLat | null = null;
      let hdgNow = 0;
      let centre: LngLat;
      let heading: number;
      if (leg.moving && leg.path) {
        const d = prog * leg.len;
        const here = pointAt(leg.path, d);
        pos = here.p;
        hdgNow = here.bearing;
        const aheadM = 120 * metresPerPixel(pos[1], leg.zoom); // the vehicle sits low in the frame, with the road ahead above it
        centre = pointAt(leg.path, Math.min(leg.len, d + aheadM)).p;
        const look = pointAt(leg.path, Math.min(leg.len, d + aheadM * 1.8)).p;
        heading = haversine(pos, look) > 3 ? bearing(pos, look) : here.bearing;
      } else {
        if (P.playing) M.orbit += dt * 9;
        centre = leg.at;
        heading = (M.dwellBase + M.orbit) % 360;
      }
      const kC = 1 - Math.exp(-dt / 0.35);
      const kZ = 1 - Math.exp(-dt / 0.8);
      const kB = 1 - Math.exp(-dt / 0.7);
      const kP = 1 - Math.exp(-dt / 0.9);
      const dist = haversine([cam.lng, cam.lat], centre);
      const pull = Math.min(4, Math.log2(1 + dist / (metresPerPixel(cam.lat, cam.zoom) * 260)));
      cam.lng += (centre[0] - cam.lng) * kC;
      cam.lat += (centre[1] - cam.lat) * kC;
      cam.zoom += (leg.zoom - pull - cam.zoom) * kZ;
      cam.pitch += (leg.pitch - cam.pitch) * kP;
      cam.bearing = (cam.bearing + angleDiff(cam.bearing, heading) * kB + 360) % 360;
      map.jumpTo({ center: [cam.lng, cam.lat], zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing });

      // the route behind the vehicle
      if (now - lastDone > 32) {
        lastDone = now;
        const feats: Feature<LineString>[] = [];
        M.legs.forEach((l, i) => {
          if (!l.moving || !l.path) return;
          if (i < cur) feats.push(l.full);
          else if (i === cur) feats.push({ type: "Feature", properties: { color: l.color }, geometry: { type: "LineString", coordinates: slicePath(l.path, prog * l.len) } });
        });
        (map.getSource("done") as GeoJSONSource).setData({ type: "FeatureCollection", features: feats });
      }

      // the vehicle (or the handling pulse at a site)
      const feats: Feature[] = [];
      const here = pos ?? leg.at;
      const mpp = metresPerPixel(here[1], cam.zoom);
      if (pos) {
        const lengthM = leg.b.vehicle === "truck" ? 24 : leg.b.vehicle === "van" ? 14 : 9;
        feats.push({ type: "Feature", properties: { k: "veh", color: leg.color, icon: leg.icon, hdg: hdgNow, s: clamp(lengthM / mpp / 48, 0.6, 2.4), r: clamp(20 / mpp, 14, 70) }, geometry: { type: "Point", coordinates: pos } });
        tagMarker.setLngLat(pos);
        tag.style.display = "";
      } else {
        const phase = (t * 0.9) % 1;
        feats.push({ type: "Feature", properties: { k: "pulse", color: leg.color, r: (22 + 60 * phase) / mpp, a: 0.4 * (1 - phase) }, geometry: { type: "Point", coordinates: leg.at } });
        tagMarker.setLngLat(leg.at);
        tag.style.display = "none"; // at a site its own label is already on the map
      }
      (map.getSource("veh") as GeoJSONSource).setData({ type: "FeatureCollection", features: feats });

      if (now - lastCam > 250) {
        lastCam = now;
        host.dataset.cam = [cam.lng.toFixed(5), cam.lat.toFixed(5), cam.zoom.toFixed(2), cam.bearing.toFixed(1), cam.pitch.toFixed(1), cur, prog.toFixed(2)].join(",");
      }
    };

    api.current = {
      setModel: (plan) => {
        const mine = ++token;
        void buildLegs(plan).then((legs) => {
          if (disposed || mine !== token) return;
          if (!legs) return fail();
          const starts: number[] = [];
          const durs = legs.map((l) => l.dur);
          let acc = 0;
          for (const d of durs) { starts.push(acc); acc += d; }
          M.legs = legs;
          M.starts = starts;
          M.total = acc;
          M.plan = plan;
          props.current.clock.current = props.current.reduce ? acc - 0.001 : 0;
          props.current.onTimeline({ plan, starts, durs, total: acc });
          apply();
          if (loaded) props.current.onStatus("ready");
        });
      },
    };

    map.on("load", () => {
      if (disposed) return;
      loaded = true;
      window.clearTimeout(loadTimer);
      addLayers();
      api.current?.setModel(props.current.plan);
    });
    // before the style has loaded, any error is fatal; afterwards a missing tile is just a gap
    map.on("error", () => { if (!loaded) fail(); });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
    io.observe(host);
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      window.clearTimeout(loadTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      markers.forEach((m) => m.remove());
      tagMarker.remove();
      api.current = null;
      map.remove();
    };
    // the map is created once per style; everything else flows through `props`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.styleUrl]);

  // a new plan: resolve its geometry and restart the tour
  useEffect(() => { api.current?.setModel(p.plan); }, [p.plan]);

  // MapLibre's stylesheet makes its container `position: relative`, so the container fills a wrapper that fills the box
  return (
    <div role="group" aria-label={p.c.canvasLabel} className="absolute inset-0">
      <div ref={box} className="size-full" />
    </div>
  );
}
