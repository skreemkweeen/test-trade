# SatoVanta Skill Routing

This document defines which Claude Code skills to invoke, and in what order, for common SatoVanta design and frontend tasks. It complements the project-local skill stack installed under `.claude/skills/` (see `docs/skills/SKILL_MANIFEST.md` for the full inventory, sources, and security review of each skill).

The five `satovanta-*` skills are project-specific routing/gate skills created for this repository; every other skill named below was installed from its upstream source as documented in the manifest.

## Routing table

### New public landing page

```
satovanta-creative-director
  -> frontend-design
  -> design-taste-frontend  (or high-end-visual-design, when a bolder / more expensive-feeling direction is warranted)
  -> GSAP (gsap-core / gsap-timeline / gsap-scrolltrigger / gsap-react / gsap-plugins), only when satovanta-3d-motion-director justifies motion beyond CSS/Motion
  -> satovanta-awwwards-quality-gate
  -> satovanta-design-qa
```

Use this path when there is no existing page to preserve — a fresh marketing, campaign, or editorial surface.

### Existing landing-page redesign

```
redesign-existing-projects
  -> impeccable
  -> satovanta-awwwards-quality-gate
  -> satovanta-design-qa
```

`redesign-existing-projects` audits the current implementation and identifies generic-AI patterns first; `impeccable` performs the shape/polish/critique pass. Do not skip the audit step by jumping straight to visual changes.

### Dashboard or trading terminal

```
satovanta-product-ui
  -> ui-ux-pro-max
  -> impeccable
  -> vercel-composition-patterns + vercel-react-best-practices
  -> accessibility review (accessimind-accessible-ui-agent-skill)
  -> satovanta-design-qa
```

`satovanta-product-ui` sets the operational constraints (semantic market color, required states, information density) before any visual system is chosen. `ui-ux-pro-max` and `impeccable` are used for dashboards and product interfaces specifically — not `design-taste-frontend`, which is reserved for marketing/editorial surfaces.

### Brand work

```
brandkit
  -> satovanta-creative-director
```

Brand-identity decisions (logo systems, identity boards, visual-world presentations) start with `brandkit`, then `satovanta-creative-director` reconciles the output against `DESIGN.md` and `docs/brand/` before it's treated as canonical.

### Screenshot recreation

```
image-to-code
  -> satovanta-creative-director
  -> accessibility and responsive review
```

`image-to-code` implements the visual match; `satovanta-creative-director` checks the result against SatoVanta's own brand direction (a faithfully recreated screenshot can still be off-brand); accessibility/responsive review follows before shipping.

### Interface animation

```
satovanta-3d-motion-director
  -> appropriate GSAP or Motion skill (gsap-core / gsap-timeline / gsap-scrolltrigger / gsap-react / gsap-plugins / motion-framer)
  -> gsap-performance
  -> reduced-motion verification (satovanta-design-qa)
```

`satovanta-3d-motion-director` picks the technology tier first (CSS before Motion before GSAP before 3D). `gsap-performance` is applied to any GSAP-based result regardless of which other GSAP skill implemented it.

### Three.js or React Three Fiber

```
satovanta-3d-motion-director
  -> threejs-webgl  or  react-three-fiber
  -> webgpu-threejs-tsl, only when compute-shader or GPU-bound work is justified in writing
  -> performance and fallback review (satovanta-3d-motion-director + satovanta-design-qa)
```

3D work must clear the technology-tier justification in `satovanta-3d-motion-director` before implementation, and must ship with a reduced-motion and no-WebGL/no-WebGPU fallback, verified in the final review pass.

## Skills used across multiple paths

* `satovanta-design-qa` is the terminal step for every path — no design work is complete without it.
* `impeccable` appears in both the redesign and dashboard paths; it is a general shape/critique/polish tool, not surface-specific.
* `vercel-composition-patterns` and `vercel-react-best-practices` apply to any React/Next.js component architecture decision, most explicitly required in the dashboard path.
* `accessimind-accessible-ui-agent-skill` and `web-design-guidelines` may be invoked at any point a WCAG 2.2 AA, keyboard, contrast, or reduced-motion question arises, not only at the points listed above.
* `playwright-cli` (official Microsoft skill) is the only browser-automation tool used by `satovanta-design-qa`.

## Explicitly out of scope for routing

* `slides` (from the ui-ux-pro-max-skill bundle) — not installed, not routed to.
* Any third-party `playwright-skill` — not installed; only `playwright-cli` is used for Playwright workflows.
* `gsap-frameworks` (Vue/Svelte) — not installed; SatoVanta is React/Next.js only.
