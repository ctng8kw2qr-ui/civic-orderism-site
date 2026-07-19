# Civicorderism.com V2.0 上线前审计

更新时间：2026-07-19  
分支：`site-v2-information-architecture`  
本地预览：<http://localhost:8080>

## 1. 人工复核与概念复核

- 14 篇人工复核文章及逐篇建议：[`v2-manual-review.md`](./v2-manual-review.md)
- 15 个核心概念的 A/B/C 发布建议：[`v2-concept-publication-review.md`](./v2-concept-publication-review.md)
- 14 篇 `needsReview` 文章的当前分类字段保持原样，未按建议自动改写。

## 2. 一级栏目文章数量

| 一级栏目     | 文章数 |
| ------------ | -----: |
| 解析中共     |     31 |
| 中国未来     |      9 |
| 公民秩序主义 |     28 |
| 制度设计     |     17 |
| 合计         |     85 |

“解析中共”占 36.5%，未形成压倒性膨胀；“中国未来”有 9 篇，当前内容规模偏小但不是空栏目。未为平衡数量而强行迁移文章。

## 3. 专题数量及文章数量

| 专题         | 状态            | 文章数 |
| ------------ | --------------- | -----: |
| 习近平时代   | published       |      9 |
| 官僚系统     | published       |     17 |
| 秩序蒸发     | published       |     12 |
| 三清时代     | published       |      5 |
| 二次改开     | published       |      4 |
| 中共统治术   | published       |     13 |
| 地方财政     | published       |     10 |
| 中国政治转型 | published       |      5 |
| 制度机制     | draft / noindex |      0 |

首批公开专题为 8 个，均有简介、核心判断、至少 2 篇文章、推荐阅读顺序和更新时间。“制度机制”与一级栏目“制度设计”功能重复，保留 URL 但暂不公开。

## 4. 迁移统计与约束

| 项目           | 数量 |
| -------------- | ---: |
| 未分配一级栏目 |    0 |
| 未分配专题     |   38 |
| 未分配核心概念 |   41 |
| needsReview    |   14 |
| draft 文章     |    0 |
| archived 文章  |    0 |

- 每篇文章只有 1 个一级栏目。
- 除 14 篇冻结待确认文章外，其余文章最多 2 个专题、3 个核心概念。
- 未分配专题或概念是保守审计结果，不为填充数据强行关联。
- 历史普通标签最多 10 个；本轮不批量改写历史文章 frontmatter。标签不参与推荐排序，普通标签页统一 `noindex` 且不进入 sitemap。

## 5. 旧栏目到新栏目映射

| 旧 URL            | 处理方式                            | 新归属或主入口                           | HTTP 策略     |
| ----------------- | ----------------------------------- | ---------------------------------------- | ------------- |
| `/china`          | 原 URL 直接升级                     | 解析中共                                 | 200，保留     |
| `/china-stage`    | 保留为兼容页                        | `/china-future`                          | 200，兼容入口 |
| `/civic-orderism` | 原 URL 直接升级，制度文章按逻辑分流 | `/civic-orderism`、`/institution-design` | 200，保留     |
| `/institution`    | 保留为兼容页                        | `/institution-design`                    | 200，兼容入口 |
| `/theory`         | 保留为兼容页                        | 公民秩序主义及相关专题                   | 200，兼容入口 |

本轮没有需要永久迁移的旧栏目，因此未新增 301。旧页全部可访问，不产生 404；文章 URL 全部保持不变。后续若确认“语言通胀/机会通缩”合并，再对被合并概念的旧 URL 增加单向 301。

## 6. 新增和修改的公开 URL

新增公开入口：

- `/start`
- `/china-future`
- `/institution-design`
- `/about`
- `/topics`
- `/topics/xi-era`
- `/topics/bureaucratic-system`
- `/topics/order-evaporation`
- `/topics/three-cleans-era`
- `/topics/second-reform`
- `/topics/ccp-governance`
- `/topics/local-finance`
- `/topics/political-transition`
- `/concepts`
- `/concepts/order-evaporation`
- `/concepts/bureaucratic-shock`
- `/concepts/second-reform`
- `/concepts/high-fragility`

修改但保持 URL 的入口：

- `/`
- `/china`
- `/civic-orderism`
- `/theory`
- `/china-stage`
- `/institution`
- `/start-here`

文章 URL 与两个 PDF URL 均未改变。

## 7. Draft 与 noindex 清单

专题：

- `/topics/institutional-mechanisms`

核心概念：

- `/concepts/three-cleans-era`
- `/concepts/fiscal-debt`
- `/concepts/political-debt`
- `/concepts/ruling-techniques`
- `/concepts/crisis-management`
- `/concepts/language-inflation`
- `/concepts/opportunity-contraction`
- `/concepts/state-system-upgrade`
- `/concepts/low-friction-governance`
- `/concepts/political-route`
- `/concepts/nonviolent-transition`

此外，所有 `/tags/*` 普通标签页均为 `noindex,follow`，且不进入 sitemap。

## 8. 发现并修复的问题

1. 原自动分类读取整篇正文并按宽泛关键词匹配，造成美国制度、台海、军队和历史案例被加入 3–4 个专题及 5 个概念。现已改为标题、摘要、明确推荐表和公开状态驱动，并对非复核文章执行 2/3 上限。
2. 14 篇人工复核文章被自动脚本继续改写的风险。现按固定 slug 清单冻结其现有分类，仅输出建议。
3. 15 个概念全部公开且页面模板化。现仅 4 个 A 类概念公开，11 个 B/C 类保留框架并从概念列表、文章入口、搜索、RSS、sitemap 隔离。
4. “制度机制”专题与“制度设计”栏目重复。现设为 draft/noindex，首批公开专题收敛到 8 个。
5. 文章推荐依赖栏目、标签和日期，可能推荐低相关或未确认内容。现按“同专题 > 共同公开概念 > 同栏目 + 人工推荐”排序，去重、排除自身和未确认/草稿/归档内容，最多 5 篇。
6. 首页推荐与最新文章可能重复、最新卡片过多。现去重并把最新文章降为 6 篇；专题卡片保持 6 个；移除首屏重复 CTA，模块顺序严格保持 7 段。
7. 桌面导航入口过多的风险。一级导航固定为 6 个；开始阅读、专题、核心概念、全部文章进入 390px 菜单次级区域和关于页。
8. 布尔型 `published: false` 会被 Quartz 当成发布日期解析。改用 `status: draft + listed: false + noindex: true`，既保留框架 URL，又避免日期污染。
9. sitemap 曾手动加入低价值标签入口。现已移除，且 draft/noindex 页面不会进入搜索、RSS 或 sitemap。
10. RSS 曾混入集合页。现仅输出文章内容。
11. 搜索结果类型字段存在宽泛 `any` 和类型信息丢失。现收紧为 FlexSearch 文档值类型并保留内容类型。
12. 首页和文章页的专题、概念入口会显示未成熟节点。现统一读取公开状态，只显示已发布节点。

## 9. 首页、导航与响应式验收

- 首页顺序：品牌定位 → 从哪里开始 → 核心专题 → 推荐阅读 → 最新文章 → 核心文档 → 联系方式。
- 首页 6 个专题卡、6 个不重复的最新文章卡；无动画、渐变和大面积标签堆叠。
- 自动浏览器覆盖 390、768、1280、1440 四档，共 48 个页面/视口组合。
- 页面范围：首页、开始阅读、四个栏目、专题列表与专题页、概念列表与概念页、历史文章、关于页；另验收搜索交互、移动菜单和两份 PDF。
- 结果：无横向溢出、文字截断、表格溢出、破图、导航遮挡或控制台错误；页脚存在；当前一级导航激活状态正确。
- 390px 菜单包含 6 个一级入口和 4 个次级入口；键盘焦点显示浏览器可见 outline。
- 搜索“秩序蒸发”返回 8 项且无隐藏概念入口；隐藏概念页输出 `noindex,follow`。

## 10. 历史内容与 PDF 安全

- 自动抽样 20 篇历史文章，当前文件与分支创建时的 HEAD 字节级完全一致，因此标题、正文、加粗、引用、小标题、链接、日期、slug、图片路径、Markdown/MDX 和中文标点均未改变。
- 两份源 PDF 与构建产物逐字节一致，浏览器均可直接打开。
- 首页和关于页都提供两份 PDF 的相同 URL。

## 11. SEO 与索引

- `title`、description、canonical、Open Graph、X Card、BreadcrumbList、Article、CollectionPage、sitemap、RSS、robots.txt、中文 `lang` 和 404 均已生成并校验。
- 文章页实测包含 `BreadcrumbList` 与 `Article`；集合页输出 `CollectionPage`。
- draft/noindex 页面不在搜索索引和 sitemap；RSS 仅含文章。
- needsReview 文章不进入首页推荐、首页最新文章或文章页推荐候选。
- canonical 使用最终公开 URL；兼容页没有循环重定向；sitemap 不含 404 或标签页。

## 12. 仍需人工决定

1. 14 篇人工复核文章的最终栏目、专题与概念，尤其是 `institution/despotism-cancer-ming-1566` 是否移出制度设计。
2. “语言通胀”和“机会通缩”是否合并为“语言通胀与机会通缩”，以及确认后的主 URL。
3. 9 个 B 类概念何时具备正式公开所需的解释和文章支持。
4. 美国制度系列是否在形成稳定文章簇后建立长期专题。
5. 两篇台海文章是否都进入“习近平时代”，还是只保留“中国未来”栏目归属。
6. 本地 `node_modules` 缺少仅用于 Wrangler 预览/部署的 `wrangler`，不影响本轮构建和 localhost 预览；上线前若继续采用 Wrangler 流程，需要按锁文件补装依赖。本轮遵守要求，没有安装部署工具或部署。

## 13. 测试结果

| 检查                                         | 结果                                                  |
| -------------------------------------------- | ----------------------------------------------------- |
| 修改代码 Prettier 检查（作为项目现有 lint）  | 通过                                                  |
| TypeScript `tsc --noEmit`                    | 通过                                                  |
| Quartz production build                      | 通过；126 个输入文件，416 个输出文件                  |
| 自动单元测试                                 | 69/69 通过                                            |
| V2 URL / sitemap / RSS / 搜索 / 推荐规则校验 | 通过；85 篇、9 个专题框架、15 个概念框架、14 篇复核项 |
| 历史内容与 PDF 安全校验                      | 通过；20 篇文章字节级一致，2 份 PDF 一致              |
| 四档自动浏览器验收                           | 48/48 通过，控制台 0 error/warning                    |

构建日志只有 Node.js 对上游 `punycode` 模块的弃用提示，不影响构建结果。

## 14. 本次修改文件

配置与映射：

- `data/site.config.json`
- `data/navigation.config.json`
- `data/sections.config.json`
- `data/topics.config.json`
- `data/concepts.config.json`
- `data/reading-paths.config.json`
- `content-migration-map.json`
- `content-migration-needs-review.json`

生成与校验脚本：

- `scripts/generate-content-indexes.mjs`
- `scripts/generate-v2-architecture.mjs`
- `scripts/validate-v2-architecture.mjs`
- `scripts/validate-content-safety.mjs`
- `package.json`

Quartz 组件、索引与样式：

- `quartz.layout.ts`
- `quartz/components/PrimaryNavigation.tsx`
- `quartz/components/ArticleReadingEnhancements.tsx`
- `quartz/components/Head.tsx`
- `quartz/components/index.ts`
- `quartz/components/scripts/primaryNavigation.inline.ts`
- `quartz/components/scripts/search.inline.ts`
- `quartz/components/styles/primaryNavigation.scss`
- `quartz/components/styles/articleReadingEnhancements.scss`
- `quartz/components/styles/search.scss`
- `quartz/plugins/emitters/contentIndex.tsx`
- `quartz/plugins/transformers/frontmatter.ts`
- `quartz/styles/custom.scss`

生成页面：

- `content/index.md`
- `content/start.md`
- `content/about.md`
- `content/china/index.md`
- `content/china-future/index.md`
- `content/civic-orderism/index.md`
- `content/institution-design/index.md`
- `content/theory/index.md`
- `content/china-stage/index.md`
- `content/institution/index.md`
- `content/start-here/index.md`
- `content/topics/index.md` 与 9 个专题框架页
- `content/concepts/index.md` 与 15 个概念框架页

审计报告：

- `reports/v2-information-architecture-audit.md`
- `reports/v2-route-map.md`
- `reports/v2-manual-review.md`
- `reports/v2-concept-publication-review.md`
- `reports/v2-prelaunch-audit.md`
- `reports/new-article-metadata-guide.md`

历史文章正文文件没有修改。

## 15. 发布状态

- 当前分支：`site-v2-information-architecture`
- 未合并 `main`
- 未部署生产环境
- 本地预览服务器保持运行，等待人工检查
