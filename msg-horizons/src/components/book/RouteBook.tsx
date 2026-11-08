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
 * The book's spine. The homepage's chapters (components/book/Chapter) sit one after another on a single page that
 * scrolls one way only, down. Nothing turns sideways: the open chapter is simply the one you have scrolled into, and
 * the route rail, the mobile bar and the backdrop follow it.
 *
 * Every way of asking for a place lands through here: any #link on the page (header, menu, buttons, the rail), goTo()
 * from code, the ] and [ keys, the browser's back button, and a shared link. Each glides down (or up) the same page.
 */
export default function RouteBook({ lang }: { lang: Locale }) {
  const c = bookCopy[lang];
  const [said, setSaid] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const pages = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    if (!pages.length) return;
    root.classList.add("scroll-book");
    const total = pages.length;
    const idOf = (i: number) => pages[i].dataset.chapter ?? "";
    let index = -1;
    const reduce = () => window.matchMedia(QUERY).matches;

    // the open chapter is the last one whose top has passed the upper third of the screen
    const current = () => {
      const line = window.innerHeight * 0.34;
      let n = 0;
      for (let i = 0; i < total; i++) if (pages[i].getBoundingClientRect().top <= line) n = i;
      return n;
    };
    const measure = () => {
      const n = current();
      const r = pages[n].getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const f = Math.min(1, Math.max(0, -r.top / span));
      chapterProgress.set(f);
      bookTime.set(total > 1 ? Math.min(1, (n + f * 0.7) / (total - 1)) : 0);
      if (n !== index) {
        index = n;
        root.dataset.openChapter = idOf(n);
        pages.forEach((p, i) => p.toggleAttribute("data-current", i === n));
        publishState({ index: n, total, id: idOf(n) });
      }
    };

    // where to land: a chapter lands on its first screen, anything inside one lands just under the header
    const yOf = (el: HTMLElement) => (pages.includes(el) ? pageTop(el) : pageTop(el) - 64);

    const go = (to: number, target: HTMLElement | null, { immediate = false, focus = true, push = true }: GoOptions & { push?: boolean } = {}) => {
      const n = Math.max(0, Math.min(total - 1, to));
      const el = target ?? pages[n];
      const hash = el.id && el.id !== idOf(0) ? el.id : n === 0 ? "" : idOf(n);
      if (push) history.pushState({ chapter: n }, "", hash ? `#${hash}` : location.pathname + location.search);
      setSaid(fmt(c.opened, { n: n + 1, total, title: CHAPTERS[n]?.title[lang] ?? "" }));
      track("cta_click", { cta: "chapter", location: idOf(n) });
      scrollToY(n === 0 && !target ? 0 : yOf(el), { immediate: immediate || reduce(), duration: 1.3, force: true });
      if (focus) pages[n].focus({ preventScroll: true });
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
      const step = e.key === "]" ? 1 : e.key === "[" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      go(current() + step, null);
    };
    const onPop = () => {
      const hit = resolve(decodeURIComponent(location.hash.slice(1)));
      go(hit ? hit.n : 0, hit ? hit.el : null, { push: false });
    };

    // arriving: a #link, a shared plan, or a service page's "build a plan" link opens on its chapter
    const q = new URLSearchParams(location.search);
    const arrive = resolve(decodeURIComponent(location.hash.slice(1))) ?? (q.has("plan") || q.has("persona") ? resolve("planner") : null);
    // once the page has laid itself out (pictures and pinned scenes change its length), land on the place asked for
    if (arrive && (arrive.n > 0 || arrive.el !== pages[0])) window.setTimeout(() => go(arrive.n, arrive.el, { immediate: true, focus: false, push: false }), 120);
    measure();

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
      root.classList.remove("scroll-book");
    };
  }, [c.opened, lang]);

  return <p className="sr-only" aria-live="polite">{said}</p>;
}
