# Design brief — Les Paul Anatomy

_Output of the `/grill-with-docs` session. The user asked for a challenging objective and delegated every decision, so the recommendations below are recorded as settled._

## The challenge

Prove that a static, dependency-light website can teach the **complete mechanical and electrical anatomy** of a 1959 Gibson Les Paul Standard using a photoreal instrument built entirely from code — every visible part named and explained on hover, the signal path legible end to end, and the whole thing deployable to GitHub Pages.

"Beautiful" is part of the acceptance criteria, not decoration: the model has to read as a real Burst in a studio, not a low-poly diagram.

## Design tree

### Round 1 — Premise

| Question | Decision |
| --- | --- |
| Who is this for? | Curious players, students, and makers who know what a Les Paul looks like but not what each part does. No prior electronics knowledge assumed. |
| What is the one job? | Point at any part and understand its name, purpose, and place in the signal chain within three seconds. |
| Which instrument? | A 1959 Les Paul Standard "Burst": sunburst flamed maple top, mahogany back, cream plastics, nickel hardware, double-cream PAF-style humbuckers, ABR-1 bridge, stopbar tailpiece, 3+3 open-book headstock, 22 frets. |
| Real-time 3D or pre-rendered? | Real-time. Hover, isolate, explode, and a guided signal-path tour are the product. |
| Is it a playable guitar? | No. This is an anatomy explainer. Audio synthesis and amp modelling are out of scope. |

### Round 2 — Implementation

| Question | Decision |
| --- | --- |
| Rendering stack? | Three.js + TypeScript + Vite, vanilla DOM. No React, no R3F: the render loop and DOM UI are both small and direct control keeps the dependency surface honest. |
| Where does the art come from? | Code. All geometry, wood grain, sunburst, cream plastics, metal wear, and the studio environment are procedural. No downloaded models or textures. The repo stays self-contained, deterministic, and licence-clean. |
| How is a "part" represented? | One semantic **Part Registry** shared by the scene, the hover inspector, the parts index, and the guided tour. Meshes carry only a `partId`; all language lives in the registry. |
| What is the primary learning device? | Hover -> tooltip (name + one-line function); click -> pinned inspector (full explanation, material, signal role); guided **Signal Path** tour for the electrical story; **Exploded View** for the mechanical story. |
| Performance budget? | 60 fps at 1440p on integrated graphics at the default quality tier. Dynamic resolution, capped DPR, optional post-processing, and a low tier for weak GPUs. |
| How is it tested? | The highest seam: build the complete guitar headlessly in Node and assert the registry/scene contract, plus pure unit tests for the signal-path tour and part lookup. Browser smoke test and screenshots for visual evidence. |

### Round 3 — Edge cases

| Question | Decision |
| --- | --- |
| Mobile? | Yes. Bottom-sheet inspector, tap-to-pin, one-finger orbit, pinch zoom, parts index behind a button. |
| Keyboard? | Yes. The parts index is a real list; arrow keys move, Enter pins, Escape clears. Focus rings follow the studio palette. |
| Reduced motion? | Yes. Camera moves become cuts, the intro sequence is skipped, pulse animations stop. |
| Quality fallback? | Three tiers (high / balanced / lite), auto-selected from GPU hints and overridable in the UI. Post-processing and shadows drop first. |
| Offline / failed WebGL? | The page explains the failure and still renders the parts index and signal path as text. No runtime network calls. |
| Trademark? | Educational fan project; a clear "not affiliated with Gibson Brands" disclaimer sits in the footer. The instrument is depicted, not branded as merchandise. |

### Round 4 — Delivery

| Question | Decision |
| --- | --- |
| Branching? | One integration branch, one ticket at a time, then a single PR to `main`. |
| Evidence? | Screenshots of hero, hover, pinned inspector, exploded view, signal-path tour, and mobile; attached to the PR with `gh --attach` and committed under `docs/screenshots/`. |
| Definition of done? | All tickets closed, CI green, Pages URL live, README has the live link and a representative screenshot, no open PRs or issues left behind. |

## Non-goals

- Playable audio, amp/cab simulation, or recording.
- Historically exhaustive model-year variants, left-handed models, or custom shops.
- AR/VR, WebGPU-only paths, or external 3D asset pipelines.
- User accounts, persistence, or a backend.
