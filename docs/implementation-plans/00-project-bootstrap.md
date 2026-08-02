---
status: completed
completed_at: 2026-08-02
implementation_branch: feature/phase-0-project-bootstrap
implementation_head: committed
ci_run: not yet run in GitHub Actions; verified locally
---

# Phase 0 Implementation Plan — Project Bootstrap

## Objective

Create the smallest runnable Astro foundation on the approved Node 24 and pnpm 11.4 toolchain.
The result must be statically buildable, base-path safe for GitHub Pages, linted, type-checked,
unit-tested, and covered by one meaningful Chromium/Axe browser test.

## Test-driven contract

The implementation follows a layered test boundary:

1. Pure URL behavior is covered by Vitest before it is used by the page.
2. Astro's type checker and static build validate the framework and configuration boundary.
3. Playwright exercises the rendered page through the browser.
4. Axe checks the same user-visible shell for accessibility violations.

Each layer protects a different failure mode. No browser test duplicates pure URL cases, and no
SonarQube result substitutes for these baseline checks.

## Implemented foundation

- Node.js 24.18.1 is declared in `.nvmrc` and `package.json`.
- pnpm 11.4.0 is declared in `package.json` and locked in `pnpm-lock.yaml`.
- Astro static output, React integration, Tailwind CSS 4 through `@tailwindcss/vite`, strict
  TypeScript, ESLint flat config, Prettier, Vitest, Playwright and Axe are configured.
- `src/lib/site-url.ts` prevents internal links from losing the GitHub Pages project base.
- `src/pages/index.astro` provides a deliberately small accessible page shell.
- `.github/workflows/ci.yml` runs formatting, lint, type checking, unit tests, build and Chromium
  E2E/accessibility tests on pull requests and the protected integration branches.
- SonarQube remains an optional trusted quality lane in `.github/workflows/build.yml`.

## Verification commands

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
```

## Non-scope

This phase does not implement final product content, screenshots, release API integration,
download selection, design-system primitives, deployment, or cross-repository release dispatch.
