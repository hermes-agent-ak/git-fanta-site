---
status: complete
phase: 3
plan_reviewed_at: 2026-08-03
plan_review_status: complete
completed_at: 2026-08-03
depends_on:
  - docs/implementation-plans/01-design-system-and-layout.md
  - docs/implementation-plans/02-visual-experience-and-motion.md
source_repository: hermes-agent-ak/git-fanta
implementation_branch: feature/phase-3-content-and-product-assets
base_branch: feature/phase-2-visual-experience-and-motion
target_branch: dev
---

# Phase 3 Implementation Plan — Content and Product Assets

## Objective

Create a verified content and asset foundation for the Git Fanta website. The
website must use product facts from hermes-agent-ak/git-fanta, preserve the
provenance and licensing of copied assets, and provide reusable content for the
later page and release-integration phases. The project-owner supplied logo is
the authoritative website brand asset for this phase.

This phase deliberately establishes the content contract before the final
homepage and download page are built. It will copy the authentic Git Fanta logo
after the project owner's direct publication instruction, evaluate the supplied
media, and expose an explicit pending state for any asset that is not approved
for direct publication rather than presenting an unsupported product claim.

## Implemented result

- `src/content/product.ts` exposes four approved claims whose wording and
  provenance point to the Git Fanta application repository.
- `src/content/assets.ts` validates the project-owner supplied vectorized SVG
  logo derived from the PNG, one pending screenshot candidate, and one ready
  derived showcase with both supplied input paths and a recorded
  transformation.
- `public/brand/git-fanta-logo.svg` is the supplied vectorized logo and is
  integrated into the base-path-safe header with decorative alt text and
  visible product naming. It remains compact on mobile and grows to a 56px
  square at desktop widths. The older application SVG is not copied into the
  public brand surface.
- `public/product/git-fanta-showcase.webp` is a 125,982-byte WebP derived from
  the supplied screenshot and logo. The original inputs remain unchanged, and
  the output is explicitly not presented as an independently verified product
  screenshot.
- `docs/content/asset-licenses.md` documents the selected logo's owner
  permission, website-code licensing, the non-selected application SVG
  reference, the composite transformation, and the pending-candidate boundary.
- `scripts/prepare-phase3-media.mjs` provides the deterministic local PNG to
  WebP conversion step for the generated composite and redacts the supplied
  screenshot's machine-specific title-bar path before publication.
- The implementation passes 27 unit tests, 14 browser tests, 3 Axe tests,
  formatting, lint, Astro type checking, build, asset byte comparison, and
  diff validation.

## Pre-implementation findings

- At review time, the Phase 2 visual experience was implemented on the
  predecessor branch and this Phase 3 branch was based on that reviewed tip.
  The site then had
  src/pages/index.astro, src/styles/global.css, src/lib/site-url.ts, the
  Branchline visual components, unit tests, E2E coverage, and no src/content/
  or public/ asset tree.
- Phase 1 is specified in
  docs/implementation-plans/01-design-system-and-layout.md. Its layout and
  site-header outputs are prerequisites for the small shell integration in this
  phase. Phase 3 must not be implemented against a missing Phase 1 or Phase 2
  visual contract.
- Phase 2 is complete on
  feature/phase-2-visual-experience-and-motion. It provides the Branchline
  anchors, readonly experience model, decorative Git Tree primitives, reduced
  motion fallbacks, and the bounded active-section enhancement. Phase 3 must
  consume those contracts and replace only the temporary content, not the
  visual navigation or layout foundation.
- The application repository's authoritative product sources are README.md,
  docs/git-fanta.rst, and docs/git-fanta-dag.rst. The README identifies Git
  Fanta as a Git GUI, describes it as a fork of git-cola, and states that it
  inherits the GPL-2.0 licence. The DAG documentation describes the Git
  history visualizer and its documented operations.
- The application repository contains older logo files at
  fanta/icons/git-fanta.svg, fanta/icons/dark/git-fanta.svg, and
  fanta/icons/git-fanta.ico. These files remain application-source evidence
  only; the project owner explicitly selected the supplied PNG for the website,
  so they are not copied into the public brand surface.
- fanta/icons/README.md and fanta/icons/dark/README.md document mixed
  third-party provenance. In particular, the Git logo is attributed to Jason
  Long and licensed under CC BY 3.0; the icon directories also contain assets
  under MIT, LGPL, and other documented licences. The website must not copy the
  complete icon directory as a single undifferentiated asset bundle.
- A bounded inventory of the application repository found no authentic raster
  screenshots or marketing screenshots. Existing upstream git-cola imagery is
  not a current Git Fanta product asset and must not be presented as one.
- The project owner has supplied media/screenshot.webp in the website
  repository. It is a Phase 3 screenshot candidate, not an unknown stray
  artifact. Its product relevance, alternative text, intended destination, and
  publication permission must still be recorded before it is shipped.
- The project owner has also supplied media/git-fanta-logo.png. The direct
  instruction to use it as the website logo establishes publication permission
  for this project; the asset ledger records that provenance is project-owner
  supplied rather than application-repository sourced.
- The application repository has unrelated uncommitted user changes. Phase 3
  operates only in the website repository and must not modify the application
  repository.
- The pre-implementation source evidence gate was rechecked on 2026-08-03:
  all seven required source paths exist, the two Git Fanta SVG variants have
  the same SHA-256 checksum, and the bounded application asset inventory found
  no raster screenshot to reuse. The source checkout path remains runtime-only
  and is not recorded in this plan.
- The supplied `media/git-fanta-logo.png` is present as a 1024×1024 logo and
  `media/screenshot.webp` is present as a screenshot candidate. The logo is
  selected for direct website use by the project owner's instruction; the
  screenshot remains a pending direct-publication candidate.
- The project owner has now explicitly requested a derived showcase medium
  assembled from the supplied logo and screenshot. This grants publication
  permission for that composite, but does not turn the source screenshot into
  a verified product screenshot. The original inputs remain unchanged and the
  composite must be labelled as derived project media, with its two inputs and
  transformation recorded in the asset manifest and licence ledger.
- GitHub Release data, release asset classification, download metadata, and
  API fetching are Phase 4 responsibilities. Phase 3 must not duplicate those
  responsibilities in a local content file.

## Scope

### 1. Establish a source-backed product content contract

Create a typed, static content module containing only approved product copy.
Every claim exposed to page components must carry its source repository, exact
source path, source section, and review status. The initial approved copy is
limited to facts supported by the application repository:

- the product name Git Fanta;
- the README tagline The highly caffeinated Git GUI;
- the README description that Git Fanta is a powerful Git GUI with a slick and
  intuitive user interface;
- the relationship to git-cola and the inherited GPL-2.0 licence; and
- a DAG/history-visualizer description only when its wording is taken directly
  from the current DAG documentation.

The sentence in the master brief describing a “modernized” fork is not imported
as an approved product fact unless the application repository supplies matching
evidence. This prevents editorial positioning from becoming an unsupported
technical claim.

### 2. Establish a typed asset manifest

Create a manifest that distinguishes ready assets from pending assets. Each
record must contain its source path, destination path, asset kind, alternative
text decision, licence, attribution, and status.

The manifest must contain:

- one ready logo record for the project-owner supplied vectorized SVG derived
  from the supplied PNG;
- one screenshot record for the supplied media/screenshot.webp candidate. It
  remains pending with no destination file until its authenticity, alternative
  text, intended use, and publication permission are documented; and
- one ready derived showcase record built from the two project-owner supplied
  media inputs. It is not presented as an authentic product screenshot and is
  published only under a distinct showcase destination; and
- no release assets, download URLs, unapproved generated previews, or copied
  upstream screenshots.

### 3. Copy the required logo only

Copy the vectorized SVG supplied at the project-owner URL to
`public/brand/git-fanta-logo.svg` and verify that the destination is
byte-identical to the downloaded source. Record `media/git-fanta-logo.png` as
the supplied input and keep the application repository's older SVG out of the
public brand surface. Do not copy the ICO, full icon set, or duplicate logo
variants.

### 4. Preserve attribution and licence boundaries

Create a human-readable asset licence record at
docs/content/asset-licenses.md. It must identify the source repository and
path, original author or copyright holder where documented, original licence
and URL, any transformation, website destination, and the licence boundary
between the website code and the copied asset.

The record must explicitly state that the website's code licence does not
automatically change the licence of copied third-party assets. Any future asset
without clear provenance remains pending and is not copied.

### 5. Integrate the verified logo into the Phase 1 shell

Once the Phase 1 header exists, add the logo to the brand link without adding
client-side JavaScript. The logo must be base-path-safe through the existing
static asset convention, have decorative alternative text when adjacent visible
text already names the product, and remain readable and usable at narrow
viewports.

This is shell integration only. It does not implement the final hero, feature
sections, screenshot presentation, release cards, or download selector.

### 6. Add focused validation and regression coverage

Add pure unit validation for product claims and asset records, plus one focused
browser test for the logo's rendered URL, accessibility semantics, and successful
loading. Assertions must verify user-visible or content-integrity behavior, not
the internal shape of an implementation merely because it exists.

## Explicit non-scope

- Do not implement GitHub REST API calls, Zod schemas, release normalization,
  release asset classification, fixture mode, or download metadata. Those belong
  to docs/implementation-plans/04-github-release-integration.md.
- Do not build the final homepage, download page, 404 page, SEO metadata,
  structured data, or the React download island. Those belong to
  docs/implementation-plans/05-pages-and-interactivity.md.
- Do not create a fabricated product screenshot, screenshot-like SVG, mockup,
  synthetic marketing image, or upstream git-cola image. The explicitly
  requested derived showcase is the sole exception: it must use the supplied
  inputs, be labelled as derived project media, and make no authenticity claim.
- Do not invent statistics, testimonials, user counts, feature guarantees,
  compatibility claims, security claims, performance claims, or release claims.
- Do not copy the complete application icon directory or mix its licences into a
  single website asset package.
- Do not add a CMS, backend, server-side rendering, database, authentication,
  cookies, analytics, remote font dependency, or asset CDN.
- Do not add a release version, download URL, checksum, installer filename, or
  operating-system recommendation to the Phase 3 content module.
- Do not change the Git Fanta application repository, its working tree, or its
  release workflow.
- Do not modify main or merge the feature branch as part of this plan.

## Dependencies

### Required repository state

- docs/implementation-plans/00-project-bootstrap.md is implemented and its
  package scripts remain available.
- The Phase 1 outputs are present and reviewed, including
  src/layouts/BaseLayout.astro, src/components/site/SiteHeader.astro, and
  the base-path-safe navigation contract.
- Node.js 24 LTS, Corepack, and pnpm 11.4 are available.
- The implementation branch is based on the Phase 2 visual-experience branch
  and its pull request targets dev.
- A local checkout of hermes-agent-ak/git-fanta is available through the
  runtime-only GIT_FANTA_SOURCE_ROOT environment variable. Its value must not
  be written to a tracked file.

### Source evidence gates

Before copying or publishing a claim, confirm these source paths exist in the
application checkout:

- README.md
- docs/git-fanta.rst
- docs/git-fanta-dag.rst
- fanta/icons/README.md
- fanta/icons/dark/README.md
- fanta/icons/git-fanta.svg
- fanta/icons/dark/git-fanta.svg

If a source path, claim, or licence statement has changed, stop at the evidence
gate and update the content decision before proceeding.

### Review decision

The plan was ready for implementation on
`feature/phase-3-content-and-product-assets`. The review found no missing
Phase 1/2 dependency or duplicate content/asset abstraction. The first
implementation slice is consequently limited to the source-backed content
contract, typed asset manifest, licence ledger, SVG shell integration, and the
explicitly requested derived showcase; the two supplied media candidates remain
behind their direct-publication evidence gates.

## Files to create

- src/content/product.ts — approved product content, source metadata, and pure
  content validation.
- src/content/assets.ts — typed asset records, pending screenshot state, and
  pure asset-manifest validation.
- tests/unit/product-content.test.ts — content contract and unsupported-claim
  regression tests.
- tests/unit/product-assets.test.ts — asset destination, attribution, licence,
  and pending-state regression tests.
- tests/e2e/content-assets.spec.ts — browser-level logo loading and
  accessibility regression coverage.
- public/brand/git-fanta-logo.svg — the selected project-owner supplied
  vectorized logo only.
- docs/content/asset-licenses.md — asset provenance, attribution, and licence
  boundaries for every copied site asset.
- public/product/git-fanta.webp — create only if the supplied screenshot passes
  the screenshot evidence gate; otherwise keep the candidate pending.
- public/product/git-fanta-showcase.webp — derived, optimized showcase media
  composed from the supplied logo and screenshot without changing either input.
- scripts/prepare-phase3-media.mjs — deterministic local WebP conversion for
  the generated composite output.

The following master-plan artifacts are referenced as future boundaries but are
not created or modified by Phase 3:

- docs/implementation-plans/04-github-release-integration.md
- docs/implementation-plans/05-pages-and-interactivity.md

## Files to modify

- src/components/site/SiteHeader.astro — consume the approved product name
  and selected logo through the Phase 3 content and asset modules, with
  responsive logo sizing that stays compact on mobile and larger on desktop.
  Modify only after the Phase 1 component exists.
- src/pages/index.astro — pass the approved product identity to the shell if
  the Phase 1 implementation currently contains bootstrap-only identity text.
  Do not add final page sections.
- src/styles/global.css — modify only if the authentic logo needs a narrowly
  scoped size or alignment rule that cannot be expressed by the Phase 1 token
  contract.
- eslint.config.mjs — ignore generated coverage reports so local lint remains
  clean after the SonarQube coverage command.
- docs/implementation-plans/03-content-and-product-assets.md — update the
  frontmatter and completion notes after implementation and verification.

Do not modify package.json or add a validation dependency. The content and
asset contracts are simple static data and pure TypeScript; adding a schema
library here would duplicate the Phase 4 API boundary.

## Data structures

### Product content

src/content/product.ts must expose a readonly product object and a validator.
The object contains a product identity plus a list of claims. Each claim has:

| Identity field | Required value or rule                   |
| -------------- | ---------------------------------------- |
| name           | Git Fanta                                |
| tagline        | The highly caffeinated Git GUI           |
| summary        | The README-supported Git GUI description |

| Field            | Required value or rule                                    |
| ---------------- | --------------------------------------------------------- |
| id               | Stable content identifier such as summary or relationship |
| text             | The exact approved website wording                        |
| sourceRepository | hermes-agent-ak/git-fanta                                 |
| sourcePath       | Repository-relative source path                           |
| sourceSection    | Heading or named documentation section                    |
| status           | approved or pending-review                                |

The validator returns deterministic issue strings. At minimum it reports a
missing claim text, missing source path, wrong source repository, or an invalid
status. It must not silently approve a claim with incomplete provenance.

### Asset manifest

src/content/assets.ts must expose a readonly asset manifest and a validator.
Each record has:

| Field            | Required value or rule                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| id               | Stable identifier such as brand-logo or product-screenshot                                   |
| kind             | logo or screenshot in this phase                                                             |
| sourceRepository | Source repository; use hermes-agent-ak/git-fanta-site for supplied candidates                |
| sourcePath       | media/screenshot.webp or media/git-fanta-logo.png for supplied candidates, or null if absent |
| targetPath       | Static output path, or null while pending                                                    |
| status           | ready or pending                                                                             |
| altText          | Explicit text or an explicit decorative-image decision                                       |
| license          | Original licence expression, never an unexplained default                                    |
| attribution      | Author/copyright and provenance statement                                                    |
| sourceUrl        | Public source URL when documented; never a credential-bearing URL                            |
| derivedFrom      | Repository-relative input paths for a derived asset, otherwise an empty list                 |
| transformation   | Recorded preparation/compositing operation, or null for an unmodified asset                  |

Derived records additionally carry `derivedFrom`, a non-empty list of
repository-relative input paths, and a transformation note. A derived record
must not be described as an unmodified or independently verified product
screenshot when the source evidence does not support that claim.

The validator must reject a ready asset with a missing licence, attribution, or
source path. It must require a logo destination under public/brand and a ready
screenshot destination under public/product. It must reject a pending screenshot
that has a destination file. A pending screenshot record may reference the
supplied candidate, but it is metadata and not a published image until the
evidence gate passes. The selected vectorized SVG is ready because the project
owner explicitly requested its publication; its ledger entry must identify the
supplied PNG input and must not imply that it was sourced from the application
repository.

### Accessibility contract for the logo

The header brand link contains visible Git Fanta text and the adjacent logo
uses alt="", because the visible text already names the product. The link
itself remains the accessible name and must point to the base-path-safe home URL.

## Implementation steps

### Step 0 — Reconfirm source and reuse boundaries

1. Confirm the website checkout is clean apart from the intended plan work and
   that the application checkout's existing user changes are untouched.
2. Confirm that Phase 1's header and layout files exist before modifying them.
3. Search the website repository for existing content registries, asset manifests,
   licence ledgers, logo components, and screenshot placeholders. Reuse an
   equivalent implementation if one exists; otherwise create only the files
   listed in this plan.
4. Set GIT_FANTA_SOURCE_ROOT for the local source checkout and verify each
   source evidence gate. Do not place the resolved path in source, tests, plans,
   build output, or logs.
5. Confirm the project-owner supplied vectorized SVG URL and its relationship
   to the supplied PNG. Keep the application SVG comparison as evidence only;
   do not copy the application SVG into the website brand surface.

### Step 1 — Add the source-backed product contract using TDD

1. RED: create tests/unit/product-content.test.ts with a fixture containing a
   claim with no sourcePath. Run the focused test before creating the module.
   The intended initial failure is the Vitest collection error that the import
   ../../src/content/product cannot be resolved.
2. GREEN: create src/content/product.ts with the smallest typed product object
   and validator needed by the test. Make the validator return the deterministic
   missing-source issue rather than accepting incomplete content.
3. Add tests for the approved README identity, the README summary, the git-cola
   relationship, and source metadata. Assert the rendered wording and source
   provenance, not private object implementation details.
4. Add a regression test showing that a claim from an unknown repository is
   rejected with the deterministic wrong-source issue.
5. Run the focused unit file and the full unit suite after the GREEN change.

### Step 2 — Add the asset manifest using TDD

1. RED: add tests/unit/product-assets.test.ts importing the not-yet-created
   ../../src/content/assets module. The intended initial failure is the Vitest
   collection error that the module cannot be resolved.
2. GREEN: create the smallest manifest and validator that represent the ready
   logo and the pending screenshot record.
3. Add behavior tests that reject a ready asset without attribution, reject a
   ready logo whose target escapes public/brand, reject a ready screenshot whose
   target escapes public/product, and reject a pending screenshot with a target
   path.
4. Add a positive test proving that the pending screenshot record references
   media/screenshot.webp, has no destination path, and remains explicitly marked
   for review.
5. Run pnpm test:unit -- tests/unit/product-assets.test.ts and then the full
   unit suite. Keep the validator dependency-free and deterministic.

### Step 3 — Copy and document the selected vector logo

1. Create public/brand and copy only the downloaded vectorized SVG supplied at
   the project-owner URL. Refuse to overwrite an existing destination without
   first comparing it.
2. Verify the destination is byte-identical to the downloaded source and that
   it is a valid standalone SVG without scripts or external image references.
3. Record media/git-fanta-logo.png as the supplied input and write
   docs/content/asset-licenses.md with the vector source URL, direct
   publication permission, selected destination, and no unsupported
   third-party licence claim.
4. Record the website code licence separately from the supplied logo's
   publication permission. Do not label the supplied vector or PNG as MIT,
   GPL-2.0, or CC BY 3.0 without source evidence for that exact file.
5. Do not copy the application SVG, ICO, or any other icon into the public
   brand surface.

### Step 4 — Integrate the logo into the Phase 1 shell

1. RED: add tests/e2e/content-assets.spec.ts with a semantic locator for the
   banner's Git Fanta home link and its logo image. Before integration, the
   intended failure is a Playwright count assertion of Expected: 1 Received: 0
   for the logo locator.
2. GREEN: update SiteHeader.astro to consume the product identity and ready
   logo record, preserve the visible product text, use alt="", and keep the
   home URL base-path-safe.
3. Assert that the rendered image has one matching logo, an empty alt attribute,
   a base-path-compatible URL ending in git-fanta-logo.svg, and a successful
   load.
4. Run the focused browser test at the configured Chromium target. Do not add a
   browser test that depends on the local application checkout at runtime.

### Step 5 — Verify the pending screenshot boundary

1. Inspect media/screenshot.webp as the supplied candidate without modifying the
   source file.
2. Record its source as project-owner supplied, its intended website use, crop
   or resize operation, alternative text, and publication permission in the
   asset manifest and licence ledger.
3. If the candidate is confirmed as an authentic Git Fanta screenshot, promote
   it to ready and copy it to public/product/git-fanta.webp. Otherwise keep the
   candidate pending and create no destination image.
4. If another authentic screenshot becomes available during implementation,
   stop and record its source, permission or licence, crop/resize operation,
   alternative text, and destination before adding it. Do not silently change
   the pending record to ready.

### Step 5a — Compose the requested showcase medium

1. Use the project-owner supplied `media/screenshot.webp` as the edit target
   and `media/git-fanta-logo.png` as the supporting compositing input. Preserve
   the screenshot's visible interface and do not invent product controls,
   claims, statistics, or release information.
2. Produce `public/product/git-fanta-showcase.webp` as a bounded, responsive
   WebP suitable for later page integration. The composition may frame the
   screenshot and place the supplied logo in reserved negative space, but it
   must not overwrite either source file.
3. Record both inputs, the transformation, publication permission, alternative
   text, and the fact that the result is derived project media in
   `src/content/assets.ts` and `docs/content/asset-licenses.md`.
4. Keep `product-screenshot` pending unless the screenshot itself is later
   verified as an authentic Git Fanta application capture. The composite is a
   ready showcase asset, not evidence that the input screenshot is authentic.
5. Inspect the output for legible logo edges, no accidental generated text or
   watermark, no absolute local paths, a valid WebP signature, and a reasonable
   file size before adding it to the static output.

### Step 6 — Complete the review gate

1. Re-read every product claim against the current application source checkout.
2. Review all new site assets against docs/content/asset-licenses.md.
3. Inspect the built HTML and static output for missing asset references,
   accidental local paths, unsupported claims, credentials, and copied source
   repository files.
4. Update this plan's status only after the full verification suite is green and
   the pull request is ready for review.

## Commands

Run the following from the website repository. The source checkout path is
runtime configuration and must never be committed.

### Branch and dependency preflight

    set -eo pipefail
    git fetch origin feature/phase-2-visual-experience-and-motion
    git switch -c feature/phase-3-content-and-product-assets origin/feature/phase-2-visual-experience-and-motion
    corepack enable
    pnpm install --frozen-lockfile
    test -n "$GIT_FANTA_SOURCE_ROOT"
    test -f "$GIT_FANTA_SOURCE_ROOT/README.md"
    test -f "$GIT_FANTA_SOURCE_ROOT/fanta/icons/README.md"
    test -f "$GIT_FANTA_SOURCE_ROOT/fanta/icons/git-fanta.svg"
    test -f "$GIT_FANTA_SOURCE_ROOT/fanta/icons/dark/git-fanta.svg"

If the branch already exists, stop before the branch-creation command and
confirm its base rather than creating a second branch with a different name.

### Bounded source inventory and logo comparison

    set -eo pipefail
    find "$GIT_FANTA_SOURCE_ROOT" -maxdepth 4 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' \) -print
    sha256sum "$GIT_FANTA_SOURCE_ROOT/fanta/icons/git-fanta.svg" "$GIT_FANTA_SOURCE_ROOT/fanta/icons/dark/git-fanta.svg"
    cmp "$GIT_FANTA_SOURCE_ROOT/fanta/icons/git-fanta.svg" "$GIT_FANTA_SOURCE_ROOT/fanta/icons/dark/git-fanta.svg" || true

The inventory output is evidence for the screenshot gate. cmp may report a
visual/source difference; that is a review signal, not permission to copy both.

### Controlled asset copy

    set -eo pipefail
    mkdir -p public/brand
    VECTOR_LOGO_SOURCE=/tmp/git-fanta-logo-external.svg
    test -s "$VECTOR_LOGO_SOURCE"
    test ! -e public/brand/git-fanta-logo.svg
    install -m 0644 "$VECTOR_LOGO_SOURCE" public/brand/git-fanta-logo.svg
    cmp "$VECTOR_LOGO_SOURCE" public/brand/git-fanta-logo.svg

The destination remains exactly public/brand/git-fanta-logo.svg. The
application-repository SVG is evidence only and is not copied.

### Focused and full verification

    set -eo pipefail
    pnpm format:check
    pnpm lint
    pnpm check
    pnpm test:unit -- tests/unit/product-content.test.ts tests/unit/product-assets.test.ts
    pnpm build
    pnpm test:e2e -- tests/e2e/content-assets.spec.ts
    pnpm test:a11y
    git diff --check

Run pnpm test as the final combined local test command after the focused tests
are green. Use pnpm preview for a manual static-output check when browser
inspection is required.

## Testing steps

### Unit level

- Validate every approved claim has non-empty wording, a repository-relative
  source path, a source section, and an approved or pending-review status.
- Reject claims from a repository other than hermes-agent-ak/git-fanta.
- Validate that ready assets have a source, destination, licence, attribution,
  and explicit alternative-text decision.
- Reject ready logo destinations outside public/brand, reject ready screenshot
  destinations outside public/product, and reject pending screenshots with a
  destination file.
- Verify that no release metadata or download contract is required by the Phase 3
  modules; those concerns remain absent until Phase 4.

### Integration level

- Build the static site and verify the copied SVG is emitted under the configured
  Astro base path.
- Verify the Phase 1 header exposes one accessible home link with visible
  Git Fanta text and one successfully loaded decorative logo.
- Verify the pending screenshot state does not create a misleading image URL or
  an invented visual asset. If the supplied candidate is approved, verify that
  the emitted image matches the documented source and destination.

### Browser and accessibility level

- Run tests/e2e/content-assets.spec.ts in the default Chromium configuration.
- Run the existing Axe-tagged tests with pnpm test:a11y.
- Check keyboard reachability of the brand link, visible focus styling, one main
  landmark, and absence of a broken image request.

### Manual content and licence review

- Read each rendered product sentence alongside its application source section.
- Confirm the application SVG's CC BY 3.0 attribution remains documented only
  for the non-selected application reference; do not assign it to the supplied
  project-owner logo.
- Confirm the supplied screenshot is either documented as ready with its
  provenance and permission or remains explicitly pending.
- Confirm the derived showcase records both supplied inputs and does not imply
  that the source screenshot is an independently verified product capture.
- Inspect the production output for absolute local paths, source-checkout files,
  credentials, and root-relative URLs that would break GitHub Pages project
  paths.

### Mechanical plan-review checks

- Confirm every path named in this plan is either an existing dependency or an
  explicitly listed create/modify target.
- Re-run repository searches for existing content and asset abstractions before
  implementation; remove any proposed duplicate when an equivalent is found.
- Check the plan and generated documentation for German prose, machine-specific
  absolute paths, credential-shaped values, and unsafe recursive commands.
- Run a complete indented shell-command syntax check and execute each safe repository-local
  verification command from a clean implementation checkout.

## Acceptance criteria

- src/content/product.ts contains only source-backed, reviewable product copy.
- Every approved claim identifies hermes-agent-ak/git-fanta, a repository-relative
  source path, and a source section.
- src/content/assets.ts contains exactly one ready project-owner supplied
  vectorized logo record derived from media/git-fanta-logo.png and one pending
  screenshot record. It also contains one ready derived showcase record with
  both supplied input paths and a transformation note.
- public/brand/git-fanta-logo.svg is byte-identical to the downloaded
  project-owner provided vector source.
- No fabricated product screenshot, mockup, upstream image, release data, or
  download metadata was invented or copied into the site. The supplied
  screenshot remains pending as a direct product asset; only the explicitly
  requested derived showcase is published.
- docs/content/asset-licenses.md documents every copied asset and separates
  website-code licensing from asset licensing.
- The Phase 1 header renders the logo with the documented accessible semantics
  and a base-path-safe home link.
- Unit tests cover content provenance and asset safety; the focused E2E test
  covers visible loading and accessibility behavior.
- pnpm format:check, pnpm lint, pnpm check, pnpm test, pnpm test:a11y,
  pnpm build, and git diff --check pass.
- The implementation pull request targets dev; no application-repo files or
  unrelated working-tree changes are included.

## Failure cases

- **Missing source checkout:** stop before content or asset creation and report
  the missing GIT_FANTA_SOURCE_ROOT evidence gate.
- **Changed or conflicting product source:** do not choose marketing wording by
  preference. Mark the claim pending-review, record the conflict, and obtain
  source-backed wording.
- **Ambiguous asset provenance or licence:** do not copy the asset. Keep it
  pending and record the missing evidence in the licence ledger.
- **Logo provenance ambiguity:** keep the supplied logo publication permission
  and attribution explicit; do not substitute the application SVG or make an
  unsupported licence claim.
- **Existing destination file:** stop the copy command, compare the file, and
  resolve the difference in a reviewable change. Never overwrite it blindly.
- **Supplied screenshot fails the evidence gate:** retain the candidate as
  pending and do not promote the derived showcase into an authentic product
  screenshot or use it to replace the evidence decision.
- **Missing Phase 1 header contract:** stop shell integration and wait for the
  dependency rather than adding a parallel header implementation.
- **Base-path failure:** fix the existing URL/asset integration contract before
  proceeding; do not add a root-relative workaround.
- **Generated output contains local paths, credentials, or source files:** stop,
  remove the offending input from the build path, and rerun the output audit.
- **Test failure:** preserve the failing test, identify the behavior defect, and
  fix the smallest production change. Do not weaken or delete the assertion.

## Security considerations

- The source checkout is used only for bounded, explicit files. Never copy its
  .git directory, environment files, credentials, build caches, or arbitrary
  generated output into the website.
- GIT_FANTA_SOURCE_ROOT is runtime-only configuration. Do not log its resolved
  value or embed it in source maps, HTML, plans, tests, or generated assets.
- Do not add tokens, private keys, authorization headers, credential-bearing
  URLs, or secrets to the content modules, asset ledger, tests, or static output.
- The website is static. Do not introduce a runtime proxy or client-side request
  for the local application checkout.
- Treat copied licence and attribution text as public metadata; verify that it
  contains no accidental local paths or private contact data.
- Use repository-relative paths in all tracked configuration and documentation.
- Keep all shell commands bounded to the named source files and website asset
  directory. Do not use destructive recursive deletion, privilege escalation,
  or unreviewed remote execution.

## Rollback strategy

- Keep all Phase 3 work on feature/phase-3-content-and-product-assets until
  review is complete.
- If the supplied logo's publication permission is withdrawn, remove only the
  exact public/brand/git-fanta-logo.svg file in a follow-up commit and keep the
  manifest record pending. Do not remove unrelated assets or reset the branch.
- If the supplied screenshot is rejected after copying, remove only the exact
  public/product/git-fanta.webp file in a follow-up commit and return its
  manifest record to pending. Preserve media/screenshot.webp unchanged.
- If the content contract is incorrect, revert the specific content, test, and
  documentation commit while preserving the source evidence and review notes.
- If the Phase 1 shell integration causes a regression, revert only the header
  and page integration changes; keep the independently useful content and
  licence validation if its tests remain green.
- After merge, use a normal revert commit for a material rollback. Do not rewrite
  shared branch history.

## Definition of done

- The implementation branch is based on the Phase 2 visual-experience branch
  and has a reviewable pull request containing only Phase 3 changes.
- Product copy is source-backed, typed, validated, and free of unsupported
  claims.
- The project-owner supplied logo is copied once, loads through the GitHub Pages
  base path, and has complete publication-permission documentation.
- The supplied screenshot is either published with documented provenance,
  permission, and accessibility metadata, or remains explicitly pending. No
  fabricated product screenshot exists; the derived showcase is separately
  documented as project media.
- The requested derived showcase medium is published with both input paths,
  transformation metadata, owner permission, and an explicit non-authenticity
  boundary where applicable.
- The Phase 1 shell consumes the verified content and asset contract without
  adding client-side JavaScript or final page features.
- Focused unit, browser, accessibility, formatting, lint, type-check, build,
  and diff checks pass.
- The website repository contains no application-repository modifications,
  credentials, machine-specific paths, or unreviewed copied assets.
- This plan is updated from planned to complete only after all acceptance
  criteria and review gates pass.
