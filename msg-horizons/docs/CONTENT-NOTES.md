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

- **Live tracking (5 Oct 2026, from MSG in chat):** when a delivery is assigned the driver gets a request on their
  phone and must approve it. Once they do, the driver's mobile location is fetched live and shown to the seller or
  client (SMEs and start-ups) and their customer. It is **not** scan-based hub-to-hub tracking. The "Live tracking"
  section (`src/components/live`, copy in `src/content/liveTracking.ts`) states exactly this and nothing more.

## Live tracking: still to confirm with MSG
| Item | Why |
|---|---|
| How the seller and their customer open it | Link, WhatsApp, dashboard or app? The demo shows a generic tracking page. |
| If the driver declines or does not answer | The demo only shows the approve path. |
| When sharing ends | The copy does not say it stops at delivery; confirm before stating it. |
| Update frequency, accuracy and ETA | None are stated. The demo shows no times, distances or ETAs. |
| Consent and privacy wording | The copy says nothing is shared until the driver approves. Confirm the wording and any data-retention terms. |

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
- **"No other provider offers live tracking".** Not provable from the source, so it is not published. The section
  shows the difference (scan updates vs live location) instead of making a claim about anyone else.
- **Pricing, SLAs, delivery times and success rates.** None are in the source. The planner states that
  pricing is tailored and confirmed by MSG.
- **Growth trajectory (2024 Q1 → 2025 Q3).** Held back because of the date conflict above.
- **Fleet types.** Only "last-mile to heavy freight" is described. The fleet illustration shows one van and
  one truck, and is captioned as illustrative.

## Illustrative (clearly labelled as such on the site)
- Live tracking demo: sample places (Olaya to Al Rawdah) and a generic driver app and tracking page. The moving dot loops
  along a sample route; it is not real data. Captioned as an illustrative demo.
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

## Red Sea glass bands (supplied by MSG, 30 Sept 2026)

The skin is "Red Sea glass": daylight aqua, sea-foam, white, silver and deep teal type. It applies to the network band, the price band and the Enterprise section. The copy and rates live in `src/content/redsea.ts`.

- Hero: "You have something to sell. We already have the drivers." The earlier SEO line, "Last-mile delivery across Saudi Arabia", now sits in the h1 eyebrow.
- 1 kg next-day rates, SAR per shipment: walk-in 33 intra-city / 52 inter-city; 299 a month 21 / 30.
- Sabya: 800 m² logistics centre; walk-in 29 local / 48 to major cities; 299 a month 17 / 28.
- The price band multiplies monthly shipments by the listed rate. Walk-in applies below 299 a month; the 299 band applies from 299. It makes no other assumption.
- Rates appear only inside `<aside data-rate-card>`. The e2e claims test exempts only those blocks.

Photo slots. MSG supplies these files; no generated stand-ins:
- `public/warehouse.jpg`: the real Sabya warehouse, used behind "800 m² equipped with all necessary components". Until it exists, the card shows a plain sun-toned panel.
- `public/coast.jpg` (optional): a coastal highway or Corniche shot with a white truck. Until it exists, the network band paints a daylight Red Sea scene around MSG's own car photo.

Open questions for MSG:
- The text partner list is "iMile · J&T · Keeta · Landmark · AJEX". Landmark is new, and it is not among the logo tiles (AJEX, gold tile, Keeta, iMile, Naqel, Logistiqa, J&T). Please confirm Landmark, and whether Naqel and Logistiqa should also be listed.
- The Sabya brief earlier also gave a 500+ a month tier (13 / 22). This lock lists only walk-in and 299, so only those are shown.

Update, 30 Sept 2026 (MSG): walk-in prices are no longer shown separately. The network band's rate table was replaced by a panel that points to the roadmap. The roadmap plan card, the price band and the Sabya card each show one approximate cost per order, read from the rate card at the visitor's volume (`approxCost` in `src/lib/estimate.ts`). The Sabya card shows the 299 a month rates (17 / 28) as its approximate per-order figures.

Update, 30 Sept 2026 (MSG): Naqel, Landmark and Logistiq are confirmed partners. "Logistiq" follows the logo and MSG's spelling; the profile's "Logistiqa" is retired. Text lists now read: iMile · J&T · Keeta · Landmark · AJEX · Naqel · Logistiq.

Domain: the website goes on www.msg-horizons.com only. msg-horizons.com (apex) stays on MSG's Odoo server (5.189.157.17); Google Workspace MX and SPF are unchanged. Once www resolves to Vercel, set NEXT_PUBLIC_SITE_URL=https://www.msg-horizons.com and redeploy. Canonicals, sitemap and hreflang then switch, and msg-horizons.vercel.app 308-redirects to www (next.config.ts).

## Plan builder: what the client sees (6 Oct 2026, from MSG in chat)
- The plan result and the volume step show **a price quote and what is covered**, not the operating matrix. Daily routes,
  courier counts, peak couriers, vehicle mix and pickup/dispatch models are no longer shown to visitors (the sizer still
  runs and the lead sent to MSG's team still carries it). The WhatsApp/email summary lists only what the client entered.
- The four checkpoints in every plan: price quote, proof of delivery, live tracking, cash on delivery remitted on time.
- The six areas MSG handles (src/content/covered.ts): legal, compliant infrastructure (own warehouses, line-haul vehicles
  and delivery fleet, ZATCA-compliant tax filing and VAT paid), licences, people and resources (within labour
  regulations), connectivity and visibility, and a proven record with partners.
- **Not published, needs MSG's decision:** "100% compliant" (an absolute legal claim and a percentage; copy says
  "compliant" instead) and "over 6 years of logistics and last mile". The 6 years conflicts with the establishment date
  above (the profile gives 2024/2025); say whether it refers to the founding team's experience before MSG.

## Warehouse photos in the hero (6 Oct 2026, supplied by MSG in chat)
- Files: `public/media/msg/` (facade, sky layer, sign glow, two inside views), prepared by
  `scripts/prepare-hero-photos.py`. The hero caption says "Real photo, retouched for presentation."
- The retouched facade MSG supplied had garbled the sign (it read "فوريزونز"). The sign is restored from MSG's
  original photo of the same facade, so it reads "ام اس جي هوريزونز" as on the building. Road litter and a stain were
  removed. Nothing was added: no vehicles, signage or structures.
- **Still to confirm:** which site this is (the copy names no city; if it is the Sabya logistics centre, the same photo
  can fill the `warehouse.jpg` slot). Higher-resolution originals would sharpen the hero on large screens.
- **Not used yet:** the two photos of the iMile-branded outlet. They show another company's sign, a readable car
  number plate and neighbouring shops. Confirm MSG runs this outlet for iMile and has permission to show it; the
  plate would be blurred.
