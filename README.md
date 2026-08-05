# Git Fanta Website

The official website for [Git Fanta](https://github.com/hermes-agent-ak/git-fanta), a modernized git-cola fork focused on a cleaner user experience and smoother everyday Git workflows.

Visit the live website: [hermes-agent-ak.github.io/git-fanta-site](https://hermes-agent-ak.github.io/git-fanta-site/).

This repository is intentionally separate from the Python/Qt application repository. It contains the website, its static-build tooling, its tests, and its deployment configuration.

Phases 0–5 and the promoted GitHub Pages deployment are complete. The next
planned phase adds the final quality, performance, security, and dependency
gates. The architectural source of truth is the
[Master Planning and Implementation Brief](docs/master-planning-and-implementation-brief.md).

## Why this architecture

The decisions documented here are deliberate project constraints. I chose them to keep the website fast, maintainable, secure, inexpensive to operate, and appropriate for the GitHub ecosystem.

### A separate repository

The application and the website have different release and deployment boundaries, so I keep them in separate repositories:

- Application: `hermes-agent-ak/git-fanta`
- Website: `hermes-agent-ak/git-fanta-site`

This prevents Node.js dependencies and website changes from entering the Python application repository. It also allows the website to deploy independently while still reacting to published application releases through an explicit repository-dispatch event.

### Astro with static output

I chose Astro because the site is primarily content and product information, not an authenticated web application. Astro lets the pages be rendered to static HTML at build time while keeping client-side JavaScript close to zero for the static parts of the site.

Static output is a deliberate operational choice:

- GitHub Pages can serve the result directly.
- There is no application server, database, CMS, serverless function, or runtime API proxy to maintain.
- The primary content is available without waiting for browser JavaScript.
- The result is lightweight and resilient on slower networks and older hardware.

Server-side rendering and other server-dependent approaches are therefore outside the scope of the initial version.

### React only where interactivity is useful

I am not using React as the framework for the whole website. Static content belongs in Astro components because turning every section into a client-rendered component would add JavaScript and complexity without improving the experience.

React is reserved for one genuinely interactive island, initially the `DownloadSelector`. That component may provide platform selection, recommended download highlighting, installation instructions, and accessible disclosure controls. It will be hydrated only when appropriate, using an Astro client directive such as `client:visible` or `client:idle`.

This boundary keeps interactivity purposeful and makes the performance cost visible.

### Tailwind CSS 4 through the official Vite plugin

I chose Tailwind CSS 4 because it provides a small, direct styling workflow that works well with Astro and allows the Git Fanta design tokens to live in CSS. The integration will use the official `@tailwindcss/vite` plugin and `@import "tailwindcss"`.

The site will use explicit Git Fanta tokens for background layers, typography, foreground and muted colors, borders, the Fanta orange accent, status colors, focus rings, spacing, radii, and shadows. This is intended to produce a recognizable visual system rather than an unmodified generic template.

The legacy `@astrojs/tailwind` integration and Tailwind 3 configuration are intentionally excluded.

### Release data fetched during the build

The website needs current download links, but it does not need a runtime backend. During the Astro production build, it will fetch the public latest-release endpoint from the GitHub REST API:

```text
GET /repos/hermes-agent-ak/git-fanta/releases/latest
```

I chose native `fetch` instead of adding an API client dependency because this is one small, well-defined server-side build operation. Zod will validate the response, and the application will convert it into a small normalized release model. The raw GitHub response will not be passed through the website.

An optional non-public GitHub token may increase the build rate limit. It must never be exposed through a `PUBLIC_` variable or client-side JavaScript. `GITHUB_API_MODE=fixture` will provide deterministic offline development and tests.

Production builds will fail clearly when GitHub release data cannot be fetched. They will not silently substitute stale fixture data, because publishing an old download link is more dangerous than failing a deployment before it replaces the previously deployed site.

Build mode is controlled explicitly with `GITHUB_API_MODE`. It defaults to
`live`, which fetches the latest published release from GitHub. Set an optional
build-only `GITHUB_TOKEN` to increase the API rate limit; never use a
`PUBLIC_` variable for this token. Deterministic offline builds and tests use:

```bash
GITHUB_API_MODE=fixture pnpm build
GITHUB_API_MODE=fixture pnpm test:e2e
```

The Pages workflow sets `GITHUB_API_MODE=live`. A failed live request or invalid
release response fails the build, so the previous Pages deployment remains
untouched.

### GitHub Pages hosting

I chose GitHub Pages because the output is static, the source and release assets already live in GitHub, and the hosting model does not require additional infrastructure or credentials beyond the deployment workflow.

The initial deployment must work at:

```text
https://hermes-agent-ak.github.io/git-fanta-site/
```

The deployment workflow in `.github/workflows/deploy-pages.yml` publishes the
site from `main` through GitHub Actions. For the first deployment, open
**Settings → Pages → Build and deployment → Source** and select **GitHub
Actions**. The workflow can also be started with `workflow_dispatch` for
recovery without creating a new commit; the `github-pages` environment may
require approval for its first production deployment.

Astro's `site` and `base` configuration will be environment-aware so a future custom domain can use `/` without rewriting application components. Internal links and assets must not rely on root-relative paths that break under the project subpath.

### Node 24 and pnpm 11.4

I chose Node.js 24 LTS and pnpm 11.4 to use the approved modern stable toolchain while keeping local development predictable on the available Xubuntu x86_64 machine. The exact package-manager version will be declared in `package.json`, activated with Corepack, and locked in `pnpm-lock.yaml`.

The project does not use Node 26 Current, npm, Yarn, Bun, Deno, containers, or unnecessary monorepo tooling.

### Accessibility and performance as architecture requirements

Accessibility is not a later polish step. The component and page structure will use semantic landmarks, logical headings, keyboard-operable controls, visible focus states, descriptive alternatives, accessible disclosures, sufficient contrast, and reduced-motion behavior from the beginning.

Performance follows from the same architecture: static primary content, minimal JavaScript, local optimized screenshots, responsive images, lazy loading below the fold, no remote fonts, no analytics, and no large UI framework. Playwright and Axe checks will protect these requirements in CI.

### Release synchronization without coupling deployments

The application release workflow will send a `git-fanta-release-published` repository-dispatch event to this repository after a release is successfully published. The event will contain only small context such as the tag and source repository.

The website will still fetch the published release independently during its build. The dispatch payload is a trigger, not a source of release metadata. This keeps the two repositories loosely coupled and avoids trusting data supplied only by an event payload.

The cross-repository credential will be a protected fine-grained token scoped only to this repository with the required `Contents: write` permission. It will never be printed or shipped to the browser.

## Product and content principles

The website must describe the actual Git Fanta application. I will inspect the application repository for supported features, authentic screenshots, logo files, and asset licensing before adding product claims or copied media.

The site will not include invented testimonials, fake GitHub statistics, stock photography, unsupported operating-system claims, or a blog and documentation portal in version 1.

The download experience will cover the release assets that actually exist: Windows x86_64, Linux x86_64 AppImage, Linux portable archive, macOS ZIP, Python distributions where appropriate, and `SHA256SUMS`. It will explain that Windows and macOS builds may be unsigned, that SmartScreen or Gatekeeper may warn users, and that Git Fanta installs alongside git-cola without overwriting it.

## Approved technology baseline

The initial baseline is:

| Area | Choice |
| --- | --- |
| Runtime | Node.js 24 LTS |
| Package manager | pnpm 11.4 |
| Framework | Astro 7.1 |
| Language | TypeScript 6.0 |
| Styling | Tailwind CSS 4.3 |
| Interactive UI | React 19.2, limited to useful islands |
| Testing | Playwright 1.62, with Axe integration |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Release API | GitHub REST API with API version `2026-03-10` |

When the project is initialized, the latest stable patch release within each approved line will be used and recorded in the lockfile.

## Planned repository layout

The implementation will be divided into reviewable plans before application code is changed:

```text
docs/
├── implementation-plans/
│   ├── 00-project-bootstrap.md
│   ├── 01-design-system-and-layout.md
│   ├── 02-visual-experience-and-motion.md
│   ├── 03-content-and-product-assets.md
│   ├── 04-github-release-integration.md
│   ├── 05-pages-and-interactivity.md
│   ├── 06-testing-quality-and-security.md
│   ├── 07-github-pages-deployment.md
│   └── 08-cross-repository-release-trigger.md
└── master-planning-and-implementation-brief.md
```

The implementation phases are bootstrap, design foundation, visual experience,
content and assets, release data, pages, quality, deployment, and finally
cross-repository release synchronization.

## Local development expectations

The project is designed for Bash on Xubuntu and should remain comfortable on modest hardware:

- no mandatory containers or local services;
- no database process;
- no full browser matrix for normal local development;
- Chromium is sufficient for the default local Playwright command;
- normal development and production builds should remain comfortably below 2 GB of memory.

The available development and verification commands are:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

## License and copied assets

The website source will use a license suitable for website code. Application logos, screenshots, and other copied assets will retain their original attribution and licensing information. The application's GPL license will not be assumed to automatically apply to every website asset.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before making implementation changes. Architectural changes should explain why the existing decision no longer satisfies the project's goals and should update the relevant implementation plan and this README together.
