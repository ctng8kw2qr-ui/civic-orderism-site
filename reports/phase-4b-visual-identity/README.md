# Phase 4B — Hero & Flagship Editorial Artwork

Two registers of the same institution, delivered together. Design process,
measurements and the dead ends worth recording.

Branch: `design/v6-visual-identity-phase4b` · base `0eb0f99`.

---

## 1. Hero — THRESHOLD

**Asset:** `quartz/static/assets/v6/hero/hero-threshold.svg`
**Supersedes:** `hero-architecture.svg` (deleted — the Phase 3 placeholder).

A structural boundary rises from the datum with one passage opened through it. A
single datum runs unbroken across the full width and continues on both sides:
**the structure is not removed, the passage is opened.** Structure continues;
the path changes.

|           |                                                          |
| --------- | -------------------------------------------------------- |
| viewBox   | 1200 × 600 (2:1)                                         |
| boundary  | x 260..940, y 70..470                                    |
| passage   | x 500..700; arch head = semicircle, apex y 150           |
| springing | y 250                                                    |
| datum     | y 470, x 70..1130 — deliberately wider than the boundary |
| size      | **2.9 KB**, no raster, no base64                         |

### Rendering model — the CSS mask was retired

Phase 4B formally retired the mask model. A mask uses the SVG as an **alpha
stencil**: every stroke renders in one flat colour, so a multi-weight drawing
collapses into a silhouette. The Hero is now a direct-rendered `<img>`.

Theming is handled **inside the SVG** with `prefers-color-scheme`, which V6
already keeps in sync with `saved-theme` — so **one asset serves both themes**
with no filter, no invert, no duplicate file and no CSS mask.

### Measured impact

Hero artwork as a share of the Hero area:

| width | before (Phase 3 mask) | after     |
| ----- | --------------------- | --------- |
| 375   | 8.2%                  | **14.4%** |
| 390   | 8.2%                  | **15.7%** |
| 430   | —                     | **17.1%** |
| 768   | 4.1%                  | **29.0%** |
| 1024  | 3.9%                  | **34.2%** |
| 1440  | 8.9%                  | **11.5%** |

The old model capped the art at 220/260/380px, which left it at ~4% at 1024px.
The new rule fills the aside column. At 1440 the figure is intentionally lower
because the two-column layout gives the aside a narrower column — the artwork
is present, not dominant, and the H1 remains the first hierarchy.

### Accessibility

`alt=""` + `aria-hidden="true"`. The artwork is decorative concept work; the
Hero copy carries the meaning, so nothing is announced twice.

### Hero copy

**Unchanged, verbatim.**

---

## 2. Flagship cover — LOAD REDISTRIBUTION

**Article:** 《中共正在变成什么？》 · 公民秩序主义关于中共的总论

A cross-section of the system itself. Distributed load (the light field)
progressively bunches toward the core as two constraint lines close in from
either side. The outer strands are sheared off part-way and shed to the
periphery — the load is not removed, it is **redistributed outward**. One wine
datum runs unbroken through the whole width: the path continues.

Read as: **distribution of growth → distribution of loss.**

|            |                                                                          |
| ---------- | ------------------------------------------------------------------------ |
| Master     | 2400 × 1263 (ratio 1.9002 ≈ 1.9)                                         |
| Source     | `quartz/static/assets/v6/editorial/source/ccp-system-transformation.svg` |
| Production | `quartz/static/assets/v6/editorial/ccp-system-transformation.webp`       |
| Size       | **30.8 KB** at 1600 × 842, WebP q88                                      |

### Discipline applied

- **Exactly one C-device** (the load field). No arrows, no nodes, no legend, no
  second grid, no chart furniture, no title, no folio number.
- **B (Editorial Archive)** supplies the plate: hairlines, section marks,
  registration ticks, generous negative space, publication rhythm.
- No personnel, no flags, no maps, no events — this is a system, not a scene.
- Wine appears only as the datum and the shear ticks; the plate is not red.

---

## 3. What the dead ends taught (worth recording)

Ten cover variants and nine Hero variants were produced before the final pair
(`exploration/`). Two failures are worth keeping in the record because they are
easy to repeat.

### Hero: three separate bugs, each invisible by eye

1. **Arc sweep flag.** For `A r r 0 0 <sf>` traversed left→right, `sf=1` bulges
   **up** and `sf=0` bulges **down** — the opposite of what I first assumed.
   With the head being an exact semicircle, the wrong flag leaves the head
   filled while the jambs below still look correct.
2. **Unstyled elements default to SOLID BLACK.** SVG's initial `fill` is black,
   not transparent. A class that declares only `stroke` (no `fill`) yields a
   **filled black rectangle** between its endpoints. Fixed by declaring
   `fill: none` on every stroke class _and_ as a presentation attribute, so a
   styling miss can never reintroduce it.
3. **Multi-line `d` attributes.** A `d` attribute split across lines rendered
   incorrectly in the browser while the identical single-line path was correct.
   Path data is now kept on one line.

The construction was then reduced to a **single `fill-rule="evenodd"` path** —
boundary minus passage in one element — which cannot half-fail the way layered
knock-outs can. **Verify SVG geometry by scanning pixel values, never by eye.**

### Cover: the convergence trap

The obvious mapping (paths converging left→right) kept producing **chart
language** — funnel, trend fan, block diagram. Widening, narrowing, shearing and
multiplying the lines were all tried. What finally worked was to stop thinking
of it as a _line chart of a transition_ and treat it as a **cross-section of the
system**: a band pinched between two constraint lines, with the shed load
sheared off to the periphery. That reads as an editorial plate rather than a
consulting graphic.

---

## 4. Consumers — one source, three placements

`cover` + `coverAlt` frontmatter only. **No new metadata field. No special
casing.** Verified in the built output:

| placement                    | measured                                            |
| ---------------------------- | --------------------------------------------------- |
| `ArticleInstitutionalHeader` | 760 × 400 (390px: 354 × 186)                        |
| `RecentResearch` Lead        | 631 × 332 (article is already `homepageLead: true`) |
| OG / `twitter:image`         | absolute cover URL; width/height omitted            |

Box ratio equals natural ratio (1.9 = 1.9), so **`object-fit: cover` crops
nothing** — the plate's bounds are intact.

`coverAlt` describes the artwork rather than naming the article:

> 抽象结构截面：原本开放分散的多路径负载逐渐向核心收束，两侧约束线向内合拢，外层负载被剪断并向外围重新分配，一条完整的中轴贯穿全幅。

---

## 5. Tier 3 — no cover, still a designed state

| sample                                     | images in page |
| ------------------------------------------ | -------------- |
| `china/ccp-2018-xi-era-local-growth-space` | **0**          |
| `theory/modern-social-syndrome`            | **0**          |

No `<img>`, no placeholder, no empty artwork slot.

---

## 6. QA

0 horizontal overflow and 0 broken images across every combination tested:
homepage 375/390/430/768/1024/1440; article 390/768/1024/1440; no-cover samples
390/1440; light and dark. Nav, footer, Core Judgment, TOC and Reading Footer all
present; homepage section count unchanged at 7.

Screenshots: `qa-*.png` (viewport-sized, light and dark).

---

## 7. Validation

| command                               | result                             |
| ------------------------------------- | ---------------------------------- |
| `npm run build`                       | pass — 535 files, 0 sync artifacts |
| `npx tsc --noEmit`                    | pass                               |
| `npm run validate:v2`                 | pass — 103 / 9 / 20 / 13           |
| `npm run validate:content-safety`     | pass                               |
| `npm run validate:article-typography` | pass                               |
| `npm run check:links`                 | pass — 21,035 links / 488 pages    |
| Prettier                              | 187 vs 189 on main — 0 new         |

`validate-v2-architecture.mjs` carried a homepage assertion requiring
**no `<img>` at all** (the old "typographic-only" rule). Phase 4B intentionally
supersedes it, so the assertion was updated to its new intent: exactly two
homepage images — the Hero artwork and the Lead cover — with the Hero artwork
required to be decorative. That is the only validator change.

---

## 8. Scope

Changed: Hero component + its SCSS + Hero asset; the cover asset and its source;
the target article's frontmatter; docs (`SPEC.md`, `hero/README.md`,
`TECHNICAL_DEBT.md`); the one validator assertion above.

**Not** changed: `quartz/util/cover.ts`, `ArticleInstitutionalHeader`,
`RecentResearch`, `Head.tsx`, `quartz.layout.ts`, `_tokens.scss` (palette),
navigation, footer, article layout, global spacing, URLs/slugs, or the
information architecture. Only one content file changed.
