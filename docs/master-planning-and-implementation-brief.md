# Git Fanta Website — Master Planning and Implementation Brief

## 1. Mission

Create a modern, production-quality website for the Git Fanta desktop application.

The website must demonstrate current frontend engineering, strong architectural decisions, GitHub ecosystem integration, accessibility, performance, CI/CD, automated release synchronization and maintainable TypeScript code.

This is not a research task.

The technology choices and architectural decisions in this brief are already approved. Do not replace them with different frameworks, hosting services or architectural patterns.

The work must be divided into multiple detailed implementation plans before implementation begins.

After the plans have been created, implement them in dependency order.

## 2. Existing project context

The main application repository is:

```text
hermes-agent-ak/git-fanta
```

Git Fanta is a Python and Qt desktop application based on git-cola.

The existing application repository already has:

* GitHub Actions CI
* tag-based releases using tags matching `v*`
* Windows installer builds
* Linux AppImage builds
* Linux portable archive builds
* macOS application ZIP builds
* Python source distribution and wheel builds
* SHA-256 checksums
* GitHub Releases
* a current published release, v1.0.2

The website must live in a separate repository:

```text
hermes-agent-ak/git-fanta-site
```

Do not place Node.js dependencies or website source files inside the Python application repository.

The two repositories have separate deployment and release boundaries.

## 3. Approved technology baseline

Use only stable releases. Do not use alpha, beta, release-candidate, canary or experimental packages unless this brief explicitly requests an experimental feature.

Baseline verified on 2026-08-02:

```text
Runtime:          Node.js 24 LTS
Package manager:  pnpm 11.4
Framework:        Astro 7.1
Language:         TypeScript 6.0
Styling:          Tailwind CSS 4.3
UI island:        React 19.2
Testing:          Playwright 1.62
Hosting:          GitHub Pages
CI/CD:            GitHub Actions
API:              GitHub REST API
API version:      2026-03-10
```

Use the latest stable patch version belonging to these approved major or minor versions when initializing the project.

Commit the resulting `pnpm-lock.yaml`.

Declare the exact package-manager version in `package.json`:

```json
{
  "packageManager": "pnpm@11.4.0"
}
```

Use Node 24 locally and in CI.

Do not use Node 26 Current for this project.

Use Corepack with Node 24 to activate the declared pnpm version.

## 4. Fixed architecture decisions

The website must be a statically generated Astro site.

It must not require:

* an application server
* server-side rendering
* serverless functions
* a database
* a CMS
* user accounts
* authentication
* cookies
* analytics in the initial version
* Docker
* Kubernetes
* Next.js
* a runtime API proxy

The production output must be static files deployable directly to GitHub Pages.

Use Astro components for all static content.

React may only be used for a genuinely interactive component. Do not implement the entire site as React.

The initial React island should be limited to one useful component, such as:

```text
DownloadSelector
```

It may provide:

* operating-system selection
* recommended asset highlighting
* copyable installation commands
* expandable platform instructions

Hydrate it with an appropriate Astro client directive such as `client:visible` or `client:idle`.

Do not hydrate static sections.

## 5. Local hardware constraints

Development takes place on:

```text
Operating system: Xubuntu Linux
Architecture:     x86_64
Hardware origin:  Mac mini, 2012
```

The machine has been upgraded and works reliably, but the project should remain lightweight.

Requirements:

* no mandatory containers
* no locally hosted services
* no database processes
* no excessive development dependencies
* no unnecessary monorepo tooling
* no full browser matrix during normal local development
* Chromium-only Playwright execution is sufficient for the default local test command
* CI may perform additional browser checks where useful
* normal development and production builds should stay comfortably below 2 GB of memory
* all scripts must work in Bash on Xubuntu
* do not introduce macOS-only development commands

The old age of the physical computer must not cause outdated software choices. Use the approved modern stack.

## 6. Tailwind integration requirements

Use Tailwind CSS 4 through the official Vite plugin.

Preferred setup:

```bash
pnpm astro add tailwind
```

The generated setup must use:

```text
@tailwindcss/vite
```

The global stylesheet must import Tailwind with:

```css
@import "tailwindcss";
```

Do not install or configure:

```text
@astrojs/tailwind
```

Do not create a legacy Tailwind 3 configuration.

Prefer Tailwind 4 CSS-based theme configuration.

Create explicit Git Fanta design tokens for:

* background layers
* foreground colors
* muted text
* borders
* Fanta orange accent
* success state
* warning state
* destructive state
* focus ring
* spacing
* border radius
* shadows
* typography

Do not build the site from an unmodified generic template.

## 7. Visual direction

The site should feel related to GitHub and Git tooling without copying GitHub’s website.

Use a modern dark-first visual design with:

* deep neutral background
* high-contrast typography
* Git Fanta orange as the principal accent
* subtle diff-green and diff-red details
* branch and commit graph motifs
* terminal-inspired detail elements
* restrained glow effects
* subtle gradients
* large authentic application screenshots
* strong spacing and typography
* smooth but limited motion
* responsive layouts
* visible keyboard focus states

Avoid:

* excessive glassmorphism
* generic SaaS dashboard styling
* huge animated backgrounds
* autoplay video
* decorative JavaScript
* fake GitHub statistics
* invented testimonials
* stock photography
* inaccessible low-contrast text

All animation must respect:

```css
prefers-reduced-motion
```

## 8. Initial information architecture

Version 1 should contain:

```text
/
├── Hero
├── Product screenshot
├── Core features
├── Git workflow preview
├── Download section
├── Open-source section
└── Footer

/download/
├── Latest release information
├── Platform-specific downloads
├── Verification instructions
├── Unsigned-build warning
└── Link to all GitHub Releases

/404.html
```

Do not add a blog, documentation portal or changelog system in version 1.

The home page should contain these core messages:

```text
Git Fanta
The highly caffeinated Git GUI.

A modernized git-cola fork focused on cleaner UI/UX,
more intuitive workflows and a smoother everyday Git experience.
```

Product claims must be supported by the actual Git Fanta repository.

Do not invent features that are not present in the desktop application.

## 9. GitHub release integration

Release data must be fetched from the public GitHub REST API during the Astro production build.

Use:

```text
GET /repos/hermes-agent-ak/git-fanta/releases/latest
```

Send these headers:

```text
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2026-03-10
```

Use native `fetch`.

Do not add Octokit unless native `fetch` proves technically insufficient.

An optional GitHub token may be read from the build environment to increase the rate limit, but the integration must also support unauthenticated requests because the repository is public.

Never expose a GitHub token through a `PUBLIC_` environment variable or browser-side JavaScript.

Validate the GitHub API response at runtime with Zod.

Create a normalized internal type instead of passing the raw API response through the application.

The normalized release model should include at least:

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

Classify the known Git Fanta assets from their file names.

Known patterns include:

```text
git-fanta-v*-windows-x86_64-installer.exe
git-fanta-v*-linux-x86_64.AppImage
git-fanta-v*-linux-x86_64.tar.gz
git-fanta-v*-macos.zip
*.whl
*.tar.gz
SHA256SUMS
```

Be careful because both the Python source distribution and Linux portable archive can use `.tar.gz`.

Classify the Linux archive using the complete `linux-x86_64.tar.gz` suffix.

Provide a fixture mode for offline development and deterministic tests:

```text
GITHUB_API_MODE=fixture
```

Store a representative GitHub release fixture under the test or fixture directory.

Production builds must not silently fall back to stale fixture data. A failed production API request should fail with a clear error while leaving the previously deployed GitHub Pages version untouched.

## 10. Download experience

The download component must support:

* Windows x86_64 installer
* Linux x86_64 AppImage
* Linux x86_64 portable archive
* macOS ZIP
* Python wheel or source archive where appropriate
* SHA256SUMS
* link to the complete GitHub Release

The website must clearly state:

* Windows and macOS builds may currently be unsigned
* Windows SmartScreen or macOS Gatekeeper may display a warning
* users should verify downloads with `SHA256SUMS`
* Git Fanta installs alongside git-cola
* Git Fanta does not overwrite git-cola

Do not claim that the site can automatically select a compatible architecture unless the release contains that architecture.

Browser operating-system detection may only be a convenience. The user must always be able to select another platform manually.

Do not automatically begin a download.

## 11. SEO and metadata

Implement:

* canonical URLs
* page titles
* page descriptions
* Open Graph metadata
* social preview image support
* favicon
* web app manifest only when useful
* `robots.txt`
* sitemap
* semantic heading hierarchy
* structured data using `SoftwareApplication`
* links to repository, releases, issues and license

Use the official Astro sitemap integration.

The structured data must not include ratings, prices or operating-system support that cannot be proven.

## 12. Accessibility requirements

Target WCAG 2.2 AA.

Required checks:

* full keyboard navigation
* visible focus indicators
* logical focus order
* semantic landmarks
* correct heading levels
* descriptive link text
* descriptive alternative text
* decorative images excluded from the accessibility tree
* sufficient color contrast
* reduced-motion support
* no hover-only information
* touch targets of reasonable size
* accessible disclosure controls
* accessible download selection
* no automatic focus stealing

Integrate Axe into Playwright tests.

## 13. Performance requirements

The website must be fast on average hardware and slower networks.

Targets for the production homepage:

```text
Lighthouse Performance:      >= 95
Lighthouse Accessibility:    >= 95
Lighthouse Best Practices:   >= 95
Lighthouse SEO:              >= 95
```

Additional expectations:

* static HTML for primary content
* minimal client-side JavaScript
* optimized local screenshots
* responsive image sizes
* Astro image optimization where applicable
* lazy-load images below the fold
* no remote font dependency
* no third-party analytics in version 1
* no animation library unless CSS and native browser features are insufficient
* no large component library
* no full GitHub Primer CSS dependency

A small icon package is acceptable, but do not import an entire UI framework for a few icons.

## 14. Repository quality requirements

Create:

```text
.editorconfig
.gitignore
.nvmrc
README.md
CONTRIBUTING.md
LICENSE
SECURITY.md
```

Use a license suitable for the website code and document the license status of all copied assets.

Do not assume that the GPL license of the application automatically applies to every website asset without documenting the decision.

Configure:

* TypeScript strictest mode
* Astro type checking
* ESLint flat configuration
* Astro ESLint support
* React ESLint support where necessary
* Prettier
* Astro Prettier plugin
* EditorConfig
* Dependabot
* GitHub dependency review
* CodeQL only if it adds useful coverage without creating excessive maintenance

Provide scripts similar to:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "test": "pnpm test:unit && pnpm test:e2e",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep @a11y"
  }
}
```

Install current stable versions for supporting packages not explicitly versioned in this brief, then pin them through the lockfile.

Do not use floating GitHub Action references such as `@main`.

## 15. GitHub Actions

Create a pull-request CI workflow that performs:

1. dependency installation with frozen lockfile
2. formatting check
3. ESLint
4. Astro type checking
5. unit tests
6. production build
7. Playwright smoke tests
8. accessibility tests

Use concurrency cancellation for superseded pull-request runs.

Use least-privilege permissions.

Create a GitHub Pages deployment workflow triggered by:

```text
push to main
workflow_dispatch
repository_dispatch type git-fanta-release-published
```

Use the current Astro GitHub Pages pattern:

```text
actions/checkout@v7
withastro/action@v6
actions/deploy-pages@v5
```

Use these deployment permissions:

```yaml
contents: read
pages: write
id-token: write
```

Use the `github-pages` deployment environment.

The site must support deployment first under the repository subpath:

```text
/hermes-agent-ak/git-fanta-site equivalent project-page path
```

More precisely, configure Astro so it can work under:

```text
https://hermes-agent-ak.github.io/git-fanta-site/
```

Design the configuration so a future custom domain can switch the base path to `/` through environment configuration without rewriting application components.

Do not hard-code root-relative asset paths that break on GitHub project pages.

## 16. Cross-repository release synchronization

After the website deployment works independently, extend the Git Fanta release workflow.

The current release workflow publishes the release by changing it from draft to published.

Immediately after successful publication, send a repository dispatch event to:

```text
hermes-agent-ak/git-fanta-site
```

Use the event type:

```text
git-fanta-release-published
```

Include a small client payload:

```json
{
  "tag": "v1.0.2",
  "source_repository": "hermes-agent-ak/git-fanta"
}
```

The actual tag must come from the release workflow output and must not be hard-coded.

Store the cross-repository credential as a protected GitHub Actions secret in the Git Fanta repository or its `release` environment.

Use a fine-grained personal access token scoped only to the website repository with:

```text
Contents: write
```

This is required for the repository-dispatch endpoint.

Name the secret clearly, for example:

```text
GIT_FANTA_SITE_DISPATCH_TOKEN
```

Do not print the token.

The release itself must remain successful even if the website dispatch temporarily fails only if that behavior is explicitly documented. Prefer making the dispatch a clearly visible final release step.

The website deployment must independently fetch the published release from GitHub. Do not trust release metadata supplied only through `client_payload`.

## 17. Required implementation-plan decomposition

Before changing application code, create these files:

```text
docs/implementation-plans/
├── 00-project-bootstrap.md
├── 01-design-system-and-layout.md
├── 02-content-and-product-assets.md
├── 03-github-release-integration.md
├── 04-pages-and-interactivity.md
├── 05-testing-quality-and-security.md
├── 06-github-pages-deployment.md
└── 07-cross-repository-release-trigger.md
```

Each implementation plan must contain:

```text
Objective
Current-state findings
Scope
Explicit non-scope
Dependencies
Files to create
Files to modify
Data structures
Implementation steps
Commands
Testing steps
Acceptance criteria
Failure cases
Security considerations
Rollback strategy
Definition of done
```

Plans must reference exact file paths.

Avoid vague instructions such as:

```text
Improve styling.
Add some tests.
Configure CI.
Handle errors.
```

Replace them with precise actions and measurable acceptance criteria.

## 18. Implementation order

Use this order:

### Phase 0 — Bootstrap

Create the Astro repository, Node and pnpm configuration, strict TypeScript setup, Tailwind 4 Vite integration, React integration, directory structure and basic scripts.

### Phase 1 — Design foundation

Create design tokens, global styles, base layout, header, footer, responsive container primitives, buttons, cards and accessibility foundations.

### Phase 2 — Content and assets

Inspect the Git Fanta repository for accurate product descriptions, logo files and screenshots. Copy only required assets while preserving attribution and licensing information.

Do not invent missing screenshots. Use explicit placeholders marked for replacement if authentic screenshots are not available locally.

### Phase 3 — Release data

Implement GitHub API fetching, Zod schemas, normalization, asset classification, fixture mode, formatting utilities and unit tests.

### Phase 4 — Pages

Build the homepage, download page, 404 page, metadata, structured data and the minimal React download island.

### Phase 5 — Quality

Add ESLint, Prettier, Vitest, Playwright, Axe, performance checks, Dependabot and dependency review.

### Phase 6 — Deployment

Add GitHub Pages configuration and deployment workflow. Verify project-subpath routing and static assets.

### Phase 7 — Repository integration

Update the Git Fanta release workflow to dispatch a website rebuild after a release is published. Update the Git Fanta README and repository metadata to point to the new website only after the site is live.

## 19. Codex operating instructions

First inspect the local repositories and report material differences from this brief.

Do not perform general web research.

Use this document as the architectural source of truth.

Repository inspection is allowed and required.

Before implementation:

1. create all implementation-plan documents
2. make each plan independently reviewable
3. check dependencies between plans
4. ensure each plan has exact acceptance criteria
5. summarize the implementation order

Then implement one plan at a time.

After each plan:

1. run its required checks
2. fix failures before moving on
3. summarize changed files
4. summarize test results
5. update the plan’s completion status
6. avoid unrelated refactoring

Do not:

* change the approved framework
* replace GitHub Pages with Vercel, Netlify or Cloudflare
* replace pnpm with npm, Yarn, Bun or Deno
* replace Astro with Next.js
* convert the whole site into React
* add a backend
* add analytics
* create fake content
* weaken TypeScript strictness
* disable failing tests to make CI green
* use legacy Tailwind configuration
* use deprecated Astro integrations
* push to GitHub without explicit permission
* create repositories or secrets automatically
* modify Git Fanta application behavior unrelated to website integration

When a remote-only step cannot be completed locally, implement the repository files and document the exact manual GitHub configuration required.

## 20. Final definition of done

The project is complete when:

* the website repository builds on Xubuntu with Node 24 and pnpm 11.4
* all dependencies are locked
* the site is statically generated
* the home page accurately presents Git Fanta
* the latest GitHub Release is fetched during the build
* all known release assets are classified correctly
* downloads work for Windows, Linux and macOS
* checksum verification is clearly documented
* unsigned-build warnings are visible
* the site works under the GitHub Pages project subpath
* the site is responsive
* keyboard navigation works
* reduced-motion preferences are respected
* automated accessibility tests pass
* CI passes
* GitHub Pages deployment works
* a published Git Fanta release triggers a website rebuild
* no private token reaches client-side output
* no backend or runtime infrastructure is required
* the Git Fanta repository links to the new website
* the implementation plans accurately describe the final result
