"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

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
 * Without WebGL the plain paper or night ground remains.
 */
export default function RaysBackdrop() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
  return (
    <div aria-hidden="true" className="rays-backdrop pointer-events-none fixed inset-0 -z-10">
      <LightRays
        key={dark ? "night" : "day"}
        raysOrigin="top-left"
        raysColor="#FFD39A"
        raysSpeed={1}
        lightSpread={1}
        rayLength={3}
        glow={0.9}
        haze={0.45}
        followMouse
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
        cursorShadow
        clickPulse
        intro
        lightMode={!dark}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
