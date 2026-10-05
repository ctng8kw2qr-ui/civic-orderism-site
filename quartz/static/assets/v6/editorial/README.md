# V6 assets — editorial

Editorial covers for research articles, series and flagship pieces.

## Belongs here

Cover artwork referenced from article frontmatter:
`cover: /static/assets/v6/editorial/<name>.webp`, optionally `coverAlt:`.

## Not here

Social-only artwork (`../social/`), hero visuals (`../hero/`),
organisation material (`../organization/`).

## Ratio / size — canonical `1.9 : 1`

|                   | Size                |
| ----------------- | ------------------- |
| Master            | 2400 × 1263         |
| Web               | 1600 × 842          |
| Social-compatible | 1200 × 630 (1.9048) |

Mobile uses the **same artwork** — do not build a second composition.
Keep meaning inside the **central 80%**; the outer 10% per edge can be cropped.

## Formats

WebP preferred, AVIF acceptable. Avoid JPEG. Budget ≤ 180 KB (web).

## Consumers

One cover serves three places from a single metadata source: article page,
homepage Lead, and `og:image`. Do not maintain three near-identical files.

## Alt text

`coverAlt` → falls back to the article title. A cover without a cover is
simply not rendered — covers are optional, and **most articles will not have
one**.

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

| Photos       | Illustration        | AI-generated |
| ------------ | ------------------- | ------------ |
| ✓ restrained | ✓ abstract geometry | ✗            |

Editorial artwork may be AI-assisted or generated. It is governed by the AI artwork policy in `../SPEC.md` §11 — abstract editorial artwork, architectural abstraction, structural composition and material study are permitted; anything that could be read as documentary evidence is forbidden. The test in §11 applies: if a viewer could mistake the image for a news photograph, it fails. Existing editorial covers were made this way and are approved.

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
