# 0004 — Static GitHub Pages deployment from Actions

The site is a static bundle published to GitHub Pages by a GitHub Actions workflow. Vite uses a relative base so the same build works at the apex, at `/les-paul-3d-explorer/`, and from a local file server.

There is no runtime API, analytics, font CDN, or texture CDN. The page must make no network requests after loading its own bundle. This keeps the teaching page fast, private, and deployable from the repository alone; the trade-off is that all content ships with the JavaScript bundle.

**Status:** accepted
