# Icon System

The single specification for icons on this site. Applies to every future icon,
in any component.

The governing rule, from `PROJECT_RULES.md` §11:

> **Text carries meaning. Numbers carry structure. Arrows carry direction.
> Icons carry operations only.**

The success criterion is that a reader never notices the icons — only that the
site feels ordered. An icon added "for visual richness" is a regression.

---

## 1. The permitted set

Only these five, and only where the operation genuinely exists:

| Icon           | Where                      | Notes                             |
| -------------- | -------------------------- | --------------------------------- |
| Search         | search triggers            | magnifier                         |
| Menu           | mobile drawer trigger      | two bars                          |
| Close          | mobile drawer, open state  | an X — the same two bars rotated  |
| Chevron        | collapsible sections (TOC) | expand / collapse                 |
| Copy           | code blocks                | plus a check for the copied state |
| Heading anchor | heading `#` links          | decorative, hover-only            |

**Nothing else gets an icon.** Explicitly rejected, because the site already
expresses these with words or numbers: scales, buildings, books, people, map
pins, documents, shields, flags, badges. The homepage's `01 / 02 / 03`
numbering stays numbering — it must not become iconography. Region and
legal-entity status text (法人筹备中, 董事会尚未产生) stays text.

## 2. Drawing specification

```
viewBox         0 0 24 24        one grid, always
rendered size   18×18            default
                16×16            only inside a dense control (code blocks)
                20×20            hard ceiling, e.g. the mobile menu trigger
stroke-width    1.5
linecap         round
linejoin        round
fill            none             (except a deliberate solid state mark)
colour          currentColor      always
```

Never: gradients, shadows, textures, filters, filled blocks as the default
treatment, decorative backgrounds, circles behind icons, or borders around them.

### Why these numbers

`stroke-width` is specified against the **rendered** size, not the viewBox. A
24px icon at `stroke-width: 2` draws a stroke about a third heavier than an 18px
icon at the same nominal width — that mismatch was the original inconsistency on
this site. Keeping one grid and one size keeps optical weight constant.

## 3. Colour

Icons take `currentColor` and are coloured by their **container**, from V6
tokens only:

| Context                                  | Token                 |
| ---------------------------------------- | --------------------- |
| Default / primary action                 | `--v6-text-primary`   |
| Secondary, e.g. an icon beside body text | `--v6-text-secondary` |
| Quiet, e.g. an icon in a chrome row      | `--v6-text-muted`     |

Legacy Quartz theme tokens (`--dark`, `--gray`, `--darkgray`, `--lightgray`,
`--secondary`) must **not** be used for icons. Hardcoded hex values must not
appear in an icon definition.

## 4. Interaction

- hover: colour shift and/or opacity. **No large circular background.**
- focus-visible: keep the existing V6 outline. Never remove focus styling for
  visual minimalism.
- animation: short and restrained. A state change must be legible **without**
  the animation — under `prefers-reduced-motion: reduce`, remove the transition,
  never the state.
- no new decorative motion.

## 5. Touch targets

Touch target and glyph size are **decoupled**:

|                     | Size        |
| ------------------- | ----------- |
| Tap target (mobile) | **≥ 44×44** |
| Visible glyph       | 18–20px     |

A 44×44 button contains an 18px glyph. The button carries no border, radius or
background; the enlarged hit area is invisible.

## 6. Accessibility

- **Functional icon alone** → the control needs `aria-label`
  (e.g. `打开搜索`, `打开导航` / `关闭导航`). The icon itself is
  `aria-hidden="true"`.
- **Decorative icon** → `aria-hidden="true"` and `focusable="false"`.
- **Never** rely on an icon to carry meaning that only sighted users receive.
- State changes announced through attributes, not through the drawing — the
  menu's `aria-expanded` and its label change are what convey open/closed.

## 7. Arrow semantics

One character per meaning, in text, not as an icon:

| Glyph          | Meaning                                    |
| -------------- | ------------------------------------------ |
| `→`            | continue reading / next level, same site   |
| `←`            | back                                       |
| `↗`            | **external** website — reserved, see below |
| `↓` or chevron | expand                                     |

Arrows are `aria-hidden="true"` (the link text carries the meaning), inherit
`--v6-text-muted`, and stay at or below `0.95rem` so they never outweigh the
adjacent heading.

**`↗` is specified but deliberately not deployed.** This is a reading- and
institution-oriented site; marking every external link would add visual noise
for little benefit. Introduce it locally only where it genuinely helps — a
sources list, a policy document, an external PDF — and never by sweeping the
whole site.

## 8. Known residue (not yet unified)

Recorded rather than silently carried. None of these is a live visual
inconsistency; they are maintenance items.

| Item                               | Note                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow _implementation_ is mixed    | `→` reaches the DOM both as a JSX `<span>` and as CSS `content: "→"`. Visually identical; unifying the mechanism is implementation purity, not a visual fix.                                |
| Arrow font sizes vary 14.08–15.2px | Within the "below heading weight" intent, but not on one value.                                                                                                                             |
| `.clipboard-button` chrome         | Still carries a 1px border, 5px radius and a legacy-token colour, and removes its own focus outline (`&:focus { outline: 0 }`). This is a real accessibility gap and the obvious next item. |
| Dead icon code                     | `Darkmode` (2 icons), `ReaderMode` (1), `Explorer` (2 + `.lucide-menu`), `Graph` (1) are **not mounted** in `quartz.layout.ts`. They inflate the icon inventory and mislead audits.         |
| Callout icons (13)                 | Data-URI Lua/Lucide icons in `quartz/styles/callouts.scss`, not currently used by content.                                                                                                  |
| `emojimap.json`                    | Base64 PNG emoji, unused.                                                                                                                                                                   |

## 9. Adding a new icon — checklist

- [ ] It is an **operation**, not decoration
- [ ] No existing word, number or arrow already does the job
- [ ] `viewBox 0 0 24 24`, 18px, `stroke-width 1.5`, round caps and joins, `fill: none`
- [ ] `currentColor`; coloured from a V6 token, never a legacy token or a hex
- [ ] `aria-hidden` plus `focusable="false"`, or an `aria-label` on the control
- [ ] Tap target ≥ 44×44 with a 18–20px glyph
- [ ] State legible with animation disabled
- [ ] Verified at 1× and 2× — 1.5px must stay crisp, not grey
