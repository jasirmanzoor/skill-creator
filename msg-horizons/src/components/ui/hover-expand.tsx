"use client";

/**
 * Hover-to-expand photo strip. Adapted from Skiper UI's HoverExpand_001 (skiper52, https://skiper-ui.com);
 * attribution to Skiper UI is required by its free licence.
 *
 * Changes from the original: built on motion/react, tiles share the row through flex-grow so the strip fits any
 * width, it stacks vertically on phones, every tile is a real button (focus and tap open it, hover only for a
 * mouse), captions are bilingual, and reduced-motion visitors get the change without the travel.
 */
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ExpandItem = {
  src: string;
  alt: string;
  caption?: string;
  /** object-position for the crop, e.g. "50% 40%" */
  pos?: string;
};

export default function HoverExpand({ items, initial = 0, badge, className }: { items: ExpandItem[]; initial?: number; badge?: string; className?: string }) {
  const [active, setActive] = useState(initial);
  const reduce = useReducedMotion();

  return (
    <ul className={cn("flex h-[34rem] w-full flex-col gap-2 sm:h-[26rem] sm:flex-row", className)}>
      {items.map((item, i) => {
        const open = i === active;
        return (
          <motion.li
            key={item.src}
            initial={false}
            animate={{ flexGrow: open ? 6 : 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_IN_OUT }}
            className="relative min-h-0 min-w-0 basis-0 overflow-hidden rounded-2xl bg-ink/10"
          >
            <button
              type="button"
              aria-pressed={open}
              aria-label={item.caption ?? item.alt}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              data-press="soft"
              className="group absolute inset-0 size-full cursor-pointer text-start focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 60vw, 100vw"
                style={{ objectPosition: item.pos }}
                className={cn("object-cover transition-[filter] duration-300", !open && "[filter:saturate(0.6)_brightness(0.85)]")}
              />
              {badge && (
                <span className="absolute start-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur-sm">{badge}</span>
              )}
              <AnimatePresence initial={false}>
                {open && item.caption && (
                  <motion.span
                    key="caption"
                    initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: reduce ? 0 : 0.15, ease: EASE_OUT } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/65 via-black/25 to-transparent p-5 pt-16"
                  >
                    <span className="text-base font-semibold text-white">{item.caption}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
