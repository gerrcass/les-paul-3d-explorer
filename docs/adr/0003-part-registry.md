# 0003 — The Part Registry is the semantic seam

Every visible piece that a visitor can learn about is a **Part** in one registry. The scene attaches only a `partId` to meshes; the registry owns the name, category, explanation, material, and signal-stage role. Hover, pinning, the parts index, focus, exploded view, and the guided tour all read through the same registry.

This coupling is deliberate. The alternative — descriptive strings and tooltips stored next to each mesh builder — would scatter the teaching content across the modelling code and make it impossible to test the complete set of explanations without a browser. The registry is pure data, so it is the highest and cheapest test seam, and the glossary stays the single source of vocabulary.

**Status:** accepted
