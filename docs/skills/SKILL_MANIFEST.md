# SatoVanta Skill Manifest

Installed 2026-07-21, project-locally only (`-a claude-code`, no `-g`/global flag), via `npx skills add` (Skills CLI v1.5.19). All entries verified present on disk at `.claude/skills/<name>/SKILL.md` (mirrored to `.agents/skills/<name>/` by the CLI) after installation. Full package/hash metadata for CLI-installed skills is tracked in `skills-lock.json`, managed by the Skills CLI itself.

Repository state before this task: empty scaffold (`README.md` only), no pre-existing skills, docs, `CLAUDE.md`, or `DESIGN.md`. Every skill below was a fresh install — nothing was already present, so nothing was skipped as a duplicate.

## Phase 1 — Design and UI/UX

| Skill | Source | Commit SHA | Destination | Purpose | Security review | Scripts / network | Status |
|---|---|---|---|---|---|---|---|
| frontend-design | anthropics/skills | `fa0fa64b` | `.claude/skills/frontend-design` | Distinctive, intentional visual/aesthetic direction; avoids templated defaults | Pure markdown, no scripts. CLI scan: Gen Safe / Socket 0 alerts / Snyk Low Risk | None | Installed |
| ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill | `1307d97a` | `.claude/skills/ui-ux-pro-max` | Local searchable UI/UX rule database (styles, palettes, typography, UX guidelines, GSAP presets, chart types) across 22 stacks | Manually inspected all 4 Python scripts (`search.py`, `core.py`, `design_system.py`, `validate_data.py`) line-by-line for network/exec/credential access — none found; only local CSV reads and local markdown writes, `os.environ.get('COLORTERM')` for terminal color only. CLI scan flagged **Gen: High Risk** (contradicted by Socket 0 alerts / Snyk Low Risk and by direct code review) — see Security Review Findings below. Installed **only** the `ui-ux-pro-max` skill from a bundle that also contains `banner-design`, `brand`, `design`, `design-system`, `ui-styling`, and `slides` — **`slides` explicitly excluded per instructions** | 4 local Python scripts, no network calls, no subprocess/eval | Installed (single skill from multi-skill repo; rest of bundle skipped by design) |
| impeccable | pbakaus/impeccable | `4d849eb7` | `.claude/skills/impeccable` | Frontend design/redesign critique, live-browser iteration, design-token/anti-pattern detection | Inspected ~25 scripts. Found: (1) a local-only HTTP server (`live-*.mjs`) for live browser editing, binds to localhost, legitimate to stated purpose; (2) `git`/`git check-ignore` shellouts via `execFileSync`/`execSync`, benign repo introspection; (3) a version-check GET to `https://impeccable.style/api/version` on session boot — sends no data, best-effort/silent-fail, has explicit opt-out `IMPECCABLE_NO_UPDATE_CHECK=1`. No credential handling, no destructive file ops, no hidden persistence (hooks are opt-in via explicit `$impeccable hooks on`, not auto-registered on install — confirmed no `.claude/settings.json` was created). CLI scan: Gen Med Risk / Socket 0 alerts / Snyk Med Risk | Local HTTP server (localhost only) + one external version-check GET (no data sent, opt-out available) — flagged, not disqualifying | Installed |
| design-taste-frontend | leonxlnx/taste-skill | `98565e65` | `.claude/skills/design-taste-frontend` | Anti-generic-AI-pattern skill for landing pages/portfolios/redesigns | Pure markdown skill, no scripts in skill folder | None | Installed |
| high-end-visual-design | leonxlnx/taste-skill | `98565e65` | `.claude/skills/high-end-visual-design` | Premium-agency-level fonts/spacing/shadows/motion standards | Pure markdown skill, no scripts | None | Installed |
| redesign-existing-projects | leonxlnx/taste-skill | `98565e65` | `.claude/skills/redesign-existing-projects` | Audits and upgrades existing UI to premium quality without breaking functionality | Pure markdown skill, no scripts | None | Installed |
| brandkit | leonxlnx/taste-skill | `98565e65` | `.claude/skills/brandkit` | Brand-guidelines board / identity system generation guidance | Pure markdown skill, no scripts | None | Installed |
| image-to-code | leonxlnx/taste-skill | `98565e65` | `.claude/skills/image-to-code` | Screenshot/reference-image-to-code recreation workflow | Pure markdown skill, no scripts | None | Installed |

## Phase 2 — Frontend architecture and design systems

| Skill | Source | Commit SHA | Destination | Purpose | Security review | Scripts / network | Status |
|---|---|---|---|---|---|---|---|
| web-design-guidelines | vercel-labs/agent-skills | `4559f18a` | `.claude/skills/web-design-guidelines` | Review UI code against Vercel's Web Interface Guidelines | Single markdown file, no scripts | None | Installed |
| vercel-react-best-practices | vercel-labs/agent-skills | `4559f18a` | `.claude/skills/vercel-react-best-practices` | React/Next.js performance guidelines from Vercel Engineering | Single markdown file, no scripts | None | Installed |
| vercel-composition-patterns | vercel-labs/agent-skills | `4559f18a` | `.claude/skills/vercel-composition-patterns` | Scalable React composition patterns | Single markdown file, no scripts | None | Installed |
| shadcn | shadcn/ui | `fa4872c8` | `.claude/skills/shadcn` | shadcn/ui component management, docs, registry usage | Markdown + reference docs only, no executable scripts | None | Installed |

Note: `vercel-labs/agent-skills` also contains `deploy-to-vercel` and `vercel-cli-with-tokens` (credential/token-based deployment) — **not installed**, out of scope for this task and involve deployment credentials.

## Phase 3 — Accessibility and visual QA

| Skill | Source | Commit SHA | Destination | Purpose | Security review | Scripts / network | Status |
|---|---|---|---|---|---|---|---|
| accessimind-accessible-ui-agent-skill | sarperarikan/accessimind-codex-agent-skill | `eccdde3c` | `.claude/skills/accessimind-accessible-ui-agent-skill` | WCAG 2.2 AA implementation/verification, axe-core-backed accessibility checks | Inspected all bundled scripts. `low_vision_web_audit.mjs` and `motor_web_audit.mjs` are clean Playwright-based browser audits, kept. `nvda_web_audit.mjs` invoked `powershell.exe -ExecutionPolicy Bypass` for NVDA screen-reader automation — **removed post-install** per instructions ("do not install NVDA automation unless separately reviewed and explicitly required"); the corresponding "NVDA-assisted live review mode" section (was lines 3234–3385) was also deleted from `SKILL.md`. The repo's other skills — `full-persona-a11y-audit`, `nvda-portable-a11y-audit`, `senior-developer-20y`, and a bundled third-party `playwright` skill — were **not installed at all**. CLI scan: Gen Safe / Socket 0 alerts / Snyk Med Risk | 2 local Playwright audit scripts kept (no network/exec found); 1 PowerShell-invoking script removed | Installed, then modified (NVDA automation stripped) |
| webapp-testing | anthropics/skills | `fa0fa64b` | `.claude/skills/webapp-testing` | Playwright-based local webapp testing/debugging toolkit | Pure markdown skill, no scripts. CLI scan: Gen Safe / Socket 0 alerts / Snyk Low Risk | None | Installed |
| playwright-cli | microsoft/playwright-cli | `eee5a185` | `.claude/skills/playwright-cli` | Official Microsoft Playwright CLI browser-automation skill | Markdown + reference docs only, no executable scripts bundled in the skill itself | None | Installed |

Note: no third-party skill literally named `playwright-skill` was installed anywhere in this task, per instructions. Only `microsoft/playwright-cli@playwright-cli` is used for Playwright guidance.

## Phase 4 — GSAP motion (official, greensock/gsap-skills)

| Skill | Commit SHA | Destination | Purpose | Security review | Status |
|---|---|---|---|---|---|
| gsap-core | `aed9cfd3` | `.claude/skills/gsap-core` | Core tween API, easing, `matchMedia`/reduced-motion | Pure markdown, no scripts in skill folders (repo-level `examples/` only) | Installed |
| gsap-timeline | `aed9cfd3` | `.claude/skills/gsap-timeline` | Timeline sequencing, position parameter, nesting | Pure markdown | Installed |
| gsap-scrolltrigger | `aed9cfd3` | `.claude/skills/gsap-scrolltrigger` | Scroll-linked animation, pinning, scrub | Pure markdown | Installed |
| gsap-react | `aed9cfd3` | `.claude/skills/gsap-react` | `useGSAP` hook, `gsap.context()`, cleanup on unmount | Pure markdown | Installed |
| gsap-plugins | `aed9cfd3` | `.claude/skills/gsap-plugins` | ScrollToPlugin, Flip, Draggable, SplitText, etc. | Pure markdown | Installed |
| gsap-performance | `aed9cfd3` | `.claude/skills/gsap-performance` | Transform-preference, layout-thrash avoidance, 60fps discipline | Pure markdown | Installed |

`gsap-frameworks` (Vue/Svelte) and `gsap-utils` exist in the same repo but were **not installed** — SatoVanta is React/Next.js only, and `gsap-utils` was outside the requested list.

## Phase 5 — 3D and interactive visual skills

| Skill | Source | Commit SHA | Destination | Purpose | Security review | Status |
|---|---|---|---|---|---|---|
| threejs-webgl | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/threejs-webgl` | Three.js scenes, cameras, materials, WebGL/WebGPU rendering | `scripts/setup_scene.py` inspected — local file scaffolding only, no network/exec/credentials | Installed |
| react-three-fiber | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/react-three-fiber` | Declarative R3F component architecture | `scripts/component_generator.py`, `scripts/scene_setup.py` inspected — local generators only | Installed |
| motion-framer | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/motion-framer` | Motion (Framer Motion) variants, gestures, layout/exit animation | `scripts/variant_builder.py`, `scripts/animation_generator.py` inspected — local generators only | Installed |
| spline-interactive | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/spline-interactive` | Spline no-code 3D scene integration/export | `scripts/project_generator.py`, `scripts/component_builder.py` inspected — local generators only | Installed |
| rive-interactive | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/rive-interactive` | Rive state-machine vector animation, runtime interactivity | `scripts/component_generator.py`, `scripts/viewmodel_builder.py` inspected — local generators only | Installed |
| blender-web-pipeline | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/blender-web-pipeline` | Blender-to-glTF export, LOD generation, asset optimization for web | `scripts/batch_export.py`, `scripts/optimize_model.py`, `scripts/generate_lods.py` inspected — plain `bpy` scripts run inside Blender's own interpreter, no `subprocess`/`Popen`, no network | Installed |
| web3d-integration-patterns | freshtechbro/claudedesignskills | `1da73feb` | `.claude/skills/web3d-integration-patterns` | Meta-skill for combining Three.js/GSAP/R3F/Motion architectures | Pure markdown, no scripts | Installed |
| webgpu-threejs-tsl | dgreenheck/webgpu-claude-skill | `af2319bd` | `.claude/skills/webgpu-threejs-tsl` | WebGPU renderer setup, TSL node materials, compute shaders | Markdown + browser-only example `.js` snippets (no build/exec scripts) | Installed |

Not installed from `freshtechbro/claudedesignskills` (bundle also contains, but was not requested and was excluded per "install only the exact skills listed"): `barba-js`, `gsap-scrolltrigger` (duplicate of the official greensock version — official one used instead), `lightweight-3d-effects`, `locomotive-scroll`, `lottie-animations`, `modern-web-design`, `pixijs-2d`, `playcanvas-engine`, `react-spring-physics`, `scroll-reveal-libraries`, `skill-creator`, `substance-3d-texturing`.

## Phase 6 — SatoVanta custom skills (created, not installed from upstream)

| Skill | Destination | Purpose | Created |
|---|---|---|---|
| satovanta-creative-director | `.claude/skills/satovanta-creative-director` | Reads `DESIGN.md`/`docs/brand`/`docs/design`, preserves brand direction, routes surfaces to the correct design skill, requires one defensible aesthetic decision | New |
| satovanta-product-ui | `.claude/skills/satovanta-product-ui` | Governs dashboards/trading terminals: hierarchy, semantic market color, required states, responsive behavior, composition routing | New |
| satovanta-3d-motion-director | `.claude/skills/satovanta-3d-motion-director` | Chooses least-expensive rendering technology, enforces fps/bundle/battery limits, reduced-motion + fallback requirements, cleanup discipline | New |
| satovanta-awwwards-quality-gate | `.claude/skills/satovanta-awwwards-quality-gate` | Evaluates public pages against Awwwards-tier dimensions, rejects generic-AI patterns, produces Blocker/High/Medium/Polish findings | New |
| satovanta-design-qa | `.claude/skills/satovanta-design-qa` | Playwright-CLI-driven browser QA: viewports, keyboard, focus, reduced motion, touch targets, interface states, automated checks | New |

All five have valid YAML frontmatter (`name` matching folder name, non-empty `description`), verified via automated parse of each `SKILL.md`.

## Security Review Findings (summary)

1. **`ui-ux-pro-max` — CLI "Gen" scanner flagged High Risk**, contradicted by Socket (0 alerts), Snyk (Low Risk), and full manual line-by-line review of all 4 bundled Python scripts, which found no network access, no subprocess/eval, no credential handling — only local CSV search and local markdown file writes. Installed after manual review, per instructions to inspect this skill particularly carefully rather than defer to the scanner alone.
2. **`impeccable` — unsolicited version-check network call.** `scripts/context.mjs` makes a `fetch()` to `https://impeccable.style/api/version` once per session boot. No data is transmitted (GET only), it fails silently offline/sandboxed, and it has a documented opt-out (`IMPECCABLE_NO_UPDATE_CHECK=1`). Judged non-disqualifying (no exfiltration, standard update-check pattern, transparent and disableable) but flagged here for visibility. Recommend setting `IMPECCABLE_NO_UPDATE_CHECK=1` in the environment if this outbound call is undesired.
3. **`accessimind-accessible-ui-agent-skill` — NVDA automation removed.** The upstream skill bundled `scripts/nvda_web_audit.mjs`, which shells out to `powershell.exe -ExecutionPolicy Bypass` to drive NVDA screen-reader automation on Windows. Per explicit task instructions, this was deleted post-install along with its corresponding SKILL.md section. **Consequence:** this skill's `skills-lock.json` `computedHash` no longer matches the file on disk — this is intentional; do not run `npx skills update` on this skill without re-reviewing the upstream NVDA script first, or the automation will be silently restored.
4. **Repo-bundle exclusions honored:** `slides` (nextlevelbuilder/ui-ux-pro-max-skill) was never installed. No skill named `playwright-skill` was installed anywhere. `full-persona-a11y-audit`, `nvda-portable-a11y-audit`, `senior-developer-20y`, and the bundled third-party `playwright` skill from `sarperarikan/accessimind-codex-agent-skill` were never installed. `deploy-to-vercel` and `vercel-cli-with-tokens` (credential-handling deployment skills) from `vercel-labs/agent-skills` were never installed.
5. No skill inspected contained credential collection/transmission, destructive file operations, unrestricted arbitrary code execution, automatic package installation, sandbox-disabling instructions, repository-content upload behavior, or hidden/global persistence (no skill silently wrote to `.claude/settings.json`, `~/.claude`, or any location outside its own project-local skill folder).

## skills-lock.json

Managed automatically by the Skills CLI on every `add` invocation; all 29 upstream-installed skills are present with `source`, `sourceType`, `skillPath`, and `computedHash`. No existing entries were erased (the lock file did not exist before this task — see Repository Safety note above). The 5 `satovanta-*` skills are project-authored and intentionally not part of `skills-lock.json` (that file tracks upstream package provenance, not hand-written skills).
