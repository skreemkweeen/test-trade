---
name: satovanta-awwwards-quality-gate
description: "Evaluates completed public-facing SatoVanta pages (marketing, portfolio, editorial) against Awwwards-tier standards before they ship. Use after a landing page, marketing surface, or other public page is implemented and before declaring it done. Produces prioritized findings (Blocker/High impact/Medium impact/Polish) and explicitly rejects generic AI-default patterns. Trigger words: quality gate, design review, awwwards, ship review, launch review, is this good enough, final review."
---

# SatoVanta Awwwards Quality Gate

A pass/fail-with-findings review applied to finished public-facing pages. This is a review skill — it does not implement fixes itself; it reports findings for the implementer (or `satovanta-creative-director` / `impeccable`) to act on.

## Evaluation dimensions

Score the page against each dimension and note specific evidence (not vague impressions):

1. **Originality and concept strength** — does the page have a distinct idea, or could it be swapped onto any competitor's site unchanged?
2. **Brand specificity** — does it read as SatoVanta, per `DESIGN.md` / `docs/brand/`, or as generic fintech template?
3. **Typography and editorial rhythm** — deliberate type scale, line-length, vertical rhythm; not default framework typography.
4. **Composition and hierarchy** — clear reading order, intentional asymmetry/tension where used, not default centered stacking.
5. **Motion choreography** — motion tells a story or reveals relationship; evaluate against `satovanta-3d-motion-director` principles.
6. **Micro-interaction quality** — hover/focus/press states feel considered, not just default browser/framework behavior.
7. **Responsive composition** — the design is authored per breakpoint, not a single desktop layout auto-shrunk.
8. **Content quality** — no lorem-ipsum-adjacent filler, no generic marketing copy that could belong to any product.
9. **Accessibility** — WCAG 2.2 AA: contrast, keyboard operability, focus visibility, reduced motion, semantic structure.
10. **Performance** — Core Web Vitals within target (LCP, CLS, INP); asset weight justified by impact.
11. **Visual consistency** — spacing, radii, color, type tokens used consistently across the page and with the rest of the site.
12. **Technical execution** — no layout bugs, clipping, z-index issues, or console errors.

## Automatic rejects — flag as Blocker regardless of other scores

* Generic centered-hero-with-gradient composition.
* Repeated three-card feature grid used as the default layout crutch.
* Glassmorphism applied without a stated rationale tied to brand or content.
* Random/ambient glow effects with no relationship to content or state.
* Excessive uniform rounded-corner treatment on every container.
* Scroll-triggered animation with no narrative or wayfinding purpose ("because scroll animation exists").
* Generic placeholder or stock-feeling content/imagery.
* Decorative motion or 3D with no interaction or storytelling value.
* Desktop-only layouts that break or degrade badly on tablet/mobile.
* Inaccessible contrast ratios or missing/invisible focus states.

## Output format

Report findings grouped by severity, each with a one-line fix direction:

* **Blocker** — must fix before this page can ship. Includes anything in the automatic-reject list and any WCAG failure.
* **High impact** — significantly undermines quality; should fix before shipping barring strong time constraints.
* **Medium impact** — noticeably improves quality; fix if time allows, track otherwise.
* **Polish** — final 10% refinement; optional but expected of Awwwards-tier work.

Do not give a bare pass/fail without itemized findings — the value of this gate is the specific, actionable list, not a verdict.

## Handoff

After Blocker and High-impact findings are resolved, route to `satovanta-design-qa` for cross-viewport, keyboard, and reduced-motion verification with visual evidence before calling the page done.
