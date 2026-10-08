# Product

<!-- impeccable:product-schema 1 -->

> Recorded from the repository (README, `docs/CONTENT-NOTES.md`, `docs/INNOVATION.md`, `src/content/*`) to
> describe the site as it already is. Nothing here was collected in an interview; items marked *(inferred)*
> are read from the code and copy and should be corrected by MSG if wrong.

## Platform

web

## Users

- **Sellers starting or growing online** *(inferred from hero, pitch and seller sections)*: someone with a
  product, an idea or a shop who does not yet have storage, shipping, delivery, cash collection or the
  licences and labour compliance to sell across Saudi Arabia. Often on a phone, often arriving from WhatsApp.
- **Enterprise evaluators** *(inferred from the Enterprise section)*: operations or procurement staff judging
  whether MSG can supply workforce, peak-season capacity and governance.
- Both audiences read in English or Arabic (RTL).

## Product Purpose

The public website of MSG Horizons, a last-mile delivery and logistics company headquartered in Riyadh with a
logistics centre in Sabya. It exists to turn a visitor into a qualified enquiry: they see what MSG runs, get an
approximate price, build a named logistics plan, and hand it to MSG by WhatsApp or the lead form.

## Positioning

MSG already holds the hard parts a new seller cannot assemble alone: licences and compliance, its own
warehouses, its own fleet and in-house drivers, cash collection and returns. The site says this with MSG's own
facilities and numbers, not stock imagery.

## Operating Context

- The first decision is price and fit: the hero quote card and the plan builder answer it before the story does.
- WhatsApp is a primary conversion channel alongside the lead form; until a lead destination is configured the
  form hands off to WhatsApp or email.
- The page is one long route with a stop per section; live tracking and the plan builder share a sideways deck.

## Capabilities and Constraints

- Bilingual EN / AR with full RTL; copy lives in `src/content/dictionaries` and per-feature content files.
- **Every company fact comes from `src/content/facts.ts`** and the source pack. Unverified or conflicting items
  are held back and logged in `docs/CONTENT-NOTES.md`.
- Rates appear only inside `<aside data-rate-card>` blocks; an e2e test enforces this.
- Customs clearance is excluded everywhere by instruction; a test enforces it.
- No SLAs, delivery times or success rates are published. Illustrative visuals are labelled as illustrative.
- Establishment date and growth timeline are unpublished pending a date conflict.
- Content stays legible without JavaScript; motion respects `prefers-reduced-motion`.
- Canonical domain will be `www.msg-horizons.com`; three Vercel addresses currently serve the same site.

## Brand Commitments

- Name: MSG Horizons (Arabic trade name pending confirmation).
- Identity as built: paper and ink neutrals, MSG green as the brand colour, the "Red Sea glass" skin (aqua,
  sea-foam, deep teal) for the network, price and enterprise bands, and a deep-teal primary button.
- Type: Inter Tight (display), Inter (text), IBM Plex Sans Arabic.
- Imagery: MSG's own Sabya hub photographs, retouched and captioned as such; one licensed horizon photograph
  used as atmosphere and never presented as an MSG location.
- Rule from the innovation log: motion has to explain something.

## Evidence on Hand

- Metrics in `facts.ts` (1,000+ couriers, 100+ vehicles, 24/7 operations) and the rate card in
  `src/content/redsea.ts`.
- Real photos in `public/media/msg` and `public/photos/msg`; partner marks in `public/partners`.
- Confirmed partners: iMile, J&T, Keeta, Landmark, AJEX, Naqel, Logistiq.
- Absent and not to be fabricated: testimonials, case studies, named service cities beyond what the source
  supports, SLAs, real fleet photography beyond the supplied files.

## Product Principles

1. Verified facts only; label anything illustrative.
2. Price and plan first, story second.
3. Show MSG's real places and people's work, not generic logistics imagery.
4. Arabic is a first-class reading experience, not a mirror of English.
5. Every lead path ends somewhere real, even with no backend configured.

## Accessibility & Inclusion

The e2e suite runs an axe audit; reduced-motion visitors get the same content in a stacked form. No formal
standard is recorded *(open: confirm WCAG 2.2 AA as the target)*.
