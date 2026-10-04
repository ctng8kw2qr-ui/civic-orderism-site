# V6 assets — editorial

Editorial covers for research articles, series and flagship pieces.
Referenced from article frontmatter via `cover:` / `coverAlt:`, and consumed
in three places from that single source: article page, homepage Lead, og:image.

Editorial covers for the homepage lead article and for article pages.

## Belongs here

- Cover images referenced from article frontmatter:
  `cover: /static/assets/v6/editorial/<name>.webp`
- Optional `coverAlt:` for the accessible description.

## Design principles (for when artwork is produced)

- Serious policy-research publication, not social media.
- Low saturation, restrained, consistent Civic Orderism brand language.
- The 5:2 X/Twitter card format is a different medium and should not be
  reused as a website editorial cover.

## Fallback behaviour

Articles without a `cover` render the current typographic header. No
placeholder, no grey box, no broken image. Covers are optional and most
articles will not have one.

## Rules

- Site-relative paths only (no external image hosts).
- Always pair with intrinsic `width`/`height` to avoid layout shift.
  Full specification: `../SPEC.md`.
