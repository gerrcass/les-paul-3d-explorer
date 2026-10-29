# Verifying the site

## Fast path

```bash
npm run check
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/` and confirm `document.body.dataset.ready === 'true'` and `window.__lesPaul.state()` reports the expected part/tour state.

The production build uses a relative base, so the same check works when the bundle is served from a subdirectory.

## Browser evidence

The debug API is available on `window.__lesPaul` in development, or in a production build with `?debug` on the URL:

```js
__lesPaul.snap()                 // make camera moves instant for deterministic shots
__lesPaul.select('maple-top')    // pin and frame a part
__lesPaul.hover('maple-top', 770, 620)
__lesPaul.clear()
__lesPaul.tour(4)                // jump to the volume stage
__lesPaul.explode(true)
__lesPaul.quality('high')        // high | balanced | lite
__lesPaul.view('hero')           // hero | body | neck | hardware | exploded
__lesPaul.state()
```

Capture at 1440×900 for desktop and 390×844 for mobile. Convert screenshots to WebP before committing; 1440px PNGs are ~1.6 MB each and the noise gradient compresses well as WebP.

Two environment gotchas:

- A headless browser can report `hover: none` even with a mouse. The tooltip CSS therefore hides only on `(hover: none) and (pointer: coarse)`.
- Background tabs throttle `requestAnimationFrame`, so camera tweens can look half-finished in a screenshot. Call `__lesPaul.snap()` first, or wait for `state().ready` and a foreground tab.

## What to inspect by hand

1. Hover the top, a pickup, a fret, and the jack; the tooltip follows the pointer and the outline matches the part.
2. Pin a part, then orbit; the inspector stays open and **Clear**/`Escape` releases it.
3. Search “tuner” and confirm both the tuning machines and headstock match.
4. Start the tour; advance through all eight stages; check that unrelated parts dim and the card text changes.
5. Explode and assemble; confirm the strings, pickups, hardware, and body separate and return home.
6. Resize to 390 px: the header clears the headstock, the index drawer opens below the toolbar, and the inspector becomes a bottom sheet with its actions visible.
