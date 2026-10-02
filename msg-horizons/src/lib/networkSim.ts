/**
 * A small, deterministic simulation of how an MSG network runs: pickup vans bring parcels from
 * seller origins into the Riyadh hub, the hub sorts them, couriers take them to doors, and (when
 * the plan needs them) a warehouse feeds the hub and line-haul trucks leave for other cities.
 *
 * It is an illustration of the operating model, never live data: every count it reports is a
 * count of what is on screen. The renderer (components/planner/NetworkConsole.tsx) draws it.
 *
 * World space is 1000 × 520. Roads are a gently curved grid (rows × columns) plus a ring road.
 */

export type Pt = { x: number; y: number };
export type Kind = "van" | "courier" | "truck" | "shuttle";
export type Phase = "origin" | "hub" | "road" | "door";
export type SimEvent = { t: number; key: "pickup" | "sorted" | "out" | "delivered" | "stock" | "linehaul" | "shift"; id?: string; n?: number };

export type SimConfig = {
  origins: number; // seller pickup points
  couriers: number;
  storage: boolean;
  freight: boolean;
  people: boolean;
  seed?: number;
};

export const W = 1000;
export const H = 520;
export const ROWS = 8;
export const COLS = 12;

export const rowY = (r: number, x: number) => 46 + r * 61 + 7 * Math.sin(x / 110 + r * 1.3);
export const colX = (c: number, y: number) => 56 + c * 80 + 7 * Math.sin(y / 120 + c * 0.9);

/** Intersection of row r and column c (solved by a few fixed-point steps). */
export function node(c: number, r: number): Pt {
  let x = 56 + c * 80;
  let y = rowY(r, x);
  for (let k = 0; k < 4; k++) {
    x = colX(c, y);
    y = rowY(r, x);
  }
  return { x, y };
}

const STEPS = 10;
/** Road path between two intersections: along the start row, then down the end column. */
export function route(a: [number, number], b: [number, number]): Pt[] {
  const [c1, r1] = a;
  const [c2, r2] = b;
  const pts: Pt[] = [node(c1, r1)];
  const dc = Math.sign(c2 - c1);
  for (let c = c1; c !== c2; c += dc) {
    const from = node(c, r1).x;
    const to = node(c + dc, r1).x;
    for (let s = 1; s <= STEPS; s++) {
      const x = from + ((to - from) * s) / STEPS;
      pts.push({ x, y: rowY(r1, x) });
    }
  }
  const dr = Math.sign(r2 - r1);
  for (let r = r1; r !== r2; r += dr) {
    const from = node(c2, r).y;
    const to = node(c2, r + dr).y;
    for (let s = 1; s <= STEPS; s++) {
      const y = from + ((to - from) * s) / STEPS;
      pts.push({ x: colX(c2, y), y });
    }
  }
  return pts;
}

/** Line-haul leg: along the hub row to the east edge of the map. */
function corridor(hub: [number, number]): Pt[] {
  const pts: Pt[] = [];
  const start = node(hub[0], hub[1]).x;
  for (let x = start; x <= W + 30; x += 12) pts.push({ x, y: rowY(hub[1], x) });
  return pts;
}

const lengths = (p: Pt[]) => {
  const out = [0];
  for (let i = 1; i < p.length; i++) out.push(out[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y));
  return out;
};

export type Vehicle = {
  id: string;
  kind: Kind;
  path: Pt[];
  lens: number[];
  d: number; // distance travelled along path
  speed: number;
  pos: Pt;
  trail: Pt[];
  load: number[]; // parcel ids on board
  state: "idle" | "out" | "back";
  home: [number, number];
  target?: [number, number];
  wait: number;
};

export type Ping = { x: number; y: number; age: number };

const HUB: [number, number] = [6, 4];
const WAREHOUSE: [number, number] = [8, 2];
const ORIGIN_SETS: [number, number][] = [[1, 1], [2, 7], [11, 1], [0, 5], [10, 7], [3, 0]];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export class NetworkSim {
  t = 0;
  hub = node(...HUB);
  warehouse = node(...WAREHOUSE);
  origins: { cell: [number, number]; p: Pt }[] = [];
  vehicles: Vehicle[] = [];
  queue: number[] = []; // parcels waiting at the hub
  pings: Ping[] = [];
  heat: Pt[] = [];
  delivered = 0;
  events: SimEvent[] = [];
  /** the parcel the camera can follow */
  hero = { id: -1, phase: "origin" as Phase, pos: node(1, 1) as Pt, carrier: "" };
  cfg: SimConfig;
  private rand: () => number;
  private nextParcel = 1;
  private sortClock = 0;
  private stockClock = 3;
  private shiftClock = 1;
  private inflowClock = 0.5;
  private doorAt = 0;

  constructor(cfg: SimConfig) {
    this.cfg = cfg;
    this.rand = rng(cfg.seed ?? 7);
    this.configure(cfg);
  }

  /** Re-shape the network for a new plan without resetting the clock (features shift in place). */
  configure(cfg: SimConfig) {
    this.cfg = cfg;
    const want = Math.max(1, Math.min(ORIGIN_SETS.length, cfg.origins));
    this.origins = ORIGIN_SETS.slice(0, want).map((cell) => ({ cell, p: node(...cell) }));
    const keep = (k: Kind, n: number) => {
      const have = this.vehicles.filter((v) => v.kind === k);
      if (have.length > n) {
        const drop = new Set(have.slice(n).map((v) => v.id));
        this.vehicles = this.vehicles.filter((v) => !drop.has(v.id));
      }
      for (let i = have.length; i < n; i++) this.vehicles.push(this.spawn(k, i));
    };
    // one van per origin
    this.vehicles = this.vehicles.filter((v) => v.kind !== "van" || this.origins.some((o) => o.cell.join() === v.home.join()));
    this.origins.forEach((o, i) => {
      if (!this.vehicles.some((v) => v.kind === "van" && v.home.join() === o.cell.join())) {
        const v = this.spawn("van", i);
        v.home = o.cell;
        v.pos = { ...o.p };
        v.wait = 0.4 + i * 0.7;
        this.vehicles.push(v);
      }
    });
    keep("courier", Math.max(1, Math.min(18, cfg.couriers)));
    keep("truck", cfg.freight ? 1 : 0);
    keep("shuttle", cfg.storage ? 1 : 0);
  }

  private spawn(kind: Kind, i: number): Vehicle {
    const tag = { van: "V", courier: "C", truck: "T", shuttle: "S" }[kind];
    return {
      id: `${tag}-${String(11 + i * 7).padStart(2, "0")}`,
      kind,
      path: [],
      lens: [0],
      d: 0,
      speed: { van: 78, courier: 62, truck: 96, shuttle: 58 }[kind],
      pos: { ...this.hub },
      trail: [],
      load: [],
      state: "idle",
      home: kind === "shuttle" ? WAREHOUSE : HUB,
      wait: kind === "courier" ? i * 0.35 : 0.5,
    };
  }

  private send(v: Vehicle, from: [number, number], to: [number, number], state: "out" | "back") {
    v.path = route(from, to);
    v.lens = lengths(v.path);
    v.d = 0;
    v.state = state;
    v.target = to;
  }

  private door(): [number, number] {
    for (;;) {
      const c = Math.floor(this.rand() * COLS);
      const r = Math.floor(this.rand() * ROWS);
      if (Math.abs(c - HUB[0]) + Math.abs(r - HUB[1]) >= 2) return [c, r];
    }
  }

  private emit(e: Omit<SimEvent, "t">) {
    this.events.push({ t: this.t, ...e });
    if (this.events.length > 40) this.events.shift();
  }

  step(dt: number) {
    this.t += dt;
    // pings and heat age
    this.pings = this.pings.filter((p) => (p.age += dt) < 1.6);

    // the rest of the network's shippers keep the hub fed, so couriers are rarely idle
    this.inflowClock -= dt;
    if (this.inflowClock <= 0 && this.queue.length < 4) {
      this.queue.push(this.nextParcel++);
      this.inflowClock = Math.max(0.35, 1.1 - this.cfg.couriers * 0.04);
    }

    // hub sortation: one parcel every ~0.45s onto a free courier
    this.sortClock -= dt;
    if (this.sortClock <= 0 && this.queue.length) {
      const free = this.vehicles.find((v) => v.kind === "courier" && v.state === "idle" && v.wait <= 0);
      if (free) {
        const parcel = this.queue.shift()!;
        free.load = [parcel];
        this.send(free, HUB, this.door(), "out");
        this.emit({ key: "sorted", id: `R-${String(3 + (parcel % 17)).padStart(2, "0")}` });
        this.emit({ key: "out", id: free.id });
        if (parcel === this.hero.id) { this.hero.phase = "road"; this.hero.carrier = free.id; }
        else if (this.hero.phase === "door" && this.t - this.doorAt > 2.5) {
          // the last tracked parcel is home: pick up the next one leaving the hub
          this.hero = { id: parcel, phase: "road", pos: { ...this.hub }, carrier: free.id };
        }
        this.sortClock = 0.45;
      }
    }

    // warehouse picks feed the hub
    if (this.cfg.storage) {
      this.stockClock -= dt;
      if (this.stockClock <= 0) { this.emit({ key: "stock" }); this.stockClock = 6 + this.rand() * 3; }
    }
    if (this.cfg.people) {
      this.shiftClock -= dt;
      if (this.shiftClock <= 0) { this.emit({ key: "shift" }); this.shiftClock = 9 + this.rand() * 4; }
    }

    for (const v of this.vehicles) {
      if (v.state === "idle") {
        v.wait -= dt;
        if (v.wait > 0) continue;
        if (v.kind === "van") {
          // collect at origin, drive to hub
          const n = 2 + Math.floor(this.rand() * 4);
          v.load = Array.from({ length: n }, () => this.nextParcel++);
          if (this.hero.id < 0 || this.hero.phase === "door") {
            this.hero = { id: v.load[0], phase: "origin", pos: { ...v.pos }, carrier: v.id };
          }
          this.send(v, v.home, HUB, "out");
        } else if (v.kind === "truck") {
          v.path = corridor(HUB);
          v.lens = lengths(v.path);
          v.d = 0;
          v.state = "out";
          this.emit({ key: "linehaul", id: v.id });
        } else if (v.kind === "shuttle") {
          this.send(v, WAREHOUSE, HUB, "out");
        }
        continue;
      }
      v.d += v.speed * dt;
      const L = v.lens[v.lens.length - 1];
      if (v.d >= L) {
        v.pos = { ...v.path[v.path.length - 1] };
        this.arrive(v);
      } else {
        let i = 1;
        while (v.lens[i] < v.d) i++;
        const a = v.path[i - 1];
        const b = v.path[i];
        const f = (v.d - v.lens[i - 1]) / Math.max(0.001, v.lens[i] - v.lens[i - 1]);
        v.pos = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      }
      v.trail.push({ ...v.pos });
      if (v.trail.length > 22) v.trail.shift();
      if (v.load.includes(this.hero.id)) this.hero.pos = { ...v.pos };
    }
  }

  private arrive(v: Vehicle) {
    if (v.kind === "van") {
      if (v.state === "out") {
        this.queue.push(...v.load);
        this.emit({ key: "pickup", id: v.id, n: v.load.length });
        if (v.load.includes(this.hero.id)) { this.hero.phase = "hub"; this.hero.pos = { ...this.hub }; }
        v.load = [];
        this.send(v, HUB, v.home, "back");
      } else {
        v.state = "idle";
        v.wait = 0.8 + this.rand() * 1.4;
        v.trail = [];
      }
    } else if (v.kind === "courier") {
      if (v.state === "out") {
        this.delivered += v.load.length;
        this.pings.push({ ...v.pos, age: 0 });
        this.heat.push({ ...v.pos });
        if (this.heat.length > 220) this.heat.shift();
        this.emit({ key: "delivered" });
        if (v.load.includes(this.hero.id)) { this.hero.phase = "door"; this.hero.pos = { ...v.pos }; this.doorAt = this.t; }
        v.load = [];
        this.send(v, v.target!, HUB, "back");
      } else {
        v.state = "idle";
        v.wait = 0.2;
        v.trail = [];
      }
    } else if (v.kind === "truck") {
      v.state = "idle";
      v.wait = 5 + this.rand() * 3;
      v.pos = { ...this.hub };
      v.trail = [];
    } else {
      if (v.state === "out") {
        this.queue.push(this.nextParcel++);
        this.send(v, HUB, WAREHOUSE, "back");
      } else {
        v.state = "idle";
        v.wait = 2.5;
        v.trail = [];
      }
    }
  }

  moving() {
    return this.vehicles.filter((v) => v.state !== "idle").length;
  }
}
