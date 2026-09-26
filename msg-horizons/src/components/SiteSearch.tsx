"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { buildSearchIndex, searchSite } from "@/lib/site-search";
import type { Dictionary } from "@/content/i18n";

export default function SiteSearch({
  t,
  inverted,
}: {
  t: Dictionary;
  inverted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(() => buildSearchIndex(t), [t]);
  const hits = useMemo(() => searchSite(index, q), [index, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if ((meta && e.key.toLowerCase() === "k") || (e.key === "/" && !isTyping(e))) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (href: string, id: string) => {
    track("search_select", { q, id });
    setOpen(false);
    setQ("");
    window.location.hash = href.replace("#", "");
  };

  const triggerCls = inverted
    ? "text-white/80 hover:text-white"
    : "text-muted hover:text-ink";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("search_open", { location: "header" });
        }}
        className={`inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[15px] transition-colors ${triggerCls}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t.search.openShortcut}
      >
        <SearchGlyph className="size-4" />
        <span className="hidden xl:inline">{t.search.label}</span>
        <kbd className="hidden rounded border border-current/20 px-1.5 py-0.5 text-[11px] tracking-wide opacity-60 xl:inline">
          /
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/50 px-4 pt-[12vh] backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.search.label}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-paper shadow-[0_24px_80px_-24px_rgba(12,14,17,0.45)]"
          >
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (hits[0]) go(hits[0].href, hits[0].id);
              }}
              className="flex items-center gap-3 border-b border-line px-4"
            >
              <SearchGlyph className="size-5 shrink-0 text-faint" />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.search.placeholder}
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 min-w-[30ch] flex-1 bg-transparent text-base text-ink outline-none placeholder:text-faint"
                aria-label={t.search.label}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted hover:text-ink"
              >
                {t.nav.close}
              </button>
            </form>
            <p className="px-4 pt-3 text-xs text-faint">{t.search.hint}</p>
            <ul className="max-h-[50vh] overflow-y-auto p-2 pb-3">
              {q.trim().length >= 2 && hits.length === 0 && (
                <li className="px-3 py-6 text-sm text-muted">{t.search.empty}</li>
              )}
              {hits.map((hit) => (
                <li key={hit.id}>
                  <a
                    href={hit.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(hit.href, hit.id);
                    }}
                    className="block rounded-lg px-3 py-2.5 hover:bg-subtle"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand">
                      {hit.group}
                    </span>
                    <span className="block font-medium text-ink">{hit.title}</span>
                    <span className="block text-sm text-muted">{hit.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" strokeLinecap="round" />
    </svg>
  );
}
