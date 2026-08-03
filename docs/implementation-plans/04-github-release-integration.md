---
status: complete
phase: 4
execution_order: completed
plan_reviewed_at: 2026-08-03
plan_review_status: complete
completed_at: 2026-08-03
implementation_head: 9400a92
depends_on:
  - docs/implementation-plans/00-project-bootstrap.md
  - docs/implementation-plans/01-design-system-and-layout.md
  - docs/implementation-plans/02-visual-experience-and-motion.md
  - docs/implementation-plans/03-content-and-product-assets.md
  - docs/implementation-plans/07-github-pages-deployment.md
deferred_numeric_phases:
  - docs/implementation-plans/05-pages-and-interactivity.md
  - docs/implementation-plans/06-testing-quality-and-security.md
  - docs/implementation-plans/08-cross-repository-release-trigger.md
source_repository: hermes-agent-ak/git-fanta
implementation_branch: feature/phase-4-github-release-integration
base_branch: dev
target_branch: dev
release_endpoint: https://api.github.com/repos/hermes-agent-ak/git-fanta/releases/latest
github_api_version: 2026-03-10
fixture_mode: GITHUB_API_MODE=fixture
---

# Phase 4 Implementation Plan — GitHub Release Integration

## Objective

Fetch the latest published Git Fanta release during the Astro production build,
validate the GitHub response at runtime with Zod, and expose a small normalized
release model for the later download page. The integration must use native
`fetch`, remain deterministic in offline tests through an explicit fixture mode,
and fail closed when production release data cannot be obtained or validated.

The current foundation page will consume only the normalized version as a small
build-time release marker in its existing handoff section. Phase 5 will consume
the complete model for the homepage and download experience; this phase must
not implement platform cards, download selection, release-note rendering, or
automatic downloads.

## Current-state findings

- Phases 0–3 and 7 are complete. The repository is a static Astro site with a
  live GitHub Pages deployment at
  `https://hermes-agent-ak.github.io/git-fanta-site/`.
- `src/pages/index.astro` currently loads source-backed product content and
  renders the Branchline foundation, but it has no release-data dependency.
- `src/content/product.ts` and `src/content/assets.ts` establish the existing
  typed content/provenance pattern. There is no `src/lib/releases/` module.
- `package.json` contains no Zod dependency. The project already uses strict
  TypeScript, Vitest with a Node environment, and Playwright/Axe tests.
- `astro.config.mjs` emits static output with the project-page `site` and
  `base` defaults. A build-time loader can therefore fetch release data without
  introducing a runtime server or browser request.
- `.github/workflows/ci.yml` currently runs the production build and browser
  tests without a release fixture environment. Once the page loads release data,
  CI must use the explicit fixture mode to avoid network and rate-limit
  nondeterminism.
- `.github/workflows/deploy-pages.yml` already builds and deploys from `main`.
  Its build step must use live release mode so a production API failure stops
  the build before a new Pages artifact can replace the current site.
- The GitHub REST API's latest-release response provides `tag_name`, `name`,
  `body`, `html_url`, `published_at`, and an `assets` array containing asset
  identifiers, names, browser download URLs, sizes, download counts, and
  content types. The official [GitHub release API documentation](https://docs.github.com/en/rest/releases/releases?apiVersion=latest)
  documents this response shape and the [release asset documentation](https://docs.github.com/en/rest/releases/assets)
  documents the asset fields.

## Scope

### 1. Add the typed release boundary

Create a `src/lib/releases/` module with separate responsibilities:

- `types.ts` owns the normalized `ReleaseAssetKind`, `ReleaseAsset`, and
  `LatestRelease` types from the master brief;
- `github-release-schema.ts` owns the raw GitHub response schema and has no
  page or fetch side effects;
- `release-classifier.ts` owns pure filename classification;
- `release-client.ts` owns the HTTP request, headers, timeout, optional token,
  response-status handling, and JSON decoding; and
- `release-loader.ts` owns live-versus-fixture mode selection, normalization,
  and the single public `loadLatestRelease` entry point.

Do not pass the raw GitHub response into Astro components. The loader must
return only the normalized model.

### 2. Fetch the latest public release

Use native `fetch` against:

```text
GET https://api.github.com/repos/hermes-agent-ak/git-fanta/releases/latest
```

Send these headers on every live request:

```text
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2026-03-10
```

If `GITHUB_TOKEN` exists in the build environment, send it as an HTTP Bearer
authorization header. If it does not exist, send an unauthenticated request.
Never read `PUBLIC_GITHUB_TOKEN`, expose the token through `import.meta.env`, or
place it in the normalized model or generated output.

Use a bounded request timeout and surface these deterministic errors. The
client accepts an injected `fetch` implementation and a `timeoutMs` option so
tests can control both transport and timeout behavior without sleeping:

- non-2xx response: `Error("GitHub release request failed with HTTP <status>")`;
- invalid JSON: `Error("GitHub release response was not valid JSON")`;
- timeout: `Error("GitHub release request timed out after <timeoutMs>ms")`; and
- other transport failure: `Error("GitHub release request failed: <message>")`.

Schema failures must propagate as `ZodError` instances with the failing field
path available to the caller. An unsupported mode must fail with
`Error("Unsupported GITHUB_API_MODE: <mode>")`.

Use `AbortController`, clear the timer in `finally`, and do not retry
indefinitely. Do not silently use fixture data after a live request fails.

### 3. Validate and normalize the response

Validate the minimum raw response shape with Zod before normalization:

- `tag_name`: non-empty string;
- `name` and `body`: nullable strings;
- `html_url`: valid HTTPS URL;
- `published_at`: non-null ISO timestamp for the normalized release;
- `assets`: array of objects with numeric `id`, non-empty `name`, valid HTTPS
  `browser_download_url`, non-negative integer `size`, non-negative integer
  `download_count`, and nullable `content_type`.

Normalize the fields as follows:

- `tagName` preserves the API tag exactly;
- `version` removes one leading `v` from `tagName` and rejects an empty result;
- `title` uses trimmed API `name`, falling back to `tagName` when the name is
  null or blank;
- `publishedAt` preserves the validated ISO string;
- `releaseUrl` uses the validated `html_url`;
- `notes` converts a null body to an empty string without rendering Markdown;
- `contentType` converts a null asset content type to
  `application/octet-stream`; and
- each asset preserves its API id, name, URL, size, and download count while
  adding exactly one `ReleaseAssetKind` classification.

### 4. Classify known release assets

Classify filenames case-sensitively after trimming surrounding whitespace and
return `other` for unknown names. Apply the specific Linux portable rule before
the generic archive rule so `.tar.gz` remains unambiguous:

| Filename rule                               | Kind                |
| ------------------------------------------- | ------------------- |
| `git-fanta-v*-windows-x86_64-installer.exe` | `windows-installer` |
| `git-fanta-v*-linux-x86_64.AppImage`        | `linux-appimage`    |
| `git-fanta-v*-linux-x86_64.tar.gz`          | `linux-portable`    |
| `git-fanta-v*-macos.zip`                    | `macos-zip`         |
| `git_fanta-*.whl`                           | `python-wheel`      |
| `SHA256SUMS`                                | `checksums`         |
| `git_fanta-*.tar.gz`                        | `python-source`     |
| anything else                               | `other`             |

The classifier must not infer an operating system from content type alone. The
filename is the source of truth for this phase. The Linux portable rule must be
checked before the Python source rule; an unrecognized `.tar.gz` remains
`other` rather than being guessed as a source archive.

### 5. Add deterministic fixture mode

Store a representative raw GitHub response at
`src/lib/releases/fixtures/latest-release.json`. The fixture must contain at
least one asset for every known kind, both Linux archive cases, an unknown asset,
nullable `name`/`body` coverage in a dedicated test payload, and realistic
non-negative numeric metadata. It is test data, not a claim about the current
published release.

The loader contract is:

- `GITHUB_API_MODE=fixture` returns the checked-in fixture through the same Zod
  validation and normalization path;
- unset or `GITHUB_API_MODE=live` performs the live API request; and
- any other mode fails before a build can complete.

Fixture mode is explicit and never an automatic fallback. The production Pages
workflow must set `GITHUB_API_MODE=live`; CI and deterministic local tests may
set `GITHUB_API_MODE=fixture`.

### 6. Integrate the build gate without implementing the download UI

Update `src/pages/index.astro` to call `loadLatestRelease()` during Astro
frontmatter execution and include the normalized `version` in the existing
Handoff section as a concise build-time release marker. Keep the marker plain
text and base-path independent. This proves that a production build cannot
publish a page from stale or missing release data while leaving the final
download composition to Phase 5.

Update the existing E2E coverage to assert that the fixture version appears in
the Handoff section when the suite runs with fixture mode. Do not add a new
page, React island, automatic download, release-note renderer, or platform
selection UI.

### 7. Make CI deterministic and production live

- Add `GITHUB_API_MODE: fixture` to the CI build and E2E steps in
  `.github/workflows/ci.yml`.
- Add `GITHUB_API_MODE: live` to the Astro build step in
  `.github/workflows/deploy-pages.yml`.
- Keep `.github/workflows/build.yml` unchanged; its SonarQube job runs unit
  coverage and does not need to build the release-dependent site.

## Explicit non-scope

- Do not add Octokit or another GitHub API client; native `fetch` is sufficient.
- Do not implement the Phase 5 homepage, download page, 404 page, React
  `DownloadSelector`, platform detection, download initiation, or release-note
  rendering.
- Do not add a runtime API route, server adapter, database, cache service, or
  browser-side GitHub request.
- Do not fetch tags, draft releases, prereleases, commit history, or arbitrary
  repository metadata. Only the latest published release endpoint is in scope.
- Do not trust `repository_dispatch` `client_payload`; Phase 8 owns the sender,
  and this loader independently fetches release data.
- Do not silently fall back to fixture data in live mode.
- Do not expose `GITHUB_TOKEN` or any response field containing private data in
  `PUBLIC_` variables, HTML, JavaScript, source maps, logs, or test artifacts.
- Do not alter the SonarQube runner, its labels, its secrets, or the application
  repository.

## Dependencies

### Repository dependencies

- Phases 0–3 provide the Node 24/pnpm 11.4 toolchain, strict TypeScript,
  static Astro output, existing content contracts, and test layers.
- Phase 7 provides the live Pages workflow whose build failure behavior keeps
  the previous deployed version in place.
- `src/pages/index.astro` is the current build entry point for the release gate.
- `pnpm-lock.yaml` must be updated with the selected Zod version.

### External dependencies

- The public `hermes-agent-ak/git-fanta` repository must expose a latest
  published release through the GitHub REST API.
- GitHub API availability and rate limits must permit an unauthenticated public
  request in production. `GITHUB_TOKEN` remains optional rate-limit support.
- GitHub Actions must continue to provide the Pages build environment and the
  existing repository permissions.

### Dependency decision

Phase 4 depends on the completed deployment boundary so a release-data failure
can fail before artifact publication. It does not depend on Phase 5's page
composition: the temporary Handoff marker is the smallest current consumer, and
the normalized model is the reusable input for the later download experience.

## Files to create

- `src/lib/releases/types.ts` — normalized release types and asset-kind union.
- `src/lib/releases/github-release-schema.ts` — Zod schema for the raw API
  response.
- `src/lib/releases/release-client.ts` — native fetch client with injected
  fetch, headers, optional token, timeout, and status errors.
- `src/lib/releases/release-classifier.ts` — pure filename classifier.
- `src/lib/releases/release-loader.ts` — fixture/live mode selection and
  normalized loader boundary.
- `src/lib/releases/fixtures/latest-release.json` — representative raw API
  fixture.
- `tests/unit/release-client.test.ts` — request headers, token behavior, HTTP
  failure, transport failure, and JSON failure tests.
- `tests/unit/release-schema.test.ts` — raw schema acceptance and rejection
  tests.
- `tests/unit/release-classifier.test.ts` — known filename and ambiguous
  archive classification tests.
- `tests/unit/release-loader.test.ts` — fixture mode, live mode injection,
  normalization, invalid mode, and no-fallback tests.

## Files to modify

- `package.json` — add the Zod runtime dependency without adding an API client.
- `pnpm-lock.yaml` — lock the dependency graph.
- `src/pages/index.astro` — load the normalized release during build and render
  the temporary Handoff version marker.
- `tests/e2e/visual-experience.spec.ts` — assert the fixture release marker
  without changing existing Branchline behavior assertions.
- `.github/workflows/ci.yml` — use fixture mode for deterministic build and E2E
  steps.
- `.github/workflows/deploy-pages.yml` — explicitly use live release mode.
- `README.md` — document live build behavior, optional `GITHUB_TOKEN`, and the
  `GITHUB_API_MODE=fixture pnpm build` offline command.
- `docs/implementation-plans/04-github-release-integration.md` — update status,
  production verification, and completion evidence only after implementation.

No file in `hermes-agent-ak/git-fanta` or its SonarQube workflow should change;
the listed files are all in this website repository.

## Review decision

This plan is ready for implementation after review on 2026-08-03. Its file
references, current build boundaries, existing test commands, Pages workflow,
and normalized release contract were checked against the repository. The
latest-release endpoint was also probed successfully; its Python distribution
assets use `git_fanta-*.whl` and `git_fanta-*.tar.gz`, which the classifier
rules above cover. Future plans 05, 06, and 08 are intentionally deferred and
are not prerequisites for this phase.

## Data structures and workflow contracts

The normalized model is the only release shape allowed beyond the release
loader boundary:

```ts
type ReleaseAssetKind =
  | "windows-installer"
  | "linux-appimage"
  | "linux-portable"
  | "macos-zip"
  | "python-wheel"
  | "python-source"
  | "checksums"
  | "other";

interface ReleaseAsset {
  id: number;
  name: string;
  kind: ReleaseAssetKind;
  downloadUrl: string;
  size: number;
  downloadCount: number;
  contentType: string;
}

interface LatestRelease {
  tagName: string;
  version: string;
  title: string;
  publishedAt: string;
  releaseUrl: string;
  notes: string;
  assets: ReleaseAsset[];
}
```

| Contract              | Required value                                     |
| --------------------- | -------------------------------------------------- |
| Endpoint              | `/repos/hermes-agent-ak/git-fanta/releases/latest` |
| API version header    | `2026-03-10`                                       |
| Accept header         | `application/vnd.github+json`                      |
| Live mode default     | `GITHUB_API_MODE=live` or unset                    |
| Fixture mode          | `GITHUB_API_MODE=fixture`                          |
| Optional token        | `GITHUB_TOKEN`, build-only                         |
| Production build mode | `live`                                             |
| CI/E2E build mode     | `fixture`                                          |
| Failure behavior      | fail the build; keep previous Pages deployment     |
| Page integration      | existing Handoff release-version marker            |

The fixture and live response must pass the same schema and normalization
functions. No caller may branch on raw GitHub field names after normalization.

## Implementation steps

### Step 0 — Confirm the build boundary

1. Confirm the working tree is clean and the implementation branch is based on
   the current `dev` head containing Phases 0–3 and 7.
2. Confirm no existing release client, schema, classifier, or fixture helper is
   present under `src/` or `tests/`.
3. Confirm the current CI build and E2E commands are the only build consumers
   that need fixture mode.
4. Confirm `GITHUB_TOKEN` does not appear in current client-side output or
   `PUBLIC_` configuration.

### Step 1 — Write the failing contract tests

1. Add schema tests for a representative valid response and invalid
   `tag_name`, `assets`, URL, numeric, and timestamp fields. The RED failures
   must be Zod validation failures, not test collection errors.
2. Add classifier tests for every table row, especially
   `git-fanta-v1.2.3-linux-x86_64.tar.gz` as `linux-portable` and
   `git_fanta-1.2.3.tar.gz` as `python-source`.
3. Add client tests that inject a fake `fetch`, assert the exact endpoint,
   method, Accept header, API-version header, optional authorization behavior,
   non-2xx failure, timeout/transport failure, and invalid JSON failure.
4. Add loader tests that prove fixture mode uses the fixture, live mode uses the
   injected client, invalid mode fails, and live failure never returns fixture
   data.

### Step 2 — Implement the smallest release boundary

1. Add Zod with the project package manager and update the lockfile.
2. Implement the raw response schema without leaking raw API types into page
   code.
3. Implement the pure classifier with the specific Linux suffix check before
   the generic source-archive check.
4. Implement the injected client with a bounded timeout and deterministic
   errors.
5. Implement live/fixture selection and normalization in the loader. Keep the
   fixture path explicit and keep the default mode live.
6. Run the focused unit suites and confirm the intended RED tests are green
   after each production step.

### Step 3 — Add the production build gate

1. Update `src/pages/index.astro` to call `loadLatestRelease()` once during
   frontmatter evaluation.
2. Add the normalized version to the existing Handoff section as plain text;
   do not render release Markdown or create download controls.
3. Extend the existing visual-experience E2E test to assert the fixture version
   in the Handoff section.
4. Set `GITHUB_API_MODE=fixture` on CI build/E2E steps and
   `GITHUB_API_MODE=live` on the Pages Astro build step.
5. Update README usage and failure behavior without documenting any token value.

### Step 4 — Verify production and failure behavior

1. Run the fixture-mode quality suite and static preview checks.
2. Run a live `pnpm build` without a token and confirm the public latest release
   can build when the API is available.
3. Run the client and loader failure tests with non-2xx, malformed, and
   transport failures; confirm no stale fixture is returned in live mode.
4. Inspect generated HTML and JavaScript for `GITHUB_TOKEN`, `Authorization`,
   local paths, raw API response fields, and unredacted fixture-only markers.
5. Confirm the deployment workflow still builds in live mode and that a failed
   release request fails before the Pages artifact can replace the deployed
   site.

### Step 5 — Complete the review gate

1. Inspect the diff for duplicated fetch logic, raw response leakage, mutable
   global state, unbounded retries, and accidental page-composition scope.
2. Confirm the existing CI, SonarQube, Pages, base-path, and accessibility
   contracts remain intact.
3. Record the successful fixture and live build checks in this plan.
4. Mark this plan complete only after the normalized model, build gate, fixture
   mode, production failure behavior, and test suite are all verified.

## Commands

Run from the website repository:

```bash
corepack enable
pnpm install --frozen-lockfile
GITHUB_API_MODE=fixture pnpm format:check
GITHUB_API_MODE=fixture pnpm lint
GITHUB_API_MODE=fixture pnpm check
GITHUB_API_MODE=fixture pnpm test:unit
GITHUB_API_MODE=fixture pnpm build
GITHUB_API_MODE=fixture pnpm test:e2e
GITHUB_API_MODE=live pnpm build
git diff --check
```

For deterministic offline development, use:

```bash
GITHUB_API_MODE=fixture pnpm build
```

For production-like verification, use live mode without printing or exporting a
token into a public variable:

```bash
GITHUB_API_MODE=live pnpm build
```

The live build requires network access to the public GitHub API. A failure must
stop the build and leave the prior GitHub Pages deployment untouched.

## Testing steps

### Schema and normalization

- Accept the representative raw GitHub response and reject malformed required
  fields with deterministic validation errors.
- Normalize nullable title/body/content-type fields without passing raw fields
  beyond the loader boundary.
- Preserve IDs, URLs, sizes, download counts, tag names, version, release URL,
  and publication timestamp exactly as specified by the contract.

### Classification

- Cover all known filename kinds.
- Prove the complete `linux-x86_64.tar.gz` suffix wins over the generic tarball
  rule.
- Return `other` for unknown and content-type-only cases.

### HTTP boundary

- Assert the exact endpoint, HTTP method, required headers, and optional Bearer
  header behavior through an injected fetch implementation.
- Assert non-2xx responses, invalid JSON, invalid schema, timeout, and transport
  errors fail with actionable messages.
- Assert the client does not retry indefinitely and the loader never falls back
  to a stale fixture in live mode.

### Build and browser

- Build with fixture mode and verify the release marker appears in the existing
  Handoff section.
- Run the existing unit, lint, type, build, browser, accessibility, and
  formatting checks with fixture mode.
- Run one live build without a token and verify the same normalized version
  contract reaches the page.
- Verify project-subpath links and existing reduced-motion, keyboard, mobile,
  Branchline, logo, showcase, and Axe checks remain green.

### Output security

- Search generated HTML, JavaScript, source maps, reports, and logs for the
  token name/value, Authorization headers, local paths, and raw API objects.
- Confirm release notes remain plain normalized text and no client-side GitHub
  API request is emitted.

## Acceptance criteria

- [x] `zod` is added to `package.json` and locked in `pnpm-lock.yaml`.
- [x] The raw GitHub response is validated with Zod before normalization.
- [x] The normalized model matches the documented `LatestRelease` and
      `ReleaseAsset` contracts.
- [x] Native `fetch` sends the exact endpoint, Accept header, API-version header,
      and optional build-only Bearer token.
- [x] Live mode is the default and fixture mode is explicit.
- [x] Live API, transport, JSON, schema, timeout, and invalid-mode failures stop
      the build without stale fixture fallback.
- [x] All known asset kinds and the ambiguous Linux/Python `.tar.gz` cases are
      classified correctly.
- [x] The current Handoff section consumes only the normalized release version;
      no final download UI is introduced.
- [x] CI uses fixture mode for deterministic build/E2E execution and the Pages
      workflow uses live mode.
- [x] The optional `GITHUB_TOKEN` never reaches `PUBLIC_` configuration,
      browser output, generated assets, or logs.
- [x] Existing unit, lint, type, build, browser, accessibility, formatting,
      and base-path checks remain green.
- [x] No `hermes-agent-ak/git-fanta` application-repository file or SonarQube
      workflow changes.
- [x] README documents fixture mode, live build behavior, and failure semantics.
- [x] This plan records the implementation branch, verification, and completion
      evidence before it is marked complete.

## Failure cases

| Failure                                     | Expected handling                                                   |
| ------------------------------------------- | ------------------------------------------------------------------- |
| GitHub API returns non-2xx                  | Fail with endpoint/status context; do not use the fixture.          |
| GitHub API is unreachable or times out      | Fail the build within the bounded timeout; keep prior Pages output. |
| Response schema is malformed                | Fail with Zod path/context; do not normalize partial data.          |
| `tag_name` is only `v`                      | Reject the normalized empty version.                                |
| Release name or body is null                | Use the defined title fallback or empty notes string.               |
| `content_type` is null                      | Normalize to `application/octet-stream`.                            |
| Linux portable archive is generic `.tar.gz` | Match the complete Linux suffix before source-archive fallback.     |
| Unknown asset filename                      | Preserve it as `other`; never infer from content type alone.        |
| Fixture mode is misspelled                  | Fail before build with the allowed-mode error.                      |
| Fixture is malformed                        | Validate it through the same Zod path and fail clearly.             |
| Token is absent                             | Use the unauthenticated public request.                             |
| Token appears in generated output           | Stop release, remove the exposure, and rerun output scans.          |
| CI build has no network                     | Fixture-mode build remains deterministic and passes.                |
| Production build fails after a release push | Pages deployment keeps the previous artifact because build fails.   |

## Security considerations

- Use the minimum public GitHub API surface: one GET request to the latest
  release endpoint.
- Treat `GITHUB_TOKEN` as build-only input. Read it only from `process.env`, add
  it only to the request header, and never log it or pass it into Astro props,
  `PUBLIC_` variables, browser code, fixtures, or generated files.
- Validate every API URL before storing it in the normalized model and require
  HTTPS for release and asset download URLs.
- Keep release notes as plain text in this phase. Do not inject raw Markdown or
  HTML into the page.
- Use a bounded timeout and no unbounded retry loop so a degraded API cannot
  hold a GitHub Actions runner indefinitely.
- Treat the fixture as public test data and scan it for credentials and local
  paths before committing it.
- Keep live mode as the production default and make fixture mode explicit so a
  stale fixture cannot silently publish old download information.
- Inspect generated output and CI logs for token values, authorization headers,
  source checkout paths, and raw API payloads.

## Rollback strategy

- If release integration breaks the build, revert the Phase 4 commit through the
  normal `dev` → `main` path; the existing Pages workflow will continue serving
  the last successful artifact after a failed build.
- If classification is wrong, revert only the classifier and its tests, then
  correct the filename rules in a follow-up reviewable change.
- If the API contract changes, keep the previous normalized model until the Zod
  schema, fixture, and client tests are updated together.
- If the optional token handling is suspect, remove the Authorization header
  path and continue with unauthenticated public requests while investigating
  rate limits.
- Do not force-push shared branches, delete releases, rewrite generated output,
  or disable the Pages workflow as rollback mechanisms.

## Definition of done

- The plan's implementation branch is based on the current `dev` head and
  contains only Phase 4 release-integration changes.
- The latest release is fetched with native `fetch`, validated with Zod, and
  normalized into the documented model during the Astro build.
- Known release assets are classified correctly, including the complete Linux
  portable suffix and the Python source archive distinction.
- Fixture mode is deterministic, explicit, and covered by tests; live mode never
  falls back to stale fixture data.
- The existing foundation page consumes only the normalized release version as
  the temporary build marker, leaving the final download experience to Phase 5.
- CI remains deterministic through fixture mode, while the Pages deployment
  remains live-mode and independent from SonarQube.
- The optional token is absent from browser output, generated assets, logs, and
  source maps.
- Existing unit, browser, accessibility, formatting, lint, type, build, and
  project-subpath checks remain green.
- README and this plan accurately describe the release-data boundary, commands,
  failure behavior, and verification results.
- This plan is marked complete only after all acceptance criteria and review gates
  pass.

## Completion evidence

Verified on 2026-08-03 from
`feature/phase-4-github-release-integration`:

- `pnpm format:check` passed.
- `pnpm lint` passed.
- `pnpm check` passed with zero errors, warnings, or hints.
- `pnpm test:unit` passed: 10 files and 50 tests.
- `GITHUB_API_MODE=fixture pnpm build` passed and generated the Handoff marker
  `Latest release: 1.0.2`.
- `GITHUB_API_MODE=fixture pnpm exec playwright test` passed: 15 tests,
  including Axe, reduced-motion, mobile, project-subpath, and release-marker
  coverage.
- `GITHUB_API_MODE=live pnpm build` passed against the public GitHub latest
  release endpoint and generated the same normalized release version.
- `git diff --check` passed.
- Generated output contains no `GITHUB_TOKEN`, `Authorization`, or raw GitHub
  response field names.
