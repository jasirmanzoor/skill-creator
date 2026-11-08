"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * MSG's own sites on the console, as a camera wall: one large view and the other cameras in a strip. Each camera
 * shows MSG's own photograph of that spot with a slow camera drift. When a camera has a real feed configured
 * (NEXT_PUBLIC_CAM_<ID>, an MP4 or HLS address from MSG's recorder), its video plays instead and only then does the
 * view say LIVE. On the overview the cameras take turns; while one order plays, the view follows the order.
 */
type Cam = { id: string; n: string; src: string; pos: string; label: Record<Locale, string>; feed?: string };
const CAMS: Cam[] = [
  { id: "ENTRANCE", n: "01", src: "/media/msg/hub-open.webp", pos: "50% 55%", label: { en: "Sabya hub · Entrance", ar: "مركز صبيا · المدخل" }, feed: process.env.NEXT_PUBLIC_CAM_ENTRANCE },
  { id: "RACKS", n: "02", src: "/media/msg/hub-racks.webp", pos: "50% 62%", label: { en: "Sabya hub · Racks", ar: "مركز صبيا · الرفوف" }, feed: process.env.NEXT_PUBLIC_CAM_RACKS },
  { id: "FLOOR", n: "03", src: "/media/msg/interior.jpg", pos: "50% 55%", label: { en: "Sabya hub · Dispatch floor", ar: "مركز صبيا · أرضية الشحن" }, feed: process.env.NEXT_PUBLIC_CAM_FLOOR },
  { id: "SORTING", n: "04", src: "/media/msg/hub-sorting.webp", pos: "50% 55%", label: { en: "Sabya hub · Sorting", ar: "مركز صبيا · الفرز" }, feed: process.env.NEXT_PUBLIC_CAM_SORTING },
];
const OUTLET = process.env.NEXT_PUBLIC_CAM_OUTLET;
if (OUTLET) CAMS.push({ id: "OUTLET", n: "05", src: "/media/msg/hub-floor.webp", pos: "50% 50%", label: { en: "MSG outlet · Counter", ar: "منفذ ام اس جي · الكاونتر" }, feed: OUTLET });

/** which camera each stage of one order watches: set up → entrance, store → racks, deliver → floor, settle → sorting */
const FOR_STAGE = ["ENTRANCE", "RACKS", "FLOOR", "SORTING"];
const LIVE: Record<Locale, string> = { en: "LIVE", ar: "مباشر" };

function View({ cam, big, reduce }: { cam: Cam; big: boolean; reduce: boolean }) {
  if (cam.feed) {
    return <video className="absolute inset-0 size-full object-cover" src={cam.feed} autoPlay muted loop playsInline />;
  }
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ scale: 1.08, x: "-1.5%" }}
      animate={reduce || !big ? { scale: 1.08, x: "0%" } : { scale: [1.08, 1.16], x: ["-1.5%", "1.5%"] }}
      transition={reduce || !big ? { duration: 0 } : { duration: 9, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
    >
      <Image src={cam.src} alt="" fill sizes={big ? "(min-width:1024px) 640px, 90vw" : "160px"} className="object-cover [filter:saturate(0.85)_contrast(1.05)]" style={{ objectPosition: cam.pos }} />
    </motion.div>
  );
}

export default function CameraWall({ lang, stage = -1, clock }: { lang: Locale; stage?: number; clock: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [turn, setTurn] = useState(0);
  // the overview takes the cameras in turn
  useEffect(() => {
    if (reduce || stage >= 0) return;
    const id = window.setInterval(() => setTurn((t) => (t + 1) % CAMS.length), 5200);
    return () => window.clearInterval(id);
  }, [reduce, stage]);
  const mainId = stage >= 0 ? FOR_STAGE[stage] : CAMS[turn].id;
  const main = CAMS.find((c) => c.id === mainId) ?? CAMS[0];
  const rest = CAMS.filter((c) => c.id !== main.id);

  return (
    <div className="absolute inset-0 bg-[#03080f]">
      {/* the large view */}
      <AnimatePresence initial={false}>
        <motion.div key={main.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.6 }}>
          <View cam={main} big reduce={reduce} />
        </motion.div>
      </AnimatePresence>
      {/* glass over the lens: scan lines and a vignette */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_3px)] mix-blend-overlay" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(2,8,18,0.75)_100%)]" />
      {/* what this camera is */}
      <div className="absolute start-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-md bg-black/55 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:start-4 sm:top-4 sm:text-[11px] rtl:font-sans rtl:tracking-normal">
        {main.feed ? (
          <span className="flex items-center gap-1.5 text-[#ff6b6b]"><span className="size-1.5 rounded-full bg-[#ff4d4d] motion-safe:animate-pulse" />{LIVE[lang]}</span>
        ) : (
          <span className="size-1.5 rounded-full bg-brand-bright" />
        )}
        <span dir="ltr">CAM {main.n}</span>
        <span className="truncate text-white/75">· {main.label[lang]}</span>
      </div>
      <div className="absolute end-3 top-3 hidden rounded-md bg-black/55 px-2 py-1 backdrop-blur-sm sm:end-4 sm:top-4 sm:block">{clock}</div>
      {/* the other cameras */}
      <div className="absolute bottom-3 end-3 flex gap-1.5 sm:bottom-4 sm:end-4 sm:gap-2">
        {rest.map((c) => (
          <div key={c.id} className="relative h-12 w-[4.5rem] overflow-hidden rounded-md ring-1 ring-white/25 sm:h-16 sm:w-24">
            <View cam={c} big={false} reduce={reduce} />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 font-mono text-[8px] text-white/90 sm:text-[9px]" dir="ltr">CAM {c.n}</span>
          </div>
        ))}
      </div>
      {/* corner brackets */}
      {["start-1.5 top-1.5 border-s border-t", "end-1.5 top-1.5 border-e border-t", "bottom-1.5 start-1.5 border-b border-s", "bottom-1.5 end-1.5 border-b border-e"].map((k) => (
        <span key={k} aria-hidden="true" className={`pointer-events-none absolute size-3.5 border-white/60 ${k}`} />
      ))}
    </div>
  );
}
