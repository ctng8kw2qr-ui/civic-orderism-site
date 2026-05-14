import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDir = path.resolve("content");

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
  if (!value) return "2026-05-10";
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
    description: parsed.data.description ? String(parsed.data.description) : "",
    slug,
    title: parsed.data.title
      ? String(parsed.data.title)
      : path.basename(relativePath, ".md"),
  };
}

function articleLine(article) {
  const date = article.date ? `（${article.date}）` : "";
  return `- [[${article.slug}|${article.title}]]${date}`;
}

function findArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}

function articleLinesForSlugs(slugs) {
  const lines = [];
  for (const slug of slugs) {
    const article = findArticleBySlug(slug);
    if (article) lines.push(articleLine(article));
  }
  return lines.join("\n");
}

function articleLinesForSlugsSorted(slugs) {
  const articles = [];
  for (const slug of slugs) {
    const article = findArticleBySlug(slug);
    if (article) articles.push(article);
  }
  articles.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return a.title.localeCompare(b.title, "zh-CN");
  });
  return articles.map(articleLine).join("\n");
}

function buildChinaThemedArticleList(chinaArticles) {
  const sections = [
    {
      title: "一、组织结构与系统失效",
      body: "这一组文章用于解释中共不是一个简单的个人权力问题，而是一个组织结构、反馈机制、责任系统和权力逻辑逐步失效的问题。",
      slugs: [
        "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        "china/xi-solved-organization-not-reality",
        "china/xi-power-centralization",
        "china/ccp-reform-political-balance-deadlock",
        "china/organization-credit-retired-officials",
        "china/Macro Narratives, Opportunity Incentives, and High Fragility",
        "china/xi-succession-crisis-gray-rhino",
      ],
    },
    {
      title: "二、官僚体系与责任压缩",
      body: "这一组文章用于解释中共官僚系统如何在高压、追责、忠诚表演和责任下沉中逐渐失去真实治理能力。",
      slugs: [
        "china/ccp-bureaucracy-double-deadlock",
        "china/ccp-bureaucracy-historical-bill",
        "china/chicken-and-cage",
        "china/when-high-ranking-officials-are-no-longer-safe",
        "china/ccp-from-faith-community-to-black-box-post",
      ],
    },
    {
      title: "三、宣传系统与解释能力衰退",
      body: "这一组文章用于解释中共为什么越来越依赖宣传和话语控制，却越来越难以解释现实、吸收反馈和形成有效判断。",
      slugs: [
        "china/propaganda-system-hollowing-out",
        "china/ccp-2018-new-reform-opening",
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
        "china/diplomacy-root",
        "china/pla-political-subject-myth",
      ],
    },
  ];

  const used = new Set();
  let out = "";
  for (const sec of sections) {
    const block = articleLinesForSlugsSorted(sec.slugs);
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

  out += `此栏目共收录 ${chinaArticles.length} 篇文章。`;
  return out;
}

function buildCivicOrderismThemedArticleList(civicOrderismArticles) {
  const sections = [
    {
      title: "一、入门说明",
      body: "这一组文章用于帮助第一次接触本站的读者理解公民秩序主义是什么，它为什么不是普通政治口号，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的现代国家治理方案。",
      slugs: [
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
    const block = articleLinesForSlugsSorted(sec.slugs);
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

function findArticleByTitle(title) {
  return articles.find((article) => article.title.includes(title));
}

function articleLink(label, finder) {
  const article = finder();
  return article ? `[[${article.slug}|${label}]]` : label;
}

function renderThemeCard(heading, description, items, moreSlug, maxVisible = 5) {
  const cap = Math.min(items.length, Math.max(1, maxVisible));
  const visible = items.slice(0, cap);
  const bulletBlock = visible.map((item) => `- ${item}`).join("\n");
  const moreLine = moreSlug ? `\n\n- [[${moreSlug}|查看更多 →]]` : "";
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
  .filter((article) => categories.some(([key]) => key === article.category))
  .sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return a.title.localeCompare(b.title, "zh-CN");
  });

const byCategory = new Map(categories.map(([key]) => [key, []]));
for (const article of articles) {
  byCategory.get(article.category)?.push(article);
}

const homeLatest = articles
  .filter((article) => article.category === "china")
  .slice(0, 8)
  .map(articleLine)
  .join("\n");

const homeCategoryLinks = [
  ["china", "解析中共"],
  ["civic-orderism", "公民秩序主义"],
  ["institution", "制度设计"],
  ["theory", "理论总纲"],
];

const firstReadingGroup1Bullets = [
  articleLink("党国系统的结构性失效：一个组织诊断", () =>
    findArticleBySlug("theory/party-state-structural-failure"),
  ),
  articleLink("习近平权力集中背后的系统逻辑", () =>
    findArticleBySlug("china/xi-power-centralization"),
  ),
  articleLink("当高位者也不再安全：这不是普通反腐，而是权力的深度焦虑", () =>
    findArticleBySlug("china/when-high-ranking-officials-are-no-longer-safe"),
  ),
  articleLink("中共的真正死局：改革未必救经济，却一定先打破政治平衡", () =>
    findArticleBySlug("china/ccp-reform-political-balance-deadlock"),
  ),
  articleLink("沙化的忠诚：中共精英原子化与明代士大夫的历史镜像", () =>
    findArticleBySlug("china/elite-sandification-ming-bureaucrats-ccp"),
  ),
]
  .map((item) => `- ${item}`)
  .join("\n");

const firstReadingGroup2Bullets = [
  articleLink("中共崩解的三大导火索：社保、医保与金融系统", () =>
    findArticleBySlug(
      "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
    ),
  ),
  articleLink(
    "公民秩序主义最终要解决的问题（普通人难以进入制度、影响制度与纠正制度）",
    () => findArticleBySlug("civic-orderism/what-civic-orderism-ultimately-solves"),
  ),
  articleLink(
    "不是不会宣传，而是不敢承担：中宣系统“翻车常态化”背后的空心化逻辑（信息涌入、判断冻结）",
    () => findArticleBySlug("china/propaganda-system-hollowing-out"),
  ),
  articleLink(
    "内变引外变：现代政治为何走到十字路口（旧框架难以解释新问题）",
    () => findArticleBySlug("theory/internal-change-external-change"),
  ),
  articleLink(
    "一套正在变贵的管理方式：论工业型治理的历史合理性与信息化时代的结构性代价",
    () =>
      findArticleBySlug("theory/costly-industrial-governance-information-age"),
  ),
]
  .map((item) => `- ${item}`)
  .join("\n");

const firstReadingGroup3Bullets = [
  articleLink("公民秩序主义说明书：一套面向中国现实与信息化时代的现代国家治理方案", () =>
    findArticleBySlug("civic-orderism/civic-orderism-manual"),
  ),
  articleLink(
    "公民秩序主义最终要解决的问题：它不是为了换一批人掌权，而是为了重建国家与普通人之间的秩序关系",
    () => findArticleBySlug("civic-orderism/what-civic-orderism-ultimately-solves"),
  ),
  articleLink(
    "什么是委员会：公民秩序主义中的委员会体系、工作流程与制度架构",
    () => findArticleBySlug("civic-orderism/what-is-committee-system"),
  ),
  articleLink(
    "公民秩序主义下国家运行的大概流程：从普通人的问题，到国家的判断、执行与纠偏",
    () =>
      findArticleBySlug(
        "civic-orderism/state-operation-process-under-civic-orderism",
      ),
  ),
  articleLink(
    "公民秩序主义下的选举逻辑：它与传统选举的区别，以及制度优势",
    () =>
      findArticleBySlug("civic-orderism/election-logic-under-civic-orderism"),
  ),
]
  .map((item) => `- ${item}`)
  .join("\n");

const firstReadingSection = `<div class="home-first-reading">

## 第一次阅读建议

如果你是第一次来到本站，建议先从中共组织结构和中国现实问题开始阅读。本站的阅读路径不是先要求读者接受一种新理论，而是先解释旧秩序为什么失效，再说明公民秩序主义如何作为一种新的公共秩序方案回应这些问题。

### 一、先理解中共组织结构的失效

理解中国今天的问题，不能只停留在某个领导人、某项政策或某次危机上，而要看到党国系统本身的反馈失真、责任不透明、权力集中和纠错能力下降。

${firstReadingGroup1Bullets}

### 二、再理解中国现实问题如何累积

中共的组织失效会具体表现为社保、医保、金融、基层治理、社会成本和普通人生活压力等问题。现实问题不是孤立事件，而是系统失效的外部表现。

${firstReadingGroup2Bullets}

### 三、最后理解公民秩序主义的替代方案

在理解旧秩序的失效之后，才能理解为什么需要一种新的公共秩序方案。公民秩序主义试图重建公共判断、制度解释、责任穿透和普通人的公共进入机制。

${firstReadingGroup3Bullets}

</div>`;

const themedReading = [
  [
    "从这里开始",
    "先理解中共组织失效，再进入公民秩序主义。",
    [
      `[[start-here|从这里开始阅读公民秩序主义]]`,
      articleLink("党国系统的结构性失效：一个组织诊断", () =>
        findArticleBySlug("theory/party-state-structural-failure"),
      ),
      articleLink(
        "公民秩序主义最终要解决的问题：它不是为了换一批人掌权，而是为了重建国家与普通人之间的秩序关系",
        () =>
          findArticleBySlug("civic-orderism/what-civic-orderism-ultimately-solves"),
      ),
      articleLink("公民秩序主义说明书：一套面向中国现实与信息化时代的现代国家治理方案", () =>
        findArticleBySlug("civic-orderism/civic-orderism-manual"),
      ),
    ],
    "start-here",
    3,
  ],
  [
    "理解中共组织失效",
    "解释党国系统、权力集中、官僚体系、反馈失真、组织安全承诺破产，以及社保、医保、金融、基层治理等现实问题如何成为组织失效的外部表现。",
    [
      articleLink("党国系统的结构性失效：一个组织诊断", () =>
        findArticleBySlug("theory/party-state-structural-failure"),
      ),
      articleLink("中共崩解的三大导火索：社保、医保与金融系统", () =>
        findArticleBySlug(
          "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        ),
      ),
      articleLink("习近平权力集中背后的系统逻辑", () =>
        findArticleBySlug("china/xi-power-centralization"),
      ),
      articleLink("当高位者也不再安全：这不是普通反腐，而是权力的深度焦虑", () =>
        findArticleBySlug("china/when-high-ranking-officials-are-no-longer-safe"),
      ),
      articleLink("中共的真正死局：改革未必救经济，却一定先打破政治平衡", () =>
        findArticleBySlug("china/ccp-reform-political-balance-deadlock"),
      ),
    ],
    "china",
    4,
  ],
  [
    "现实问题与社会成本",
    "解释社保、医保、金融、基层治理、社会成本与普通人困境，如何成为组织失效在社会层面的外部表现。",
    [
      articleLink("中共崩解的三大导火索：社保、医保与金融系统", () =>
        findArticleBySlug(
          "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        ),
      ),
      articleLink("养鸡与换笼：民营经济被整肃的结构逻辑", () =>
        findArticleBySlug("china/chicken-and-cage"),
      ),
      articleLink("一个难以言说的防线：从“液压维稳”到当代的马其诺防线", () =>
        findArticleBySlug("china/maginot-line-of-stability-maintenance"),
      ),
    ],
    "china",
    3,
  ],
  [
    "理解公民秩序主义",
    "解释委员会制度、公共判断机制、行政与委员会双轨、国家运行流程。",
    [
      articleLink("公民秩序主义说明书：一套面向中国现实与信息化时代的现代国家治理方案", () =>
        findArticleBySlug("civic-orderism/civic-orderism-manual"),
      ),
      articleLink("什么是委员会：公民秩序主义中的委员会体系、工作流程与制度架构", () =>
        findArticleBySlug("civic-orderism/what-is-committee-system"),
      ),
      articleLink(
        "为什么公民秩序主义必须采取委员会—行政双轨制，但最终仍由民选政治官员统合国家",
        () =>
          findArticleBySlug(
            "civic-orderism/why-dual-track-committee-administration",
          ),
      ),
      articleLink(
        "委员会与行政机关激励结构相反的意义：为什么公民秩序主义必须把“做事的人”和“看事的人”分开",
        () =>
          findArticleBySlug(
            "civic-orderism/committee-administration-opposite-incentives",
          ),
      ),
      articleLink(
        "公民秩序主义下国家运行的大概流程：从普通人的问题，到国家的判断、执行与纠偏",
        () =>
          findArticleBySlug(
            "civic-orderism/state-operation-process-under-civic-orderism",
          ),
      ),
      articleLink(
        "公民秩序主义下顶层权力结构的布局：为什么国家最高层不能只有一个权力中心，也不能碎片化成互相消耗的多头政治",
        () =>
          findArticleBySlug(
            "civic-orderism/top-level-power-structure-under-civic-orderism",
          ),
      ),
    ],
    "civic-orderism",
    4,
  ],
  [
    "制度设计",
    "解释选举、监督、财政、教育、后台系统、反腐机制。",
    [
      articleLink(
        "公民秩序主义下的选举逻辑：它与传统选举的区别，以及制度优势",
        () =>
          findArticleBySlug("civic-orderism/election-logic-under-civic-orderism"),
      ),
      articleLink("为什么公民秩序主义下的选举会天然排斥政治献金", () =>
        findArticleBySlug(
          "civic-orderism/why-elections-reject-political-donations",
        ),
      ),
      articleLink(
        "公民秩序主义对后台系统的重视：为什么培训、秘书处、专业事务与留痕系统，是现代国家真正的底座",
        () =>
          findArticleBySlug("civic-orderism/backend-system-under-civic-orderism"),
      ),
      articleLink("为什么公民秩序主义强调信息透明及信息发布", () =>
        findArticleBySlug("civic-orderism/why-information-transparency"),
      ),
      articleLink("为什么公民秩序主义强调司法是为现实服务的", () =>
        findArticleBySlug("civic-orderism/why-justice-serves-reality"),
      ),
      articleLink("我们不是被贫穷困住，而是被流程困住", () =>
        findArticleBySlug("theory/trapped-by-process"),
      ),
    ],
    "articles",
    4,
  ],
  [
    "国际与案例",
    "解释美国制度危机、国际秩序、比较制度案例。",
    [
      articleLink(
        "美国的问题不在于民主或专制，而在于工业时代制度已无法承载信息化时代",
        () =>
          findArticleBySlug(
            "theory/us-industrial-system-cannot-carry-information-age",
          ),
      ),
      articleLink("为什么信息化时代正在系统性瓦解美国的统合能力", () =>
        findArticleBySlug(
          "theory/information-age-erodes-us-integrative-capacity",
        ),
      ),
      articleLink("美国三权分立的真正危机，不是分权，而是失去统合能力", () =>
        findArticleBySlug(
          "theory/us-separation-of-powers-integrative-capacity-crisis",
        ),
      ),
      articleLink("外交的根源：从中共内政逻辑看其外交激进化", () =>
        findArticleBySlug("china/diplomacy-root"),
      ),
      articleLink("专制之癌：从《大明王朝1566》到结构性腐败的宿命", () =>
        findArticleBySlug("institution/despotism-cancer-ming-1566"),
      ),
      articleLink("海外政治运动为什么一事无成？", () =>
        findArticleBySlug("theory/overseas-political-movements-fail"),
      ),
    ],
    "articles",
    3,
  ],
]
  .map(([heading, description, items, moreSlug, maxVisible = 5]) =>
    renderThemeCard(heading, description, items, moreSlug, maxVisible),
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

  function maybeLine(slug) {
    const article = findArticleBySlug(slug);
    if (!article || used.has(article.slug)) return "";
    used.add(article.slug);
    return `${articleLine(article)}\n`;
  }

  let out = `## 分类目录\n\n${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}\n\n`;

  out += `## 一、公民秩序主义入门\n\n`;
  out +=
    "这一组文章用于帮助第一次接触本站的读者理解：什么是公民秩序主义，它为什么不是普通的政治口号，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的现代国家治理方案。\n\n";
  out += `- [[start-here|从这里开始阅读公民秩序主义]]\n`;
  out += maybeLine("civic-orderism/civic-orderism-manual");
  out += maybeLine("civic-orderism/what-civic-orderism-ultimately-solves");
  out += `- [[theory|理论总纲（栏目入口）]]\n`;
  out += maybeLine("civic-orderism/why-not-left-right-democracy-autocracy");
  out += maybeLine("civic-orderism/why-civic-orderism-is-easier-to-succeed");
  out += "\n";

  out += `## 二、委员会制度与公共判断机制\n\n`;
  out +=
    "这一组文章用于解释公民秩序主义的核心制度装置：委员会。委员会不是传统意义上的议会，也不是行政机关，而是承担公共判断、问题进入、责任评价、社会反馈和制度纠错的公共机制。\n\n";
  out += maybeLine("civic-orderism/what-is-committee-system");
  out += maybeLine("civic-orderism/why-dual-track-committee-administration");
  out += maybeLine("civic-orderism/committee-administration-opposite-incentives");
  out += maybeLine("civic-orderism/why-proposals-from-social-organizations");
  out += maybeLine("civic-orderism/why-focus-on-invisible-power-nodes");
  out += "\n";

  out += `## 三、国家运行与制度流程\n\n`;
  out +=
    "这一组文章用于说明公民秩序主义下国家如何实际运转，包括国家运行流程、中央与地方关系、行政系统、委员会系统、反馈系统和后台系统之间的关系。\n\n";
  out += maybeLine("civic-orderism/state-operation-process-under-civic-orderism");
  out += maybeLine("civic-orderism/top-level-power-structure-under-civic-orderism");
  out += maybeLine("civic-orderism/why-not-simple-separation-of-powers");
  out += maybeLine("civic-orderism/why-no-bicameral-parliament");
  out += maybeLine("civic-orderism/why-information-transparency");
  out += "\n";

  out += `## 四、选举、授权与责任更替\n\n`;
  out +=
    "这一组文章用于解释公民秩序主义如何处理公共路线差异、社会利益冲突、重大政策合法性和治理团队更替问题。它不是取消政治，而是把政治从政党垄断、流量表演和永久竞选中重新拉回公共责任与制度程序。\n\n";
  out += maybeLine("civic-orderism/public-politics-without-party-dominance");
  out += maybeLine("civic-orderism/why-weaken-party-politics");
  out += maybeLine("civic-orderism/election-logic-under-civic-orderism");
  out += maybeLine("civic-orderism/why-elections-reject-political-donations");
  out += maybeLine("civic-orderism/why-part-time-representatives");
  out += maybeLine("civic-orderism/why-civic-orderism-emphasizes-experience-and-records");
  out += "\n";

  out += `## 五、治理后台、教育与执行系统\n\n`;
  out +=
    "这一组文章用于说明公民秩序主义为什么重视后台系统、制度训练、公共数据、行政执行能力和长期教育投入。现代国家不能只靠口号和选票运转，必须拥有稳定、专业、可追踪、可纠错的治理后台。\n\n";
  out += maybeLine("civic-orderism/backend-system-under-civic-orderism");
  out += maybeLine("civic-orderism/why-justice-serves-reality");
  out += maybeLine("theory/trapped-by-process");
  out += maybeLine("theory/ai-monitoring-organizational-friction");
  out += maybeLine("civic-orderism/why-emphasize-reciprocity-and-equality");
  out += "\n";

  out += `## 六、中共组织诊断\n\n`;
  out +=
    "这一组文章用于解释旧秩序为什么失效。本站并不把中国问题简单理解为某一个人的问题，而是从党国系统、官僚结构、反馈失真、权力集中、组织信用破产和高刚性体制失灵等角度分析中共。\n\n";
  out += maybeLine("theory/party-state-structural-failure");
  out += maybeLine("china/xi-power-centralization");
  out += maybeLine("china/when-high-ranking-officials-are-no-longer-safe");
  out += maybeLine("china/ccp-reform-political-balance-deadlock");
  out += maybeLine("china/elite-sandification-ming-bureaucrats-ccp");
  out += maybeLine("theory/high-rigidity-system-ccp");
  out += "\n";

  out += `## 七、现实问题与社会成本\n\n`;
  out +=
    "这一组文章用于解释中共组织失效如何外溢为普通人的现实困境，包括社保、医保、金融、基层治理、民营经济、社会成本上升和公共系统失去解释能力等问题。\n\n";
  out += maybeLine(
    "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
  );
  out += maybeLine("china/chicken-and-cage");
  out += maybeLine("china/propaganda-system-hollowing-out");
  out += maybeLine("theory/costly-industrial-governance-information-age");
  out += maybeLine("china/ccp-bureaucracy-historical-bill");
  out += "\n";

  out += `## 八、国际秩序与制度案例\n\n`;
  out +=
    "这一组文章用于通过美国制度危机、国际秩序、台海风险、战争判断和比较制度案例，说明现代国家治理问题并不只存在于中国，也存在于全球制度转型之中。\n\n";
  out += maybeLine("theory/us-industrial-system-cannot-carry-information-age");
  out += maybeLine("theory/information-age-erodes-us-integrative-capacity");
  out += maybeLine("theory/us-separation-of-powers-integrative-capacity-crisis");
  out += maybeLine("china/taiwan-war-risk");
  out += maybeLine("china/diplomacy-root");
  out += maybeLine("china/pla-political-subject-myth");
  out += "\n";

  const rest = articles.filter((article) => !used.has(article.slug));
  out += `## 按写作时间查阅：其余篇目\n\n`;
  out += rest.length
    ? rest.map(articleLine).join("\n")
    : "_（暂无其余篇目。）_";
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
description: "公民秩序主义：从理解旧秩序的失效出发，整理现代国家治理与制度思想文本；面向中国现实与信息化时代，强调可进入、可解释、可纠错、可追责的公共秩序。"
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

第一，中共式党国体制为什么正在失去解释、反馈、纠错和自我修复能力？

第二，在旧秩序失效之后，中国是否可能建立一种更可进入、可解释、可纠错、可追责的公共秩序？

公民秩序主义不是情绪化反对，也不是简单的政权替换想象，而是一套面向中国现实与信息化时代的国家治理理论。

${firstReadingSection}

## 按主题阅读

<div class="article-category-grid home-themed-reading-grid">

${themedReading}

</div>

## 最新文章

${homeLatest || "暂无文章。"}

## 栏目

${homeCategoryLinks.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

## 联系方式

严肃交流、资料反馈与建设性讨论，可联系：
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
        : items.length
          ? items.map(articleLine).join("\n")
          : "暂无文章。";

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

${categoryIntroductions.get(key) ? `${categoryIntroductions.get(key)}\n\n` : ""}## 文章列表

${articleListSection}`,
  );
}

console.log(`Generated indexes for ${articles.length} articles.`);
