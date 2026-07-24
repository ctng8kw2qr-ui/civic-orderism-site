# 全站文章排版审计

## 审计范围

- 文章源文件：89 篇
- 栏目路径：`theory/`、`china/`、`china-stage/`、`civic-orderism/`、`institution/`
- 渲染链路：Quartz Markdown → HAST → Preact `Content` 组件
- 现有正文容器：`article.popover-hint`

## 主要原因

1. 正文没有专属 class，文章页与栏目页共同使用通用 `article` 选择器。
2. `base.scss` 提供一套全局段落、列表、标题、引用、图片和分隔线规则。
3. `custom.scss` 又分别通过 `article`、`body:not([data-slug="index"]) article` 和移动端媒体查询覆盖行高与间距。
4. 组件样式继续为核心判断、重点句和文章知识卡片设置内部间距。普通正文规则缺少明确边界时，容易与这些组件发生叠加。
5. 桌面端与移动端分别存在 `1.82`、`1.8`、`1.78`、`1.75`、`1.7` 等多组行高，最终结果依赖选择器优先级。

## 源文件异常扫描

| 检查项                          | 涉及文件 | 出现次数 | 处理                             |
| ------------------------------- | -------: | -------: | -------------------------------- |
| 连续 `<br>`                     |        0 |        0 | 无需处理                         |
| 空 `<p></p>`                    |        0 |        0 | 无需处理                         |
| 内联 `margin` / `line-height`   |        0 |        0 | 无需处理                         |
| `&nbsp;` 制造空白               |        0 |        0 | 无需处理                         |
| 连续多余空行                    |        0 |        0 | 无需处理                         |
| 带 class/style 的旧正文 wrapper |        0 |        0 | 无需处理                         |
| 单独 `<br>`                     |        8 |       21 | 保留；均用于重点句或短句内部换行 |

所有 89 篇文章均有一级标题。仅
`theory/overseas-political-movements-fail.md` 没有二级标题；该文为短文结构，不属于格式错误。

## 批量清理决定

不修改文章源文件。扫描没有发现可安全批量清理的异常，现有 21 个单独
`<br>` 具有明确的句内分行作用。因而本次不会改写正文、标题、论点、URL、分类或文章排序，语义影响为零。

## 实施规则

- 为真正的文章页增加唯一正文入口 `.article-content`。
- 首页、栏目页、专题页和归档页不套用长文排版规则。
- 普通正文的段落、标题、列表、普通引用、加粗、分隔线、图片与图注统一由一个样式文件控制。
- Obsidian callout、重点句、核心判断、知识卡片、相关推荐和文章结尾组件继续使用各自的 scoped 样式。
- 删除会覆盖正文节奏的高优先级桌面/移动端旧规则，保留非文章页面现有视觉规则。

## 最终排版参数

| 参数           | 桌面/平板         | 移动端         |
| -------------- | ----------------- | -------------- |
| 正文字号       | 17px              | 16px           |
| 正文行高       | 1.9（32.3px）     | 1.85（29.6px） |
| 段落底部间距   | 1.25em（21.25px） | 1.25em（20px） |
| H2 上/下间距   | 2.4em / 0.9em     | 2.4em / 0.9em  |
| H3 上/下间距   | 2em / 0.75em      | 2em / 0.75em   |
| 列表缩进       | 1.5em（25.5px）   | 1.25em（20px） |
| 列表项间距     | 0.45em            | 0.45em         |
| 普通引用外间距 | 1.5em             | 1.5em          |
| 普通引用内边距 | 0.9em 1.1em       | 0.8em 0.9em    |

文章最后一个段落、列表、普通引用或 figure 的底部间距统一归零。

## 自动化验证

- TypeScript 类型检查：通过
- 本次修改文件的 Prettier 检查：通过
- 单元测试：84/84 通过
- Quartz 静态构建：130 个输入文件，439 个输出文件
- 文章排版校验：89/89 个构建页面包含 `.article-content`
- 禁止间距标记检查：通过
- V2 内容数据校验：通过
- 历史正文安全检查：通过，抽样文章正文保持字节级一致
- 内部链接检查：405 个 HTML 页面中的 23,246 个链接全部通过
- 横向溢出：15 篇文章在桌面、平板、移动端均为 0

仓库级 `npm run check` 中的 TypeScript 阶段通过，但全仓 Prettier
阶段仍会报告 199 个既有文件未格式化。它们覆盖历史文章、Quartz
上游源码和静态手册，不是本次修改产生的问题；为避免改写文章正文及制造大范围无关 diff，本次没有批量格式化这些既有文件。

## 浏览器抽查页面

1. `civic-orderism/information-age-and-political-transition`
2. `china-stage/three-cleans-era-political-economic-cultural-contraction`
3. `china/ccp-bureaucracy-historical-bill`
4. `institution/despotism-cancer-ming-1566`
5. `theory/democracy-still-exists-but-cannot-penetrate-reality`
6. `theory/overseas-political-movements-fail`
7. `theory/no-accountability-lie-flat-mentality`
8. `civic-orderism/why-no-bicameral-parliament`
9. `civic-orderism/why-civic-orderism-emphasizes-experience-and-records`
10. `civic-orderism/why-committees-cannot-directly-take-cases`
11. `civic-orderism/top-level-power-structure-under-civic-orderism`
12. `civic-orderism/backend-system-under-civic-orderism`
13. `civic-orderism/why-information-transparency`
14. `civic-orderism/what-is-committee-system`
15. `china/xi-solved-organization-not-reality`

### 桌面端（1440 × 1000）

- 15 篇均使用唯一正文容器。
- 正文、段落、标题、普通引用、列表计算样式一致。
- 长文章右侧目录正常显示；短文没有目录，不产生空占位。
- 正文与右侧目录没有重叠。
- 核心判断卡片、重点句 callout 和普通 blockquote 保持独立样式。

### 平板端（900 × 1024）

- 15 篇均无横向溢出。
- 正文和核心判断卡片均在视口内。
- 右侧目录不会与正文重叠。

### 移动端（390 × 844）

- 15 篇均使用 16px / 1.85。
- 列表缩进为 20px，普通引用左右内边距为 14.4px。
- 核心判断、重点句、普通引用和正文均未溢出。
- 右侧桌面目录隐藏，文章末尾没有多余底部空白。
- 亮色与深色主题均保持可读。

当前 89 篇文章没有正文图片，因此图片与图注规则已完成 CSS
结构验证，但没有可用于浏览器视觉抽查的现有文章样本。
