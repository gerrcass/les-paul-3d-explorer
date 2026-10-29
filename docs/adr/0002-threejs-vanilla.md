# 0002 — Three.js with vanilla TypeScript and Vite

The renderer is Three.js driven by a hand-written TypeScript app. The interface is plain DOM and CSS. There is no React, React Three Fiber, or state-management library.

The page has one render loop and a small set of interface panels; a component framework would add reconciliation and a second source of truth for state without removing any of the hard work. Vanilla DOM also makes the accessibility surface explicit. Vite gives a fast dev loop and a static build small enough for GitHub Pages.

**Status:** accepted
