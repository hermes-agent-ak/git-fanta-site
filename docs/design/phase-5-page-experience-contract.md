# Phase 5 Page Experience Contract

This document is the implementation contract for the final Git Fanta homepage,
download page, and 404 route. The site is a discreet showroom for polished,
AI-assisted UI/UX: every memorable detail must improve orientation, product
understanding, trust, or download confidence.

The engineering target is WCAG 2.2 AA with EN 301 549-informed practices where
relevant. This is not a legal applicability or formal conformance claim. The
pages must work as static HTML first, on a 320 CSS-pixel viewport, at 200% and
400% zoom/reflow, with text-spacing overrides, keyboard navigation, screen
readers, reduced motion, touch input, and forced-colors review where supported.

## Page sequence

The homepage has one uninterrupted, semantic sequence:

```text
Hero → Product showcase → Core features → Git workflow preview → Download → Open source
```

Each section is a real `<section>` with a unique id, an accessible heading, and
an ordinary anchor. Branchline Navigation and Git Tree Reveal visually describe
the same sequence; neither is the source of content or the only route through
it.

| Section              | Anchor              | Purpose                                                   | Primary action                |
| -------------------- | ------------------- | --------------------------------------------------------- | ----------------------------- |
| Hero                 | `#hero`             | Establish product identity and value                      | Download Git Fanta            |
| Product showcase     | `#product-showcase` | Provide visual evidence with provenance                   | Continue reading              |
| Core features        | `#features`         | Explain source-backed product capabilities                | Explore feature copy          |
| Git workflow preview | `#workflow`         | Connect documented DAG behavior to the Git visual grammar | Read the workflow explanation |
| Download             | `#download`         | Hand off to the latest verified release                   | View download options         |
| Open source          | `#open-source`      | Establish project lineage and trust links                 | Open repository               |

## Named interaction contracts

### Branchline Navigation

Purpose: help a reader understand where they are in the homepage and jump to a
meaningful section.

Semantic contract:

- `BranchlineNav.astro` receives the existing `ExperienceSection` shape directly.
- Each link is a real `href="#section-id"` anchor with a visible label,
  conceptual ref, and `aria-current="location"` on the active section.
- The conceptual refs are design metadata, not live branch state.
- The navigation remains a labelled `<nav>` and its graph nodes are
  `aria-hidden` decoration.

Responsive contract:

- Wide layouts use the existing sticky branchline rail/map.
- Below the mobile breakpoint, the existing native `<details>` disclosure
  exposes a normal anchor list. Summary and links must be keyboard and touch
  operable without JavaScript.
- The DOM order remains header → main content → footer; no scroll hijacking or
  focus movement is allowed.

Motion and fallback:

- `branchline-enhancement.ts` may update active state through
  `IntersectionObserver`; if unavailable, the server-rendered first state and
  ordinary anchor clicks remain usable.
- Active-state enhancement is not required to reach content.
- No runtime data is fetched and no decorative JS is required.

Budget: no additional JavaScript beyond the existing small observer module;
links and summary controls remain usable with scripting disabled.

### Git Tree Reveal

Purpose: provide a lightweight visual route between sections without competing
with the reading order.

Semantic contract:

- `GitTreeReveal.astro` is `aria-hidden="true"` and `pointer-events: none`.
- Section headings and copy remain ordinary HTML siblings outside the graph.
- Connectors and commit markers communicate continuity only; no product claim
  depends on their position, color, or reveal timing.

Motion and fallback:

- Use existing CSS/view-driven motion intents only.
- Allowed animated properties are transform, opacity, color, and small SVG
  stroke changes. The maximum intent duration is 320 ms.
- Unsupported browsers receive the final static graph. Reduced-motion users
  receive it immediately with animation and transition disabled.
- No canvas, WebGL, autoplay video, scroll event loop, animation library,
  layout-heavy animation, `transition: all`, or unbounded `will-change`.

Budget: zero runtime JS for decorative motion; one small graph DOM tree with
the section count; no large background asset.

### Release Trace

Purpose: turn build-time release data into a trustworthy handoff without making
the visual Git refs look like live repository telemetry.

State model:

- `available`: a validated HTTPS release asset exists and receives a direct link.
- `missing`: a known artifact kind is not present in this published release;
  the page shows a label and a text explanation with no guessed URL.
- `unsupported`: an asset exists but Phase 4 did not classify its filename;
  the complete GitHub Release remains the source of truth.
- `checksum unavailable`: the page says SHA256SUMS was not published instead of
  implying that verification happened.

The release surface renders version, title, UTC publication date, release link,
asset labels, file names, sizes, warnings, and checksum state from the
serializable download model only. Raw GitHub response objects and Markdown do
not cross into page components.

Budget: build-time data only; no browser GitHub request, token, live polling, or
release-note HTML injection.

### Git workflow preview

Purpose: show the documented DAG behavior as a compact, recognizable Git graph
without making the decorative layer the source of product information.

- The orange primary path continues vertically through the workflow preview.
- A green feature branch leaves the middle primary commit, runs on a distinct
  right-hand lane with two green commits, and curves back into an orange merge
  commit on the primary path.
- Branch and merge connectors use a small inline SVG with rounded Bézier paths;
  no angular elbow, detached node, canvas, or runtime graph library is needed.
- The graph remains `aria-hidden="true"`; the adjacent workflow copy explains
  the documented DAG behavior in ordinary HTML.

Budget: one small static SVG, no runtime JavaScript, no repository telemetry,
and no motion dependency beyond the existing reduced-motion contract.

### Download Selector

Purpose: help a person select an artifact while preserving a complete direct-link
fallback.

Semantic contract:

- `DownloadSelector.tsx` is the only React island and uses a native
  `<fieldset>`, `<legend>`, radio inputs, labels, and an action link.
- Available options expose platform, artifact type, file name, size, and
  recommendation in text. Selection meaning never relies on color alone.
- A concise `aria-live="polite"` status announces the selected artifact or an
  unavailable state. The actionable link remains outside the status region to
  avoid duplicate screen-reader output.
- The server-rendered direct-link list remains visible and complete with
  JavaScript disabled or hydration failure.

Behavior:

- The first recommendation may be selected initially, but OS detection is not
  required and never triggers a download.
- Changing a radio updates text and the action link without moving focus.
- A user must explicitly activate a link; no page-load navigation or automatic
  download is allowed.
- Unsigned-build, SmartScreen/Gatekeeper, checksum, and alongside-git-cola
  information remains outside the interactive control so it is available in
  the no-JS path too.

Budget: one hydrated island, no fetch, no UI framework, no browser storage, and
no client-side release parsing.

### Clean hierarchy and showroom surface

Purpose: make the implementation feel deliberate and distinctive because the
system is coherent, not because it adds novelty-only decoration.

- One dominant purpose and one primary action per region.
- Strong type scale, readable line length, intentional whitespace, and visible
  focus on dark and elevated surfaces.
- Orange, diff-green, warning, and neutral colors reinforce state but never
  carry meaning alone.
- The derived showcase is labelled in visible caption text and useful alt text;
  the pending original screenshot is never presented as official media.
- No fake metrics, testimonials, ratings, pricing, activity counters, or
  unsupported product badges.

Budget: local assets only, no remote fonts or analytics, no third-party visual
embed, and no full animation/UI library.

## Accessibility state matrix

| State or condition        | Required result                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard only             | Skip link, header, Branchline, every section action, selector, disclosures, direct links, and footer are reachable in DOM order.             |
| Screen reader             | Landmarks, heading levels, image decisions, link names, selected state, unavailable state, and external-link behavior are announced clearly. |
| 200%/400% zoom and reflow | Content remains readable, controls remain reachable, and refs/file names wrap without critical horizontal overflow.                          |
| Text-spacing override     | Increased line/paragraph/letter/word spacing does not clip or hide content.                                                                  |
| Reduced motion            | Final graph/content state appears immediately; no action depends on animation.                                                               |
| Forced colors             | Borders, focus, links, selected state, warnings, and disabled/unavailable states remain distinguishable using system colors and text.        |
| Touch                     | Controls meet at least 24×24 CSS px where exceptions do not apply; primary actions target 44 CSS px.                                         |
| Missing release asset     | Label remains visible, URL is null, no download action is rendered, and complete-release fallback remains.                                   |
| JavaScript disabled       | Static content, direct links, warnings, metadata, and recovery paths remain complete.                                                        |
| Focus after interaction   | Selection/disclosure does not steal focus or move the user unexpectedly.                                                                     |

## Route contracts

### `/`

- Static build loads the validated latest release and approved content models.
- Product sections occur exactly once in the sequence defined above.
- Header has internal Overview and Download links plus external project links.
- The showcase caption distinguishes derived media from an official screenshot.

### `/download/`

- Static build loads the same normalized latest release and derives
  `DownloadPageModel` without raw API fields.
- Direct links, selector, unavailable states, checksum guidance, unsigned-build
  warning, alongside-git-cola statement, and complete-release link are present.
- No artifact is downloaded or navigated to without explicit activation.

### `/404.html`

- The page has a clear h1, recovery links to home and downloads, normal header
  and footer, and no required animation.

### `/robots.txt` and sitemap

- `robots.txt` is a prerendered plain-text endpoint derived from configured
  `SITE_URL` and `BASE_PATH`.
- The sitemap is generated by the official Astro integration and contains only
  public static routes.

## Review gates

Before Phase 5 is marked complete:

1. Run `pnpm check`, unit tests, fixture build, route E2E tests, Axe, formatter,
   and lint sequentially.
2. Use keyboard-only navigation and inspect accessible names on all three HTML
   routes.
3. Inspect 320, 768, and 1440 CSS-pixel layouts plus 200%/400% zoom, reflow,
   reduced motion, text spacing, and forced colors where supported.
4. Inspect generated output for raw tokens, browser GitHub fetches, guessed
   URLs, raw release Markdown/HTML, unsupported JSON-LD fields, and broken
   project-base paths.
5. Record any remaining limitation before handing the surface to Phase 6.
