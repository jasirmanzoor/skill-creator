import { motionValue } from "motion/react";

/**
 * The homepage as a book: its sections are grouped into chapters (content/chapters.ts) and one chapter is open at a
 * time (components/book/RouteBook). Anything can ask for a section by id; the book turns to the chapter that holds it
 * and lands on the section. The route rail, the mobile bar and the backdrop listen to the book's state.
 */
export const BOOK_GO = "msg-book-go";
export const BOOK_STATE = "msg-book-state";

export type BookState = { index: number; total: number; id: string };
export type GoOptions = { immediate?: boolean; focus?: boolean };

/** Ask the book to open the chapter holding `id` (a chapter id or any element id inside it) and land on it. */
export function goTo(id: string, opts: GoOptions = {}) {
  window.dispatchEvent(new CustomEvent(BOOK_GO, { detail: { id, ...opts } }));
}

/** The time of day the backdrop shows: 0 is the cover (bright day), 1 the last chapter (night). Set by the book. */
export const bookTime = motionValue(0);
/** How far the reader is through the open chapter, 0 to 1. Set by the book. */
export const chapterProgress = motionValue(0);

let state: BookState = { index: 0, total: 1, id: "" };
export const bookState = () => state;
export function publishState(next: BookState) {
  state = next;
  window.dispatchEvent(new CustomEvent<BookState>(BOOK_STATE, { detail: next }));
}
export function onBookState(cb: (s: BookState) => void) {
  const on = (e: Event) => cb((e as CustomEvent<BookState>).detail);
  window.addEventListener(BOOK_STATE, on);
  return () => window.removeEventListener(BOOK_STATE, on);
}
