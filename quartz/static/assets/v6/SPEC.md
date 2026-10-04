# V6 Asset System — Specification

Engineering and visual-asset specification for `quartz/static/assets/v6/`.
Served at `/static/assets/v6/...` by Quartz's Static emitter.

This is a working spec, not a brand manifesto. It exists so that a future
contributor can drop an asset in without guessing, and can tell whether an
asset is allowed to exist at all.

---

## 1. Directories and what belongs in them

| Directory       | Purpose                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `brand/`        | Logo, wordmark, favicon sources, long-lived identity assets                        |
| `hero/`         | The homepage Hero visual. Exactly **one** primary hero visual                      |
| `editorial/`    | Editorial covers for research articles, series, flagship pieces                    |
| `organization/` | Board / charter / organisation-building / official documents / real event material |
| `social/`       | OpenGraph / X / social sharing artwork and templates                               |

Do not create additional directories.

---

## 2. The one ratio that matters

`1200 × 630` = `1600 × 840` = `2400 × 1260` = exactly **40 / 21 ≈ 1.9048**.

| Purpose         | Size                        | Ratio |
| --------------- | --------------------------- | ----- |
| Master          | 2400 × 1260                 | 40/21 |
| Web             | 1600 × 840                  | 40/21 |
| Social (OG / X) | 1200 × 630                  | 40/21 |
| Mobile          | **same artwork, safe crop** | 40/21 |

**One artwork serves article page, homepage Lead and social sharing.** Do not
produce three near-identical files per article. If a specific piece genuinely
needs a different crop, add a variant _then_, not now.

The CSS implementation uses `aspect-ratio: 40 / 21` in both consumers
(`quartz/styles/v6/_article.scss`, `_homepage.scss`). Keep them in step with
`COVER_ASPECT_RATIO` in `quartz/util/cover.ts`.

### Safe area

Keep all meaningful content inside the **central 80%** of the canvas. The
outer 10% on each edge may be cropped on narrow viewports and in some social
card renderers.

---

## 3. Formats

| Content                       | Preferred | Acceptable | Avoid               |
| ----------------------------- | --------- | ---------- | ------------------- |
| Line work, geometry, diagrams | **SVG**   | —          | rasterised line art |
| Photography, textures         | **AVIF**  | WebP       | JPEG, PNG           |
| Covers                        | **WebP**  | AVIF       | JPEG                |
| Existing legacy icons         | PNG       | —          | —                   |

SVG must be: no external references, no embedded raster, no `<script>`, and
either monochrome (so it can be used with `currentColor`) or explicitly
purpose-built for one context.

---

## 4. File size budget

| Asset                              | Budget   |
| ---------------------------------- | -------- |
| Hero SVG                           | ≤ 20 KB  |
| Hero raster (if ever used)         | ≤ 120 KB |
| Editorial cover (web, 1600×840)    | ≤ 180 KB |
| Editorial cover (social, 1200×630) | ≤ 120 KB |
| Organization photo                 | ≤ 250 KB |
| Favicon / icon                     | ≤ 40 KB  |

If a cover exceeds budget, re-encode it — do not raise the budget.

---

## 5. Naming

```
<domain>-<subject>-<variant>.<ext>

editorial/   political-transition-overview-1600.webp
             political-transition-overview-1200.webp
hero/        hero-architecture.svg
organization/ board-formation-charter-cover.webp
social/      og-fallback-1200x630.png
brand/       wordmark-primary.svg
```

- lowercase, hyphen-separated, ASCII only
- no spaces, no dates in the name, no `final`/`v2`/`new`
- do **not** use `cover1`, `image`, `banner`, `hero2`

---

## 6. Alt text

`alt` is required wherever an asset is content rather than decoration.

- Article / Lead covers: article frontmatter `coverAlt`, falling back to the
  article title. Resolved centrally in `quartz/util/cover.ts`.
- Decorative-only marks (the Hero line drawing): the element carries a role
  and a short localised description. Never let a screen reader announce a
  filename.
- Never write `alt=""` on a cover that carries meaning.

---

## 7. Forbidden content

This is the load-bearing rule of the system.

**Never add:**

- portraits of political figures, Chinese or otherwise
- Tiananmen, national flags, military or police imagery
- crowds, protests, fists, flames, torn flags
- AI-generated political scenes or "concept" renders of Chinese politics
- stock photography of any kind
- cinematic / dramatic lighting treatments
- gradients, heavy shadows, glossy 3D, glassmorphism
- sparks, particles, lens flare, neon
- anything that reads as campaign, propaganda, or YouTube thumbnail

**The target is "research institute publication".** If an asset cannot be
described as calm, restrained, ordered, credible and long-termist, it does not
belong here.

The palette is fixed and already established — warm white `#faf8f5`, charcoal,
and a restrained wine accent. **Do not introduce a new palette.**

---

## 8. Progressive enhancement (non-negotiable)

The site must be complete and professional with **zero** assets beyond what
already exists.

- No cover → no `<figure>`, no `<img>`, no placeholder, no reserved height.
- No Hero artwork → the existing line drawing remains.
- No organization photography → the typographic section remains.

Assets are an enhancement layer. Never commit a placeholder that could be
mistaken for finished brand artwork, and never put test art into published
content.
