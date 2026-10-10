# Clipboard button — accessibility fix

Baseline: production `0d44957`. Scope: the clipboard button only.

## What was wrong

The reported issue was `&:focus { outline: 0 }`. Inspection found **four**
defects, and the missing focus ring was only the visible one.

| #   | Defect                                                  | Consequence                                                                                                                                      |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `&:focus { outline: 0 }`                                | No keyboard focus feedback at all                                                                                                                |
| 2   | The button is `opacity: 0` until `pre:hover`            | A keyboard user tabbed to an **invisible** control — a ring alone would still have been invisible                                                |
| 3   | `& > svg { fill: var(--light); filter: contrast(0.3) }` | Overrode the icon's own `fill="none"` and repainted the outlined copy glyph as a **solid grey block**; the contrast filter washed it out further |
| 4   | `button.blur()` in the click handler                    | Discarded keyboard focus on activation                                                                                                           |

Also: `border-radius: 5px` sat outside the V6 radius scale, and every colour came
from the legacy Quartz tokens (`--gray`, `--dark`, `--light`, `--secondary`),
which are cool-toned and do not follow V6 — measured `rgb(247,248,250)` in light
and `rgb(11,15,22)` in dark.

Defect 3 is worth noting: the outlined icon shipped in PR #18 was being defeated
by this rule the whole time. It went unnoticed because **no page on the site
contains a code block**, so the path is unexercised.

## What changed

**`clipboard.scss`** — `&:focus { outline: 0 }` removed; an explicit
`:focus-visible` ring added; `pre:focus-within > .clipboard-button { opacity: 1 }`
so the control actually appears for keyboard users; the `svg` `fill`/`filter`
overrides removed; colours moved to V6 tokens; radius to `--v6-radius-md`;
transition to the V6 duration and easing, with a `prefers-reduced-motion` guard.

**`clipboard.inline.ts`** — `button.blur()` removed; the `aria-label` swaps to
`Copied` during the success state and back; the dead `borderColor` reset dropped;
the success mark redrawn as an **outline** check (still its own green) so it can
no longer be repainted by a stray `fill`.

## The container was kept, deliberately

The brief asked whether the border and radius should go. They stay. This is a
floating action over code with no other affordance, so a bordered chip is what
makes it discoverable; the container is **functional, not decorative**. It was
lowered in visual weight rather than removed — V6 tokens, 3px radius, and a
surface that reads as a quiet chip against the page.

## Verified

|                          | light                                             | dark                                        |
| ------------------------ | ------------------------------------------------- | ------------------------------------------- |
| Size                     | 34×34                                             | 34×34                                       |
| Container                | `rgb(243,240,235)` · 1px `rgb(224,220,213)` · 3px | `rgb(16,17,20)` · 1px `rgb(44,47,53)` · 3px |
| Icon fill / filter       | `none` / `none`                                   | `none` / `none`                             |
| Focus ring               | **2px `#7a2430`**, offset 2px                     | **2px `#d98b96`**, offset 2px               |
| Opacity on focus         | **1**                                             | **1**                                       |
| `aria-label` after Enter | `Copied`, focus retained                          | `Copied`, focus retained                    |
| Success icon             | green outline check                               | green outline check                         |
| `prefers-reduced-motion` | transition removed                                | same                                        |

Both focus colours are the V6 `--v6-focus` token for their scheme.

Keyboard: Tab reaches the button, the ring appears, Enter activates it, focus is
retained, and the label reports the new state.

## Testing note

The site has no code blocks, so verification used a **temporary build-only
fixture** (`content/_clip-fixture.md`), removed before commit. No production
content was added.

The clipboard write itself cannot succeed under headless Chrome on
`http://127.0.0.1` — the async clipboard API requires a secure context — so the
success state was additionally forced in the DOM to capture its appearance. The
state logic itself is unchanged apart from the label swap and the removed
`blur()`.

## Known limitation, recorded not fixed

The button is 34×34, below the 44×44 touch-target guideline, and it appears only
on hover or focus. Growing it to 44×44 would add roughly 30% more visual weight
to an overlay chip, so it was left as a measured tradeoff rather than changed
silently. Worth revisiting if a touch device ever needs to copy code.
