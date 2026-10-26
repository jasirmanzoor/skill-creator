import { goTo } from "./book";

export const DECK_ID = "deck";
export const DECK_PANELS = ["live-tracking", "planner"] as const;
export type DeckPanel = (typeof DECK_PANELS)[number];

export const isDeckPanel = (id: string): id is DeckPanel => (DECK_PANELS as readonly string[]).includes(id);

/** Bring live tracking or the plan builder into view: the book turns to its chapter (components/book/RouteBook). */
export function focusPanel(id: DeckPanel, immediate = false, _force = false) {
  void _force;
  goTo(id, { immediate });
}
