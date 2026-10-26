"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useLowPower } from "@/lib/perf";
import { layersOpen, subscribeLayers } from "@/lib/rays-store";

const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};

/**
 * The site's background: React Bits' LightRays, fixed behind every page. Warm desert light falls from the top left
 * across the page, drifts through a soft haze and leans a little toward the pointer; a click sends a pulse down the
 * rays. In the light theme the rays are drawn as warm ink on paper (lightMode), in the dark theme as light on night.
 * It rests while a section runs its own light (components/fx/RaysLayer), is still on weaker devices and for visitors
 * who ask for less motion, and without WebGL the plain paper or night ground remains.
 */
export default function RaysBackdrop() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
  const covered = useSyncExternalStore(subscribeLayers, layersOpen, () => false);
  const still = useLowPower();
  return (
    <div aria-hidden="true" className="rays-backdrop pointer-events-none fixed inset-0 -z-10">
      {covered ? null : <LightRays
        key={`${dark ? "night" : "day"}${still ? "-still" : ""}`}
        raysOrigin="top-left"
        raysColor="#FFD39A"
        raysSpeed={still ? 0 : 1}
        lightSpread={1}
        rayLength={3}
        glow={0.9}
        haze={0.45}
        followMouse={!still}
        mouseInfluence={0.1}
        rayDensity={1.3}
        tilt={-32}
        raySharpness={0.35}
        atmosphere={0}
        intensity={1.3}
        fadeDistance={1}
        saturation={1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        maxDevicePixelRatio={0.5}
        cursorShadow={!still}
        clickPulse={!still}
        intro={!still}
        lightMode={!dark}
        style={{ width: "100%", height: "100%" }}
      />}
    </div>
  );
}
