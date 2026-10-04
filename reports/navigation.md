# Navigation

How this site's navigation is put together, and the rules that keep it that way.

---

## 1. The three jobs — never merge them

Each answers exactly one question. Merging them produces a page that is trying
to be a menu, a reading list and a location indicator at the same time.

| Element           | Question (zh)    | Question (en)             |
| ----------------- | ---------------- | ------------------------- |
| **Section Index** | 这里有什么。     | What is here?             |
| **Reading Map**   | 我应该先读什么。 | What should I read first? |
| **Breadcrumb**    | 我现在在哪里。   | Where am I?               |

Consequences of the separation:

- The **Section Index** lists every section of a part of the site. It is a
  structure listing, not a recommendation, and it must not be ordered by
  suggested reading sequence.
- The **Reading Map** recommends an order. It must not try to enumerate the
  whole site, and it must not be used as the site's structural index.
- A **Breadcrumb** shows position in the hierarchy only. It must not carry
  recommendations or act as a secondary menu.

**Never put a section list and a reading order in the same component.**

---

## 2. Levels

| Level | What it is                                                          | Where it lives              |
| ----- | ------------------------------------------------------------------- | --------------------------- |
| 1     | Global navigation — 首页 / 研究 / 政治路线 / 组织建设 / 关于 + 搜索 | Header, on every page       |
| 2     | Section index — what a part of the site contains                    | On that part's landing page |
| 3     | The content itself — articles, studies, documents                   | Breadcrumb + TOC            |

**Level 2 does not live in the header.** The header stays a simple row: no
dropdown, no mega menu, no hover panel. A reader who wants to know what is
inside 研究 goes to the 研究 landing page, which is what the Section Index there
is for.

Level 3 pages do not add another menu level. They use:

- **Breadcrumb** — where the page sits
- **TOC** — where the reader is inside the page

These are different jobs and must not be confused.

---

## 3. Header spacing

Spacing is defined once, in `quartz/styles/v6/_tokens.scss`, so adding a menu
item later cannot silently re-create a crowded header.

| Token                   | Value | Meaning                                      |
| ----------------------- | ----- | -------------------------------------------- |
| `--v6-nav-hit-pad-x`    | 14px  | Invisible clickable padding inside each item |
| `--v6-nav-item-gap`     | 16px  | Clear space between adjacent **hit boxes**   |
| `--v6-nav-link-h`       | 40px  | Header hit-box height                        |
| `--v6-nav-mobile-row`   | 52px  | Drawer row floor (rendered rows run taller)  |
| `--v6-nav-focus-offset` | 1px   | Keeps two adjacent focus rings from meeting  |

**Visual distance is not the same as click safety.** These are hit-box
measurements. The visible gap between two labels is
`14 + 16 + 14 = 44px`, while the clickable areas are separated by 16px.

Why 16px and not 2.4px, which is what the header used before: at 2.4px the
neighbouring hit boxes were effectively touching and the focus ring physically
overlapped the item beside it. Verified after the change: no ring overlap at any
width, no wrapping, no horizontal overflow down to the desktop/mobile breakpoint.

The header must not be turned into a row of buttons to buy this spacing. The
targets stay invisible; only the labels are drawn.

---

## 4. Adding a section to 研究

1. Add its slug to `researchSlugs` in `quartz/components/PrimaryNavigation.tsx`
   so the header keeps 研究 active on its pages.
2. Add an entry to the Section Index on the 研究 landing page — numeral, Chinese
   title, English eyebrow, one line of description.
3. The English eyebrow is a **navigation label**, not the page's own title. Do
   not rename the page to match it.

A section that is not in the Section Index is, for a first-time reader,
invisible.

---

## 5. What the header must never do

- No dropdown, mega menu, floating panel or hover navigation
- No card, no background block, no pill on a nav item
- No per-level colour coding
- No icon added to a nav item

The header stays quiet, clear and roomy. If a change makes it louder, it is the
wrong change regardless of how much information it adds.
