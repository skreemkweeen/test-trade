---
name: satovanta-product-ui
description: "Governs SatoVanta's operational product surfaces — dashboards, trading terminals, market tables, charts, order forms, navigation. Use whenever building or modifying an authenticated application screen (not a marketing page). Enforces information hierarchy, scan speed, semantic market color, required interface states (loading/empty/stale/disconnected/error/success/restricted), and responsive behavior across desktop/tablet/mobile. Routes component architecture through Vercel composition and React best-practice skills. Trigger words: dashboard, trading terminal, market table, order book, chart panel, product UI, admin screen, data table, form, navigation."
---

# SatoVanta Product UI

Governs anything the authenticated user operates to make decisions or take action — this is not the place for marketing polish.

## Priorities, in order

1. **Information hierarchy and scan speed.** A trader or operator must locate the number/state that matters in under a second. Prioritize density and legibility over visual flourish.
2. **Legibility.** Tabular figures for numeric columns, sufficient contrast at small sizes, no decorative fonts in data-bearing text.
3. **Decision support.** Every screen should make it obvious what the user can do next and what just changed.

## Semantic market color

* Preserve the existing semantic meaning of color already established in `DESIGN.md` / `docs/design/` (e.g. up/down, buy/sell, profit/loss, risk levels). Never repurpose a semantic market color for decoration.
* Do not introduce a new "brand accent" color into data-bearing UI that could be confused with a semantic market signal.
* Verify color-blind-safe differentiation is not solely reliant on hue (pair with icon/sign/position, per WCAG 2.2 AA).

## Anti-patterns to block

* Oversized marketing-style hero treatments, large decorative imagery, or heavy motion inside operational screens.
* Glassmorphism, glow effects, or heavy blur behind data-dense panels — they reduce contrast and scan speed.
* Novelty typography in tables, prices, or timestamps.
* Skeleton/looping animations that persist past actual load time.

## Responsive requirements

Define explicit behavior for desktop, tablet, and mobile — do not assume a dashboard degrades gracefully by accident:

* Desktop: full multi-panel layout, dense information density is acceptable.
* Tablet: collapse secondary panels behind tabs/drawers; preserve primary data table/chart.
* Mobile: single-column, prioritize the single most decision-relevant view; provide clear navigation back to other panels rather than cramming.

## Required interface states

Every data-driven component must define and visibly handle:

* **Loading** — skeleton or spinner scoped to the component, never a full-page blocker for partial updates.
* **Empty** — explicit empty state with next-action guidance, never a bare blank panel.
* **Stale** — visually distinct treatment (e.g. dimmed, timestamp badge) when data is known-old, distinct from disconnected.
* **Disconnected** — explicit connectivity-lost indicator, distinct from stale data and from a generic error.
* **Error** — actionable error state (retry affordance), not a raw error dump.
* **Success** — confirmation feedback for user-initiated actions (order placed, settings saved).
* **Restricted** — clear messaging when the user lacks permission/entitlement, not a silent absence of the feature.

## Component architecture routing

Route component composition and performance decisions through:

* `vercel-composition-patterns` — for compound components, flexible APIs, avoiding boolean-prop proliferation in table/panel/chart components.
* `vercel-react-best-practices` — for data-fetching, re-render, and bundle-size discipline in high-update-frequency views (live prices, order books).

## Accessibility

Product UI must clear WCAG 2.2 AA: keyboard operability of every control (including custom dropdowns/menus), visible focus states, semantic table/landmark markup, and `prefers-reduced-motion` handling for any live-updating chart or ticker animation.

## Handoff

Before shipping, route through the accessibility review and `satovanta-design-qa` for viewport, keyboard, and state verification.
