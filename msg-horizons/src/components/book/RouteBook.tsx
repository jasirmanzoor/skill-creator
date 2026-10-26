"use client";

import { useEffect, useState } from "react";
import { fmt, type Locale } from "@/content/i18n";
import { bookCopy, CHAPTERS } from "@/content/chapters";
import { BOOK_GO, bookTime, chapterProgress, publishState, type GoOptions } from "@/lib/book";
import { pageTop } from "@/lib/journey";
import { scrollToY } from "@/lib/scroller";
import { track } from "@/lib/analytics";

const QUERY = "(prefers-reduced-motion: reduce)";
const TYPING = "input, textarea, select, [contenteditable=''], [contenteditable='true']";

/**
 * The book's spine. The homepage's chapters (components/book/Chapter) are all in the HTML, so search engines and
 * visitors without JavaScript read the whole page; with JavaScript one chapter is open at a time and the others wait
 * (`html.book [data-chapter]:not([data-current])` in globals.css).
 *
 * Turning a page: the open chapter lifts off its spine and turns away in 3D, uncovering the next one underneath
 * (View Transitions; see `[data-turn]` in globals.css). Back turns it over again. In Arabic the book opens from the
 * right. Browsers without View Transitions, and visitors who prefer reduced motion, get a soft cross-fade.
 *
 * Every way of asking for a place lands through here: any #link on the page (header, menu, buttons, the rail), goTo()
 * from code, the ] and [ keys, the browser's back button (each chapter is a history entry), and a shared link.
 */
export default function RouteBook({ lang }: { lang: Locale }) {
  const c = bookCopy[lang];
  const [said, setSaid] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const pages = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    if (!pages.length) return;
    root.classList.add("book");
    const total = pages.length;
    const idOf = (i: number) => pages[i].dataset.chapter ?? "";
    let index = Math.max(0, pages.findIndex((p) => p.hasAttribute("data-current")));
    const reduce = () => window.matchMedia(QUERY).matches;

    const measure = () => {
      const max = root.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      chapterProgress.set(f);
      bookTime.set(total > 1 ? Math.min(1, (index + f * 0.7) / (total - 1)) : 0);
    };
    const publish = () => {
      root.dataset.openChapter = idOf(index);
      publishState({ index, total, id: idOf(index) });
      measure();
    };

    const jump = (y: number) => window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: "instant" });
    const targetY = (target: HTMLElement | null) => (target && !pages.includes(target) && target.id !== idOf(index) ? pageTop(target) - 64 : 0);

    const show = (n: number) => {
      pages.forEach((p, i) => p.toggleAttribute("data-current", i === n));
      index = n;
    };

    const go = (to: number, target: HTMLElement | null, { immediate = false, focus = true, push = true }: GoOptions & { push?: boolean } = {}) => {
      const n = Math.max(0, Math.min(total - 1, to));
      if (n === index) {
        // already open: travel within the page
        scrollToY(target ? targetY(target) : 0, { immediate: immediate || reduce(), force: true });
        return;
      }
      const dir = n > index ? "next" : "prev";
      const hash = target && target.id && target.id !== idOf(n) ? target.id : idOf(n);
      if (push) history.pushState({ chapter: n }, "", n === 0 && hash === idOf(0) ? location.pathname + location.search : `#${hash}`);
      const swap = () => {
        show(n);
        jump(targetY(target));
        publish();
        // maps, canvases and observers in the newly opened chapter measure themselves again
        window.dispatchEvent(new Event("resize"));
        if (focus) pages[n].focus({ preventScroll: true });
      };
      setSaid(fmt(c.opened, { n: n + 1, total, title: CHAPTERS[n]?.title[lang] ?? "" }));
      track("cta_click", { cta: "chapter", location: idOf(n) });
      if (immediate || reduce() || typeof document.startViewTransition !== "function") {
        swap();
        if (!immediate) pages[n].animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce() ? 0 : 380, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
        return;
      }
      root.dataset.turn = dir;
      const t = document.startViewTransition(swap);
      t.finished.finally(() => { if (root.dataset.turn === dir) delete root.dataset.turn; });
    };

    // where an element lives: the chapter that holds it
    const resolve = (id: string) => {
      const el = id ? document.getElementById(id) : null;
      const byChapter = pages.findIndex((p) => p.dataset.chapter === id);
      if (byChapter >= 0) return { n: byChapter, el: el ?? pages[byChapter] };
      const page = el?.closest<HTMLElement>("[data-chapter]");
      return page ? { n: pages.indexOf(page), el } : null;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const hit = resolve(decodeURIComponent(url.hash.slice(1)));
      if (!hit) return;
      e.preventDefault();
      go(hit.n, hit.el);
    };
    const onGo = (e: Event) => {
      const { id, ...opts } = (e as CustomEvent<{ id: string } & GoOptions>).detail;
      const hit = resolve(id);
      if (hit) go(hit.n, hit.el, opts);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.(TYPING)) return;
      if (document.documentElement.classList.contains("push-open")) return;
      const onPage = document.activeElement === document.body || pages.includes(document.activeElement as HTMLElement);
      const rtl = root.dir === "rtl";
      let step = 0;
      if (e.key === "]") step = 1;
      else if (e.key === "[") step = -1;
      else if (onPage && e.key === "ArrowRight") step = rtl ? -1 : 1;
      else if (onPage && e.key === "ArrowLeft") step = rtl ? 1 : -1;
      if (!step) return;
      e.preventDefault();
      go(index + step, null);
    };
    const onPop = () => {
      const hit = resolve(decodeURIComponent(location.hash.slice(1)));
      go(hit ? hit.n : 0, hit ? hit.el : null, { push: false });
    };

    // arriving: a #link, a shared plan, or a service page's "build a plan" link opens on its chapter
    const q = new URLSearchParams(location.search);
    const arrive = resolve(decodeURIComponent(location.hash.slice(1))) ?? (q.has("plan") || q.has("persona") ? resolve("planner") : null);
    if (arrive && arrive.n !== index) go(arrive.n, arrive.el, { immediate: true, focus: false, push: false });
    else if (arrive?.el) requestAnimationFrame(() => jump(targetY(arrive.el)));
    publish();

    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure(); }); };
    document.addEventListener("click", onClick);
    window.addEventListener(BOOK_GO, onGo);
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener(BOOK_GO, onGo);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [c.opened, lang]);

  return <p className="sr-only" aria-live="polite">{said}</p>;
}
