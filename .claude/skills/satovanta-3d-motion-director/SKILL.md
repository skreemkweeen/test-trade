---
name: satovanta-3d-motion-director
description: "Decides which rendering technology (CSS, Motion/Framer, GSAP, SVG, Canvas, Three.js, React Three Fiber, Spline, Rive, WebGPU) should implement a requested visual or motion effect, and enforces performance, accessibility, and cleanup discipline on whichever is chosen. Use before implementing any animation, transition, particle effect, 3D scene, or interactive visual on SatoVanta. Trigger words: animation, motion, transition, 3D, WebGL, WebGPU, particles, scroll effect, hero animation, interactive scene."
---

# SatoVanta 3D & Motion Director

Gatekeeps rendering-technology choice so effort matches payoff, and product usability is never sacrificed for spectacle.

## Step 1 — Choose the least expensive technology that achieves the intent

Evaluate in this order and stop at the first option that satisfies the requirement:

1. **CSS** (transitions/transforms/animations) — for simple state changes, hovers, entrances.
2. **Motion (Framer Motion)** — for React component-level orchestration, gestures, layout animation, exit animations.
3. **GSAP** (`gsap-core`/`gsap-timeline`/`gsap-scrolltrigger`/`gsap-react`/`gsap-plugins`) — for complex sequencing, scroll choreography, timeline control not natively expressible in Motion.
4. **SVG / Canvas** — for vector illustration animation or 2D effects that don't need a 3D scene graph.
5. **Three.js / React Three Fiber** (`threejs-webgl`/`react-three-fiber`) — only when the effect genuinely requires a 3D scene (depth, camera, lighting, geometry).
6. **Spline / Rive** — only for designer-authored interactive assets where code-first 3D/vector authoring isn't the right workflow.
7. **WebGPU/TSL** (`webgpu-threejs-tsl`) — only when the effect requires compute shaders or GPU-bound work that WebGL cannot deliver at acceptable performance; must be justified in writing, and must ship with a WebGL or static fallback.

Never reach for Three.js/WebGPU when CSS or Motion would produce the same perceived result. Escalating technology tiers is a cost that must be justified by the effect, not by novelty.

For any multi-library combination (e.g. GSAP driving a Three.js scene), consult `web3d-integration-patterns` for the integration architecture before writing code.

## Step 2 — Enforce hard limits

Every motion/3D effect must be designed against explicit budgets, stated up front:

* **Frame rate:** target 60fps; anything that cannot sustain ≥30fps on mid-tier hardware must be simplified or gated behind a capability check.
* **Bundle size:** Three.js/R3F/WebGPU work must be code-split and lazy-loaded, never in the main bundle for pages that don't use it.
* **Battery/thermal:** persistent render loops (`requestAnimationFrame`, Three.js render loop) must pause when the tab/element is not visible (`IntersectionObserver`, `document.visibilityState`).

## Step 3 — Reduced motion and fallbacks are mandatory, not optional

* Every animation or 3D effect must have a `prefers-reduced-motion` alternative — either a static frame, a crossfade, or a substantially simplified motion. Never ship motion-only content.
* Every 3D/WebGPU effect must have a static-image or CSS fallback for devices/browsers that fail capability checks (no WebGL2/WebGPU, low-end GPU, `prefers-reduced-motion: reduce`).
* Detect capability before committing to the expensive path — do not let a scene fail silently or crash on unsupported devices.

## Step 4 — Protect product usability

* Decorative 3D/motion must never sit behind, occlude, or compete with chart data, tables, or controls in `satovanta-product-ui` surfaces. If in doubt, keep 3D/heavy motion out of authenticated product screens entirely and reserve it for marketing/editorial surfaces.
* Motion must convey meaning (state change, spatial relationship, causality) — reject decoration-only motion with no narrative or interaction purpose, especially on public pages evaluated by `satovanta-awwwards-quality-gate`.

## Step 5 — Cleanup discipline

Every implementation must be reviewed for leaks before it ships:

* Three.js/R3F: dispose geometries, materials, textures, and render targets on unmount; cancel the render loop; remove resize/visibility listeners.
* GSAP: kill tweens/timelines and ScrollTriggers on component unmount (`gsap.context()` + `.revert()` in React, per `gsap-react`).
* Rive/Spline: stop and destroy runtime instances on unmount; unsubscribe from state-machine/input listeners.
* Any raw event listeners (scroll, resize, pointer, `IntersectionObserver`) added for an effect must be removed in the corresponding cleanup path.

## Handoff

Route the chosen technology to its dedicated skill for implementation detail (`gsap-*`, `threejs-webgl`, `react-three-fiber`, `spline-interactive`, `rive-interactive`, `webgpu-threejs-tsl`, `motion-framer`), then to `satovanta-design-qa` for reduced-motion and performance verification before shipping.
