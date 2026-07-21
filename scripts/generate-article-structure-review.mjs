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

const articleRootLabels = new Map([
  ["theory", "理论文章"],
  ["china", "解析中共"],
  ["china-stage", "中国未来"],
  ["civic-orderism", "公民秩序主义"],
  ["institution", "制度设计"],
]);

const reviewMetadata = new Map([
  [
    "content/civic-orderism/what-civic-orderism-solves-if-you-read-only-one.md",
    {
      phase: "阶段 1",
      originalJudgmentField: "key_points",
      status: "否",
      reason: "核心判断集中，重点句均直接取自原文并覆盖主要逻辑节点。",
    },
  ],
  [
    "content/china/ccp-no-real-base.md",
    {
      phase: "阶段 1",
      originalJudgmentField: "key_points",
      status: "是",
      reason:
        "政治判断和时效性较强，正式全站迁移前建议复核脱离上下文后的语气。",
    },
  ],
  [
    "content/civic-orderism/what-is-committee-system.md",
    {
      phase: "阶段 1",
      originalJudgmentField: "无",
      status: "否",
      reason: "制度定义明确，核心判断与重点句均可在原文中直接对应。",
    },
  ],
  [
    "content/civic-orderism/civic-orderism-manual.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "否",
      reason: "总纲结构清晰，提取内容直接覆盖国家定位、双轨分工与系统目标。",
    },
  ],
  [
    "content/civic-orderism/why-civic-orderism.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "同时讨论价值、路线与秩序承接，存在多个中心结论，并包含较强政治判断。",
    },
  ],
  [
    "content/civic-orderism/what-civic-orderism-ultimately-solves.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "否",
      reason: "中心定义集中，核心判断与重点句均能在原文中直接对应。",
    },
  ],
  [
    "content/civic-orderism/peaceful-state-transition.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason: "涉及国家转轨、责任认定和非清算原则，政治判断与未来路线均较强。",
    },
  ],
  [
    "content/civic-orderism/why-civic-orderism-is-easier-to-succeed.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "标题与正文包含接替难度的比较性预测，脱离上下文后需要人工复核语气。",
    },
  ],
  [
    "content/civic-orderism/state-must-rely-on-systems-not-drivers.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "以中共集权作为反面案例，包含较强现实政治判断，重点句需结合全文理解。",
    },
  ],
  [
    "content/civic-orderism/state-operation-process-under-civic-orderism.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "包含完整国家运行流程与多个机构边界，属于尚需交叉核对的详细制度设计。",
    },
  ],
  [
    "content/civic-orderism/why-dual-track-committee-administration.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "涉及委员会、行政与民选政治官员的边界，需要与其他制度设计文章统一复核。",
    },
  ],
  [
    "content/civic-orderism/committee-administration-opposite-incentives.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "详细界定委员会与行政的相反激励，需与双轨制文章交叉核对表述一致性。",
    },
  ],
  [
    "content/civic-orderism/backend-system-under-civic-orderism.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "后台、培训和专业支撑方案较具体，可能反映较早制度版本，建议人工复核。",
    },
  ],
  [
    "content/civic-orderism/why-committees-cannot-directly-take-cases.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "否",
      reason: "入口权与判断权的边界单一明确，结构化内容可逐句对应原文。",
    },
  ],
  [
    "content/civic-orderism/why-information-transparency.md",
    {
      phase: "阶段 2：公民秩序主义第一批",
      originalJudgmentField: "无",
      status: "是",
      reason:
        "涉及白皮书中的统一发布应用和只读接口，可能属于较早技术方案表述。",
    },
  ],
]);

const civicOrderismBatchOnePaths = [
  "content/civic-orderism/civic-orderism-manual.md",
  "content/civic-orderism/why-civic-orderism.md",
  "content/civic-orderism/what-civic-orderism-ultimately-solves.md",
  "content/civic-orderism/peaceful-state-transition.md",
  "content/civic-orderism/why-civic-orderism-is-easier-to-succeed.md",
  "content/civic-orderism/state-must-rely-on-systems-not-drivers.md",
  "content/civic-orderism/state-operation-process-under-civic-orderism.md",
  "content/civic-orderism/why-dual-track-committee-administration.md",
  "content/civic-orderism/committee-administration-opposite-incentives.md",
  "content/civic-orderism/backend-system-under-civic-orderism.md",
  "content/civic-orderism/why-committees-cannot-directly-take-cases.md",
  "content/civic-orderism/why-information-transparency.md",
];

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
      data.corePoints,
      data.keyJudgments,
      data.keyPoints,
      data.key_points,
      data.summaryPoints,
      data.highlights,
      data.conclusions,
      data.core_judgments,
    ].find(Array.isArray);
    const keyPointCount = (source.match(/^> \[!key-point\]\s*$/gm) ?? [])
      .length;
    validateCanonicalStructure(relativePath, data, keyPointCount);
    const review = reviewMetadata.get(relativePath);
    const sourceRoot = relativePath.split("/")[1];

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
      sourceGroup: articleRootLabels.get(sourceRoot) ?? sourceRoot,
      phase: review?.phase ?? "未处理",
      originalJudgmentField: review?.originalJudgmentField ?? "未评估",
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
const migratedLegacyFieldCount = articles.filter(
  (article) =>
    article.phase !== "未处理" &&
    article.originalJudgmentField !== "无" &&
    article.originalJudgmentField !== "未评估",
).length;
const batchOneArticles = civicOrderismBatchOnePaths.map((articlePath) => {
  const article = articles.find((item) => item.path === articlePath);
  if (!article) throw new Error(`阶段 2 第一批文章不存在：${articlePath}`);
  return article;
});
const sourceProgress = [...articleRootLabels.values()].map((label) => {
  const groupArticles = articles.filter(
    (article) => article.sourceGroup === label,
  );
  return {
    label,
    total: groupArticles.length,
    structured: groupArticles.filter(
      (article) =>
        article.coreJudgments.length >= 2 && article.keyPointCount > 0,
    ).length,
  };
});

const lines = [
  "# 文章核心信息结构化复核报告",
  "",
  "> 本报告记录阶段 1 基础设施、三篇样本，以及阶段 2 公民秩序主义第一批迁移结果。未处理文章仅列入清单。",
  "",
  "## 汇总",
  "",
  `- 文章总数：${articles.length}`,
  `- 累计处理数量：${structured.length}`,
  `- 尚未处理数量：${articles.length - structured.length}`,
  `- 已成功添加规范 coreJudgments：${articles.filter((article) => article.coreJudgments.length >= 2).length}`,
  `- 已添加显式重点句标注：${articles.filter((article) => article.keyPointCount > 0).length}`,
  `- 已迁移旧字段数量：${migratedLegacyFieldCount}`,
  `- 明确建议人工复核：${explicitReview.length}`,
  `- 待阶段 2 分批评估：${pendingReview.length}`,
  `- 仍使用旧判断字段、待后续迁移：${legacyFieldCount}`,
  "",
  "### 各栏目处理进度",
  "",
  ...sourceProgress.map(
    (group) => `- ${group.label}：${group.structured}/${group.total}`,
  ),
  "",
  "规范字段为 `coreJudgments`，支持 2—5 条。规范重点句语法为：",
  "",
  "```markdown",
  "> [!key-point]",
  "> **这里放置直接取自正文的重要判断。**",
  "```",
  "",
  "## 阶段 2：公民秩序主义第一批",
  "",
  `- 本批处理文章：${batchOneArticles.length}`,
  `- 本批迁移旧字段：${batchOneArticles.filter((article) => article.originalJudgmentField !== "无").length}`,
  `- 本批新增显式重点句：${batchOneArticles.reduce((total, article) => total + article.keyPointCount, 0)}`,
  `- 本批建议人工复核：${batchOneArticles.filter((article) => article.reviewStatus === "是").length}`,
  "",
  "| 标题 | 文件路径 | URL | 原有判断字段 | 新 coreJudgments | 重点句数量 | 是否人工复核 | 复核原因 | 是否改变正文 | 是否改变 URL |",
  "| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |",
  ...batchOneArticles.map((article) => {
    const judgments = article.coreJudgments
      .map((judgment, index) => `${index + 1}. ${judgment}`)
      .join("<br>");
    return `| ${markdownCell(article.title)} | \`${article.path}\` | \`${article.url}\` | ${article.originalJudgmentField} | ${markdownCell(judgments)} | ${article.keyPointCount} | ${article.reviewStatus} | ${markdownCell(article.reviewReason)} | 否（仅增加结构字段与展示标记，正文文字未改变） | 否 |`;
  }),
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
  "- 阶段 2 第一批只处理公民秩序主义目录中的 12 篇文章，没有给未处理文章自动生成判断。",
  "- 第一批正文只增加显式重点句展示标记；正文文字、标题、日期、分类、slug 与 URL 均未改变。",
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
