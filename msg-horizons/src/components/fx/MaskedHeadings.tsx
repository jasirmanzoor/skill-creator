"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/content/i18n";
import { onBookState } from "@/lib/book";
import { isTouch, useLowPower } from "@/lib/perf";

type MaskProps = Record<string, unknown> & { text: string };
const MaskedHeading = dynamic<MaskProps>(() => import("./MaskedHeading") as unknown as Promise<{ default: React.ComponentType<MaskProps> }>, { ssr: false });

/** the site's headings: section, scene and card titles */
const SELECTOR = "main h1, main h2, main h3, main .h-section, main .h-display, main .h-scene";
/** figures keep their own type and motion (ui/CountUp) */
const DIGITS = /[0-9٠-٩]/;
/** places that already draw their own words, or where a heading is part of a control */
const SKIP = "[data-tech-skip], [data-mask-skip], .masked-heading, .scroll-expand__title, button, [role=tab], [role=radio], [role=dialog], .flipbook";
/** how many headings are filled at once: the ones on screen, nearest the middle first (each one plays the film) */
const MAX_LIVE = 4;
const MAX_LIVE_TOUCH = 2;

/** the film, recoloured for each ground so the words always read: navy into brand blue on light, white into sky on dark */
export const FILL = {
  ink: { src: "/media/reel/reel-fill-ink.mp4", poster: "/media/reel/reel-fill-ink.jpg" },
  light: { src: "/media/reel/reel-fill-light.mp4", poster: "/media/reel/reel-fill-light.jpg" },
};

type Target = { id: number; el: HTMLElement; host: HTMLElement; text: string; props: Record<string, unknown>; live: boolean };

const luminance = (rgb: string) => {
  const m = rgb.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0, 0, 0];
  return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
};

/**
 * React Bits' MaskedHeading on every heading of the site, words only: the letters become windows onto MSG's brand film
 * (reel/), which drifts behind them and leans away from the pointer, and they scale up into place as they arrive. Each
 * heading keeps its real text in the page (for search, screen readers, translation and layout); the text is made
 * see-through and MaskedHeading sets the same words over it in the heading's own font, size, weight, tracking and
 * alignment. Only headings on screen are filled (a few at a time), so the page stays smooth; the rest are plain type
 * until you reach them. Headings with a figure, Arabic (whose letters join, while the mask cuts one letter at a time),
 * headings inside controls, and weaker devices or visitors who ask for less motion keep their normal type.
 */
export default function MaskedHeadings({ lang }: { lang: Locale }) {
  const [targets, setTargets] = useState<Target[]>([]);
  const low = useLowPower();

  useEffect(() => {
    if (lang === "ar" || low) return;
    const limit = isTouch() ? MAX_LIVE_TOUCH : MAX_LIVE;
    const known = new Map<HTMLElement, Target>();
    const onScreen = new Set<HTMLElement>();
    let ids = 0;
    let raf = 0;
    let dead = false; // set on cleanup, so a late callback cannot bring the headings back

    const style = (el: HTMLElement) => {
      const st = getComputedStyle(el);
      const size = parseFloat(st.fontSize) || 32;
      const width = el.clientWidth || 1;
      const lh = st.lineHeight === "normal" ? 1.15 : parseFloat(st.lineHeight) / size;
      const ls = st.letterSpacing === "normal" ? 0 : parseFloat(st.letterSpacing) / size;
      const ta = st.textAlign === "start" ? (st.direction === "rtl" ? "right" : "left") : st.textAlign === "end" ? (st.direction === "rtl" ? "left" : "right") : st.textAlign;
      const fill = luminance(st.color) > 0.55 ? FILL.light : FILL.ink;
      return { textScale: size / width, weight: Number(st.fontWeight) || 600, tracking: ls, lineHeight: lh, align: ta, src: fill.src, poster: fill.poster };
    };

    const publish = () => {
      const mid = window.innerHeight / 2;
      const live = new Set(
        [...known.values()]
          .filter((t) => onScreen.has(t.el))
          .map((t) => ({ t, d: Math.abs(t.el.getBoundingClientRect().top + t.el.offsetHeight / 2 - mid) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, limit)
          .map((x) => x.t),
      );
      known.forEach((t) => {
        t.live = live.has(t);
        if (t.live) t.props = style(t.el);
        t.el.toggleAttribute("data-masked", t.live);
      });
      setTargets([...live]);
    };

    const eligible = (el: HTMLElement) =>
      !el.closest(SKIP) && !DIGITS.test(el.textContent ?? "") && !!el.textContent?.trim() && !el.parentElement?.closest(SELECTOR.replace(/main /g, ""));

    const adopt = (el: HTMLElement) => {
      if (known.has(el) || !eligible(el)) return;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const host = document.createElement("span");
      host.setAttribute("data-mask-host", "");
      host.setAttribute("aria-hidden", "true");
      host.className = "mask-host";
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      el.appendChild(host);
      known.set(el, { id: ids++, el, host, text, props: {}, live: false });
      view.observe(el);
    };

    const scan = () => {
      raf = 0;
      if (dead) return;
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.getClientRects().length) adopt(el);
      });
      publish();
    };
    const later = () => { if (!dead && !raf) raf = requestAnimationFrame(scan); };

    const view = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target as HTMLElement) : onScreen.delete(e.target as HTMLElement)));
      publish();
    });
    const theme = new MutationObserver(later);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const first = window.setTimeout(scan, 300);
    document.fonts?.ready.then(later);
    const off = onBookState(() => window.setTimeout(later, 60));
    window.addEventListener("resize", later);

    return () => {
      dead = true;
      window.clearTimeout(first);
      cancelAnimationFrame(raf);
      off();
      view.disconnect();
      theme.disconnect();
      window.removeEventListener("resize", later);
      known.forEach((t) => {
        t.host.remove();
        t.el.removeAttribute("data-masked");
      });
      setTargets([]);
    };
  }, [lang, low]);

  return (
    <>
      {targets.map((t) =>
        createPortal(
          <MaskedHeading
            key={t.id}
            tag="span"
            text={t.text}
            mediaType="video"
            src={t.props.src}
            poster={t.props.poster}
            fillScale={1.25}
            parallax={26}
            reveal="scale"
            trigger="view"
            spotlight={false}
            outline={false}
            duration={1.1}
            stagger={0.09}
            drift={18}
            hoverZoom={0}
            align={t.props.align}
            brightness={1}
            saturation={1}
            grayscale={false}
            weight={t.props.weight}
            tracking={t.props.tracking}
            lineHeight={t.props.lineHeight}
            textScale={t.props.textScale}
            style={{ display: "block" }}
          />,
          t.host,
          `mask-${t.id}`,
        ),
      )}
    </>
  );
}
