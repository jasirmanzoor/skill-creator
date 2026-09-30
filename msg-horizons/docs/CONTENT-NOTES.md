# Content notes: verification log

All company claims on the site come from `MSG_Horizons_Source_Material_Pack.md` and live in
`src/content/facts.ts`. This file tracks what was deliberately **left out**, what **conflicts**,
and what needs **confirmation** before it can be used.

## Needs confirmation from MSG
| Item | Why | Where it would appear |
|---|---|---|
| Lead delivery destination | The form needs `LEAD_WEBHOOK_URL` and/or `RESEND_API_KEY` set in Vercel. Until then it hands leads off to WhatsApp or email (no lead is lost). | Contact form |
| Partner display | AJEX, Keeta, iMile, Logistiqa and J&T Express are shown as **text** under "Valued partners", exactly as the 2026 profile lists them. Logos need each partner's permission. | Proof section |
| Arabic company name | The source spells it "مسج هورايزونز". Please confirm that is the official Arabic trade name. | Footer, JSON-LD |

## Confirmed by MSG
- **Enquiry and WhatsApp number: 057 806 1556** (`+966578061556`, `wa.me/966578061556`). It replaces the profile's
  +966 55 895 1422 on every call, WhatsApp and structured-data touchpoint.

- **Seller capabilities (29 Sept 2026):** cash on delivery collection, remittance with statements, packaging and
  labelling guidance, returns handling, proof of delivery, serving sellers based outside the Kingdom (once stock is in
  KSA; customs is still not promoted), multiple collection points and damage claims. Copy states the capability only;
  cycles, fees and liability are "as agreed in your contract".
- **Onboarding path:** enquiry → requirements → standard guide → curated recommendations → project agreement →
  testing → go live.
- **Partner logos:** shown as a highlight at MSG's request. Official files in `public/partners/`: J&T Express (Wikimedia
  Commons, public domain), iMile (EN + AR, from imile.com), Keeta (app icon, from keeta-global.com). AJEX and Logistiqa
  appear as name tiles until MSG supplies their files. MSG should hold each partner's permission to display its mark.

## Conflicts (not silently reconciled)
- **Establishment date.** The source gives "11-04-1446 AH (01/12/2025)". 11 Rabiʿ II 1446 AH falls in
  mid-October 2024, not 1 December 2025. The 2026 growth trajectory also starts at "2024 Q1 Foundation".
  Neither the date nor the growth timeline is published until MSG confirms the correct values.

## Deliberately excluded
- **Customs clearance.** Excluded by project instruction. It appears nowhere on the site or in the JSON-LD,
  and an automated test enforces this.
- **Specific cities or regions served.** The source supports "across the Kingdom", "wide regional coverage"
  and "within cities and across regions", but names no cities except the Riyadh HQ. The hero map therefore
  labels only Riyadh HQ, and vehicle trails are abstract.
- **Pricing, SLAs, delivery times and success rates.** None are in the source. The planner states that
  pricing is tailored and confirmed by MSG.
- **Growth trajectory (2024 Q1 → 2025 Q3).** Held back because of the date conflict above.
- **Fleet types.** Only "last-mile to heavy freight" is described. The fleet illustration shows one van and
  one truck, and is captioned as illustrative.

## Illustrative (clearly labelled as such on the site)
- Peak-demand chart: the shape of the curve is illustrative. It is captioned "not actual MSG volumes".
- Planner volume bands (for example "200 – 2,000 a day") are the visitor's self-estimate, not MSG claims.

## Adding new verified material
- **Numbers or facts:** update `src/content/facts.ts` first, then the copy in `src/content/dictionaries/{en,ar}.ts`.
- **Photos:** see `src/content/media.ts`. Adding entries automatically turns on the "On the ground"
  gallery and replaces the illustrative fleet visual.

## Imagery in use
- **Backdrop horizon** (`public/media/brand/horizon-*.jpg`): Unsplash photo `photo-1604954433815-28af57d7501a`
  ("brown sand under blue sky during daytime"), free under the Unsplash License (commercial use allowed,
  no attribution required). It is used purely as an atmospheric landscape and is **not** presented as an MSG
  location, vehicle or operation. It can be swapped for MSG's own horizon or desert photography at any time
  (keep the horizon near 50.8% of the image height, or update `HORIZON` in `HorizonBackdrop.tsx`).

## Sabya Hub (supplied by MSG, 30 Sept 2026)

Locked facts, used verbatim in `src/content/sabya.ts`:
- 800 m² warehouse in the Sabya logistics centre, Jazan region (owned floor): last mile, short-hold storage, northbound line-haul.
- Channel partners on the northbound lane: iMile, J&T, Naqel.
- 1 kg standard rates, SAR per shipment. Sabya local doorstep: 29 walk-in / 17 from 299 a month / 13 from 500+. Sabya ↔ Riyadh, Jeddah, Dammam (line-haul + last mile): 48 / 28 / 22. Same-day or evening: +16 local, +20 northbound.
- COD: 4% (min SAR 8) at low volume; 3% (min SAR 5) from 200+ a month. Returns: SAR 18 flat from 150 shipments a month; otherwise 50% of the delivery rate or SAR 20.

This is the only place on the site that states prices. The e2e "no forbidden claims" test exempts only the `<aside data-rate-card>` block.

Open questions for MSG:
- Returns below 150 a month: "50% or SAR 20". Is that whichever is higher, or whichever is lower? The site shows the wording as given.
- COD "low volume": the site reads this as under 200 shipments a month.
- The market note "mainstream networks add SAR 8–20 surcharges" is a claim about competitors. It is not on the site.
- Does the general estimator keep "Priced by MSG" for now? Its rate card (`src/content/rates.ts`) is still empty. The Sabya rates cover only this lane.
