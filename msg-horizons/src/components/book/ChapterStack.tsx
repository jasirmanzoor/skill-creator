"use client";

import { useEffect } from "react";

/**
 * Chapters as a stack of cards. Each chapter scrolls normally until its last screen, then holds in place (sticky,
 * bottom-aligned: CSS in globals.css, ".chapter-stack") while the next chapter slides up over it on rounded corners,
 * and the one underneath dims back as it is covered. The page keeps its native scroll and its length: nothing is
 * pinned for extra distance, nothing snaps, and every chapter still reads top to bottom.
 *
 * This effect only feeds the CSS two numbers per chapter: its height (--ch-h, so it knows where its last screen is)
 * and, on a shade layer of its own, how far the next chapter has covered it (opacity 0 → 0.6). The last chapter never holds: the footer follows it.
 */
export default function ChapterStack() {
  useEffect(() => {
    const root = document.documentElement;
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (pages.length < 2) return;
    pages[pages.length - 1].setAttribute("data-stack-last", "");
    root.classList.add("chapter-stack");

    const ro = new ResizeObserver(() => pages.forEach((p) => p.style.setProperty("--ch-h", `${p.offsetHeight}px`)));
    pages.forEach((p) => ro.observe(p));

    const shades = pages.map((p) => {
      const d = document.createElement("div");
      d.className = "chapter-shade";
      d.setAttribute("aria-hidden", "true");
      p.appendChild(d);
      return d;
    });

    let raf = 0;
    const last: number[] = [];
    const held: boolean[] = [];
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (let i = 0; i < pages.length - 1; i++) {
        const top = pages[i + 1].getBoundingClientRect().top;
        const c = Math.round(Math.min(1, Math.max(0, (vh - top) / vh)) * 100) / 100;
        if (c !== last[i]) { last[i] = c; shades[i].style.opacity = String(c * 0.6); }
        // hold only while the next chapter is arriving or covering this one; fully covered, it lets go (it is
        // then entirely behind the next chapter, and its own place in the page is already above the screen)
        const hold = top > -2 && top < vh * 1.5;
        if (hold !== held[i]) { held[i] = hold; pages[i].toggleAttribute("data-stack-hold", hold); }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.classList.remove("chapter-stack");
      pages[pages.length - 1].removeAttribute("data-stack-last");
      pages.forEach((p) => { p.style.removeProperty("--ch-h"); p.removeAttribute("data-stack-hold"); });
      shades.forEach((d) => d.remove());
    };
  }, []);
  return null;
}
