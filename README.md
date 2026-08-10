# Al Qadisiyah Dealership Intelligence Platform

Mobile-first, offline-first field survey tool for mapping and qualifying independent car
dealerships in the Al Qadisiyah market (East Riyadh) for embedded auto-financing.

**Status: Phase 1 (map + survey + offline sync + dashboard) is built.** Phases 2 (research
agent) and 3 (operational layer) are not started.

## What's here

- **Map** (`/`) — colour-coded pins by visit status, satellite/street toggle, near-me sort,
  walking-route planner, quick "add dealership" capture.
- **Survey** (`/survey/[id]`) — 9-step mobile form covering identity, business identity,
  people, commercial terms, financing pain, customers, and a mandatory data-quality gate.
  Autosaves every field to IndexedDB; works fully offline.
- **Dashboard** (`/dashboard`) — coverage, field completeness, an **Observed-only** toggle on
  every aggregate, pilot pipeline, top leads, and CSV/Excel export.
- **Settings** (`/settings`) — dark mode, CSV/Excel import (bring in your own survey sheet),
  OpenStreetMap-based discovery of nearby real dealerships not yet on the roster, reset.

## The core data rule

Every business figure (inventory, price, monthly sold, monthly financed, financing losses) is
stored as `{ value, basis }` where `basis` is `observed` or `self_reported`. Dashboard
aggregates default to **Observed-only** and never silently blend the two. This mirrors the
field-survey philosophy: what you can count with your own eyes vs. what the dealer told you.

## Seed data provenance

The starting roster (`src/lib/seed.ts`) combines two real sources — no dealership names or
figures are invented:

1. The original 38-dealership mapping-data list for the district.
2. A 43-record manually-surveyed master table. Four records matched an existing mapping-data
   entry by name and <20m GPS proximity and were merged in place; the other 39 are distinct
   dealerships (this market has many showrooms per block, so nearby ≠ duplicate) added as
   additional pins.

This gives ~75 real starting records. The Al Qadisiyah market has far more dealerships than
that — growing the roster further should come from continued field survey (use **Import** in
Settings to bring in updated sheets) or from **Discover more dealerships** in Settings, which
queries OpenStreetMap for real, sourced candidate pins near the market to go verify in person.
Nothing in this app fabricates a dealership.

## Architecture notes

- **Local-first, single device.** All data lives in IndexedDB on the device — the app is fully
  functional with zero network. There is no backend in Phase 1. An optional "cloud sync
  endpoint" can be set in Settings as a forward-compatible hook for a future backend; when
  unset the app is simply local-only (matches the plan's Phase 3 multi-user scope).
  Photos are stored as compressed blobs in IndexedDB, geotagged on capture.
- **Offline map tiles.** A service worker (`public/sw.js`) caches the app shell and any map
  tiles you've already viewed, so previously-loaded areas keep rendering with no signal.
  First load of a new area still needs connectivity.
- **Auth.** A lightweight local "who's surveying" gate (name only, no server) — enough to
  avoid leaving commercially sensitive data on an unlocked screen, not a real multi-user
  auth system. Multi-user support is explicitly Phase 3 in the plan.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Stack: Next.js (App Router) + TypeScript + Tailwind CSS v4, Leaflet/react-leaflet for the map,
`idb` for IndexedDB, ExcelJS for import/export.
