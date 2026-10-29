# Coding standards

Read at review time. The implementation agent should internalise these, not restate them.

## Boundaries

- **Domain is pure.** `src/domain/` holds data and state transitions. It imports no Three.js, no DOM, and no browser globals, so it can be tested in Node.
- **Scene owns geometry.** `src/scene/` may import Three.js and domain types. It must not touch `document` or `window`.
- **UI owns DOM.** `src/ui/` may read domain types and call callbacks. It must not import Three.js types into its public surface.
- **Composition root.** `src/main.ts` is the only module that wires scene, UI, and domain together.

## TypeScript

- Strict mode is on. Exported functions have explicit return types.
- No `any`, no non-null assertion unless the invariant is documented in the same function.
- Discriminated unions for UI state; exhaustive switches with `never` checks.
- Prefer `readonly` data and `ReadonlyArray` in the registry.

## Three.js

- Dispose geometries, materials, and textures when a scene is torn down.
- No allocation inside the render loop. Reuse vectors, matrices, and raycasters.
- One material instance per visual material, shared across meshes that use it. Per-part mutation clones the material once and caches it.
- Cast and receive shadows only where they are visible.
- Keep the draw-call budget under 250 at the high tier.
- Procedural texture generation belongs in `textures.ts`, not inside builders.

## Naming and copy

- Use `GLOSSARY.md` terms exactly: *carve*, *recurve*, *binding*, *Tune-o-matic*, *stopbar*, *poker chip*.
- Part explanations are one sentence of purpose, then one or two sentences of mechanism. No marketing tone.
- UI copy is sentence case. Units are inches for instrument dimensions and millimetres for string gauges.

## CSS

- Design tokens live in one `:root` block. No raw hex colour outside it.
- Layout uses grid/flex with explicit breakpoints at 720 px and 1100 px.
- Focus-visible states are always present. Reduced-motion styles are required for every transition over 150 ms.

## Tests

- Test behaviour through the highest seam: build the instrument headlessly and assert the registry/scene contract; drive the tour through its public state machine.
- Unit tests must not require WebGL, a canvas, or a browser.
- Each test name states the behaviour, not the function name.
- Visual and interaction evidence comes from a real browser screenshot, not a unit test.
