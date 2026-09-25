# Innovation R&D log

> **Current design (v2).** The first dark/amber iteration was retired after review because it read as a
> generic "AI landing page". v2 is light and editorial, and it is built around a real horizon photograph.
> It was benchmarked against Flexport, ShipBob, Stuart, Onfleet, Salasa, Aramex and Naqel.
>
> **Cinematic system (v2):**
> - *One scene, one camera.* A fixed horizon photo is aligned with object-position so the horizon sits at the
>   same viewport height on every device. "MSG" stands on it as a sand-toned land-art landmark with depth, haze,
>   grain and a contact shadow, so it belongs to the photograph.
> - *Dolly.* The camera pushes in toward the horizon over the first screen, and the hero copy lifts away.
> - *A day in one scroll.* Golden hour peaks at Fleet, dusk arrives with Enterprise, and night (with stars and a
>   softly lit landmark) settles over Contact. The keyframes are measured from live section positions.
>   This is the 24/7 story, told without words.
> - *Interludes.* Pinned full-screen statements reveal line by line, and the landmark cuts out of frame.
> - *Network panel.* 1,000 courier dots and tracking-style vehicle markers with delivery pings; no fading trails.
>
> Sections below describe the original R&D; items superseded by v2 are marked.


The rule for this site: **motion has to explain something.** Every interactive element has to either
encode a verified fact or move the visitor toward a decision. Anything that only decorates was cut.

## 1. The opening sequence: "Every dot is a courier" ✅ shipped
**Problem:** "1,000+ couriers, 100+ vehicles, 24/7" as a stat row is forgettable. Stock truck photos are generic.
**Concept:** turn the hero into a literal chart.
- 1,000 dots, **one per courier**, start scattered, then fly into the real shape of Saudi Arabia
  (Natural Earth border, hex-sampled) in a wave radiating from the Riyadh HQ. A counter ticks to 1,000+.
- 100 trails, **one per vehicle**, start moving across the network.
- A sweep circles Riyadh without stopping and lights the network as it passes: **24/7 operations**.
- A legend ("1 dot = 1 courier") turns the effect into something the visitor can read.
- The cursor gently pushes dots aside, so the network feels physical.
**Why this works:** within about 3 seconds the visitor has *seen* the scale rather than read it,
and the visual is honest because each mark maps to a real unit.
**Engineering:** Canvas 2D, about 1,100 primitives per frame, no WebGL dependency (0 KB extra), a
deterministic PRNG, and pausing when offscreen or when the tab is hidden. `prefers-reduced-motion` gets
a static final frame. A replay control is included.

## 2. "What are you trying to move?" planner ✅ shipped
A four-question configurator (who → what → how much → priorities) with a **live configuration panel**
that lights up MSG service modules as the visitor answers. The result is a named operating model
(Launchpad / Growth Engine / Enterprise Network / Capacity Partner). Each module carries the *reason*
it was included. There is no pricing. The plan is shareable (`?plan=` URL), goes to WhatsApp pre-filled,
and is attached to the lead form. The engine is a pure function with unit tests (`src/lib/planner.ts`).

## 3. Enterprise process visualisations ✅ shipped
- **Workforce pipeline:** people (particles) flow Source → Screen → Onboard → Train → On site and change
  state at each gate. Hovering or focusing a stage highlights its gate.
- **Peak demand, scroll-driven:** a pinned chart transforms as the five documented stages scroll past
  (Forecast → Ready → Mobilise → Control → Demobilise). It shows forecast, the standby pool, capacity
  rising to meet the peak, control checks, and the controlled release. It is labelled illustrative.
- **Live 24/7 dial:** the real current time in Riyadh on a fully lit 24-hour ring, with the line
  "…and MSG operations are running."

## Explored and rejected
| Idea | Verdict |
|---|---|
| Three.js / WebGL 3D globe or terrain | Rejected. About 150 KB+ of JS for the same message. The Kingdom is flat at this scale, and 3D would reduce legibility. |
| WebGPU particle field | Rejected. Support is still uneven on iOS Safari (a key audience), and there is no comprehension gain over Canvas 2D at 1,000 particles. |
| Scroll-hijacked full-page storytelling | Rejected. It hurts usability, accessibility and SEO. Only the peak-flow chart is scroll-linked, and it uses native scroll. |
| Named-city route map | Rejected. The source doesn't list served cities, so drawing them would invent coverage. |
| Video hero | Rejected. No verified MSG footage yet. Slot reserved via `media.ts`. |

## Next candidates (need data from MSG)
- Replace the illustrative fleet visual with real fleet and warehouse photography (`media.ts`).
- Once coverage is verified, add named service areas to the hero network.
- Case-study "operations replays" if MSG can share real peak-season data.
