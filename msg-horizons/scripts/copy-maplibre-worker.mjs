// MapLibre runs its heavy work in a web worker and finds the worker script relative to its own bundle,
// which a Next.js build moves. So we serve the worker (and the shared chunk it imports) from a fixed path
// and tell MapLibre where it is (see FlyoverMap.tsx). Runs on install, dev and build.
import { cpSync, existsSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/maplibre/", import.meta.url);
if (!existsSync(from)) process.exit(0); // not installed yet
mkdirSync(to, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) cpSync(new URL(f, from), new URL(f, to));
