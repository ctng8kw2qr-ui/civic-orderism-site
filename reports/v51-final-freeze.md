# V5.1 Final Fix & Freeze

**依据**：`reports/v51-first-time-visitor-audit.md`（30-Second 21/25、Five-Minute 23/25、P0 = 0、P1 = 2）
**本轮范围**：P1-1、P1-2、首页机器可读元数据。审计报告中的 P2/P3 一律未处理。
**产出状态**：`npm run build` EXIT 0；全部校验通过；构建产物（`public/`）已逐项实测，不依赖源码推断。

---

## 1. P1-1 修复：`/start-here/` 的空「本栏目全部文章」

### 根因

1. `/start-here/index.md` 是「内容页 + 同名目录」的组合页：它既不在 `data/sections.config.json` 的 primary section 列表里，也不是 concepts 索引。
2. 它的正文容器是 `class="start-page start-here-page"`，不含 `inst4` / `inst4l`，因此**不会**命中 `FolderContent.tsx` 顶部「机构落地页 → 只渲染正文」的早退分支（第 46–74 行）。
3. 于是它走到最后一层分支：`isConceptIndex ? null : isPrimarySection ? <details> : <section class="page-listing"><h2>本栏目全部文章</h2>…`。该分支**无条件**渲染标题、可选计数与 `PageList`，即使文件夹里没有任何子页面。
4. `/start-here/` 目录下确实没有子页面 → 标题渲染、列表为空。

**证据（修复前构建产物）**：`public/start-here/index.html` 中 `<section class="page-listing" aria-label="本栏目全部文章">` 内的 `<li>` 数量为 **0**，实测 `display: block`、高度 **46px**；当时全站只有这一页为空（`china-stage` 3 条、`institution` 1 条、`institution-design` 16 条）。

### 修改位置

`quartz/components/pages/FolderContent.tsx`（唯一修改点，共 7 行）

```tsx
// An empty collection must not render a collection section: a heading such
// as “本栏目全部文章” without any entry is an empty UI state. Pages whose
// folder has no listed children simply end after their own content.
const hasListedPages = listedPages.length > 0;
…
{isConceptIndex || !hasListedPages ? null : isPrimarySection ? (
```

即 **empty collection → do not render collection section**：

- 同时覆盖两个分支——`<section class="page-listing">`（普通栏目列表）与 `<details class="page-listing section-archive">`（一级栏目完整索引）；
- 空集合时连标题、计数与容器一起不渲染。

### 为什么使用当前方案

- 属组件层的通用空集合守卫，**不是**页面特判：未手动隐藏任何 DOM、未用 `display:none` 打补丁、未对 pathname 硬编码、未为填充模块新增文章。
- 位于所有 folder 页共用的渲染路径上，其他栏目自动继承同一规则。
- 与组件里既有的同类条件（`isConceptIndex ? null : …`）风格一致，改动仅 1 个常量 + 1 个条件。

### 是否影响其他栏目（构建产物实测）

| 页面                       | 修复前                  | 修复后             |
| -------------------------- | ----------------------- | ------------------ |
| `/start-here/`             | 空标题 + 空列表（46px） | **模块完全不存在** |
| `/china-stage/`            | 3 条                    | 3 条（不变）       |
| `/institution/`            | 1 条                    | 1 条（不变）       |
| `/institution-design/`     | 16 条（details 索引）   | 16 条（不变）      |
| 其他栏目页 / 文章页 / 首页 | 不渲染该模块            | 不渲染（不变）     |

- `/start-here/` 因移除空模块而缩短 **94px**（1440：3092 → 2998；768：3137 → 3043；390：4334 → 4240），五问结构保持 5 段。
- URL、导航、文章页与首页均未受影响。

### 新增回归断言

`scripts/validate-v2-architecture.mjs`：遍历全部构建页面，任何 `class="page-listing…"` 模块若 `<li>` 数量为 0 即校验失败（"栏目列表模块为空仍被渲染"）。

---

## 2. P1-2 修复：首页 CURRENT WORK 的即时状态说明

### 状态文字的最终位置

置于**项目名之下、定位句之上**，作为次级注解（不是第二段正文、不是卡片、不是警告块）：

```
CURRENT WORK
当前组织建设
北美非营利法人及首届董事会筹备
当前状态：法人筹备中，首届董事会尚未产生。      ← 本轮新增（次级层级）
为政治路线、政治信誉和长期责任建立正式、合法、可持续的组织载体。
[查看筹备工作 →]     [阅读正式筹备说明（PDF） →]
```

- 文案唯一来源：`data/civic-orderism.config.json → organizationPositioning.homeStatus`，由生成器写入首页（未手改生成产物）。
- 样式：`--inst4-muted`（实测 `rgb(96, 100, 108)`），13.44px（桌面）/ 13.12px（移动），行高 1.55–1.6。
- 无警告框、无红色、无图标、无新卡片、未加入注册流程 / 加拿大法律解释 / 预计时间 / 成员数量；现有两个 CTA 未改动。

### 桌面 / 移动端表现与高度变化（CDP 实测构建产物）

| 视口             | 状态行字号 | 状态行行数 | CURRENT WORK 高度（前 → 后） | 首页总高（前 → 后） |
| ---------------- | ---------- | ---------- | ---------------------------- | ------------------- |
| Desktop 1440×900 | 13.44px    | 1          | 410px → **432px（+22）**     | 5210 → 5232（+22）  |
| Tablet 768×1024  | 13.12px    | 1          | 300px → **320px（+20）**     | 4421 → 4442（+21）  |
| Mobile 390×844   | 13.12px    | 1          | 351px → **372px（+21）**     | 5376 → 5396（+20）  |

- 增加量 = 新增一行次级说明本身（约 20–22px，约 +5%）；模块结构、层级与两个 CTA 均未变，三种宽度都不换行、无横向溢出。
- 实测文本与预期一致：`当前状态：法人筹备中，首届董事会尚未产生。`

### 新增回归断言

`scripts/validate-v2-architecture.mjs`：首页 CURRENT WORK 必须包含 `class="inst4-work__item-status"` 且可见文本等于配置中的 `homeStatus`。

---

## 3. Metadata

### 最终实际输出（全部取自构建产物 `public/`）

| 项目                         | 值                             | 来源 / 证据                                                                        |
| ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| homepage published           | `2026-07-19`                   | `content/index.md` frontmatter（`data/site.config.json → homepageMeta.published`） |
| homepage updated             | `2026-09-23`                   | 同上（`homepageMeta.updated`）                                                     |
| **sitemap 首页 `<lastmod>`** | **`2026-09-23T04:00:00.000Z`** | `public/sitemap.xml` 实测（`<loc>https://civicorderism.com/</loc>` 之下）          |
| JSON-LD `datePublished`      | `2026-07-19T04:00:00.000Z`     | `public/index.html` 的 `WebPage` JSON-LD 实测                                      |
| JSON-LD `dateModified`       | `2026-09-23T04:00:00.000Z`     | 同上                                                                               |

时区说明：Quartz 对「仅日期」的 frontmatter 值采用**本地午夜**惯例（见 `quartz/plugins/transformers/lastmod.ts` 的 `coerceDate`），本机时区为 UTC-4，因此统一显示为 `T04:00:00.000Z`；与站内其他条目、以及 `dates.published` 的处理方式保持一致。

### 采用的方案（未新建 SEO 系统）

**Sitemap（优先项）**：`quartz/plugins/emitters/contentIndex.tsx`

- `ContentDetails` 新增字段 `lastModified`，内容索引构建时取 `file.data.dates?.modified ?? date`。
- `generateSiteMap()` 的 `<lastmod>` 由 `content.date` 改为 `content.lastModified ?? content.date`。
- 这是一条**通用规则**（updated 优先、published 回退），不针对首页硬编码：`dates.modified` 由 Quartz 既有日期模型解析，来源顺序为 frontmatter `updated` / `modified` / `last-modified` → 回退 `date` / `created`。
- `date` 字段语义未变：RSS `pubDate` 与前端「按发布日期排序」仍使用它（`contentIndex.tsx` 中 `date:` 一行未改动），因此不会把「更新时间」误当作发布时间。

**JSON-LD**：`quartz/components/Head.tsx`

- 既有架构已为非文章页输出 `WebPage` JSON-LD（`contentType` 非栏目/专题/概念时进入该分支；首页 `contentType` 为「首页」正落在此分支），本轮仅在该对象上补充 `datePublished` 与 `dateModified`。
- 未新增独立 SEO 系统，未改动 `Article` 与 `CollectionPage` 分支，未改动 BreadcrumbList。

### 对其他页面的影响（构建产物 sitemap 前后 diff，138 条记录）

| 结果             | 条数  | 说明                                                                                                                                                                |
| ---------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 字节级不变       | 104   | 未声明独立更新时间的页面保持原样                                                                                                                                    |
| **提前（回退）** | **0** | 无任何页面 lastmod 变早                                                                                                                                             |
| 变更为更晚的日期 | 34    | 33 条 `2026-07-19 → 2026-07-20`（这些页面自身 frontmatter 就声明 `updated: 2026-07-20`）；`/preparation` `2026-07-19 → 2026-08-11`（自身声明）；首页 `→ 2026-09-23` |

- 结论：通用规则只让 sitemap 与各页面**自己声明的更新时间**一致，未造成任何回退。
- 遗留观察（未处理）：生成器默认写入的 `updated: 2026-07-20` 使 33 个生成页面在本次 diff 中前移 1 天。若希望默认生成页不出现这 1 天差异，需要把生成器默认 `updated` 改为与 `date` 相同（会改动约 20 个生成文件的 frontmatter）——属后续决定，本轮按「只消除明确问题」未执行。

---

## 4. Validation

| 检查         | 命令                                  | 结果                                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 生成         | `npm run generate:indexes`            | 通过（exit 0；连续两次产物一致）                                                                                                                                                                                                                           |
| 类型检查     | `npx tsc --noEmit`                    | 通过（0 错误）                                                                                                                                                                                                                                             |
| 构建         | `npm run build`                       | 通过（EXIT 0，525 文件产出）                                                                                                                                                                                                                               |
| 信息架构校验 | `npm run validate:v2`                 | 通过（103 articles / 9 topics / 20 concepts / 13 review items，含本轮两条新断言）                                                                                                                                                                          |
| 历史内容安全 | `npm run validate:content-safety`     | 通过（抽检历史文章正文逐字节一致；PDF 源与产物一致）                                                                                                                                                                                                       |
| 文章排版     | `npm run validate:article-typography` | 通过（103 源 / 103 构建页统一文章壳）                                                                                                                                                                                                                      |
| 内部链接     | `npm run check:links`                 | 通过（22434 链接 / 488 HTML 页面）                                                                                                                                                                                                                         |
| 格式         | `npx prettier --check <本轮改动文件>` | 本轮新增/改动代码（`contentIndex.tsx`、`Head.tsx`、`custom.scss`、`content/index.md`）通过；`FolderContent.tsx`、`data/civic-orderism.config.json`、`validate-v2-architecture.mjs` 为仓库既有未格式化状态（已用 `git show HEAD:…` 比对确认与本次改动无关） |

### 本轮要求的具体确认（全部来自构建产物）

**`/start-here/` 结束处**

- `public/start-here/index.html` 中 `page-listing` 出现次数 = **0**（正文结束后不再出现「本栏目全部文章」）。
- 五问结构仍为 5 段；页面高度 1440/768/390 = 2998 / 3043 / 4240px。

**其他栏目列表正常**

- `/china-stage/` 3 条、`/institution/` 1 条、`/institution-design/` 16 条（details 索引）— 与修复前一致。

**首页 CURRENT WORK**

- 桌面（1440）与移动（390）均可见 `当前状态：法人筹备中，首届董事会尚未产生。`，单行、次级色 `rgb(96,100,108)`。
- 模块高度 410 → 432（1440）、300 → 320（768）、351 → 372（390），即一行次级说明的增量；未新增段落或卡片。

**Sitemap（构建产物）**

- `public/sitemap.xml`：首页 `<lastmod>` = `2026-09-23T04:00:00.000Z`。

**SEO 最终输出**

- `datePublished` = `2026-07-19T04:00:00.000Z`（已实现）
- `dateModified` = `2026-09-23T04:00:00.000Z`（已实现）
- sitemap `lastmod` = `2026-09-23T04:00:00.000Z`（已实现）
- 三项均已实现，无未实现项。

---

## 5. Files Changed

### 本轮修改（V5.1 Final Fix）

| 文件                                        | 改动                                                                  | 原因                  |
| ------------------------------------------- | --------------------------------------------------------------------- | --------------------- |
| `quartz/components/pages/FolderContent.tsx` | 新增 `hasListedPages` 守卫，空集合不渲染列表模块（7 行）              | P1-1 根因             |
| `data/civic-orderism.config.json`           | `organizationPositioning.homeStatus` 新增状态文案                     | P1-2 文案唯一来源     |
| `scripts/generate-v2-architecture.mjs`      | 首页 CURRENT WORK 增加 `inst4-work__item-status` 一行                 | P1-2 结构（数据驱动） |
| `quartz/styles/custom.scss`                 | 新增 `.inst4-work__item-status` 桌面与移动样式                        | P1-2 次级文本层级     |
| `quartz/plugins/emitters/contentIndex.tsx`  | `lastModified` 字段 + sitemap `<lastmod>` 改为 `updated ?? published` | 元数据修复（sitemap） |
| `quartz/components/Head.tsx`                | `WebPage` JSON-LD 增加 `datePublished` / `dateModified`               | 元数据修复（JSON-LD） |
| `scripts/validate-v2-architecture.mjs`      | 新增 2 条回归断言（CURRENT WORK 状态行、任何页面不得渲染空列表模块）  | 冻结期防回退          |
| `content/index.md`                          | 生成产物：新增状态行（frontmatter `updated` 沿用上一轮 2026-09-23）   | 生成器输出            |

### 上一轮 V5.1 已接受、本轮未再改动（同属未提交工作区）

`content/about.md`、`content/preparation.md`、`content/start-here/index.md`、`data/site.config.json`、`quartz.layout.ts`、`quartz/components/PrimaryNavigation.tsx`、`quartz/components/index.ts`、`quartz/components/ArticleFrameworkNotice.tsx`、`quartz/components/styles/articleFrameworkNotice.scss`，以及上述 `generate-v2-architecture.mjs` / `custom.scss` / `validate-v2-architecture.mjs` / `civic-orderism.config.json` 中上一轮的改动部分。

### 验证用临时产物（未纳入站点构建）

`tmp/probe/v51-sitemap-delta.mjs`、`tmp/probe/v51-status-summary.mjs`、`tmp/probe/freeze-measure.txt`、`tmp/probe/status-summary.txt`、`tmp/probe/final-ld.txt`、`reports/v51/*.png`、`reports/v51/report.json`。

---

## 6. Freeze Status

**V5.1 homepage frozen**

**V5.1 start-here frozen**

冻结内容：首页（`content/index.md` 及其生成器、数据源与首页专属样式）与新人入口（`/start-here/`）暂停继续优化。

后续仅以下情况可修改：

1. 出现事实错误；
2. 项目正式组织状态发生变化（例如法人依法成立、首届董事会依法产生）；
3. 政治路线发生实质变化；
4. 用户数据证明新人明显无法理解；
5. 技术故障；
6. 新一轮明确版本升级指令。

不因「某句话还能更漂亮」「某处还能少 20px」「某个 CTA 还能更顺」「审计还能多 1 分」而继续修改。V5.1 的目标是稳定、清楚、可信的第一次访问体验，而不是理论上的满分首页。

本轮未处理（按指令保留）：审计报告 §9 中的全部 P2（CTA 节奏、同义重复、`/start-here/` 当前状态说明、页脚身份行、`updated` 可见性之外的其余项）与 P3（研究入口文案、Level 1/2 术语、Level 4 词汇、英文 eyebrow、返回路径、死 CSS、reveal 动画、首页高度、导航权重、理论文章重新分类）。
