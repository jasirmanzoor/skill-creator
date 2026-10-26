"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/content/i18n";
import { onBookState } from "@/lib/book";
import { isTouch, useLowPower } from "@/lib/perf";

const TechText = dynamic(() => import("./TechText"), { ssr: false });

/** the site's headings: section, scene and card titles */
const SELECTOR = "main h1, main h2, main h3, main .h-section, main .h-display, main .h-scene";
/** figures keep their own type and motion (ui/CountUp) */
const DIGITS = /[0-9٠-٩]/;
/** places that already draw their own words, or where a heading is part of a control */
const SKIP = "[data-tech-skip], .tech-text, .scroll-expand__title, button, [role=tab], [role=radio], [role=dialog], .flipbook";

type Line = { key: string; text: string; left: number; top: number; width: number; height: number; color: string; size: number; weight: string; family: string; spacing: number };
type Target = { id: number; el: HTMLElement; host: HTMLElement; lines: Line[]; interactive: boolean; live: boolean };
/** how many headings are drawn at once: the ones on screen, nearest the middle first */
const MAX_LIVE = 5;
const MAX_LIVE_TOUCH = 3;

/**
 * React Bits' TechText on every heading of the site, words only. Each heading keeps its real text in the page (for
 * search, screen readers, translation and layout); the text is made see-through and TechText redraws it line by line
 * exactly where the browser set it, in the heading's own font, size, weight and colour. A light sweeps along each
 * line, turning the letter it passes into a dashed outline inside a technical frame; the letters assemble on arrival,
 * and a tap kicks them up like a wave. Headings with a figure in them, Arabic (whose letters join, while TechText draws
 * one letter at a time) and headings inside controls keep their normal type. Only the open chapter is measured, and
 * only the few headings on screen are drawn (the rest are plain type until you reach them), so the page stays smooth;
 * weaker devices and visitors who ask for less motion keep plain type throughout.
 */
export default function TechHeadings({ lang }: { lang: Locale }) {
  const [targets, setTargets] = useState<Target[]>([]);
  const low = useLowPower();

  useEffect(() => {
    if (lang === "ar" || low) return;
    const limit = isTouch() ? MAX_LIVE_TOUCH : MAX_LIVE;
    const known = new Map<HTMLElement, Target>();
    let dead = false; // set on cleanup, so a late callback (fonts, observers) cannot bring the headings back
    let ids = 0;
    let raf = 0;
    const onScreen = new Set<HTMLElement>();
    const publish = () => {
      // draw the headings in view, the ones nearest the middle of the screen first; the others stay plain type
      const mid = window.innerHeight / 2;
      const live = new Set(
        [...known.values()]
          .filter((t) => t.lines.length && onScreen.has(t.el))
          .map((t) => ({ t, d: Math.abs(t.el.getBoundingClientRect().top + t.el.offsetHeight / 2 - mid) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, limit)
          .map((x) => x.t),
      );
      known.forEach((t) => {
        t.live = live.has(t);
        t.el.toggleAttribute("data-tech", t.live);
      });
      setTargets([...live]);
    };

    const measure = (el: HTMLElement): Line[] => {
      const box = el.getBoundingClientRect();
      if (!box.width) return [];
      const lines: Line[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => ((n.parentElement?.closest("[data-tech-host]") ? NodeFilter.FILTER_REJECT : n.textContent?.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      const range = document.createRange();
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        const st = getComputedStyle(node.parentElement as HTMLElement);
        const size = parseFloat(st.fontSize);
        const spacing = st.letterSpacing === "normal" ? 0 : parseFloat(st.letterSpacing) / size;
        const text = node.textContent ?? "";
        // walk the characters and cut the text where the browser broke the line
        let start = 0;
        let rect: DOMRect | null = null;
        const flush = (end: number) => {
          const part = text.slice(start, end);
          const trimmed = part.trim();
          if (!trimmed || !rect) return;
          range.setStart(node!, start + part.indexOf(trimmed));
          range.setEnd(node!, start + part.indexOf(trimmed) + trimmed.length);
          const r = range.getBoundingClientRect();
          const width = r.width / 0.88;
          const height = Math.max(r.height, size * 1.5);
          lines.push({
            key: `${lines.length}:${trimmed}`,
            text: trimmed,
            left: r.left - box.left - width * 0.05,
            top: r.top - box.top + r.height / 2 - height / 2,
            width,
            height,
            color: st.color,
            size,
            weight: st.fontWeight,
            family: st.fontFamily,
            spacing,
          });
        };
        for (let i = 0; i < text.length; i++) {
          if (/\s/.test(text[i])) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const r = range.getBoundingClientRect();
          if (!r.height) continue;
          if (rect && Math.abs(r.top - rect.top) > size * 0.5) {
            flush(i);
            start = i;
          }
          if (!rect || Math.abs(r.top - rect.top) > size * 0.5) rect = r;
        }
        flush(text.length);
      }
      return lines;
    };

    const eligible = (el: HTMLElement) =>
      !el.closest(SKIP) && !DIGITS.test(el.textContent ?? "") && !!el.textContent?.trim() && !el.parentElement?.closest(SELECTOR.replace(/main /g, ""));

    const refresh = (el: HTMLElement) => {
      const t = known.get(el);
      if (!t) return;
      if (!el.isConnected) {
        known.delete(el);
        return;
      }
      t.lines = el.getClientRects().length ? measure(el) : [];
    };

    const adopt = (el: HTMLElement) => {
      if (known.has(el) || !eligible(el)) return;
      // a heading that is still rising into place is measured once it has settled
      const settle = el.getAnimations({ subtree: true }).filter((a) => a.effect?.getComputedTiming().iterations !== Infinity);
      const start = () => {
        if (!el.isConnected || known.has(el)) return;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        const host = document.createElement("span");
        host.setAttribute("data-tech-host", "");
        host.setAttribute("aria-hidden", "true");
        host.className = "tech-host";
        el.appendChild(host);
        const t: Target = { id: ids++, el, host, lines: [], interactive: !el.closest("a"), live: false };
        known.set(el, t);
        refresh(el);
        ro.observe(el);
        view.observe(el);
        mo.observe(el, { childList: true, characterData: true, subtree: true });
        publish();
      };
      if (settle.length) Promise.all(settle.map((a) => a.finished)).then(start, start);
      else start();
    };

    const scan = () => {
      raf = 0;
      if (dead) return;
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.getClientRects().length) adopt(el);
      });
      known.forEach((_, el) => refresh(el));
      publish();
    };
    const later = () => { if (!dead && !raf) raf = requestAnimationFrame(scan); };

    const ro = new ResizeObserver((entries) => {
      entries.forEach((e) => refresh(e.target as HTMLElement));
      publish();
    });
    const mo = new MutationObserver((records) => {
      const touched = new Set<HTMLElement>();
      records.forEach((r) => {
        if ((r.target as Element).closest?.("[data-tech-host]") || (r.target.parentElement?.closest("[data-tech-host]"))) return;
        const el = (r.target instanceof HTMLElement ? r.target : r.target.parentElement)?.closest<HTMLElement>("[data-tech]");
        if (el) touched.add(el);
      });
      touched.forEach((el) => refresh(el));
      if (touched.size) publish();
    });
    const theme = new MutationObserver(later);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const first = window.setTimeout(scan, 300);
    document.fonts?.ready.then(later);
    const off = onBookState(() => window.setTimeout(later, 60));
    window.addEventListener("resize", later);
    const view = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target as HTMLElement) : onScreen.delete(e.target as HTMLElement)));
      publish();
    });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && later()));
    document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));

    return () => {
      dead = true;
      window.clearTimeout(first);
      cancelAnimationFrame(raf);
      off();
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      view.disconnect();
      theme.disconnect();
      window.removeEventListener("resize", later);
      known.forEach((t) => {
        t.host.remove();
        t.el.removeAttribute("data-tech");
      });
      setTargets([]);
    };
  }, [lang, low]);

  return (
    <>
      {targets.map((t) =>
        createPortal(
          t.lines.map((l, i) => (
            <span
              key={l.key}
              className="tech-line"
              style={{ left: l.left, top: l.top, width: l.width, height: l.height, color: l.color, fontFamily: l.family, pointerEvents: t.interactive ? "auto" : "none" }}
            >
              <TechText
                text={l.text}
                fontFamily={l.family}
                fontWeight={Number(l.weight) || 600}
                fontSize={l.size}
                letterSpacing={l.spacing}
                color="currentColor"
                accentColor="#4cc97a"
                align="left"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                strokeWidth={Math.max(1, l.size / 60)}
                lineStyle="dashed"
                specks={12}
                selection
                labels={false}
                draggable
                clickKick
                bounce={0.4}
                sweep={i === 0 /* one light per heading, on its first line; the others answer to the pointer */}
                speed={0.8}
                reach={200}
                softness={0.7}
                intro="assemble"
                introDuration={1.4}
                guides={false}
                style={{ width: "100%", height: "100%" }}
              />
            </span>
          )),
          t.host,
          `tech-${t.id}`,
        ),
      )}
    </>
  );
}
