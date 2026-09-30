import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Photo slots MSG fills with its own files (never generated stand-ins):
 *   public/warehouse.jpg — the Sabya 800 m² logistics centre (Sabya card in GrowthBand)
 *   public/coast.jpg     — a coastal highway / Corniche shot (NetworkBand scene)
 * Drop the file in and redeploy; until then the band renders its painted daylight scene.
 */
export const hasPublicFile = (file: string) => existsSync(join(process.cwd(), "public", file));
