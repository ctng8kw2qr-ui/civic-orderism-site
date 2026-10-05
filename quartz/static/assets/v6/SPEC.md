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

**Icon Mark** — `brand/icon-mark.svg`. The official mark of Civic Orderism:
three flat blocks separated by one continuous light channel.

Geometry is normative, not decorative:

|             |                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| viewBox     | `0 0 940 940`                                                                                        |
| fill        | `#435B63` — low-saturation deep slate, flat, single colour                                           |
| stroke      | none                                                                                                 |
| element 1   | left block `M0 0 L0 776 L280.5 938 L280.5 534 L536.5 398 L536.5 291 Z`                               |
| element 2   | upper block `M327.5 0 L327.5 91 L657.5 303 L657.5 554 L939 409 L939 0 Z`                             |
| element 3   | lower block `M939 473 L545 669 L314 543 L314 930 L939 930 Z`                                         |
| clear space | 8% for the 16/32/48 favicons; 15% for apple-touch-icon; 12% for `icon.png` / `icon-192` / `icon-512` |
| minimum     | 16px favicon floor (silhouette holds, narrowest channel softens); 32px comfortable floor             |

The light channel is the space **between** the polygons. It is not drawn and
must never be filled or stroked.

**Exactly three polygons.** No stroke, outline, gradient, shadow, second colour
or red, no fourth block, no letterforms, no background inside the master. The
mark must stay abstract — its meaning is never drawn into it.

### Variants — colour and ground

One colour only: `#435B63`. There is no reverse and no second colour version.

| Ground               | Use                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| transparent          | `icon.png`, `icon-192`, `icon-512`                                  |
| warm white `#F4F3EF` | `favicon.ico`, `favicon-16x16`, `favicon-32x32`, `apple-touch-icon` |

Do not create further colour versions.

### Lockups

| Form               | Composition                                   | Use                                  |
| ------------------ | --------------------------------------------- | ------------------------------------ |
| **Icon only**      | `brand/icon-mark.svg`                         | favicon, app icon, avatars, small UI |
| **Compact lockup** | icon mark + `公民秩序主义`                    | material showing mark + name         |
| **Full lockup**    | icon mark + `公民秩序主义` + `CIVIC ORDERISM` | PDF, document headers, OG, print     |

Every lockup uses `brand/icon-mark.svg` as its mark. The site header and footer
currently render the name alone — the mark was removed from the header as a
display decision, recorded in `quartz/components/PrimaryNavigation.tsx`.

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

Rendered from `brand/icon-mark.svg`. The Threshold Mark is now a historical asset
and no longer supplies the browser, bookmark or home-screen icons — see the
legacy note below.

**Declared from `brand/`, at two sets of paths.** The `Head` links and the
manifest point at `brand/icon-mark-*`, so every icon URL is a path Safari has
never stored:

| Declared reference (what the HTML uses)       | Size / ground              |
| --------------------------------------------- | -------------------------- |
| `brand/icon-mark.svg`                         | vector master              |
| `brand/icon-mark.ico`                         | ICO 16/32/48, `#F4F3EF`    |
| `brand/icon-mark-16x16.png`, `-32x32.png`     | `#F4F3EF`                  |
| `brand/icon-mark-180x180.png`                 | `#F4F3EF`, 15% clear space |
| `brand/icon-mark-192x192.png`, `-512x512.png` | alpha                      |

The conventional root files (`/favicon.ico`, `/favicon-16x16.png`,
`/favicon-32x32.png`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`)
are **still published with the same mark**, because Safari probes those paths on
its own even when links are declared; answering them with a 404 would cost the
icon. They are byte-identical to the `brand/` exports. **Both sets must be
regenerated together whenever the mark changes.**

A version query on the old filenames was tried first and was not sufficient: the
URLs still resolved to the paths Safari already had stored. Prefer a new path
over a new query string for any future icon change.

The small favicons (`icon-mark.ico`, `icon-mark-16x16`, `icon-mark-32x32`) and
`icon-mark-180x180` are **flattened onto warm white `#F4F3EF`** deliberately: at
16px the channel between the blocks is sub-pixel and would otherwise read as a
faint smear on browser chrome. The 192 and 512 exports keep alpha.

`icon-mark.ico` is a committed three-frame ICO (16/32/48). Note the ordering:
`quartz/plugins/emitters/favicon.ts` derives a 48px PNG from `static/icon.png`,
then `RootStatic()` copies the committed `static/favicon.ico` over it — so the
static ICO is what ships. That redundancy is logged as technical debt (A5) and is
not to be resolved as part of an icon or brand-documentation change.

### Legacy mark — Threshold Mark (historical)

**`brand/threshold-mark.svg`** (+ `-reverse`): a wine `#7a2430` circle, arch and
horizon, selected in Phase 4A and used as the site's mark until the Icon Mark
above replaced it.

|                  |                                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| Status           | **historical — no longer the Civic Orderism mark**                     |
| Do not use for   | new icons, new lockups, new publications, navigation, small UI         |
| Still referenced | the OG fallback raster, whose geometry mirrors it deliberately         |
| Colour variants  | wine primary / warm-white reverse — retained with the file, not active |

The files stay in `brand/` because the OG fallback asset still renders that
geometry; migrating it is a separate change and must not be done implicitly.
Concept history lives in `reports/phase-4a-brand-foundation/README.md`.

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
charcoal, restrained wine accent, and the Icon Mark's slate `#435B63`.
**Do not introduce a new palette.**

- SVG line work should use `currentColor` so it themes automatically.
- Raster covers must remain legible on both backgrounds — avoid pure-white or
  pure-black edges.
- Do not bake a background colour into an asset that must sit on the page.

---

## 9. Photos and illustration

| Directory       | Photos                      | Illustration         | AI-generated     |
| --------------- | --------------------------- | -------------------- | ---------------- |
| `brand/`        | ✗                           | ✓ (as SVG marks)     | ✗                |
| `hero/`         | ✓ restrained, architectural | ✓                    | ✗                |
| `editorial/`    | ✓ restrained                | ✓ abstract geometry  | ✓ under §11      |
| `organization/` | ✓ **real only**             | ✓ documents/diagrams | ✗                |
| `social/`       | ✓ restrained                | ✓                    | ✓ under §11      |

The AI-generated column is **not** a blanket permission or prohibition. AI
artwork is governed by **§11**, which permits it when it is unmistakably
editorial — abstract editorial artwork, architectural abstraction, structural
composition, texture or material study — and forbids anything that could be read
as documentary evidence.

`✓ under §11` means permitted within §11's constraints. `✗` means this directory
has a stricter, specific rule that §11 does not override:

- `brand/` — marks are hand-authored SVG geometry; the mark rules in §1b are normative.
- `hero/` — the Hero is an institutional visual slot (§2), and the slot is
  hand-authored rather than generated; see `TECHNICAL_DEBT.md` B4.
- `organization/` — **real material only** (§10). Generated depictions of people,
  meetings or institutions are never permitted here.

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
