# 官场“文革”：文章发布记录

- Article: `/china/bureaucratic-responsibility-cycle`
- Publication: 2026-10-15 (America/Toronto), explicit timezone prevents prior-day rendering.
- Classification: 解析中共 / 官僚系统. 首页“分析与判断” consumes it automatically as a recent article; existing homepageLead remains unchanged. No new navigation, category, featured selection, or article template.
- References reviewed: `ccp-bureaucracy-historical-bill`, `when-high-ranking-officials-are-no-longer-safe`, `route-transition-why-ccp-keeps-purging-officials`.
- No root README.md, AGENTS.md or additional instruction files exist in the current repository. Followed V6 SPEC and editorial asset documentation. Explicit user palette and image request override older wine-accent guidance.

## Content and verification

All 13 numbered sections, conclusion, opening definition and ten requested core judgments retained. Adjacent short spoken paragraphs joined for web reading. Six numbered source anchors link to primary official material at the end.

The CCDI and NBS figures match the supplied article. Cadre grade figures are investigations opened, not disciplinary sanctions. The year-end debt balance 548230.82亿元 and 17.51/37.31万亿元 components match the March 2026 annual budget report; this includes swapped hidden debts, not all broad local liabilities. Retained the 1.8万亿元 half-year issue figure and added official confirmation that the full 2万亿元 2025 allocation was issued by year-end. Explicitly explained the legal context of lifelong accountability in the source note. Historical background links to the resolution published by 中共中央党史和文献研究院 / 理论中国.

## Artwork provenance

- Skill: imagegen (`/Users/zhaopengbo/.codex/skills/.system/imagegen/SKILL.md`), built-in image_gen mode.
- Newly generated in this task; abstract editorial sculpture, not documentary imagery.
- Original generated raster: 1983×793 PNG, normalized with proportional center crop to 2000×800 PNG.
- Master: `quartz/static/assets/v6/editorial/source/editorial-bureaucratic-responsibility-cycle.png`.
- Web: `quartz/static/assets/v6/editorial/editorial-bureaucratic-responsibility-cycle.webp`, 1600×842, 140422 bytes.
- Social: `quartz/static/assets/v6/social/social-bureaucratic-responsibility-cycle.webp`, 1200×630, 99832 bytes.
- Export: `node scripts/generate-responsibility-cycle-cover.mjs`, using existing Sharp dependency and proportional centered crops.
- Alt: 抽象圆形会议桌上，多双手沿环形方向传递文件，中央放着黑色档案盒和成叠纸张。

The existing `socialImage` frontmatter field now also selects an explicit article crop in Head. Other pages retain cover/fallback behavior. The existing homepage social-card regression validator passes.

### Generation prompt

Use case: stylized-concept. Create a new original editorial cover for Civic Orderism research article about bureaucratic responsibility being passed in a circle. Wide 5:2 composition, preferably 2000x800 PNG, no text. Warm-white #faf8f5 backdrop, charcoal, deep gray and restrained slate-green #435B63. Elevated oblique overhead view of a circular institutional meeting table, simplified anonymous sculptural hands extending from restrained gray sleeves at evenly spaced seats passing one thick slate-green dossier clockwise. Repeated positions and subtle shadows establish the continuous circular chain of transferred responsibility. A closed charcoal archival file box sits unattended at the center; older cream paper layers and newer gray folders suggest accumulated obligations. Clear visual language of passing paperwork and avoiding taking custody. Calm, austere, institutional conceptual illustration, matte paper and stone-like materials, precise architectural lighting, restrained tension, no documentary realism. Keep essential circular handoff and central box within central 70% width so a centered 1.9:1 crop remains legible. No title, no writing, no logos, no political figures, no portraits, no flags, no party emblems, no landmark political buildings, no red, no bomb, no weapon, no explosion, fire, blood or conflict, no propaganda, no news collage, no cyberpunk, no fantasy.

## Validation

- Build and all mandatory build guards: PASS (markup, CTA visibility, favicons, commitments, institutional architecture).
- TypeScript: PASS.
- Tests: 83 PASS, 0 failures.
- Internal links: PASS.
- Article typography: PASS; content-safety: PASS.
- Dedicated publication validator: PASS (date, one H1, rendered strong, six source anchors, article/canonical, RSS/sitemap, homepage/archive/column entries, social metadata, alt and image budgets).
- Homepage social-card regression: PASS.
- Responsive browser checks: 390×844 and 1440×900 CSS viewports; no horizontal overflow, cover loads, title/subtitle/date visible.
- Native Safari and Chrome visual checks completed; screenshots delivered separately.
- Global Prettier check: 182 existing files fail on both clean main and this version; changed code/new files checked independently. Do not reformat unrelated pages.
- Legacy validate:v2: FAIL identically on clean main (6e95b46) and this version; its assertions target superseded homepage/IA layouts. Guard not modified or disabled.

V6 landing pages and articles/all are intentionally retired from generator rewrites. Added the article row and updated counts in the existing manually maintained source; did not reactivate retired templates. The generator still updates migration data and concept/topic pages normally.
