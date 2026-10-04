# V6 assets — hero

The homepage Hero visual slot. Exactly **one** primary hero visual.

## Belongs here

`hero-threshold.svg` — the Phase 4B Hero artwork. A structural boundary with one
passage opened through it, and a datum running unbroken across the full width:
the structure continues, the path changes.

Geometry, rationale and the rendering-model note live in the file's own header
comment. Related: `../brand/threshold-mark.svg` is the same threshold idea as a
compact brand symbol; the Hero is that idea spatialised. They are deliberately
different forms and the mark must not simply be enlarged into the Hero.

## Not here

Article or Lead covers (`../editorial/`), social cards (`../social/`),
organisation documents (`../organization/`), brand marks (`../brand/`).

## Ratio / size

|         | Value                                   |
| ------- | --------------------------------------- |
| viewBox | 1200 × 600 (2:1)                        |
| Display | fills the Hero aside, max 460px desktop |
| Mobile  | full width of the aside                 |

## Formats

**SVG**, single file. Light and dark are handled inside the SVG with
`prefers-color-scheme`, which V6 keeps in sync with `saved-theme`.

## Rendering model

Direct-rendered `<img>`. The former CSS-mask model was **retired in Phase 4B**:
a mask uses the SVG as an alpha stencil, so every stroke renders in one flat
colour and multi-weight artwork collapses to a silhouette.

A raster hero is therefore **not** a drop-in replacement — it is still an
`<img>`, but it will not follow the theme by itself, so it needs explicit
`width`/`height` and its own dark variant.

## Swapping the visual

Replace `hero-threshold.svg`. No JSX, layout, copy, CTA or
information-architecture change is required.

## Alt text

Decorative concept artwork — the Hero copy carries the meaning. The element is
`aria-hidden` with an empty `alt`, so a screen reader never announces it.

## Light / dark

Must read on both backgrounds. Using line work at the V6 palette values does
this automatically; a raster must be checked by hand.
