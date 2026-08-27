# Pre-Mobilization Site Architecture Audit

生成日期：2026-08-27
生成分支：`arch/pre-mobilization-freeze`
生成基线：`b9fdf24`

## 一、审计方法

扫描全部构建产物（public/*.html，共 486 个页面）与顶层内容页 frontmatter，
按角色分类：Institutional Landing / Orientation / Political Route / Research Program /
Institutional Documents / Article / Archive / Legacy。

## 二、主要公开页面角色表

| URL | 当前角色 | 应有角色 | 职责重叠 | Legacy | 是否修改 | 优先级 | 影响 SEO/URL |
|---|---|---|---|---|---|---|---|
| `/` | 首页 | Institutional Landing | 无 | 否 | 冻结（仅修 bug） | — | 否 |
| `/about` | 关于 | Institutional Landing | 与 start-here 有解释重叠 | 否 | P1 收口 | P1 | 否 |
| `/preparation` | 董事会筹备 | Institutional Landing | 无 | 否 | 冻结 | — | 否 |
| `/start-here` | 5分钟了解 | Orientation | 无 | 否 | P1 文案统一 | P1 | 否 |
| `/articles` | 阅读地图（旧三线） | Orientation / Reading Map | 旧十段式残余 | 否 | P0 重构 | P0 | 否（URL 稳定） |
| `/civic-orderism` | 政治路线（10-Stage） | Political Route | 缺核心政治总论入口、缺全部研究入口 | 否 | P0 补强 | P0 | 否 |
| `/china-future` | 中国未来 | Political Route | 栏目偏薄、缺研究框架 | 否 | P1 补强架构 | P1 | 否 |
| `/china` | 解析中共 | Research Program | 无（已冻结） | 否 | 冻结 | — | 否 |
| `/topics` | 专题 | Research Program | 无 | 否 | 冻结 | — | 否 |
| `/concepts` | 核心概念 | Research Program | 无 | 否 | 冻结 | — | 否 |
| `/theory` | 研究与出版 | Research Program | 部分与 /articles/all 重叠 | 否 | 低优先级（本轮不改） | P3 | 否 |
| `/articles/all` | 全部文章 | Archive | 需确认无阅读路径模块 | 否 | P0 确认职责 | P0 | 否 |
| `/participate` | 参与（开放协作） | 建立联系 | 与组织身份边界冲突 | 否 | P0 重构 | P0 | 否 |
| `/organization-manual` | 旧组织手册 | Legacy | — | **是** | 已处理（301→/preparation） | 已完 | 否（保留重定向） |
| `/privacy` | —（不存在） | Institutional Document | — | 否 | P0 新增 | P0 | 新增 |
| `/introduction-manual` | 介绍手册 | Institutional Document | 无 | 否 | 冻结 | — | 否 |
| `/copyright` | 版权 | Legal | 无 | 否 | 冻结 | — | 否 |
| `/article_priority_index` | 旧别名 | Legacy | — | **是** | 已处理（301→/） | 已完 | 否 |
| `/article_summaries` | 旧别名 | Legacy | — | **是** | 已处理（301→/） | 已完 | 否 |
| `/start` | 旧别名 | Legacy | — | **是** | 已处理（301→/start-here） | 已完 | 否 |

## 三、已确认的 Legacy / 已处理项

1. `/organization-manual` → 301 → `/preparation`（`_redirects` 已配置；validate-v2 校验通过）
2. `/article_priority_index` → 301 → `/`（已配置）
3. `/article_summaries` → 301 → `/`（已配置）
4. `/start` → 301 → `/start-here`（已配置）
5. `china-stage/`、`institution-design/`、`institution/` 等次级归档存在，但不进入主路径，保留

## 四、待处理问题清单（Phase 2 / P0）

1. `/civic-orderism/` 缺少「核心政治总论」固定入口（《这一次，让中国成为你的骄傲》）
2. `/civic-orderism/` 缺少「全部研究」出口（应指向 Archive）
3. `/articles` 仍为旧"5分钟/30分钟/深度阅读"结构，需重构为三条路线
4. `/articles/all` 需确认职责纯粹为 Archive（检查是否含阅读路径模块）
5. `/participate` 呈现为开放协作结构，需重构为「建立联系」
6. `/privacy` 缺失，需新增

## 五、待处理问题清单（Phase 3 / P1）

1. `/start-here` 核心定义文案统一为"政治路线"第一身份
2. `/about` 与 `/start-here` 解释重叠评估
3. `/china-future` 研究框架补强（国家连续 / 行政连续 / 公共服务连续 / 法律连续性 / 地方治理 / 财政与社会保障 / 社会秩序 / 政治责任）
4. 全站"公民秩序主义是什么"定义统一
5. CTA 层级统一（5分钟 / 理解政治路线 / 阅读研究 / 董事会筹备 / 建立联系）

## 六、冻结区（本轮不修改）

- `/` 首页（仅修 bug）
- `/preparation`、`/china`、`/topics`、`/concepts`、`/introduction-manual`、`/copyright`
- Institutional Design System / 品牌识别 / Footer / 导航
