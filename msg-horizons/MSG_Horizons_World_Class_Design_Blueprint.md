# MSG HORIZONS | DIGITAL EXPERIENCE BLUEPRINT V3.0

**Project:** MSG Horizons website experience, English + Arabic  
**Creative thesis:** Industrial Intelligence: the human and technical infrastructure behind delivery  
**Deliverable:** A beautifully directed, cinematic, interactive, enterprise-grade website that retains every approved working feature  
**Working method:** Upgrade the most suitable existing codebase, not a blind rebuild  
**Status:** A creative and technical proposal. No repository edits, runtime tests, or deployment are implied by this document.

---

## 0. DECISION RULES AND PROJECT SAFETY

- Review THREE existing candidates before choosing a code baseline: production (`https://www.msg-horizons.com/en`), Reforge V2, and Live-Plus V3. The Vercel previews may require authorized share links. Do **not** claim a comparison you could not perform.
- Compare screenshots, behavior, page speed, functionality, mobile/RTL output, and source control history. The newest branch is not automatically the best.
- Work in a fresh isolated worktree or branch and preserve the previous versions. **Never deploy, push, merge, edit production data, change DNS, or call live customer integrations without explicit approval.**
- Build a protected reference gallery of baseline screenshots and a parity inventory before editing.
- USER-APPROVED ELEMENTS (DO NOT REGRESS): **Build My Plan's smooth, crisp interaction; efficient and relevant photo layouts; controlled scrolling without accidental skipping.**
- REQUESTED RESTORATIONS (MUST IMPLEMENT): **motion and text animations; embedded 21-page company profile / Who We Are / من نحن; radically improved and accessible Q&A.**
- If the studio makes a genuinely better substitution, log it as **IMPROVISED FROM ORIGINAL INSTRUCTIONS**, with reasoning, tradeoffs, and a working fallback.
- No fabricated testimonials, service territories, operational statistics, partner authorizations, GPS tracking capabilities, financials or project photographs.

## 1. EXPERIENCE DESIGN THESIS

**Art direction:** Editorial industrial intelligence. Authentic logistics, deliberate hierarchy, strong compositions, real evidence, polished engineering. Not a generic SaaS/AI aesthetic.

**Brand personality:** operationally capable, technologically mature, direct, trustworthy, grounded in Saudi Arabia. Creative but never decorative at the expense of clarity.

**Sample hero copy for review, NOT a mandatory replacement:**

> One accountable partner. From warehouse floor to final doorstep.
>
> Fleet, facilities, people and logistics operations built around your business.

**User goals:**
1. Understand the company and its actual capabilities within seconds.
2. Verify scale and physical infrastructure without wading through repetitive claims.
3. Explore services and real operating workflows in an interesting manner.
4. Examine the complete company profile.
5. Get a confident answer to a logistics question.
6. Build a logistics plan or make a qualified enterprise enquiry.

**Avoid:** canned bento grids; faux 'AI intelligence' claims; arbitrary gradients; fake live dashboards; 3D decorative objects with no purpose; animation on every line; excessive cards and counters; repeated stats in four places; unrealistic coverage maps; hard scrolling locks.

## 2. DESIGN SYSTEM (PROPOSAL, TO VALIDATE AGAINST EXISTING BRAND)

### Visual tokens
- Midnight ink `#10242D`: headings, brand depth, selective dark scenes.
- Warm porcelain `#F5F4F0`: principal editorial canvas.
- Deep industrial green `#3E625C`: secondary structural emphasis.
- Mist `#D5E2DD`: dividers, quiet surfaces.
- Signal amber `#D4A45C`: sparse navigation/map indicators, **not** a flood of decorative buttons.
- Retain the approved corporate blue if this proposed accent conflicts with official branding. Verify brand lockup before any palette change.

### Typography
- English display: evaluate Satoshi / General Sans (Fontshare) or the current proven site font. One display family and one body family maximum unless a justified editorial exception.
- Arabic: evaluate IBM Plex Sans Arabic or another high-quality, properly licensed Arabic family, with matching optical density and **native** RTL line breaks and punctuation.
- Proposed desktop display 64–88px, tablet 48–64px, mobile 38–48px, adjusted to actual copy length; body generally 16–18px, long-form line length 55–75 characters.
- Avoid four separate display treatments across sections. Use consistent numbers and captions for authentic industrial documentation.

### Grid / geometry
- Desktop: 12-column responsive grid, max content width around 1360px; 24–40px outer gutters; editorial asymmetry is purposeful, not randomness.
- Mobile: single-column composition, comfortable 20–24px edges, no unreadable overlays or tiny controls.
- Use 8px-based spacing rhythm; target generous but never empty vertical sections; tightly aligned baselines; restrained corner radii.
- Buttons: one primary CTA style, one secondary, consistent hover/focus/disabled states. Semantic controls remain visible without animation.

### Images
- Use approved, original MSG warehouse, fleet, employees, outlet and facility photographs. Never reconstruct faces, replace real fleets with fictional fleets, or invent operational facilities.
- Preserve Reforge's effective photo pairings, selections, captions and layout geometry. Image transitions should enhance, not shuffle or replace, this structure.
- Art direction: crop around actual human/workflow activity, natural contrast, purposeful negative space, correct image aspect ratios and accessible alt text.

## 3. HOMEPAGE: STORYBOARD / SECTION-BY-SECTION SPECIFICATION

### SCENE 01 — THE ARRIVAL / HERO
**User question:** Why should I trust MSG with an important operation?

**Composition:** An asymmetrical cinematic hero: large left-aligned headline, carefully selected real operational photo or silent short footage on the right, concise verified descriptor, two actions (Explore our operation / Build my plan). One strong trust signal, not five animated counters.

**Motion:** A 3-beat 1.5–2.2-second opening: (1) brand/lens enters quietly; (2) two headline clauses unveil with a mask (not bouncing letters); (3) authentic photo eases in and CTA becomes available. Replays only when warranted. Do not block interaction during animation.

**Mobile:** Strong still imagery and short headline; shorter entrance. No video-dependent comprehension.

**Acceptance:** Above the fold communicates sector, capability and primary CTA immediately; hero contains no layout shift; text readable at 320–390px; meaningful still version in reduced motion.

### SCENE 02 — CAPABILITIES / SERVICES
**User question:** What can MSG actually do for me?

**Composition:** Three or four grouped capability families, not seven equally weighted generic cards: Delivery & Distribution; Warehousing & Fulfilment; Fleet & Workforce; Operational Support. Link to full service detail pages. Preserve all seven actual service offerings through these groupings and details.

**Motion:** Focused SVG line-routing on active item, masked photo crop reveals, smooth detail transitions. Content remains accessible without hovering.

**Acceptance:** No duplicated description text, all service links work, one obvious route to a tailored plan.

### SCENE 03 — THE NETWORK / SAUDI FOOTPRINT
**User question:** Where and how does MSG operate?

**Composition:** Beautiful custom geographic visualization with verified Riyadh and Sabya locations, actual services and geography. Distinguish own hub coverage from partner/third-party territories. Pair mapped operations with a small operational narrative.

**Motion:** Network routes draw progressively during one short scroll interval. Points highlight on user selection; hover/tap reveals operational details. The visitor can immediately scroll onward.

**Acceptance:** No invented dots, routes, distances, capacities, pins or 'live' activity. Screen-reader accessible alternative table/list. On mobile use a simplified static map with optional drilldown.

### SCENE 04 — INSIDE THE OPERATION / REAL-WORLD PROOF
**User question:** Do these people really have the fleet, warehouse and execution discipline they describe?

**Composition:** Reforge's approved efficient photography layouts. Three editorial stories: physical facility; dispatch and last-mile; workforce and operations. One correctly labeled case example, such as Perfmix, only with verified claims. Strong captions and details over sales adjectives.

**Motion:** Photo reveal on entry, selectively timed sequence of actual operational stages, no arbitrary card flipping or gallery replacement. Keep photographic framing and clarity.

**Acceptance:** Existing approved photo layouts remain intact; all facts have source data; photo loading does not destabilize scroll; images are fast and not recompressed to a visibly degraded state.

### SCENE 05 — WHO WE ARE / من نحن — PROFILE FLIPBOOK
**User question:** Can I inspect the actual company profile and its credentials?

**Composition:** Distinct editorial dark/light stage featuring the **original 21-page company profile in original page order**, book positioned as a hero artifact, with a clear table of contents, thumbnails, full-screen control, page counter, back/forward actions, and a visible PDF download option. Prominent heading in both languages.

**Desktop:** Realistic page turn with pointer drag/swipe, realistic shadow but no excessive folding or rubber physics. Opening the book never hijacks the document scroll.

**Mobile:** Editorial single-page reader defaults; optional page-turn mode if it genuinely works, plus pinch/zoom or accessible zoom, page jump and normal vertical scrolling. Do not shrink a two-page spread until illegible.

**Arabic:** Native RTL control order and reading direction; align pages to the authoritative Arabic profile when available, never simply reverse English-page image order without checking documents.

**Implementation:** Evaluate `react-pageflip` / StPageFlip for the desktop page-turn effect; keep original PDF download. Use Mozilla PDF.js for accessible mobile PDF viewing or fallback where justified. Preview existing profile route, page content and images before selecting renderer.

**Acceptance:** All original pages accounted for; page 1→21 navigable by drag, button and keyboard; mobile reading works; file available offline after download; no invented pages or rewritten credentials; no unapproved document replacement.

### SCENE 06 — ASK MSG / IMMERSIVE Q&A EXPLORER
**User question:** Will MSG solve my specific logistics problem?

**Composition:** One visually striking exploration stage, not an endless accordion. Question topics as a compact topic rail or filter; central answer canvas; authentic small visual proof or animated diagram as appropriate; next questions and one relevant CTA. Search is instantaneous and keyboard accessible.

**Topic families:** Shipping & Coverage; Warehousing & Fulfilment; Fleet & Workforce; Pricing & Settlement; Returns & COD; Enterprise Partnerships; Getting Started.

**Interaction:** On selecting a question, its headline becomes the anchor, answer morphs into view, optional explanatory visual changes, related questions follow. Do not create a complicated node graph for a simple business question. Keep one natural back action, browser history-friendly optional deep links, and full keyboard functionality.

**Content:** Ground the answers in approved company sources and audited policies. Clearly explain terms and caveats. If AI conversational responses are proposed, do not launch them without separate governance and testing.

**Mobile:** Topic chips and vertically stacked answer panel. No side-scrolling trap. Default visible questions remain answerable with JS motion disabled.

**Acceptance:** Fast search; answer transition is interruptible; no claims invented; real question paths complete; everything keyboard accessible; no 'chatbot' deception.

### SCENE 07 — BUILD MY PLAN / CONVERSION
**User question:** Can I get a relevant logistics plan without friction?

**Composition:** **Preserve the user-approved Reforge planner's layout, transitions, validation and business logic.** Do not rebuild the approved interaction simply to use a new animation library. Offer a distinct enterprise contact path. Price quotations must be appropriately qualified and follow existing rate logic.

**Motion:** Builder only uses its existing proven transitions unless a visual regression test and user approval justify changes. A restrained entrance from the preceding Q&A is permitted, but never interferes with builder state or deep-linking.

**Acceptance:** Existing URL query strings such as `?plan=...#contact` remain compatible, input values are preserved, previous/back actions work, Arabic and mobile flows pass, WhatsApp links and enquiries behave as intended, and test runs never notify real customers.

## 4. MOTION LANGUAGE / CHOREOGRAPHY RULES

Motion is a **system** with a hierarchy, not decoration. Values below are **starting specs**, not a universal rule; review them in-browser and adjust for user testing.

| Layer | Use | Proposed timing | Rule |
|---|---|---:|---|
| Micro | Button, hover, focus transitions | 140–220ms | Crisp, interruptible, no hover-only information |
| Interface | Panels, filters, answer switches | 220–400ms | Clear continuity, no delay to task completion |
| Editorial | Masked text/image entrance | 450–800ms | Animate only key elements, never full paragraphs word-by-word |
| Narrative | Geographic lines, scene progress | 600–1200ms or linked to scroll | No scroll hijack, no lock or snap |
| Signature | Initial hero choreography | 1500–2200ms total | One memorable sequence; interaction stays available |

**Scroll rules:** Native scrolling is the baseline. No automatic chapter snapping. No forced full-page sliders. Do not install Lenis if existing scroll smoothness is already approved; evaluate it only if a reproducible problem justifies it. Avoid long pinning, especially on mobile. `prefers-reduced-motion` means transitions are removed or simplified without hiding information.

**Animation engine policy:** Start with the project's existing motion dependencies. Use **Motion for React** for localized interactions and shared layout transitions where useful; add **GSAP + ScrollTrigger** only for the cinematic hero or one storytelling sequence if its capability is warranted. Do not install five overlapping motion systems. Keep all effects composable and cleanup lifecycle-safe.

## 5. CURATED RESOURCE SHORTLIST (HAND THIS TO CLAUDE)

These are direct links to free/open-source core resources, with commercial-use conditions to review at implementation time.

| Design job | Primary resource | Direct URL | Required use or decision |
|---|---|---|---|
| Award-level art-direction reference | Awwwards | https://www.awwwards.com/websites/ | Inspiration ONLY, not copied layouts or source |
| Creative code exploration | Codrops | https://tympanus.net/codrops/ | Examine reference demos; respect per-demo licensing |
| Stable accessible UI foundation | shadcn/ui | https://ui.shadcn.com/ | Reuse only if compatible, avoid wholesale library installation |
| UI transitions | Motion for React | https://motion.dev/docs/react | Micro-interactions, answer transitions, small editorial movement |
| Cinematic scroll choreography | GSAP ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | One or two deliberate narrative scenes; free standard license is not the same as public-domain code |
| Optional specific text effect | React Bits | https://reactbits.dev/ | At most 1–2 bespoke adaptations after reviewing source/license |
| Authentic flipbook | StPageFlip / React wrapper | https://nodlik.github.io/StPageFlip/ ; https://github.com/Nodlik/react-pageflip | Desktop company profile, original page sequence |
| PDF fallback | Mozilla PDF.js | https://mozilla.github.io/pdf.js/web/viewer.html | Robust profile viewing where flipbook is inappropriate |
| Visual regression / interaction QA | Playwright | https://playwright.dev/docs/test-snapshots | Screenshots, mobile emulation, builder regression, RTL QA |
| Speed quality gate | PageSpeed Insights | https://pagespeed.web.dev/ | Validate performance on deploy previews and production |
| Bilingual typography | Google Fonts | https://fonts.google.com/ | Arabic selection, font loading, RTL proofing |
| English editorial fonts | Fontshare | https://www.fontshare.com/ | Verify font license and visual consistency |

**Explicitly NOT default tools:** React Flow for FAQ; Three.js for decorative 3D; Lenis for scrolling; complex React Bits backgrounds; premium paid UI kits; entire template packages. Re-evaluate only when there's a concrete user-experience benefit and compatible stack.

## 6. ENGINEERING & RELEASE GATES

### Audit first, build second
1. Inspect repository and capture `package.json`, routing, CSS/Tailwind, existing motion libraries, i18n, contacts, pricing logic and all deployed branches.
2. Take reference desktop (`1440×900`), tablet (`768×1024`), mobile (`390×844`), small mobile (`360×800`) screenshots at the hero and every main section. Screenshot both English and Arabic.
3. Record scroll patterns and builder behavior from the **user-approved Reforge version** (get a fresh share link if restricted). Maintain a feature inventory including original flipbook and Q&A material.
4. Identify the safest base branch based on measured fidelity and functionality; **do not merge newer branches blindly**. Create an isolated feature branch.
5. Build a **single 60–90 second interactive prototype** consisting of the hero, one narrative scroll section and one small Q&A interaction. Show it to the user and get approval **before** site-wide work.

### Phased delivery
- **P0: Baseline audit + design direction.** Screenshots, visual tokens, dependency map, acceptance plan. No code changes without approval.
- **P1: Hero + motion grammar.** Implement responsive hero and one scroll-linked story. Compare screenshots and performance, obtain approval.
- **P2: Network + operating proof.** Build maps/photography with verified data. Preserve approved photo layouts.
- **P3: Flipbook.** Restore original 21 pages, desktop book, mobile reader, RTL variant, PDF fallback.
- **P4: Q&A Explorer.** Content verification + custom interactive UI + search + accessibility.
- **P5: Integrations and full QA.** Builder unchanged where possible; testing and rollback plan; preview only.

### Required tests
- Navigation: all main anchors and service routes, keyboard and screen reader, visible focus states.
- Responsiveness: no horizontal overflow, collisions or inaccessible actions at 360px, 390px, 768px, 1440px.
- Language: accurate real Arabic translation; native RTL layout and book direction; no mixed-direction broken numbers.
- Motion: no forced snapping/section skipping, no trapped scroll, all effects interruptible, reduced-motion mode works.
- Builder: complete all steps, backward edits, validation, pricing consistency, encoded `plan` query string and `#contact` behavior; forms tested with mocks or staging endpoints only.
- Flipbook: all 21 pages, chapter navigation, keyboard, mobile fallback, download and page-turn performance.
- Q&A: all topics and answers, search, mobile keyboard, truthful text, no dead-end or unapproved claims.
- Media: original photo identities/assets, alt text, lazy load below fold, correct responsive sizes.
- SEO: canonical/hreflang/robots correct; prevent protected previews from being indexed while allowing the actual production pages to be indexed.
- Security: no public secrets, no production mutations, no unsafe external dependencies or analytics leakage.

### Targets
- **Core Web Vitals** at the 75th percentile of real user visits: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Targets, not unverified results.
- **Lighthouse mobile**: strive for ≥90 performance, ≥95 accessibility, ≥95 best practices while maintaining functional quality; scores depend on conditions and should not override real field data.
- No significant measured regressions relative to baseline in bundle size, loading, responsiveness or builder completion.
- No unacceptable visual regressions from approved Reforge imagery or interactions.
- Zero known production-critical broken links, unapproved claims or customer-data side effects.

### Required report format after every phase
1. **BEFORE**: baseline screenshot, URL/commit, identified weakness.
2. **AFTER**: screenshot, URL/commit, precise change.
3. **WHY**: improvement to user goals, not simply 'looks more premium'.
4. **TESTS**: pass/fail, evidence and what wasn't tested.
5. **IMPROVISED FROM ORIGINAL INSTRUCTIONS**: each difference, benefit, cost, fallback.
6. **NEXT APPROVAL**: what you need from the owner before continuing.

## 7. 'STOP WORK' CONDITIONS

Stop, rollback the isolated branch if necessary, and report a blocker if: Build My Plan regresses; photo authenticity/layout deteriorates; users cannot smoothly scroll past scenes; sections disappear; Arabic is broken; original profile pages are missing; real notifications get sent during tests; live production is affected; a demo is misrepresented as live; or motion is causing severe load/performance issues.

## 8. HANDOFF INSTRUCTION TO CLAUDE CODE

Copy or attach this file to the project and give Claude this task:

> Read `MSG_Horizons_World_Class_Design_Blueprint.md` in full. Treat it as the authoritative experience design brief, **not** authorization to immediately rebuild the site. First audit the existing production, Reforge and Live-Plus versions, Git history, installed dependencies and the 21-page company profile. Capture comparable screenshots and functional behavior. Recommend the best baseline and identify the safest implementation plan. Preserve the approved Build My Plan interaction, photo arrangement and controlled scrolling. Restoring sophisticated motion, the flipbook and Q&A is mandatory. Do not modify or deploy production. Deliver only Phase P0 findings and request approval before implementing P1. For every meaningful departure from the brief, label **IMPROVISED FROM ORIGINAL INSTRUCTIONS** with a justification and fallback.

---

### Editorial note
This specification intentionally avoids prescribing excessive effects. It gives the studio a visual language, a compositional rhythm, a narrative order, a motion grammar, production controls and a measurable release gate. That's the difference between an effects-shopping list and a real design blueprint.
