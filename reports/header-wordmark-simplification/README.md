# Header wordmark simplification

A small, explicitly scoped production UI correction: the Threshold Mark is no
longer shown in the header. The header now reads as the name alone.

Branch: `fix/header-wordmark-simplification` · base `e6784d0`

```
BEFORE                              AFTER
[◯ Mark]  公民秩序主义                公民秩序主义
          CIVIC ORDERISM             CIVIC ORDERISM
```

## 1. What changed

**Markup** — `quartz/components/PrimaryNavigation.tsx`

- Removed the inline `<svg class="v6-nav__brand-mark">` (3 elements: circle,
  arch, horizon).
- Removed the now-redundant `<span class="v6-nav__brand-text">` wrapper. With
  the mark gone the brand link _is_ the stacked column, so keeping a wrapper
  whose only job was to sit beside the mark would have been dead structure.
- The two text spans are now direct children of the link.
- **The link itself is unchanged**: still one `<a class="v6-nav__brand"
href="/">` wrapping the whole wordmark, still `aria-label="公民秩序主义首页"`.

**CSS** — `quartz/components/styles/v6Navigation.scss`

Removed, because they existed only to serve the header mark:

| Removed                                                                               | Why                 |
| ------------------------------------------------------------------------------------- | ------------------- |
| `.v6-nav__brand-mark` (width/height 30px, `flex: 0 0 auto`, `color: var(--v6-brand)`) | the mark is gone    |
| `:root[saved-theme="dark"] .v6-nav__brand-mark`                                       | its dark colour     |
| `.v6-nav__brand-text` (column flex + gap)                                             | the wrapper is gone |

Changed: `.v6-nav__brand` went back from `row` + `align-items: center` +
`gap: var(--v6-space-xs)` to the plain `column` + `gap: 0.1rem` it used before
the mark was added.

**This was a real removal, not a `display: none`.** No leftover 30px gap, no
orphaned rule.

## 2. Scope discipline

**Not touched:** `threshold-mark.svg` / `threshold-mark-reverse.svg`, favicon,
`icon.png`, `icon-192`, `icon-512`, `apple-touch-icon`, OG fallback, manifest,
social assets, Hero, article covers, footer, PDF tooling, Red Seal, Values
Strip, `site.config.json` `englishName`, `CIVIC ORDERISM` capitalisation, and
the nav links or toggle.

The Threshold Mark remains the brand asset — it still serves the favicon, the
application icons and the OG fallback, and it is still the Hero artwork's
conceptual sibling.

## 3. Measurements

|                                      | before | after     |
| ------------------------------------ | ------ | --------- |
| Header height, mobile (375–768)      | 92px   | **92px**  |
| Header height, desktop (1024–1440)   | 66px   | **66px**  |
| Brand block width                    | 150px  | **108px** |
| Brand block height                   | 35px   | 35px      |
| `.v6-nav__brand-mark` in DOM         | 1      | **0**     |
| Inline `<svg>` inside the brand link | 1      | **0**     |

Header height is unchanged because the brand block was already taller than the
30px mark. Typography, letter-spacing, colour, weight and the two-line hierarchy
are all unchanged — no size was increased to fill the vacated space. The left
edge now sits on the page grid as plain text, and the space the mark occupied is
simply left as whitespace.

## 4. QA — 12 combinations

375 / 390 / 430 / 768 / 1024 / 1440 × light / dark:

- Header left shows **no** Threshold Mark (`brand-mark` count 0 at every width)
- `公民秩序主义` and `CIVIC ORDERISM` both render at every width
- 0 horizontal overflow, 0 broken images
- mobile menu toggle behaviour and desktop nav alignment unchanged
- Wordmark left edge held at x=113 (mobile) / x=113 (desktop) as a text block

Screenshots: `header-390-light.png`, `header-1440-light.png`,
`header-1440-dark.png`.

## 5. Accessibility

- Accessible name unchanged: the link still carries
  `aria-label="公民秩序主义首页"`, and the visible text is
  `公民秩序主义CIVIC ORDERISM`.
- **Nothing decorative is left to announce** — the removed SVG had been
  `aria-hidden`; its removal reduces the DOM without changing what is read.
- Keyboard focus still draws `solid 2px rgb(122, 36, 48)` around the whole
  wordmark; `flex-direction: column` confirmed on the link.
- Nav tab order is unchanged: brand → toggle → 5 links → search.
- Hit-testing the centre of the wordmark resolves inside the brand link, and a
  real click navigates `/theory/` → `/`. Still one home link, not two.

## 6. Validation

| Command                               | Result                             |
| ------------------------------------- | ---------------------------------- |
| `npm run build`                       | pass — 535 files, 0 sync artifacts |
| `npx tsc --noEmit`                    | pass                               |
| `npm run validate:v2`                 | pass — 103 / 9 / 20 / 13           |
| `npm run validate:content-safety`     | pass                               |
| `npm run validate:article-typography` | pass                               |
| `npm run check:links`                 | pass — 21,035 links / 488 pages    |
| Prettier                              | 187 — unchanged                    |

### No validator change was needed

Investigated before assuming one was required, and both possible assertions
turned out not to apply:

- **There is no assertion requiring the Threshold Mark in the header.** The
  validator never had one, so nothing was weakened or invented.
- The header-brand assertion already requires exactly what remains:
  `instNavHtml.includes("CIVIC ORDERISM")`,
  `includes("公民秩序主义")` and `includes('href="/"')`.
- Separately, the legacy-brand check scans for `"Citizen Orderism"` — the
  **pre-V6** brand, not `CIVIC ORDERISM`. It matches 0 of 488 built pages and
  passes.

`scripts/validate-v2-architecture.mjs` is therefore **byte-identical to `main`**.

## 7. Diff scope

| Path                                      | Diff        |
| ----------------------------------------- | ----------- |
| `content/`                                | 0           |
| Hero artwork / Hero SCSS                  | 0           |
| Article component / `cover.ts`            | 0           |
| Editorial (cover) assets                  | 0           |
| favicon / icons / OG / manifest           | 0           |
| `assets/v6/brand/` (both brand SVGs)      | 0           |
| `scripts/validate-v2-architecture.mjs`    | 0           |
| **`PrimaryNavigation.tsx`**               | **changed** |
| **`styles/v6Navigation.scss`**            | **changed** |
| `reports/header-wordmark-simplification/` | added       |

Two production files changed, and both are header-only.
