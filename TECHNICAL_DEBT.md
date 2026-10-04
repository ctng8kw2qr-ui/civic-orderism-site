# Technical Debt

Verified inventory of pre-existing issues. Compiled during V6 Phase 2
(July 2026) so they are recorded rather than silently carried. **Nothing in
this file was introduced by V6, and nothing here is fixed by V6** — Phase 2
deliberately stayed inside its scope.

Each item lists how it was verified, so a future pass does not have to
re-discover it.

---

## 1. Prettier violations across the repo

**Status:** present on `main`, unchanged by V6.

`npm run check` runs `tsc --noEmit && prettier . --check`. The Prettier half
fails. The count is around **189 files** on `main` and around **188** after
Phase 2 (the relocation of the hero SVG changed one file's status; Phase 2
adds no new offenders — verified with `npx prettier . --check`).

The V6 work is Prettier-clean: every file it adds or edits passes
`prettier --check`. Phase 1 and Phase 2 both recorded "0 new offenders".

**Why not fixed:** a repo-wide `prettier --write` would create a very large
diff touching unrelated files and obscure review. It should be done as its
own isolated, no-behaviour-change commit once no feature branches are open.

---

## 2. Article column width is `!important`-locked

**Status:** present on `main`. Deliberately worked _around_, not changed.

`quartz/styles/custom.scss:11121`

```scss
body[data-page-kind="article"] .page > #quartz-body .center {
  flex: 0 1 780px !important;
  min-width: 0 !important;
  max-width: 780px !important;
}
```

The article reading column cannot be widened with normal cascade rules.
Phase 2 initially attempted to give the article header a wider editorial band
and discovered this is a no-op: a child cannot exceed its parent.

Because overriding it requires more `!important` and a real layout
restructure (and a decision about the 232px left rail — which is **empty** on
article pages — and the 272px right TOC rail), Phase 2 respected the existing
width and achieved cohesion through the token system instead.

**Follow-up:** if a wider article composition is ever wanted, do it as a
layout-shell task: decide the rails, then change this rule once, cleanly.

---

## 3. `temp_images/` is a tracked empty directory

**Status:** present on `main`.

`git ls-files temp_images/` → `temp_images/.keep`. An abandoned image-prep
workflow; the directory holds nothing else.

**Note:** removing it is a one-line commit. It is referenced by no script,
config, or workflow (verified).

---

## 4. Stale build residue in `public/` (not a source problem)

**Status:** self-resolving; recorded for accuracy.

An earlier audit during Phase 1 found 28 files with a ` 2` suffix in
`public/` (e.g. `about 2.html`, `icon-192 2.png`). A subsequent `npm run build`
removed them: `public/` is wiped and regenerated each build
("Cleaned output directory"), and `git ls-files | grep ' 2\.'` is empty —
none of them are tracked.

**Conclusion:** this was residue from some older build/sync, not a source
tree problem. No action needed; it will not recur from a clean build.

---

## 5. Two legacy CSS/token systems still coexist

**Status:** partially addressed by Phase 2; deliberately not fully removed.

Before Phase 2 the site had three token layers:

1. `--v6-*` — the V6 semantic design system (`quartz/styles/v6/_tokens.scss`).
2. `--inst-*` — a separate institutional palette defined in `custom.scss`.
3. Legacy Quartz theme tokens (`--dark`, `--gray`, `--lightgray`,
   `--secondary`, …) set from `quartz.config.ts`.

Phase 2 resolved the _article_ side of this by aliasing both legacy families
onto V6 tokens, scoped to `body[data-page-kind="article"]`
(`quartz/styles/v6/_article.scss`). The article system itself was not
rewritten.

**Still outstanding:** the remaining `inst4-*` / `inst4l-*` landing-page CSS
in `custom.scss` (~11k lines) and the `--inst-*` definitions that now have no
consumer inside article scope. `custom.scss` also still targets
`article { max-width: 780px }` at line 1360, which is dead for article pages
(`.article-page` overrides it) but applies to non-article `<article>` elements.

**Follow-up:** retire the legacy landing-page layer page by page, the way the
homepage was done, rather than in one sweep.

---

## 6. Hero artwork is hand-authored and not yet from a design system

**Status:** resolved for Phase 4B; revisited when a design system exists.

`quartz/static/assets/v6/hero/hero-threshold.svg` is the Phase 4B Hero
artwork: a structural boundary with one passage opened through it and a datum
running unbroken across the full width. It is hand-authored SVG, not generated
and not stock.

Phase 4B also **retired the CSS-mask rendering model** (see `assets/v6/SPEC.md`
§2). A mask collapses any drawing into a single-colour alpha stencil, so it
could not carry a multi-weight artwork. The Hero is now a direct-rendered
`<img>` of the SVG, which themes itself through `prefers-color-scheme` — V6
keeps that in sync with `saved-theme`, so one asset serves both themes with no
filter, no invert and no second file.

Swapping the Hero remains a one-file change.

**Follow-up:** when a fuller visual system exists, the Hero artwork should be
redrawn from it. Do not fill the slot with stock or AI-generated imagery.

---

## 7. `satori` / `sharp` / OG-image emitter are available but unused

**Status:** present, deliberately left disabled.

`quartz/plugins/emitters/ogImage.tsx` exists (Satori + sharp, 1200×630
programmatic social images) but is **not registered** in `quartz.config.ts`.
`sharp` is a dependency already used by the favicon emitter.

This means the project could generate branded OG images and editorial covers
programmatically from each article's title/description, with no manual
artwork. V6 Phase 2 was explicitly scoped **not** to enable it.

**Phase 3 finding — programmatic OG is NOT viable in this project as configured.**
Investigated and deliberately left disabled. Evidence:

1. `quartz.config.ts` sets `fontOrigin: "local"` and `typography.header/body`
   to `"system-ui"`.
2. `getSatoriFonts()` fetches TTFs from Google Fonts by font name. A request
   for `family=system-ui` returns **HTTP 400** (measured).
3. Failed font fetches are dropped by `.filter(font => font !== null)`, so
   satori would receive an **empty font array**.
4. Even with fonts resolved, there is **no CJK font** in the pipeline at all,
   so Chinese article titles would render as tofu boxes.
5. Making it work would require shipping multi-MB CJK subsets, changing
   `fontOrigin`, and adding build time for 103 pages — contrary to the
   project's minimal-change, local-font principles.

**Resolution:** `og:image` now has real precedence (Phase 3) —
article `cover` (absolute URL) with a single branded `og-image.png` fallback.
No programmatic generation.

**Future precondition:** if programmatic OG is ever wanted, it must FIRST
solve a reliable offline CJK font pipeline (self-hosted subset, no network
fetch at build time). Do not enable `CustomOgImages` before that exists.

**Also note:** articles now have distinct social previews _when they define a
cover_, so the practical gap is closed without code generation.

---

## 9. Build output directory is vulnerable to file-sync corruption

**Status:** environmental, not a repo defect — but it silently produced
misleading test results twice.

The workspace lives under `~/Documents`, which is being synced. During Phase 1
this surfaced as 28 ` 2`-suffixed files in `public/`. During Phase 3 it was
worse: after one build, `public/china/` was **missing every article file** and
sibling directories like `public/china 3/` appeared. A dev-server request for
`/china/ccp-2018-xi-era-local-growth-space.html` returned "Error response",
which initially looked like a regression in the Phase 3 work.

A clean `rm -rf public && npm run build` produced a correct 533-file output
with zero ` 2`/` 3` artifacts, and every validator passed.

**Follow-up:** if unexplained missing/duplicated build output recurs, rebuild
clean and/or move the checkout outside a synced folder before investigating
code. Do not attribute it to the most recent commit.

---

## 8. Known cosmetic duplication in the article system

**Status:** present; not changed (Phase 2 was restricted to visual alignment).

`ArticleReadingEnhancements.tsx` (984 lines) renders several distinct
recommendation regions — 继续阅读, 知识关联, 系列导航, CTA, Reading Footer.
Phase 2 aligned their styling but **did not** delete or merge any module, by
explicit instruction.

**Follow-up:** once article screenshots have been reviewed editorially, decide
whether any of these regions are redundant for a reader arriving from social.
That is an editorial decision, not a styling one.
