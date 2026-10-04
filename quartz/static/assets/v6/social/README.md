# V6 assets — social

OpenGraph / X / social-sharing artwork and templates.

Full specification: `../SPEC.md`.

## Belongs here

- `og-fallback-1200x630.png` — the single branded fallback used by every page
  that has no `cover`. Currently served from `quartz/static/og-image.png`
  (kept there because `Head.tsx` and the RootStatic emitter reference that
  path); this directory is where future social artwork should live.
- Per-article social cards, once real covers exist. A cover at the unified
  40/21 ratio already serves OG directly, so most articles need nothing here.
- Channel-specific templates if a platform ever demands a different crop.

## Not here

- Article covers — those live in `../editorial/`.
- Programmatically generated cards. `CustomOgImages` / satori is **not**
  enabled; see `TECHNICAL_DEBT.md` for why (no reliable CJK font pipeline).

## Rules

- Absolute URLs are produced at render time from `cfg.baseUrl`
  (`quartz/util/cover.ts` → `absoluteCoverUrl`). Never hardcode the domain
  into an asset or a component.
- Never emit a relative `og:image`; social scrapers require an absolute URL.
- 1200 × 630, 40/21, ≤ 120 KB.
