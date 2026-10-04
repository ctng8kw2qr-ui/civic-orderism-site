# V6 assets — hero

The homepage Hero visual slot. Exactly one primary hero visual.

The homepage Hero visual slot.

## Belongs here

- `hero-architecture.svg` — the current restrained colonnade line drawing.
  Rendered as a CSS mask in `currentColor`, so it themes correctly in light
  and dark without an invert filter.
- Any replacement wide, low-contrast visual with an architectural / civic /
  public-space character.

## Swapping the visual

Replace the referenced file in place (or update the one `mask-image` URL in
`quartz/styles/v6/_homepage.scss`). No markup change is required.

## Rules

- Must stay decorative: it is an auxiliary mark, never the focal point.
- Must work at both 380px (desktop) and 220px (mobile) widths.
- SVG preferred (scales, tiny, themeable). WebP/AVIF only if a raster is
  genuinely required.
- Never add: political symbols, crowds, flags, fists, portraits.
  Full specification: `../SPEC.md`.
