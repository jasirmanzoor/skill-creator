"use client";

import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

/**
 * The site's light (components/fx/RaysBackdrop) inside a dark section: the same LightRays, always as light on dark, so
 * white type keeps its ground in both themes. It sits in the section's own stack (the parent isolates), screened over
 * the section's photo or night, and rests while the section is off screen.
 */
export default function RaysLayer({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 mix-blend-screen ${className}`}>
      <LightRays
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
        lightMode={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
