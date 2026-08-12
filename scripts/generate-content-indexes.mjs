import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDir = path.resolve("content");
const chinaAnalysis = JSON.parse(
  fs.readFileSync(path.resolve("data/china-analysis.config.json"), "utf8"),
);
const articleDirectories = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
];
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
  return relativePath.replace(/\.md$/, "").replaceAll(" ", "-");
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
    title: parsed.data.title
      ? String(parsed.data.title)
      : path.basename(relativePath, ".md"),
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
  .filter(([, relativePath]) =>
    articleDirectories.some((prefix) => relativePath.startsWith(prefix)),
  )
  .filter(
    ([, relativePath]) => !path.basename(relativePath).startsWith("article_"),
  )
  .filter(
    ([, relativePath]) =>
      !["未命名.md", "untitled.md"].includes(
        path.basename(relativePath).toLowerCase(),
      ),
  )
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

function recommendedArticleLine(article) {
  const date = article.hasDate && article.date ? `（${article.date}）` : "";
  return `- <span class="recommended-reading">推荐先读</span> [[${article.slug}|${article.title}]]${date}`;
}

function articleLines(slugs, { sort = "date" } = {}) {
  const matched = slugs.map(findArticleBySlug).filter(Boolean);
  if (sort === "date") matched.sort(compareArticlesByDateDesc);
  return matched.map(articleLine).join("\n") || "暂无文章。";
}

function mapArticleGroups(
  slugs,
  recommendedSlugs = [],
  { sort = "date" } = {},
) {
  const matched = slugs.map(findArticleBySlug).filter(Boolean);
  const recommendedSet = new Set(
    Array.isArray(recommendedSlugs) ? recommendedSlugs : [recommendedSlugs],
  );
  if (sort === "date") matched.sort(compareArticlesByDateDesc);
  const recommended = matched.filter((article) =>
    recommendedSet.has(article.slug),
  );
  const more = matched.filter((article) => !recommendedSet.has(article.slug));

  if (matched.length === 0) return "暂无文章。";

  const recommendedBlock =
    recommended.length > 0
      ? `**推荐先读**\n\n${recommended.map(recommendedArticleLine).join("\n")}\n\n`
      : "";

  const moreBlock =
    more.length > 0
      ? `<details class="reading-map-more">\n<summary>更多文章</summary>\n\n${more
          .map(articleLine)
          .join("\n")}\n\n</details>`
      : "";

  return `${recommendedBlock}${moreBlock}`.trim();
}

function articlesForSlugs(slugs, { sort = "date" } = {}) {
  const matched = slugs.map(findArticleBySlug).filter(Boolean);
  if (sort === "date") matched.sort(compareArticlesByDateDesc);
  return matched;
}

function articleLinks(slugs, options = {}) {
  return articlesForSlugs(slugs, options).map(
    (article) => `[[${article.slug}|${article.title}]]`,
  );
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
    "china/ccp-no-real-base",
    "china/why-ccp-cannot-reduce-grassroots-burden",
    "china/why-expulsion-from-party-becomes-standard-ending",
    "china/route-transition-why-ccp-keeps-purging-officials",
    "china/why-ccp-will-not-relax-party-pressure",
    "china/ccp-2018-xi-era-local-growth-space",
    "china/supply-side-reform-state-can-scale-not-discover-future",
    "china/mao-death-release-xi-death-weightlessness",
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
    "china/Macro-Narratives,-Opportunity-Incentives,-and-High-Fragility",
    "china/propaganda-system-hollowing-out",
  ],
  stage: [
    "china-stage/ccp-second-reform-opening-possibility",
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
    "civic-orderism/why-civic-orderism",
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

${bulletList(
  [
    "[《公民秩序主义介绍手册》PDF](/files/civic-orderism-introduction-manual.pdf)",
  ]
    .concat(
      articleLinks([
        "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
        "theory/why-party-politics-is-becoming-a-low-dimensional-function",
        "theory/party-state-structural-failure",
        "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        "civic-orderism/civic-orderism-manual",
        "civic-orderism/why-dual-track-committee-administration",
      ]),
    )
    .concat(["[[articles|阅读地图]]"]),
)}

</div>`;

const introductionManualEntry = `<p class="home-manual-note">完整入门说明可先阅读<a href="/introduction-manual">《公民秩序主义介绍手册》</a>。</p>

<section class="organization-manual-entry introduction-manual-entry manual-entry-card">

<p class="resource-label">入门手册</p>

## 公民秩序主义介绍手册

<p class="resource-subtitle">信息化时代的国家秩序方案</p>

如果你第一次接触公民秩序主义，可以先阅读这份介绍手册。它以较短篇幅说明公民秩序主义的基本理念、核心政治路线与治理判断，以及它为什么是一套面向信息化时代的国家秩序方案。

<div class="resource-actions manual-entry-actions">
  <a class="resource-button resource-button-primary manual-entry-button" href="/files/civic-orderism-introduction-manual.pdf">下载 PDF</a>
  <button class="resource-button manual-entry-button" type="button" data-manual-modal="introduction">阅读说明</button>
</div>

</section>`;

const organizationManualEntry = `<section class="organization-manual-entry manual-entry-card">

<p class="resource-label">正式资料</p>

## 公民秩序主义组织手册

<p class="resource-subtitle">了解我们的世界判断、组织原则、参与路径与协作边界。</p>

这份手册不是宣言，也不是情绪动员，而是一份面向长期参与者的组织说明。它用于说明公民秩序主义为什么存在、我们如何判断现实、为什么暂不建立开放群组，以及感兴趣的人如何通过邮件联系。

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
  .map(([heading, description, items, moreSlug]) =>
    renderCard(heading, description, items, moreSlug),
  )
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
  .filter(
    (article) =>
      article.slug !==
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  )
  .slice(0, 3)
  .map(articleLine)
  .join("\n");

const homeLatestCards = articles
  .filter(
    (article) =>
      article.slug !==
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  )
  .slice(0, 3)
  .map(
    (article) =>
      `<a href="/${article.slug}"><span>${article.title}</span><time>${article.date}</time></a>`,
  )
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
enableToc: false
---

<div class="home-hero-heading">
  <h1 class="home-hero-title">
    <img src="static/logo.png" alt="公民秩序主义 Logo" />
    <span>公民秩序主义</span>
  </h1>
  <p class="home-kicker">Civic Orderism</p>
</div>

<div class="home-hero-copy">

从现实痛感进入结构判断，再进入制度回应。

本站关注两个问题：

* 旧秩序为何失效。
* 中国是否可能建立可解释、可纠错、可追责的公共秩序。

公民秩序主义不是情绪化反对，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的国家治理理论。

</div>

<section class="home-section formal-publications">

## 正式资料

<div class="publication-grid">

<section class="publication-card">

<p class="resource-label">OFFICIAL PUBLICATION</p>

### 公民秩序主义介绍手册

<p class="resource-subtitle">第一次了解公民秩序主义的基础文本</p>

<a class="resource-button resource-button-primary" href="/files/civic-orderism-introduction-manual.pdf">阅读 PDF</a>

</section>

<section class="publication-card">

<p class="resource-label">OFFICIAL PUBLICATION</p>

### 公民秩序主义组织手册

<p class="resource-subtitle">进一步了解组织原则、参与方式与合作边界</p>

<a class="resource-button resource-button-primary" href="/files/civic-orderism-organization-manual.pdf">阅读 PDF</a>

</section>

</div>

</section>

<section class="home-section reading-path">

## 第一次来，按这个顺序读

<div class="reading-path-list">

<a class="reading-path-item" href="/files/civic-orderism-introduction-manual.pdf"><span>01</span><strong>先读《公民秩序主义介绍手册》</strong></a>
<a class="reading-path-item" href="/civic-orderism/what-civic-orderism-solves-if-you-read-only-one"><span>02</span><strong>理解核心问题：为什么需要新的公共秩序</strong></a>
<a class="reading-path-item" href="/theory/party-state-structural-failure"><span>03</span><strong>阅读中共结构分析：旧秩序为何失效</strong></a>
<a class="reading-path-item" href="/civic-orderism/why-dual-track-committee-administration"><span>04</span><strong>进入制度机制：委员会、秘书处、行政系统、大议会</strong></a>
<a class="reading-path-item" href="/articles"><span>05</span><strong>查看阅读地图，按主题继续阅读</strong></a>

</div>

</section>

<section class="home-section reading-navigation">

## 按主题阅读 / 全部栏目

<p class="category-navigation-note">按问题意识进入不同主题，逐步理解公民秩序主义的判断框架。</p>

<div class="category-navigation-grid">

<a href="/theory">旧秩序失效</a>
<a href="/china">解析中共</a>
<a href="/china-stage">中国阶段判断</a>
<a href="/civic-orderism">公民秩序主义</a>
<a href="/institution">制度机制</a>
<a href="/articles">阅读地图</a>

</div>

</section>

<section class="home-section recent-articles">

## 近期补充文章

<div class="recent-article-list">

${homeLatestCards || "暂无文章。"}

</div>

</section>

<section class="home-section contact-section">

## 联系方式

<p>严肃交流、资料反馈与建设性讨论，可通过邮件联系。</p>

<dl class="contact-list">
  <div><dt>主联系邮箱</dt><dd><a href="mailto:civicorderism@gmail.com">civicorderism@gmail.com</a></dd></div>
  <div><dt>备用邮箱</dt><dd><a href="mailto:citizenorder@proton.me">citizenorder@proton.me</a></dd></div>
  <div><dt>X 平台</dt><dd><a href="https://x.com/CivicOrderism">@CivicOrderism</a></dd></div>
  <div><dt>网站</dt><dd><a href="https://civicorderism.com/">civicorderism.com</a></dd></div>
</dl>

<p class="contact-note">为便于有效沟通，建议先阅读“第一次来，按这个顺序读”中的基础文章。</p>

</section>`,
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
description: "把中共视为一个现实运行中的政治组织，从权力结构、组织成员、结构性困境、防御转型及其外部影响五个层面观察其变化。"
status: published
---

# 解析中共

不以情绪、立场或单一事件为起点，而是把中共视为一个现实运行中的政治组织，从权力结构、组织成员、结构性困境、防御转型及其外部影响五个层面观察其变化。

## 文章列表

${chinaAnalysis.groups
  .map(
    (group, index) =>
      `### ${["一", "二", "三", "四", "五"][index]}、${group.name}\n\n${group.description}\n\n${articleLines(group.slugs, { sort: "manual" })}`,
  )
  .join("\n\n")}`,
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

### 一、产业、债务与秩序失灵

${articleLines([
  "china-stage/ccp-second-reform-opening-possibility",
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
  <li><a href="/organization-manual"><strong>公民秩序主义组织手册</strong></a><br><span>了解我们的世界判断、组织原则、参与路径与协作边界。</span></li>
  <li><a href="/civic-orderism/civic-orderism-manual">公民秩序主义说明书</a></li>
  <li><a href="/civic-orderism/what-civic-orderism-solves-if-you-read-only-one">如果你只读一篇：公民秩序主义到底想解决什么</a></li>
</ol>

</section>

## 文章列表

### 一、理论入口

${articleLines([
  "civic-orderism/why-civic-orderism",
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

function mapSection(
  title,
  sectionSlugs,
  { sort = "date", description = "", recommendedSlug, recommendedSlugs } = {},
) {
  const note = description
    ? `<p class="reading-map-section-note">${description}</p>\n\n`
    : "";
  return `## ${title}\n\n${note}${mapArticleGroups(
    sectionSlugs,
    recommendedSlugs ?? recommendedSlug,
    { sort },
  )}\n\n`;
}

const used = new Set();
const mapBody = [
  [
    "一、旧世界为什么失效",
    slugs.oldOrder,
    {
      description: "先理解工业时代制度为什么在信息化社会里失去统合能力。",
      recommendedSlugs: [
        "theory/why-party-politics-is-becoming-a-low-dimensional-function",
        "theory/democracy-still-exists-but-cannot-penetrate-reality",
      ],
    },
  ],
  [
    "二、中共这个组织为什么走向失灵",
    slugs.ccp,
    {
      description:
        "这一组文章用于理解中共不是单点危机，而是组织信用、责任结构和激励机制同步失效。",
      recommendedSlugs: [
        "theory/party-state-structural-failure",
        "china/ccp-no-real-base",
      ],
    },
  ],
  [
    "三、中国正在进入什么阶段",
    slugs.stage,
    {
      description:
        "从经济、财政、社会心理和官僚行为观察中国现实正在进入的阶段。",
      recommendedSlugs: [
        "china-stage/china-manufacturing-cannot-stop",
        "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
      ],
    },
  ],
  [
    "四、外部误判、国际风险与历史案例",
    slugs.international,
    {
      description:
        "这一组用于校正外部观察中常见的主体误判、战争误判和历史类比误判。",
      recommendedSlugs: [
        "china/taiwan-war-controllable-escalation-illusion",
        "china/pla-political-subject-myth",
      ],
    },
  ],
  [
    "五、为什么需要新的制度通道",
    [
      "civic-orderism/why-civic-orderism",
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
      "civic-orderism/what-civic-orderism-ultimately-solves",
      "civic-orderism/why-civic-orderism-is-easier-to-succeed",
      "civic-orderism/why-focus-on-invisible-power-nodes",
    ],
    {
      description:
        "从“为什么旧通道不够”进入“为什么需要可解释、可纠错、可追责的新通道”。",
      recommendedSlugs: [
        "civic-orderism/why-civic-orderism",
        "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
      ],
    },
  ],
  [
    "六、公民秩序主义的基本理论",
    slugs.civicTheory,
    {
      description:
        "这一组是公民秩序主义的理论骨架：国家如何从人格依赖转向系统依赖。",
      recommendedSlugs: [
        "civic-orderism/why-civic-orderism",
        "civic-orderism/state-must-rely-on-systems-not-drivers",
      ],
    },
  ],
  [
    "七、委员会与公共判断机制",
    [
      "civic-orderism/top-level-power-structure-under-civic-orderism",
      "civic-orderism/what-is-committee-system",
      "civic-orderism/committee-administration-opposite-incentives",
      "civic-orderism/why-committees-cannot-directly-take-cases",
      "civic-orderism/why-dual-track-committee-administration",
      "civic-orderism/why-not-simple-separation-of-powers",
    ],
    {
      description:
        "理解委员会不是替代行政做事，而是建立公共判断、纠偏和责任识别机制。",
      recommendedSlugs: [
        "civic-orderism/what-is-committee-system",
        "civic-orderism/why-committees-cannot-directly-take-cases",
      ],
    },
  ],
  [
    "八、选举、授权与责任更替",
    [
      "civic-orderism/election-logic-under-civic-orderism",
      "civic-orderism/why-elections-reject-political-donations",
      "civic-orderism/why-part-time-representatives",
      "civic-orderism/why-proposals-from-social-organizations",
      "civic-orderism/why-no-bicameral-parliament",
    ],
    {
      description:
        "这一组说明选举如何回到授权、责任和代表关系，而不是沦为资本、动员和表演。",
      recommendedSlugs: [
        "civic-orderism/election-logic-under-civic-orderism",
        "civic-orderism/why-elections-reject-political-donations",
      ],
    },
  ],
  [
    "九、后台系统、司法与执行底座",
    [
      "civic-orderism/backend-system-under-civic-orderism",
      "civic-orderism/why-information-transparency",
      "civic-orderism/why-justice-serves-reality",
      "civic-orderism/state-operation-process-under-civic-orderism",
      "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
    ],
    {
      description:
        "这里进入制度运行的底层条件：留痕、培训、司法、执行和信息透明。",
      recommendedSlugs: [
        "civic-orderism/backend-system-under-civic-orderism",
        "civic-orderism/state-operation-process-under-civic-orderism",
      ],
    },
  ],
]
  .map(([title, sectionSlugs, options]) => {
    sectionSlugs
      .map(findArticleBySlug)
      .filter(Boolean)
      .forEach((article) => used.add(article.slug));
    return mapSection(title, sectionSlugs, options);
  })
  .join("");

const recent = articles
  .filter((article) => !used.has(article.slug))
  .slice(0, 5)
  .map(articleLine)
  .join("\n");

const readingRouteConfigs = [
  {
    id: "route-first-visit",
    number: "01",
    label: "优先入口",
    title: "第一次了解公民秩序主义",
    description:
      "用少量核心材料理解公民秩序主义是什么、为什么提出这条路线、试图解决什么问题，以及当前已经进入什么组织阶段。",
    entries: [
      { href: "/introduction-manual", title: "公民秩序主义介绍手册" },
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
      "civic-orderism/why-civic-orderism",
      "civic-orderism/possibility-of-peaceful-political-transition-in-china",
      {
        href: "/preparation",
        title: "北美非营利法人及首届董事会筹备",
      },
      { href: "/participate", title: "参与方式" },
    ],
    moreHref: "/civic-orderism",
    moreLabel: "查看公民秩序主义全部文章 →",
    primary: true,
  },
  {
    id: "route-china-reality",
    number: "02",
    label: "现实判断",
    title: "理解中共与中国现实",
    description:
      "从中共的组织结构、官僚系统、路线调整与安全叙事出发，理解中国当前正在进入什么阶段，以及为什么现有治理逻辑越来越难以处理结构性问题。",
    entries: [
      "china/ccp-no-real-base",
      "theory/party-state-structural-failure",
      "china/route-transition-why-ccp-keeps-purging-officials",
      "china/what-happens-when-security-becomes-the-top-priority",
      "civic-orderism/possibility-of-peaceful-political-transition-in-china",
    ],
    moreHref: "/china",
    moreLabel: "查看解析中共全部文章 →",
  },
  {
    id: "route-theory",
    number: "03",
    label: "理论路线",
    title: "理解公民秩序主义的理论路线",
    description:
      "从工业时代政治制度与信息化社会之间的错位进入，理解为什么需要新的政治组织方式，以及秩序、责任、专业判断和制度承接如何形成一条完整路线。",
    entries: [
      "civic-orderism/information-age-and-political-transition",
      "theory/end-of-party-politics-in-information-age",
      "civic-orderism/state-must-rely-on-systems-not-drivers",
      "civic-orderism/why-weaken-party-politics",
      "civic-orderism/public-politics-without-party-dominance",
    ],
    moreHref: "/theory",
    moreLabel: "查看相关理论文章 →",
  },
  {
    id: "route-institution-research",
    number: "04",
    label: "进阶阅读",
    title: "进阶制度研究",
    description:
      "适合已经了解公民秩序主义基本路线，希望进一步阅读委员会、选举、司法、行政执行、监督机制与后台系统的读者。",
    entries: [
      "civic-orderism/what-is-committee-system",
      "civic-orderism/election-logic-under-civic-orderism",
      {
        slug: "civic-orderism/backend-system-under-civic-orderism",
        title: "公民秩序主义对后台系统的重视",
      },
      "civic-orderism/why-justice-serves-reality",
      {
        slug: "civic-orderism/state-operation-process-under-civic-orderism",
        title: "公民秩序主义下国家运行的大概流程",
      },
    ],
    moreHref: "/civic-orderism",
    moreLabel: "在公民秩序主义栏目继续阅读 →",
    advanced: true,
  },
];

const readingRouteHtml = readingRouteConfigs
  .map((route) => {
    const entries = route.entries.map((entry, index) => {
      const slug = typeof entry === "string" ? entry : entry.slug;
      const article = slug ? findArticleBySlug(slug) : undefined;
      if (slug && !article) {
        throw new Error(`Reading route article not found: ${slug}`);
      }
      const href =
        typeof entry === "string"
          ? `/${entry}`
          : entry.href || `/${entry.slug}`;
      const title =
        typeof entry === "string"
          ? article.title
          : entry.title || article.title;
      return `<li><span>${String(index + 1).padStart(2, "0")}</span><a href="${href}">${title}</a></li>`;
    });
    const modifiers = [
      route.primary ? "reading-route--primary" : "",
      route.advanced ? "reading-route--advanced" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<section class="reading-route${modifiers ? ` ${modifiers}` : ""}" id="${route.id}" aria-labelledby="${route.id}-title">
  <div class="reading-route__heading"><span class="reading-route__number">${route.number}</span><div><p class="resource-label">${route.label}</p><h2 id="${route.id}-title">${route.title}</h2><p>${route.description}</p></div></div>
  <div class="reading-route__body"><p class="reading-route__label">推荐先读</p><ol class="reading-route__list">${entries.join("")}</ol><a class="reading-route__more" href="${route.moreHref}">${route.moreLabel}</a></div>
</section>`;
  })
  .join("\n\n");

writeFile(
  "articles.md",
  `---
title: "阅读地图"
date: 2026-05-10
updated: 2026-08-11
category: "索引"
tags:
  - index
description: "按照第一次了解、中国现实、理论路线与进阶制度研究四条路径阅读公民秩序主义。"
status: published
enableToc: false
---

<header class="reading-map-hero">
  <p class="resource-label">从问题进入，而不是从目录开始</p>
  <h1>阅读地图</h1>
  <p>如果第一次来到这里，不需要从全部文章开始。</p>
  <p>阅读地图按照不同问题和阅读目的整理核心文章：可以先了解公民秩序主义是什么，也可以从中共与中国现实进入，再逐步阅读理论与制度研究。</p>
</header>

${readingRouteHtml}

<section class="reading-library" id="all-articles" aria-labelledby="all-articles-title">
  <p class="resource-label">完整索引</p>
  <h2 id="all-articles-title">全部文章</h2>
  <p>按主题、栏目或发布时间浏览网站完整文章库。以下索引保留所有现有文章入口，但不作为第一次访问时的阅读起点。</p>
  <div class="reading-library__collections"><a href="/civic-orderism"><strong>公民秩序主义</strong><span>政治路线、基本理论与组织承接</span></a><a href="/china"><strong>解析中共</strong><span>组织结构、官僚系统与现实变化</span></a><a href="/china-future"><strong>中国未来</strong><span>转型窗口、国家治理与未来秩序</span></a><a href="/topics"><strong>专题索引</strong><span>按具体问题继续浏览</span></a></div>
  <details class="reading-library-index" id="complete-article-index"><summary>浏览全部文章</summary>

${mapBody}## 十、近期文章

${recent || "_（暂无未归入前九个栏目的近期文章。）_"}

  </details>
</section>

<p class="reading-map-count">本站共收录 ${articles.length} 篇文章。四条路线提供阅读起点，完整索引继续保留所有现有入口。</p>`,
);

console.log(`Generated indexes for ${articles.length} articles.`);
