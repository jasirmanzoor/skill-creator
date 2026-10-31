import type { Map as MapLibre } from "maplibre-gl";

/**
 * The route console's night skin: a dark city with street light pooling along the route and glowing flow lines,
 * after the GeoLog component's look. Paint only: no route, timing or camera logic lives here.
 */
export const NIGHT = {
  ground: "#070b14",
  block: "#121c30",
  blockLit: "#1b2a44",
  street: "#0e1524",
  streetLit: "#22324f",
  water: "#081426",
  green: "#0d1a33",
  label: "#8fa3c0",
  light: "#bcd7ff",
  // flow colours, lifted so they read on the dark ground (same order as the day palette)
  parcel: "#7fcbfb",
  you: "#9bd1ff",
  cash: "#f2c14e",
  back: "#ff7a5c",
  door: "#4db8fa",
} as const;

type Paint = Record<string, unknown>;
const rules: [RegExp, Paint][] = [
  [/^background$/, { "background-color": NIGHT.ground }],
  [/^natural_earth$/, { "raster-opacity": 0.12 }],
  [/^water$/, { "fill-color": NIGHT.water }],
  [/^waterway/, { "line-color": NIGHT.water }],
  [/^park_outline$/, { "line-opacity": 0 }],
  [/^(park|landcover_|landuse_(pitch|track|cemetery))/, { "fill-color": NIGHT.green, "fill-opacity": 0.9 }],
  [/^landuse_/, { "fill-color": "#0b111d" }],
  [/^aeroway_fill$/, { "fill-color": "#0b111d" }],
  [/^aeroway_/, { "line-color": NIGHT.street }],
  [/^road_area_pattern$/, { "fill-opacity": 0 }],
  [/_casing$/, { "line-color": NIGHT.ground }],
  [/(rail|hatching)$/, { "line-color": "#1a2438" }],
  [/(motorway|trunk_primary)$/, { "line-color": NIGHT.streetLit }],
  [/(secondary_tertiary|link|street)$/, { "line-color": "#18243c" }],
  [/(minor|service_track|path_pedestrian)$/, { "line-color": NIGHT.street }],
  [/^building$/, { "fill-color": NIGHT.block }],
  [/^building-3d$/, { "fill-extrusion-color": NIGHT.blockLit, "fill-extrusion-opacity": 0.85 }],
  [/^boundary/, { "line-color": "#2a3a5a" }],
];
// clutter GeoLog leaves out: shop and transit icons, one-way arrows, road shields
const hidden = /^(poi_|road_one_way|highway-shield|road_shield)/;

export function applyNightSkin(map: MapLibre) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id;
    if (hidden.test(id)) { map.setLayoutProperty(id, "visibility", "none"); continue; }
    if (layer.type === "symbol") {
      map.setPaintProperty(id, "text-color", NIGHT.label);
      map.setPaintProperty(id, "text-halo-color", NIGHT.ground);
      map.setPaintProperty(id, "icon-opacity", 0.5);
      continue;
    }
    const rule = rules.find(([re]) => re.test(id));
    if (!rule) continue;
    for (const [k, v] of Object.entries(rule[1])) {
      if (k.startsWith(layer.type)) map.setPaintProperty(id, k as never, v as never);
    }
  }
}
