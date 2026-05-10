import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const contentDir = path.resolve("content")

const categories = [
  ["civic-orderism", "公民秩序主义", "公民秩序主义的核心理论、原则、制度设计、运行流程与权力监督机制。"],
  ["theory", "理论总纲", "理论框架、概念模型与制度判断。"],
  ["reality", "现实解析", "现实政治、公共事件与结构性问题分析。"],
  ["institution", "制度设计", "制度结构、治理机制与组织方案。"],
  ["china", "中国观察", "中国社会、政治与治理结构观察。"],
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
writeFile(
  "index.md",
  `---
title: "公民秩序主义"
tags:
  - index
---

# 公民秩序主义

CIVIC ORDERISM

解释结构性问题，不参与情绪化舆论构建。

## 栏目

${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

## 最新文章

${homeLatest || "暂无文章。"}

## 核心概念

- 秩序 ORDER
- 自由 LIBERTY
- 平等 EQUALITY

## 联系方式

citizenorder@proton.me`,
)

writeFile(
  "articles.md",
  `---
title: "文章目录"
tags:
  - index
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
tags:
  - ${key}
---

# ${label}

${description}

## 文章列表

${items.length ? items.map(articleLine).join("\n") : "暂无文章。"}`,
  )
}

console.log(`Generated indexes for ${articles.length} articles.`)
