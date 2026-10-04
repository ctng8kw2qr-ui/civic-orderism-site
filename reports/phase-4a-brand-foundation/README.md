# Phase 4A — Brand Foundation: concepts and rationale

**Status: concept only.** No production asset was replaced. `icon.png`,
`favicon*`, `apple-touch-icon.png`, `og-image.png`, `logo.png` and the Hero are
untouched. Replacement happens only after this is approved.

Branch: `design/v6-brand-foundation` · base `eba7701`.

Direction (confirmed): **B + C hybrid** — B _Editorial Archive_ as the main
visual grammar; C _Abstract Order_ as at most one analytical device per
artwork; A _Institutional Architecture_ retained as the Hero register only.

---

## 1. What the audit changed about the brief

The legacy identity already contains a mark, wordmark, seal and values strip.
So this is **evolution, not replacement**. Two measured facts drove the design:

| Fact                                             | Measurement                                 | Consequence                                                                      |
| ------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------- |
| The legacy mark occupies only ~24% of its canvas | 123×99px inside a 512px icon                | At 32px the circle is ~7px. It cannot be an icon while sharing canvas with text. |
| No brand asset contains the V6 palette           | wine pixels: 0.004% / 0.003% / 0% / 0% / 0% | Every asset predates V6. Wine exists only in CSS.                                |

The five parts of the legacy identity were separated, because they are not one
thing: **Brand Mark**, **Wordmark**, **Seal**, **Values Strip**,
**Application Icon**.

---

## 2. Icon concepts (3)

All three inherit the legacy **circular boundary**. They differ in what the
circle contains. Files in `concepts/`.

### A — Simplified Colonnade · 6 elements

Circle + lintel + 3 columns + base. Keeps the colonnade reading, reduces five
thin columns to three heavy ones, removes the pediment detail.

### B — Threshold Mark · 3 elements ‹recommended›

Circle + arched opening + ground line. Extracted from the _opening / passage_
already implied by the colonnade.

### C — Order / Structure · 3 elements

Circle + centred square frame + threshold slot. Most abstract; reads as
"bounded chamber".

### Stress test result (8 / 12 / 16 / 24px — see `attribution.png`)

|       | 8px                    | 16px             | 24px      |
| ----- | ---------------------- | ---------------- | --------- |
| A     | muddy, 4 bars merge    | legible but busy | good      |
| **B** | **still identifiable** | **clear**        | **clear** |
| C     | blob                   | legible          | good      |

**B is the only concept identifiable at 8px**, because it is the only one whose
silhouette is a single shape rather than a group of parallel bars. Element count
is the predictor here, not stroke weight.

### Colour tests (4, all in `icons-all.png`)

| Test                                   | Result                          |
| -------------------------------------- | ------------------------------- |
| Wine `#7a2430` on warm white `#faf8f5` | ✅ primary mark                 |
| Charcoal `#1b1c1f` on warm white       | ✅ works; quieter, less branded |
| Warm white on charcoal `#1b1c1f`       | ✅ reverse mark                 |
| Warm white on wine `#7a2430`           | ✅ works                        |

Recommendation: **two variants only — primary (wine) and reverse (warm white)**
— to avoid the six-version sprawl the brief warned against. Charcoal-on-warm-
white is available but not needed as a separate asset.

---

## 3. Lockup proposals (`lockups.png`)

| Form               | Composition                                      | Use                                              |
| ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| **Full Lockup**    | icon + stacked `公民秩序主义` / `CIVIC ORDERISM` | PDF covers, document headers, about pages, print |
| **Compact Lockup** | icon + single-line `公民秩序主义`                | site header, footer on wide layouts              |
| **Icon Only**      | mark alone                                       | favicon, app icon, avatars, small UI             |

**Recommendation: keep the typographic wordmark.** Do **not** re-mount the
782 KB `logo.png` into navigation. The V6 nav's two-line typographic brand is
already working and is more appropriate than a raster lockup. The icon is added
only where a mark is needed.

### Wordmark consistency issue found

The V6 nav renders `Civic Orderism` in **title case**; the legacy lockup and my
proposals use **CIVIC ORDERISM** in caps. This is a real inconsistency for you
to settle — I did not change it, since it means touching the nav. Options:
normalise the nav to caps, or normalise the lockup to title case.

---

## 4. Values Strip — recommended layer

`平等 · 秩序 · 尊严 · 保障 · 自由` (wording untouched).

Survives to 7px with `.14em` tracking (`attribution.png`), so it is legible but
it is **not** identity-bearing at small sizes.

**Recommendation: Secondary institutional device — explicitly NOT part of the
Primary Logo.** Appropriate uses: document footer, publication colophon,
organisation material, PDF back page. It should never be locked to the mark,
and never appear in the site header.

This matches the brief's inclination and is supported by the measurement.

---

## 5. Red Seal — recommendation

The legacy seal is a **2×2 four-character seal-script device**
(`legacy-seal-sheet.png`), i.e. it encodes values keywords in a traditional
seal format. It is not mere decoration, but it has a real limitation:

| Device                  | 16px      | 24px      | 48px   | 96px  |
| ----------------------- | --------- | --------- | ------ | ----- |
| 2×2 four-character      | illegible | illegible | barely | reads |
| Simplified single glyph | legible   | legible   | good   | good  |

**Transparency note:** my simplified glyph is a geometric rendering, and the
character `平` is genuinely present in the legacy seal — but **I cannot reliably
read all four characters** at the resolution available (the isolated seal is
13×15px in `icon.png`). The four characters must therefore be confirmed by you
or redrawn from the original vector. **I am not asserting which characters they
are.**

**Recommendation:** keep the seal as a **secondary editorial device** for
document/institutional material at **≥48px only**. Do **not** make it the
favicon and do not simplify it into a single glyph without your confirmation of
the characters — a one-character seal would misrepresent a four-value device.

---

## 6. V6-native OG fallback (concept)

`concepts/og-fallback.svg`, rendered in `og-final.png` and `og.png`.

Built strictly in the **B (Editorial Archive)** language, per the brief:

- 1200×630, warm white `#faf8f5`
- hairline archive frame, no fill, no radius, no gradient
- Full Lockup at compact scale
- **one weak C-device**: a measured structural fragment at `#d9c4c7`
- institutional statement `研究中国政治转轨与制度承接`
- colophon row: `RESEARCH PUBLICATION` · `civicorderism.com` with a folio rule

Deliberately absent: article title, photograph, personnel, Hero artwork,
illustration, any call to action.

### Measured safe margin

```
logical 1200 x 630
margins  left 103.5px  right 103.5px  top 103.5px  bottom 103.5px
>= 100px horizontal requirement: PASS
```

The first draft measured exactly 94–100px and was **adjusted** rather than
accepted — the frame inset moved from 88px to 104px.

### Crop behaviour

| Context                              | Result                                             |
| ------------------------------------ | -------------------------------------------------- |
| 1200×630 master                      | as authored                                        |
| 600×315 (retina half)                | all elements legible                               |
| 400×210 (Telegram/WhatsApp)          | title + lockup legible; colophon small but present |
| 300×158 (small feed)                 | survives                                           |
| X large card 506×265 (sides trimmed) | lockup survives; **title crops**                   |
| 300×158 aggressive centre crop       | lockup crops, title survives                       |

**Known weakness to accept or fix:** in X's wide card the left edge trims the
lockup and the title's leading characters. Because the layout is left-aligned,
a centre-weighted crop is the worst case. Two options: (a) accept, since X
shows most cards at full 1.91:1; (b) centre the composition more. I did **not**
change it unilaterally — flagging it for your decision.

---

## 7. `logo.png` — recommendation

1254×1254, **782 KB**, currently published at `/static/logo.png` (live 200) but
**never rendered**: its only consumer is `PageTitle.tsx`, which is exported but
never mounted in `quartz.layout.ts`.

**Recommendation: (B) rename and archive it, then delete in a later phase.**
Specifically: do not re-mount `PageTitle` merely because the file exists, and do
not keep 782 KB of dead weight in the published tree. The new Full Lockup
should be authored as **SVG** when real artwork is produced — which also solves
the file-size problem.

Do not act on this in 4A; it is a Phase 4B/4C decision.

---

## 8. What is deliberately NOT in this round

Hero rendering model · Hero artwork · Editorial covers · 《中共正在变成什么？》
artwork (concept C1 Load Redistribution remains reserved for 4B) · any CSS,
JSX, content, palette, typography, URL or navigation change · no production
asset replaced · no merge, no deploy.

---

## 9. Decision requested

1. **Icon: A, B or C?** (recommendation: **B**)
2. Seal: keep as secondary device at ≥48px, or retire? And confirm the four
   characters.
3. Wordmark case: normalise nav to `CIVIC ORDERISM`, or lockup to `Civic Orderism`?
4. OG concept: approved as-is, or centre the composition to survive X's crop?

---

# FINALIZATION (adjudicated)

Your decisions, applied. Production candidate assets are now in place on this
branch — still **not merged, not deployed**.

## Icon — Threshold Mark selected

`quartz/static/assets/v6/brand/threshold-mark.svg` (+ `-reverse`).
A and C are retained here as concept history only; they are **not** brand assets.

### Geometry (normative, 3 elements exactly)

|              |                                                      |
| ------------ | ---------------------------------------------------- |
| viewBox      | `0 0 100 100`                                        |
| stroke-width | `4` → min stroke at 16px = 0.64px                    |
| element 1    | `circle cx 50 cy 50 r 48`                            |
| element 2    | `path M36 70 L36 48 A14 14 0 0 1 64 48 L64 70`       |
| element 3    | `line 28 70 → 72 70`                                 |
| clear space  | 12% of height, all sides                             |
| minimum      | 16px favicon · 24px alone in UI · 48px with the seal |

Optical note recorded in the SVG: the arch sits slightly above the circle's
geometric centre, so the horizon is load-bearing, not decorative — without it
the mark reads top-heavy.

## Small-size tests

`previews/favicon-final.png` — 16 / 32 / 48 at 4× nearest:
**16px identifiable, 32px clear, 48px complete.**

`previews/appicons.png` — 180 / 192 / 512.

**One implementation detail worth knowing:** at 16px the 4-unit stroke
rasterises to _partial_ alpha (measured max alpha **178**), so a transparent
16px favicon reads faint. The favicon and app-icon sizes are therefore
**flattened onto warm white** deliberately; `icon.png` / `icon-192` /
`icon-512` keep alpha.

## Primary / Reverse

Primary `#7a2430` on `#faf8f5`; Reverse `#faf8f5` on charcoal `#1b1c1f` or
wine. Two variants only.

## Lockups

Icon-only · Compact (mark + `公民秩序主义`) · Full (mark + `公民秩序主义` +
`CIVIC ORDERISM`). `previews/nav-lockup.png` shows the Compact Lockup at three
mark heights in the header, light and dark — **mark 30px reads best**.

The site header currently renders the **typographic** brand only. Mounting the
mark there is a markup change, so it was **not** done unilaterally — see
"Outstanding" below.

## English identifier — unified

`CIVIC ORDERISM` is now the formal identifier in:
`PrimaryNavigation.tsx`, `data/site.config.json` (`englishName`), and the footer
(already correct). The `lang="en"` brand span keeps `text-transform` untouched;
the string itself is uppercase.

Prose was **not** rewritten — `content/**` still contains `Civic Orderism`
in ordinary sentences, as instructed.

**Consequence handled:** `validate-v2-architecture.mjs` asserted
`instNavHtml.includes("Civic Orderism")`. That assertion was updated to the
uppercase form with a comment — a brand-display assertion, not a validator
rewrite. `validate:v2` passes.

## Values strip — secondary institutional device

Permitted: PDF footer, publication colophon, organisation and board material.
Forbidden: primary logo, favicon, icon, navigation, small lockups. Wording
unchanged.

## Red Seal — secondary editorial device, ≥48px

Retained, not redrawn, not simplified, not added to the primary identity.
The four glyphs remain **unconfirmed**; no redraw until the original vector or
confirmed characters are available.

## Final OG fallback

`quartz/static/assets/v6/social/og-fallback.svg` →
**`quartz/static/og-image.png` replaced** (production candidate).

- 1200×630, V6-native, direction B
- brand block (mark + 公民秩序主义 + CIVIC ORDERISM) **horizontally centred**,
  measured centre offset **+0.5px**
- margins `L103 R103 T140 B159` — **≥100px satisfied**
- **26.8 KB**, down from the 46 KB legacy asset
- legacy asset contained **0** wine pixels and used `#f8f8f6`, the background
  value Phase 3 corrected

`previews/og-crops.png` shows the crop matrix. **Measured result:** all five
delivery sizes (1200×630 / 600×315 / 506×265 / 400×210 / 300×158) share a
~1.9:1 aspect, so side trim is **~0px for every one of them** — the brand name
is never cropped. An earlier crop simulation of mine had used a wrong offset
and wrongly suggested X trims the lockup; that was a measurement error, not a
design fault. The block was centred anyway so it also survives any future
wider-aspect centre crop.

## `logo.png` — NOT deleted. My earlier audit was wrong.

I need to correct the record. I reported `logo.png` as dead code with
`PageTitle.tsx` as its only consumer. **That was wrong.** Real consumers:

| Consumer                                          | Status                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `scripts/generate-introduction-manual-pdf.cjs:11` | **active npm script** `generate:introduction-manual-pdf`; embeds the logo in the manual PDF |
| `scripts/generate-founding-board-brief-pdf.py:33` | build tooling (not registered in package.json)                                              |
| `validate-v2-architecture.mjs:796`                | asserts `public/static/logo.png` exists                                                     |
| `generate-content-indexes.mjs:436`                | a legacy homepage template — genuinely dead (0 matches in built output)                     |
| `PageTitle.tsx`                                   | genuinely dead (never mounted)                                                              |

Because a real consumer exists, your rule applies: **do not delete**. It is
untouched. `PageTitle` was not mounted to justify it.

**Recommendation for a later phase:** author the new Full Lockup as **SVG**,
repoint the two PDF scripts to it, then retire the 782 KB raster. That removes
the weight _and_ makes the PDFs use the current brand, rather than deleting a
file two scripts still depend on.

## Changed production candidate files

```
replaced  quartz/static/icon.png               512 RGBA   45.0 KB
replaced  quartz/static/icon-512.png           512 RGBA   45.0 KB
replaced  quartz/static/icon-192.png           192 RGBA   15.9 KB
replaced  quartz/static/apple-touch-icon.png   180 RGB    12.9 KB
replaced  quartz/static/favicon-32x32.png       32 RGB     1.5 KB
replaced  quartz/static/favicon-16x16.png       16 RGB     0.7 KB
replaced  quartz/static/favicon.ico          16/32/48     5.1 KB
replaced  quartz/static/og-image.png        1200x630 RGB  26.8 KB
added     quartz/static/assets/v6/brand/threshold-mark.svg
added     quartz/static/assets/v6/brand/threshold-mark-reverse.svg
added     quartz/static/assets/v6/social/og-fallback.svg
edited    quartz/components/PrimaryNavigation.tsx   (brand case)
edited    data/site.config.json                     (englishName)
edited    quartz/static/assets/v6/SPEC.md           (brand architecture, OG rules)
edited    scripts/validate-v2-architecture.mjs      (nav brand assertion)
```

`quartz/plugins/emitters/favicon.ts` is **unchanged** — it still reads
`static/icon.png` and derives `favicon.ico` (verified: all three ICO sizes
generated).

## QA results

| Check                                        | Result                                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| favicon 16 / 32 / 48                         | legible ✅                                                                               |
| app icon 180 / 192 / 512                     | ✅                                                                                       |
| homepage 375 / 390 / 430 / 768 / 1024 / 1440 | 0 overflow, 0 broken images; heights unchanged (8652 / 8504 / 8261 / 7258 / 6649 / 6149) |
| nav brand                                    | `CIVIC ORDERISM` at every width, light + dark                                            |
| OG margins                                   | `L103 R103 T140 B159` ≥ 100px ✅                                                         |
| OG brand-block centring                      | `+0.5px`                                                                                 |
| OG crop contexts                             | brand never cropped ✅                                                                   |

## Validation

| Command                               | Result                                                  |
| ------------------------------------- | ------------------------------------------------------- |
| `npm run build`                       | ✅ 532 files, 0 sync artifacts                          |
| `npx tsc --noEmit`                    | ✅                                                      |
| `npm run validate:v2`                 | ✅ 103 / 9 / 20 / 13 (after the brand assertion update) |
| `npm run validate:content-safety`     | ✅                                                      |
| `npm run validate:article-typography` | ✅                                                      |
| `npm run check:links`                 | ✅ 21,035 links / 488 pages                             |
| Prettier                              | **186 vs 189 on main — 0 new**                          |

## Still untouched

Homepage · article system · V6 palette · typography · CSS layout · `content/**` ·
URLs · Hero (the Phase 3 placeholder `hero-architecture.svg`, its rendering model, JSX and CSS — all still untouched **at the time of Phase 4A**; Phase 4B later replaced the hero artwork and retired the CSS-mask model, see `../phase-4b-visual-identity/`) ·
Article Cover · 《中共正在变成什么？》 (C1 reserved for 4B). No satori, no new
font, no CDN, no CMS, no batch imagery, no news photography, values wording
unchanged.

## Note on duplicates in this folder

`concepts/threshold-mark.svg`, `concepts/threshold-mark-reverse.svg` and
`concepts/og-fallback-final.svg` are **read-only snapshots** of the canonical
assets now living in `quartz/static/assets/v6/brand/` and `.../social/`. They
are copied here so this report is self-contained for review; the canonical
files are the ones the build serves. Edit the canonical file, then re-copy.

`concepts/og-fallback.svg` was the superseded first draft (brand block
left-of-centre, margins 94px) and was replaced by `og-fallback-final.svg`.

## Outstanding — one decision left

**Mount the Threshold Mark into the site header?** Your Brand Architecture
defines the Compact Lockup as _mark + wordmark_, and
`previews/nav-lockup.png` shows it works at 26/30/34px in both themes.
But mounting it means editing `PrimaryNavigation.tsx` beyond the brand-case
change, so I left the header typographic-only. Say the word and it is a small
change; I recommend **mark at 30px**.

---

# HEADER — Compact Lockup mounted (adjudicated close-out)

The Threshold Mark is now in the site header. Minimal change: the brand link
already wrapped both text spans, so the mark was inserted **inside the existing
`.v6-nav__brand` link** — no navigation redesign.

## Implementation

```
quartz/components/PrimaryNavigation.tsx   inline <svg class="v6-nav__brand-mark">
                                          + <span class="v6-nav__brand-text"> wrapper
quartz/components/styles/v6Navigation.scss  brand row + mark sizing + dark colour
```

- **SVG master inlined**, not a PNG, and not the Full Lockup as an image.
  Geometry is the canonical 3 elements from `brand/threshold-mark.svg`
  (`viewBox 0 0 100 100`, `stroke-width 4`, circle r48 / arch r14 / horizon).
- **Wordmark stays real HTML text.** Mark = identifier, text = institutional name.
- Colour comes from `currentColor` — **no filter, invert or brightness hack**
  (verified: computed `filter: none` in both themes).

## Dimensions

|                   | Value                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| mark              | **30 × 30px** (`1.875rem`)                                                    |
| gap to text       | `var(--v6-space-xs)` = **12px** — an existing token, not a new spacing system |
| brand block width | 108px → **150px**                                                             |
| nav height        | **unchanged** (see below)                                                     |

No mobile downscale was needed: measured QA showed no crowding at 375/390/430,
so no breakpoint was added.

## Light / dark

| Theme | Mark                   | Resolved                       |
| ----- | ---------------------- | ------------------------------ |
| light | `var(--v6-brand)`      | `rgb(122,36,48)` = `#7a2430`   |
| dark  | `var(--v6-brand-text)` | `rgb(217,139,150)` = `#d98b96` |

Uses the same `:root[saved-theme="dark"]` scoping as `.v6-hero__art`. The dark
value is the V6 dark brand-text token — the same colour already used for dark
nav hover and footer links, so the mark stays inside the established palette
rather than introducing a new value.

## Accessibility

- `<svg aria-hidden="true" focusable="false">` — decorative, so the mark is
  **never announced** and there is no duplicate "mark + name" reading.
- Accessible name comes from the existing text and the link's `aria-label`
  (`公民秩序主义首页`).
- **No extra tab stop:** nav tab order measured as brand → toggle → 5 links →
  search. The mark adds nothing.

## Interaction

- Mark and wordmark are **one click target inside one link**; a hit test at the
  mark's centre resolves to the `svg` whose `closest('a')` is `.v6-nav__brand`.
- Clicking the mark navigates `/theory/` → `/` (verified).
- Keyboard focus draws a `solid 2px #7a2430`, `offset 2px` ring **around the
  whole lockup**. No separate mark hover animation was added.

## Header height — before / after (measured)

| width                 | before | after    |
| --------------------- | ------ | -------- |
| 375 / 390 / 430 / 768 | 92px   | **92px** |
| 1024 / 1440           | 66px   | **66px** |

**Zero vertical growth.** The brand block was already taller than a 30px mark,
so adding it did not change the header height. Measured by stashing the change,
rebuilding, and re-measuring the same six widths.

## QA screenshots

`previews/header-{light,dark}-{375,390,430,768,1024,1440}.png` (retina 2×),
`previews/lockup-retina.png` (4×), `previews/header-summary.png`.

Verified: 0 horizontal overflow, 0 broken images, brand reads `CIVIC ORDERISM`
at every width, menu trigger visible only below 768px as before, page heights
unchanged (8652 / 8504 / 8261 / 7258 / 6649 / 6149).
