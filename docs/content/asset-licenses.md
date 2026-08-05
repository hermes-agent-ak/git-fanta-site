# Git Fanta website asset ledger

This ledger records the provenance and licence boundary for every asset copied
or prepared for the website. The website source code is licensed under the MIT
License in the repository `LICENSE` file. That code licence does not change the
licence or attribution requirements of copied application assets or supplied
media.

## Ready assets

### `public/brand/git-fanta-logo.svg`

- Source repository: `hermes-agent-ak/git-fanta-site`
- Source path: `media/git-fanta-logo.png`
- Destination: `public/brand/git-fanta-logo.svg`
- Source verification: the SVG was supplied by the project owner as the
  vectorized form of the supplied PNG and inspected as a standalone SVG.
- Attribution: supplied directly by the project owner as the Git Fanta logo;
  vectorized from the supplied source.
- Publication permission: explicitly granted by the project owner's request
  to use this logo for the website.
- Vector source URL: <https://cf-vectorizer-live.s3.amazonaws.com/cf-vectorizer-live/28973575/3HNjqm4RvT0T9xcwVClHw5AvT2T.svg>
- Original licence: not asserted from the file alone; the ledger preserves the
  project-owner permission without inventing a third-party licence.
- Transformation: vectorized SVG derived from `media/git-fanta-logo.png`; no
  scripts or external image references were found during inspection.
- Accessibility: the header renders the image with `alt=""` because adjacent
  visible text names Git Fanta.

### `public/product/git-fanta-showcase.webp`

- Source repository: `hermes-agent-ak/git-fanta-site`
- Inputs: `media/screenshot.webp` and `media/git-fanta-logo.png`
- Destination: `public/product/git-fanta-showcase.webp`
- Attribution: supplied by the project owner and composed at the owner's
  request with AI-assisted image editing.
- Permission: the project owner explicitly requested that the two supplied
  files be assembled into missing website media on 2026-08-03.
- Transformation: the supplied screenshot was framed as the primary visual;
  the supplied logo was placed in reserved space; the machine-specific path in
  the embedded screenshot title bar was redacted before publication; the
  original input files were not modified. The final output was converted to
  WebP at quality 0.86 for static delivery.
- Important boundary: this is derived project showcase media. It is not an
  independent assertion that `media/screenshot.webp` is an authentic Git Fanta
  application capture.
- Current presentation: the website exposes only the redacted interface region;
  the composite logo and orange decorative frame remain outside the visible
  viewport.
- Accessibility: planned consumers must provide descriptive alternative text
  that identifies it as a derived showcase, not as verified product UI.

## Pending candidates

### `media/screenshot.webp`

- Supplied by the project owner.
- No direct destination is published.
- Authenticity, original licence, and product-capture status remain pending.
- It is used only as an input to the explicitly documented derived showcase.

### Application repository SVG reference

- The application repository's `fanta/icons/git-fanta.svg` and dark variant
  were inspected as source evidence but are not copied into the website.
- Their Git Logo / CC BY 3.0 attribution remains relevant to the application
  repository, not to the selected project-owner supplied logo or its
  vectorized derivative.

### `media/git-fanta-logo.png`

- Supplied by the project owner.
- It is the documented source input for the public vectorized SVG and the
  derived showcase; the source PNG itself is not duplicated into the public
  brand directory.
- Original provenance and licence are not asserted beyond the project-owner
  publication permission.

## Boundary rule

Do not describe the pending screenshot as an official product asset, and do not
assign the application repository SVG's attribution or licence to the supplied
logo or its vectorized derivative. Any future asset must be added here before
it is copied into a public destination.
