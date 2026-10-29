# Les Paul Anatomy

The vocabulary of the interactive instrument explainer. Definitions describe the concept, not the implementation.

## The instrument

**Black Beauty**:
A Les Paul Custom in gloss black with gold hardware, cream multi-ply binding, an ebony board with pearl block inlays, and a split-diamond headstock. This project depicts a modern Les Paul Custom.
_Avoid_: Burst, sunburst Standard

**Carve**:
The domed, recurved shaping of a Les Paul's maple top, highest through the middle and dipping before it meets the binding.
_Avoid_: Arch, curve

**Recurve**:
The shallow dip in the carve just inside the body binding.
_Avoid_: Dish, scoop

**Binding**:
The cream-and-black multi-ply strip that covers the seam between the top and the side of the body, and around the fretboard.
_Avoid_: Edge trim, piping

**Control cavity**:
The routed chamber in the mahogany back that holds the potentiometers, capacitors, and switch wiring, closed by a plastic cover plate.
_Avoid_: Electronics bay

## Parts and interaction

**Part**:
A named, meaningful piece of the instrument that a visitor can point at and learn about. A part may be several meshes (for example, six tuning machines).
_Avoid_: Component, element, mesh

**Part Registry**:
The single source of truth mapping every **PartId** to its name, category, explanation, material, and signal role.
_Avoid_: Metadata store, config

**PartId**:
A stable, human-readable identifier for a part, shared by the scene and the interface.
_Avoid_: UUID, key

**Pickable**:
A mesh that resolves to a **Part** when pointed at. Decorative meshes are not pickable.
_Avoid_: Hittable, clickable

**Hover**:
The transient state while the pointer rests on a **Pickable**, showing the tooltip and highlight.
_Avoid_: Mouseover

**Pin**:
A deliberate selection that keeps a part's inspector open and its highlight persistent until cleared.
_Avoid_: Select, click, lock

**Focus**:
A camera move that frames a single part closely enough to see its detail, without hiding its neighbours.
_Avoid_: Zoom, fly-to

**Exploded View**:
An arrangement where major assemblies separate along the instrument's normal axis so their stacking and fit are visible.
_Avoid_: Disassembly, breakdown

## Sound

**Signal Path**:
The ordered route from string vibration to amplifier input: strings, pickups, selector switch, volume, tone, output jack, cable.
_Avoid_: Audio chain, circuit

**Stage**:
One stop on the **Signal Path**, with its own explanation of what changes in the signal.
_Avoid_: Step, node

**PAF**:
The original "Patent Applied For" humbucking pickup. This project depicts a pair of gold-covered PAF-style humbuckers.
_Avoid_: Humbucker (use only when speaking generally)

**Tune-o-matic**:
The adjustable bridge with individually intonatable saddles, paired on a Les Paul with a stopbar tailpiece.
_Avoid_: Bridge (when the tailpiece is also in view)

**Stopbar**:
The anchored tailpiece that holds the string ends and sets their break angle over the bridge.
_Avoid_: Tailpiece (prefer the specific term)

**Poker chip**:
The black selector-switch ring with gold lettering, printed with "Rhythm" and "Treble".
_Avoid_: Switch plate
