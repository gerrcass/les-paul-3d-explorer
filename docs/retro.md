# Retrospective — Les Paul Anatomy

_October 2026. A review of how this build went, and what should change in the agent environment next time._

## What worked

- **The Part Registry was the right seam.** One typed record drove the scene, tooltip, inspector, index, and tour. The headless `buildLesPaul()` test caught missing meshes and unknown part IDs without a browser, and the registry tests caught copy gaps. This is worth repeating on any scene-plus-UI project.
- **Deciding the architecture before modelling.** ADR-0001 (procedural), ADR-0002 (vanilla Three.js), ADR-0003 (registry), and ADR-0004 (static Pages) removed the big forks before the first mesh existed.
- **Procedural art paid off.** No asset licensing, no download pipeline, a 48–90 KB WebP screenshot, and a 224 KB gzipped bundle. The sunburst and flame are tunable in code.
- **The quality tiers and debug API made verification cheap.** `window.__lesPaul.snap()` made camera screenshots deterministic, and `?quality=` plus the software-renderer check made the page honest on weak machines.

## What cost time

- **Visual iteration on the body outline and pickguard.** Flat screenshots exposed problems that no unit test could. A design brief with the outline points and a browser screenshot loop would have shortened the loop.
- **Headless `hover: none`.** The tooltip CSS originally hid on `(hover: none)`, which is true in the automation browser and is not the same as a touch device. The correct gate is `(hover: none) and (pointer: coarse)`. This is fixed, but it wasted a screenshot round.
- **Background-tab RAF throttling.** Camera tweens looked half-finished in evidence captures. The debug `snap()` (reduced-motion) fixed it. Document this in `docs/agents/verification.md` so the next agent does not diagnose a camera bug that is not there.
- **Port collisions.** Vite auto-incremented from 5173 to 5174 to 5175 as preview servers lingered. Use `--strictPort` and read the printed URL; the verification doc now says so.
- **Screenshot weight.** 1440×1000 PNGs were 1.4–1.6 MB each. WebP at quality 88 reduced the set to ~536 KB. A conversion step belongs in the evidence workflow, not in a later cleanup.

## Environment changes applied

- Added `docs/agents/verification.md` and a pointer from `AGENTS.md`: exact commands, debug API, viewports, and the two browser gotchas.
- Added `npm run check` to CI and kept it as the single local gate (strict typecheck, 22 tests, build).
- Added `CODING_STANDARDS.md` (domain/scene/UI boundaries, resource disposal, test seam, review rules).
- Added robots.txt, sitemap.xml, llms.txt, and OG metadata so the deployed page is legible to crawlers and social cards.

## Still worth doing

- A Playwright smoke test for the pointer path (hover → tooltip, click → pin, Escape → clear, tap → bottom sheet). The headless scene seam is strong; the DOM/pointer seam is only covered by manual screenshots.
- A model-fidelity pass can always go further: book-matched top grain, an exactly historical headstock profile, and a trace on real hardware at 1440p high. The software-renderer sandbox cannot answer the 60 fps question honestly.

## Review gate

Two rounds of two independent subagents (spec/3D, then accessibility/delivery/code) caught a CSS regression that would have hidden the inspector, plus a top/back clipping artifact and several focus/touch defects. The implementation branch was only merged after those reports were compared and the fixes were re-checked. Keep that gate on the next visual project.
