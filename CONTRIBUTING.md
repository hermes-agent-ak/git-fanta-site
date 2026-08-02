# Contributing to Git Fanta Website

The website lives in its own repository and uses Astro with static output. Keep website changes
in this repository; the Python and Qt application belongs to `hermes-agent-ak/git-fanta`.

## Development setup

Use Node.js 24 and the package manager declared in `package.json`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
pnpm build
```

The default browser test project is Chromium. Install its browser once with:

```bash
pnpm exec playwright install chromium
```

## Branch flow

Create implementation branches from `dev` and open pull requests back into `dev`. The `main`
branch receives reviewed changes from `dev` and is reserved for deployable website revisions.

The SonarQube workflow is an optional quality lane. It must not become a prerequisite for local
development or for contributors who do not have access to the trusted analysis runner.

## Test-driven development

Write the smallest failing test that expresses the behavior before implementing the behavior.
Keep each test at the layer where it provides the clearest signal:

* Vitest for pure functions and deterministic data transformations.
* `astro check` and the production build for framework, template, and static-output contracts.
* Playwright for browser-visible flows that unit tests cannot observe.
* Axe through Playwright for meaningful accessibility assertions on rendered pages.

Do not add a browser test for logic already covered by a unit test, and do not make SonarQube a
replacement for a failing test or a baseline CI check. The normal development loop is:

```text
RED: write the smallest test and observe the failure
GREEN: implement the smallest behavior that passes
REFACTOR: simplify without weakening the test's signal
```
