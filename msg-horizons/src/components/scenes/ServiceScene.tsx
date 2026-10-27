/* eslint-disable @next/next/no-img-element -- local, pre-optimised webp from MSG's company profile */
import type { ServiceId } from "@/content/facts";

/** a photo for each service: everyday scenes of the work itself, and the long-haul truck in MSG's livery */
const PHOTO: Record<ServiceId, { src: string; pos?: string }> = {
  "last-mile": { src: "/media/photos/lastmile.webp", pos: "55% 50%" },
  warehousing: { src: "/media/photos/warehousing.webp", pos: "55% 50%" },
  "land-freight": { src: "/media/msg/land-freight-truck.webp", pos: "40% 55%" },
  fleet: { src: "/media/photos/fleet-depot.webp", pos: "55% 60%" },
  manpower: { src: "/media/photos/manpower.webp", pos: "50% 45%" },
  tracking: { src: "/media/photos/tracking.webp", pos: "45% 55%" },
  account: { src: "/media/photos/account.webp", pos: "50% 50%" },
};

export default function ServiceScene({ id }: { id: ServiceId }) {
  const p = PHOTO[id];
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-subtle">
      <img src={p.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: p.pos }} />
    </div>
  );
}
