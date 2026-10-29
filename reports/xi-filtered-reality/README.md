# 《习近平眼中的世界》发布记录

- Stable URL: `/china/the-world-xi-jinping-sees`.
- Date: 2026-10-29, America/Toronto; explicit `-04:00` prevents previous-day dates.
- Category: 解析中共; existing stage 04 (“为什么越自救，反而越失灵？”); primary topic `xi-era`, related topic `bureaucratic-system`.
- Full user-supplied body retained: 7431 non-whitespace characters after separating title/subtitle and normalizing heading markup and section rules. SHA-256: `985db39a439daed3308d050c7ed5d4094cc8d2b9aaf6816dad86400fa1124f55`.
- Twelve numbered sections and conclusion retained; four existing judgments excerpted into the standard component; three related articles selected by argument, not title keywords.
- Added a distinct endnote with four public primary sources. The notes separate the author's explanatory model from direct knowledge of private psychology/internal reporting, and explicitly record that the November 11 optimization preceded the late-November protests. No supplied argument rewritten.
- Article count: 104 regular research articles plus one separately classified core political statement; 52 in 解析中共. Existing generators include both types (105 total). Manually maintained retired landing pages are updated narrowly; no layout/template or homepageLead changes.

## Artwork

- Skills: `codex-illustrator` and built-in `imagegen`; website V6 SPEC overrides generic thumbnail palette, typography and composition advice.
- Newly generated abstract editorial artwork, not documentary evidence. No politician, human figure, political scene, text, logo or watermark.
- Metaphor: pale ordinary information is filtered by successive slotted dark panels; a few dark wine-colored sheets accumulate at the receiving end. Risk information is selected, not invented.
- Exact generation prompt: `image-prompt.txt` beside this file.
- Original generated PNG retained at `quartz/static/assets/v6/editorial/source/editorial-xi-filtered-reality.png` without overwriting the tool original.
- Web: `quartz/static/assets/v6/editorial/editorial-xi-filtered-reality.webp`, 1600×842, 51406 bytes. Re-export with `node scripts/generate-xi-world-cover.mjs`, using existing Sharp.
- One `cover` source feeds the article, homepage research listing and OG/Twitter metadata. No separate social crop or homepage card changes.

## QA

- `scripts/validate-xi-world.mjs`: original body checksum, chapter structure, one H1, subtitle/date, four judgments, canonical, cover/OG identity, indexes, RSS/sitemap, image size and budget.
- Existing build guards, TypeScript, unit tests, typography, internal links, historical-content safety and homepage social-card regression are run before publication.
- `browser-qa.mjs`: local 1440×1000 / 390×844, light and explicitly exercised dark theme tokens, top/body/bottom screenshots, loaded image, no horizontal overflow and no browser errors. Uses existing local Playwright/Chrome, no new package dependency.
- No changes to Header, Navigation, article template, CSS, favicon, homepage social card or scroll restoration.
