"use client";

import dynamic from "next/dynamic";
import { useLowPower } from "@/lib/perf";

type GlassProps = Record<string, unknown>;
const GlassSurface = dynamic<GlassProps>(() => import("./GlassSurface") as unknown as Promise<{ default: React.ComponentType<GlassProps> }>, { ssr: false });

/**
 * The site's glass (React Bits' GlassSurface): laid behind a bar's content, it bends and splits the page that scrolls
 * under it, with a soft frost so the bar's words always read. Chromium refracts through an SVG filter; Safari and
 * Firefox get the component's own frosted fallback. The bar it sits in must not blur its own backdrop (that would hide
 * the page from the glass), so bars ask `useGlass()` and drop their blur while it is on. Weaker devices get no glass.
 */
export default function Glass({ radius = 0, frost = 0.6 }: { radius?: number; frost?: number }) {
  const on = useGlass();
  if (!on) return null;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ borderRadius: radius }}>
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={radius}
        borderWidth={0.05}
        brightness={50}
        opacity={0.93}
        blur={11}
        displace={0.5}
        backgroundOpacity={frost}
        saturation={1}
        distortionScale={-70}
        redOffset={0}
        greenOffset={3}
        blueOffset={6}
      />
    </span>
  );
}

export const useGlass = () => !useLowPower();
