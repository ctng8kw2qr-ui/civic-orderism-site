import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDir = path.resolve("content");
const siteDescription =
  "公民秩序主义关注工业时代旧秩序在信息化时代的失效，并尝试提出一种面向中国现实、可进入、可解释、可纠错、可追责的公共秩序方案。";

const categories = [
  [
    "civic-orderism",
    "公民秩序主义",
    "公民秩序主义的核心理论、原则、制度设计、运行流程与权力监督机制。",
  ],
  ["theory", "理论总纲", "理论框架、概念模型与制度判断。"],
  ["institution", "制度设计", "制度结构、治理机制与组织方案。"],
  ["china", "解析中共", "中共的组织结构、权力逻辑、官僚系统与结构性失效分析。"],
];

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

function isTemporaryDraft(relativePath) {
  const filename = path.basename(relativePath).toLowerCase();
  return filename === "未命名.md" || filename === "untitled.md";
}

function slugFor(relativePath) {
  return relativePath.replace(/\.md$/, "");
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parseArticle(filePath) {
  const relativePath = toPosix(path.relative(contentDir, filePath));
  const raw = fs.readFileSync(filePath, "utf8");
  if (raw.trim() === "") return undefined;
  const parsed = matter(raw);
  const category = relativePath.split("/")[0];
  const slug = slugFor(relativePath);
  return {
    category,
    date: normalizeDate(parsed.data.date),
    hasDate: Boolean(parsed.data.date),
    description: parsed.data.description ? String(parsed.data.description) : "",
    listed: parsed.data.listed !== false,
    slug,
    title: parsed.data.title
      ? String(parsed.data.title)
      : path.basename(relativePath, ".md"),
  };
}

function articleLine(article) {
  const date = article.hasDate && article.date ? `（${article.date}）` : "";
  return `- [[${article.slug}|${article.title}]]${date}`;
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

function findArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}

function articlesForSlugsSorted(slugs) {
  const matched = [];
  for (const slug of slugs) {
    const article = findArticleBySlug(slug);
    if (article) matched.push(article);
  }
  return matched.sort(compareArticlesByDateDesc);
}

function articleLinesForSlugs(slugs) {
  return articlesForSlugsSorted(slugs).map(articleLine).join("\n");
}

function articleLinksForSlugs(slugs) {
  return articlesForSlugsSorted(slugs).map((article) => `[[${article.slug}|${article.title}]]`);
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildChinaThemedArticleList(chinaArticles) {
  const sections = [
    {
      title: "一、组织结构与系统失效",
      body: "这一组文章用于解释中共不是一个简单的个人权力问题，而是一个组织结构、反馈机制、责任系统和权力逻辑逐步失效的问题。",
      slugs: [
        "china/xi-solved-organization-not-reality",
        "china/xi-power-centralization",
        "china/xi-succession-crisis-gray-rhino",
        "china/ccp-2018-new-reform-opening",
        "china/ccp-power-network-not-line",
        "china/political-machine-rewards-and-limits",
        "china/party-power-logic-and-ccp-goal-vacuum",
        "china/emotional-link-breakdown-and-regime-collapse",
        "china/information-age-impact-on-ccp-mechanisms",
        "china/industrial-system-failure-in-information-age",
      ],
    },
    {
      title: "二、官僚体系与责任压缩",
      body: "这一组文章用于解释中共官僚系统如何在高压、追责、忠诚表演和责任下沉中逐渐失去真实治理能力。",
      slugs: [
        "china/bureaucratic-system-under-purges",
        "china/when-high-ranking-officials-are-no-longer-safe",
        "china/organization-credit-retired-officials",
        "china/ccp-bureaucracy-double-deadlock",
        "china/ccp-bureaucracy-historical-bill",
        "china/ccp-from-faith-community-to-black-box-post",
      ],
    },
    {
      title: "三、宣传系统与解释能力衰退",
      body: "这一组文章用于解释中共为什么越来越依赖宣传和话语控制，却越来越难以解释现实、吸收反馈和形成有效判断。",
      slugs: [
        "china/propaganda-system-hollowing-out",
      ],
    },
    {
      title: "四、历史比较与制度镜像",
      body: "这一组文章用于通过历史比较和制度镜像，解释中共当下问题并不是孤立现象，而是高刚性政治体制在压力下常见的结构性结果。",
      slugs: [
        "china/elite-sandification-ming-bureaucrats-ccp",
        "china/maginot-line-of-stability-maintenance",
      ],
    },
    {
      title: "五、外部关系与战争风险",
      body: "这一组文章用于解释中共内部组织逻辑如何外溢到外交、台海、战争判断和外界误判之中。",
      slugs: [
        "china/taiwan-war-risk",
        "china/taiwan-war-controllable-escalation-illusion",
        "china/diplomacy-root",
        "china/pla-political-subject-myth",
      ],
    },
    {
      title: "六、经济、社会与信心收缩",
      body: "这一组文章用于解释经济压力、社会预期、财政金融风险和民间信心收缩，如何反过来加速中共组织系统的防御化。",
      slugs: [
        "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        "china/ccp-reform-political-balance-deadlock",
        "china/chicken-and-cage",
        "china/Macro Narratives, Opportunity Incentives, and High Fragility",
      ],
    },
  ];

  const hiddenFromChinaIndex = new Set();
  const used = new Set(hiddenFromChinaIndex);
  let out = "";
  for (const sec of sections) {
    const block = articleLinesForSlugs(sec.slugs);
    for (const slug of sec.slugs) {
      const a = findArticleBySlug(slug);
      if (a) used.add(a.slug);
    }
    out += `### ${sec.title}\n\n${sec.body}\n\n${block}\n\n`;
  }

  const others = chinaArticles.filter((a) => !used.has(a.slug));
  if (others.length) {
    out += "### 其他观察\n\n以下文章暂未归入上述主题，仍按写作时间整理。\n\n";
    out += `${others.map(articleLine).join("\n")}\n\n`;
  }

  const visibleCount = chinaArticles.filter((article) => !hiddenFromChinaIndex.has(article.slug)).length;
  out += `此栏目共收录 ${visibleCount} 篇文章。`;
  return out;
}

function buildCivicOrderismThemedArticleList(civicOrderismArticles) {
  const sections = [
    {
      title: "一、入门说明",
      body: "这一组文章用于帮助第一次接触本站的读者理解公民秩序主义是什么，它为什么不是普通政治口号，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的现代国家治理方案。",
      slugs: [
        "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
        "civic-orderism/civic-orderism-manual",
        "civic-orderism/what-civic-orderism-ultimately-solves",
        "civic-orderism/why-civic-orderism-is-easier-to-succeed",
        "civic-orderism/why-against-moral-narrative",
        "civic-orderism/why-not-left-right-democracy-autocracy",
      ],
    },
    {
      title: "二、国家如何运行",
      body: "这一组文章用于说明公民秩序主义下国家如何实际运转，包括委员会制度、国家运行流程、顶层权力结构、委员会—行政双轨制，以及公共问题如何进入国家系统。",
      slugs: [
        "civic-orderism/what-is-committee-system",
        "civic-orderism/state-operation-process-under-civic-orderism",
        "civic-orderism/top-level-power-structure-under-civic-orderism",
        "civic-orderism/why-dual-track-committee-administration",
        "civic-orderism/committee-administration-opposite-incentives",
        "civic-orderism/why-committees-cannot-directly-take-cases",
      ],
    },
    {
      title: "三、制度如何保障",
      body: "这一组文章用于解释公民秩序主义如何通过选举、公共政治、后台系统、信息透明、履历经验和司法现实主义来保障制度长期运行，而不是停留在口号和道德表态上。",
      slugs: [
        "civic-orderism/election-logic-under-civic-orderism",
        "civic-orderism/public-politics-without-party-dominance",
        "civic-orderism/backend-system-under-civic-orderism",
        "civic-orderism/why-information-transparency",
        "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
        "civic-orderism/why-justice-serves-reality",
      ],
    },
  ];

  const used = new Set();
  let out = "";
  for (const sec of sections) {
    const block = articleLinesForSlugs(sec.slugs);
    for (const slug of sec.slugs) {
      const a = findArticleBySlug(slug);
      if (a) used.add(a.slug);
    }
    out += `### ${sec.title}\n\n${sec.body}\n\n${block}\n\n`;
  }

  const others = civicOrderismArticles.filter((a) => !used.has(a.slug));
  if (others.length) {
    out += "### 其他文章\n\n以下文章暂未归入上述主题，仍按写作时间整理。\n\n";
    out += `${others.map(articleLine).join("\n")}\n\n`;
  }

  out += `此栏目共收录 ${civicOrderismArticles.length} 篇文章。`;
  return out;
}

function buildTheoryThemedArticleList() {
  const sections = [
    {
      title: "一、工业时代制度为什么失效",
      slugs: [
        "theory/why-party-politics-is-becoming-a-low-dimensional-function",
        "theory/costly-industrial-governance-information-age",
        "theory/ccp-completed-historical-task-refuses-exit",
        "theory/modern-social-syndrome",
        "theory/internal-change-external-change",
      ],
    },
    {
      title: "二、美国制度危机与统合能力下降",
      slugs: [
        "theory/us-industrial-system-cannot-carry-information-age",
        "theory/information-age-erodes-us-integrative-capacity",
        "theory/us-separation-of-powers-integrative-capacity-crisis",
        "theory/us-supreme-court-partisan-final-battleground",
      ],
    },
    {
      title: "三、组织权力、程序问责与治理摩擦",
      slugs: [
        "theory/party-state-structural-failure",
        "theory/procedural-accountability-organized-power",
        "theory/social-change-dynamics-when-system-no-longer-worth-it",
        "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
        "theory/ai-monitoring-organizational-friction",
        "theory/ccp-high-fragility-dysfunction",
        "theory/no-accountability-lie-flat-mentality",
      ],
    },
  ];

  return sections
    .map((section) => `### ${section.title}\n\n${articleLinesForSlugs(section.slugs)}`)
    .join("\n\n");
}

function findArticleByTitle(title) {
  return articles.find((article) => article.title.includes(title));
}

function articleLink(label, finder) {
  const article = finder();
  return article ? `[[${article.slug}|${label}]]` : label;
}

function renderThemeCard(heading, description, items, moreSlug, moreLabel = "查看更多 →", maxVisible = 5) {
  const cap = Math.min(items.length, Math.max(1, maxVisible));
  const visible = items.slice(0, cap);
  const bulletBlock = visible.map((item) => `- ${item}`).join("\n");
  const moreLink = moreSlug?.includes("#")
    ? `[${moreLabel}](${moreSlug})`
    : `[[${moreSlug}|${moreLabel}]]`;
  const moreLine = moreSlug ? `\n\n- ${moreLink}` : "";
  return `<section class="article-category-card">\n\n### ${heading}\n\n<p class="article-category-description">${description}</p>\n\n${bulletBlock}${moreLine}\n\n</section>`;
}

function writeFile(filePath, body) {
  const targetPath = path.join(contentDir, filePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${body.trimEnd()}\n`, "utf8");
}

const articles = walk(contentDir)
  .map((filePath) => [filePath, toPosix(path.relative(contentDir, filePath))])
  .filter(([, relativePath]) => !isIndexPage(relativePath))
  .filter(([, relativePath]) => !isTemporaryDraft(relativePath))
  .map(([filePath]) => parseArticle(filePath))
  .filter(Boolean)
  .filter((article) => article.listed)
  .filter((article) => categories.some(([key]) => key === article.category))
  .sort(compareArticlesByDateDesc);

const byCategory = new Map(categories.map(([key]) => [key, []]));
for (const article of articles) {
  byCategory.get(article.category)?.push(article);
}

const homeLatest = articles
  .filter(
    (article) =>
      article.slug !==
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  )
  .slice(0, 3)
  .map(articleLine)
  .join("\n");

const homeCategoryLinks = [
  ["theory", "旧秩序失效"],
  ["china", "解析中共"],
  ["civic-orderism", "公民秩序主义"],
  ["institution", "制度设计"],
  ["articles", "文章总览"],
];

const firstReadingSection = `<div class="home-first-reading">

## 第一次阅读建议

如果你第一次来到这里，建议按这个顺序阅读：先理解旧秩序为何失效，再理解中共组织为何失灵，最后进入公民秩序主义的制度回应。

### 第一步：先理解旧秩序为什么失效

${bulletList(articleLinksForSlugs([
  "theory/why-party-politics-is-becoming-a-low-dimensional-function",
  "theory/us-industrial-system-cannot-carry-information-age",
]))}

### 第二步：再理解中共为什么失灵

${bulletList(articleLinksForSlugs([
  "theory/party-state-structural-failure",
  "china/ccp-power-network-not-line",
  "theory/ccp-high-fragility-dysfunction",
]))}

### 第三步：最后理解公民秩序主义

${bulletList(articleLinksForSlugs([
  "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
  "civic-orderism/what-is-committee-system",
]))}

</div>`;

const themedReading = [
  [
    "旧秩序失效",
    "解释政党政治、工业型治理、美国制度和程序问责，为什么越来越难以处理信息化时代的高耦合社会。",
    [
      articleLink("为什么政党政治越来越像低维函数", () =>
        findArticleBySlug("theory/why-party-politics-is-becoming-a-low-dimensional-function"),
      ),
      articleLink("美国的问题不在于民主或专制，而在于工业时代制度已无法承载信息化时代", () =>
        findArticleBySlug("theory/us-industrial-system-cannot-carry-information-age"),
      ),
      articleLink("中共完成了历史任务，但拒绝被历史淘汰", () =>
        findArticleBySlug("theory/ccp-completed-historical-task-refuses-exit"),
      ),
    ],
    "theory",
    "查看更多 →",
    3,
  ],
  [
    "中共组织失灵",
    "分析中共作为超大型执政组织，如何在权力集中、反馈失真、责任不透明和组织信用衰减中走向失灵。",
    [
      articleLink("党国系统的结构性失效：一个组织诊断", () =>
        findArticleBySlug("theory/party-state-structural-failure"),
      ),
      articleLink("中共的权力布局不是一条线，而是一张网", () =>
        findArticleBySlug("china/ccp-power-network-not-line"),
      ),
      articleLink("高位清洗如何改变中共官僚系统", () =>
        findArticleBySlug("china/bureaucratic-system-under-purges"),
      ),
    ],
    "china",
    "查看更多 →",
    3,
  ],
  [
    "中国正在进入什么阶段",
    "解释社保、医保、金融、基层治理、社会成本与普通人困境，如何成为组织失效在社会层面的外部表现。",
    [
      articleLink("中共崩解的三大导火索：社保、医保与金融系统", () =>
        findArticleBySlug(
          "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        ),
      ),
      articleLink("中共的真正死局：改革未必救经济，却一定先打破政治平衡", () =>
        findArticleBySlug("china/ccp-reform-political-balance-deadlock"),
      ),
      articleLink("当历史总账开始结算：高刚性官僚体系如何把系统性责任层层压向中基层", () =>
        findArticleBySlug("china/ccp-bureaucracy-historical-bill"),
      ),
    ],
    "china",
    "查看更多 →",
    3,
  ],
  [
    "公民秩序主义的制度回应",
    "说明公民秩序主义不是简单换人掌权，而是试图重建国家与普通人之间的秩序关系、责任结构和制度通道。",
    [
      articleLink("如果你只读一篇：公民秩序主义到底想解决什么", () =>
        findArticleBySlug(
          "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
        ),
      ),
      articleLink("公民秩序主义说明书：一套面向中国现实与信息化时代的现代国家治理方案", () =>
        findArticleBySlug("civic-orderism/civic-orderism-manual"),
      ),
      articleLink("什么是委员会：公民秩序主义中的委员会体系、工作流程与制度架构", () =>
        findArticleBySlug("civic-orderism/what-is-committee-system"),
      ),
    ],
    "civic-orderism",
    "查看更多 →",
    3,
  ],
]
  .map(([heading, description, items, moreSlug, moreLabel, maxVisible = 5]) =>
    renderThemeCard(heading, description, items, moreSlug, moreLabel, maxVisible),
  )
  .join("\n\n");

const categoryIntroductions = new Map([
  [
    "civic-orderism",
    `本栏目集中说明公民秩序主义的基本理念、制度结构和国家运行方式。如果你是第一次了解这套理论，建议先阅读${articleLink("公民秩序主义说明书", () => findArticleBySlug("civic-orderism/civic-orderism-manual"))}、${articleLink("什么是委员会", () => findArticleBySlug("civic-orderism/what-is-committee-system"))}、${articleLink("国家运行的大概流程", () => findArticleBySlug("civic-orderism/state-operation-process-under-civic-orderism"))}三篇。`,
  ],
  [
    "china",
    "本栏目不是单纯评论中共新闻，而是从组织结构、官僚系统、权力激励和制度失效角度，解释中共为什么越来越难以处理自身制造的问题。如果你想理解公民秩序主义为什么认为中国需要新的公共秩序系统，可以从本栏目开始。",
  ],
  [
    "theory",
    "本栏目用于整理公民秩序主义背后的理论判断，包括现代国家、政党政治、组织失灵、程序问责、技术治理与社会摩擦等问题。这里不是具体制度方案，而是理解制度方案背后的分析框架。",
  ],
]);

function buildArticlesThemedBody() {
  const used = new Set();
  // 明确排除旧版本的"为什么政党政治越来越像低维函数"文章，避免重复显示
  used.add("theory/party-politics-low-dimensional-function");

  function sectionByDate(title, slugs) {
    const sectionArticles = slugs
      .map((slug) => findArticleBySlug(slug))
      .filter((article) => article && !used.has(article.slug))
      .sort(compareArticlesByDateDesc);

    for (const article of sectionArticles) {
      used.add(article.slug);
    }

    const lines = sectionArticles.map(articleLine).join("\n");
    return `## ${title}\n\n\n${lines}\n\n`;
  }

  function sectionByOrder(title, slugs) {
    const sectionArticles = slugs
      .map((slug) => findArticleBySlug(slug))
      .filter((article) => article && !used.has(article.slug));

    for (const article of sectionArticles) {
      used.add(article.slug);
    }

    const lines = sectionArticles.map(articleLine).join("\n");
    return `## ${title}\n\n\n${lines}\n\n`;
  }

  const articleDirectoryLinks = [
    ["旧世界为什么失效", "#一旧世界为什么失效"],
    ["旧组织为什么走向失灵", "#二旧组织为什么走向失灵"],
    ["中国正在进入什么阶段", "#三中国正在进入什么阶段"],
    ["外部误判、国际风险与案例", "#四外部误判国际风险与案例"],
    ["为什么需要新的制度通道", "#五为什么需要新的制度通道"],
    ["新制度如何运行", "#六新制度如何运行"],
    ["委员会与公共判断机制", "#七委员会与公共判断机制"],
    ["选举、授权与责任更替", "#八选举授权与责任更替"],
    ["后台系统、司法与执行底座", "#九后台系统司法与执行底座"],
    ["近期文章", "#十近期文章"],
  ];

  let out = `## 分类目录\n\n${articleDirectoryLinks.map(([label, href]) => `- [${label}](${href})`).join("\n")}\n\n`;

  out += sectionByOrder("一、旧世界为什么失效", [
    "theory/why-party-politics-is-becoming-a-low-dimensional-function",
    "theory/us-industrial-system-cannot-carry-information-age",
    "theory/us-separation-of-powers-integrative-capacity-crisis",
    "theory/information-age-erodes-us-integrative-capacity",
    "theory/us-supreme-court-partisan-final-battleground",
    "theory/costly-industrial-governance-information-age",
    "china/industrial-system-failure-in-information-age",
    "theory/ccp-completed-historical-task-refuses-exit",
    "theory/internal-change-external-change",
    "theory/procedural-accountability-organized-power",
    "theory/social-change-dynamics-when-system-no-longer-worth-it",
    "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
    "theory/modern-social-syndrome",
    "theory/ai-monitoring-organizational-friction",
  ]);

  out += sectionByOrder("二、旧组织为什么走向失灵", [
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
    "china/ccp-reform-political-balance-deadlock",
    "china/when-high-ranking-officials-are-no-longer-safe",
    "china/bureaucratic-system-under-purges",
    "china/xi-succession-crisis-gray-rhino",
    "china/ccp-from-faith-community-to-black-box-post",
    "china/elite-sandification-ming-bureaucrats-ccp",
    "china/organization-credit-retired-officials",
    "china/ccp-2018-new-reform-opening",
    "china/Macro Narratives, Opportunity Incentives, and High Fragility",
    "china/propaganda-system-hollowing-out",
  ]);

  out += sectionByDate("三、中国正在进入什么阶段", [
    "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
    "china/chicken-and-cage",
    "china/maginot-line-of-stability-maintenance",
    "china/ccp-bureaucracy-historical-bill",
    "theory/no-accountability-lie-flat-mentality",
    "theory/trapped-by-process",
  ]);

  out += sectionByDate("四、外部误判、国际风险与案例", [
    "china/diplomacy-root",
    "china/taiwan-war-risk",
    "china/taiwan-war-controllable-escalation-illusion",
    "china/pla-political-subject-myth",
    "theory/overseas-political-movements-fail",
    "institution/despotism-cancer-ming-1566",
  ]);

  out += sectionByDate("五、为什么需要新的制度通道", [
    "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
    "civic-orderism/what-civic-orderism-ultimately-solves",
    "civic-orderism/why-not-left-right-democracy-autocracy",
    "civic-orderism/why-civic-orderism-is-easier-to-succeed",
    "civic-orderism/why-weaken-party-politics",
    "civic-orderism/public-politics-without-party-dominance",
    "civic-orderism/why-against-moral-narrative",
    "civic-orderism/why-emphasize-reciprocity-and-equality",
    "civic-orderism/why-proposals-from-social-organizations",
    "civic-orderism/why-focus-on-invisible-power-nodes",
  ]);

  out += sectionByDate("六、新制度如何运行", [
    "civic-orderism/civic-orderism-manual",
    "civic-orderism/state-operation-process-under-civic-orderism",
    "civic-orderism/why-dual-track-committee-administration",
    "civic-orderism/top-level-power-structure-under-civic-orderism",
    "civic-orderism/why-not-simple-separation-of-powers",
    "civic-orderism/why-no-bicameral-parliament",
    "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
  ]);

  out += sectionByDate("七、委员会与公共判断机制", [
    "civic-orderism/what-is-committee-system",
    "civic-orderism/committee-administration-opposite-incentives",
    "civic-orderism/why-committees-cannot-directly-take-cases",
  ]);

  out += sectionByDate("八、选举、授权与责任更替", [
    "civic-orderism/election-logic-under-civic-orderism",
    "civic-orderism/why-elections-reject-political-donations",
    "civic-orderism/why-part-time-representatives",
  ]);

  out += sectionByDate("九、后台系统、司法与执行底座", [
    "civic-orderism/backend-system-under-civic-orderism",
    "civic-orderism/why-information-transparency",
    "civic-orderism/why-justice-serves-reality",
  ]);

  const rest = articles.filter((article) => !used.has(article.slug));
  
  // 获取最近的5篇未归入前九个栏目的文章，避免重复展示
  const recentArticles = [...rest]
    .sort(compareArticlesByDateDesc)
    .slice(0, 5);
  
  out += `## 十、近期文章\n\n`;
  out += recentArticles.length ? recentArticles.map(articleLine).join("\n") : "_（暂无未归入前九个栏目的近期文章。）_";
  out += `\n\n本站共收录 ${articles.length} 篇文章。以上按主题推荐阅读；这些文章不是散的，而是一套解释系统。\n`;

  return out;
}

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

从理解旧秩序的失效开始，重建面向未来的公共秩序。

本站关注两个问题：

第一，工业时代形成的政党政治、官僚体系和国家治理模式，为什么在信息化时代越来越难以解释、整合和回应复杂社会？

第二，在旧秩序失效之后，中国是否可能建立一种更可进入、可解释、可纠错、可追责的公共秩序？

公民秩序主义不是情绪化反对，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的国家治理理论。

${firstReadingSection}

## 按主题阅读

<p class="home-themed-reading-note">从旧秩序失效，到中共组织失灵，再到新的制度回应。</p>

<div class="article-category-grid home-themed-reading-grid">

${themedReading}

</div>

## 近期补充文章

${homeLatest || "暂无文章。"}

## 全部栏目

${homeCategoryLinks.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

## 联系方式

严肃交流、资料反馈与建设性讨论，可通过以下方式联系：

邮箱：[citizenorder@proton.me](mailto:citizenorder@proton.me)
X 平台：[@CivicOrderism](https://x.com/CivicOrderism)

为便于有效沟通，建议先阅读“第一次阅读建议”中的基础文章。`,
);

writeFile(
  "articles.md",
  `---
title: "文章总览"
date: 2026-05-10
category: "索引"
tags:
  - index
description: "按主题整理的公民秩序主义相关理论、制度设计、中共组织诊断、现实问题与国际制度案例索引。"
status: published
---

# 文章总览

这里收录的是公民秩序主义相关理论文章、制度设计文章、对中共组织结构的分析文章，以及国际制度案例。阅读时可以不必按发布时间顺序，而是先从现实问题进入，再理解公民秩序主义如何提出新的公共秩序方案。

${buildArticlesThemedBody()}`,
);

for (const [key, label, description] of categories) {
  const items = byCategory.get(key) ?? [];
  const articleListSection =
    key === "china"
      ? buildChinaThemedArticleList(items)
      : key === "civic-orderism"
        ? buildCivicOrderismThemedArticleList(items)
        : key === "theory"
          ? buildTheoryThemedArticleList()
          : items.length
            ? items.map(articleLine).join("\n")
            : "暂无文章。";

  const pageLabel = key === "theory" ? "旧秩序失效" : label;
  const pageDescription =
    key === "theory"
      ? "解释工业时代形成的政党政治、官僚体系和治理模式，为什么在信息化时代越来越难以承载复杂社会。"
      : description;

  writeFile(
    `${key}/index.md`,
    `---
title: "${pageLabel}"
date: 2026-05-10
category: "${label}"
tags:
  - ${key}
description: "${pageDescription}"
status: published
---

# ${pageLabel}

${pageDescription}

${key !== "theory" && categoryIntroductions.get(key) ? `${categoryIntroductions.get(key)}\n\n` : ""}## 文章列表

${articleListSection}`,
  );
}

console.log(`Generated indexes for ${articles.length} articles.`);
