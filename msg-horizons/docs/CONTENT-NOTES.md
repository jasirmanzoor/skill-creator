# Content notes: verification log

All company claims on the site come from `MSG_Horizons_Source_Material_Pack.md` and live in
`src/content/facts.ts`. This file tracks what was deliberately **left out**, what **conflicts**,
and what needs **confirmation** before it can be used.

## Needs confirmation from MSG
| Item | Why | Where it would appear |
|---|---|---|
| Lead delivery destination | The form needs `LEAD_WEBHOOK_URL` and/or `RESEND_API_KEY` set in Vercel. Until then it hands leads off to WhatsApp or email (no lead is lost). | Contact form |
| Partner display | AJEX, Keeta, iMile, Logistiqa and J&T Express are shown as **text** under "Valued partners", exactly as the 2026 profile lists them. Logos need each partner's permission. | Proof section |

## Confirmed by MSG
- **Arabic company name (10 Oct 2026):** the name is written ام اس جي (three spelled letters), not as a single word. Every Arabic string, the footer and the JSON-LD use it. The second word keeps the spelling already in use; the hub sign writes it without the alef, which MSG has not asked to change.

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
- Sabya: 800 m² logistics centre (updated to 1,000 m² by MSG on 6 Oct 2026, see below); walk-in 29 local / 48 to major cities; 299 a month 17 / 28.
- The price band multiplies monthly shipments by the listed rate. Walk-in applies below 299 a month; the 299 band applies from 299. It makes no other assumption.
- Rates appear only inside `<aside data-rate-card>`. The e2e claims test exempts only those blocks.

Photo slots. MSG supplies these files; no generated stand-ins:
- `public/warehouse.jpg`: the real Sabya warehouse, used in the Sabya card. Until it exists, the card shows a plain sun-toned panel.
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
- Confirmed by MSG: the photos are the **MSG Sabya hub**. The same corrected facade replaces
  `public/photos/msg/warehouse-front.webp`, which had carried the garbled sign since 2 Oct.
- Higher-resolution originals would sharpen the hero on large screens.

## Sabya hub and the iMile outlet (6 Oct 2026, from MSG in chat)
- Sabya hub: 1,000 m² (replaces the earlier 800 m²), MSG's own Hiace vans and in-house drivers, covering around
  300,000 km² including hard mountain passes, bridges and remote villages. In `facts.sabyaHub` and the Sabya card.
- iMile outlet: MSG owns and runs it as an iMile franchise (trademark model). It is a walk-in parcel kiosk and MSG
  delivers to the surrounding district within 5 km. Photo: `public/media/msg/outlet.jpg` (the close-up; the wide shot
  with a readable car plate and neighbouring shops is not used). A torn "shop for transfer" notice left on the glass
  was removed from the photo. The outlet's city is not named until MSG gives it.

## The pitch section, "Why MSG" (7 Oct 2026, from MSG in chat)
- `src/content/pitch.ts`: the problem (products and ideas stall at getting to the customer; hardest part is licences,
  compliance, paperwork, warehousing and labour rules) and MSG's answer, row by row. Wording follows MSG's message of
  6 Oct. "100% compliant" and "6 years" are still not used.

## More Sabya hub photos (12 Oct 2026, supplied by MSG in chat)
- Used: `public/media/msg/hub-aerial.webp` (the hub from the air, Capacity card), `hub-floor.webp` (inside, on the
  map's Store card), `hub-open.webp` (facade with the doors open and the floor lit, the launch sequence's Go live
  step). All three are the Sabya hub, retouched by MSG; their signs read ام اس جي هوريزونز correctly.
- Held back: the wide aerial and the sunset facade. Their retouching garbled the sign ("هوررزونز", "فوريزونز").
  They can be used once the sign is corrected, as was done for the hero facade.

## Hero redesign: the console (15 Oct 2026)
- The opening screen is now MSG's network shown as a control console (`src/components/hero/Command.tsx`). Headline:
  "The Kingdom's delivery network. Already running." The eyebrow carries the search line, "Last-mile delivery and
  logistics across Saudi Arabia".
- Everything on the console is either verified or labelled: the map ("Illustrative network view"), the order card
  ("Illustrative order"; its steps are the ones MSG runs for every order), the price (MSG's rate card, inside
  `aside[data-rate-card]`), and the figures under it from `facts.ts` (1,000+ couriers, 100+ vehicles, SAR 20M+,
  1,000 m² Sabya hub, 24/7). The partner line lists `facts.partners` as text only.
- The facade and interior walk-in left the hero; the facade still opens the "Why MSG" section. The backdrop is
  `hub-aerial.webp`, toned down.

## Leadership outro (12 Oct 2026)
- Portraits go in `public/leadership/ceo.jpg` and `coo.jpg`; each leader appears only once their file exists.
- Portraits and quotes supplied by MSG (12 Oct 2026). CEO: "Turn vision into meaningful progress." COO: "Build with
  purpose, create lasting impact." The portraits are cropped from MSG's quote cards so the text is not shown twice.
  The Arabic quotes are our translation. Names are not yet supplied; the cards show the role only.


## Illustrative dispatch-day images (24 Oct 2026, requested by MSG in chat)
- Four AI-generated images (Figma image generation) in `public/media/illustrative/`: the parked fleet, loading at the
  bay, a van leaving the yard, a doorstep handover. Listed in `src/content/scenes.ts`, shown in the Fleet section.
- MSG chose "labelled, unbranded": no MSG logo or sign was added, every tile carries an "Illustrative" badge, and a
  note under the strip says they are not photographs of MSG's fleet or sites. They stay out of `content/media.ts`.
- The vans show their makers' badges (Toyota, Ford) and the yard scene has unreadable road signs; nothing implies MSG.
- Replace each with MSG's own photo of the same moment when one arrives.

## Perfmix (26 Oct 2026)
MSG asked for "an element of our existing ecommerce business site, perfmix.com". The VAT number printed on perfmix.com is
`corporate.taxId`, so the store is MSG's. perfmix.com is a Salla store whose policy (`frame-ancestors`) lets only Salla frame it,
so it cannot be iframed: `components/sections/Perfmix.tsx` is a native set of three of the store's own category banners
(men's, unisex, alternatives; copied to `public/media/perfmix/`) that link out, in the Company chapter and the footer.
Facts used: name, URL, category links (`facts.ownStore`). Deliberately not repeated: the store's free-shipping banner and promo
code, prices, and any claim about its delivery. The copy "We sell online ourselves, so we know what a seller needs" is an
inference from MSG's own statement and should be confirmed by MSG.

## Rebrand, brand film and new section photos (27 Oct 2026)
- **Brand identity** from MSG's 2026 brand guidelines (PDF supplied by MSG): the parcel-and-arrow mark and the
  "MSG Horizons LOGISTICS" lockups were taken from the PDF's own vector paths into `public/brand/` (navy and white).
  Colours: navy `#1C2C51`, blue `#009DF8`, white; `--color-brand` is the blue deepened to `#006BB6` for AA small text.
  Fonts: Funnel Sans (English), Readex Pro (Arabic). Not changed: the legal name in `facts.ts` (the guidelines' stamp
  reads "MSG Horizons Logistics Co.") and the contact email/phone (the guidelines show mock-up details); confirm first.
- **Brand film** (`reel/`): a 15 s motion piece built from the mark, rendered from code (Playwright, 60 fps, 3-subframe
  motion blur, Web Audio soundtrack). It opens the site and fills the headings (two recoloured "fill" cuts).
- **Section photos** in `public/media/photos/` are generated photographs (Figma image generation), made to look like
  ordinary photos of each section's work: no logos, no readable text. They are not MSG's own photos and stay out of
  `content/media.ts`. The "Your price" plate uses `account.webp` until the online-seller photo is generated.
  Replaced 27 Oct at MSG's request: `sorting.webp` (Enterprise plate: MSG's earlier plate photo, edited in Canva to a
  small crew at one row of sorting tables, no conveyor, no back row). `van-desert.webp` (Live network plate) is MSG's own
  supplied image, with the old green livery replaced by the new lockup. Rule from MSG: no one in a shemagh or thobe shown
  doing labour on the warehouse floor; keep crews small and everything at true scale. The fleet-strip loading photo and
  the tracking photo wait on MSG's own on-ground photographs.
- **Retired** (they carried the old logo): the Toyota Hiace renders and the van photo with the old livery. The real
  hub photographs (warehouse, sorting, team, aerial, outlet) are unchanged and still used in the gallery and profile.
- **Removed sections** at MSG's request ("discard the sections that are not very necessary"): the network photo band,
  the 7-step launch sequence, the Red Sea growth band and the partner constellation (the partner logos remain in the
  strip under the opening). The company profile is now its own chapter.
