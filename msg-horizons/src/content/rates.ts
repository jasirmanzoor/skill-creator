/**
 * MSG rate card for the live estimator. Every value is null until MSG supplies its real rates.
 * While any required rate is null, the estimator shows the plan and hands pricing to MSG
 * (no invented prices are ever displayed). Fill these in to switch on live cost estimates.
 */
export type RateCard = {
  currency: "SAR";
  /** price per delivered order, by parcel profile */
  perOrder: { small: number | null; mixed: number | null; bulky: number | null };
  /** fee per cash-on-delivery order */
  codPerOrder: number | null;
  /** monthly storage charge when MSG holds stock */
  storageMonthly: number | null;
  /** optional surcharge per order delivered outside Riyadh */
  outsideRiyadhPerOrder: number | null;
};

export const RATES: RateCard = {
  currency: "SAR",
  perOrder: { small: null, mixed: null, bulky: null },
  codPerOrder: null,
  storageMonthly: null,
  outsideRiyadhPerOrder: null,
};
