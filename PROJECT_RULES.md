# Civic Orderism Website — Production Operating Rules

**Status:** V6 Phase 1–4B = **FROZEN PRODUCTION BASELINE** (`main` @ `b249baa`)

**Operating principle: NEED-DRIVEN, NOT DESIGN-DRIVEN.**

Frozen does **not** mean the site can never change. It means every change must be
driven by a real **content**, **organization**, **feature**, **bugfix** or
**maintenance** need. _"Continue improving V6"_ is not by itself a reason to
change anything.

This file is the operating baseline for future agents, developers,
collaborators and maintainers. It is deliberately short enough to actually be
read. It is not a phase report, a design manifesto or a development log.

Related: [`TECHNICAL_DEBT.md`](TECHNICAL_DEBT.md) — engineering state, classified
into active debt / known constraints / future capabilities ·
[`quartz/static/assets/v6/SPEC.md`](quartz/static/assets/v6/SPEC.md) — asset spec

---

## 1. Baseline

The following are the shipped, verified production baseline. Do not refactor
them without an architecture-level decision (see §7).

| Area               | Baseline                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| Homepage IA        | 我是谁 · 为什么现在开始准备 · 我们主张什么 · 如何实现 · 正在做什么 · 如何参与 |
| Article system     | Article Header · Core Judgment · Body · TOC · Reading Footer                  |
| Brand identity     | Icon Mark · Compact Lockup · `CIVIC ORDERISM`                                 |
| Palette            | V6 canonical tokens (`quartz/styles/v6/_tokens.scss`)                         |
| Visual language    | Institutional Editorial — **B + C hybrid**                                    |
| Homepage Hero      | THRESHOLD                                                                     |
| Editorial artwork  | Tier 1 Flagship · Tier 2 Series · Tier 3 No Cover                             |
| Cover architecture | `cover` / `coverAlt` — one source feeding Article, Homepage Lead, OG          |
| No-cover           | **a designed state, not a defect**                                            |

Canonical reference assets — compare against these, do not replace them:

```
quartz/static/assets/v6/brand/icon-mark.svg           brand mark (current)
quartz/static/assets/v6/brand/threshold-mark.svg      historical — OG fallback only
quartz/static/assets/v6/hero/hero-threshold.svg       hero reference
quartz/static/assets/v6/editorial/ccp-system-transformation.webp
quartz/static/assets/v6/social/og-fallback.svg        OG reference
```

## 2. Frozen areas

Not to be modified as a side effect of an unrelated task. Changing any of these
is an architecture-level decision, not a normal task:

Homepage IA · Article IA · Navigation IA · Icon Mark · Brand identity ·
V6 canonical palette · Typography system · Core Judgment · Reading Footer ·
TOC · Cover infrastructure · OG precedence · Hero copy · URL architecture ·
slug architecture

## 3. Work categories

Classify every task before starting:

`CONTENT` · `ARTWORK` · `ORGANIZATION` · `FEATURE` · `BUGFIX` · `MAINTENANCE`

**Do not invent new phases.** Phase 4C / Phase 5 / Phase 6 must not be proposed
spontaneously. The `Phase` concept is reserved for a genuine architecture-level
redesign.

## 4. Branches

One branch per real task. Use task-specific prefixes:

```
content/article-xxx      editorial/artwork-xxx     organization/board-xxx
feature/xxx              fix/xxx                   maintenance/xxx
docs/xxx
```

`design/v6-*` is retired. V6 redesign is over; it must not become a catch-all
branch.

## 5. PR discipline

Every PR answers **"why is this change needed?"** — not "what else could we
change?". Required: an explicit need, scope, validation and exit condition.

**Do not** opportunistically refactor, unify, polish, or fix unrelated debt in
the same PR. Record it instead. The only exception is something that directly
blocks the current task.

## 6. QA matrix

Minimum before merge, by change type:

| Change type | Required                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------- |
| CONTENT     | `build` · `content-safety` · `links`                                                      |
| CODE        | `build` · `tsc` · `validate:v2` · `content-safety` · `article-typography` · `check:links` |
| VISUAL      | CODE QA **+** 390 / 1024 / 1440 **+** light & dark **+** overflow **+** broken images     |
| COVER       | VISUAL QA **+** Article **+** Homepage Lead (if applicable) **+** OG                      |

Do not fix unrelated validation debt to make a PR green.

## 7. Stop conditions

If a task requires any of the following, stop the normal execution path and
escalate to an **architecture-level decision**:

change Homepage IA · change Article IA · change brand identity · change the
canonical palette · add a metadata architecture · add a third-party dependency ·
add a font · change URL architecture · bulk-modify content

## 8. Priority

When trading off effort, this order wins:

1. Content
2. Organization
3. Institutional credibility
4. Reading experience
5. Reliability
6. Performance
7. Visual assets
8. Visual polish

The site is mature enough. Do not spend 50% of the time on the last 5% of
visual difference. Production bugs (broken link, broken image, mobile overflow,
metadata/OG error, accessibility regression, build or deploy failure) always
outrank visual work.

## 9. Artwork rules

**Tier 1 — Flagship.** 总论, core political judgments, major institutional and
historical articles, evergreen content. An independent, high-quality,
content-specific artwork.

**Tier 2 — Series.** Only once a column has real content scale. Shared visual
grammar with genuine content variation — never one image copied across many
articles.

**Tier 3 — No Cover.** The default for most articles, and a **designed state**.
"No image" does not mean "unfinished".

**Never bulk-generate covers for the existing 100+ articles to look uniform.**
Cover-worthiness is decided by content importance, not article count.

### New Tier 1 workflow

1. Read the article.
2. Extract **one core systemic metaphor**.
3. Decide whether it can be visualised at all.
4. Build **one primary C-device**.
5. Wrap it in **B — Editorial Archive** (the overall plate grammar).
6. Use the V6 palette only.
7. Master 2400 × 1263.
8. Web 1600 × 842.
9. Add `cover` + `coverAlt`.
10. Verify Article · Homepage Lead (if applicable) · OG.
11. Verify 390 / 1024 / 1440.
12. PR → QA → merge → deploy.

One artwork = **one primary idea, one primary C-device**. The more important the
article, the more restrained the artwork.

## 10. Visual consistency

Every new artwork must be compared **side by side** with the reference assets in
§1 — at minimum the Hero, the 《中共正在变成什么？》cover, and the OG fallback.

Ask: _"do these look like they were published by the same institution?"_

- **Yes** → proceed.
- **No** → change the **new** artwork. Never modify the baseline identity to
  accommodate a new piece.

## 11. Visual prohibitions

Do not produce: revolutionary poster · protest imagery · fake political
photography · leader portraits · generic stock · SaaS illustration · glowing
tech graphics · cinematic geopolitical thumbnail · campaign or NGO-activism
aesthetics.

The governing qualities are **institutional · editorial · measured ·
restrained · systemic**. AI-generated imagery is permitted only when it is
unmistakably editorial artwork — never when a viewer could mistake it for a news
photograph.

Photography is limited to documentary, architectural, historical, institutional,
object/detail and real locations. News photography requires recorded source,
URL, licence, credit and retrieval date in a `PROVENANCE.md`. If provenance
cannot be established, do not use the image — prefer Tier 3.

## 12. Engineering hazards

These were learned from real failures during V6. They are the most easily
forgotten items in this file.

### 12.1 Duplicate-file scan (every PR, before merge)

This workspace is synchronised, and the sync silently produces duplicate files.
Before **every** merge, scan `tracked`, `untracked`, `public/`, `quartz/`,
`content/` and `reports/` for `" 2"`, `" 3"`, `" copy"`, `"(1)"`, `"(2)"`.

When a duplicate is found: compare canonical vs duplicate first, confirm whether
their content differs, then remove the duplicate. Do not delete mechanically —
and do not mistake intentionally-named files for duplicates.

### 12.2 `public/` sync corruption

Sync has previously caused `public/` to lose article files entirely and to grow
duplicate directories such as `china 3/`.

**If a build looks wrong, check for sync corruption before suspecting code.** If
needed: `rm -rf public && npm run build`, then re-assess. Do not attribute
unexplained build breakage to the most recent commit.

### 12.3 SVG QA

A formal SVG can look correct while being structurally wrong — this happened
three times during Phase 4B (an arc sweep flag, an unstyled element defaulting
to a solid black fill, and a multi-line `d` attribute).

Check **all** of: visual render · `viewBox` · dimensions · path geometry ·
`stroke` · `fill` · theme behaviour · browser render. Never judge from a casual
visual glance alone — **verify by scanning pixel values**.

### 12.4 Production asset verification

Verify HTTP status · dimensions · bytes · hash.

When comparing hashes, remember gzip / transfer encoding: compare **decoded
original bytes**, or fetch with identity encoding. Never compare
compressed transfer bytes against the repository file.

## 13. Repository residue

`temp_images/` holds a single 0-byte tracked `.keep` and nothing else; it is
referenced by no script, config or workflow. It is **minor repository residue**,
not active debt. Leave it unless a dedicated cleanup task says otherwise.

---

## 14. Recurring review checklist

Before opening any PR:

- [ ] Task classified (§3) and scoped explicitly
- [ ] Branch uses a task prefix (§4)
- [ ] Only the intended files changed; no frozen area touched (§2)
- [ ] QA matrix for the change type run (§6)
- [ ] Duplicate-file scan clean (§12.1)
- [ ] Unrelated debt recorded, not fixed (§5)
- [ ] If artwork: side-by-side comparison passed (§10)
- [ ] No stop condition triggered — or escalated if one was (§7)
