"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useLowPower } from "@/lib/perf";
import { layerClosed, layerOpened } from "@/lib/rays-store";

const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

/**
 * The site's light (components/fx/RaysBackdrop) inside a dark section: the same LightRays, always as light on dark, so
 * white type keeps its ground in both themes. It sits in the section's own stack (the parent isolates), screened over
 * the section's photo or night. It exists only while the section is on screen (its WebGL context is released when you
 * leave), the site-wide backdrop rests while it runs, and weaker devices keep the section's plain ground.
 */
export default function RaysLayer({ className = "" }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const low = useLowPower();

  useEffect(() => {
    if (low || !box.current) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "120px" });
    io.observe(box.current);
    return () => io.disconnect();
  }, [low]);

  useEffect(() => {
    if (!on) return;
    layerOpened();
    return layerClosed;
  }, [on]);

  return (
    <div ref={box} aria-hidden="true" className={`pointer-events-none absolute inset-0 mix-blend-screen ${className}`}>
      {on && !low ? <LightRays
        raysOrigin="top-left"
        raysColor="#bfe3ff"
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
        maxDevicePixelRatio={0.5}
        cursorShadow
        clickPulse
        intro
        lightMode={false}
        style={{ width: "100%", height: "100%" }}
      /> : null}
    </div>
  );
}
