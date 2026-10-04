# V6 assets — social

OpenGraph / X / social-sharing artwork and templates.

## Belongs here

The branded fallback card, and any future per-platform social artwork or
templates. `social/` may hold an independent composition if a platform demands
one — the code must not assume the cover and the social card are permanently
identical.

## Not here

Article covers (those live in `../editorial/` and already serve OG directly).

## Ratio / size

|             | Size       | Ratio  |
| ----------- | ---------- | ------ |
| OG / X card | 1200 × 630 | 1.9048 |

Budget ≤ 120 KB.

## Formats

PNG for the branded fallback (widest scraper support); WebP otherwise.

## Current state

The fallback is served from `quartz/static/og-image.png` (1200 × 630) because
`quartz/components/Head.tsx` and the RootStatic emitter reference that path.
This directory is where future social artwork should live.

## Alt text

Scrapers use `og:image:alt`, which is generated at render time: the cover's
`coverAlt` when a cover exists, otherwise the page description.

## Absolute URLs

`og:image` is always emitted as an absolute URL, built from `cfg.baseUrl`
(`quartz/util/cover.ts` → `absoluteCoverUrl`). Never hardcode the domain, and
never emit a relative `og:image`.

## Programmatic generation

`CustomOgImages` / satori is **not** enabled — see `TECHNICAL_DEBT.md`. A
reliable offline CJK font pipeline is a precondition.

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

| Photos       | Illustration | AI-generated |
| ------------ | ------------ | ------------ |
| ✓ restrained | ✓            | ✗            |

**AI-generated imagery is not permitted.**

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
