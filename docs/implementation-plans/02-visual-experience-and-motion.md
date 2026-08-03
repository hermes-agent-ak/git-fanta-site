---
status: complete
phase: 2
depends_on:
  - docs/implementation-plans/01-design-system-and-layout.md
implementation_branch: feature/phase-2-visual-experience-and-motion
base_branch: dev
target_branch: dev
---

# Phase 2 Implementation Plan — Visual Experience and Motion

## Objective

Raise Git Fanta's visual foundation to a distinctive, award-caliber UI/UX system
before product content, screenshots, release data, or download interaction are
implemented.

This phase treats the website as a showroom for disciplined AI-assisted product
design. The result must show that a strong prompt can produce a coherent visual
language, reusable primitives, purposeful interaction design, accessible
fallbacks, and measurable performance—not a collection of unrelated visual
effects.

The central concept is **Branchline**: Git branches, refs, commits, merges, and
diffs become a restrained visual grammar for navigation and section transitions.
The branch metaphor is conceptual presentation language only. It must never
pretend to be live repository data or replace ordinary content navigation.

## Current-state findings

- Phase 1 provides semantic tokens, global accessibility defaults, BaseLayout,
  SkipLink, Container, Button, Card, SiteHeader, SiteFooter, and the shared
  navigation contract.
- At Phase 2 start, the bootstrap page contained a clearly labelled temporary
  foundation preview and no final product content or authentic product assets.
  The implementation retains that boundary while composing the visual
  showroom around it.
- `src/styles/global.css` is the existing design-token and reduced-motion seam;
  Phase 2 should extend it rather than introduce a competing styling contract.
- At Phase 2 start, there was no visual graph component, section model,
  Branchline Navigation, commit marker, scroll-driven motion, or design
  decision log. The implementation now provides each of these artifacts.
- The website is static Astro output. React remains reserved for a later useful
  download island and must not be introduced for decorative motion.
- Phase 1 already proves the project-base URL contract, keyboard order, Axe
  coverage, reduced-motion behavior, and 320px overflow behavior. Phase 2 must
  preserve these contracts.
- Focused reference research identified award examples featuring menu/loading
  choreography, scroll animation, portfolio navigation, dynamic grids, menu
  disclosure, and navigation transitions. These references inform interaction
  quality but are not asset or layout sources:
  - [Moha. Auf — Experience Expert](https://www.awwwards.com/sites/moha-auf-experience-expert)
    documents menu/loading, scroll, and portfolio-navigation examples.
  - [Awwwards dynamic-grid references](https://www.awwwards.com/websites/dynamic-grid-layout-examples/)
    demonstrates spatial hierarchy and responsive composition.
  - [Awwwards navigation and interaction references](https://www.awwwards.com/inspiration_search/sites_of_the_day/?page=320)
    includes menu disclosure and transition patterns.
- The performance translation is grounded in [MDN's scroll-driven animation
  guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines),
  [MDN's reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion),
  [MDN's `content-visibility` guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility),
  and [web.dev's animation-performance guidance](https://web.dev/articles/animations-and-performance).

## Implemented result

- `experienceSections` is the single readonly source for five conceptual
  anchors, refs, node kinds, tones, and accessible labels.
- `BranchlineNav.astro` renders ordinary anchors with a validated server-side
  fallback. The active state is owned by `data-active`; `aria-current` mirrors
  it, and CSS consumes the same attribute.
- `branchline-enhancement.ts` adds click synchronization and one bounded
  `IntersectionObserver` for normal scrolling. It is 1,398 source bytes and
  never replaces native navigation. Its state transitions are covered through
  an injected root/view contract, while browser wiring remains covered by
  Playwright.
- `GitTreeReveal.astro` and `CommitMarker.astro` remain decorative and have no
  independent navigation-active state.
- The decision log documents state ownership, rejected alternatives, and the
  performance/accessibility translation of the focused reference research.
- The implementation passes 14 unit tests, 13 browser tests, 3 Axe-tagged
  tests, formatting, lint, type-check, build, and diff validation. The
  SonarQube workflow generates and imports LCOV coverage before analysis;
  declarative Astro/CSS repetition is excluded from copy-paste detection while
  TypeScript source remains measured. The local coverage run reports 96.13%
  line coverage.

## Scope

### 1. Establish a visual showroom direction

Create a documented visual concept called Branchline with the following
principles:

- the page reads as a navigable branch/tree rather than a generic SaaS landing
  page;
- a primary branch carries the section sequence and commit nodes provide
  meaningful navigation anchors;
- conceptual refs such as `main`, `feature/ui`, and `release/next` are visibly
  styled but explicitly labelled as visual metaphors;
- merge points represent transitions, comparisons, or milestones without making
  unsupported product claims;
- diff-green, diff-red, Fanta orange, terminal metadata, and neutral surfaces
  have semantic roles and remain subordinate to readable content; and
- the design feels expressive at first glance but remains understandable when
  every animation is disabled.

Record the design rationale, prompt-level intent, rejected alternatives, and
performance/accessibility decisions in
`docs/design/visual-experience-decision-log.md`. The log is a maintainability
artifact, not public marketing copy.

### 2. Model the visual Git grammar

Create one typed, readonly section model for the visual navigation and graph.
It must distinguish between the actual destination anchor and the conceptual
visual ref.

The model should support:

- stable `id` and `href` values for normal in-page anchors;
- a descriptive visible `label` and accessible `ariaLabel`;
- a conceptual `ref` such as `refs/heads/main` or `refs/heads/feature/ui`;
- a `node` kind such as `root`, `commit`, `branch`, or `merge`;
- a semantic `tone` using existing design tokens; and
- an optional `currentWhen` or active-state rule.

No model field may claim a real application branch, release, commit hash, or
GitHub API result. The visual refs are authored design metadata.

### 3. Implement Branchline Navigation

Create an accessible static `BranchlineNav.astro` that consumes the section
model and provides:

- real anchor links to page sections;
- a visible active node and an exact accessible navigation label;
- `aria-current="location"` or `aria-current="page"` on the active section;
- a desktop rail or branch map that does not cover content or trap focus;
- a mobile disclosure or stacked anchor list that works without JavaScript;
- an explicit focus state for every node and connector-adjacent control; and
- a normal browser scroll path with no wheel hijacking, forced snap, or hidden
  content.

If active-section enhancement needs JavaScript, use one small
`IntersectionObserver` module rather than a scroll event loop. The page must
retain complete anchor navigation and a sensible first-node state when the
script is unavailable.

### 4. Implement the Git Tree visual system

Create small static primitives for a tree/branch backdrop and commit markers.
The graph may use CSS borders/pseudo-elements or a small inline SVG, but it must
not become a decorative canvas or a large asset.

The graph must:

- use `aria-hidden="true"` when it is decorative;
- never carry information that is absent from the adjacent semantic content;
- use CSS variables and token classes for line, node, branch, and diff states;
- preserve readable layout when connectors are hidden;
- avoid clipping focus rings, text, or touch targets; and
- provide a static final state before motion starts.

The component API must make graph intent explicit, for example `branch`, `tone`,
and `decorative`, rather than accepting arbitrary raw CSS or HTML strings.

### 5. Add purposeful progressive motion

Implement a small motion vocabulary rather than unrelated per-element effects:

- **commit resolve:** a node and short connector settle into place as its
  section enters the viewport;
- **branch trace:** a line reveals the path through the current section sequence;
- **diff reveal:** a small `+`, `~`, or `−` state changes through opacity and
  transform when a card or comparison becomes relevant; and
- **ref transition:** the active conceptual ref changes color/weight without
  moving the page or disorienting the reader.

Motion requirements:

- prefer CSS `animation-timeline: view()` or a named view timeline when
  supported, guarded by `@supports`;
- make the unsupported-browser fallback the complete static visual state;
- animate only purposeful properties such as `transform`, `opacity`, controlled
  color, or a short SVG `stroke-dashoffset` trace;
- keep interaction transitions short and bounded, normally 160–360ms, with no
  decorative loop running indefinitely;
- do not animate layout properties, `filter`, huge shadows, `backdrop-filter`,
  or `clip-path` as a default technique;
- do not use `transition: all` or broad global `will-change`; and
- disable or replace non-essential motion under
  `@media (prefers-reduced-motion: reduce)`.

The motion must clarify hierarchy, state, or continuity. If removing it makes
the interface harder to understand, the underlying semantic state is incomplete
and must be fixed before the animation is accepted.

### 6. Preserve performance on low-power devices

The visual experience must be CSS-first and lightweight:

- add no dependency for animation, smooth scrolling, graph rendering, or
  interaction choreography;
- add no runtime JavaScript for decorative motion;
- keep any progressive active-section module below 3072 source bytes and make it
  optional; static anchors remain the source of truth;
- ship no remote fonts, video, analytics, WebGL, canvas, or large background
  image for this phase;
- avoid forced synchronous layout, continuous `requestAnimationFrame`, and
  document-level pointer or scroll handlers;
- use `content-visibility: auto` only where intrinsic sizing and accessibility
  behavior are verified; and
- preserve static HTML and first contentful paint when all motion styles are
  disabled.

The later quality phase owns the full Lighthouse score gate. This phase owns the
architecture that makes the target achievable.

### 7. Validate the showroom quality bar

Review the experience at approximately 320, 768, and 1440 CSS pixels. The
review must cover hierarchy, discoverability, perceived continuity, focus
clarity, touch target sizing, branch metaphor consistency, and the absence of
visual noise. The result must look intentional without relying on a screenshot,
logo, release data, or unsupported product claim.

## Explicit non-scope

- Do not add final homepage copy, product claims, screenshots, logo assets,
  release data, download metadata, or the React download island.
- Do not fetch GitHub branches, commits, diffs, releases, or repository activity
  at runtime or during the build for the visual graph.
- Do not claim that conceptual refs are live Git Fanta branches or commits.
- Do not add WebGL, canvas, a 3D scene, autoplay video, a custom cursor, audio,
  a full animation library, a UI component library, or a second frontend
  framework.
- Do not implement scroll hijacking, forced full-screen section snapping, hidden
  hover-only content, or navigation that requires JavaScript.
- Do not replace BaseLayout, siteHref, the shared navigation contract, or the
  Phase 1 accessibility rules.
- Do not change the Git Fanta application repository, release API, or
  deployment workflow. The SonarQube coverage handoff in
  `.github/workflows/build.yml` and its explicit source/test boundaries are
  allowed; the existing SonarQube trust boundary remains unchanged.
- Do not add pixel-perfect snapshot tests or treat award references as assets to
  copy.

## Dependencies

### Required repository state

- `docs/implementation-plans/01-design-system-and-layout.md` is complete.
- `src/layouts/BaseLayout.astro`, `src/styles/global.css`,
  `src/components/site/SiteHeader.astro`, and `src/lib/site-url.ts` exist and
  retain their Phase 1 contracts.
- The implementation remains static Astro output with Node 24, pnpm 11.4, and
  the approved Tailwind 4 Vite integration.
- Chromium is available for the default Playwright project; mobile validation
  uses viewport emulation rather than a full browser matrix.

### Existing contracts to preserve

- Exactly one main landmark with `id="main-content"`.
- The skip link remains the first focusable page control.
- Internal links remain safe under `/git-fanta-site/` and future custom-domain
  base paths.
- The current Axe, keyboard, reduced-motion, and 320px overflow checks remain
  green.
- No React hydration is added to static visual components.

## Files to create

- `docs/design/visual-experience-decision-log.md` — rationale and rejected
  alternatives for the Branchline showroom system.
- `src/lib/experience-sections.ts` — readonly visual section and conceptual ref
  model.
- `src/components/visual/BranchlineNav.astro` — accessible section navigation.
- `src/components/visual/GitTreeReveal.astro` — decorative branch/tree layer.
- `src/components/visual/CommitMarker.astro` — semantic-looking visual marker
  with an explicit decorative/accessibility contract.
- `src/components/visual/branchline-enhancement.ts` — bounded active-section
  observer enhancement that keeps the visual marker synchronized after clicks
  and during normal scrolling.
- `tests/unit/experience-sections.test.ts` — section model and ref policy tests.
- `tests/unit/branchline-enhancement.test.ts` — injected DOM/view state tests
  for click and observer synchronization.
- `tests/e2e/visual-experience.spec.ts` — browser, keyboard, responsive, motion,
  fallback, and accessibility coverage.

## Files to modify

- `src/styles/global.css` — add motion tokens, graph tokens, progressive CSS
  timelines, static fallbacks, and reduced-motion overrides.
- `src/layouts/BaseLayout.astro` — expose the stable composition seam needed by
  the visual navigation without adding a client directive.
- `src/components/site/SiteHeader.astro` — integrate or make room for the
  Branchline navigation while preserving the primary site navigation.
- `src/pages/index.astro` — compose the visual primitives around explicitly
  labelled temporary sections.
- `tests/e2e/bootstrap.spec.ts` — preserve the compatibility smoke assertions
  or move equivalent coverage without weakening it.
- `package.json` and `pnpm-lock.yaml` — add the V8 coverage provider and the
  coverage test script.
- `vitest.config.ts` — scope LCOV generation to measured TypeScript source.
- `sonar-project.properties` — declare source/test boundaries, LCOV import,
  and presentation-layer copy-paste exclusions.
- `.github/workflows/build.yml` — install dependencies and generate coverage
  before the trusted SonarQube scan.
- `docs/implementation-plans/01-design-system-and-layout.md` — only if the
  Phase 1 follow-up contract needs a factual completion note.

## Data structures

### Visual section item

```ts
type ExperienceSection = {
  readonly id: string;
  readonly href: `#${string}`;
  readonly label: string;
  readonly ariaLabel: string;
  readonly ref: `refs/heads/${string}`;
  readonly node: "root" | "commit" | "branch" | "merge";
  readonly tone: "orange" | "green" | "red" | "neutral";
};
```

Rules:

- `href` must resolve to a real section in the rendered page.
- `ref` is conceptual and must not be fetched, validated, or presented as live
  repository metadata.
- `ariaLabel` must explain the navigational destination, not only the ref name.
- The model is readonly and shared by the visual navigation and graph markers.

### Motion intent

```ts
type MotionIntent = {
  readonly name: "commit-resolve" | "branch-trace" | "diff-reveal" | "ref-transition";
  readonly properties: readonly ("transform" | "opacity" | "color" | "stroke-dashoffset")[];
  readonly reducedMotion: "static" | "fade";
  readonly maxDurationMs: number;
};
```

Every implemented motion intent must appear in the decision log and have an
automated reduced-motion assertion.

## Implementation steps

### Step 0 — Verify the phase boundary and reference audit

1. Confirm the branch is based on the current dev branch, which contains the
   merged Phase 1 foundation, and the working tree contains no unrelated
   changes.
2. Re-read the Phase 1 component and URL contracts before editing.
3. Record only the interaction lessons from the award references in the design
   decision log: menu choreography, section navigation, dynamic spatial layout,
   and progressive reveal.
4. Record the explicit rejection of copied assets, WebGL-heavy effects, scroll
   hijacking, and inaccessible hover-only interactions.

### Step 1 — Create the visual section model with TDD

1. RED: add `tests/unit/experience-sections.test.ts` for unique anchors,
   conceptual ref prefixes, accessible labels, and the absence of live Git data.
   The expected failure is a Vitest collection error because
   `src/lib/experience-sections.ts` does not exist yet.
2. GREEN: add `src/lib/experience-sections.ts` with a readonly model containing
   only temporary, clearly labelled foundation sections.
3. Run the focused unit test and the existing unit suite.

### Step 2 — Create the graph primitives

1. RED: add browser assertions for a decorative graph layer, commit markers,
   `aria-hidden`, and the absence of horizontal overflow at 320px. Before the
   components exist, the graph and marker locator assertions must fail with
   `Expected: 1` and `Received: 0`.
2. GREEN: implement `GitTreeReveal.astro` and `CommitMarker.astro` with CSS or
   a small inline SVG and token-based classes.
3. Verify the graph remains readable when its visual layer is disabled through a
   reduced-motion or no-animation stylesheet.

### Step 3 — Create Branchline Navigation

1. RED: add exact browser assertions for the navigation accessible name,
   section anchor targets, active-state semantics, mobile disclosure behavior,
   and keyboard order. Before `BranchlineNav.astro` exists, the exact
   `getByRole("navigation", { name: "Branchline" })` assertion must fail with
   `Expected: 1` and `Received: 0`.
2. GREEN: implement `BranchlineNav.astro` with ordinary anchors and the small
   IntersectionObserver progressive enhancement. Keep the anchors as the source
   of truth when the script is unavailable.
3. Verify keyboard navigation without JavaScript and verify that focus rings do
   not clip against the branch rail.

### Step 4 — Add progressive motion

1. RED: add browser assertions for a static final state, supported CSS timeline
   detection, reduced-motion behavior, and bounded transition properties. Before
   the motion hooks exist, the `[data-motion="branch-trace"]` locator must fail
   with `Expected: 1` and `Received: 0`; this distinguishes a missing visual hook
   from a browser-support fallback.
2. GREEN: extend `src/styles/global.css` with motion tokens and guarded
   `view()`/named timeline rules. Keep the no-motion fallback visible by default.
3. Assert that no visual interaction depends on a continuous scroll listener or
   a client directive.

### Step 5 — Compose the visual showroom into the bootstrap shell

1. Add temporary, explicitly labelled sections to `index.astro` only to exercise
   the visual grammar. Do not add product claims or final content.
2. Add the graph layer behind or beside content without placing meaningful text
   in the decorative layer.
3. Preserve the Phase 1 header, footer, skip link, main landmark, base-path-safe
   links, and foundation preview semantics.
4. Record the final design decisions and rejected alternatives in the decision
   log.

### Step 6 — Complete responsive, accessibility, and performance checks

1. Run the visual suite at 320, 768, and 1440 CSS pixels.
2. Run keyboard-only navigation through the branchline, temporary sections,
   header, foundation controls, and footer.
3. Run Axe at the default and narrow viewports with no broad suppressions.
4. Emulate reduced motion and assert that essential content remains immediately
   usable and non-essential motion is removed or reduced.
5. Inspect built output for remote requests, unexpected scripts, absolute paths,
   credentials, and live Git metadata.
6. Verify that the visual layer adds no dependency and stays within its JS and
   asset budgets.

### Step 7 — Review the phase boundary

1. Confirm Phase 3 content/assets can replace the temporary sections without
   replacing Branchline navigation or the graph primitives.
2. Confirm the visual metaphor never makes an unsupported product claim.
3. Confirm the site remains understandable with motion disabled and on a narrow
   viewport.
4. Update this plan to `complete` only after all acceptance criteria pass.

## Commands

Run commands from the repository root on the Phase 2 branch.

### Branch and dependency preflight

    test "$(git branch --show-current)" = "feature/phase-2-visual-experience-and-motion"
    git status --short --branch
    pnpm install --frozen-lockfile

### Focused TDD checks

    pnpm test:unit -- tests/unit/experience-sections.test.ts
    pnpm test:e2e -- tests/e2e/visual-experience.spec.ts

### Full verification

    pnpm format:check
    pnpm lint
    pnpm check
    pnpm test:unit
    pnpm test:unit:coverage
    pnpm test:e2e
    pnpm test:a11y
    pnpm build
    git diff --check

The implemented active-section module must remain within its source budget:

    test "$(wc -c < src/components/visual/branchline-enhancement.ts)" -le 3072

Do not add a global browser, scanner, animation library, or formatter
dependency for this phase.

## Testing steps

### Unit tests

- Verify every visual section id is unique and has a real anchor.
- Verify conceptual refs use the documented prefix and contain no commit hash,
  API field, or release value.
- Verify every visual section has a descriptive accessible label.
- Verify the model is the single source consumed by BranchlineNav and the graph.

### Browser integration tests

- Verify the exact navigation accessible name and anchor destinations.
- Verify one active section state with `aria-current` and a visible non-color-only
  indicator.
- Verify graph connectors and markers are decorative when adjacent text carries
  the meaning.
- Verify the skip link, primary site navigation, Branchline navigation,
  temporary section links, and footer remain in logical keyboard order.
- Verify the page has no horizontal overflow at 320px.
- Verify no hover-only information is required.
- Verify the page remains complete when animation support is unavailable.
- Verify reduced-motion emulation disables or replaces non-essential motion.

### Accessibility tests

- Run Axe at the default and 320px viewports.
- Verify navigation names, heading structure, landmark count, target names,
  focus visibility, and `aria-current` behavior.
- Verify decorative SVG/graph content is excluded from the accessibility tree.
- Verify mobile disclosure controls are native, keyboard-operable, and do not
  steal focus.

### Performance and static-output tests

- Assert no remote font, analytics, video, WebGL, canvas, or unexpected runtime
  request is introduced by the visual phase.
- Assert the visual layer has no client directive and no continuous scroll loop.
- Inspect animation declarations and allow only the documented motion properties.
- Verify the active-section module stays below 3072 source bytes. Native CSS
  anchors remain the fallback if the module is unavailable.
- Verify the production output remains static and base-path-safe.
- Defer the full Lighthouse >=95 gate to Phase 6 while preserving the
  architecture needed to meet it.

### Manual review

- Inspect 320, 768, and 1440 CSS pixel layouts.
- Navigate the complete shell with keyboard only.
- Disable motion in browser settings and confirm the page still feels designed,
  not broken.
- Test on a throttled CPU/network profile and confirm no decorative effect
  blocks content or interaction.
- Confirm the graph is a visual metaphor, not fabricated repository telemetry.
- Confirm award references influenced principles only; no copied visual asset,
  layout, or text appears.

## Acceptance criteria

- The website has a named, coherent Branchline visual language that is visibly
  distinct from a generic SaaS template.
- Branchline Navigation uses normal, keyboard-operable anchors and works without
  JavaScript, with a responsive mobile presentation.
- Conceptual branch refs, commit markers, merge points, diff states, and tree
  connectors are implemented through a readonly model and reusable Astro
  components.
- The graph is decorative where appropriate, semantically labelled through
  adjacent content, and never hides essential information.
- Scroll/view motion is progressive, bounded, CSS-first, and has a complete
  static fallback.
- Reduced-motion users receive no vestibular decorative animation and retain all
  content, navigation, focus, and state information.
- No scroll hijacking, canvas/WebGL, autoplay video, full animation library,
  remote font, or large visual dependency is introduced.
- The active-section JavaScript uses one bounded observer rather than a
  continuous scroll loop, stays below the documented 3072-byte source budget,
  and cannot create a second visual active-state contract.
- The visual layer passes unit, browser, keyboard, Axe, reduced-motion, narrow
  viewport, static-output, and diff checks.
- Phase 3 can add authentic product content and screenshots without replacing
  the visual primitives or the base layout.
- The experience remains understandable and usable at 320, 768, and 1440 CSS
  pixels and is architected toward the masterplan Lighthouse targets.

## Failure cases

- **The graph obscures content:** remove or reposition the decorative layer and
  preserve the semantic content flow.
- **Navigation requires JavaScript:** restore native anchors and treat the
  enhancement as optional.
- **Motion causes jank:** remove the effect, reduce its scope, restrict it to
  compositor-friendly properties, and rerun the throttled review.
- **Reduced motion is incomplete:** remove non-essential motion entirely and
  keep the static state as the accessible baseline.
- **A browser lacks scroll-timeline support:** retain the static final state;
  never polyfill it with a heavy library.
- **The metaphor implies live Git data:** relabel the ref as conceptual or
  remove it. Do not fetch or invent repository telemetry.
- **Axe reports a serious or critical violation:** fix the semantic cause and do
  not suppress the rule.
- **The design resembles a reference too closely:** remove the copied pattern,
  asset, or wording and return to the Branchline design rationale.
- **The performance budget is exceeded:** remove the optional enhancement or
  effect before considering any dependency or asset increase.

## Security considerations

- Keep visual refs static, authored, and non-sensitive.
- Do not fetch repository data, execute remote code, embed third-party scripts,
  or add credential-bearing URLs.
- Keep decorative SVG strings static and component-controlled; do not render
  arbitrary user-provided SVG or HTML.
- Do not add analytics, cookies, tracking pixels, or client-exposed tokens.
- Inspect generated HTML, CSS, and JavaScript for absolute personal paths,
  credentials, source-map leaks, and unexpected network endpoints.
- Preserve the existing SonarQube and GitHub Actions trust boundaries.

## Rollback strategy

- Revert the visual phase as one coherent commit while retaining the Phase 1
  design foundation.
- If one effect causes regressions, remove that motion intent and keep its static
  graph and anchor semantics.
- If the visual metaphor does not survive accessibility or performance review,
  keep the section model and simplify the rendering to static connectors and
  markers.
- Do not rewrite shared history or alter the Phase 1 commit.

## Definition of done

- This plan is tracked in English at
  `docs/implementation-plans/02-visual-experience-and-motion.md`.
- The visual showroom direction, Branchline Navigation, Git Tree primitives,
  conceptual refs, diff-state language, and motion vocabulary are documented.
- The visual system is implemented with static Astro components and existing
  semantic tokens, without a new animation dependency or frontend framework.
- Normal anchors, keyboard navigation, focus indicators, mobile behavior, Axe,
  reduced motion, and static fallbacks pass.
- The performance budgets and no-live-Git-data boundary pass review.
- SonarQube receives LCOV coverage from the trusted analysis workflow and the
  configured new-code quality gate remains green without weakening TypeScript
  coverage measurement.
- Phase 3 can consume the visual system without a layout rewrite.
- The plan is changed from planned to complete only after all acceptance criteria
  and review gates pass.
