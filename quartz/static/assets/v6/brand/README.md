# V6 assets — brand

Logo, wordmark, favicon sources and other long-lived identity assets.

## Belongs here

Primary wordmark, mark / monogram, favicon sources, app-icon masters.

## Not here

Editorial covers, article imagery, organisation photos, social cards.

## Ratio / size

|                       | Size                            |
| --------------------- | ------------------------------- |
| Mark (square)         | 512 × 512                       |
| Wordmark (horizontal) | 1600 × 400                      |
| Favicon source        | 512 × 512 (downscaled at build) |

No fixed ratio — but the square mark and 4:1 wordmark are the expected shapes.

## Formats

SVG preferred (scales, themes via `currentColor`). PNG only for favicon/app
icons. Avoid JPEG.

## Alt text

Brand marks are usually decorative in chrome; if a logo is content, name the
organisation, never the filename.

## Light / dark

The mark must be legible on `#faf8f5` and `#141518`. Prefer `currentColor`
over a baked-in colour.

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

| Photos | Illustration     | AI-generated |
| ------ | ---------------- | ------------ |
| ✗      | ✓ (as SVG marks) | ✗            |

**AI-generated imagery is not permitted.**

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
