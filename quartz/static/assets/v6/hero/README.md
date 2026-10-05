# V6 assets — hero

The homepage Hero visual slot. Exactly **one** primary hero visual.

## Belongs here

`hero-threshold.svg` — the Hero artwork, **CONTINUITY**. Two structures with a
passage between them, and one wine datum running the entire width that rises
once across that passage and is never broken: the structure changes, the line
does not. The left structure is dense and low — the order that stands; the right
has fewer, wider-spaced members — the order being prepared.

Geometry, rationale, the ratio argument and the rendering-model note live in the
file's own header comment.

The filename still refers to the threshold idea the Hero shares with the
historical Threshold Mark (`../brand/threshold-mark.svg`), which is no longer the
Civic Orderism mark — see `../SPEC.md` §1b. The Hero is that idea spatialised.
They are deliberately **different forms** — the mark must not be enlarged into
the Hero, and the Hero must not shrink into a mark. **This artwork is not a logo**
and does not replace the wordmark, the Icon Mark (`../brand/icon-mark.svg`), the
favicon or the app icons.

## Not here

Article or Lead covers (`../editorial/`), social cards (`../social/`),
organisation documents (`../organization/`), brand marks (`../brand/`).

## Ratio / size

|         | Value                                   |
| ------- | --------------------------------------- |
| viewBox | 1200 × 900 (4:3)                        |
| Display | fills the Hero aside, max 460px desktop |
| Mobile  | full width of the aside                 |

**Why 4:3 and not 2:1.** At the Hero's 437px display width a 2:1 canvas scales by
0.364, so a 3-unit line renders at **1.09px**. At that weight the drawing cannot
carry itself, which forces texture — hatch and tick marks — to supply the mass,
and that is exactly what made the earlier artwork read as a technical drawing
rather than architectural abstraction. At 4:3 the scale is 0.546 and the same
line renders at **1.64px**, so the line work holds on its own. Mobile scales to
319 × 239 and still reads.

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
