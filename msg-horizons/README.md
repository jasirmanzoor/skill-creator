# MSG Horizons: website

An interactive digital experience for **MSG Horizons**, a last-mile delivery and logistics company
based in Riyadh. It is bilingual (English / Arabic RTL), built on Next.js 16 and deployed on Vercel.

## What's inside
| Section | Purpose |
|---|---|
| Hero: "Every dot is a courier" | 1,000 dots (one per courier) assemble into Saudi Arabia from Riyadh HQ, with 100 vehicle trails and a 24/7 sweep |
| Planner: "What are you trying to move?" | Four-step configurator → a shareable MSG configuration (no pricing) → WhatsApp or lead form |
| Sellers | Approachable "this is for me" path for individual sellers, startups and growing stores |
| Services | The seven promoted services (Customs Clearance is excluded by instruction) |
| Fleet & operations | 100+ vehicles, a live Riyadh 24/7 dial, fleet visuals (swap in real photos via `media.ts`) |
| Enterprise | Workforce pipeline, scroll-driven peak-demand flow, governance |
| Proof | Key metrics, partners, 10 pillars, vision |
| Contact | Lead form with a WhatsApp/email fallback, WhatsApp, phone, email, HQ |

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
