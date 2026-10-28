# AGENTS.md

Interactive, photoreal 3D anatomy of a 1959 Gibson Les Paul. Static site, Three.js, TypeScript, Vite, deployed to GitHub Pages.

## Commands

- `npm run dev` — local dev server.
- `npm run check` — the gate: typecheck, unit tests, production build.
- `npm run preview -- --port 4173` — serve the production build.

## Where to look

- **Vocabulary:** `GLOSSARY.md`. Use these words in code, tests, issues, and UI.
- **Why the product is shaped this way:** `docs/design-brief.md`.
- **Architecture decisions:** `docs/adr/`. Read before changing the renderer, the part model, or deployment.
- **Review rules:** `CODING_STANDARDS.md`.
- **Issue workflow:** `docs/agents/issue-tracker.md`.

## Working agreements

- One ticket at a time from the task graph. Read the ticket before touching code; comment the resolution on the issue.
- The **Part Registry** is the one semantic seam. New teachable content goes there, never in a mesh builder.
- Geometry and materials are procedural. Keep the bundle free of downloaded models, textures, fonts, and runtime network calls.
- `npm run check` must pass before a commit is reported done.
- Visual changes need a screenshot under `docs/screenshots/` and a note in the PR evidence.
- Keep the instrument's trademark disclaimer in the footer.
