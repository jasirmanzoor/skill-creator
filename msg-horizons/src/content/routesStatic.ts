/**
 * Pre-computed driving routes for the route console's flyover: Riyadh districts and the Riyadh hub,
 * and Sabya's areas and logistics centre. Keys come from `routeKey()` in src/lib/routing.ts; values are
 * encoded polylines (precision 5).
 *
 * Regenerate with:  node --experimental-strip-types scripts/build-routes.mjs
 * It needs access to an OSRM server (default: router.project-osrm.org). Until it has been run this table is
 * empty and the flyover asks the routing server live, then falls back to the flat map if that fails.
 */
export const ROUTES_STATIC: Record<string, string> = {};
