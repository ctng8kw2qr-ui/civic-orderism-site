# Technical Debt

Engineering state of the repository, classified. Operating rules live in
[`PROJECT_RULES.md`](PROJECT_RULES.md).

Each item records how it was verified, so a future pass does not have to
re-discover it.

## Definitions

These definitions exist to stop this file growing without limit. Apply them
before adding anything.

| Term                  | Meaning                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| **Technical debt**    | An existing engineering state with a **defined future repayment action**.      |
| **Known constraint**  | Understood and **deliberately accepted**; no repayment currently required.     |
| **Future capability** | Not yet built, and there is **no current business need** — therefore not debt. |

Nothing in this file was introduced by the V6 phases, and nothing here is fixed
by them.

---

# A. Active Technical Debt

Existing state, with a defined repayment action, that does not currently block
production.

## A1. Legacy `logo.png` and its PDF tooling consumers

**Status:** carried deliberately. Do not delete.

`quartz/static/logo.png` is **782.2 KB** (1254 × 1254). It predates V6, uses the
old navy palette (`#102549`), and is **not** part of the V6 brand identity — the
site's identity is the Icon Mark (`brand/icon-mark.svg`) plus a typographic
wordmark.

**It still has real consumers** (verified — this is why it was not removed):

| Consumer                                          | Detail                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `scripts/generate-introduction-manual-pdf.cjs:11` | Registered npm script `generate:introduction-manual-pdf`; embeds the logo into the manual PDF |
| `scripts/generate-founding-board-brief-pdf.py:33` | Build tooling (not registered in `package.json`)                                              |
| `scripts/validate-v2-architecture.mjs:796`        | Asserts `public/static/logo.png` exists as a build artifact                                   |

Note: `quartz/components/PageTitle.tsx` also references it, but that component
is **never mounted** in `quartz.layout.ts` — it is genuinely dead. Do not mount
it merely to justify keeping the file.

**Repayment action** — a dedicated migration task, not a side effect:

1. Author the Full Lockup as **SVG**.
2. Migrate the introduction manual generator.
3. Migrate the founding board brief generator.
4. Update the validator assertion.
5. Verify the generated PDFs.
6. Retire the legacy 782 KB raster.

**Do not start this migration on its own account.** It should be triggered by a
real need to update the Introduction Manual, the Founding Board Brief, or
another formal PDF.

---

## A2. Workspace file-sync hazards

**Status:** environmental, not a repo defect — but it has silently produced
misleading results repeatedly.

The workspace lives under a synced folder. Observed symptoms:

- Duplicate files with `" 2"` / `" 3"` suffixes, including inside `public/` and
  in `reports/`. Ten such files were committed accidentally during Phase 4B and
  had to be removed in a follow-up commit.
- `public/` losing article files entirely, with sibling directories such as
  `china 3/` appearing. A request for an article returned "Error response",
  which initially looked like a code regression.

**Repayment action:** none available — it is a property of the environment.
Mitigation is procedural and is enforced in
[`PROJECT_RULES.md` §12](PROJECT_RULES.md): run the duplicate scan before every
merge, and on unexplained build breakage run `rm -rf public && npm run build`
before suspecting code.

---

## A3. Prettier formatting debt

**Status:** present on `main`.

`npm run check` runs `tsc --noEmit && prettier . --check`. The Prettier half
fails: **187 offending files**, measured on the current baseline.

Historical readings: ~189 on `main` before V6; ~188 after Phase 2; 187 on the
current baseline. The V6 work itself was Prettier-clean — every phase recorded
"0 new offenders".

**Current policy: do not fix opportunistically.** A repo-wide
`prettier --write` would produce a very large diff touching unrelated files and
obscure review. It should be its own isolated, no-behaviour-change commit, and
only when no other work is in flight — or incrementally, as files are touched
for other reasons.

**Repayment action:** a dedicated `maintenance/` formatting task, or incidental
cleanup of files already being edited.

---

## A4. Legacy landing-page CSS / token layer

**Status:** partially addressed by Phase 2; deliberately not fully removed.

Three token layers used to coexist: `--v6-*` (the V6 system), `--inst-*` (a
separate institutional palette in `custom.scss`), and legacy Quartz theme tokens
(`--dark`, `--gray`, `--secondary`, …) set from `quartz.config.ts`.

Phase 2 resolved the **article** side by aliasing both legacy families onto V6
tokens, scoped to `body[data-page-kind="article"]`. The article system was not
rewritten.

**Still outstanding:** the `inst4-*` / `inst4l-*` landing-page CSS in
`custom.scss` (~11k lines) and the `--inst-*` definitions that now have no
consumer inside article scope.

**Repayment action:** retire the legacy landing-page layer **section by
section**, the way the homepage was migrated — not in one sweep. A full
replacement of `custom.scss` with V6 tokens is a real maintenance task, not a
side effect.

## A5. Two sources for `favicon.ico`

**Status:** harmless today; deliberately not resolved during the icon-mark
change.

Two emitters write `public/favicon.ico`, and the later one silently wins:

| Step                        | Source                                        | Output               |
| --------------------------- | --------------------------------------------- | -------------------- |
| `Plugin.Favicon()`          | `quartz/static/icon.png`, resized to 48px PNG | `public/favicon.ico` |
| `RootStatic()` (runs after) | committed `quartz/static/favicon.ico`         | overwrites the above |

Verified: `public/favicon.ico` is byte-identical to the committed three-frame
ICO, so the 48px PNG from the emitter never ships. Both paths currently read the
same mark, so the outcome is correct — but the emitter's work is dead, and a
future change to `icon.png` alone would silently do nothing.

**Repayment action:** drop `favicon.ico` from either `RootStatic`'s
`rootStaticFiles` list or the `Favicon` plugin, and keep one documented source
of truth. Low risk, small change, but out of scope for a brand-documentation
pass.

## A6. OG fallback still draws the historical Threshold Mark

**Status:** known divergence, deferred deliberately.

The Civic Orderism mark is now `brand/icon-mark.svg` (three blocks, `#435B63`).
`social/og-fallback.svg` still draws the historical Threshold Mark — circle,
arch and horizon in wine `#7a2430` — and its own comment now says so.

It was left alone when the icon mark landed because that change was scoped to the
browser, bookmark and home-screen icons. Changing social card art is a visible
brand change and needs its own decision, not a side effect.

**Repayment action:** redraw `og-fallback.svg` from `brand/icon-mark.svg` at the
same 60/100 scale, or confirm that the OG fallback intentionally keeps the
historical mark. Either way, decide it explicitly.

---

# B. Known Constraints / Deliberate Decisions

Understood, accepted, and **not requiring repayment**. These are not debt.

## B1. Article column width is `!important`-locked

`quartz/styles/custom.scss` locks the article reading column at 780px with
`!important`. It cannot be widened through normal cascade rules.

Phase 2 respected the existing width and achieved cohesion through the token
system instead. Widening would require deciding what to do with the empty 232px
left rail and the 272px right TOC rail — a layout-shell task.

**Accepted.** Revisit only if a wider article composition is ever actually
wanted, and then as a deliberate layout task.

## B2. `satori` / `sharp` / OG-image emitter available but not enabled

`quartz/plugins/emitters/ogImage.tsx` exists (Satori + sharp, 1200 × 630) but is
**not registered**. Investigated in Phase 3 and found **not viable as
configured**:

1. `quartz.config.ts` sets `fontOrigin: "local"` and typography to `system-ui`.
2. Fetching a Google font named `system-ui` returns **HTTP 400** (measured).
3. Failed fetches are filtered out, leaving satori an **empty font array**.
4. There is **no CJK font** in the pipeline, so Chinese titles would render as
   tofu.
5. Making it work needs multi-MB CJK subsets, a `fontOrigin` change and added
   build time for 103 pages.

**Accepted.** `og:image` already has real precedence: article `cover` (absolute
URL) with a branded fallback. Articles with a cover get a distinct social
preview without code generation.

**Precondition if ever revisited:** solve a reliable offline CJK font pipeline
first (self-hosted subset, no network fetch at build time).

## B3. Known cosmetic repetition in the article system

`ArticleReadingEnhancements.tsx` renders several distinct recommendation regions
(继续阅读, 知识关联, 系列导航, CTA, Reading Footer). Phase 2 aligned their styling
but deliberately merged and deleted nothing.

**Accepted as an editorial question, not a styling one.** Revisit only after
article screenshots have been reviewed editorially, to decide whether any region
is redundant for a reader arriving from social.

## B4. Hero artwork is hand-authored, not generated from a design system

`quartz/static/assets/v6/hero/hero-threshold.svg` is the Phase 4B Hero artwork
and is **frozen production artwork** — see `PROJECT_RULES.md` §1–2. It is
hand-authored SVG, not generated and not stock.

Phase 4B also retired the CSS-mask rendering model: a mask collapses any drawing
into a single-colour alpha stencil, so it could not carry a multi-weight artwork.
The Hero is now a direct-rendered `<img>` whose SVG themes itself via
`prefers-color-scheme`, so one asset serves both themes with no filter, no
invert and no second file. Swapping the Hero remains a one-file change.

**Accepted.** There is no current need for a broader design system. Do not fill
the slot with stock or AI-generated imagery.

## B5. `temp_images/` — minor repository residue

`git ls-files temp_images/` → `temp_images/.keep`, a **0-byte placeholder**. The
directory holds nothing else and is referenced by no script, config or workflow
(verified). It is not in `.gitignore`.

**Accepted as residue, not debt.** Removing it is a one-line commit, but there is
no reason to spend a task on it. Leave it unless a dedicated cleanup task decides
otherwise.

---

# C. Future Capabilities — NOT Technical Debt

Not yet built, with **no current business need**. They must not be described as
debt, and must not be built in advance of a real requirement.

| Capability                         | Trigger                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| **Tier 2 series covers**           | A column reaching real content scale                                                       |
| **Independent social composition** | Social distribution becoming a real operational need that the editorial cover cannot serve |
| **Further Tier 1 artwork**         | Individual articles becoming important enough to warrant it                                |
| **A formal publication system**    | A real publishing requirement emerging                                                     |

See `PROJECT_RULES.md` §9 for the Tier 1 / 2 / 3 artwork rules. Tier 3 (no
cover) is a **designed state**, not a gap.
