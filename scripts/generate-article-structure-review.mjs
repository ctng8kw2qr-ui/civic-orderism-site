import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const migrationMap = JSON.parse(
  fs.readFileSync("content-migration-map.json", "utf8"),
);
const migrationSlugByTitle = new Map(
  migrationMap.map((entry) => [entry.title, entry.slug]),
);

const articleRoots = [
  "theory",
  "china",
  "china-stage",
  "civic-orderism",
  "institution",
];

const sampleReview = new Map([
  [
    "content/civic-orderism/what-civic-orderism-solves-if-you-read-only-one.md",
    {
      status: "否",
      reason: "核心判断集中，重点句均直接取自原文并覆盖主要逻辑节点。",
    },
  ],
  [
    "content/china/ccp-no-real-base.md",
    {
      status: "是",
      reason:
        "政治判断和时效性较强，正式全站迁移前建议复核脱离上下文后的语气。",
    },
  ],
  [
    "content/civic-orderism/what-is-committee-system.md",
    {
      status: "否",
      reason: "制度定义明确，核心判断与重点句均可在原文中直接对应。",
    },
  ],
]);

function walkMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function isArticleFile(filePath) {
  const basename = path.basename(filePath).toLocaleLowerCase();
  return (
    basename !== "index.md" &&
    !basename.startsWith("article_") &&
    !basename.includes("untitled") &&
    !basename.includes("未命名")
  );
}

function markdownCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function articleUrl(relativePath, frontmatter) {
  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim()
      ? frontmatter.slug.trim()
      : (migrationSlugByTitle.get(frontmatter.title) ??
        relativePath.replace(/^content\//, "").replace(/\.md$/, ""));
  return `/${slug.replace(/^\/+|\/+$/g, "")}`;
}

function validateCanonicalStructure(relativePath, frontmatter, keyPointCount) {
  if (frontmatter.coreJudgments === undefined) return;
  if (!Array.isArray(frontmatter.coreJudgments)) {
    throw new TypeError(`${relativePath}: coreJudgments 必须是数组。`);
  }
  if (
    frontmatter.coreJudgments.length < 2 ||
    frontmatter.coreJudgments.length > 5
  ) {
    throw new RangeError(`${relativePath}: coreJudgments 必须包含 2—5 条。`);
  }
  if (
    frontmatter.coreJudgments.some(
      (item) => typeof item !== "string" || item.trim() === "",
    )
  ) {
    throw new TypeError(`${relativePath}: coreJudgments 只能包含非空字符串。`);
  }
  if (keyPointCount < 2 || keyPointCount > 6) {
    throw new RangeError(`${relativePath}: 显式重点句应为 2—6 个。`);
  }
}

const articles = articleRoots
  .flatMap((root) => walkMarkdownFiles(path.join("content", root)))
  .filter(isArticleFile)
  .map((filePath) => {
    const relativePath = filePath.split(path.sep).join("/");
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);
    const coreJudgments = Array.isArray(data.coreJudgments)
      ? data.coreJudgments.filter((item) => typeof item === "string")
      : [];
    const legacyJudgments = [
      data.key_points,
      data.keyPoints,
      data.core_judgments,
    ].find(Array.isArray);
    const keyPointCount = (source.match(/^> \[!key-point\]\s*$/gm) ?? [])
      .length;
    validateCanonicalStructure(relativePath, data, keyPointCount);
    const review = sampleReview.get(relativePath);

    return {
      title:
        typeof data.title === "string" ? data.title : path.basename(filePath),
      path: relativePath,
      url: articleUrl(relativePath, data),
      coreJudgments,
      legacyJudgments: Array.isArray(legacyJudgments)
        ? legacyJudgments.length
        : 0,
      keyPointCount,
      reviewStatus: review?.status ?? "待阶段 2 评估",
      reviewReason:
        review?.reason ??
        (Array.isArray(legacyJudgments)
          ? "阶段 1 未处理；已有旧字段，后续迁移时需统一字段并复核重点句。"
          : "阶段 1 未处理；后续按栏目分批提取并复核。"),
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path, "zh-CN"));

const structured = articles.filter(
  (article) => article.coreJudgments.length >= 2 && article.keyPointCount > 0,
);
const explicitReview = articles.filter(
  (article) => article.reviewStatus === "是",
);
const pendingReview = articles.filter(
  (article) => article.reviewStatus === "待阶段 2 评估",
);
const legacyFieldCount = articles.filter(
  (article) => article.legacyJudgments > 0,
).length;

const lines = [
  "# 文章核心信息结构化复核报告",
  "",
  "> 本报告记录阶段 1 基础设施与三篇样本结果。未处理文章仅列入清单，尚未自动提取判断或改动正文。",
  "",
  "## 阶段 1 汇总",
  "",
  `- 文章总数：${articles.length}`,
  `- 阶段 1 已处理文章：${structured.length}`,
  `- 已成功添加规范 coreJudgments：${articles.filter((article) => article.coreJudgments.length >= 2).length}`,
  `- 已添加显式重点句标注：${articles.filter((article) => article.keyPointCount > 0).length}`,
  `- 明确建议人工复核：${explicitReview.length}`,
  `- 待阶段 2 分批评估：${pendingReview.length}`,
  `- 仍使用旧判断字段、待后续迁移：${legacyFieldCount}`,
  "",
  "规范字段为 `coreJudgments`，支持 2—5 条。规范重点句语法为：",
  "",
  "```markdown",
  "> [!key-point]",
  "> **这里放置直接取自正文的重要判断。**",
  "```",
  "",
  "## 文章清单",
  "",
  "| 标题 | 文件路径 | URL | 提取出的核心判断 | 重点句数量 | 建议人工复核 | 复核原因 |",
  "| --- | --- | --- | --- | ---: | --- | --- |",
  ...articles.map((article) => {
    const judgments = article.coreJudgments.length
      ? article.coreJudgments
          .map((judgment, index) => `${index + 1}. ${judgment}`)
          .join("<br>")
      : "—";
    return `| ${markdownCell(article.title)} | \`${article.path}\` | \`${article.url}\` | ${markdownCell(judgments)} | ${article.keyPointCount} | ${article.reviewStatus} | ${markdownCell(article.reviewReason)} |`;
  }),
  "",
  "## 阶段说明",
  "",
  "- 本阶段没有批量改写文章，也没有给未处理文章自动生成判断。",
  "- `待阶段 2 评估` 不等同于已经判定有问题，只表示尚未进入人工分批整理。",
  "- 解析器暂时兼容旧字段，保证未迁移文章的现有卡片不消失；新内容统一使用 `coreJudgments`。",
  "- 旧的整段粗体重点句识别仍保留兼容，新增和迁移内容统一使用显式 `key-point` 语法。",
  "",
];

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/article-structure-review.md",
  `${lines.join("\n")}\n`,
  "utf8",
);

console.log(
  `Generated reports/article-structure-review.md for ${articles.length} articles (${structured.length} structured).`,
);
