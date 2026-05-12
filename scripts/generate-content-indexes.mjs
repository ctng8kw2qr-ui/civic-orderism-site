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

function findArticleByTitle(title) {
  return articles.find((article) => article.title.includes(title));
}

function articleLink(label, finder) {
  const article = finder();
  return article ? `[[${article.slug}|${label}]]` : label;
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
const primaryLinks = [
  `- **[[start-here|从这里开始阅读]]**  \n  按阅读路径理解公民秩序主义的基本立场、制度结构与现实指向。`,
  `- **[[civic-orderism|了解公民秩序主义]]**  \n  阅读这套理论的基本理念、制度骨架和国家运行方式。`,
  `- **[[china|理解中国现实与中共组织失效]]**  \n  从组织结构、权力激励和制度失效角度理解中国现实。`,
].join("\n");
const recommendedReading = [
  articleLink("公民秩序主义说明书", () =>
    findArticleBySlug("civic-orderism/civic-orderism-manual"),
  ),
  articleLink("公民秩序主义最终要解决的问题", () =>
    findArticleBySlug("civic-orderism/what-civic-orderism-ultimately-solves"),
  ),
  articleLink("什么是委员会", () =>
    findArticleBySlug("civic-orderism/what-is-committee-system"),
  ),
  articleLink("公民秩序主义下国家运行的大概流程", () =>
    findArticleBySlug(
      "civic-orderism/state-operation-process-under-civic-orderism",
    ),
  ),
  articleLink("党国系统的结构性失效：一个组织诊断", () =>
    findArticleBySlug("theory/party-state-structural-failure"),
  ),
]
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n");

const themedReading = [
  [
    "入门说明",
    "公民秩序主义是什么，解决什么问题。",
    [
      articleLink("公民秩序主义说明书", () =>
        findArticleBySlug("civic-orderism/civic-orderism-manual"),
      ),
      articleLink("公民秩序主义最终要解决的问题", () =>
        findArticleBySlug(
          "civic-orderism/what-civic-orderism-ultimately-solves",
        ),
      ),
      articleLink("为什么公民秩序主义不纠结于左右、民主专制之争", () =>
        findArticleBySlug(
          "civic-orderism/why-not-left-right-democracy-autocracy",
        ),
      ),
      articleLink(
        "为什么公民秩序主义反对道德叙事，也反对对公职人员的道德审判",
        () => findArticleBySlug("civic-orderism/why-against-moral-narrative"),
      ),
    ],
  ],
  [
    "委员会制度",
    "公共判断、监督、反馈和责任如何形成。",
    [
      articleLink("什么是委员会", () =>
        findArticleBySlug("civic-orderism/what-is-committee-system"),
      ),
      articleLink("为什么公民秩序主义必须采取委员会—行政双轨制", () =>
        findArticleBySlug(
          "civic-orderism/why-dual-track-committee-administration",
        ),
      ),
      articleLink("委员会与行政机关激励结构相反的意义", () =>
        findArticleBySlug(
          "civic-orderism/committee-administration-opposite-incentives",
        ),
      ),
      articleLink("为什么议案应主要来自社会组织", () =>
        findArticleBySlug(
          "civic-orderism/why-proposals-from-social-organizations",
        ),
      ),
      articleLink("为什么更加注意现代社会的隐形权力节点", () =>
        findArticleBySlug("civic-orderism/why-focus-on-invisible-power-nodes"),
      ),
    ],
  ],
  [
    "国家运行",
    "行政系统、权力结构和国家机器如何运转。",
    [
      articleLink("美国最高法院为何滑向党争终局战场", () =>
        findArticleBySlug(
          "theory/us-supreme-court-partisan-final-battleground",
        ),
      ),
      articleLink("公民秩序主义下国家运行的大概流程", () =>
        findArticleBySlug(
          "civic-orderism/state-operation-process-under-civic-orderism",
        ),
      ),
      articleLink("公民秩序主义下顶层权力结构的布局", () =>
        findArticleBySlug(
          "civic-orderism/top-level-power-structure-under-civic-orderism",
        ),
      ),
      articleLink("为什么公民秩序主义不采取简单的三权分立", () =>
        findArticleBySlug("civic-orderism/why-not-simple-separation-of-powers"),
      ),
      articleLink("为什么公民秩序主义议会不采取上下两院制", () =>
        findArticleBySlug("civic-orderism/why-no-bicameral-parliament"),
      ),
    ],
  ],
  [
    "选举与授权",
    "公共政治、路线差异和治理更替如何实现。",
    [
      articleLink("公民秩序主义下的选举逻辑", () =>
        findArticleBySlug("civic-orderism/election-logic-under-civic-orderism"),
      ),
      articleLink("为什么公民秩序主义下的选举会天然排斥政治献金", () =>
        findArticleBySlug(
          "civic-orderism/why-elections-reject-political-donations",
        ),
      ),
      articleLink("为什么议员主要应采取兼职制，而非全职制", () =>
        findArticleBySlug("civic-orderism/why-part-time-representatives"),
      ),
      articleLink("弱化政党政治之后，公共政治如何继续存在", () =>
        findArticleBySlug(
          "civic-orderism/public-politics-without-party-dominance",
        ),
      ),
      articleLink("公民秩序主义为什么刻意弱化政党政治", () =>
        findArticleBySlug("civic-orderism/why-weaken-party-politics"),
      ),
      articleLink("为什么公民秩序主义强调履历、经验", () =>
        findArticleBySlug(
          "civic-orderism/why-civic-orderism-emphasizes-experience-and-records",
        ),
      ),
    ],
  ],
  [
    "后台系统",
    "信息化、司法、数据、流程和技术治理。",
    [
      articleLink("一套正在变贵的管理方式", () =>
        findArticleBySlug(
          "theory/costly-industrial-governance-information-age",
        ),
      ),
      articleLink("公民秩序主义对后台系统的重视", () =>
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
  ],
  [
    "中共诊断",
    "党国系统、官僚体系和权力结构的失效。",
    [
      articleLink("党国系统的结构性失效：一个组织诊断", () =>
        findArticleBySlug("theory/party-state-structural-failure"),
      ),
      articleLink("解析高刚性体制：中共无以为继的结构性根因", () =>
        findArticleBySlug("theory/high-rigidity-system-ccp"),
      ),
      articleLink("为什么中共更可能“失灵”而非“倒台”", () =>
        findArticleBySlug("theory/ccp-high-fragility-dysfunction"),
      ),
      articleLink("为什么“无人担责的躺平心态”会摧毁超大型执政组织", () =>
        findArticleBySlug("theory/no-accountability-lie-flat-mentality"),
      ),
      articleLink("为什么程序性问责，常常敌不过组织化权力", () =>
        findArticleBySlug("theory/procedural-accountability-organized-power"),
      ),
      articleLink("习近平权力集中背后的系统逻辑", () =>
        findArticleBySlug("china/xi-power-centralization"),
      ),
    ],
  ],
  [
    "中国现实",
    "社保、医保、金融、社会压力与系统风险。",
    [
      articleLink("中共崩解的三大导火索：社保、医保与金融系统", () =>
        findArticleBySlug(
          "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
        ),
      ),
      articleLink("2018新“改革开放”：从开放社会到封闭风险", () =>
        findArticleBySlug("china/ccp-2018-new-reform-opening"),
      ),
      articleLink("养鸡与换笼：民营经济被整肃的结构逻辑", () =>
        findArticleBySlug("china/chicken-and-cage"),
      ),
      articleLink("中共的真正死局：改革未必救经济，却一定先打破政治平衡", () =>
        findArticleBySlug("china/ccp-reform-political-balance-deadlock"),
      ),
      articleLink("从“液压维稳”到当代的马其诺防线", () =>
        findArticleBySlug("china/maginot-line-of-stability-maintenance"),
      ),
    ],
  ],
  [
    "国际秩序",
    "外交、台海、战争与东北亚稳定。",
    [
      articleLink("外交的根源：从中共内政逻辑看其外交激进化", () =>
        findArticleBySlug("china/diplomacy-root"),
      ),
      articleLink("台海是否会走向战争", () =>
        findArticleBySlug("china/taiwan-war-risk"),
      ),
      articleLink("外界对解放军的迷思", () =>
        findArticleBySlug("china/pla-political-subject-myth"),
      ),
      articleLink("内变引外变：现代政治为何走到十字路口", () =>
        findArticleBySlug("theory/internal-change-external-change"),
      ),
    ],
  ],
  [
    "案例分析",
    "历史、影视、现实事件与结构性解释。",
    [
      articleLink("专制之癌：从《大明王朝1566》到结构性腐败的宿命", () =>
        findArticleBySlug("institution/despotism-cancer-ming-1566"),
      ),
      articleLink("沙化的忠诚：中共精英原子化与明代士大夫的历史镜像", () =>
        findArticleBySlug("china/elite-sandification-ming-bureaucrats-ccp"),
      ),
      articleLink("中宣系统“翻车常态化”背后的空心化逻辑", () =>
        findArticleBySlug("china/propaganda-system-hollowing-out"),
      ),
      articleLink("当高位者也不再安全", () =>
        findArticleBySlug(
          "china/when-high-ranking-officials-are-no-longer-safe",
        ),
      ),
      articleLink("海外政治运动为什么一事无成？", () =>
        findArticleBySlug("theory/overseas-political-movements-fail"),
      ),
    ],
  ],
]
  .map(
    ([heading, description, items]) =>
      `<section class="article-category-card">\n\n### ${heading}\n\n<p class="article-category-description">${description}</p>\n\n${items.map((item) => `- ${item}`).join("\n")}\n\n</section>`,
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
writeFile(
  "index.md",
  `---
title: "公民秩序主义"
date: 2026-05-10
category: "首页"
tags:
  - index
description: "公民秩序主义是一套面向现代社会的国家治理理论，强调秩序、尊严、责任、程序、自由与公共权力的可追责运行。"
status: published
---

<div class="home-hero-heading">
  <h1 class="home-hero-title">
    <img src="static/logo.png" alt="公民秩序主义 Logo" />
    <span>公民秩序主义</span>
  </h1>
  <a class="home-hero-contact" href="mailto:citizenorder@proton.me">citizenorder@proton.me</a>
</div>

## CIVIC ORDERISM

一套面向中国现实与信息化时代的现代国家治理理论。

公民秩序主义关心的不是谁掌握权力，也不是哪一种口号取得胜利，而是国家能否成为一套可进入、可解释、可纠错、可追责的公共秩序系统。

它试图回答三个问题：

- 普通人遇到制度问题时，是否有门可进？
- 公共权力作出决定时，是否有理可讲？
- 国家面对错误和风险时，是否有能力纠偏？

公民秩序主义主张：

国家不是人民之上的神圣机器，而是服务公民生活秩序的公共系统。制度的价值，不在于制造服从，而在于降低社会摩擦、保障基本尊严、形成可持续的公共信任。

## 新读者从这里开始

${primaryLinks}

## 核心概念

- 秩序 ORDER
- 尊严 DIGNITY
- 自由 LIBERTY
- 平等 EQUALITY
- 责任 ACCOUNTABILITY

## 第一次阅读建议

${recommendedReading}

## 按主题阅读

<div class="article-category-grid">

${themedReading}

</div>

## 最新文章

${homeLatest || "暂无文章。"}

## 栏目

${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

## 联系方式

如需反馈、讨论或提供资料，可通过以下邮箱联系：

[citizenorder@proton.me](mailto:citizenorder@proton.me)`,
);

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

## 分类目录

${categories.map(([key, label]) => `- [[${key}|${label}]]`).join("\n")}

${categories
  .map(([key, label]) => {
    const items = byCategory.get(key) ?? [];
    return `## ${label}\n\n${items.length ? items.map(articleLine).join("\n") : "暂无文章。"}`;
  })
  .join("\n\n")}`,
);

for (const [key, label, description] of categories) {
  const items = byCategory.get(key) ?? [];
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

${items.length ? items.map(articleLine).join("\n") : "暂无文章。"}`,
  );
}

console.log(`Generated indexes for ${articles.length} articles.`);
