import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDir = path.resolve("content");
const siteDescription =
  "公民秩序主义关注工业时代旧秩序在信息化时代的失效，并尝试提出一种面向中国现实、可进入、可解释、可纠错、可追责的公共秩序方案。";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
    return [];
  });
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function isIndexPage(relativePath) {
  return (
    relativePath === "index.md" ||
    relativePath === "articles.md" ||
    relativePath.endsWith("/index.md")
  );
}

function slugFor(relativePath) {
  return relativePath.replace(/\.md$/, "");
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function parseArticle(filePath) {
  const relativePath = toPosix(path.relative(contentDir, filePath));
  const raw = fs.readFileSync(filePath, "utf8");
  if (raw.trim() === "") return undefined;
  const parsed = matter(raw);
  return {
    date: normalizeDate(parsed.data.date),
    hasDate: Boolean(parsed.data.date),
    listed: parsed.data.listed !== false,
    slug: slugFor(relativePath),
    title: parsed.data.title ? String(parsed.data.title) : path.basename(relativePath, ".md"),
  };
}

function compareArticlesByDateDesc(a, b) {
  if (a.hasDate && !b.hasDate) return -1;
  if (!a.hasDate && b.hasDate) return 1;
  if (a.hasDate && b.hasDate) {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
  }
  return a.title.localeCompare(b.title, "zh-CN");
}

const articles = walk(contentDir)
  .map((filePath) => [filePath, toPosix(path.relative(contentDir, filePath))])
  .filter(([, relativePath]) => !isIndexPage(relativePath))
  .filter(([, relativePath]) => !path.basename(relativePath).startsWith("article_"))
  .filter(([, relativePath]) => !["未命名.md", "untitled.md"].includes(path.basename(relativePath).toLowerCase()))
  .map(([filePath]) => parseArticle(filePath))
  .filter(Boolean)
  .filter((article) => article.listed)
  .sort(compareArticlesByDateDesc);

function findArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}

function articleLine(article) {
  const date = article.hasDate && article.date ? `（${article.date}）` : "";
  return `- [[${article.slug}|${article.title}]]${date}`;
}

function articleLines(slugs, { sort = "date" } = {}) {
  const matched = slugs.map(findArticleBySlug).filter(Boolean);
  if (sort === "date") matched.sort(compareArticlesByDateDesc);
  return matched.map(articleLine).join("\n") || "暂无文章。";
}

function articlesForSlugs(slugs, { sort = "date" } = {}) {
  const matched = slugs
    .map(findArticleBySlug)
    .filter(Boolean);
  if (sort === "date") matched.sort(compareArticlesByDateDesc);
  return matched;
}

function articleLinks(slugs, options = {}) {
  return articlesForSlugs(slugs, options).map((article) => `[[${article.slug}|${article.title}]]`);
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderCard(heading, description, slugs, moreSlug) {
  const links = articleLinks(slugs, { sort: "date" }).slice(0, 3);
  const moreLine = moreSlug ? `\n\n- [[${moreSlug}|查看更多 →]]` : "";
  return `<section class="article-category-card">\n\n### ${heading}\n\n<p class="article-category-description">${description}</p>\n\n${bulletList(links)}${moreLine}\n\n</section>`;
}

function renderLinkCard(heading, description, items) {
  return `<section class="article-category-card">\n\n### ${heading}\n\n<p class="article-category-description">${description}</p>\n\n${bulletList(items)}\n\n</section>`;
}

function writeFile(filePath, body) {
  const targetPath = path.join(contentDir, filePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${body.trimEnd()}\n`, "utf8");
}

const slugs = {
  oldOrder: [
    "theory/democracy-still-exists-but-cannot-penetrate-reality",
    "theory/why-party-politics-is-becoming-a-low-dimensional-function",
    "theory/end-of-party-politics-in-information-age",
    "theory/us-industrial-system-cannot-carry-information-age",
    "theory/us-separation-of-powers-integrative-capacity-crisis",
    "theory/information-age-erodes-us-integrative-capacity",
    "theory/us-supreme-court-partisan-final-battleground",
    "theory/costly-industrial-governance-information-age",
    "china/industrial-system-failure-in-information-age",
    "theory/ccp-completed-historical-task-refuses-exit",
    "theory/internal-change-external-change",
    "theory/procedural-accountability-organized-power",
    "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
    "theory/modern-social-syndrome",
    "theory/ai-monitoring-organizational-friction",
    "institution/despotism-cancer-ming-1566",
  ],
  ccp: [
    "theory/party-state-structural-failure",
    "china/information-age-impact-on-ccp-mechanisms",
    "theory/high-rigidity-system-ccp",
    "china/xi-power-centralization",
    "china/xi-solved-organization-not-reality",
    "china/ccp-power-network-not-line",
    "china/political-machine-rewards-and-limits",
    "china/party-power-logic-and-ccp-goal-vacuum",
    "china/emotional-link-breakdown-and-regime-collapse",
    "china/ccp-bureaucracy-double-deadlock",
    "theory/ccp-high-fragility-dysfunction",
    "china/when-high-ranking-officials-are-no-longer-safe",
    "china/bureaucratic-system-under-purges",
    "china/xi-succession-crisis-gray-rhino",
    "china/ccp-from-faith-community-to-black-box-post",
    "china/elite-sandification-ming-bureaucrats-ccp",
    "china/organization-credit-retired-officials",
    "china/ccp-2018-new-reform-opening",
    "china/Macro Narratives, Opportunity Incentives, and High Fragility",
    "china/propaganda-system-hollowing-out",
  ],
  stage: [
    "china-stage/china-manufacturing-cannot-stop",
    "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
    "china/ccp-reform-political-balance-deadlock",
    "china/ccp-bureaucracy-historical-bill",
    "theory/no-accountability-lie-flat-mentality",
    "theory/trapped-by-process",
    "china/chicken-and-cage",
    "china/maginot-line-of-stability-maintenance",
    "theory/social-change-dynamics-when-system-no-longer-worth-it",
  ],
  international: [
    "china/taiwan-war-controllable-escalation-illusion",
    "theory/overseas-political-movements-fail",
    "china/taiwan-war-risk",
    "china/diplomacy-root",
    "china/pla-political-subject-myth",
  ],
  civicTheory: [
    "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
    "civic-orderism/civic-orderism-manual",
    "civic-orderism/state-must-rely-on-systems-not-drivers",
    "civic-orderism/what-civic-orderism-ultimately-solves",
    "civic-orderism/why-not-left-right-democracy-autocracy",
    "civic-orderism/why-weaken-party-politics",
    "civic-orderism/public-politics-without-party-dominance",
    "civic-orderism/why-focus-on-invisible-power-nodes",
    "civic-orderism/why-against-moral-narrative",
    "civic-orderism/why-emphasize-reciprocity-and-equality",
    "civic-orderism/why-civic-orderism-is-easier-to-succeed",
  ],
  mechanisms: [
    "civic-orderism/what-is-committee-system",
    "civic-orderism/state-operation-process-under-civic-orderism",
    "civic-orderism/top-level-power-structure-under-civic-orderism",
    "civic-orderism/why-dual-track-committee-administration",
    "civic-orderism/committee-administration-opposite-incentives",
    "civic-orderism/why-committees-cannot-directly-take-cases",
    "civic-orderism/election-logic-under-civic-orderism",
    "civic-orderism/why-elections-reject-political-donations",
    "civic-orderism/why-part-time-representatives",
    "civic-orderism/why-proposals-from-social-organizations",
    "civic-orderism/why-not-simple-separation-of-powers",
    "civic-orderism/why-no-bicameral-parliament",
    "civic-orderism/backend-system-under-civic-orderism",
    "civic-orderism/why-information-transparency",
    "civic-orderism/why-justice-serves-reality",
    "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
  ],
};

const firstReadingSection = `<div class="home-first-reading first-time-reading">

## 第一次来，按这个顺序读

如果你第一次来到这里，不需要按发布时间阅读。建议先理解旧秩序为什么失效，再理解中共组织为什么失灵，最后进入公民秩序主义的制度回应。

${bulletList(["[《公民秩序主义介绍手册》PDF](/files/civic-orderism-introduction-manual.pdf)"].concat(articleLinks([
  "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  "theory/why-party-politics-is-becoming-a-low-dimensional-function",
  "theory/party-state-structural-failure",
  "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
  "civic-orderism/civic-orderism-manual",
  "civic-orderism/why-dual-track-committee-administration",
])).concat(["[[articles|阅读地图]]"]))}

</div>`;

const introductionManualEntry = `<p class="home-manual-note">完整入门说明可先阅读<a href="/introduction-manual">《公民秩序主义介绍手册》</a>。</p>

<section class="organization-manual-entry introduction-manual-entry manual-entry-card">

<p class="resource-label">入门手册</p>

## 公民秩序主义介绍手册

<p class="resource-subtitle">信息化时代的国家秩序方案</p>

如果你第一次接触公民秩序主义，可以先阅读这份介绍手册。它以较短篇幅说明公民秩序主义的基本理念、核心制度设计，以及它为什么是一套面向信息化时代的国家秩序方案。

<div class="resource-actions manual-entry-actions">
  <a class="resource-button resource-button-primary manual-entry-button" href="/files/civic-orderism-introduction-manual.pdf">下载 PDF</a>
  <button class="resource-button manual-entry-button" type="button" data-manual-modal="introduction">阅读说明</button>
</div>

</section>`;

const organizationManualEntry = `<section class="organization-manual-entry manual-entry-card">

<p class="resource-label">正式资料</p>

## 公民秩序主义组织手册

<p class="resource-subtitle">了解我们的世界判断、组织原则与加入方式。</p>

这份手册不是宣言，也不是情绪动员，而是一份进入说明书。它用于说明公民秩序主义为什么存在、我们如何判断现实、为什么暂不建立开放群组，以及感兴趣的人如何通过邮件联系。

<div class="resource-actions manual-entry-actions">
  <a class="resource-button resource-button-primary manual-entry-button" href="/files/civic-orderism-organization-manual.pdf">下载 PDF</a>
  <button class="resource-button manual-entry-button" type="button" data-manual-modal="organization">阅读说明</button>
</div>

</section>`;

const themedReading = [
  [
    "旧秩序失效",
    "解释政党政治、工业型治理、美国制度和程序问责，为什么越来越难以处理信息化时代的高耦合社会。",
    [
      "theory/why-party-politics-is-becoming-a-low-dimensional-function",
      "theory/us-industrial-system-cannot-carry-information-age",
      "theory/ccp-completed-historical-task-refuses-exit",
    ],
    "theory",
  ],
  [
    "解析中共",
    "分析中共作为超大型执政组织，如何在权力集中、反馈失真、责任不透明和组织信用衰减中走向失灵。",
    [
      "theory/party-state-structural-failure",
      "china/ccp-power-network-not-line",
      "china/bureaucratic-system-under-purges",
    ],
    "china",
  ],
  [
    "中国阶段判断",
    "解释社保、医保、金融、基层治理、社会成本与普通人困境，如何成为组织失效在社会层面的外部表现。",
    [
      "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
      "china/ccp-reform-political-balance-deadlock",
      "china/ccp-bureaucracy-historical-bill",
    ],
    "china-stage",
  ],
  [
    "公民秩序主义",
    "说明公民秩序主义不是简单换人掌权，而是试图重建国家与普通人之间的秩序关系、责任结构和制度通道。",
    [
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
      "civic-orderism/civic-orderism-manual",
      "civic-orderism/what-is-committee-system",
    ],
    "civic-orderism",
  ],
  [
    "制度机制",
    "集中说明公民秩序主义的具体运行机制：问题如何进入系统，责任如何被追踪，权力如何被限制，错误如何被纠正。",
    [
      "civic-orderism/why-dual-track-committee-administration",
      "civic-orderism/committee-administration-opposite-incentives",
      "civic-orderism/why-information-transparency",
    ],
    "institution",
  ],
]
  .map(([heading, description, items, moreSlug]) => renderCard(heading, description, items, moreSlug))
  .concat([
    renderLinkCard(
      "阅读地图",
      "不是按发布时间排列文章，而是按照问题路径组织阅读：从旧秩序失效，到中共组织失灵，再到公民秩序主义的制度回应。",
      [
        "[旧世界为什么失效](articles#一旧世界为什么失效)",
        "[中共这个组织为什么走向失灵](articles#二中共这个组织为什么走向失灵)",
        "[公民秩序主义的基本理论](articles#六公民秩序主义的基本理论)",
        "[进入阅读地图 →](articles)",
      ],
    ),
  ])
  .join("\n\n");

const homeLatest = articles
  .filter((article) => article.slug !== "civic-orderism/what-civic-orderism-solves-if-you-read-only-one")
  .slice(0, 3)
  .map(articleLine)
  .join("\n");

writeFile(
  "index.md",
  `---
title: "公民秩序主义"
date: 2026-05-10
category: "首页"
tags:
  - index
description: "${siteDescription}"
status: published
---

<div class="home-hero-heading">
  <h1 class="home-hero-title">
    <img src="static/logo.png" alt="公民秩序主义 Logo" />
    <span>公民秩序主义</span>
  </h1>
</div>

## CIVIC ORDERISM

从现实痛感进入结构判断，再进入制度回应。

本站关注两个问题：

第一，工业时代形成的政党政治、官僚体系和国家治理模式，为什么在信息化时代越来越难以解释、整合和回应复杂社会？

第二，在旧秩序失效之后，中国是否可能建立一种更可进入、可解释、可纠错、可追责的公共秩序？

公民秩序主义不是情绪化反对，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的国家治理理论。

${introductionManualEntry}

${organizationManualEntry}

${firstReadingSection}

## 按主题阅读

<p class="home-themed-reading-note">从旧秩序失效，到中共组织失灵，再到现实阶段判断、理论入口和制度机制。</p>

<div class="article-category-grid home-themed-reading-grid">

${themedReading}

</div>

## 近期补充文章

${homeLatest || "暂无文章。"}

## 全部栏目

- [[theory|旧秩序失效]]
- [[china|解析中共]]
- [[china-stage|中国阶段判断]]
- [[civic-orderism|公民秩序主义]]
- [[institution|制度机制]]
- [[articles|阅读地图]]

## 联系方式

严肃交流、资料反馈与建设性讨论，可通过以下方式联系：

邮箱：[citizenorder@proton.me](mailto:citizenorder@proton.me)
X 平台：[@CivicOrderism](https://x.com/CivicOrderism)
网站：[civicorderism.com](https://civicorderism.com)

为便于有效沟通，建议先阅读“第一次来，按这个顺序读”中的基础文章。`,
);

writeFile(
  "theory/index.md",
  `---
title: "旧秩序失效"
date: 2026-05-10
category: "旧秩序失效"
tags:
  - theory
description: "解释工业时代形成的政党政治、官僚体系和治理模式，为什么在信息化时代越来越难以承载复杂社会。"
status: published
---

# 旧秩序失效

这里讨论的不是某一个国家或某一种制度的表面失败，而是工业时代形成的政党政治、官僚体系和国家治理模式，在信息化时代为什么越来越难以解释、整合和回应复杂社会。

## 文章列表

### 一、工业时代制度局限

${articleLines([
  "theory/why-party-politics-is-becoming-a-low-dimensional-function",
  "theory/end-of-party-politics-in-information-age",
  "theory/costly-industrial-governance-information-age",
  "china/industrial-system-failure-in-information-age",
  "theory/ccp-completed-historical-task-refuses-exit",
  "theory/modern-social-syndrome",
])}

### 二、西方制度困境与美国政治

${articleLines([
  "theory/democracy-still-exists-but-cannot-penetrate-reality",
  "theory/us-industrial-system-cannot-carry-information-age",
  "theory/us-separation-of-powers-integrative-capacity-crisis",
  "theory/information-age-erodes-us-integrative-capacity",
  "theory/us-supreme-court-partisan-final-battleground",
])}

### 三、组织权力、程序问责与治理摩擦

${articleLines([
  "theory/procedural-accountability-organized-power",
  "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
  "theory/internal-change-external-change",
  "theory/ai-monitoring-organizational-friction",
  "institution/despotism-cancer-ming-1566",
])}`,
);

writeFile(
  "china/index.md",
  `---
title: "解析中共"
date: 2026-05-10
category: "解析中共"
tags:
  - china
description: "解释中共作为组织的权力结构、官僚系统、宣传系统、责任结构与防御化转向。"
status: published
---

# 解析中共

这里不把中共简单理解为某个人的意志，也不把中国问题简化为宫廷斗争，而是把中共作为一个组织来分析：它如何形成、如何运转、如何集中权力，又如何在资源收缩和社会复杂化中逐渐进入防御状态。

## 文章列表

### 一、组织结构与权力网络

${articleLines([
  "theory/party-state-structural-failure",
  "china/ccp-power-network-not-line",
  "china/xi-power-centralization",
  "china/xi-solved-organization-not-reality",
  "china/xi-succession-crisis-gray-rhino",
  "china/ccp-2018-new-reform-opening",
])}

### 二、从增长型组织到防御型组织

${articleLines([
  "china/information-age-impact-on-ccp-mechanisms",
  "theory/high-rigidity-system-ccp",
  "theory/ccp-high-fragility-dysfunction",
  "china/political-machine-rewards-and-limits",
  "china/party-power-logic-and-ccp-goal-vacuum",
  "china/emotional-link-breakdown-and-regime-collapse",
  "china/Macro Narratives, Opportunity Incentives, and High Fragility",
])}

### 三、官僚系统、宣传系统与责任压缩

${articleLines([
  "china/bureaucratic-system-under-purges",
  "china/ccp-bureaucracy-double-deadlock",
  "china/when-high-ranking-officials-are-no-longer-safe",
  "china/ccp-from-faith-community-to-black-box-post",
  "china/organization-credit-retired-officials",
  "china/propaganda-system-hollowing-out",
])}

### 四、历史比较、外交外溢与误判风险

${articleLines([
  "china/elite-sandification-ming-bureaucrats-ccp",
  "china/diplomacy-root",
  "china/pla-political-subject-myth",
  "china/taiwan-war-risk",
  "china/taiwan-war-controllable-escalation-illusion",
])}`,
);

writeFile(
  "china-stage/index.md",
  `---
title: "中国阶段判断"
date: 2026-06-02
category: "中国阶段判断"
tags:
  - china-stage
description: "从财政、社保、医保、金融、基层治理、普通人压力和社会心理进入中国现实阶段判断。"
status: published
---

# 中国阶段判断

这里关注中国现实正在发生的结构性变化：财政、社保、医保、金融、基层治理、普通人生活压力和社会心理如何共同构成一个新的历史阶段。它不是情绪判断，而是从现实痛感进入制度结构。

## 文章列表

### 一、财政、社保、医保与金融压力

${articleLines([
  "china-stage/china-manufacturing-cannot-stop",
  "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
  "china/ccp-reform-political-balance-deadlock",
  "china/ccp-bureaucracy-historical-bill",
])}

### 二、基层治理、普通人压力与社会心理

${articleLines([
  "theory/trapped-by-process",
  "theory/no-accountability-lie-flat-mentality",
  "china/chicken-and-cage",
  "china/maginot-line-of-stability-maintenance",
])}

### 三、社会变革动力与历史总账

${articleLines([
  "theory/social-change-dynamics-when-system-no-longer-worth-it",
  "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
])}`,
);

writeFile(
  "civic-orderism/index.md",
  `---
title: "公民秩序主义"
date: 2026-05-10
category: "公民秩序主义"
tags:
  - civic-orderism
description: "公民秩序主义的理论入口、基本原则，以及它与旧制度和简单换人掌权想象的区别。"
status: published
---

# 公民秩序主义

公民秩序主义不是一个口号，不是政党，也不是情绪化的革命方案。它试图回答的是：在现代国家越来越庞大、制度越来越复杂、普通人越来越难以进入制度的情况下，如何重新建立国家与公民之间可进入、可解释、可纠错、可追责的公共秩序。

<section class="formal-resources">

## 正式资料

<ol>
  <li><a href="/organization-manual"><strong>公民秩序主义组织手册</strong></a><br><span>了解我们的世界判断、组织原则与加入方式。</span></li>
  <li><a href="/civic-orderism/civic-orderism-manual">公民秩序主义说明书</a></li>
  <li><a href="/civic-orderism/what-civic-orderism-solves-if-you-read-only-one">如果你只读一篇：公民秩序主义到底想解决什么</a></li>
</ol>

</section>

## 文章列表

### 一、理论入口

${articleLines([
  "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  "civic-orderism/civic-orderism-manual",
  "civic-orderism/state-must-rely-on-systems-not-drivers",
  "civic-orderism/what-civic-orderism-ultimately-solves",
])}

### 二、基本原则

${articleLines([
  "civic-orderism/why-not-left-right-democracy-autocracy",
  "civic-orderism/why-weaken-party-politics",
  "civic-orderism/public-politics-without-party-dominance",
  "civic-orderism/why-against-moral-narrative",
  "civic-orderism/why-emphasize-reciprocity-and-equality",
])}

### 三、为什么不是旧方案的替代包装

${articleLines([
  "civic-orderism/why-civic-orderism-is-easier-to-succeed",
  "civic-orderism/why-focus-on-invisible-power-nodes",
])}`,
);

writeFile(
  "institution/index.md",
  `---
title: "制度机制"
date: 2026-05-10
category: "制度机制"
tags:
  - institution
description: "公民秩序主义的具体制度机制、运行流程与方案库。"
status: published
---

# 制度机制

这里集中放置公民秩序主义的具体制度机制。公民秩序主义的核心不只是提出价值判断，而是尝试说明一个现代国家如何运行：问题如何进入系统，责任如何被追踪，权力如何被限制，错误如何被纠正，公共判断如何形成。

## 文章列表

### 一、委员会、行政与公共判断

${articleLines([
  "civic-orderism/what-is-committee-system",
  "civic-orderism/state-operation-process-under-civic-orderism",
  "civic-orderism/why-dual-track-committee-administration",
  "civic-orderism/committee-administration-opposite-incentives",
  "civic-orderism/why-committees-cannot-directly-take-cases",
  "civic-orderism/top-level-power-structure-under-civic-orderism",
])}

### 二、选举、议会、授权与责任更替

${articleLines([
  "civic-orderism/election-logic-under-civic-orderism",
  "civic-orderism/why-elections-reject-political-donations",
  "civic-orderism/why-part-time-representatives",
  "civic-orderism/why-proposals-from-social-organizations",
  "civic-orderism/why-no-bicameral-parliament",
])}

### 三、司法、信息透明与后台系统

${articleLines([
  "civic-orderism/backend-system-under-civic-orderism",
  "civic-orderism/why-information-transparency",
  "civic-orderism/why-justice-serves-reality",
  "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
  "civic-orderism/why-not-simple-separation-of-powers",
])}`,
);

function mapSection(title, sectionSlugs, { sort = "date" } = {}) {
  return `## ${title}\n\n${articleLines(sectionSlugs, { sort })}\n\n`;
}

const used = new Set();
const mapBody = [
  ["一、旧世界为什么失效", slugs.oldOrder],
  ["二、中共这个组织为什么走向失灵", slugs.ccp],
  ["三、中国正在进入什么阶段", slugs.stage],
  ["四、外部误判、国际风险与历史案例", slugs.international],
  ["五、为什么需要新的制度通道", [
    "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
    "civic-orderism/what-civic-orderism-ultimately-solves",
    "civic-orderism/why-civic-orderism-is-easier-to-succeed",
    "civic-orderism/why-focus-on-invisible-power-nodes",
  ]],
  ["六、公民秩序主义的基本理论", slugs.civicTheory],
  ["七、委员会与公共判断机制", [
    "civic-orderism/top-level-power-structure-under-civic-orderism",
    "civic-orderism/what-is-committee-system",
    "civic-orderism/committee-administration-opposite-incentives",
    "civic-orderism/why-committees-cannot-directly-take-cases",
    "civic-orderism/why-dual-track-committee-administration",
    "civic-orderism/why-not-simple-separation-of-powers",
  ]],
  ["八、选举、授权与责任更替", [
    "civic-orderism/election-logic-under-civic-orderism",
    "civic-orderism/why-elections-reject-political-donations",
    "civic-orderism/why-part-time-representatives",
    "civic-orderism/why-proposals-from-social-organizations",
    "civic-orderism/why-no-bicameral-parliament",
  ]],
  ["九、后台系统、司法与执行底座", [
    "civic-orderism/backend-system-under-civic-orderism",
    "civic-orderism/why-information-transparency",
    "civic-orderism/why-justice-serves-reality",
    "civic-orderism/state-operation-process-under-civic-orderism",
    "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
  ]],
]
  .map(([title, sectionSlugs, options]) => {
    sectionSlugs.map(findArticleBySlug).filter(Boolean).forEach((article) => used.add(article.slug));
    return mapSection(title, sectionSlugs, options);
  })
  .join("");

const recent = articles.filter((article) => !used.has(article.slug)).slice(0, 5).map(articleLine).join("\n");

writeFile(
  "articles.md",
  `---
title: "阅读地图"
date: 2026-05-10
category: "索引"
tags:
  - index
description: "从旧秩序失效，到中共组织失灵，再到公民秩序主义的制度回应。"
status: published
---

# 阅读地图

从旧秩序失效，到中共组织失灵，再到公民秩序主义的制度回应。

这里不是按发布时间排列文章，而是按照问题路径组织阅读。你可以从现实问题进入，也可以从制度理论进入；可以先理解中共为什么失灵，也可以直接阅读公民秩序主义如何提出新的公共秩序方案。

<p class="articles-reading-note">如果你是第一次来到这里，建议先阅读<a href="/organization-manual">《公民秩序主义组织手册》</a>，再按下方分类进入专题文章。</p>

## 分类目录

- [旧世界为什么失效](#一旧世界为什么失效)
- [中共这个组织为什么走向失灵](#二中共这个组织为什么走向失灵)
- [中国正在进入什么阶段](#三中国正在进入什么阶段)
- [外部误判、国际风险与历史案例](#四外部误判国际风险与历史案例)
- [为什么需要新的制度通道](#五为什么需要新的制度通道)
- [公民秩序主义的基本理论](#六公民秩序主义的基本理论)
- [委员会与公共判断机制](#七委员会与公共判断机制)
- [选举、授权与责任更替](#八选举授权与责任更替)
- [后台系统、司法与执行底座](#九后台系统司法与执行底座)
- [近期文章](#十近期文章)

${mapBody}## 十、近期文章

${recent || "_（暂无未归入前九个栏目的近期文章。）_"}

本站共收录 ${articles.length} 篇文章。以上按问题路径推荐阅读；这些文章不是散的，而是一套解释系统。`,
);

console.log(`Generated indexes for ${articles.length} articles.`);
