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
