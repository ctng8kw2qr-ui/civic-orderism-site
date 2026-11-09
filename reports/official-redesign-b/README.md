# Civic Orderism · Official B redesign delivery

**Status: DEVELOPMENT COMPLETE — AWAITING FINAL APPROVAL. Local development only; no push, PR, merge or deployment.**

## Audit and isolation

- Authoritative remote: `https://github.com/ctng8kw2qr-ui/civic-orderism-site.git`.
- Development base: latest fetched/verified `origin/main@36fb221963f7aa84b8a0d97b051c59aa7631c23a`.
- Branch: `feature/official-site-redesign-b`.
- Isolated worktree: `/Users/zhaopengbo/网站/civic-orderism-official-redesign`.
- Original checkout `/Users/zhaopengbo/网站/civic-orderism-site` stays on its old main; its 3,616 existing staged status entries were preserved. No reset, clean or checkout of old commits.
- Quartz 4.5.2, Preact, TypeScript, SCSS/esbuild retained. Dependency manifest/lock versions unchanged. Only a local-preview npm command was added.
- `deploy.yml`: push main / PR main / workflow dispatch. PR builds; non-PR workflow may deploy Pages. Workers assets remain `public/`. External Cloudflare trigger settings are not encoded in this repository and were not changed or claimed as verified.
- `quartz.config.ts`, `wrangler.jsonc`, workflows, package lock, Markdown articles, taxonomy data, domain and secrets unchanged.

## Design reference and implementation

Approved source: `/private/tmp/civic-orderism-photo-b-final-20261109` (`civic-orderism-b-final-design-preview`). Read `index.html`, `fusion.css`, `FINAL-B-PLAN.md`, photo/implementation/responsive notes and approved screenshots. The three requested Skills were applied: design-and-templates, frontend-design and web-design-guidelines. Official Vercel guidelines were fetched for this review and saved with the QA evidence.

- Six homepage regions in approved order: person/route, principles, political/economic observation, economic redemption, theory/institutions, organization/public responsibility.
- Desktop editorial left text / right environmental portrait; narrow mobile stacks identity/route, photo, full-width summary and controls. Approved 560–768px composition retained.
- Existing geometric Icon Mark and bilingual wordmark, existing URL destinations, five long-term navigation entries and search. No invented title, legal status or portrait edits.
- Navy `#142D3D`, graphite `#272E33`, warm white `#FAF8F5`; existing canonical tokens bridge legacy pages, articles and footer. System dark-mode initialization reuses Quartz's existing script without adding a new control or framework.
- Research uses existing `allFiles`, `homepageLead`, article dates, summaries, URLs and `resolveCover`. Explicit lead wins; otherwise newest published article; deterministic slug tie-break. Latest two exclude lead/drafts/core political statement. Two meaningful selection tests added.
- Formal article typography, cover, core judgments, TOC, related/share/navigation systems remain; titles use the shared serif stack. Shared header escapes the narrow article reading column. Main landmarks, skip link and TOC control semantics were corrected.
- China keeps its existing analysis map, topics, archives and URLs; only the visible column title changes. Initiator prose is untouched; portrait source changes to the approved B resource. Route and organization texts/legal status are preserved.

### Deliberate differences from the prototype

- Demonstration article entries are replaced with real current Quartz data.
- The prototype's still-unapproved agreement/assets paragraph is **not promoted to formal policy**. The second economic-redemption explanation uses existing published wording from `data/civic-orderism.config.json:166–169` / `content/civic-orderism/index.md:330`. No expanded immunity, asset legitimacy or agreement promise.
- Existing full site footer, search and formal-page reading controls retained instead of copying a prototype-only shell.
- Approved master photographs stay byte-identical; additional WebP delivery encodings/resizes improve network cost. See `photo-provenance.json`.
- Homepage-only responsive image preload added to Head; canonical/OG/Twitter/RSS behavior is unchanged.
- `renderPage.tsx` changes **only search-index loading timing**: the same `fetchData` Promise starts downloading after document `load`, rather than competing with the first portrait. The PR #32 `homeScrollRestorationScript` is byte-identical; SPA implementation is untouched. Search was actually tested, not inferred.

## Validation

See `QA-SUMMARY.json` for measured final results and `inherited-validation.json` for exact baseline failures.

- Quartz build and its markup / CTA / favicon / commitments / institutional-architecture checks: PASS.
- Tests: 85/85 PASS; TypeScript: PASS.
- Article typography: 105 source / built articles PASS.
- Internal links: 22,488 links across 499 HTML pages PASS.
- Content safety: sampled historical article bodies and both official PDF source/public copies PASS; additional baseline hashing confirms no formal article source changes.
- URL and metadata comparison: 499 → 499 pages, none removed/added, no canonical/OG/Twitter/title differences. RSS, sitemap and robots byte-identical.
- Full repository `npm run check` still reports inherited formatting warnings. No new formatting warning file relative to the clean baseline; no bulk formatting of unrelated files or scroll code.
- `validate:v2` remains non-green: 31 inherited participation/preparation/institution-index assertions, compared with 40 failures on the clean main baseline. Nine obsolete homepage failures retired with the approved six-region contract; **zero new failures**. Political content was not rewritten to satisfy outdated assertions.
- Safari 27.2 WebDriver session creation timed out after 12 seconds without a session. **Safari / real iPhone are pending manual verification, not PASS.**

### Performance interpretation

Lighthouse is against a **local gzip static server**, not production or real-user CWV. Desktop and mobile are single-run lab results; no production performance guarantee is implied.

- Desktop: Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100; LCP 0.4s, CLS 0, TBT 0ms.
- Mobile simulated: Performance 96 / Accessibility 100 / Best Practices 100 / SEO 100; LCP 2.6s, CLS 0, TBT 80ms. LCP is close to the 2.5s good threshold and needs real-device/preproduction measurement.
- Same-server main mobile baseline: Performance 100, LCP 1.4s. The old first screen had no large portrait; the approved new visual has a measurable media cost.
- Initial uncompressed measurements and intermediate outcomes remain in the external evidence directory. Index-load deferral reduced the new gzip mobile LCP from roughly 6s to 2.6s; it does not remove the existing search index.
- No new runtime dependency, remote font service, heavy animation or framework. CSS ~306 KB raw / ~47 KB gzip, postscript ~84 KB raw / ~28 KB gzip. Added system-theme prescript ~923 B raw / ~383 B gzip.

## Preview and artifacts

```sh
cd /Users/zhaopengbo/网站/civic-orderism-official-redesign
npm ci
npm run build
npm run preview:local
```

Local preview: `http://127.0.0.1:8780` (loopback only). Override `CO_PREVIEW_PORT` if needed. Do not use `npm run deploy` or push this branch.

External evidence: `/private/tmp/co-official-redesign-review/`.

Required screenshots:

- `home-1440-light-full.png`, `home-390-light-full.png`, `home-320-light-full.png`.
- `home-1440-light-first.png`, `home-390-light-first.png`, `home-320-light-first.png`.
- `china-1440-light-full.png`, `article-1440-light-full.png`, `initiator-1440-light-full.png`.
- Dark variants, route/theory/organization views also supplied.
- `responsive-results.json`, `search-and-navigation.json`, `compatibility.json`, Lighthouse JSONs, fetched guideline source and reproducible browser QA script.

## Before any release

1. Human approval of the actual screenshots/local build, including route-copy treatment above.
2. Real Safari/iPhone visual, search, dark mode and navigation checks.
3. Review inherited `validate:v2` and formatting debt as explicit outstanding items; do not call these checks green.
4. Verify preproduction/production compression and real-device LCP after any later authorized preview/release.
5. Separate explicit authorization for push/PR/merge/production. This delivery performs none.
