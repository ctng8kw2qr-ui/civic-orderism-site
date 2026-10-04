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

## 1b. Brand architecture

Full rationale and concept history: `reports/phase-4a-brand-foundation/README.md`.

### The mark

**Threshold Mark** — `brand/threshold-mark.svg` (+ `-reverse`). Selected from
three concepts; it was the only one identifiable at **8px**, because its
silhouette is a single shape rather than parallel bars.

Geometry is normative, not decorative:

|              |                                                            |
| ------------ | ---------------------------------------------------------- |
| viewBox      | `0 0 100 100`                                              |
| stroke-width | `4` (min stroke at 16px = 0.64px)                          |
| element 1    | `circle cx 50 cy 50 r 48`                                  |
| element 2    | `path M36 70 L36 48 A14 14 0 0 1 64 48 L64 70`             |
| element 3    | `line 28 70 - 72 70`                                       |
| clear space  | 12% of mark height on all sides                            |
| minimum      | 16px (favicon floor); 24px alone in UI; 48px with the seal |

**Exactly three elements.** Do not add columns, text, values, seal, `C/O`
letterforms, extra rules, gradient or fill. The mark must stay abstract — its
meaning is never drawn into it.

### Variants — two only

| Variant | Colour                                             | Use         |
| ------- | -------------------------------------------------- | ----------- |
| Primary | wine `#7a2430` on warm white `#faf8f5`             | default     |
| Reverse | warm white `#faf8f5` on charcoal `#1b1c1f` or wine | dark fields |

Do not create further colour versions.

### Lockups

| Form               | Composition                              | Use                                  |
| ------------------ | ---------------------------------------- | ------------------------------------ |
| **Icon only**      | the mark                                 | favicon, app icon, avatars, small UI |
| **Compact lockup** | mark + `公民秩序主义`                    | site header / footer                 |
| **Full lockup**    | mark + `公民秩序主义` + `CIVIC ORDERISM` | PDF, document headers, OG, print     |

`CIVIC ORDERISM` is the **formal institutional English identifier** and is
always uppercase. Title-case `Civic Orderism` is not a lockup form; it may
still occur in ordinary prose, which is not to be rewritten.

The primary logo contains **only** mark and wordmark. It never contains the
values strip, the seal, a slogan, the domain, or a description of the
political route.

### Values strip — secondary device

`平等 · 秩序 · 尊严 · 保障 · 自由`. Wording is fixed.

Permitted: PDF footer, publication colophon, organisation documents, formal
institutional and board material. Forbidden: primary logo, favicon, icon,
navigation, small lockups.

### Seal — secondary editorial device

The legacy seal is a 2×2 four-character seal-script device. Permitted at
**≥48px** for publication, PDF, formal document and editorial detail.

Not for favicon, navigation, primary logo or small UI. **Do not redraw or
simplify it until the original vector or confirmed glyphs are available** —
a one-glyph simplification could misrepresent a four-value device.

### Application icons

Rendered from `brand/threshold-mark.svg`. The favicon and app-icon sizes are
**flattened onto warm white** deliberately: at 16px the 4-unit stroke
rasterises to partial alpha (measured max alpha 178) and reads faint. Larger
icons (`icon.png`, `icon-192`, `icon-512`) keep alpha.

`quartz/plugins/emitters/favicon.ts` is unchanged — it still reads
`static/icon.png` and derives `favicon.ico`.

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
| Source           | `social/og-fallback.svg`     | edit the SVG, re-render to PNG             |

### Safe area and composition rules

| Rule                      | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| minimum margin, all sides | **≥ 100px** on the 1200 × 630 master                               |
| brand-critical block      | mark + `公民秩序主义` + `CIVIC ORDERISM`, **horizontally centred** |
| supporting content        | statement, rules, colophon — may be trimmed in narrow previews     |
| never trimmed             | the brand name, under any crop                                     |

Verified sizes: `1200×630`, `600×315`, `506×265` (X large card), `400×210`,
`300×158`. All five share a ~1.9:1 aspect, so measured side trim is ~0px for
each; the brand block is additionally centred so it survives any
centre-weighted crop of a wider aspect.

The fallback is a **publication card**, not an advertisement: no article
title, no photograph, no personnel, no Hero artwork, no call to action.

Measured on the current asset: margins `L103 R103 T140 B159`; brand-block
centre offset `+0.5px`.

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
hero/          hero-threshold.svg
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

AI-generated imagery is governed by §11, not prohibited outright.

---

## 10. Photography policy

Photography **is** permitted, under constraint.

| Allowed         | Forbidden                                           |
| --------------- | --------------------------------------------------- |
| Documentary     | Generic stock                                       |
| Architectural   | Staged handshake                                    |
| Historical      | Fake boardroom                                      |
| Institutional   | Fake political scene                                |
| Object / detail | Suit-portrait stock                                 |
| Real locations  | Anything implying it is a real event when it is not |

### Provenance is mandatory

Any photograph, and **especially** any news photograph, must carry recorded
source, licence and credit **before** it enters this tree. Record it beside the
asset:

```
assets/v6/organization/PROVENANCE.md
```

| Field       | Required                                          |
| ----------- | ------------------------------------------------- |
| File        | filename                                          |
| Source      | publication / archive / photographer              |
| URL         | origin link                                       |
| Licence     | e.g. CC BY 4.0, press licence, written permission |
| Credit line | exact text to display                             |
| Retrieved   | date                                              |
| Notes       | any restriction on reuse or crop                  |

**Unattributed news imagery must not enter the brand library.** If provenance
cannot be established, do not use the image — use Tier 3 (no cover) instead.

---

## 11. AI artwork policy

**Permitted** — must be unmistakably editorial artwork:

- abstract editorial artwork
- architectural abstraction
- structural composition
- texture / material study

**Forbidden** — anything that could be read as documentary evidence:

- political leaders, Chinese or otherwise
- officials, official meetings, government bodies
- military, police, security forces
- protests, crowds, conflict, unrest
- any photorealistic depiction of a political event

**The test:** if a viewer could mistake the image for a news photograph, it
fails and must not be used. AI output is artwork, never evidence.

---

## 12. Forbidden content

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
