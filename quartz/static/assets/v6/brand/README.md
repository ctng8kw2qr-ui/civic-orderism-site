# V6 assets — brand

Logo, wordmark, favicon sources and other long-lived identity assets.

## Belongs here

Primary wordmark, mark / monogram, favicon sources, app-icon masters.

The Civic Orderism mark is **`icon-mark.svg`** — three flat `#435B63` blocks.
`threshold-mark.svg` (+ `-reverse`) is **historical**: it is no longer the mark
and survives only because the OG fallback still draws its geometry. Mark rules
are normative in `../SPEC.md` §1b.

## Not here

Editorial covers, article imagery, organisation photos, social cards.

## Ratio / size

|                       | Size                            |
| --------------------- | ------------------------------- |
| Mark (square)         | 512 × 512                       |
| Wordmark (horizontal) | 1600 × 400                      |
| Favicon source        | 512 × 512 (downscaled at build) |

No fixed ratio — but the square mark and 4:1 wordmark are the expected shapes.
The Icon Mark's own artboard is 940 × 940.

## Formats

SVG preferred (scales, themes via `currentColor`). PNG only for favicon/app
icons. Avoid JPEG.

## Alt text

Brand marks are usually decorative in chrome; if a logo is content, name the
organisation, never the filename.

## Light / dark

The mark must be legible on `#faf8f5` and `#141518`. Prefer `currentColor`
over a baked-in colour.

The Icon Mark is the deliberate exception: its colour is fixed at `#435B63`,
not `currentColor`, because it is exported to raster icons where a themed colour
cannot resolve. Do not add a second colour version.

## Naming

`<domain>-<subject>-<variant>.<ext>` — lowercase, hyphenated, ASCII.
No spaces, no dates, no `final` / `v2` / `new`.

## Alt text

Required wherever the asset carries meaning. Never `alt=""` on meaningful
content; never let a screen reader announce a filename.

## Light / dark

Must work on both. Palette is fixed (warm white `#faf8f5`, charcoal). The Icon
Mark is flat `#435B63`; the historical Threshold Mark carried restrained wine
`#7a2430`. Use `currentColor` for SVG so it themes automatically, except where an
asset is exported to raster — there the colour is fixed.

## Photos / illustration / AI

| Photos | Illustration     | AI-generated |
| ------ | ---------------- | ------------ |
| ✗      | ✓ (as SVG marks) | ✗            |

AI-assisted or generated imagery is governed by the AI artwork policy in `../SPEC.md` §11, which permits abstract editorial artwork under constraint and forbids anything that could be read as documentary evidence. It is not prohibited outright. Generating artwork for this directory is still discouraged: marks here are hand-authored SVG geometry and the mark rules in SPEC §1b are normative.

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
