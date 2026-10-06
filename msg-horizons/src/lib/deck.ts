import { pageTop } from "./journey";
import { scrollToY } from "./scroller";

export const DECK_ID = "deck";
export const DECK_PANELS = ["live-tracking", "planner"] as const;
export type DeckPanel = (typeof DECK_PANELS)[number];

export const isDeckPanel = (id: string): id is DeckPanel => (DECK_PANELS as readonly string[]).includes(id);

/** Bring a panel of the deck into view: the deck pans to it and the page scrolls to the deck. */
export function focusPanel(id: DeckPanel, immediate = false) {
  window.dispatchEvent(new CustomEvent("msg-deck", { detail: id }));
  const deck = document.getElementById(DECK_ID);
  if (deck) scrollToY(Math.max(0, pageTop(deck) - 64), { immediate });
}
