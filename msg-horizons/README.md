# MSG Horizons: website

An interactive digital experience for **MSG Horizons**, a last-mile delivery and logistics company
based in Riyadh. It is bilingual (English / Arabic RTL), built on Next.js 16 and deployed on Vercel.

## What's inside
| Moment | Purpose |
|---|---|
| Horizon backdrop | A real desert horizon fixed behind the page, with "MSG" standing on it as a sand-toned landmark. The camera pushes in on scroll, and the scene moves from day to golden hour, dusk and night (the 24/7 story) |
| Hero | The brand in the sky, the message on the sand; the "Who are you?" quick-start opens the planner |
| Network panel | 1,000 dots (one per courier) and tracking-style vehicle markers from Riyadh HQ, with rolling counters |
| Interludes | Full-screen, pinned statements that reveal line by line (verified facts only); the landmark steps out of frame |
| Planner | Four-step configurator with a live preview → a shareable MSG configuration (no pricing) → WhatsApp or lead form |
| Sellers, Services, Fleet | Approachable seller path, a service index with key facts, and a live Riyadh 24/7 clock |
| Enterprise (dusk) | Workforce pipeline, scroll-driven peak-demand flow, governance |
| Proof | Metrics, 10 pillars, vision |
| Contact (night) | Lead form with a WhatsApp/email fallback, plus WhatsApp, phone, email and HQ |

## Design system
Light, editorial, industrial: paper and ink, one cobalt brand colour (tokens in `src/app/globals.css`;
swap `--color-brand*` for MSG's official colour), Inter Tight and Inter, and IBM Plex Sans Arabic.
Motion uses [Motion](https://motion.dev) and [NumberFlow](https://number-flow.barvian.me) (both MIT).
All motion respects `prefers-reduced-motion`, and all content stays legible without JavaScript.

## Content rules
- **All facts** live in `src/content/facts.ts` (traceable to the source pack).
- Copy lives in `src/content/dictionaries/en.ts` and `ar.ts` (same shape, type-checked).
- Unverified or conflicting items are tracked in `docs/CONTENT-NOTES.md`.
- The innovation rationale is in `docs/INNOVATION.md`.

## Develop
```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm test
npm run build && npx next start -p 3100 &
BASE_URL=http://localhost:3100 npm run test:e2e      # e2e + axe accessibility audit
BASE_URL=https://msg-horizons.vercel.app npm run test:e2e   # verify production (honeypot lead, never delivered)
```

## Environment variables (Vercel → Project → Settings → Environment Variables)
See `.env.example`.
- `NEXT_PUBLIC_SITE_URL`: canonical domain (used for SEO tags, sitemap and Open Graph).
- `LEAD_WEBHOOK_URL` and/or `RESEND_API_KEY` (+ `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`): where form leads go.
  **Until one is set, the form hands leads off to WhatsApp or email**, so none are lost.
- `NEXT_PUBLIC_VERCEL_ANALYTICS=1`: loads Vercel Web Analytics and Speed Insights. **First enable both in
  Vercel → Project → Analytics / Speed Insights**, otherwise their scripts 404.
- `NEXT_PUBLIC_GA_ID` (optional): GA4.

## Analytics events
`cta_click`, `planner_step`, `planner_complete`, `plan_share`, `lead_submit`, `whatsapp_click`,
`lang_switch`. These are sent to Vercel Analytics and `window.dataLayer` (GA4/GTM).

## Adding real photography
Put the images in `public/media/<group>/` and register them in `src/content/media.ts` with EN/AR alt text.
The gallery appears automatically, and the first fleet photo replaces the illustration.

## Structure
```
src/app/[lang]/        pages (en, ar), layout (SEO, JSON-LD, fonts), OG image
src/app/api/lead/      lead intake (validation, rate limit, webhook/email)
src/proxy.ts           "/" → /en or /ar by Accept-Language
src/components/        sections, hero canvas, planner, enterprise visuals
src/content/           facts, dictionaries, media manifest
src/lib/               planner engine, lead validation, analytics, KSA geometry
tests/unit, tests/e2e  node:test unit tests; Playwright + axe e2e suite
```
