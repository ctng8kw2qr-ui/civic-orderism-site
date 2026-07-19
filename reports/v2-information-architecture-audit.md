# V2.0 信息架构审计与实施记录

## 审计结论

- 框架：Quartz 4.5.2，Node.js 22，TypeScript 5.9，Preact 静态渲染。
- 内容来源：`content/` 下的 Markdown；文章 URL 由相对文件路径生成。
- 元数据：历史文章普遍包含 `title`、`date`、`category`、`tags`、`summary/description`、`status`，部分文章含系列与核心判断字段。
- 原有栏目：`theory`、`china`、`china-stage`、`civic-orderism`、`institution`。
- 首页与栏目索引：由 `scripts/generate-content-indexes.mjs` 在构建前生成，旧版推荐和分组集中在脚本中硬编码。
- 搜索：FlexSearch，本地索引标题、正文与标签；V2 已加入摘要、一级栏目、专题、核心概念与内容类型。
- SEO：已有 canonical、Open Graph、X Card、RSS、站点地图、robots 与 404；V2 增加中文 locale、Article、CollectionPage、BreadcrumbList，并对标签页设置 `noindex,follow`。
- 移动端：原有样式已经处理侧栏、正文宽度和横向溢出；V2 新增移动端折叠主导航、单列卡片、筛选控件与文章知识关联模块。
- 部署：`main` 分支由 GitHub Actions 构建并发布到 GitHub Pages；仓库同时保留 Wrangler 静态资产配置。本次未改变部署方式。
- 静态资料：两本 PDF 位于 `quartz/static/files/`，V2 保持原下载路径。

## 兼容策略

本次不移动文章文件、不修改文章正文、不批量修改历史标题。逻辑分类由 `content-migration-map.json` 提供，文章公开 URL 继续使用原物理路径。

旧栏目页 `theory`、`china-stage`、`institution` 保留为兼容入口；`china` 与 `civic-orderism` 在原路由上升级。没有新增必须执行的永久重定向。

## 配置与生成层

- `data/site.config.json`：品牌、文档、联系方式。
- `data/navigation.config.json`：六个一级导航。
- `data/sections.config.json`：四个一级栏目。
- `data/topics.config.json`：专题定义、核心判断、推荐顺序。
- `data/concepts.config.json`：核心概念框架。
- `data/reading-paths.config.json`：首页推荐与新读者路线。
- `content-migration-map.json`：全部文章的逻辑分类与元数据兼容层。
- `content-migration-needs-review.json`：不确定分类的人工复核清单。

## 移动端验收

在 390 × 844 视口验证：首页和栏目页无横向溢出；主导航折叠/展开正常；首页入口与专题卡片为单列；栏目筛选和分页正常，每页显示 10 篇；文章页知识关联模块为单列。
