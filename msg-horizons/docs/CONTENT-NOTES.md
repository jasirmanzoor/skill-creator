# Content notes: verification log

All company claims on the site come from `MSG_Horizons_Source_Material_Pack.md` and live in
`src/content/facts.ts`. This file tracks what was deliberately **left out**, what **conflicts**,
and what needs **confirmation** before it can be used.

## Needs confirmation from MSG
| Item | Why | Where it would appear |
|---|---|---|
| WhatsApp on +966 55 895 1422 | The source lists this as the phone number. The site assumes it also receives WhatsApp (`wa.me/966558951422`). | Every WhatsApp CTA |
| Lead delivery destination | The form needs `LEAD_WEBHOOK_URL` and/or `RESEND_API_KEY` set in Vercel. Until then it hands leads off to WhatsApp or email (no lead is lost). | Contact form |
| Partner display | AJEX, Keeta, iMile, Logistiqa and J&T Express are shown as **text** under "Valued partners", exactly as the 2026 profile lists them. Logos need each partner's permission. | Proof section |
| Arabic company name | The source spells it "مسج هورايزونز". Please confirm that is the official Arabic trade name. | Footer, JSON-LD |

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
