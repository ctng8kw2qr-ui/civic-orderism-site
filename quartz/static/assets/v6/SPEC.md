# V6 Asset System — Canonical Specification

Canonical spec for `quartz/static/assets/v6/`. Served at
`/static/assets/v6/...` by Quartz's Static emitter.

Written to be executable, not aspirational. If an asset cannot satisfy this
document, it does not belong in the repository.

---

## 0. The one rule that matters

The site must be **complete and professional with zero assets** beyond what
already exists. Every asset is progressive enhancement.

- No cover → no `<figure>`, no `<img>`, no placeholder, no reserved height.
- No Hero artwork → the existing line drawing stays.
- No organisation photography → the typographic section stays.

Never commit a placeholder that could be mistaken for finished brand artwork.
Never put test art into published content.

---

## 1. Editorial Cover

**Canonical ratio: `1.9 : 1`**

| Role              | Size            | Ratio  |
| ----------------- | --------------- | ------ |
| Master            | **2400 × 1263** | 1.9    |
| Web               | **1600 × 842**  | 1.9    |
| Social-compatible | **1200 × 630**  | 1.9048 |

Implemented as the CSS token `--v6-cover: 1.9`
(`quartz/styles/v6/_tokens.scss`), consumed by **both** the article cover and
the homepage Lead cover.

**Mobile uses the same artwork.** Do not produce a second composition for
phone. Design to a safe area instead.

**Safe area:** keep all meaningful content within the **central 80%** of the
canvas. The outer 10% per edge may be cropped on narrow viewports and by some
social card renderers.

**Social note:** the OG/X card is 1200 × 630 = 1.9048, which differs from the
canonical 1.9 by **0.25%**. The two ratios are defined as **separate tokens**
(`--v6-cover`, `--v6-cover-social`) rather than one forced approximation, so
neither consumer silently mis-crops. One cover artwork still serves the
article page, the homepage Lead and sharing; the 0.25% difference is below
perceptual threshold at these sizes.

`social/` may hold an independent composition in future if a platform ever
demands one. The code must not assume the cover and the social card are
permanently identical.

---

## 2. Hero

The Hero is an **institutional visual slot**, not a photo box.

**Preferred:** SVG (monochrome, themeable via `currentColor`)
**Allowed:** WebP, AVIF, PNG

Suitable directions: architectural line work, abstract structure diagrams,
institutional / archival / cartographic visuals, restrained photography,
brand marks.

Do not lock the slot to one medium, and do not treat it as a large-photo
placeholder.

**Rendering caveat:** the current implementation is a **CSS mask**
(`--v6-hero-mask`) coloured by `currentColor`, which suits SVG. A raster Hero
has a _different_ rendering model (it is not a mask) and would need an
explicit decision — `width`/`height`, `object-fit`, and dark-mode handling.
A raster asset is **not** a drop-in equivalent to the mask variable.

---

## 3. Social / OG

| Role             | Size                         | Notes                                      |
| ---------------- | ---------------------------- | ------------------------------------------ |
| OG / X card      | 1200 × 630                   | 1.9048                                     |
| Branded fallback | `quartz/static/og-image.png` | single image for all pages without a cover |

Precedence is implemented in `quartz/components/Head.tsx`:
article `cover` (absolute URL) → branded fallback.

Never emit a relative `og:image`; social scrapers require an absolute URL.
The origin comes from `cfg.baseUrl`, never hardcoded per component.

**Programmatic generation is not enabled.** See `TECHNICAL_DEBT.md` — a
reliable offline CJK font pipeline is a precondition.

---

## 4. Formats

| Content                       | Preferred | Acceptable | Avoid               |
| ----------------------------- | --------- | ---------- | ------------------- |
| Line work, geometry, diagrams | **SVG**   | —          | rasterised line art |
| Photography, texture          | **AVIF**  | WebP       | JPEG, PNG           |
| Covers                        | **WebP**  | AVIF       | JPEG                |
| Legacy icons                  | PNG       | —          | —                   |

SVG must contain: no external references, no embedded raster, no `<script>`.
Either monochrome (usable with `currentColor`) or built for exactly one context.

---

## 5. Size budget

| Asset                  | Budget   |
| ---------------------- | -------- |
| Hero SVG               | ≤ 20 KB  |
| Hero raster            | ≤ 120 KB |
| Cover, web 1600×842    | ≤ 180 KB |
| Cover, social 1200×630 | ≤ 120 KB |
| Organisation photo     | ≤ 250 KB |
| Favicon / icon         | ≤ 40 KB  |

Exceeding budget means re-encode, not raise the budget.

---

## 6. Naming

```
<domain>-<subject>-<variant>.<ext>
```

- lowercase, hyphen-separated, ASCII only
- no spaces, no dates, no `final` / `v2` / `new`
- never `cover1`, `image`, `banner`, `hero2`

Examples:

```
hero/          hero-architecture.svg
editorial/     political-transition-overview-1600.webp
organization/  board-formation-charter-cover.webp
social/        og-fallback-1200x630.png
brand/         wordmark-primary.svg
```

---

## 7. Alt text

- **Article / Lead cover:** frontmatter `coverAlt`, falling back to the article
  title. Resolved in one place — `quartz/util/cover.ts`.
- **Decorative marks** (Hero line drawing): carry a role and a short localised
  description. A screen reader must never announce a filename.
- Never `alt=""` on a cover that carries meaning.

---

## 8. Theme (light / dark)

Assets must survive both themes. The palette is fixed: warm white `#faf8f5`,
charcoal, restrained wine accent. **Do not introduce a new palette.**

- SVG line work should use `currentColor` so it themes automatically.
- Raster covers must remain legible on both backgrounds — avoid pure-white or
  pure-black edges.
- Do not bake a background colour into an asset that must sit on the page.

---

## 9. Photos and illustration

| Directory       | Photos                      | Illustration         | AI-generated |
| --------------- | --------------------------- | -------------------- | ------------ |
| `brand/`        | ✗                           | ✓ (as SVG marks)     | ✗            |
| `hero/`         | ✓ restrained, architectural | ✓                    | ✗            |
| `editorial/`    | ✓ restrained                | ✓ abstract geometry  | ✗            |
| `organization/` | ✓ **real only**             | ✓ documents/diagrams | ✗            |
| `social/`       | ✓ restrained                | ✓                    | ✗            |

**AI-generated imagery is not permitted anywhere in this tree.** Not
political scenes, not "concept" renders, not portraits, not stock substitutes.

---

## 10. Forbidden content

Never add:

- portraits of political figures
- Tiananmen, national flags, military or police imagery
- crowds, protests, fists, flames, torn flags
- AI-generated political scenes
- stock photography
- cinematic / dramatic lighting
- gradients, heavy shadows, glossy 3D, glassmorphism
- sparks, particles, lens flare, neon
- anything reading as campaign, propaganda, or video-thumbnail

The target is **"research institute publication"**. If an asset cannot be
described as calm, restrained, ordered, credible and long-termist, it does not
belong here.
