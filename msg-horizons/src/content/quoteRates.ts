/**
 * The rates the plan builder does NOT have yet. MSG's supplied rate card (content/redsea.ts) covers 1 kg next-day
 * delivery only. Every item below is quoted by MSG until a number is filled in here; the moment a value is set,
 * the plan builder prices that line live and adds it to the total. Leave a value null to keep "confirmed by MSG".
 *
 * All values are SAR, excluding VAT.
 */
export type ExtraRates = {
  /** fee per cash-on-delivery order (collection, reconciliation, remittance) */
  codPerOrder: number | null;
  /** extra per order for same-day instead of next-day */
  sameDayPerOrder: number | null;
  /** extra per order above the 1 kg rate, by parcel profile ("small" is the 1 kg base) */
  mixedPerOrder: number | null;
  bulkyPerOrder: number | null;
  /** flat monthly storage and fulfilment charge when MSG holds stock */
  storageMonthly: number | null;
  /** per returned (undelivered) order */
  returnPerOrder: number | null;
};

export const EXTRA_RATES: ExtraRates = {
  codPerOrder: null,
  sameDayPerOrder: null,
  mixedPerOrder: null,
  bulkyPerOrder: null,
  storageMonthly: null,
  returnPerOrder: null,
};
