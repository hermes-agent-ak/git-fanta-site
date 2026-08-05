# Visual Experience Decision Log

## Decision

Git Fanta's Phase 2 visual language is **Branchline**: a conceptual route made
from ordinary page anchors, commit-like nodes, authored refs, and restrained
diff states. It makes the website feel native to a Git project while keeping
the product content and navigation semantic.

The visual layer is a showroom of design discipline. Its quality is measured by
coherent contracts, readable fallbacks, and implementation constraints rather
than by the number of effects on screen.

## Prompt-level intent

The design brief asks for a Git branch/tree metaphor that demonstrates strong
AI-assisted UI composition. The implementation translates that intent into
small named systems:

- Branchline Navigation provides the primary route through the page.
- Git Tree Reveal provides decorative continuity beside the content.
- Commit resolve, branch trace, diff reveal, and ref transition form the motion
  vocabulary.
- Conceptual refs are visible metadata authored by the website, never live Git
  telemetry.

Each system has one primary component contract, a semantic fallback, and a
bounded CSS surface.

## State ownership

The active Branchline state has one deliberate owner at each boundary:

1. `experienceSections` is the only source for IDs, hrefs, labels, and refs.
2. `resolveExperienceSectionId` validates the server-rendered initial state and
   falls back to the first known section when a caller supplies an invalid ID.
3. `data-active` is the single client-side visual state consumed by CSS. The
   enhancement updates it for the clicked section or the last section that has
   crossed the sticky-stack activation line, and never maintains a second active
   CSS class.
4. `aria-current="location"` mirrors that same state for assistive technology;
   exactly one active link is enforced by the browser contract test.

This keeps the static render, progressive enhancement, styling, and automated
assertions on one state contract. If JavaScript is unavailable, the validated
server-rendered first node remains a complete navigation fallback.

## Interaction decisions

### Normal anchors remain the source of truth

Branchline links point to real section IDs and expose `aria-current="location"`
for the initial active node. On desktop, a passive, frame-coalesced scrollspy
selects the last section to cross the sticky-stack activation line; this keeps
the route monotonic even when adjacent sections have very different heights.
Clicking a link holds its state until the destination is reached or the reader
interrupts scrolling. Compact layouts omit Branchline in favour of the global
header and normal document order. The page never hijacks wheel input, forces
scroll snapping, or hides the route behind hover.

### CSS-first progressive reveal

The static final state is present by default. Browsers supporting view timelines
may animate transform and opacity as sections enter the viewport. Browsers
without support see the same content and graph without a polyfill or runtime
animation dependency. Reduced-motion users receive the static state and retain
all anchors and content.

### Decorative graph, semantic content

The tree layer is explicitly `aria-hidden` and contains no meaningful copy. The
adjacent section headings and paragraphs carry all information. Removing the
graph therefore preserves the reading order, focus targets, and visual state
meaning.

## Rejected alternatives

- A canvas or WebGL graph was rejected because it adds a rendering dependency,
  complicates accessibility, and is unnecessary for a small branch grammar.
- A full animation library was rejected because CSS timelines and short
  transitions cover the intended motion vocabulary with less shipped code.
- An unbounded scroll event loop and continuous `requestAnimationFrame` were
  rejected to protect low-power devices. The active-state enhancement instead
  uses passive scroll events and schedules no more than one calculation per
  frame; it does not animate or poll.
- A custom cursor, autoplay video, audio, and large animated backgrounds were
  rejected because they add visual noise and weight without improving the
  information architecture.
- A live GitHub branch/commit feed was rejected because Phase 2 is a static
  authored metaphor and must not invent repository telemetry.
- Award-site layouts, assets, and copy are not copied. The focused references
  only inform principles such as menu disclosure, spatial hierarchy, and
  progressive navigation.

## Reference translation

The interaction review looked at [Moha. Auf — Experience Expert](https://www.awwwards.com/sites/moha-auf-experience-expert)
for menu/loading choreography, scroll animation, and portfolio navigation;
[Awwwards dynamic-grid references](https://www.awwwards.com/websites/dynamic-grid-layout-examples/)
for spatial hierarchy; and [Awwwards navigation and interaction references](https://www.awwwards.com/inspiration_search/sites_of_the_day/?page=320)
for disclosure and transition patterns.

The implementation constraints follow [MDN's scroll-driven animation guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines),
[MDN's reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion),
[MDN's content-visibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility),
and [web.dev's animation-performance guidance](https://web.dev/articles/animations-and-performance).

## Review record

- Layout review widths: 320px, 768px, 1024px, and 1440px.
- Automated coverage: unit model tests, ordered desktop-scroll regression at
  1024px and 1440px, static build, browser anchor and disclosure tests, 320px
  overflow check, Axe coverage, and reduced-motion verification.
- Performance boundary: no new dependency, no remote asset, no client
  directive, no canvas/WebGL, and no continuous animation-frame or polling
  loop.
