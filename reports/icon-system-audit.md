# Icon System Audit — read-only findings

Audit of every icon in the codebase and on the live site, plus a proposed
unified system and the exact files that would change.

**No code was modified in producing this report.** Baseline audited:
`main` @ `5371ad1`, production `civicorderism.com`.

---

## 0. Two findings that change the brief

**(a) The header logo removal is already done.** The brief's §二 asks to delete
the graphic logo left of `公民秩序主义`. That shipped in PR #16 and is live.
Verified in production:

```html
<a class="v6-nav__brand" href="/" aria-label="公民秩序主义首页">
  <span class="v6-nav__brand-zh">公民秩序主义</span>
  <span class="v6-nav__brand-en" lang="en">CIVIC ORDERISM</span>
</a>
```

No `<svg>`, no `brand-mark`, no empty placeholder, header height unchanged
(92px mobile / 66px desktop), brand block 150px → 108px. **Nothing to do here.**

**(b) The header contains no icons at all.** This is the most important
correction to the brief. Measured at 1440 and 390:

| Element            | Size                | Icon?                    |
| ------------------ | ------------------- | ------------------------ |
| `.v6-nav__brand`   | 108×35              | none — text              |
| `.v6-nav__link` ×5 | 53–82×37            | none — text              |
| `.v6-nav__search`  | 54×38               | **none — the word 搜索** |
| `.v6-nav__toggle`  | 44×44 (mobile only) | CSS-drawn, 17.6×11.2     |

`.search-button` — Quartz's real search **icon** — is `18×2px` with
`clip: rect(0px,0px,0px,0px)`, i.e. **visually hidden**.

So the "over-heavy right-hand icons" are not icons. They are **bordered boxes**:

- search is a 1px-bordered, 2px-radius **pill containing text**
- the mobile menu is a **1px-bordered 44×44 square** with a 2-bar CSS glyph

That reframes the work: the fix is **removing container chrome and unifying the
few real icons**, not redrawing an icon set.

---

## A. Icon Inventory

### A.1 Rendered icons on the live site

| #   | Icon                           | Where                                       | Size                           | stroke-width | linecap    | Colour              |
| --- | ------------------------------ | ------------------------------------------- | ------------------------------ | ------------ | ---------- | ------------------- |
| 1   | Heading anchor (Lucide "link") | every `h2`/`h3`, **1,947 across 153 pages** | 18×18                          | **2**        | round      | `rgb(27,28,31)`     |
| 2   | TOC fold chevron               | article TOC header                          | **24×24**                      | 2            | round      | `#45484f`           |
| 3   | Search magnifier (Quartz)      | `.search-button`                            | 19.9×19.7, **visually hidden** | 1.5          | **square** | `--darkgray`        |
| 4   | Copy / copied (clipboard)      | every code block                            | 16                             | fill-based   | n/a        | grey / github-green |
| —   | Header                         | —                                           | —                              | —            | —          | **no icons**        |

### A.2 Source locations

| Source             | File                                                | Status                               |
| ------------------ | --------------------------------------------------- | ------------------------------------ |
| Heading anchor SVG | `quartz/plugins/transformers/gfm.ts:41`             | **live**, 1,947 instances            |
| TOC chevron        | `quartz/components/TableOfContents.tsx:72`          | **live**                             |
| Search icon        | `quartz/components/Search.tsx:23`                   | mounted, hidden                      |
| Clipboard icons    | `quartz/components/scripts/clipboard.inline.ts:2,4` | **live**                             |
| Callout icons (13) | `quartz/styles/callouts.scss:22–34`                 | data-URI, unused by content          |
| `Darkmode.tsx`     | 2 SVG (sun/moon)                                    | **NOT MOUNTED — dead**               |
| `ReaderMode.tsx`   | 1 SVG                                               | **NOT MOUNTED — dead**               |
| `Explorer.tsx`     | 2 SVG (`.lucide-menu`, chevron)                     | **NOT MOUNTED — dead**               |
| `Graph.tsx`        | 1 SVG                                               | **NOT MOUNTED — dead**               |
| `og.tsx`           | 2 SVG                                               | OG-image emitter, **not registered** |
| Emoji map          | `quartz/util/emojimap.json`                         | base64 PNG emoji, unused             |
| Custom CSS glyph   | `.v6-nav__toggle-bars`                              | 2 borders, 1.5px, **no round caps**  |

No third-party icon library is installed. Icons come from Quartz's vendored
Lucide-derived set — **one upstream source**, which is why the sizes and weights
differ: they were never unified.

### A.3 Arrow inventory (Unicode text arrows)

| Style                 | Count            | Sizes                                                 | Where                                               |
| --------------------- | ---------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `→` plain span        | 15 on homepage   | 14.08–15.2px                                          | links, CTAs — one system ✅                         |
| `→` `.v6-link__arrow` | —                | 14.4px, `--v6-text-muted`, `translateX(2px)` on hover | V6                                                  |
| `→` CSS `content:`    | 2                | —                                                     | `custom.scss:2743`, `institutionalArticle.scss:487` |
| `↓` CSS `content:`    | 1                | —                                                     | `custom.scss:2082`                                  |
| `↗` external          | **0**            | —                                                     | not used                                            |
| Chevron               | via TOC SVG only | —                                                     | —                                                   |

All 15 homepage arrows are the same character, all `aria-hidden="true"`. **The
arrow system is already largely consistent** — one real inconsistency below.

### A.4 Favicon / site icons

| Asset                                        | Value                     | Assessment                    |
| -------------------------------------------- | ------------------------- | ----------------------------- |
| `favicon.ico`                                | 16/32/48, from `icon.png` | Threshold Mark                |
| `icon.png`                                   | 512 RGBA                  | Threshold Mark                |
| `icon-192` / `icon-512` / `apple-touch-icon` | manifest + Head           | Threshold Mark                |
| `og-image.png`                               | 1200×630                  | V6-native fallback (Phase 4A) |
| Residual old-brand assets                    | **none found**            | clean                         |

The favicon is **already the Threshold Mark** — a circle with an arch, which is
close to the brief's "very simple C / O geometric relation" goal. Geometry
measured: circle `r=48` in a 100 viewBox, arch `r=14`, horizon line, 3 elements.
It is monochrome and survives 16×16 (verified in Phase 4A). **It is not the old
complex logo.**

---

## B. Problems

Ordered by real visual impact, not by count.

### B1. Two different icon systems are live side by side — **high**

|                               | Heading anchor | TOC chevron     |
| ----------------------------- | -------------- | --------------- |
| Size                          | 18×18          | **24×24**       |
| stroke-width                  | 2              | 2               |
| Optical weight at same stroke | lighter        | **33% heavier** |

A 24px icon with `stroke-width: 2` renders a stroke 33% thicker than an 18px one
at the same nominal width. The TOC chevron is the single heaviest icon on the
site, and it sits in an article header where the typographic hierarchy is the
point.

### B2. Stroke weights do not match — **high**

Live values: **1.5** (search), **1.6** (clipboard), **2** (anchors, TOC).
The brief asks for ~1.5. Nothing in the repo enforces a value, which is why the
two "2" icons look heavier than the two "1.5" ones.

### B3. Icons bypass the V6 token system — **medium-high**

| Icon           | Colour source                      | Should be             |
| -------------- | ---------------------------------- | --------------------- |
| Heading anchor | `rgb(27,28,31)` hardcoded          | `--v6-text-primary`   |
| TOC chevron    | `#45484f`                          | `--v6-text-secondary` |
| Search         | `--darkgray` (legacy Quartz token) | `--v6-text-muted`     |

Three different colour origins for three icons. This is exactly the legacy-token
problem Phase 2/3 solved for article CSS, still open for icons.

### B4. Linecap language is inconsistent — **medium**

`round` for anchors/chevrons, **`square`** for the search magnifier, and the
CSS-drawn hamburger has **no caps at all** (border-based). The brief specifies
round.

### B5. Container chrome outweighs the icons — **medium**

- Search: 1px border + 2px radius **box around the word 搜索**
- Mobile menu: 1px border **44×44 box**

The brief says "default: no circle background, no obvious border". The boxes are
what read as heavy — not the glyphs.

### B6. Accessibility attributes are inconsistent — **medium**

| Element            | `role="img"` | `aria-hidden`            | `<title>` |
| ------------------ | ------------ | ------------------------ | --------- |
| Heading anchor SVG | ✗            | ✗ (parent `a` is hidden) | ✗         |
| TOC chevron        | ✗            | **✗**                    | ✗         |
| Search SVG         | ✓            | ✗                        | ✓         |

The heading anchor's parent carries `aria-hidden="true"` so it is genuinely
inert — but the **TOC chevron has nothing**, sitting inside a button whose
accessible name is `本文目录`. No practical harm today, but the pattern is
inconsistent and one refactor away from being announced.

### B7. Dead icon code inflates the inventory — **low impact, high confusion**

`Darkmode` (2 icons), `ReaderMode` (1), `Explorer` (2 + `.lucide-menu`),
`Graph` (1) are all **not mounted**. Anyone auditing icons — or a future agent —
will find them and assume they are live.

### B8. Arrow inconsistency — **low**

`→` reaches the DOM two ways: as a JSX `<span aria-hidden="true">→</span>` and as
CSS `content: "→"`. Visually identical; only a maintenance inconsistency. Font
sizes vary 14.08–15.2px across contexts. §六 asks for `↗` for external links —
**currently there are zero external-link indicators anywhere**, so external links
are indistinguishable from internal ones except by destination.

---

## C. Proposed System

### C.1 Governing rule

> Text carries meaning. Numbers carry structure. Arrows carry direction.
> **Icons carry operations only.**

No decorative icons. No icon where a number or a word already works.

### C.2 Allowed icon set

| Icon                   | Needed                                                          | Action                                     |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| Search                 | yes                                                             | keep, restyle                              |
| Menu (hamburger)       | yes                                                             | keep, restyle                              |
| Close                  | **currently none** — menu toggles by swapping `aria-label` only | **add or keep text-only** (see D)          |
| Chevron (TOC / expand) | yes                                                             | keep, restyle                              |
| Heading anchor         | yes                                                             | keep, restyle                              |
| Copy / copied          | yes                                                             | keep, restyle                              |
| External link `↗`      | not present                                                     | **propose adding as text glyph, not icon** |

**Nothing else gets an icon.** Explicitly rejected, per §五: no scales, buildings,
books, people, map pins, documents or shields — and the `01/02/03/04` numbering
and the region/legal-entity status text stay as they are.

### C.3 Unified specification

```
viewBox       0 0 24 24          (one grid for every icon)
rendered size 18×18 default
              20×20 for the mobile menu trigger at most
stroke-width  1.5
linecap       round
linejoin      round
fill          none
colour        currentColor only
gradients     none        shadows  none        textures  none
background    none        border   none        circle    none
```

Colour is supplied by the consuming context through V6 tokens
(`--v6-text-primary` / `--v6-text-secondary` / `--v6-text-muted`) — never
hardcoded, never a legacy Quartz token.

### C.4 Interaction states

- hover: colour shift to `--v6-text-primary` **and/or** opacity change
- no large circular hover background
- focus-visible: keep the existing V6 outline (must not be removed)
- no new animation

### C.5 Touch targets

Target stays 44×44 on mobile; the **glyph stays 18–20px** inside it. Click area
and visual size are decoupled.

### C.6 Arrow convention (adopt and document)

| Glyph         | Meaning                                  |
| ------------- | ---------------------------------------- |
| `→`           | continue reading / next level, same site |
| `←`           | back                                     |
| `↗`           | external website                         |
| `↓` / chevron | expand                                   |

Implemented as **one** mechanism — a small text span — not a mix of SVG, Unicode
and CSS `content`. Arrow weight must stay below the adjacent heading: it inherits
`--v6-text-muted` and stays at or below `0.95rem`.

---

## D. Files to Change

Scoped, and each item is independently revertable.

| #   | File                                             | Change                                                                                                                                                                                               | Risk                                                                 |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | `quartz/components/styles/v6Navigation.scss`     | search trigger: drop the bordered pill → text + muted colour, hover via colour/opacity; mobile menu box: drop the 1px border and 44×44 box → borderless 44×44 target with an 18–20px round-cap glyph | low                                                                  |
| 2   | `quartz/plugins/transformers/gfm.ts`             | anchor: `stroke-width` 2 → 1.5, keep 18×18, add `aria-hidden` for belt-and-braces                                                                                                                    | low — affects 1,947 instances, but visually a small weight reduction |
| 3   | `quartz/components/TableOfContents.tsx`          | chevron: 24×24 → 18×18, add `aria-hidden="true"`                                                                                                                                                     | low                                                                  |
| 4   | `quartz/components/styles/search.scss`           | search overlay icon: `square` → `round` cap, colour → V6 token                                                                                                                                       | low                                                                  |
| 5   | `quartz/components/scripts/clipboard.inline.ts`  | copy icons: align to 1.5 stroke, `currentColor`                                                                                                                                                      | low                                                                  |
| 6   | `quartz/components/styles/v6Navigation.scss`     | hamburger glyph: 1.5px CSS borders → same round-cap language                                                                                                                                         | low                                                                  |
| 7   | _(documentation)_ `PROJECT_RULES.md` or a report | record the icon spec + arrow convention                                                                                                                                                              | none                                                                 |

**Explicitly NOT changed:** homepage, article body, political-route content,
navigation IA, typography, colour palette, cards, spacing system, the `01–07`
numbering, region/legal-entity status text, the Threshold Mark, any favicon or
app icon, `og-image.png`, and no icon is added anywhere.

### Open question for your decision

**The Close state.** The menu currently has no close icon: opening swaps
`aria-label` to 关闭导航 and the same two bars stay. Options:

- **(i)** keep text/aria-only, no close icon — most restrained, zero new icons
- **(ii)** morph the two bars into an X on open (pure CSS, no new asset)
- **(iii)** add an X glyph

Recommendation: **(ii)** — it is honest feedback that the control toggled,
costs no new icon, and keeps one visual language.

---

## E. Visual Impact

| Change                            | Desktop                                                                                | Mobile                                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Search pill → borderless text     | Right edge loses a visible box; 搜索 reads as a quiet text action beside the nav links | The full-width bordered row in the drawer loses its box; becomes a text row with a top border only — consistent with the other drawer rows |
| Menu box → borderless             | n/a                                                                                    | The 44×44 square outline disappears; only the 2-bar glyph remains. Target stays 44×44, so no tap regression                                |
| Anchor 2 → 1.5                    | Slightly lighter link glyph beside every heading; **invisible until hover** anyway     | same                                                                                                                                       |
| Chevron 24 → 18                   | TOC header feels ~33% lighter; no longer competes with `本文目录`                      | same                                                                                                                                       |
| Search overlay cap square → round | Only visible when the overlay is open                                                  | same                                                                                                                                       |
| Clipboard align                   | Code-block buttons match the set                                                       | same                                                                                                                                       |

**Net effect:** the header and article chrome lose their boxy containers and the
remaining icons drop to one weight. The page should read as more typographic,
not as more decorated — which is the stated success criterion.

---

## Risk summary

| Risk                                       | Assessment                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| Layout shift from removing the logo        | none — already done and verified                                        |
| Layout shift from removing the search pill | none — `min-height` retained, only border/padding change                |
| 1,947 anchor instances                     | single shared SVG definition in `gfm.ts`; one edit, rebuild, spot-check |
| Dead-code icons                            | **not touched** in this round; recording them is a separate cleanup     |
| Icon added by mistake                      | none proposed                                                           |
| Frozen areas                               | none entered — no IA, palette, typography or content change             |

---

## Recommended execution order

1. Confirm the Close-state decision (i / ii / iii).
2. Implement D1–D6 in one branch `fix/icon-system-unification`.
3. QA 375/390/430/768/1024/1440 × light/dark, plus an article page for the
   anchor and chevron.
4. Full validation suite + duplicate scan.
5. PR → merge → deploy → production hash/screenshot verification.

Awaiting your confirmation of scope before any code is modified.
