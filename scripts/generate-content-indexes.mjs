import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const contentDir = path.resolve("content")

const categories = [
  ["civic-orderism", "公民秩序主义", "公民秩序主义的核心理论、原则、制度设计、运行流程与权力监督机制。"],
  ["theory", "理论总纲", "理论框架、概念模型与制度判断。"],
  ["institution", "制度设计", "制度结构、治理机制与组织方案。"],
  ["china", "解析中共", "中共的组织结构、权力逻辑、官僚系统与结构性失效分析。"],
]

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath]
    return []
  })
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/")
}

function isIndexPage(relativePath) {
  return relativePath === "index.md" || relativePath === "articles.md" || relativePath.endsWith("/index.md")
}

function isTemporaryDraft(relativePath) {
  const filename = path.basename(relativePath).toLowerCase()
  return filename === "未命名.md" || filename === "untitled.md"
}

function slugFor(relativePath) {
  return relativePath.replace(/\.md$/, "")
}

function normalizeDate(value) {
  if (!value) return "2026-05-10"
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

function parseArticle(filePath) {
  const relativePath = toPosix(path.relative(contentDir, filePath))
  const raw = fs.readFileSync(filePath, "utf8")
  if (raw.trim() === "") return undefined
  const parsed = matter(raw)
  const category = relativePath.split("/")[0]
  const slug = slugFor(relativePath)
  return {
    category,
    date: normalizeDate(parsed.data.date),
    description: parsed.data.description ? String(parsed.data.description) : "",
    slug,
    title: parsed.data.title ? String(parsed.data.title) : path.basename(relativePath, ".md"),
  }
}

function articleLine(article) {
  const date = article.date ? `（${article.date}）` : ""
  return `- [[${article.slug}|${article.title}]]${date}`
}

function findArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug)
}

function findArticleByTitle(title) {
  return articles.find((article) => article.title.includes(title))
}

function articleLink(label, finder) {
  const article = finder()
  return article ? `[[${article.slug}|${label}]]` : label
}

function writeFile(filePath, body) {
  const targetPath = path.join(contentDir, filePath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, `${body.trimEnd()}\n`, "utf8")
}

const articles = walk(contentDir)
  .map((filePath) => [filePath, toPosix(path.relative(contentDir, filePath))])
  .filter(([, relativePath]) => !isIndexPage(relativePath))
  .filter(([, relativePath]) => !isTemporaryDraft(relativePath))
  .map(([filePath]) => parseArticle(filePath))
  .filter(Boolean)
  .filter((article) => categories.some(([key]) => key === article.category))
  .sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return a.title.localeCompare(b.title, "zh-CN")
  })

const byCategory = new Map(categories.map(([key]) => [key, []]))
for (const article of articles) {
  byCategory.get(article.category)?.push(article)
}

const homeLatest = articles.slice(0, 8).map(articleLine).join("\n")
const primaryLinks = [
  `- **[[china|解析中共]]**  \n  理解中共的组织结构、权力逻辑与系统性失效。`,
  `- **[[theory|阅读理论总纲]]**  \n  诊断现实局势，理解制度运行规律，判断未来秩序方向。`,
  `- **${articleLink("了解公民秩序主义", () => findArticleBySlug("civic-orderism/civic-orderism-manual"))}**  \n  理解这套理论的基本问题、核心立场与现实指向。`,
].join("\n")
const recommendedReading = [
  articleLink("公民秩序主义说明书", () => findArticleBySlug("civic-orderism/civic-orderism-manual")),
  "[[theory|理论总纲]]",
  articleLink("什么是委员会", () => findArticleBySlug("civic-orderism/what-is-committee-system")),
  articleLink("公民秩序主义下的选举逻辑", () => findArticleBySlug("civic-orderism/election-logic-under-civic-orderism")),
  articleLink("公民秩序主义对后台系统的重视", () =>
    findArticleBySlug("civic-orderism/backend-system-under-civic-orderism"),
  ),
  articleLink("公民秩序主义下国家运行的大概流程", () =>
    findArticleBySlug("civic-orderism/state-operation-process-under-civic-orderism"),
  ),
  articleLink("公民秩序主义最终要解决的问题", () =>
    findArticleBySlug("civic-orderism/what-civic-orderism-ultimately-solves"),
  ),
]
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")
writeFile(
  "index.md",
  `---
title: "公民秩序主义"
date: 2026-05-10
category: "首页"
tags:
  - index
description: "公民秩序主义网站首页。"
status: published
---

# 公民秩序主义

## CIVIC ORDERISM

一套面向中国现实与信息化时代的现代国家治理理论。

公民秩序主义关心的不是谁掌握权力，也不是哪一种口号取得胜利，而是国家能否成为一套可进入、可解释、可纠错、可追责的公共秩序系统。

它试图回答三个问题：

- 普通人遇到制度问题时，是否有门可进？
- 公共权力作出决定时，是否有理可讲？
- 国家面对错误和风险时，是否有能力纠偏？

公民秩序主义主张：

国家不是人民之上的神圣机器，而是服务公民生活秩序的公共系统。制度的价值，不在于制造服从，而在于降低社会摩擦、保障基本尊严、形成可持续的公共信任。

## 主要入口

${primaryLinks}

## 核心概念

- 秩序 ORDER
- 尊严 DIGNITY
- 自由 LIBERTY
- 平等 EQUALITY
- 责任 ACCOUNTABILITY

## 推荐阅读

${recommendedReading}

## 最新文章

${homeLatest || "暂无文章。"}

## 栏目

${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

## 联系方式

citizenorder@proton.me`,
)

writeFile(
  "articles.md",
  `---
title: "文章目录"
date: 2026-05-10
category: "索引"
tags:
  - index
description: "按栏目自动生成的全站文章目录。"
status: published
---

# 文章目录

网站已改为 Markdown 驱动，文章按栏目自动生成。旧文章入口保留在这里，避免旧链接失效。

## 分类目录

${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

${categories
  .map(([key, label]) => {
    const items = byCategory.get(key) ?? []
    return `## ${label}\n\n${items.length ? items.map(articleLine).join("\n") : "暂无文章。"}`
  })
  .join("\n\n")}`,
)

for (const [key, label, description] of categories) {
  const items = byCategory.get(key) ?? []
  writeFile(
    `${key}/index.md`,
    `---
title: "${label}"
date: 2026-05-10
category: "${label}"
tags:
  - ${key}
description: "${description}"
status: published
---

# ${label}

${description}

## 文章列表

${items.length ? items.map(articleLine).join("\n") : "暂无文章。"}`,
  )
}

console.log(`Generated indexes for ${articles.length} articles.`)
