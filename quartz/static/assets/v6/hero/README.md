# V6 assets — hero

The homepage Hero visual slot. Exactly **one** primary hero visual.

## Belongs here

`hero-architecture.svg` — the current restrained colonnade line drawing,
rendered as a CSS mask in `currentColor`.

Future: architectural line work, abstract structure diagrams, institutional /
archival / cartographic visuals, restrained photography, brand graphics.

## Not here

Article or Lead covers (`../editorial/`), social cards (`../social/`),
organisation documents (`../organization/`).

## Ratio / size

|           | Size                            |
| --------- | ------------------------------- |
| Ratio     | 2:1 (current viewBox 800 × 400) |
| Master    | 2400 × 1200                     |
| Displayed | ≤ 380px desktop, ≤ 220px mobile |

## Formats

**SVG preferred** — monochrome and themeable. WebP / AVIF / PNG allowed.

**Rendering caveat:** the slot currently uses a **CSS mask**
(`--v6-hero-mask`) with `currentColor`. A raster asset is _not_ a drop-in
equivalent — it needs a different rendering model (`width`/`height`,
`object-fit`, its own dark-mode treatment). Decide that explicitly rather than
assuming the mask variable covers it.

## Swapping the visual

Replace the file, or change the single `--v6-hero-mask` token. No JSX, layout,
copy, CTA or information-architecture change is required for an SVG swap.

## Alt text

Decorative. The element carries a role and a short localised description —
never a filename.

## Light / dark

Must read on both backgrounds. The mask + `currentColor` approach does this
automatically; a raster must be checked by hand.

## Naming

`<domain>-<subject>-<variant>.<ext>` — lowercase, hyphenated, ASCII.
No spaces, no dates, no `final` / `v2` / `new`.

## Alt text

Required wherever the asset carries meaning. Never `alt=""` on meaningful
content; never let a screen reader announce a filename.

## Light / dark

Must work on both. Palette is fixed (warm white `#faf8f5`, charcoal, restrained
wine). Use `currentColor` for SVG so it themes automatically.

## Photos / illustration / AI

| Photos                      | Illustration | AI-generated |
| --------------------------- | ------------ | ------------ |
| ✓ restrained, architectural | ✓            | ✗            |

**AI-generated imagery is not permitted.**

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
