# V6 assets — organization

Formal organisational material for homepage section 06 and `/preparation`.

## Belongs here

Board formation documents, charter covers, official filings, annual and
research reports, and **genuine** meeting photography.

## Not here

Stock office/meeting imagery, renders of "a meeting", AI depictions of people
or institutions, editorial covers.

## Ratio / size

|                           | Size                          |
| ------------------------- | ----------------------------- |
| Document cover (portrait) | 1240 × 1754 (A4-ish, 1:1.414) |
| Landscape photo           | 2400 × 1350 (16:9)            |
| Web delivery              | ≤ 1600px on the long edge     |

## Formats

WebP / AVIF for photography, PDF for documents, SVG for diagrams.
Budget ≤ 250 KB per image.

## Alt text

Describe the actual document or event. Never a filename, never a generic
"board meeting photo" if the image shows something specific.

## Photos

**Real material only.** If no genuine photo exists, the section stays
typographic — do not substitute stock or generated imagery.

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

| Photos      | Illustration         | AI-generated |
| ----------- | -------------------- | ------------ |
| ✓ real only | ✓ documents/diagrams | ✗            |

**AI-generated imagery is not permitted.**

Full rules, size budgets and the forbidden-content list: `../SPEC.md`.
