# Phase 1 Implementation Plan — Design System and Layout

## Objective

Create the reusable visual and accessibility foundation for Git Fanta's static Astro website.

This phase establishes a dark-first Git-tooling visual system, explicit Git Fanta design tokens, responsive layout primitives, accessible site chrome, reusable buttons and cards, visible keyboard focus states, and reduced-motion behavior. Later page work must be able to compose these pieces without adding unnecessary client-side JavaScript.

This plan also defines an optional SonarQube quality lane from the beginning of the CI design. The lane is opt-in for contributors without a SonarQube server, must never place a token in the repository, and must distinguish the local SonarQube instance from a server that GitHub-hosted Actions runners can reach.

## Current-state findings

- The repository currently contains the initial documentation commit 64fa865 on main.
- dev has been created from main and pushed as the shared integration branch.
- feature/phase-1-design-system-and-layout has been created from dev for this plan.
- Phase 0 has now created `package.json`, the Astro source tree, global stylesheet, test structure, baseline CI and the frozen dependency lockfile. Its decisions are recorded in `docs/implementation-plans/00-project-bootstrap.md`.
- SonarQube Community Build has been configured manually for the website project. The project was imported through the GitHub integration, and the tracked workflow plus `sonar-project.properties` have been tested successfully on the trusted local runner.
- The SonarQube workflow remains an optional quality lane, separate from baseline CI. It is restricted to the documented trust boundary and must not become a prerequisite for contributors who cannot reach the local server.
- The SonarQube project key in `sonar-project.properties` is a public project identifier, not a credential. A different SonarQube instance may use a different project key; the plan must never assume that an instance-specific key is portable across servers.
- The Phase 0 bootstrap plan is complete. Phase 1 may now consume its Astro project, strict TypeScript configuration, Tailwind CSS 4 Vite integration, React integration, package scripts, base-path helper and test commands.
- The approved architecture is static Astro output. Static sections must remain Astro components; React may be used only for a genuinely interactive island in a later phase.
- The user has a local SonarQube instance at http://localhost:9000. This is a local development capability, not a credential or a CI endpoint. A GitHub-hosted runner cannot reach a developer's localhost.
- No product screenshots, logo assets, release data, or final page content should be invented in this phase. Content and product assets belong to later plans.

## Scope

### In scope

1. Define the Git Fanta CSS token contract in the Tailwind CSS 4 stylesheet using CSS custom properties and the @theme mechanism.
2. Create global accessibility defaults, including focus-visible styling, selection styling, reduced-motion handling, base typography, and safe color defaults.
3. Create the base Astro layout with semantic document structure, a skip link, a header slot, a main-content slot, and a footer slot.
4. Create the responsive Container primitive.
5. Create the accessible Button primitive with link and button rendering modes and a constrained variant set.
6. Create the static Card primitive for later feature and download sections.
7. Create the site header and footer with keyboard-accessible navigation and base-path-safe links.
8. Apply the foundation to the bootstrap page shell without implementing the final homepage sections.
9. Add focused tests for the layout shell and accessibility behavior.
10. Define the optional SonarQube configuration contract and its CI integration point without making SonarQube access a requirement for baseline local development or pull requests.

### Optional SonarQube quality lane

The SonarQube lane is part of the plan but is opt-in. It should be implemented when the repository owner wants server-backed analysis enabled, and it should be safe for other contributors to skip.

| Mode | Server URL | Expected behavior |
| --- | --- | --- |
| Local opt-in | http://localhost:9000 or another value in SONAR_HOST_URL | A developer runs a local scan with SONAR_TOKEN supplied through the shell or credential store. The token is never printed or committed. |
| GitHub-hosted CI | A reachable HTTPS SonarQube server in SONAR_HOST_URL | The optional CI job runs only after manual repository configuration. The endpoint must not be a developer-only localhost address. |
| Self-hosted runner | A SonarQube endpoint reachable from the runner | The optional job may use a self-hosted runner only after its trust boundary, permissions, maintenance, and network access are documented. |
| Not configured | No SonarQube variables or secrets | The optional job is skipped or excluded from baseline CI; formatting, linting, type checking, tests, build, and accessibility checks remain authoritative. |

The plan must not require exposing the local SonarQube port to the public internet. If the owner wants GitHub-hosted CI analysis, a separate manual setup decision is required: provide a secured reachable SonarQube endpoint, or use a properly isolated self-hosted runner. A raw port-forward of the local instance is not an acceptable default.

### Configured free localhost setup

The current optional path uses SonarQube Community Build on the developer-controlled machine. It is intentionally free of SonarQube Cloud or paid multi-branch features and is suitable for trusted branch analysis. The following requirements are part of this path:

| Requirement | Configuration | Why it is required |
| --- | --- | --- |
| SonarQube server | A running Community Build instance reachable as `http://localhost:9000` from the analysis runner | The scanner needs a server endpoint, while keeping the instance private avoids exposing a development service to the internet. |
| GitHub integration | A GitHub App configured in SonarQube with the required API URL, App ID, Client ID, Client Secret, and private key | Repository import and GitHub project binding are handled by the SonarQube GitHub integration rather than by a runtime application server. These values remain in SonarQube's protected configuration and never enter the repository. |
| Imported project | The `hermes-agent-ak/git-fanta-site` repository is imported and bound to a SonarQube project | Binding gives the scanner a stable project identity and allows the GitHub Actions analysis to report to the intended project. |
| Repository secret | `SONAR_TOKEN` contains a project or analysis token created in SonarQube | The scanner must authenticate without placing a credential in YAML, source code, plans, or logs. |
| Runtime server URL | `SONAR_HOST_URL` is injected at runtime; `http://localhost:9000` is the local default | The URL is configuration rather than a secret, but runtime injection keeps the repository portable. `localhost` always means the machine running the job, not automatically the developer's workstation. |
| Runner placement | A trusted Linux x86_64 self-hosted runner runs on the same machine as SonarQube, or can otherwise resolve the local endpoint | GitHub-hosted runners are separate ephemeral machines and cannot access a private developer localhost. A self-hosted runner is the smallest free solution that preserves a private local service. |
| Workflow trust boundary | SonarQube analysis runs only on trusted pushes to protected branches and/or explicit manual dispatch; it is not run on arbitrary fork pull requests | A public repository must not allow untrusted pull-request code to execute on a runner that can access a local network service or long-lived credentials. |
| Repository files | `.github/workflows/build.yml` and `sonar-project.properties` are tracked; neither contains a token or private key | The workflow and scanner project identity are reproducible configuration. Secrets belong in GitHub/SonarQube credential stores, not in Git history. |

The generated onboarding workflow has been hardened into the current optional quality lane: it
uses the approved trusted self-hosted runner label, restricts execution at the job boundary, and
enforces the SonarQube quality gate. The baseline PR checks in `ci.yml` remain independent from
SonarQube so contributors can work without access to the local server. Later quality work may add
post-scan artifact/secret auditing, but it must preserve this trust boundary.

## Explicit non-scope

- Do not initialize or upgrade the Astro project in this plan; that belongs to docs/implementation-plans/00-project-bootstrap.md.
- Do not implement final homepage content, product claims, product screenshots, release data, download selection, or the download page. Those belong to Plans 02–04.
- Do not add a blog, documentation portal, changelog system, CMS, backend, server-side rendering, analytics, cookies, authentication, or a database.
- Do not convert the site to React or hydrate static layout sections.
- Do not add a UI component library or legacy @astrojs/tailwind integration.
- Do not add remote fonts, animation libraries, a full GitHub Primer CSS dependency, or decorative JavaScript.
- Do not make SonarQube a hard prerequisite for contributors, fork builds, or baseline CI.
- Do not expose SONAR_TOKEN, a GitHub token, or any other credential in this document, source code, workflow logs, browser output, fixtures, or generated files.
- Do not modify main or merge the feature branch into dev as part of this plan.

## Dependencies

### Required before implementation

- docs/implementation-plans/00-project-bootstrap.md is implemented or its required outputs are present:
  - package.json with approved scripts and packageManager: "pnpm@11.4.0";
  - pnpm-lock.yaml;
  - astro.config.mjs with environment-aware site and base values;
  - strict tsconfig.json;
  - Tailwind CSS 4 through @tailwindcss/vite;
  - React integration;
  - src/pages/index.astro;
  - src/styles/global.css or an explicitly documented replacement;
  - src/lib/site-url.ts or an equivalent base-path-safe URL helper;
  - default check, lint, format:check, unit-test, Playwright, and build commands.
- Node.js 24 LTS and Corepack are available.
- The feature branch is based on dev and is reviewed through a pull request targeting dev, not main.

### Optional SonarQube dependencies

- A SonarQube project key, such as git-fanta-site, may be created manually in the chosen SonarQube server. The project key is not a secret.
- A SonarQube token must be generated manually in the SonarQube UI or approved credential manager. Only the secret name SONAR_TOKEN may appear in repository documentation and workflow files.
- For GitHub-hosted CI, SONAR_HOST_URL must point to a securely reachable server. The local localhost:9000 instance is suitable for local scans only.
- The selected scanner or action version must be a stable release and pinned to an immutable version or full commit SHA. Floating @main or unpinned action references are prohibited.

## Files to create

The following paths are repository-relative and must be created during Phase 1:

- src/layouts/BaseLayout.astro
- src/components/site/SiteHeader.astro
- src/components/site/SiteFooter.astro
- src/components/ui/SkipLink.astro
- src/components/ui/Container.astro
- src/components/ui/Button.astro
- src/components/ui/Card.astro
- tests/e2e/design-foundation.spec.ts
- .github/workflows/build.yml only when the optional SonarQube lane is enabled by the repository owner; the generated onboarding file is tracked as configuration but is not considered production-ready for localhost until the runner and trigger restrictions are implemented.
- sonar-project.properties only when the optional SonarQube lane is enabled by the repository owner; it must contain only the instance's public project identifier and repository-relative analysis settings, never credentials.

## Files to modify

- src/styles/global.css — add the Git Fanta token contract and global accessibility styles while retaining the required @import "tailwindcss"; directive.
- src/pages/index.astro — apply BaseLayout and render only a minimal page shell or approved placeholder structure; do not add invented product content.
- src/lib/site-url.ts — use the existing base-path-safe helper for all internal navigation links; modify it only if the Phase 0 implementation lacks the required API.
- astro.config.mjs — modify only if needed to preserve environment-driven site/base behavior; do not hard-code project-page paths in components.
- tests/a11y/design-foundation.spec.ts or the Phase 0 equivalent accessibility test file — add the @a11y coverage if the bootstrap plan establishes a separate accessibility suite.
- .github/workflows/ci.yml — add the optional SonarQube job only if the Phase 0 workflow exists; otherwise record the exact job insertion in the Phase 5 quality plan and do not create a second competing CI workflow here.

## Data structures

### Design token contract

Define tokens as CSS custom properties and expose Tailwind-facing names through the CSS-based Tailwind theme. Use semantic names rather than raw color names in components.

Required token groups:

~~~text
Backgrounds:  --color-fanta-background, --color-fanta-surface,
              --color-fanta-surface-elevated, --color-fanta-surface-inverse
Foregrounds:  --color-fanta-foreground, --color-fanta-muted,
              --color-fanta-subtle
Borders:      --color-fanta-border, --color-fanta-border-strong
Accent:       --color-fanta-orange, --color-fanta-orange-hover,
              --color-fanta-orange-contrast
Status:       --color-fanta-success, --color-fanta-warning,
              --color-fanta-danger, --color-fanta-info
Focus:        --color-fanta-focus-ring
Spacing:      --spacing-fanta-1 through --spacing-fanta-8
Radius:       --radius-fanta-sm, --radius-fanta-md, --radius-fanta-lg,
              --radius-fanta-pill
Shadow:       --shadow-fanta-sm, --shadow-fanta-md, --shadow-fanta-glow
Typography:   --font-fanta-sans, --font-fanta-mono,
              --text-fanta-display through --text-fanta-caption
~~~

The exact values must be checked for WCAG 2.2 AA contrast in the implemented color pairs. Do not use a token name that implies a contrast relationship unless the value is tested against its intended background.

### Navigation

Use one typed navigation model rather than duplicating link labels and paths across the header and footer:

~~~ts
interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  currentWhen?: string[];
}
~~~

Navigation paths must be base-path-safe. External links to the application repository, releases, issues, and license may use explicit HTTPS URLs because they are public destinations and contain no credentials.

### Component props

Keep component APIs small and explicit:

~~~ts
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
}

interface ContainerProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: "div" | "section" | "article" | "main";
}

interface CardProps {
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  interactive?: boolean;
}
~~~

The implementation may use Astro's generated prop types or a shared TypeScript type file, but it must not add a second state store or client-side component state for these static primitives.

### Optional SonarQube configuration contract

If enabled, sonar-project.properties must use repository-relative paths and must not contain a host-specific absolute path or token:

~~~properties
sonar.projectKey=<project-key-created-in-sonarqube>
sonar.projectName=git-fanta-site
sonar.sources=src
sonar.tests=tests
sonar.exclusions=dist/**,node_modules/**,public/**,coverage/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.tsconfigPaths=tsconfig.json
~~~

The project-key line is a portable placeholder for the plan, not a value to copy literally. The committed file must contain the key of the imported SonarQube project; another instance may use another non-secret key. At implementation time, verify the selected scanner's support for .astro files and adjust only the source/test inclusion rules that the scanner documents. Do not force unsupported files through the TypeScript analyzer. `SONAR_HOST_URL` and `SONAR_TOKEN` must be injected at runtime; neither belongs in this file.

## Implementation steps

### 1. Confirm the branch and bootstrap contract

1. Update the feature branch from dev with a fast-forward-only pull.
2. Confirm the Phase 0 outputs exist and that pnpm install --frozen-lockfile succeeds.
3. Confirm the global stylesheet uses Tailwind CSS 4 and does not reference @astrojs/tailwind or a legacy Tailwind configuration.
4. Confirm the base-path helper and environment-aware Astro configuration before adding links.

If any prerequisite is missing, stop Phase 1 and report the exact missing path or script. Do not silently recreate Phase 0 work inside this branch.

### 2. Establish the CSS token layer

1. Keep @import "tailwindcss"; at the top of src/styles/global.css.
2. Add a :root token layer using semantic Git Fanta variables from the token contract.
3. Add the Tailwind 4 @theme mapping for the colors, spacing, radii, shadows, and font stacks that components consume.
4. Use a local system sans stack and a local monospace stack. Do not add a remote font request.
5. Define a dark-first default surface hierarchy with sufficient foreground contrast, Fanta orange as the primary action accent, and restrained diff-green/diff-red status details.
6. Add prefers-reduced-motion rules that disable or minimize non-essential transitions, animations, and smooth scrolling.
7. Add :focus-visible styling using --color-fanta-focus-ring with a visible outline and an offset that remains visible against dark and elevated surfaces.
8. Add safe global defaults for box-sizing, body margins, text rendering, links, and selection. Do not hide focus outlines globally.

### 3. Build the base layout

1. Create src/layouts/BaseLayout.astro with html, head, body, a skip-link target, a header region, a main element, and a footer region.
2. Keep full SEO metadata, structured data, and release-driven metadata in the later page/SEO plan; Phase 1 should expose only the minimum layout props needed by the bootstrap page.
3. Create src/components/ui/SkipLink.astro and place it before the header so keyboard users can jump directly to #main-content.
4. Ensure the layout renders exactly one main landmark and does not move focus automatically.
5. Keep all layout components server-rendered Astro components with no client directive.

### 4. Build responsive primitives

1. Create Container.astro with a constrained width, responsive horizontal padding, and the size/as props from the contract.
2. Create Button.astro with the four approved visual variants and three sizes.
3. Render an anchor when href is present and a native button otherwise. Do not create an anchor with href="#" as a button substitute.
4. Preserve native disabled behavior for buttons and use aria-disabled plus safe interaction handling for disabled links only when a link mode genuinely needs it.
5. Create Card.astro with semantic tone classes, consistent border/radius/shadow tokens, and an interactive mode that does not communicate information only through hover.
6. Keep touch targets at least 44 CSS pixels where an interactive control is rendered.

### 5. Build the site chrome

1. Create SiteHeader.astro with a text/logo slot that does not require a fabricated logo asset, a primary navigation list, and a clear link to the download route when that route exists.
2. Create SiteFooter.astro with repository, releases, issues, license, and privacy-neutral project links as configured navigation items. Do not add analytics or a cookie notice.
3. Mark the navigation with aria-label="Primary" and expose the current page using aria-current when the route helper provides a reliable match.
4. Use the base-path-safe URL helper for internal links and explicit HTTPS URLs for public external links. Never hard-code /download/ or /assets/... in a way that breaks under GitHub Pages.
5. Ensure all navigation is keyboard reachable in DOM order and that no menu depends on hover.

### 6. Apply the foundation to the shell

1. Update src/pages/index.astro to use BaseLayout, SiteHeader, Container, and SiteFooter.
2. Render only approved copy or an explicitly labeled implementation placeholder until the content and asset plans are implemented. Do not invent feature descriptions or screenshots.
3. Keep the shell statically rendered and verify that generated HTML contains the primary landmarks without requiring JavaScript.

### 7. Add tests and quality checks

1. Add tests/e2e/design-foundation.spec.ts with a Chromium test that verifies the page loads, the skip link targets #main-content, the primary navigation is reachable, and the page has one main landmark.
2. Add or extend the @a11y test suite so Axe checks the shell at the default viewport and at a narrow mobile viewport.
3. Add keyboard checks for skip-link activation, focus visibility, navigation order, and button activation. Do not assert a fragile pixel-perfect layout.
4. Add a reduced-motion test or manual browser check that verifies non-essential transitions are disabled when prefers-reduced-motion: reduce is active.
5. Run formatting, linting, type checking, unit tests, the Chromium smoke test, accessibility tests, and a production build using the scripts established by Phase 0.

### 8. Optional SonarQube setup and CI integration

This work can proceed in parallel with Steps 2–6 after the Phase 0 CI workflow and TypeScript configuration exist.

1. Record the manual setup checkpoint: the GitHub App is configured in SonarQube, `hermes-agent-ak/git-fanta-site` is imported and bound, and the project key is present in `sonar-project.properties`. App credentials are entered only in SonarQube's protected settings.
2. Commit `.github/workflows/build.yml` and `sonar-project.properties` as tracked configuration. Review the diff and repository search results to confirm that only the public project identifier and secret names are present.
3. Create a SonarQube project or analysis token and store it in the website repository's GitHub Actions secrets as `SONAR_TOKEN`. Never put the token in a workflow, properties file, shell command, plan, issue, or log.
4. Configure `SONAR_HOST_URL` as runtime configuration. A repository variable is preferred because the URL is not a credential; the generated onboarding workflow may use a secret reference, which is acceptable if the owner has already configured it there. In local mode the value is `http://localhost:9000`, but it must resolve from the runner rather than from the developer's browser.
5. For the free localhost mode, manually register a repository-level Linux x86_64 self-hosted runner on the trusted machine. Verify that it can make outbound HTTPS connections to GitHub and reach the local SonarQube service. Do not expose port 9000 through an unauthenticated tunnel.
6. Restrict the local SonarQube workflow to trusted pushes to protected `dev`/`main` branches and explicit `workflow_dispatch`. Do not run this self-hosted job for arbitrary fork pull requests. Keep normal pull-request checks on GitHub-hosted runners independent from the local SonarQube service.
7. The current workflow already uses the registered approved self-hosted label and documented trust boundary. Keep the scanner action pinned to a stable immutable reference and retain `fetch-depth: 0` for analysis history.
8. Keep the SonarQube job separate from the baseline Phase 0 workflow. It must:
   - run after checkout, Node 24 setup, pnpm installation, dependency installation, and the relevant project checks;
   - use configured `SONAR_HOST_URL` and masked `SONAR_TOKEN` inputs;
   - fail clearly if required configuration is absent when the trusted-branch job is enabled;
   - use least-privilege GitHub token permissions;
   - never print the token or include it in command arguments or generated output;
   - make quality-gate enforcement explicit through the supported scanner/action mechanism rather than leaving a commented example as the final policy.
9. Add a post-scan check for generated HTML, JavaScript, source maps, logs, and reports to ensure that secret values cannot reach artifacts. The check must never print the value it searches for.
10. Document the manual GitHub/SonarQube setup, runner trust boundary, and local-versus-GitHub-hosted limitation in README.md or CONTRIBUTING.md during the quality/development plan. Keep this implementation plan free of credential values and personal machine paths.

The SonarQube job must not block the first design-system pull request merely because the owner has not completed the optional server configuration. Once the owner enables the job, a failed quality gate is a real CI failure and must not be hidden.

## Commands

Run all commands from the repository root. Do not replace repository-relative paths with local absolute paths.

### Branch workflow

~~~bash
git switch dev
git pull --ff-only origin dev
git switch feature/phase-1-design-system-and-layout
~~~

The pull request for this branch targets dev. After review and merge, dev is the integration branch. main remains the deployable branch and is updated through the normal release or promotion process.

### Baseline and Phase 1 checks

~~~bash
corepack enable
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm check
pnpm test:unit
pnpm test:e2e --project=chromium tests/e2e/design-foundation.spec.ts
pnpm test:a11y
pnpm build
~~~

If the bootstrap scripts use a different test-file location, update the command in the plan before implementation rather than silently relying on a guessed path.

### Optional local SonarQube check

The exact scanner command must be supplied by the selected stable scanner integration. Its interface must consume runtime values, never committed values:

~~~bash
SONAR_HOST_URL="\${SONAR_HOST_URL:-http://localhost:9000}" \
SONAR_TOKEN="\${SONAR_TOKEN:?Set SONAR_TOKEN through a local credential store}" \
pnpm sonar
~~~

The command must not echo either variable. If pnpm sonar is not configured, the optional lane is not ready and the plan must stop at the manual setup checkpoint instead of inventing a global scanner dependency.

## Testing steps

### Automated checks

- pnpm format:check must pass with no modified files.
- pnpm lint must pass without suppressing rules for layout components or tests.
- pnpm check must pass under strict TypeScript and Astro checking.
- pnpm test:unit must pass.
- The Chromium design-foundation test must pass at desktop and mobile viewports.
- The @a11y suite must pass with no critical or serious Axe violations.
- The production build must complete with no missing internal links caused by the base path.
- If SonarQube is enabled, the optional job must complete and meet the configured quality gate; if it is not configured, baseline CI must still pass and the optional job must not fail the run.

### Manual checks

At viewport widths of approximately 320, 768, and 1440 CSS pixels:

- Verify that header, navigation, container, cards, and buttons do not overflow horizontally.
- Verify that text remains readable and interactive controls remain comfortably tappable.
- Navigate through the complete shell using only the keyboard.
- Confirm the skip link becomes visible on focus and moves focus to #main-content.
- Confirm focus indicators remain visible on dark, elevated, accent, and status surfaces.
- Enable reduced motion in browser accessibility settings and verify that non-essential motion is removed or minimized.
- Inspect generated HTML to confirm the primary shell works before JavaScript loads.
- Verify that internal links resolve correctly under the project base path and do not assume /.
- Confirm no remote font request, analytics request, token, or local filesystem path appears in generated output.

### Optional SonarQube manual checkpoint

Before enabling the CI job, the repository owner must verify from the SonarQube UI that:

- the GitHub App configuration is saved and the repository import is bound to the intended project;
- the project key is correct;
- the token was created without placing its value in any repository file;
- `SONAR_HOST_URL` is configured as runtime data and is reachable from the selected CI runner; for localhost mode, the check must be performed on the self-hosted runner machine itself;
- the self-hosted runner is repository-scoped, online, patched, and not available to untrusted fork pull requests;
- the quality gate reflects the website's actual baseline and does not require unsupported coverage before tests exist;
- the scanner reports source/test paths relative to the checkout.

The owner should be notified at this checkpoint because it requires external GitHub and SonarQube configuration that cannot be completed safely from the repository alone. Design implementation can continue in parallel while this decision and setup are pending.

## Acceptance criteria

- src/styles/global.css contains the required Tailwind CSS 4 import, semantic Git Fanta tokens, focus-visible styles, and reduced-motion rules.
- No legacy Tailwind configuration or @astrojs/tailwind dependency is introduced.
- BaseLayout.astro provides one semantic header, one main, a skip-link target, and one footer without any client directive.
- Container.astro, Button.astro, and Card.astro have typed, small APIs matching the defined prop contracts and use semantic token names.
- Header and footer navigation are keyboard-accessible, use descriptive labels, expose current location where reliable, and work under the GitHub Pages base path.
- Button links render as links and buttons render as native buttons; no fake href="#" buttons are used.
- The shell contains no invented product claim or fabricated asset.
- Static layout sections contain no React hydration directive.
- Chromium smoke and Axe accessibility checks pass at desktop and narrow mobile viewports.
- The design foundation uses no remote fonts, analytics, cookies, UI framework, or animation library.
- `.github/workflows/build.yml` and `sonar-project.properties`, if enabled, contain only reproducible configuration and public project identifiers; no token, private key, or machine-specific absolute path is committed.
- The optional free localhost SonarQube setup has a documented Community Build project, GitHub App binding, `SONAR_TOKEN` secret, runtime `SONAR_HOST_URL`, and a trusted self-hosted runner that can reach the local server.
- The generated SonarQube workflow is not considered operational for localhost until its runner, trusted triggers, action pin, and quality-gate policy are explicitly finalized.
- Optional SonarQube configuration, if enabled, uses repository-relative paths and runtime `SONAR_HOST_URL`/`SONAR_TOKEN` injection only.
- No real secret, credential value, personal machine path, or unsafe unbounded command appears in this plan or any Phase 1 artifact.
- The optional SonarQube job is skipped safely when not configured and becomes a visible CI failure after the owner explicitly enables it and its prerequisites are present.
- The feature branch is reviewed through a pull request into dev; main is not modified by this phase.

## Failure cases

- Bootstrap is incomplete: stop and report the missing exact file or command; do not duplicate Phase 0 work.
- Tailwind integration is legacy or missing: stop before adding component classes and correct the bootstrap integration first.
- Base-path helper is missing: do not add root-relative links; add the helper as a documented bootstrap dependency or defer navigation work.
- Contrast fails: adjust token values or semantic pairings and rerun Axe/contrast checks; do not weaken text color or hide the failing element.
- A component requires client state: keep the primitive static and move actual interactive behavior to the later approved React island.
- SonarQube is unreachable locally: report the endpoint failure without printing the token; do not expose the local server or make baseline CI depend on it.
- GitHub-hosted CI cannot reach localhost:9000: keep the optional job disabled until the owner provides a secured reachable endpoint or an approved self-hosted runner.
- `localhost` resolves on the wrong machine: run the scan on the SonarQube host or replace the endpoint with a secured, runner-reachable URL; do not guess an IP address or create an ad-hoc public tunnel.
- A public fork pull request is routed to the local self-hosted runner: stop the workflow, remove the untrusted trigger, review runner access, and keep SonarQube analysis limited to trusted branch pushes.
- SonarQube is enabled without a token or project: fail with a clear configuration message; never log or guess credentials.
- SonarQube reports unsupported Astro files: adjust documented scanner inclusion rules and keep TypeScript analysis limited to supported inputs.
- Generated output contains a secret or absolute path: stop the build, remove the source of the leak, rotate any real credential immediately if one was exposed, and rerun the output scan.
- A destructive command has an ambiguous target: do not run it; rewrite it with an explicit, bounded target and rollback step.

## Security considerations

- This document is intended to be public. It contains only repository-relative paths, public project identifiers, and the secret name SONAR_TOKEN; it must never contain a token value.
- SONAR_HOST_URL is configuration, not a credential. SONAR_TOKEN must be supplied through a masked CI secret or a local credential mechanism and must never be defined as a PUBLIC_ value.
- Do not place credentials in URLs, command arguments, shell history, screenshots, fixtures, source maps, browser bundles, workflow logs, or SonarQube reports.
- GitHub-hosted runners must not be given access to the owner's local localhost:9000 through an ad-hoc public tunnel. Use a secured endpoint or an isolated self-hosted runner with documented trust boundaries.
- A self-hosted runner for this public repository must not process arbitrary fork pull requests. Trusted-branch-only triggers are a security boundary, not merely a performance choice.
- The SonarQube GitHub App's Client Secret and private key belong only in SonarQube's encrypted/protected configuration; they are distinct from the `SONAR_TOKEN` used by the scanner and must never be copied into GitHub Actions or repository files.
- CI workflows must use least-privilege permissions and immutable action references.
- All generated HTML and JavaScript must remain static and token-free.
- Any accidental credential exposure requires immediate credential rotation and a repository/CI audit before the branch is merged.

## Rollback strategy

- Keep all Phase 1 changes isolated to feature/phase-1-design-system-and-layout until review is complete.
- If the design foundation is rejected, close the pull request and delete the feature branch after confirming no required work exists only there. Do not reset or rewrite dev or main.
- If the feature has already merged to dev, use a normal git revert commit targeting the exact Phase 1 commit or merge commit; do not use a destructive history rewrite.
- Disable the optional SonarQube lane by setting its opt-in repository variable to false or reverting its CI job. Do not delete the SonarQube project or rotate credentials as a substitute for disabling a job.
- If the local runner is unavailable, disable only the SonarQube job or trusted trigger; baseline CI and deployment must remain independent. Do not replace the local endpoint with an unreviewed public tunnel.
- If a secret was exposed, stop all promotion, rotate it in the credential provider, remove it from every artifact, and document the incident before continuing.

## Definition of done

- The plan is committed in English at docs/implementation-plans/01-design-system-and-layout.md.
- The plan is independently reviewable and contains exact repository-relative paths, data structures, commands, tests, acceptance criteria, failure handling, security controls, and rollback instructions.
- The Phase 1 branch strategy is explicit: main is deployable, dev is integration, and the feature branch targets dev through a pull request.
- The design token contract, global styles, layout primitives, site chrome, and accessibility foundation are specified without inventing product content.
- The optional SonarQube lane is specified for local, GitHub-hosted, self-hosted, and unconfigured modes, including the localhost:9000 limitation, manual GitHub App/project setup, secret handling, runner trust boundary, and quality-gate checkpoint.
- The current SonarQube onboarding artifacts are identified as tracked bootstrap configuration, with the remaining runner and CI hardening work assigned to the quality plan.
- No secret, personal absolute path, or unsafe command is present in this plan.
- A reviewer can implement the phase from a clean checkout on another supported machine after the documented Phase 0 prerequisites are present.
