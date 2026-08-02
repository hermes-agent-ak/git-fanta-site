---
status: planned
phase: 1
depends_on:
  - docs/implementation-plans/00-project-bootstrap.md
implementation_branch: feature/phase-1-design-system-and-layout
base_branch: feature/phase-0-project-bootstrap
target_branch: dev
---

# Phase 1 Implementation Plan — Design System and Layout

## Objective

Implement the reusable visual, layout, and accessibility foundation for Git Fanta's
static Astro website.

This phase establishes semantic design tokens, dark-first global styling, a base
Astro layout, responsive layout primitives, accessible site chrome, keyboard focus
behavior, reduced-motion behavior, and focused regression coverage. It must leave
later product content, screenshots, release data, and download interaction to the
later implementation phases.

## Current-state findings

- Phase 0 is implemented on feature/phase-0-project-bootstrap and contains the
  package manifest, frozen pnpm lockfile, Astro configuration, strict TypeScript
  configuration, Tailwind CSS 4 Vite integration, React integration, the base-path
  helper, global styles, CI, and baseline tests.
- The current implementation branch feature/phase-1-design-system-and-layout is
  based on feature/phase-0-project-bootstrap. The shared dev branch does not yet
  contain the Phase 0 website outputs, so this branch must not be rebased onto dev
  until Phase 0 is integrated. The eventual pull request target remains dev.
- src/styles/global.css already contains preliminary raw color variables, a global
  reset, a focus-visible rule, a skip-link rule, and reduced-motion handling. Phase
  1 must evolve this stylesheet into the approved semantic token contract instead
  of creating a second stylesheet or duplicating those rules.
- src/pages/index.astro currently contains the complete bootstrap document shell:
  one skip link, one header, one primary navigation, one main landmark, one footer,
  and a minimal placeholder message. It imports src/lib/site-url.ts and uses the
  environment-provided Astro base path.
- src/lib/site-url.ts already provides siteHref for joining internal paths to the
  configured project base. Existing callers and tests must continue to use this
  helper.
- tests/unit/site-url.test.ts is the existing unit suite. tests/e2e/bootstrap.spec.ts
  is the existing Chromium/Axe smoke test and is the starting point for the
  design-foundation browser coverage.
- There is no src/layouts directory, no src/components directory, no navigation
  model, and no design-foundation E2E test yet.
- .github/workflows/ci.yml, .github/workflows/build.yml, and
  sonar-project.properties already exist. SonarQube is an optional pre-existing
  quality lane; Phase 1 does not modify or expand it. Baseline CI remains the
  authoritative check for this design-system branch.
- The website must remain static Astro output. React must not be introduced into
  static layout components.

## Scope

### 1. Define the semantic token contract

Extend src/styles/global.css with semantic Git Fanta tokens for:

- background layers and elevated surfaces;
- foreground, muted, and subtle text;
- normal and strong borders;
- Fanta orange accent and contrast-safe hover state;
- success, warning, danger, and informational states;
- focus ring color;
- spacing scale;
- radii;
- shadows; and
- local system sans and monospace font stacks.

Expose the token names through Tailwind CSS 4's CSS-based theme mechanism. Keep
semantic token names in component classes; do not make components depend on raw
hex values.

### 2. Establish global accessibility defaults

Retain the existing global reset and strengthen it with:

- visible focus-visible styling on every keyboard-focusable control;
- selection styling with readable contrast;
- reduced-motion behavior that disables smooth scrolling and non-essential
  transitions;
- readable base typography and safe body defaults;
- no global focus-outline suppression;
- no remote font request; and
- no hover-only information or interaction.

The exact color pairs used by text and controls must satisfy WCAG 2.2 AA in the
implemented surfaces. The plan does not require a new color package.

### 3. Create the semantic Astro layout

Create BaseLayout.astro with:

- one html document structure;
- title and minimal description props;
- the existing global stylesheet import;
- SkipLink before the header;
- one semantic banner/header region;
- one main element with id main-content;
- one footer region; and
- a slot for page content.

Create SkipLink.astro as a static, keyboard-visible link to main-content.
Do not add a client directive or automatic focus management.

### 4. Create small static UI primitives

Create:

- Container.astro for constrained width and responsive horizontal padding;
- Button.astro with link and native-button rendering modes, limited variants,
  limited sizes, and native disabled behavior; and
- Card.astro with semantic tone styles, consistent border/radius/shadow tokens,
  and an optional interactive appearance that does not rely on hover alone.

Use small explicit props. Do not add a UI framework, state store, animation
library, or client-side state to these components.

### 5. Create shared static navigation and site chrome

Create one navigation model in src/lib/navigation.ts for the header and footer,
plus one pure resolver that applies siteHref to internal destinations and leaves
explicit HTTPS URLs unchanged.

Create:

- SiteHeader.astro with a brand link, primary navigation, and keyboard-reachable
  links; and
- SiteFooter.astro with repository, releases, issues, and licence links.

Do not add a Download link until the download route exists in a later phase.
Do not add a fabricated logo asset; the authentic logo belongs to Phase 2.

### 6. Apply the foundation to the bootstrap page

Update src/pages/index.astro to compose BaseLayout, SiteHeader, Container, and
SiteFooter. Keep the page statically rendered and visibly identify the remaining
content as a temporary foundation placeholder. Do not add product claims,
features, screenshots, release information, or download metadata.

A small, explicitly labelled foundation preview may exercise the Button and Card
semantics during this phase. It must not look like final marketing content and
must be removed or replaced by the later page plan.

### 7. Add meaningful regression coverage

Add focused tests for:

- navigation data and base-path-safe internal links;
- the rendered layout landmarks and skip link;
- the accessible names of the brand and primary navigation;
- semantic link versus native-button behavior where the shell exercises both;
- token availability and visible focus behavior;
- reduced-motion behavior; and
- Axe accessibility at the default and narrow mobile viewports.

Do not add snapshot tests or pixel-perfect assertions for static styling.

## Explicit non-scope

- Do not initialize, upgrade, or replace the Astro project. That belongs to
  docs/implementation-plans/00-project-bootstrap.md.
- Do not implement final homepage sections, final product copy, screenshots,
  screenshot attribution, release data, release asset classification, download
  metadata, a download page, a 404 page, SEO metadata, structured data, or the
  React download island.
- Do not add the Git Fanta logo or other product assets. Those belong to
  docs/implementation-plans/02-content-and-product-assets.md.
- Do not add GitHub REST API calls, Zod schemas, fixture release data, or runtime
  network requests.
- Do not add a CMS, backend, server-side rendering, database, authentication,
  cookies, analytics, remote fonts, or a component library.
- Do not convert the site to React or hydrate static layout sections.
- Do not modify .github/workflows/build.yml, sonar-project.properties, or the
  SonarQube trust boundary. Existing SonarQube behavior remains outside this
  phase; later quality work may review it separately.
- Do not modify the Git Fanta application repository.
- Do not modify main or merge this branch as part of the implementation.

## Dependencies

### Required repository state

- docs/implementation-plans/00-project-bootstrap.md is implemented on the branch
  base and its outputs are present.
- Node.js 24 LTS, Corepack, and pnpm 11.4 are available.
- package.json declares pnpm@11.4.0 and the existing check, lint, format, unit,
  E2E, accessibility, and build scripts remain available.
- src/lib/site-url.ts continues to export siteHref.
- The branch is feature/phase-1-design-system-and-layout and is based on the
  latest Phase 0 implementation branch. The pull request targets dev after the
  Phase 0 branch is integrated.
- Chromium is available through the repository's Playwright setup. The default
  local browser project remains Chromium only.

### Existing contracts to preserve

- astro.config.mjs continues to derive site and base from environment values and
  produces static output.
- src/pages/index.astro continues to use the configured base path rather than
  hard-coding the GitHub Pages project path.
- tests/unit/site-url.test.ts remains green without changing siteHref behavior.
- tests/e2e/bootstrap.spec.ts remains green or is deliberately folded into the
  new design-foundation suite with equivalent coverage.

## Files to create

- src/layouts/BaseLayout.astro — semantic document and slot structure.
- src/components/ui/SkipLink.astro — keyboard-only skip link.
- src/components/ui/Container.astro — responsive width and padding primitive.
- src/components/ui/Button.astro — typed link/button primitive.
- src/components/ui/Card.astro — typed static card primitive.
- src/components/site/SiteHeader.astro — accessible static header and navigation.
- src/components/site/SiteFooter.astro — accessible static footer links.
- src/lib/navigation.ts — shared typed navigation data.
- tests/unit/navigation.test.ts — navigation contract and URL behavior tests.
- tests/e2e/design-foundation.spec.ts — Chromium layout and accessibility tests.

## Files to modify

- src/styles/global.css — replace preliminary raw variables with the semantic
  token contract while preserving required Tailwind import and existing useful
  reset behavior.
- src/pages/index.astro — compose the new layout and site components around the
  bootstrap placeholder shell.
- tests/e2e/bootstrap.spec.ts — retain as a compatibility smoke test or move its
  assertions into design-foundation.spec.ts without losing coverage.
- tests/unit/site-url.test.ts — modify only if navigation coverage exposes a real
  missing base-path case in siteHref.
- docs/implementation-plans/01-design-system-and-layout.md — update status and
  completion notes only after implementation and verification.

Do not add a new dependency for component testing. The static Astro components
are verified through Astro checking, production build output, browser behavior,
and accessibility tests; adding a test framework solely to inspect generated
markup would not add proportional value.

## Data structures

### Semantic token groups

Use the following semantic groups in src/styles/global.css. The implementation
must choose concrete values and verify their intended contrast pairs.

| Group      | Required token concepts                          |
| ---------- | ------------------------------------------------ |
| Background | page, surface, elevated surface, inverse surface |
| Foreground | primary, muted, subtle                           |
| Border     | normal, strong                                   |
| Accent     | orange, orange hover, orange contrast            |
| Status     | success, warning, danger, info                   |
| Focus      | visible focus ring                               |
| Spacing    | one consistent compact-to-large scale            |
| Radius     | small, medium, large, pill                       |
| Shadow     | small, medium, accent glow                       |
| Typography | local sans, local mono, display-to-caption sizes |

### Navigation item

src/lib/navigation.ts must export one readonly navigation model and one pure
navigationHref resolver consumed by both site chrome components. Each item has:

| Field       | Rule                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| label       | Descriptive English accessible label                                                         |
| href        | Internal route or explicit public HTTPS URL                                                  |
| external    | True only for public external URLs                                                           |
| currentWhen | Optional route patterns used for aria-current                                                |
| resolver    | navigationHref(item, baseUrl) returns a base-safe internal URL or the unchanged external URL |

The initial static navigation may contain Overview plus repository, releases,
issues, and licence links. It must not contain a download route before that route
exists.

### Component props

Keep APIs small and explicit:

| Component  | Props                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| BaseLayout | title, description, optional main class                                                                           |
| Container  | size: sm, md, lg, xl, or full; optional semantic as                                                               |
| Button     | variant: primary, secondary, ghost, or danger; size: sm, md, or lg; optional href, type, disabled, and aria label |
| Card       | tone: default, accent, success, warning, or danger; optional interactive                                          |

The implementation may define Astro-local prop types or a shared TypeScript type,
but must not introduce state or a second styling contract.

### Accessibility contract

- The page has exactly one main landmark with id main-content.
- The skip link is the first focusable page control and targets main-content.
- The brand link has a descriptive accessible name and points to the base-path-safe
  home URL.
- Primary navigation has an exact accessible label of Primary.
- Interactive controls have visible focus-visible styles.
- Decorative imagery is not introduced in Phase 1, so no fabricated image alt text
  is needed.

## Implementation steps

### Step 0 — Verify branch and reuse boundaries

1. Confirm the current branch is feature/phase-1-design-system-and-layout and
   that its HEAD contains the Phase 0 outputs.
2. Confirm the working tree is clean before implementation.
3. Search src, tests, and docs for existing layout, navigation, button, card,
   skip-link, token, and accessibility abstractions. Reuse existing behavior
   rather than creating a parallel component or helper.
4. Read the actual current implementations of src/styles/global.css,
   src/pages/index.astro, src/lib/site-url.ts, tests/unit/site-url.test.ts,
   tests/e2e/bootstrap.spec.ts, and playwright.config.ts before editing.
5. Confirm .github/workflows/build.yml and sonar-project.properties are outside
   the Phase 1 edit set.

### Step 1 — Create the shared navigation contract with TDD

1. RED: create tests/unit/navigation.test.ts importing the not-yet-created
   src/lib/navigation.ts. Run the focused test. The intended failure is the
   Vitest collection error that the module cannot be resolved.
2. GREEN: create the smallest readonly navigation model with Overview and the
   documented public repository, releases, issues, and licence destinations,
   plus navigationHref(item, baseUrl).
3. Add tests proving that navigationHref resolves an internal Overview item
   through siteHref and leaves public external URLs unchanged. Preserve the
   external flag for public URLs.
4. Add a test proving that no download item is present before the download route
   exists. Assert user-visible navigation policy, not an internal array length.
5. Run the focused navigation test and the full unit suite.

### Step 2 — Replace raw CSS variables with the semantic token layer

1. RED: add a design-foundation browser assertion that reads the computed value
   of the semantic page-background token and expects a non-empty value. The
   current bootstrap stylesheet exposes only the preliminary raw token names,
   so the intended Playwright assertion failure is an empty computed value.
2. GREEN: update src/styles/global.css with the semantic token groups, Tailwind
   CSS 4 theme mapping, local font stacks, contrast-safe focus ring, selection,
   and reduced-motion rules. Preserve useful reset rules and the required
   Tailwind import.
3. Extend the browser test to assert that reduced-motion emulation disables
   smooth scrolling and that a focused control has a visible outline style.
4. Run the focused browser test and the full formatting, lint, check, unit, and
   build checks.

### Step 3 — Create BaseLayout and SkipLink

1. Characterization: run the existing bootstrap E2E test before editing. It must
   pass against the current bootstrap shell; this is an existing-behavior check,
   not a RED test.
2. GREEN: create BaseLayout.astro and SkipLink.astro with no client directive,
   one main landmark, and the documented slot ordering.
3. Update index.astro only enough to render the new layout around the existing
   placeholder content.
4. Assert that the skip link is first in DOM order, targets main-content, becomes
   visible on keyboard focus, and does not move focus automatically on page load.
5. Run the focused browser test and the existing bootstrap test. If the
   characterization test regresses, fix the layout integration before continuing.

### Step 4 — Create Container, Button, and Card primitives

1. RED: add browser assertions against the foundation preview for one link-mode
   Button, one native-button-mode Button, and one Card landmark. Before the
   components exist, the intended failure is a count assertion with
   Expected: 1 and Received: 0 for each semantic locator.
2. GREEN: implement the smallest typed primitives using semantic token classes.
   Button must render an anchor only when href is present and a native button
   otherwise. Card must remain static unless interactive is explicitly requested.
3. Add the minimal, explicitly labelled foundation preview to index.astro so the
   behavior is exercised without inventing product content. Keep it replaceable
   by the later pages plan.
4. Assert that the link has a real href, the native control has its declared
   button type, disabled buttons retain native disabled behavior, and the card
   does not require hover to expose information.
5. Run the focused browser test, full unit suite, and Astro check.

### Step 5 — Create SiteHeader and SiteFooter

1. RED: add exact browser assertions for a banner brand link named Git Fanta
   home, a navigation named Primary, and footer links to the documented external
   destinations. Before implementation, the intended failure is
   Expected: 1 and Received: 0 for the exact brand or navigation locator.
2. GREEN: create SiteHeader.astro and SiteFooter.astro using the shared navigation
   model and siteHref for internal links.
3. Update BaseLayout and index.astro to compose the site chrome. Preserve one
   header, one main, and one footer.
4. Assert keyboard reachability in DOM order, exact accessible labels, external
   link attributes where appropriate, and base-path-safe internal navigation.
5. Run the focused browser test, the bootstrap compatibility test, and the
   accessibility suite.

### Step 6 — Complete accessibility and responsive behavior

1. Characterization: run the existing Axe-tagged test at the default viewport
   before changing the shell. It must pass against the bootstrap baseline.
2. Extend the Axe-tagged test to a narrow 320 CSS pixel viewport and preserve
   the existing default-viewport assertion. If the new component semantics or
   contrast introduce a violation, the test must report it rather than hiding
   it through a suppression.
3. Fix only the semantic, contrast, focus, spacing, or responsive rules causing
   any reported violation. Do not disable Axe rules or add broad suppressions.
4. Add a keyboard-only browser path through the skip link, brand link, primary
   navigation, foundation Button controls, and footer links.
5. Add a manual reduced-motion check if the browser cannot expose the required
   computed transition state reliably in the automated test.
6. Run all project checks and inspect the production output under the configured
   project base path.

### Step 7 — Review the phase boundary

1. Search the final diff for product claims, screenshots, release fields, download
   metadata, client directives, remote font requests, and changes to the existing
   SonarQube files.
2. Compare every rendered sentence to the bootstrap-approved placeholder contract.
3. Confirm that Phase 2 can consume the layout without replacing or bypassing the
   components.
4. Update this plan's status only after all checks and manual review gates pass.

## Commands

Run commands from the repository root on the Phase 1 branch.

### Branch and dependency preflight

    test "$(git branch --show-current)" = "feature/phase-1-design-system-and-layout"
    git status --short --branch
    corepack enable
    pnpm install --frozen-lockfile

The branch must be based on the latest Phase 0 implementation. Do not run a
destructive reset or change the base branch inside the implementation workflow.

### Focused TDD checks

    pnpm test:unit -- tests/unit/navigation.test.ts
    pnpm test:e2e -- tests/e2e/design-foundation.spec.ts
    pnpm test:e2e -- tests/e2e/bootstrap.spec.ts

Run each focused command immediately after its RED or GREEN step. A collection
failure is expected only in the explicitly named RED step; after GREEN, the
focused suite must pass.

### Full verification

    pnpm format:check
    pnpm lint
    pnpm check
    pnpm test:unit
    pnpm test:e2e
    pnpm test:a11y
    pnpm build
    git diff --check

Use pnpm preview for a manual static-output review when needed. Do not introduce
a global browser, scanner, or formatter dependency.

## Testing steps

### Unit tests

- navigation.test.ts verifies the shared item model, external-link markers, and
  the absence of a download route before Phase 4.
- site-url.test.ts remains green and continues to cover home, route, and hash
  joining under the project base.
- No unit test should merely assert that an exported constant equals itself or
  duplicate browser markup assertions that belong in Playwright.

### Browser integration tests

- design-foundation.spec.ts verifies title, one banner, one main, one contentinfo,
  exact primary navigation label, exact brand accessible name, skip-link target,
  keyboard focus behavior, token availability, reduced-motion behavior, link-mode
  and native-button semantics, card rendering, and base-path-safe URLs.
- bootstrap.spec.ts remains green or its equivalent assertions are retained in
  the new suite.
- The test runs against the configured Chromium preview server at the documented
  project base. It must not depend on the application repository at runtime.

### Accessibility tests

- Run Axe at the default desktop viewport and a 320 CSS pixel viewport.
- Verify no serious or critical violation is introduced by the foundation.
- Verify focus indicators are visible without relying on color alone.
- Verify headings, landmarks, link names, button semantics, and DOM focus order.
- Verify reduced-motion behavior through Playwright emulation where observable;
  otherwise record the manual browser check.

### Manual review

- Inspect the shell at approximately 320, 768, and 1440 CSS pixels.
- Confirm no horizontal overflow, clipped focus ring, or hover-only content.
- Navigate the full shell with the keyboard only.
- Inspect generated HTML before JavaScript loads.
- Verify internal URLs include the configured project base and do not assume root.
- Confirm no remote font, analytics, cookie, release, screenshot, or credential
  request reaches the generated output.
- Confirm .github/workflows/build.yml and sonar-project.properties are unchanged.

### Plan-review checks

- Resolve every named current file and symbol against the Phase 0 branch before
  implementation.
- Search for equivalent layout, navigation, token, and test helpers before each
  new file is created.
- Confirm all callers of siteHref remain covered and no changed shared signature
  has an unlisted consumer.
- Syntax-check every indented shell command block and run safe repository-local
  checks from a clean Phase 0-based checkout.
- Scan the plan and generated artifacts for German prose, absolute personal paths,
  credential values, unsafe commands, and leaked build-time values.

## Acceptance criteria

- src/styles/global.css retains @import "tailwindcss" and defines the complete
  semantic token contract without a legacy Tailwind configuration.
- BaseLayout.astro renders one header, one main with id main-content, one footer,
  a first-position skip link, and no client directive.
- SkipLink.astro targets main-content, becomes visible on keyboard focus, and
  does not steal focus automatically.
- Container.astro, Button.astro, and Card.astro have small typed APIs and use
  semantic tokens rather than raw component-specific colors.
- Button links render as real links; native buttons render as native buttons; no
  href="#" button substitute exists.
- SiteHeader.astro and SiteFooter.astro consume one shared navigation model,
  preserve DOM keyboard order, and use siteHref for internal destinations.
- The shell works under the configured GitHub Pages project base.
- Focus-visible indicators, contrast, reduced-motion behavior, touch targets,
  semantic landmarks, and heading structure pass the automated and manual checks.
- The bootstrap smoke test, navigation unit test, design-foundation browser
  tests, Axe tests, formatting, lint, type checking, build, and diff checks pass.
- No final product claim, screenshot, logo, release data, download metadata,
  React island, remote font, analytics, or SonarQube change is introduced.
- The Phase 1 pull request targets dev and contains only design-foundation
  changes on top of the Phase 0 base.

## Failure cases

- **Phase 0 output missing:** stop and report the exact missing file or script;
  do not recreate bootstrap work inside Phase 1.
- **Branch base is wrong:** stop before editing and recreate the feature branch
  from the latest Phase 0 implementation branch through a reviewable Git action.
- **Existing helper duplicated:** remove the duplicate and reuse the existing
  siteHref or navigation seam.
- **Token contrast fails:** adjust the specific semantic pair and rerun Axe and
  the manual contrast review; never hide the failing element.
- **Base path breaks:** fix the existing siteHref or Astro configuration contract;
  do not add root-relative URL exceptions.
- **Primitive semantics fail:** preserve native anchor/button behavior and fix the
  smallest component change; do not make a div act as a button.
- **Axe reports a serious or critical issue:** preserve the failing test, fix the
  semantic or style cause, and do not suppress the rule.
- **Reduced-motion behavior is not observable in automation:** keep the manual
  browser check and verify the CSS media rule directly.
- **Unexpected product content appears:** remove it and defer the wording or asset
  to Phase 2 or a later page plan.
- **SonarQube files change accidentally:** revert only those unrelated changes
  before review; Phase 1 does not alter the optional quality lane.
- **Generated output contains an absolute path or credential:** stop the build,
  remove the source of the leak, and rerun the output audit.

## Security considerations

- Keep the website static and free of runtime requests, cookies, authentication,
  analytics, and credentials.
- Do not place tokens, private keys, credential-bearing URLs, or local absolute
  paths in source, tests, generated HTML, browser bundles, source maps, or logs.
- Do not modify or expose the existing SonarQube secret handling in this phase.
- Use repository-relative paths in tracked configuration and derive the repository
  root at runtime when a command needs it.
- Keep all commands bounded to the repository and its declared build outputs. Do
  not use privilege escalation, unbounded recursive deletion, or remote code
  execution.
- Treat external navigation URLs as public destinations; never add credentials to
  their URLs.
- Confirm production output contains no hidden environment values beyond the
  intentionally public site/base configuration.

## Rollback strategy

- Keep implementation on feature/phase-1-design-system-and-layout until review.
- If a component or token change is rejected, revert the smallest coherent
  implementation commit while keeping the Phase 0 base intact.
- If Phase 1 has merged to dev, use a normal revert commit for the exact Phase 1
  commit or merge commit. Do not rewrite shared history.
- If the foundation preview is not useful, remove only the preview markup while
  retaining the reusable components and their meaningful tests.
- If an accessibility regression appears after merge, revert the specific
  component/style change and restore it through a new tested change.
- Do not delete, rewrite, or reconfigure the pre-existing SonarQube files as part
  of rollback.

## Definition of done

- The Phase 1 plan is tracked in English at
  docs/implementation-plans/01-design-system-and-layout.md.
- The implementation branch is feature/phase-1-design-system-and-layout and is
  based on the Phase 0 implementation branch.
- Semantic tokens, global accessibility styles, BaseLayout, SkipLink, Container,
  Button, Card, SiteHeader, SiteFooter, and shared navigation are implemented.
- The bootstrap page composes the foundation without invented product content.
- TDD RED/GREEN steps were executed for navigation, tokens, primitives, and site
  chrome; the existing layout behavior was preserved through characterization
  coverage and each focused suite was green after its GREEN step.
- Unit, browser, Axe, formatting, lint, type-check, build, and diff checks pass.
- The site works under the GitHub Pages project base and has no remote font,
  analytics, credential, release, screenshot, or logo dependency.
- Existing SonarQube configuration is unchanged and remains outside Phase 1.
- The pull request targets dev and contains no unrelated application-repository
  changes.
- The plan is changed from planned to complete only after all acceptance criteria
  and review gates pass.
