"use client";

/**
 * Types a phrase, holds it, deletes it and types the next, with a blinking cursor. After Framer's
 * TypewriterEffect (type → pause → delete → pause → next word).
 *
 * Changes from the original: the first phrase is rendered in full on the server, so a headline is never empty;
 * the loop starts after a hold and runs only while on screen and the tab is visible; screen readers get the first
 * phrase as plain text instead of a live region spelling out every letter; reduced motion keeps the first phrase;
 * text is sliced by character, not UTF-16 unit, so Arabic marks stay whole; the cursor blinks in CSS.
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

type Props = {
  words: string[];
  /** ms per typed character (the original's default is 100) */
  typingSpeed?: number;
  /** ms per deleted character (the original's default is 60) */
  deletingSpeed?: number;
  /** ms a finished phrase is held before it is deleted */
  hold?: number;
  /** ms of empty line before the next phrase starts */
  gap?: number;
  cursorClassName?: string;
  className?: string;
};

export default function Typewriter({ words, typingSpeed = 70, deletingSpeed = 38, hold = 2400, gap = 350, cursorClassName, className }: Props) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLSpanElement>(null);
  const chars = words.map((w) => Array.from(w));
  const [word, setWord] = useState(0);
  const [count, setCount] = useState(chars[0]?.length ?? 0);
  const [deleting, setDeleting] = useState(false);
  const [live, setLive] = useState(false);

  // run only while the line is on screen and the page is visible
  useEffect(() => {
    const el = box.current;
    if (!el || reduce || words.length < 2) return;
    let seen = false;
    const sync = () => setLive(seen && !document.hidden);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [reduce, words.length]);

  useEffect(() => {
    if (!live) return;
    const full = chars[word].length;
    let delay: number;
    let next: () => void;
    if (!deleting && count < full) { delay = typingSpeed; next = () => setCount((n) => n + 1); }
    else if (!deleting) { delay = hold; next = () => setDeleting(true); }
    else if (count > 0) { delay = deletingSpeed; next = () => setCount((n) => n - 1); }
    else { delay = gap; next = () => { setDeleting(false); setWord((i) => (i + 1) % words.length); }; }
    const id = window.setTimeout(next, delay);
    return () => window.clearTimeout(id);
  }, [live, word, count, deleting, typingSpeed, deletingSpeed, hold, gap, words.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = (chars[word] ?? []).slice(0, count).join("");
  return (
    <span ref={box} className={cn("inline", className)}>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true" className="whitespace-pre-wrap">{shown || "​"}</span>
      <span
        aria-hidden="true"
        className={cn(
          "ms-1 inline-block h-[0.86em] w-[0.07em] min-w-[2px] translate-y-[0.1em] rounded-full bg-current align-baseline motion-safe:animate-[tw-blink_1s_steps(1,end)_infinite]",
          cursorClassName,
        )}
      />
    </span>
  );
}
