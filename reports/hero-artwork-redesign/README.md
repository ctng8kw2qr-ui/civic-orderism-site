# Hero artwork redesign — THRESHOLD, in section

A production visual correction to the homepage Hero artwork. Not a phase, not a
redesign of the Hero: the copy, layout, grid and Current Phase are untouched.

Branch: `editorial/hero-artwork-redesign` · base `5399319`

---

## 1. The problem, measured

The previous artwork was a rectangular wall with a central arch and one
baseline. In the real Hero it produced three specific failures:

| Problem        | Evidence                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Literal**    | The first read is an architectural elevation — a **door** — rather than conceptual editorial artwork.                                                                                  |
| **Blocky**     | A single filled rectangle carries all the visual mass in one heavy block, against typography that is light, precise and publication-like. At 1440 it is 437×218px of mostly flat fill. |
| **Unfinished** | A very large area holding one rectangle, one opening and one line. That is not minimal; it is under-resolved.                                                                          |

## 2. What was kept

The concept never changed: **structure continues, the path changes.** The
structure is not destroyed — a crossing is opened in it. Wine stays reserved for
the continuity datum. Light/dark is still handled inside one SVG by
`prefers-color-scheme`.

## 3. Twelve candidates

All twelve were built and captured **in the real Hero**, not viewed as isolated
SVGs. Full sources in `candidates/`.

| #     | Candidate                         | Direction                                                  | Outcome                                                                     |
| ----- | --------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| —     | `BEFORE`                          | wall + arch + datum                                        | the thing being corrected                                                   |
| A     | Shifted Planes                    | 4 offset horizontal planes, lines stopping and resuming    | **rejected** — reads as rows of UI boxes                                    |
| B     | Continuous Passage                | dense left, opening, re-expanded right                     | **rejected** — reads as a funnel; the denser edges make it a diagram        |
| C     | Layered Threshold                 | 3 nested frames with misaligned openings                   | **rejected** — concept right, but much too sparse to be finished            |
| D     | Transition Band                   | full-width band, interrupted horizontal lines              | **rejected** — reads as stacked code / progress lines                       |
| E     | Field of Continuity               | continuous line field + registered interruptions           | **rejected** — cleaner than B, still diagrammatic and under-finished        |
| F     | Nested Openings                   | C made denser with heavier lines                           | **rejected** — became visually busy, a technical drawing                    |
| G     | Line field, refined               | E with a top/bottom registration band                      | **rejected** — sparse; fine lines cannot carry finished mass in a 437px box |
| H     | Section Field                     | stacked strata as filled bands                             | **rejected** — reads as a UI panel / bar chart                              |
| J     | Section + Gap                     | low mass that **stops**, leaving a gap, and resumes        | **strong** — has mass, no door; kept for refinement                         |
| K     | J refined                         | core tone added, arch removed entirely, theme tokens fixed | **rejected** — tonal contrast too weak; mass and core nearly identical      |
| **L** | **J refined, contrast corrected** | **deepened mass/core separation, wine edge registers**     | **SELECTED**                                                                |

### Why A–K failed, in one line each

The recurring trap was that **horizontal rectangles read as UI bars, and fine
lines read as unfinished.** The original avoided both because it had vertical
mass. L is the only candidate that keeps real mass while removing the door.

## 4. Final geometry

```
viewBox      0 0 1200 600  (2:1)
mass         x 40..1160,  y 130..430
upper core   y 130..246     — the system carries its weight at the top
opening      x 505..695, full height of the mass: a registered GAP
datum        y 430, x 0..1200 — wider than the mass, unbroken
crossing     continues past the mass, registered but unlabelled
```

There is **no facade, no arch and no door**. The mass simply stops and resumes.
No labels, no numerals, no Threshold Mark, no political imagery.

## 5. Line hierarchy — five distinct weights

| Role                              | Weight | Colour    |
| --------------------------------- | ------ | --------- |
| Primary structural edge           | 3.2    | `#1b1c1f` |
| Secondary strata                  | 2.0    | `#5b6169` |
| Hairline / registration           | 1.3    | `#c9c3b9` |
| Continuity datum + edge registers | 5.5    | `#7a2430` |
| Measured marks                    | 1.4    | `#b3ada3` |

Previously every line shared one weight, which is a large part of why the old
artwork read as a simple schematic.

## 6. Colour hierarchy

Mass `#e6e1d9` → core `#d5cfc5` → hatch `#cbc5bb` on a warm paper field. Wine
appears **only** as the datum and two edge registers — never as a fill.

Dark mode swaps to the V6 dark tokens (`#272a30` / `#33373f` / `#3f434a`, datum
`#d98b96`). Every surface that must match the page is painted from a theme
token: an earlier draft hardcoded the paper colour into the opening, which would
have been **wrong in dark mode** — caught and fixed before commit.

## 7. Footprint

The artwork fills the aside column. Measured share of the Hero area:

| width | before | after |
| ----- | ------ | ----- |
| 375   | 14.4%  | 14.4% |
| 390   | 15.7%  | 15.7% |
| 430   | 17.1%  | 17.1% |
| 768   | 29.0%  | 29.0% |
| 1024  | 34.2%  | 34.2% |
| 1440  | 11.5%  | 11.5% |

**No sizing change was made, and that is a measurement, not an omission.** A
desktop `max-width: none` was tried and reverted: at 1440 the artwork is already
capped by the Hero grid column, so it was a **no-op at every width**. Widening
further would have meant editing the Hero grid, which is out of scope. The SCSS
is therefore **byte-identical to `main`** — this change is the artwork alone.

## 8. Before / after

`qa/BEFORE-*` and `qa/AFTER-*`, at 390 / 1024 / 1440, light and dark, plus the
full responsive set for AFTER (375 / 390 / 430 / 768 / 1024 / 1440, both themes).

At 1440 the H1 remains the first hierarchy, the artwork second, Current Phase
third. The artwork gains mass and finish without gaining contrast against the
headline.

## 9. Mobile

At 390 the artwork is 319×159 and still reads: the mass, the gap, the strata and
the datum all survive. It was rendered at actual size and inspected rather than
assumed — fine detail does compress at that scale, which is why the hatch was
lightened and the mark count kept low.

## 10. Identity test

Side by side with the Threshold Mark, the flagship cover and the OG fallback:
the new Hero shares the warm neutral surface, the wine datum, the measured
hairline register and the institutional restraint, and now sits closer to the
cover's **sectional** register than the old door did. It reads as the same
institution, and no baseline identity asset was modified.

## 11. Validation

| Command                               | Result                             |
| ------------------------------------- | ---------------------------------- |
| `npm run build`                       | pass — 535 files, 0 sync artifacts |
| `npx tsc --noEmit`                    | pass                               |
| `npm run validate:v2`                 | pass — 103 / 9 / 20 / 13           |
| `npm run validate:content-safety`     | pass                               |
| `npm run validate:article-typography` | pass                               |
| `npm run check:links`                 | pass — 21,035 links / 488 pages    |
| Prettier                              | 187 — unchanged from baseline      |

Zero-diff confirmation: content, article component, cover util, editorial
assets, navigation, brand assets, manifest, Hero SCSS and layout are all
**unchanged**. The only production change is
`quartz/static/assets/v6/hero/hero-threshold.svg`.
