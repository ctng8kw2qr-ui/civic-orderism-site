# V6 assets — brand

Logo, wordmark, favicon sources and other long-lived identity assets.

Establishes the V6 asset convention. Phase 2 creates slots and rendering
rules; it does not create branded artwork.

## Belongs here

- Logo lockups and marks.
- Favicon / app-icon sources.
- Social (OG) image sources.
- Anything reused site-wide as an identity element.

## Rules

- Served at `/static/assets/v6/brand/...` by Quartz's Static emitter.
- No image CDN, no stock imagery, no AI-generated political imagery.
- Do not commit placeholder art that could be mistaken for real brand assets.
- Prefer SVG for marks; WebP/AVIF for photography.
  Full specification: `../SPEC.md`.
