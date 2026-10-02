/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp from MSG's company profile */
import type { ServiceId } from "@/content/facts";

/** MSG's own photography for each service (2026 company profile). */
const PHOTO: Record<ServiceId, { src: string; pos?: string }> = {
  "last-mile": { src: "/photos/clean/courier-mall.webp", pos: "50% 35%" },
  warehousing: { src: "/photos/msg/warehouse-floor.webp", pos: "50% 55%" },
  "land-freight": { src: "/photos/clean/riyadh-night.webp", pos: "50% 60%" },
  fleet: { src: "/photos/clean/fleet-car.webp", pos: "50% 62%" },
  manpower: { src: "/photos/clean/team.webp", pos: "50% 45%" },
  tracking: { src: "/photos/clean/courier-mall.webp", pos: "50% 35%" },
  account: { src: "/photos/clean/business.webp", pos: "50% 30%" },
};

export default function ServiceScene({ id }: { id: ServiceId }) {
  const p = PHOTO[id];
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-subtle">
      <img src={p.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: p.pos }} />
    </div>
  );
}
