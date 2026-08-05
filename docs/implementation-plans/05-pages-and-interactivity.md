---
status: in_progress
phase: 5
execution_order: next
plan_created_at: 2026-08-04
plan_reviewed_at: 2026-08-05
plan_review_status: complete
plan_review_method: plan-review
depends_on:
  - docs/implementation-plans/00-project-bootstrap.md
  - docs/implementation-plans/01-design-system-and-layout.md
  - docs/implementation-plans/02-visual-experience-and-motion.md
  - docs/implementation-plans/03-content-and-product-assets.md
  - docs/implementation-plans/04-github-release-integration.md
  - docs/implementation-plans/07-github-pages-deployment.md
deferred_numeric_phases:
  - docs/implementation-plans/06-testing-quality-and-security.md
  - docs/implementation-plans/08-cross-repository-release-trigger.md
source_repository: hermes-agent-ak/git-fanta
implementation_branch: feature/phase-5-pages-and-interactivity
base_branch: feature/phase-4-github-release-integration
target_branch: dev
implementation_started_at: 2026-08-04
ui_quality_bar: award-level discreet AI-assisted design showroom
accessibility_target: WCAG 2.2 AA with EN 301 549-informed EU-oriented implementation
---

# Phase 5 Implementation Plan — Pages and Interactivity

## Objective

Replace the temporary visual-foundation homepage with the first complete Git
Fanta product experience: a polished homepage, a trustworthy release/download
page, an accessible 404 page, and production metadata for a static site. Consume
the normalized Phase 4 release model at build time and keep the approved React
island limited to the genuinely interactive download selector.

The result must meet an award-level UI/UX bar while remaining a discreet,
credible showroom for AI-assisted product design. The showroom quality comes
from hierarchy, spacing, microcopy, purposeful Git-native visual language,
careful states, and interaction craft. It must not come from fake metrics,
unsupported application claims, excessive animation, or client-side complexity.

Accessibility is part of page design, not a later polish pass. The target is
WCAG 2.2 AA with EN 301 549-informed engineering practices where relevant,
including keyboard, screen-reader, zoom/reflow, contrast, reduced-motion,
touch, and error-state behavior. This plan is an engineering target and does
not make a legal conformance or applicability claim for either EU directive.

## Initial current-state findings

The following findings describe the Phase 4 head from which Phase 5 began. The
implementation progress section records what is already present now.

- `src/pages/index.astro` is explicitly temporary. It renders five Phase 2
  experience sections and only exposes the Phase 4 version as a Handoff marker;
  it does not present the final product, features, showcase, workflow,
  downloads, or open-source path.
- `src/pages/download/index.astro` and `src/pages/404.astro` do not exist, so
  the initial information architecture remains incomplete.
- `src/layouts/BaseLayout.astro` emits only title and description metadata. It
  has no canonical URL, Open Graph fields, social image, favicon, or JSON-LD.
- `src/components/site/SiteHeader.astro` and `src/lib/navigation.ts` have no
  internal Download route.
- `src/components/site/SiteFooter.astro`, `src/components/ui/*`,
  `src/components/visual/BranchlineNav.astro`,
  `src/components/visual/GitTreeReveal.astro`, and
  `src/lib/experience-sections.ts` already provide reusable shell, anchor,
  graph, and progressive-motion contracts. Phase 5 must extend them.
- `src/content/product.ts` contains approved source-backed claims. New feature
  copy must retain source paths and review status; Git motifs are not product
  evidence.
- `src/content/assets.ts` records a ready logo, a pending original screenshot,
  and a ready derived showcase. `public/product/git-fanta-showcase.webp` is
  derived project media, not an independently verified application screenshot.
- `src/lib/releases/types.ts` and the Phase 4 loader are the only release
  boundary. Components must receive `LatestRelease` or a smaller serializable
  view model, never raw GitHub data.
- `astro.config.mjs` already supports static output, `SITE_URL`, and
  `BASE_PATH`; new internal URLs must remain safe under `/git-fanta-site/` and
  a future root custom domain.
- `.github/workflows/ci.yml` uses fixture mode, while
  `.github/workflows/deploy-pages.yml` uses live release data. That split must
  remain unchanged.
- `src/styles/global.css` contains the approved dark-first tokens, focus ring,
  reduced-motion rules, Branchline layout, and Git Tree styling. New page
  styles must use those tokens and stay bounded.
- The separate application repository `hermes-agent-ak/git-fanta` is read-only
  source evidence. Its `README.md` and `docs/git-fanta-dag.rst` support product
  and installation copy; unsupported marketing claims remain out of scope.

### Responsive-navigation corrections found during visual review

- The implemented SiteHeader renders all six primary links at every width. At
  320 CSS pixels it wraps into two short rows instead of providing the expected
  conventional global hamburger navigation.
- The uncommitted mobile Branchline follow-up turns local page orientation into
  a second sticky disclosure. With JavaScript disabled it starts open as an
  overlay, and its click handler moves focus back to the summary.
- The 768 CSS-pixel breakpoint switches to the six-column desktop Branchline too
  early: every label truncates and anchor targets can land behind the 142px
  sticky surface. Truncation remains at wider review widths.
- The correction therefore assigns small-screen disclosure ownership to
  SiteHeader, keeps Branchline fully visible and in-flow below 64rem, and makes
  sticky ownership and anchor offsets explicit at every breakpoint.
- Follow-up review found that the resulting two-by-three mobile route card is
  visually too dominant before the hero. A fixed horizontal bottom bar would
  incorrectly present six same-page anchors as primary app destinations and
  permanently reduce the reading viewport. The local route is therefore
  omitted below 64rem; the ordered headings remain the complete mobile path.
- Keeping the desktop header static also allows scrolling text to appear in the
  open space above the sticky Branchline. The final desktop contract keeps both
  surfaces sticky and fills their complete gap with an opaque page-background
  layer.
- Final mobile review found that the inset primary-navigation card still reads
  as a modal floating over the hero. The compact disclosure therefore becomes
  a full-viewport-width, in-flow extension attached directly to the header row;
  this shallow link set needs no scrim, drawer, dialog, or focus trap.

## Scope

### 1. Write the page-experience contract first

Create `docs/design/phase-5-page-experience-contract.md` before composing page
markup. For every named pattern it must define purpose, content/state model,
semantic HTML, keyboard behavior, screen-reader behavior, responsive behavior,
reduced-motion behavior, no-JavaScript fallback, and a measurable performance
budget.

#### Primary Navigation — global disclosure pattern

- Keep `src/components/site/SiteHeader.astro` as the only global site
  navigation on every route.
- Below 64rem, render one compact sticky header row with the brand and a
  conventional hamburger disclosure. Its ordinary links remain grouped as
  internal site destinations followed by external project destinations, retain
  `aria-current="page"`, and remain usable without JavaScript.
- Use a native `<button>` with `aria-expanded` and `aria-controls` to disclose
  normal navigation links; do not apply an ARIA `menu`/`menuitem` interaction
  model to website navigation.
- Make the disclosed surface span the viewport below 64rem and attach it flush
  to the header row. It must expand the header in document flow rather than
  overlay page content, while its inner padding follows the responsive page
  gutter. Do not add a scrim, drawer, dialog semantics, body-scroll lock, or
  focus trap for this shallow navigation.
- Keep one link-group column on narrow phones, switch to two balanced columns
  from 40rem through 63.99rem, and bound the panel height on short landscape
  viewports so the links scroll without moving the close control off-screen.
- Below 64rem, keep the footer identity but hide its duplicate primary-link
  list. Preserve the footer navigation at and above 64rem, where it remains a
  useful end-of-page route set without competing with the compact header.
- Give the toggle and disclosed links at least 44 CSS-pixel targets. The panel
  must close through its toggle and, when enhanced, Escape/outside activation,
  without trapping focus or depending on motion.
- At and above 64rem, show the complete inline primary navigation and keep the
  header sticky at the viewport top with an opaque page background.

#### Branchline Navigation — local orientation pattern

- Reuse `src/components/visual/BranchlineNav.astro` and
  `src/lib/experience-sections.ts` for real homepage anchor navigation.
- Map every item to a meaningful section with visible state and
  `aria-current="location"`; keep conceptual refs labelled as design metadata.
- Below 64rem, omit the local route surface. Do not replace it with a fixed
  bottom bar or horizontally scrolling anchor rail; preserve the full reading
  viewport and rely on the ordered section headings and document flow.
- From 64rem through 79.99rem, use a sticky six-column route map with its intro
  on a separate row. At and above 80rem, use the compact side-by-side sticky
  presentation. Labels and conceptual refs must never truncate.
- At and above 64rem, keep SiteHeader and Branchline sticky as one visual stack.
  Fill the entire viewport-width gap between them with an opaque page-background
  layer so page content cannot show through while scrolling.
- Keep same-page anchors available without JavaScript wherever Branchline is
  displayed. Active-state enhancement may update `aria-current`, node tone, and
  visual state but must not move focus, scroll the page, open a panel, or close a
  disclosure.
- Use breakpoint-specific anchor offsets so the complete sticky stack never
  obscures target section metadata or headings. No scroll hijacking, canvas, or
  JS-only navigation.
- Keep heading/content order complete if the visual map is unavailable.

#### Git Tree Reveal — progressive continuity pattern

- Reuse `src/components/visual/GitTreeReveal.astro` and existing motion intents.
  The graph is decorative continuity, never the source of information.
- Keep the complete static state in server-rendered HTML. Unsupported browsers
  get the final static state and reduced-motion users get it immediately.
- Limit new motion to transform, opacity, color, and small SVG stroke changes.
  No WebGL, canvas, autoplay media, animation library, scroll loop, layout
  animation, `transition: all`, or unbounded `will-change`.
- Keep the documented budget at or below the existing 320 ms intent maximum;
  decorative motion uses no runtime JavaScript.

#### Release Trace — verified build-state pattern

- Add a named release surface using only `version`, `title`, `publishedAt`,
  `releaseUrl`, and classified assets from `LatestRelease`.
- Distinguish build-fetched release data from conceptual Git refs.
- Show explicit unavailable/unsupported states; never manufacture asset links.
- Keep release notes as bounded plain metadata or a GitHub link. Do not render
  raw GitHub Markdown or HTML in this phase.

#### Download Selector — decision-support pattern

- Implement `src/components/download/DownloadSelector.tsx` as the only new
  interactive React island.
- Use a native `<fieldset>`/`<legend>` and radio inputs, or an equally strong
  native semantic control. Each option exposes platform, artifact, file name,
  and a descriptive action link.
- Highlight a recommendation only as convenience. Manual selection remains
  available for Windows installer, Linux AppImage, Linux portable, macOS ZIP,
  Python wheel/source, checksums, and the complete release when present.
- OS detection may preselect a recommendation after hydration, but must never
  be required and must never start a download.
- Include keyboard-operable instructions for unsigned builds,
  SmartScreen/Gatekeeper, checksum verification, and installing alongside
  git-cola. Commands must come from the application README.
- Server-render the complete direct-link list as the no-JS fallback. Hydration
  enhances it but is never the only way to reach a release asset.
- Announce selection/unavailable states through a concise `aria-live="polite"`
  status region without stealing focus; keep the actionable link outside the
  status announcement so it is not redundantly re-read.

#### Clean hierarchy and showroom surface — composition pattern

- Give each region one dominant purpose and one primary action. The homepage
  leads from identity to evidence, workflow, download, and open-source trust.
- Use orange and diff colors as state accents, not decoration-only noise.
  Preserve readable line length, whitespace, and visible focus at 320, 768, and
  1440 CSS pixels.
- Make memorable details purposeful: Branchline progression, release trace,
  derived-showcase framing, copyable release metadata, and download confidence.
  No fake activity, testimonials, ratings, counters, pricing, or badges.
- Label the WebP as derived project showcase media in visible nearby context
  and alternative text. Do not call it an official screenshot.

### 2. Add source-backed content models

Create `src/content/features.ts` and `src/lib/home-sections.ts`.

`src/content/features.ts` must model each message with a stable id, title,
description, semantic tone, source repository/path/section, `approved` or
`pending-review` status, and an optional evidence note. Public feature cards may
use only approved entries.

Initial evidence may come only from:

- `hermes-agent-ak/git-fanta/README.md`: Git GUI identity,
  git-cola relationship, GPL-2.0 inheritance, GitHub Releases, runtime
  requirements, installation alongside git-cola, and precisely worded optional
  features;
- `hermes-agent-ak/git-fanta/docs/git-fanta-dag.rst`: the advanced
  history visualizer, graph view, revision ranges, diffing, context-menu
  actions, and documented shortcuts; and
- the normalized Phase 4 release model for current version, date, assets, and
  release URL.

Do not turn every command or implementation detail into a marketing feature.
Source metadata must remain beside the content so review can reject overclaiming.

`src/lib/home-sections.ts` must define section order using the existing
`ExperienceSection` shape and add each section's heading/content key. It must
be possible to pass the result directly to `BranchlineNav.astro`; no lossy
adapter may drop `href`, `ariaLabel`, `ref`, `node`, or `tone`. It must be
impossible to render an unlabelled section without an accessible name.

### 3. Compose the static homepage

Create and use these components from `src/components/pages/HomePage.astro`:

- `src/components/sections/HeroSection.astro` — identity, tagline, approved
  summary, primary Download action, and secondary Repository action;
- `src/components/sections/ProductShowcaseSection.astro` — derived showcase,
  provenance-aware caption, useful alt text, and a visual fallback;
- `src/components/sections/FeatureGridSection.astro` — source-backed cards
  whose meaning does not depend on color or animation;
- `src/components/sections/WorkflowPreviewSection.astro` — restrained Git
  history/workflow explanation using documented behavior only;
- `src/components/sections/DownloadSection.astro` — release handoff, warning,
  checksum path, and `/download/` action; and
- `src/components/sections/OpenSourceSection.astro` — git-cola relationship,
  GPL-2.0 provenance, repository/issues/license links, and source-backed
  contribution path.

`HomePage.astro` owns composition/data wiring, not feature copy or raw release
formatting. `src/pages/index.astro` becomes a thin build entry that loads
product, feature, asset, and release models.

The information architecture must occur exactly once:

```text
Hero → Product showcase → Core features → Git workflow preview → Download → Open source → Footer
```

Every section has a meaningful heading, stable id, ordinary anchor link, and
complete static reading order. Branchline decorates and orients the order but
is never the only navigation path.

### 4. Build a serializable download view model and page

Create `src/components/pages/DownloadPage.astro`,
`src/components/download/ReleaseSummary.astro`,
`src/components/download/DownloadAssetLink.astro`, and `src/lib/downloads.ts`.

`src/lib/downloads.ts` transforms `LatestRelease` into a page-safe model with
known asset kind, platform/artifact labels, filename, byte size, human-readable
size, URL, availability, recommendation, version, publication date, release
URL, checksum, and complete-release URL. It contains no raw API object,
Markdown, token, environment data, or browser state.

Order assets deterministically: Windows installer, Linux AppImage, Linux
portable, macOS ZIP, Python wheel, Python source, checksums, then other/complete
release. Recommend an asset only when that exact classified asset exists.

The page must show the latest version/date, manual platform/artifact selection,
descriptive direct-link names, SHA256SUMS guidance, unsigned-build and
SmartScreen/Gatekeeper wording, the alongside-git-cola statement, and a
complete GitHub Release link. Missing assets show an actionable unavailable
state; no filename is guessed and no page load starts a download.

`src/pages/download/index.astro` calls `loadLatestRelease()` during the static
build and passes only the serializable model to `DownloadPage.astro`. Fixture
and live build behavior must remain the Phase 4 contract.

### 5. Add the React island with a static fallback

`src/components/download/DownloadSelector.tsx` receives a validated,
serializable `DownloadSelectorProps` model. It must render native labelled
controls, synchronize selected asset/action text, preserve the direct-link
fallback, expose selected/unavailable states in text, retain visible focus,
avoid focus stealing, avoid browser API fetches, and remain framework-light.

Hydrate with `client:visible` or `client:idle` only after verifying that the
chosen directive does not delay primary links. JavaScript-disabled and failed
hydration states must remain complete.

### 6. Extend shell, SEO, and metadata

Create `src/lib/metadata.ts` with typed `PageMetadata` and helpers for title,
description, canonical URL, Open Graph/Twitter metadata, social image/alt text,
and conservative `SoftwareApplication` JSON-LD. Emit no unsupported ratings,
prices, or operating-system claims.

Extend `src/layouts/BaseLayout.astro` with canonical, Open Graph, social image,
favicon, and safely serialized JSON-LD while preserving the existing skip link,
header slot, `#main-content`, footer slot, and landmark semantics.

Modify `src/components/site/SiteHeader.astro` and `src/lib/navigation.ts` to add
the internal Download route, preserve `aria-current="page"`, use `siteHref` for
internal URLs, and keep explicit HTTPS external targets with
`noopener noreferrer` for new tabs. The header owns the small-screen hamburger
disclosure and is the only sticky navigation below 64rem. Keep the disclosure
semantic and useful without JavaScript; use any enhancement only for Escape and
outside-click dismissal. At and above 64rem, keep the inline header sticky and
coordinate its height with the Branchline sticky offset.

Create `public/favicon.svg` as an owned code-native favicon. Create
`src/pages/robots.txt.ts` as a prerendered Astro endpoint so its sitemap URL is
derived from the configured site and `BASE_PATH` rather than being frozen to one
deployment. Create the owned `public/social/git-fanta-social-preview.svg` with
the approved logo/name/tagline and no unsupported product claim. Record any
non-code asset in `docs/content/asset-licenses.md` and `src/content/assets.ts`
first.

The robots endpoint must export a prerendered `GET` response with
`Content-Type: text/plain; charset=utf-8`, `User-agent: *`, `Allow: /`, and one
absolute `Sitemap:` URL derived from the configured site/base. It must not read
request headers or accept user-provided URLs.

Add the official `@astrojs/sitemap` integration to `astro.config.mjs`, preserve
`SITE_URL`/`BASE_PATH`, and lock the dependency in `pnpm-lock.yaml`. Do not add
a manifest without a concrete benefit.

### 7. Implement the accessibility and responsive bar

The implementation must provide one `lang`, one `main`, labelled header/nav/
footer landmarks, logical h1→h2→h3 hierarchy, skip-link and keyboard paths,
visible focus against every surface, descriptive image/link names, and state
meaning that does not rely on color alone.

Keep the layout usable at 320 CSS px, 200% zoom, 400% zoom/reflow, and text
spacing overrides. Wrap refs, filenames, code samples, and release names; no
critical horizontal overflow is allowed. Interactive controls must meet at
least a 24 by 24 CSS-pixel target where WCAG exceptions do not apply, with 44
CSS pixels preferred for primary actions and required for the mobile navigation
toggle and disclosed navigation links. Native details/radio controls must work
with keyboard, touch, and assistive technology.

Reduced-motion users receive the final static content immediately. No action
depends on animation completion. Review forced-colors/high-contrast behavior
where supported. Missing assets, unsigned builds, checksum absence, and
unsupported platforms are explicit text states. No interaction steals focus or
opens a download without explicit activation.

Use this wording for the engineering scope where needed: “WCAG 2.2 AA target
with EN 301 549-informed UI engineering; legal applicability and formal
conformance require a separate audit.”

### 8. Add page-level tests without absorbing Phase 6

Add `tests/unit/features.test.ts` for source metadata and claim validation,
`tests/unit/downloads.test.ts` for ordering/recommendations/formatting/missing
assets, `tests/e2e/pages.spec.ts` for homepage/404 behavior,
`tests/e2e/downloads.spec.ts` for release links/selection/warnings, and
`tests/e2e/metadata.spec.ts` for canonical/social/favicon/robots/sitemap/JSON-LD.

Extend existing tests only where their Phase 1–4 contracts change. Do not
delete Branchline, motion, content provenance, release-loader, or base-path
tests. Axe must cover `/`, `/download/`, and `/404.html` after final markup
exists. Phase 6 owns the final quality harness, performance, security, and CI
gate expansion.

## Explicit non-scope

- Phase 6's full testing, performance, security, Dependabot, dependency-review,
  Lighthouse, SonarQube, and CI quality-gate expansion.
- Phase 8's changes in `hermes-agent-ak/git-fanta`, including its
  release dispatch, README link, secrets, and remote rules.
- Application behavior changes, runtime API, server adapter, database, CMS,
  authentication, cookies, analytics, or browser-side GitHub requests.
- Blog, docs portal, changelog, accounts, pricing, ratings, testimonials, fake
  activity, fake assets, or invented features.
- Full React rewrite, automatic download, mandatory OS detection, or automatic
  platform-only routing.
- Presentation of `media/screenshot.webp` as an approved official screenshot.
- Formal legal accessibility certification or a claim that either Directive
  (EU) 2019/882 or Directive (EU) 2016/2102 applies without legal review.
- Full browser/device matrix and production Lighthouse gate; Phase 6 owns them.

## Dependencies

### Repository dependencies

- Phase 1 provides design tokens, BaseLayout, SkipLink, buttons, cards,
  containers, focus ring, and global CSS.
- Phase 2 provides Branchline Navigation, Git Tree Reveal, conceptual refs,
  motion intents, progressive fallback, and the visual decision log.
- Phase 3 provides product/assets content, the approved logo, derived showcase,
  and provenance ledger; the pending screenshot remains unavailable.
- Phase 4 provides `src/lib/releases/types.ts` and
  `src/lib/releases/release-loader.ts`; live failures remain fail-closed.
- Phase 7 provides static Pages deployment and the `SITE_URL`/`BASE_PATH`
  contract. The application repo is read-only source evidence.

### Package and build dependencies

- Add official `@astrojs/sitemap` and update `pnpm-lock.yaml`.
- Keep Astro, React, Zod, Tailwind, Vitest, Playwright, and Axe within the
  approved baseline. Add no UI framework or GitHub API client.
- Preserve fixture mode for local/CI and live mode for deployment.

### Dependency decision

Phase 5 is implementable after Phase 4 because the normalized release model is
complete and Phase 7 provides a live static destination. Phase 6 can measure
the finished pages but is not needed to define their semantic contracts. Phase
8 remains later because it dispatches from the application release workflow.

## Files to create

- `docs/design/phase-5-page-experience-contract.md`
- `src/components/pages/HomePage.astro`
- `src/components/pages/DownloadPage.astro`
- `src/components/pages/NotFoundPage.astro`
- `src/components/sections/HeroSection.astro`
- `src/components/sections/ProductShowcaseSection.astro`
- `src/components/sections/FeatureGridSection.astro`
- `src/components/sections/WorkflowPreviewSection.astro`
- `src/components/sections/DownloadSection.astro`
- `src/components/sections/OpenSourceSection.astro`
- `src/components/download/DownloadSelector.tsx`
- `src/components/download/ReleaseSummary.astro`
- `src/components/download/DownloadAssetLink.astro`
- `src/content/features.ts`
- `src/lib/home-sections.ts`
- `src/lib/downloads.ts`
- `src/lib/metadata.ts`
- `src/pages/download/index.astro`
- `src/pages/404.astro`
- `public/favicon.svg`
- `src/pages/robots.txt.ts` — prerendered, project-base-safe robots endpoint.
- `public/social/git-fanta-social-preview.svg` — owned code-native social image.
- `tests/unit/features.test.ts`
- `tests/unit/downloads.test.ts`
- `tests/e2e/pages.spec.ts`
- `tests/e2e/downloads.spec.ts`
- `tests/e2e/metadata.spec.ts`

## Files to modify

- `docs/master-planning-and-implementation-brief.md` — award-level showroom
  and EU-oriented accessibility requirements.
- `src/pages/index.astro` — replace temporary markup with thin page entry.
- `src/layouts/BaseLayout.astro` — typed document metadata and JSON-LD.
- `src/components/site/SiteHeader.astro` — internal Download route/current state.
- `src/components/site/SiteFooter.astro` — final product/download/recovery links.
- `src/components/visual/BranchlineNav.astro` — final section labels/semantics.
- `src/components/visual/branchline-enhancement.ts` — active state only; no
  responsive disclosure or focus movement.
- `src/lib/experience-sections.ts` — align visual map with final sections.
- `src/lib/navigation.ts` — internal Download item.
- `src/styles/global.css` — bounded page, download, responsive, and fallback CSS.
- `src/content/assets.ts` and `docs/content/asset-licenses.md` only for new
  asset provenance.
- `astro.config.mjs` — official sitemap integration.
- `package.json` — locked sitemap dependency and format scripts that include the
  Phase 5 design/plan documents.
- `pnpm-lock.yaml` — locked sitemap dependency.
- `tests/e2e/visual-experience.spec.ts` — update only changed final-page
  assertions.
- `tests/e2e/design-foundation.spec.ts` — global mobile disclosure behavior.
- `tests/unit/branchline-enhancement.test.ts` — active-state synchronization
  without responsive UI ownership.
- `tests/e2e/content-assets.spec.ts` — derived-showcase assertion if consumed.
- `README.md` — final routes/build note if needed.

## Data structures

The implementation imports the existing `ExperienceSection` from
`src/lib/experience-sections.ts` and `ReleaseAssetKind` from
`src/lib/releases/types.ts`; the following additions must remain compatible
with those established types.

```ts
type FeatureTone = "orange" | "green" | "neutral";
type FeatureStatus = "approved" | "pending-review";

interface FeatureContent {
  id: string;
  title: string;
  description: string;
  tone: FeatureTone;
  sourceRepository: string;
  sourcePath: string;
  sourceSection: string;
  status: FeatureStatus;
  evidenceNote?: string;
}

type HomeSection = ExperienceSection & {
  heading: string;
  contentKey: string;
};

type DownloadPlatform = "windows" | "linux" | "macos" | "python" | "other";

interface DownloadAssetView {
  id: number | null;
  kind: ReleaseAssetKind;
  platform: DownloadPlatform;
  platformLabel: string;
  artifactLabel: string;
  fileName: string | null;
  sizeBytes: number;
  sizeLabel: string;
  downloadUrl: string | null;
  availability: "available" | "missing" | "unsupported";
  recommended: boolean;
}

interface DownloadPageModel {
  version: string;
  title: string;
  publishedAt: string;
  releaseUrl: string;
  completeReleaseUrl: string;
  checksum: DownloadAssetView | null;
  assets: readonly DownloadAssetView[];
}

interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: "website";
  socialImageUrl: string;
  socialImageAlt: string;
  softwareApplication: Record<string, string> | null;
}
```

`HomeSection.id` is the single source for the section anchor and Branchline
link. The download model is serializable and contains no raw API object,
release-notes HTML, environment data, or token. Missing/unsupported known kinds
use `null` for id, filename, and URL instead of guessed values. Recommendation
is only a presentation hint, not a compatibility guarantee. JSON-LD must omit
unsupported `aggregateRating`, `offers`, and `operatingSystem` fields.

## Implementation steps

Execute these steps in order on `feature/phase-5-pages-and-interactivity`,
starting from the Phase 4 head. Keep the working tree reviewable after every
step; do not commit or push until explicitly authorized.

### Step 0 — Branch and evidence preflight

Confirm the Phase 4 head, create the implementation branch only when starting
implementation, and reread the product claims, asset ledger, Phase 2 decision
log, and Phase 4 release types. Record missing evidence as non-rendering state.

### Step 1 — Contract and content models

Create the page-experience contract. Create and unit-test `features.ts` and
`home-sections.ts`. Reject unapproved claims at the model boundary. Preserve
existing Branchline/Git Tree IDs or document every intentional migration.

### Step 2 — Metadata, shell, and navigation

Implement and test `metadata.ts`; extend BaseLayout; add Download navigation;
give SiteHeader the small-screen global disclosure and inline desktop state;
add sitemap, robots, favicon, and owned social asset if selected; verify both
`BASE_PATH=/git-fanta-site/` and `BASE_PATH=/` outputs before page composition.

### Step 3 — Static homepage

Implement focused Astro sections, replace the temporary index, feed the final
section map into Branchline/Git Tree, consume the labelled derived showcase,
and implement the non-sticky small-screen route index plus sticky desktop route
map. Verify 320/375/640/768/1024/1280/1440 layouts before visual polish.

### Step 4 — Download view model/page

Implement pure classification-to-label, ordering, recommendation, byte-format,
and unavailable-state helpers. Add tests for every known asset kind, ambiguous
`.tar.gz`, missing assets, checksums, unknown assets, and malformed inputs.
Compose the static download page with warnings and complete-release fallback.

### Step 5 — React selector

Implement native controls and serializable props. Render direct links before
hydration, enhance with selection/instruction disclosure, and test focus
retention, no-JS output, unavailable announcements, and no auto-download.

### Step 6 — 404, polish, and fallbacks

Implement the accessible 404 route. Add token-based responsive styles,
`overflow-wrap`, focus/contrast states, reduced-motion and forced-colors review,
and meaningful missing-asset/metadata/JavaScript-disabled fallbacks.

### Step 7 — Acceptance review

Run checks sequentially. Use keyboard-only navigation on all routes, review
screen-reader names, 200% zoom/reflow,
320/375/640/768/1024/1280/1440 widths, reduced motion, contrast, landmarks,
headings, link targets, focus behavior, generated HTML, raw API/token leakage,
JSON-LD, and project-base URLs. Update this plan with head, files, evidence,
limitations, and status only after all required checks.

## Commands

Run one command at a time. Do not run fixture and live builds concurrently;
both write `dist/`.

```bash
git status --short --branch
git log -1 --oneline
pnpm add @astrojs/sitemap
GITHUB_API_MODE=fixture pnpm check
GITHUB_API_MODE=fixture pnpm test:unit
GITHUB_API_MODE=fixture pnpm build
GITHUB_API_MODE=fixture pnpm exec playwright test tests/e2e/pages.spec.ts
GITHUB_API_MODE=fixture pnpm exec playwright test tests/e2e/downloads.spec.ts
GITHUB_API_MODE=fixture pnpm exec playwright test tests/e2e/metadata.spec.ts
GITHUB_API_MODE=fixture pnpm exec playwright test tests/e2e/design-foundation.spec.ts tests/e2e/visual-experience.spec.ts
GITHUB_API_MODE=fixture pnpm test:a11y
GITHUB_API_MODE=live pnpm build
pnpm format:check
pnpm exec prettier --check docs/master-planning-and-implementation-brief.md docs/implementation-plans/05-pages-and-interactivity.md docs/design/phase-5-page-experience-contract.md
pnpm lint
git diff --check
```

`pnpm add` must update `package.json` and `pnpm-lock.yaml`. Extend the existing
`format` and `format:check` script inputs to include `docs/design` and the
implementation-plan files touched by Phase 5, or run the equivalent targeted
Prettier check explicitly. Lighthouse,
coverage, SonarQube, dependency-review, and browser-matrix commands remain
Phase 6 work.

## Testing steps

### Unit and type checks

- Validate feature metadata and reject empty/unapproved public claims.
- Test download labels, order, recommendations, byte formatting, missing
  assets, checksums, unknown assets, and complete-release fallback.
- Run all existing release, navigation, asset, content, URL, and visual-motion
  suites without deleting or weakening them.
- Run `pnpm check` after each public component-contract change.

### End-to-end behavior

- Build once in fixture mode and serve that artifact; never race separate builds
  against the same `dist/` directory.
- Assert homepage order/actions, derived-showcase wording, release handoff,
  current navigation, and 404 recovery.
- Assert the full-width, header-attached mobile/tablet global disclosure pushes
  content instead of overlaying it, alongside the omitted compact Branchline,
  desktop inline navigation, opaque two-surface desktop sticky stack, complete
  desktop local-route labels/refs, 44px mobile targets, and no initial
  no-JavaScript Branchline overlay.
- After each Branchline anchor activation, assert the target metadata and heading
  begin below the active sticky surface and focus is not moved to another
  control.
- Assert recognized fixture links, manual selection, warnings, checksum guidance,
  complete-release link, and no automatic download/navigation.
- Run a dedicated Playwright context with `javaScriptEnabled: false` and assert
  that direct release links, warnings, and recovery paths remain present and
  usable without hydration.
- Assert canonical, OG, favicon, robots/sitemap references, and valid JSON-LD.

### Accessibility and manual interaction

- Run Axe on `/`, `/download/`, and `/404.html` with `@a11y`.
- Navigate by keyboard through skip link, header, Branchline, anchors, actions,
  selector, disclosures, direct links, and footer; verify no focus theft.
- Review screen-reader names/announcements for selected, unavailable, warning,
  checksum, and external-link states.
- Review 320/375/640/768/1024/1280/1440 CSS px, 200% and 400% zoom/reflow,
  text-spacing overrides, reduced motion, and forced-colors/high contrast where
  supported.

### Output and security inspection

- Inspect `dist/` for `GITHUB_TOKEN`, raw API fields, raw release Markdown/HTML,
  browser fetches, guessed asset URLs, and unsupported schema fields.
- Verify internal URLs under `/git-fanta-site/` and root base configuration.
- Parse JSON-LD; verify HTTPS external targets and `noopener noreferrer` for
  new tabs.

## Implementation progress

The implementation is in progress on
`feature/phase-5-pages-and-interactivity`. The following scope is now present
in the working tree and remains reviewable before commit:

- page-experience contract, final homepage section models, source-backed feature
  content, and the serializable release/download view model;
- base-path-safe metadata, favicon, social preview, sitemap, robots endpoint,
  homepage, download page, accessible 404 page, static Astro sections, and the
  single hydrated Download Selector island;
- responsive/reduced-motion/forced-colors styles, explicit missing and
  unsupported asset states, no-JavaScript release-link fallback, and updated
  unit and Playwright coverage.
- all responsive-navigation corrections are implemented: compact layouts omit
  Branchline, the mobile disclosure is a full-width in-flow extension of the
  header, and desktop SiteHeader and Branchline form one opaque sticky stack.

Completed verification so far: `pnpm check`, `pnpm test:unit`, fixture build,
the dedicated pages/downloads/metadata E2E suites, the full fixture E2E suite,
`pnpm test:a11y`, `pnpm format:check`, targeted documentation formatting,
`pnpm lint`, `git diff --check`, root and deployment base-path builds, live
build, and generated-output inspection. The 2026-08-05 navigation correction
was additionally reviewed at 320/375/640/768/1024/1280/1440 CSS pixels and
verified with 56 unit tests, 32 fixture E2E tests, four dedicated Axe tests,
mobile open/closed and no-JavaScript states, reduced motion, forced colors,
anchor geometry, and horizontal-overflow checks. The follow-up additionally
confirmed zero horizontal overflow and opaque stack geometry in live browser
renders at 320, 768, 1024, and 1440 CSS pixels. The responsive-navigation staged
diff passed final review; broader Phase 5 acceptance remains before this plan can
be marked complete. The final attached-panel follow-up passed visual review at
320/375/640/768/1024/1280/1440 CSS pixels and also verified that opening the
sticky header after scrolling pushes content instead of covering the reading
position. Compact footer review additionally removed the duplicate link list
below 64rem while retaining the product identity and complete desktop footer
navigation.

## Acceptance criteria

- [ ] The page-experience contract names Branchline, Git Tree Reveal, Release
      Trace, Download Selector, and clean showroom patterns with states,
      fallbacks, accessibility behavior, and performance budgets.
- [ ] Homepage order is Hero, Product showcase, Core features, Git workflow
      preview, Download, Open source, Footer, exactly once.
- [ ] `/`, `/download/`, and `/404.html` are statically generated and preserve
      skip link, `#main-content`, landmarks, and heading hierarchy.
- [ ] Temporary foundation copy is replaced with source-backed Git Fanta
      content and purposeful Git-native composition.
- [ ] The derived showcase is labelled as derived media; the pending screenshot
      is never presented as official.
- [ ] Every public feature claim has source path/section metadata; no
      unsupported feature, rating, testimonial, metric, price, or OS claim is
      emitted.
- [ ] Phase 4 `LatestRelease` is transformed to a page-safe model; raw GitHub
      responses never reach components.
- [ ] Known Windows, Linux, macOS, Python, and checksum assets are exposed when
      present, plus the complete GitHub Release link.
- [ ] Ordering and labels are deterministic; missing assets are explicit and no
      filename is guessed.
- [ ] Manual selection always works; OS detection is optional and no page load
      begins a download.
- [ ] Selection and unavailable states use concise text/`aria-live="polite"`
      announcements without moving focus or redundantly re-reading the action.
- [ ] Unsigned-build, SmartScreen/Gatekeeper, SHA256SUMS, and alongside-git-cola
      guidance is visible.
- [ ] Only `DownloadSelector.tsx` is hydrated React; all other content is static
      Astro and useful without JavaScript.
- [x] Below 64rem, SiteHeader is the only navigation surface and exposes a
      conventional 44px hamburger disclosure; Branchline is omitted rather than
      repurposed as a fixed or horizontally scrolling bottom bar.
- [x] Below 64rem, the disclosed primary navigation spans the viewport, attaches
      directly to the header row, and pushes page content instead of overlaying
      it; it introduces no modal or drawer behavior.
- [x] Below 64rem, the footer retains its product identity without repeating the
      primary-link list; at and above 64rem all footer links remain available.
- [x] At and above 64rem, SiteHeader and Branchline form an opaque sticky stack;
      content never appears between them while scrolling.
- [x] Desktop Branchline labels and conceptual refs remain fully visible;
      same-page navigation never moves focus and the complete sticky stack does
      not obscure section metadata or headings.
- [ ] Canonical, title, description, OG, social image, favicon, robots, sitemap,
      and conservative SoftwareApplication JSON-LD are base-path-safe.
- [ ] Pages work at 320/375/640/768/1024/1280/1440 CSS px, 200% and 400%
      zoom/reflow, and text spacing overrides without critical overflow;
      controls meet the documented target-size contract.
- [ ] Keyboard, focus, names, landmarks, headings, contrast, native controls,
      reduced motion, and non-color states pass review and Axe.
- [ ] Missing release/assets, JS disabled, unsupported platform, media failure,
      and 404 recovery have understandable fallbacks.
- [ ] Fixture checks are deterministic, live production remains live-only, and
      no token/raw release content reaches client output.
- [ ] Phase 6 remains responsible for final Lighthouse/performance/security
      gates; Phase 5 supplies the contracts and page tests.

## Failure cases

| Failure                                    | Required behavior                                                    |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Claim lacks source metadata                | Reject at content boundary; do not render.                           |
| Claim is pending review                    | Keep out of public copy or mark non-public review state.             |
| Derived showcase is missing                | Descriptive text/fallback keeps product story usable.                |
| Pending original screenshot is encountered | Never publish it as official media.                                  |
| Live release request fails                 | Preserve Phase 4 fail-closed behavior and previous Pages deployment. |
| Known asset is absent                      | Show unavailable state and complete-release link; never guess.       |
| Unknown asset exists                       | Keep it behind a clearly labelled other/complete-release path.       |
| No checksum asset                          | State that SHA256SUMS is unavailable; do not imply verification.     |
| Release notes contain markup               | Link to GitHub or bounded plain metadata; never inject it.           |
| React disabled/hydration fails             | Server-rendered links and instructions remain complete.              |
| OS cannot be determined                    | Manual platform selection and all available links remain visible.    |
| Selection changes                          | Update text/action without focus movement or download.               |
| Reduced motion enabled                     | Show final static graph/content immediately.                         |
| Mobile global navigation opens             | Expand a full-width header surface in flow; no modal/menu role.      |
| JavaScript is unavailable on the homepage  | Header links and desktop local-route links remain operable.          |
| Branchline anchor is activated             | Preserve focus and reveal target metadata/heading below sticky UI.   |
| Breakpoint boundary is crossed             | Omit compact Branchline or form the opaque desktop sticky stack.     |
| 320px/reflow overflows                     | Wrap/reflow refs, filenames, and controls before acceptance.         |
| Project-base URL breaks                    | Resolve through `siteHref`/configured site.                          |
| JSON-LD malformed/unsupported              | Omit field or fail metadata test; never mislead.                     |
| New-tab external link                      | Use HTTPS and `rel="noopener noreferrer"`.                           |
| Graph precedes meaningful content          | Keep graph aria-hidden/pointer-inert and DOM order logical.          |

## Security considerations

- Keep `GITHUB_TOKEN` build-only; never pass it to React, `PUBLIC_` variables,
  HTML, client JavaScript, JSON-LD, source maps, logs, or download URLs.
- Treat release fields as untrusted build input. Validate with Phase 4, escape
  metadata, avoid raw HTML/Markdown, and pass only the narrow view model.
- Permit downloads only through validated HTTPS URLs from the normalized model;
  never construct URLs from filenames.
- Do not accept user URLs/HTML/query parameters as page content.
- Do not auto-download, auto-navigate, or steal focus during hydration.
- Keep external links explicit; do not add analytics, embeds, remote fonts, or
  unnecessary runtime dependencies.
- Keep JSON-LD limited to approved product data and safely serialize strings.
- Automated Axe results are not formal legal accessibility certification.

## Rollback strategy

- Revert page/component changes while preserving Phase 4 release modules and
  Phase 7 deployment if final composition fails review.
- If only the selector fails, remove hydration and retain server-rendered links.
- If sitemap/metadata fails, disable only that integration and correct it in a
  focused follow-up; do not remove static pages.
- Remove a problematic social asset and metadata reference while retaining
  text metadata and the code-native favicon.
- Never restore the pending screenshot as official media. Keep the Phase 4
  Handoff marker only as a documented emergency page rollback.

## Definition of done

Phase 5 is done when all acceptance criteria and ordered tests pass, the three
routes are static and base-path-safe, the page-experience contract matches the
implementation, source-backed content and asset provenance checks pass, and no
generated or secret material is unreviewed. The plan then records implementation
head, changed files, test evidence, known limitations, and the Phase 6 handoff.

## Review decision

This plan remains ready for implementation after its responsive-navigation
correction was reviewed against the repository and rendered UI on 2026-08-05
with the `plan-review` workflow:

- every existing file reference and dependency path was checked against the
  current checkout;
- the planned new paths were confirmed absent and therefore genuinely new;
- existing Branchline, Git Tree, `ExperienceSection`, `siteHref`, BaseLayout,
  Phase 4 loader, fixture/live build split, and Playwright base URL contracts
  were inspected before the plan was finalized;
- SiteHeader now owns the planned global mobile/tablet disclosure, while
  Branchline keeps only local same-page orientation and active-state behavior;
- the breakpoint contract prevents stacked sticky navigation, the 768px layout
  cliff, label/ref truncation, and anchor targets hidden behind sticky UI;
- the `HomeSection` contract was aligned with the existing `ExperienceSection`
  fields so `BranchlineNav.astro` can consume it without a lossy adapter;
- missing release assets now have explicit nullable fields and availability
  states, so the implementation cannot invent file names or URLs;
- robots generation is a prerendered Astro endpoint, making its sitemap URL
  compatible with `SITE_URL` and `BASE_PATH`; and
- the public plan contains no absolute machine paths, secrets, token values, or
  legal accessibility-certification claim.

The Phase 5 scope is executable after the current Phase 4 head. Phase 6 owns
the final quality/security/performance gate and Phase 8 remains correctly
deferred. The responsive-navigation follow-up passed its staged review; pushing
remains subject to explicit user authorization.

## References and legal scope note

- [W3C APG — Disclosure Navigation Menu Example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [GOV.UK Design System — Service navigation](https://design-system.service.gov.uk/components/service-navigation/)
- [U.S. Web Design System — Header](https://designsystem.digital.gov/components/header/)
- [Directive (EU) 2019/882 — European Accessibility Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882)
- [Directive (EU) 2016/2102 — web and mobile accessibility](https://eur-lex.europa.eu/eli/dir/2016/2102/oj/eng)
- [ETSI accessibility resources](https://www.etsi.org/accessibility/)
- [MDN scroll-driven animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines)
- [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)
- [web.dev animation performance](https://web.dev/articles/animations-and-performance)
- [Awwwards Moha. Auf interaction reference](https://www.awwwards.com/sites/moha-auf-experience-expert)
- [Awwwards dynamic-grid references](https://www.awwwards.com/websites/dynamic-grid-layout-examples/)

The EU directives and EN 301 549 references establish an engineering context,
not a legal opinion that either directive applies to this private website.
Automated tests are not formal legal conformance certification.
