---
status: complete
phase: 7
execution_order: completed
plan_reviewed_at: 2026-08-03
plan_review_status: complete
completed_at: 2026-08-03
depends_on:
  - docs/implementation-plans/00-project-bootstrap.md
  - docs/implementation-plans/01-design-system-and-layout.md
  - docs/implementation-plans/02-visual-experience-and-motion.md
  - docs/implementation-plans/03-content-and-product-assets.md
deferred_numeric_phases:
  - docs/implementation-plans/05-pages-and-interactivity.md
  - docs/implementation-plans/06-testing-quality-and-security.md
implementation_branch: feature/phase-7-github-pages-deployment
base_branch: dev
target_branch: dev
production_head: 782e0be9681917c5262a386cd6ee04b9b964527d
deployment_run: https://github.com/hermes-agent-ak/git-fanta-site/actions/runs/30849662514
live_verified_at: 2026-08-03T20:31:07Z
deployment_target: https://hermes-agent-ak.github.io/git-fanta-site/
---

# Phase 7 Implementation Plan — GitHub Pages Deployment

## Objective

Publish the current static Git Fanta website to GitHub Pages as the next
implementation milestone. The deployment must build the committed Astro site
on a GitHub-hosted runner, upload the static output through the GitHub Pages
artifact flow, and deploy it to:

```text
https://hermes-agent-ak.github.io/git-fanta-site/
```

This is an intentionally promoted phase. The architectural number remains 7,
but the phase executes directly after Phase 3 because the current page already
has meaningful content, a verified logo, a derived showcase asset, and a
base-path-safe static Astro configuration. The deployment must not wait for
release API integration, final page composition, or the cross-repository
release trigger.

## Implemented result

- `.github/workflows/deploy-pages.yml` is merged into `main` and deploys the
  static Astro site through separate `build` and `deploy` jobs.
- The production workflow run [30849662514](https://github.com/hermes-agent-ak/git-fanta-site/actions/runs/30849662514)
  completed successfully for production head `782e0be`. Both the `build` and
  `deploy` jobs passed on the GitHub-hosted runner.
- The public site at
  [hermes-agent-ak.github.io/git-fanta-site](https://hermes-agent-ak.github.io/git-fanta-site/)
  returns HTTPS `200` and serves the current Git Fanta page.
- The live artifact was checked with a focused Playwright/Axe smoke test: the
  title is `Git Fanta`, the logo and showcase resolve under `/git-fanta-site/`,
  the first keyboard focus target is the skip link, reduced motion changes
  document scrolling to `auto`, and Axe reports zero violations.
- The local quality suite remains green: 27 unit tests, 14 browser tests,
  lint, Astro checks, build, formatting, and diff validation.
- The `workflow_dispatch` recovery path is configured for `main`; the first
  production publication used the normal `push` trigger, so no additional
  recovery run was needed for this completion gate.
- `dist/` remains generated output and is not tracked. No SonarQube worker,
  token, or self-hosted runner is required for deployment.

## Current-state findings

- Phases 0–3 are implemented and the current site is static Astro output with
  a visible foundation/Branchline experience, approved product content, the
  project-owner supplied logo, and a derived showcase asset.
- `astro.config.mjs` already provides environment-aware `site` and `base`
  values. Its defaults target `https://hermes-agent-ak.github.io` and
  `/git-fanta-site/`.
- `.github/workflows/ci.yml` validates formatting, linting, type checking, unit
  tests, the static build, Chromium browser tests, and Axe checks. It does not
  publish an artifact.
- `.github/workflows/build.yml` is the optional trusted SonarQube lane on a
  local self-hosted runner. It is not a deployment workflow and must not become
  a deployment dependency.
- `.github/workflows/deploy-pages.yml` uses `actions/checkout@v7`,
  `withastro/action@v6`, and `actions/deploy-pages@v5`. A local `pnpm build`
  still produces `dist/`, while the Astro action uploads the CI build as the
  GitHub Pages artifact.
- The master brief requires `actions/checkout@v7`, `withastro/action@v6`,
  `actions/deploy-pages@v5`, the `github-pages` environment, and Pages
  permissions.
- GitHub Pages is configured to publish through **GitHub Actions**, and the
  successful production run confirms that the Pages environment and publishing
  source are operational.
- Phase 8 will eventually send a `git-fanta-release-published`
  `repository_dispatch` event. This phase may accept that event as a trigger,
  but it must not implement or require the sender.
- The official [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/)
  recommends `withastro/action` and requires committed package-manager metadata
  plus correct `site` and `base` values for project-page URLs.

## Scope

### 1. Add the deployment workflow

Create `.github/workflows/deploy-pages.yml` with these triggers:

- `push` to `main` for normal production deployment;
- `workflow_dispatch` for a manual deployment or recovery run; and
- `repository_dispatch` with the exact type
  `git-fanta-release-published` for the later Phase 8 sender.

The workflow must publish only the `main` ref. Because GitHub can offer a
different branch when `workflow_dispatch` is selected, add an explicit
`if: github.ref == 'refs/heads/main'` guard to the build job and retain the
build-to-deploy dependency. A non-`main` manual run must skip without creating
or replacing a Pages deployment. The `github-pages` environment restriction is
defense in depth, not the only protection.

Use the approved static Pages flow:

- `actions/checkout@v7` to fetch the repository;
- `withastro/action@v6` to install the locked pnpm dependencies, run the
  existing production build, and upload the generated Pages artifact; and
- `actions/deploy-pages@v5` in a deployment job that depends on the build job.

A failed build must not replace the currently published site.

### 2. Keep deployment independent from SonarQube

Run the Pages workflow on `ubuntu-latest`. Do not use the
`[self-hosted, linux, x64, sonarqube-local]` labels and do not make SonarQube a
required job dependency. The site must remain deployable when the local
SonarQube worker is offline.

### 3. Apply the least-privilege Pages contract

Set these permissions explicitly:

```yaml
contents: read
pages: write
id-token: write
```

Use the `github-pages` environment on the deployment job and expose the URL
through `${{ steps.deployment.outputs.page_url }}`. Configure the environment
so only reviewed `main` commits can publish production content; keep this as a
second protection layer in addition to the workflow's explicit ref guard.

Use a Pages concurrency group that prevents overlapping production deployments
from racing. Do not cancel an already-running production deployment merely
because a newer commit is queued; let the newer run replace it after its own
build succeeds.

### 4. Preserve the project subpath

Build with the existing defaults unless verification finds a real defect:

```text
SITE_URL=https://hermes-agent-ak.github.io
BASE_PATH=/git-fanta-site/
```

Verify that generated HTML, stylesheets, scripts, logo, showcase, anchor links,
and browser navigation remain under `/git-fanta-site/`. Do not add a second URL
helper or convert internal links to root-relative paths.

### 5. Document the one-time GitHub configuration

Update `README.md` with the production URL and this manual setting:

```text
Repository Settings → Pages → Build and deployment → Source: GitHub Actions
```

Document the `main` trigger, manual recovery trigger, and the possibility that
the first deployment needs approval for the `github-pages` environment.

## Explicit non-scope

- Do not implement GitHub Release API fetching, release normalization, Zod
  schemas, asset classification, or download metadata. Those belong to Phase 4.
- Do not build the final homepage, download page, 404 page, SEO metadata,
  structured data, or the React download island. Those belong to Phase 5.
- Do not add Lighthouse, dependency-review, or new security tooling. Phase 6
  remains a later phase; deployment consumes the existing CI checks.
- Do not implement the Git Fanta application repository's dispatch sender. That
  belongs to Phase 8.
- Do not read release information from `client_payload`. A dispatch payload is
  only a trigger; the completed Phase 4 loader independently fetches release
  data during the website build.
- Do not add a runtime server, API proxy, database, container, CDN, or hosting
  provider other than GitHub Pages.
- Do not commit `dist/`, use a `gh-pages` source branch, or publish from the
  repository root or `docs/` folder. The Pages artifact is generated in CI.
- Do not add a custom domain or `public/CNAME` in this phase.
- Do not add current-site secrets. Future private GitHub API access must remain
  build-only and must never use a `PUBLIC_` variable.
- Do not alter the SonarQube workflow, runner labels, branch policy, or the
  Git Fanta application repository.

## Dependencies

### Repository dependencies

- Phase 0 provides the static Astro build, Node 24, pnpm 11.4, and committed
  `pnpm-lock.yaml`.
- Phase 1 provides the base layout and base-path-safe navigation contract.
- Phase 2 provides the current visual experience and static fallback.
- Phase 3 provides the verified logo, derived showcase, source-backed content,
  and asset provenance ledger.
- `astro.config.mjs` must continue to expose the project-page `site` and `base`
  defaults.
- `main` must contain the reviewed Phase 3 site before production deployment.

### External dependencies

- Repository administrator or maintainer access to configure GitHub Pages.
- GitHub Actions enabled for the repository.
- The `github-pages` environment available or creatable by the workflow.
- GitHub-hosted `ubuntu-latest` runner availability.
- The approved GitHub Actions remain available at their required versions.

### Dependency decision

Phase 7 deliberately depended on phases 0–3 during its promoted execution.
Phases 4–6 were deferred at that point because a static foundation page could
already be built and deployed, and making the first deployment wait for release
data or final page content would have delayed the public milestone. Phase 4 has
since extended the Pages build with live release-data validation; Phase 5 and
Phase 6 remain deferred.

## Files to create

- `.github/workflows/deploy-pages.yml` — build and deploy the static Astro site.

## Files to modify

- `README.md` — document the production URL and one-time Pages configuration.
- `docs/implementation-plans/07-github-pages-deployment.md` — record the
  completed status, production head, deployment run, and verification results.

No application source file should change unless base-path verification finds a
real defect in the existing `site`/`base` contract. Any such change must be
covered by the existing URL and browser tests.

## Data structures and workflow contracts

This phase adds no runtime application data model. Its explicit contracts are:

| Contract               | Required value                                           |
| ---------------------- | -------------------------------------------------------- |
| Production ref         | `main`                                                   |
| Manual event           | `workflow_dispatch`                                      |
| Future release event   | `repository_dispatch` / `git-fanta-release-published`    |
| Build output           | Astro static `dist/` artifact through `withastro/action` |
| Deployment environment | `github-pages`                                           |
| Deployment URL output  | `${{ steps.deployment.outputs.page_url }}`               |
| Project site URL       | `https://hermes-agent-ak.github.io`                      |
| Project base path      | `/git-fanta-site/`                                       |
| Build runtime          | Node 24 with the committed pnpm lockfile                 |

The repository-dispatch payload is intentionally not part of the deployment
contract. It remains only an event trigger; Phase 4 independently fetches and
validates release data during the live Pages build.

## Implementation steps

### Step 0 — Review the promotion boundary

1. Confirm that `main` contains the current Phase 3 site and that the working
   tree is clean before creating the deployment branch.
2. Confirm that `pnpm build` succeeds without a GitHub token or local service.
3. Confirm that `dist/` is ignored and is not tracked.
4. Confirm that no existing deployment workflow or Pages source branch must be
   preserved.
5. Re-check `siteHref` callers and generated asset URLs under
   `/git-fanta-site/` before changing deployment configuration.

### Step 1 — Establish the declarative workflow contract

1. Review the workflow acceptance checklist before implementation. The
   deployment behavior is declarative infrastructure, so its first failure
   signal is a static workflow assertion rather than a Vitest import failure.
2. Create `.github/workflows/deploy-pages.yml` with the three approved trigger
   forms and least-privilege permissions.
3. Use separate `build` and `deploy` jobs so deployment explicitly depends on
   the uploaded artifact.
4. Use the approved action versions and the existing `packageManager` and
   `pnpm-lock.yaml`; do not introduce a second package-manager setup.
5. Keep deployment on `ubuntu-latest`, independent of the local SonarQube
   runner.

### Step 2 — Verify the current Astro output locally

1. Run the full existing local quality suite before and after the workflow
   change.
2. Build the static site with the default project-page configuration.
3. Start `pnpm preview --host 127.0.0.1` and request
   `http://127.0.0.1:4321/git-fanta-site/`.
4. Check for HTTP 200 and confirm generated document references stay under
   `/git-fanta-site/`.
5. Use the existing Chromium tests for the page, logo, showcase, focus order,
   Branchline anchors, reduced-motion fallback, and Axe assertions.

### Step 3 — Configure the GitHub Pages publishing source

1. Merge the workflow through the existing `dev` → `main` review path.
2. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Confirm the `github-pages` environment exists and restrict its deployment
   branch to `main` when repository settings permit that protection.
4. Do not create a `gh-pages` branch or commit generated output.

### Step 4 — Execute the first deployment

1. Push the merged workflow to `main` or run it manually from the Actions tab.
2. Confirm the build job installs from the lockfile, builds `dist/`, and uploads
   the Pages artifact.
3. Confirm the deploy job waits for the build job and reports the Pages URL.
4. Open `https://hermes-agent-ak.github.io/git-fanta-site/` and verify the
   rendered page and static assets.
5. Run the workflow manually once with `main` selected, then verify that a
   manual run selected on a non-`main` branch is skipped and creates no Pages
   deployment.
6. Re-run the workflow without source changes to verify recovery does not
   require a new commit or local runner.

### Step 5 — Complete the phase review gate

1. Inspect the workflow diff for unintended permissions, secrets, mutable
   deployment targets, and unreviewed branch references.
2. Inspect deployed HTML for credentials, machine-specific paths, source
   checkout paths, and root-relative URLs.
3. Record the first successful Actions run and live URL in this plan.
4. This completion gate is satisfied after live URL, asset loading,
   project-subpath navigation, and the workflow recovery configuration are
   verified; this plan records `status: complete`.

## Commands

Run from the website repository:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm check
pnpm test:unit
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
git diff --check
```

For the local static-output check:

```bash
pnpm build
pnpm preview --host 127.0.0.1
curl -fsS -I http://127.0.0.1:4321/git-fanta-site/
```

The preview command remains running while the `curl` check is performed. The
check must not require `SONAR_TOKEN`, `GITHUB_TOKEN`, a local SonarQube service,
or the application repository checkout.

## Testing steps

### Static and repository checks

- Validate the workflow YAML through GitHub Actions parsing on a branch or
  workflow-dispatch run.
- Confirm the workflow contains the three required events, `main` production
  ref, Pages permissions, `github-pages` environment, build-to-deploy
  dependency, and approved action versions.
- Confirm existing CI and SonarQube workflows are unchanged.

### Build and browser checks

- Run `pnpm build` and confirm the output contains `index.html`, the brand logo,
  derived showcase, stylesheet, and client assets.
- Run the existing Playwright suite against the production preview.
- Confirm the page is reachable at `/git-fanta-site/`, not only at `/`.
- Confirm local asset requests succeed and all existing Axe, keyboard, mobile,
  Branchline, and reduced-motion checks remain green.

### Live deployment checks

- Confirm the deployment does not require the SonarQube workflow.
- Confirm a successful run creates a `github-pages` deployment and reports a
  URL under `hermes-agent-ak.github.io/git-fanta-site/`.
- Confirm a failed build does not advance the deployed version.
- Confirm `workflow_dispatch` is available for manual recovery on `main`; a
  separate rerun is optional after the first successful production run.

## Acceptance criteria

- [x] `.github/workflows/deploy-pages.yml` exists and is valid GitHub Actions
      YAML.
- [x] A push to `main` triggers deployment.
- [x] `workflow_dispatch` is configured for a recovery deployment on `main`.
- [x] The future `git-fanta-release-published` dispatch is accepted without
      trusting its payload.
- [x] The build uses `actions/checkout@v7`, `withastro/action@v6`, Node 24, the
      committed pnpm lockfile, and the existing `pnpm build` contract.
- [x] The deploy job uses `actions/deploy-pages@v5`, has Pages permissions, uses
      `github-pages`, and waits for the build job.
- [x] The workflow explicitly skips any non-`main` ref, including manually
      dispatched runs, before a Pages artifact can be deployed.
- [x] No local SonarQube worker, Sonar token, or self-hosted runner is required.
- [x] GitHub Pages uses **GitHub Actions** as its publishing source.
- [x] `https://hermes-agent-ak.github.io/git-fanta-site/` returns the current
      page over HTTPS.
- [x] Title, visible Git Fanta content, logo, showcase asset, styles, and scripts
      resolve successfully at the project subpath. The showcase remains a
      directly available Phase 3 asset; final page composition remains Phase 5
      scope.
- [x] Existing unit, lint, type, build, browser, accessibility, and formatting
      checks remain green.
- [x] The workflow does not publish `dist/` from a branch or commit generated
      output.
- [x] The plan records the successful run and exact verification before it is
      marked complete.

## Failure cases

| Failure                                        | Expected handling                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Pages source is still `Deploy from a branch`   | Set the source to GitHub Actions; do not add a `gh-pages` branch.              |
| `pages: write` or `id-token: write` is missing | Restore the exact Pages permissions.                                           |
| Astro action cannot install dependencies       | Verify Node 24, pnpm 11.4, and the committed lockfile.                         |
| Build fails because of future release API work | Keep the previous deployment and fix the later phase before retrying.          |
| Assets work at `/` but not `/git-fanta-site/`  | Treat as a base-path regression and rerun browser/build checks.                |
| Dispatch arrives before Phase 8                | No release sender is implemented in this phase.                                |
| Manual run selects a non-`main` branch         | The explicit ref guard skips the jobs and creates no Pages deployment.         |
| Deploy starts before artifact upload           | Require the deploy job to depend on `build`.                                   |
| Environment protection blocks deployment       | Approve only after reviewing the workflow and commit.                          |
| Live Pages site is stale                       | Inspect the latest deployment run and rerun it; do not commit generated files. |

## Security considerations

- Use only `contents: read`, `pages: write`, and `id-token: write` as required
  by the Pages deployment boundary.
- Keep deployment on GitHub-hosted infrastructure and outside the trusted local
  SonarQube runner.
- Protect `github-pages` so only reviewed `main` commits can publish production
  content.
- Treat Pages output as public. Do not put tokens, local paths, private data, or
  machine-specific metadata in the build.
- Do not pass a future dispatch payload into page content or release links.
- Do not add a current deployment secret; Pages uses workflow permissions.
- Use fixed action versions required by the master plan and review action
  upgrades as supply-chain-sensitive changes.

## Rollback strategy

- A build failure leaves the previous Pages version untouched.
- If a bad deployment reaches Pages, revert the offending source or workflow
  commit through the normal `dev` → `main` path and redeploy.
- Use **Re-run all jobs** for a known-good `main` run when the failure is
  transient and source is unchanged.
- If Pages configuration is wrong, restore the prior source only as an emergency
  measure, then return to GitHub Actions after correcting the workflow.
- Never force-push `main`, delete the repository, or rewrite generated output as
  a rollback mechanism.

## Definition of done

- The deployment workflow is merged into `main` and independently runnable.
- GitHub Pages is configured to use GitHub Actions.
- A successful production run is recorded and the live project-page URL loads
  the current site.
- Project-subpath navigation, local assets, semantic shell, logo, showcase,
  keyboard behavior, reduced motion, and accessibility checks work on the live
  artifact.
- Deployment does not depend on SonarQube, a cross-repository secret, or a
  self-hosted runner. After Phase 4, the Pages build explicitly uses live
  release data from GitHub and fails before deployment when that data cannot be
  obtained or validated.
- Previous phases remain unchanged except for documented deployment references.
- This plan records the successful run and is marked complete.
