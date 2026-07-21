---
name: satovanta-design-qa
description: "Performs browser-based visual and functional QA on SatoVanta using the official Playwright CLI skill before any design work is declared complete. Use after implementing or changing UI to verify viewports, keyboard operation, focus visibility, reduced motion, touch targets, and interface states, and to run available lint/type-check/test/build gates. Trigger words: QA, verify, test the UI, check responsiveness, visual regression, before merging, is it done."
---

# SatoVanta Design QA

The final verification gate. Design work is not "done" until this skill's checks have been run and evidence captured — do not declare completion from code review alone.

## Setup

Launch and inspect the application using the official Playwright CLI workflow (`playwright-cli` skill) — do not use any other browser-automation skill for this. If the app isn't already running, start it per the project's own run instructions before testing against it.

## Viewport coverage

Test at minimum these representative viewports and note the exact sizes used:

* Desktop: 1440×900 (primary), 1920×1080 (spot check)
* Tablet: 768×1024 (portrait), 1024×768 (landscape)
* Mobile: 390×844 (iOS-class), 360×800 (Android-class)

For each: capture a screenshot, check for horizontal overflow/scroll, clipped content, broken text wrapping, and unexpected layout shift versus the prior viewport.

## Before/after evidence

For any major visual change, capture screenshots before and after and compare — do not rely on memory or description. Store evidence path/description in the QA report so the comparison is reviewable.

## Keyboard and focus

* Tab through the entire interactive surface using keyboard only — no mouse. Every interactive element must be reachable and operable (Enter/Space/Arrow keys as appropriate).
* Verify focus order matches visual/reading order.
* Verify focus is always visibly indicated — no element that receives focus without a visible focus ring/state.
* Verify no keyboard trap (a modal/menu must be escapable via keyboard).

## Reduced motion

Emulate `prefers-reduced-motion: reduce` and verify every animation/transition either stops, shortens, or falls back per `satovanta-3d-motion-director` — a page must remain usable and non-distracting in this mode.

## Touch targets

On mobile/tablet viewports, verify interactive elements meet a minimum ~44×44px touch target with adequate spacing to avoid mis-taps.

## Interface states

For any data-driven or async UI, verify (per `satovanta-product-ui` where applicable): loading, empty, error, and disconnected states actually render as designed — do not assume they work because the "happy path" works. Trigger them directly (throttle/block network, empty a data source, force an error) rather than only inspecting code.

## Automated checks

Run whatever the project provides among: lint, type-check, unit tests, accessibility checks (e.g. axe-core if available via `accessimind-accessible-ui-agent-skill`), and a production build. Report pass/fail for each; do not skip a check silently because it's inconvenient — report if a check isn't available in this project rather than omitting it.

## Reporting

Produce a QA report listing: viewports tested, screenshots/evidence captured, keyboard/focus results, reduced-motion result, touch-target result, interface-state results, and automated-check results. Do not declare the work "complete" or "verified" without this evidence — a claim of correctness without browser evidence is not acceptable output from this skill.
