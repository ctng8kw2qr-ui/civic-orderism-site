import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import prettier from "prettier";

const rootDir = path.resolve(".");
const contentDir = path.join(rootDir, "content");
const dataDir = path.join(rootDir, "data");
const articlePrefixes = [
  "theory/",
  "china/",
  "china-stage/",
  "civic-orderism/",
  "institution/",
];

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
const site = readJson("site.config.json");
const sections = readJson("sections.config.json");
const topics = readJson("topics.config.json");
const concepts = readJson("concepts.config.json");
const readingPaths = readJson("reading-paths.config.json");
const existingMigrationMap = fs.existsSync(
  path.join(rootDir, "content-migration-map.json"),
)
  ? readJson("../content-migration-map.json")
  : [];

const sectionByName = new Map(sections.map((item) => [item.name, item]));
const topicBySlug = new Map(topics.map((item) => [item.slug, item]));
const conceptBySlug = new Map(concepts.map((item) => [item.slug, item]));
const publicTopics = topics.filter((item) => item.status === "published");
const publicConcepts = concepts.filter((item) => item.status === "published");
const publicTopicSlugs = new Set(publicTopics.map((item) => item.slug));
const publicConceptSlugs = new Set(publicConcepts.map((item) => item.slug));
const existingMigrationBySlug = new Map(
  existingMigrationMap.map((item) => [item.slug, item]),
);
const institutionSlugs = new Set([
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
]);
const futureSlugs = new Set([
  "china/ccp-collapse-three-triggers-social-security-healthcare-finance",
  "china/ccp-reform-political-balance-deadlock",
  "china/ccp-bureaucracy-historical-bill",
  "china/chicken-and-cage",
  "china/maginot-line-of-stability-maintenance",
  "china/taiwan-war-risk",
  "china/taiwan-war-controllable-escalation-illusion",
]);
const ccpTheorySlugs = new Set([
  "theory/party-state-structural-failure",
  "theory/high-rigidity-system-ccp",
  "theory/ccp-high-fragility-dysfunction",
  "theory/ccp-completed-historical-task-refuses-exit",
  "theory/no-accountability-lie-flat-mentality",
]);
const manualReviewSlugs = new Set([
  "theory/democracy-still-exists-but-cannot-penetrate-reality",
  "theory/end-of-party-politics-in-information-age",
  "china/taiwan-war-controllable-escalation-illusion",
  "theory/us-industrial-system-cannot-carry-information-age",
  "theory/us-separation-of-powers-integrative-capacity-crisis",
  "theory/us-supreme-court-partisan-final-battleground",
  "theory/overseas-political-movements-fail",
  "china/elite-sandification-ming-bureaucrats-ccp",
  "china/taiwan-war-risk",
  "china/diplomacy-root",
  "china/pla-political-subject-myth",
  "theory/modern-social-syndrome",
  "institution/despotism-cancer-ming-1566",
  "theory/ai-monitoring-organizational-friction",
]);

const curatedTopicByArticle = new Map();
for (const topic of publicTopics) {
  for (const slug of topic.recommended) {
    const slugs = curatedTopicByArticle.get(slug) ?? [];
    curatedTopicByArticle.set(slug, [...slugs, topic.slug]);
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
  });
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
}

function originalSection(slug, data) {
  return String(data.category ?? data.section ?? slug.split("/")[0]);
}

function newSection(slug) {
  if (institutionSlugs.has(slug) || slug.startsWith("institution/"))
    return "制度设计";
  if (slug.startsWith("civic-orderism/")) return "公民秩序主义";
  if (slug.startsWith("china-stage/") || futureSlugs.has(slug))
    return "中国未来";
  if (slug.startsWith("china/") || ccpTheorySlugs.has(slug)) return "解析中共";
  return "公民秩序主义";
}

function includesAny(value, patterns) {
  return patterns.some((pattern) => value.includes(pattern));
}

function topicSlugs(article) {
  if (manualReviewSlugs.has(article.slug)) {
    return existingMigrationBySlug.get(article.slug)?.topics ?? [];
  }
  const text =
    `${article.slug} ${article.title} ${article.summary}`.toLowerCase();
  const found = new Set(curatedTopicByArticle.get(article.slug) ?? []);
  if (includesAny(text, ["习近平", "xi-", "接班", "succession", "权力集中"]))
    found.add("xi-era");
  if (
    includesAny(text, [
      "官僚",
      "基层减负",
      "干部",
      "purge",
      "开除党籍",
      "九龙治水",
      "多头",
      "避责",
    ])
  )
    found.add("bureaucratic-system");
  if (
    includesAny(text, [
      "秩序蒸发",
      "组织信用",
      "情感链接",
      "失灵",
      "高脆弱",
      "崩解",
      "倒计时",
      "靠不住",
    ])
  )
    found.add("order-evaporation");
  if (
    includesAny(text, [
      "三清",
      "历史账",
      "开除党籍",
      "整肃",
      "purge",
      "高位者",
      "不再安全",
    ])
  )
    found.add("three-cleans-era");
  if (includesAny(text, ["二次改开", "改革开放", "reform-opening", "改革未必"]))
    found.add("second-reform");
  if (
    includesAny(text, ["统治", "宣传", "维稳", "政治机器", "党压", "中共机制"])
  )
    found.add("ccp-governance");
  if (
    includesAny(text, [
      "财政",
      "金融",
      "社保",
      "医保",
      "债务",
      "制造业",
      "民营经济",
      "finance",
      "financial",
    ])
  )
    found.add("local-finance");
  if (
    includesAny(text, [
      "转型",
      "接替",
      "社会变革",
      "内变引外变",
      "非暴力",
      "国家重组",
    ])
  )
    found.add("political-transition");
  return [...found].filter((slug) => publicTopicSlugs.has(slug)).slice(0, 2);
}

function conceptSlugs(article) {
  if (manualReviewSlugs.has(article.slug)) {
    return existingMigrationBySlug.get(article.slug)?.concepts ?? [];
  }
  const text =
    `${article.slug} ${article.title} ${article.summary}`.toLowerCase();
  const found = new Set();
  const topicConcepts = article.topics.flatMap(
    (slug) => topicBySlug.get(slug)?.concepts ?? [],
  );
  topicConcepts.forEach((slug) => found.add(slug));
  if (includesAny(text, ["高脆弱", "fragility", "靠不住"]))
    found.add("high-fragility");
  if (includesAny(text, ["官僚", "避责", "不担责", "躺平", "基层减负"]))
    found.add("bureaucratic-shock");
  return [...found].filter((slug) => publicConceptSlugs.has(slug)).slice(0, 3);
}

const allRecommended = new Set([
  ...Object.values(readingPaths.recommendations).flat(),
  ...readingPaths.tenMinutes,
  ...readingPaths.thirtyMinutes.filter((item) => !item.startsWith("/")),
  ...readingPaths.routes.flatMap((item) => item.slugs),
]);
const allFeatured = new Set(readingPaths.recommendations.currentFocus);

const articles = walk(contentDir)
  .map((filePath) => {
    const relative = path
      .relative(contentDir, filePath)
      .split(path.sep)
      .join("/");
    if (relative.endsWith("/index.md") || relative === "index.md")
      return undefined;
    if (!articlePrefixes.some((prefix) => relative.startsWith(prefix)))
      return undefined;
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const slug = relative.replace(/\.md$/, "").replaceAll(" ", "-");
    const summary = String(parsed.data.summary ?? parsed.data.description ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const article = {
      title: String(parsed.data.title ?? path.basename(slug)),
      slug,
      date: normalizeDate(parsed.data.date ?? parsed.data.published),
      updated: normalizeDate(
        parsed.data.updated ?? parsed.data.modified ?? parsed.data.date,
      ),
      summary,
      body: parsed.content.replace(/\s+/g, " ").trim(),
      originalSection: originalSection(slug, parsed.data),
      section: newSection(slug),
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
      status: String(parsed.data.status ?? "published"),
    };
    article.topics = topicSlugs(article);
    article.concepts = conceptSlugs(article);
    article.featured = allFeatured.has(slug);
    article.recommended = allRecommended.has(slug);
    article.readingLevel =
      article.section === "制度设计"
        ? "制度"
        : article.section === "公民秩序主义"
          ? "基础"
          : "进阶";
    article.readingOrder = Math.min(
      ...topics
        .map((topic) => topic.recommended.indexOf(slug))
        .filter((index) => index >= 0),
      999,
    );
    article.author = String(parsed.data.author ?? "公民秩序主义");
    article.needsReview = manualReviewSlugs.has(slug);
    article.readingMinutes = Math.max(1, Math.ceil(article.body.length / 500));
    return article;
  })
  .filter(Boolean)
  .sort(
    (a, b) =>
      b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "zh-CN"),
  );

const articleBySlug = new Map(articles.map((item) => [item.slug, item]));
const migrationMap = articles.map(
  ({ body: _body, readingMinutes: _readingMinutes, ...article }) => article,
);
fs.writeFileSync(
  path.join(rootDir, "content-migration-map.json"),
  await prettier.format(JSON.stringify(migrationMap), { parser: "json" }),
);
fs.writeFileSync(
  path.join(rootDir, "content-migration-needs-review.json"),
  await prettier.format(
    JSON.stringify(migrationMap.filter((item) => item.needsReview)),
    { parser: "json" },
  ),
);

function writeContent(relativePath, body) {
  const target = path.join(contentDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${body.trim()}\n`, "utf8");
}

function yamlFrontmatter({
  title,
  description,
  date = "2026-07-19",
  contentType = "页面",
  aliases = [],
  status = "published",
  listed = true,
  noindex = false,
}) {
  return `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\nupdated: 2026-07-19\ndescription: ${JSON.stringify(description)}\ncontentType: ${JSON.stringify(contentType)}\nstatus: ${status}\nlisted: ${listed}\nnoindex: ${noindex}\n${aliases.length ? `aliases:\n${aliases.map((item) => `  - ${item}`).join("\n")}\n` : ""}---`;
}

function isEligibleArticle(article) {
  return (
    article && article.status === "published" && article.needsReview !== true
  );
}

function mdLink(article) {
  return article ? `[[${article.slug}|${article.title}]]` : "待人工确认";
}

function articleCard(article) {
  const topic = article.topics
    .map((slug) => topicBySlug.get(slug))
    .find((item) => item?.status === "published");
  const concept = article.concepts
    .map((slug) => conceptBySlug.get(slug))
    .find((item) => item?.status === "published");
  const chips = [
    topic ? `专题：${topic.name}` : "",
    concept ? `概念：${concept.name}` : "",
  ].filter(Boolean);
  const summary = article.summary || `${article.title}的结构分析与研究笔记。`;
  return `<article class="knowledge-card" data-knowledge-card data-topics="${article.topics.join(" ")}" data-concepts="${article.concepts.join(" ")}">
  <p class="knowledge-card__meta"><span>${article.date || "日期待补"}</span><span>${article.section}</span><span>${article.readingMinutes} 分钟</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
  <p class="knowledge-card__summary">${summary}</p>${
    chips.length
      ? `
  <p class="knowledge-card__chips">${chips.map((item) => `<span>${item}</span>`).join("")}</p>`
      : ""
  }
</article>`;
}

function cardGrid(items, className = "knowledge-grid") {
  return `<div class="${className}">\n${items.filter(Boolean).map(articleCard).join("\n")}\n</div>`;
}

function filterPanel(items) {
  const usedTopics = [...new Set(items.flatMap((item) => item.topics))]
    .map((slug) => topicBySlug.get(slug))
    .filter((item) => item?.status === "published");
  const usedConcepts = [...new Set(items.flatMap((item) => item.concepts))]
    .map((slug) => conceptBySlug.get(slug))
    .filter((item) => item?.status === "published");
  return `<div class="knowledge-browser" data-knowledge-browser data-page-size="10">
<div class="knowledge-filters" aria-label="文章筛选">
  <label>专题<select data-filter-topic><option value="">全部专题</option>${usedTopics.map((item) => `<option value="${item.slug}">${item.name}</option>`).join("")}</select></label>
  <label>核心概念<select data-filter-concept><option value="">全部概念</option>${usedConcepts.map((item) => `<option value="${item.slug}">${item.name}</option>`).join("")}</select></label>
  <button type="button" data-filter-reset>重置</button>
</div>
${cardGrid(items)}
<div class="knowledge-pagination" aria-label="文章分页"><button type="button" data-page-prev>上一页</button><span data-page-status></span><button type="button" data-page-next>下一页</button></div>
</div>`;
}

function sectionPage(section) {
  const items = articles.filter(
    (article) =>
      article.section === section.name && article.status !== "archived",
  );
  const recommended = section.recommended
    .map((slug) => articleBySlug.get(slug))
    .filter(isEligibleArticle);
  const topicCards = section.topics
    .map((slug) => topicBySlug.get(slug))
    .filter((item) => item?.status === "published")
    .map((topic) => {
      const count = items.filter((article) =>
        article.topics.includes(topic.slug),
      ).length;
      return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${count} 篇相关文章</small></a>`;
    })
    .join("\n");
  return `${yamlFrontmatter({ title: section.name, description: section.description, contentType: "栏目" })}

# ${section.name}

${section.description}

<div class="section-stats"><span>${items.length} 篇文章</span><span>${section.topics.length} 个专题入口</span><span>更新至 ${items[0]?.updated || "2026-07-19"}</span></div>

## 推荐文章

${cardGrid(recommended, "knowledge-grid knowledge-grid--recommended")}

## 专题入口

<div class="topic-entry-grid">${topicCards}</div>

## 全部文章

可按专题或核心概念筛选。每页显示 10 篇，筛选不会改变文章原有 URL。

${filterPanel(items)}`;
}

for (const section of sections) {
  const route =
    section.slug === "china" || section.slug === "civic-orderism"
      ? `${section.slug}/index.md`
      : `${section.slug}/index.md`;
  writeContent(route, sectionPage(section));
}

function simpleArticleList(slugs) {
  return (
    slugs
      .map((slug) => articleBySlug.get(slug))
      .filter(Boolean)
      .map(
        (article) => `- ${mdLink(article)} — ${article.summary || "摘要待补"}`,
      )
      .join("\n") || "- 待人工确认"
  );
}

const startCards = [
  ["第一次来到这里", "用 10 分钟建立最小阅读框架。", "/start", "开始阅读"],
  [
    "想理解中共为什么变成今天这样",
    "从权力机制、官僚系统与组织惯性进入。",
    "/china",
    "进入解析中共",
  ],
  [
    "想知道中国未来可能怎样变化",
    "查看趋势判断、改革窗口与政治转型。",
    "/china-future",
    "进入中国未来",
  ],
  [
    "想了解替代性的政治与制度方案",
    "先看理论框架，再进入制度机制。",
    "/civic-orderism",
    "理解制度回应",
  ],
];
const homeTopicCards = publicTopics
  .slice(0, 6)
  .map((topic) => {
    const related = articles.filter((article) =>
      article.topics.includes(topic.slug),
    );
    const updated =
      related
        .map((article) => article.updated)
        .sort()
        .at(-1) || "待更新";
    return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${related.length} 篇 · 更新至 ${updated}</small></a>`;
  })
  .join("\n");
const recommendationGroups = [
  ["新读者必读", readingPaths.recommendations.newReader],
  ["当前重点", readingPaths.recommendations.currentFocus],
  ["理论基础", readingPaths.recommendations.theoryFoundation],
];
const homeRecommendationArticles = new Set(
  recommendationGroups.flatMap(([, slugs]) =>
    slugs
      .map((slug) => articleBySlug.get(slug))
      .filter(isEligibleArticle)
      .map((article) => article.slug),
  ),
);
const latestArticles = articles
  .filter(isEligibleArticle)
  .filter((article) => !homeRecommendationArticles.has(article.slug))
  .slice(0, 6);

writeContent(
  "index.md",
  `${yamlFrontmatter({ title: site.name, description: site.description, contentType: "首页" })}

<section class="v2-hero">
  <p class="home-kicker">${site.englishName}</p>
  <h1><img src="/static/logo.png" alt="" />${site.name}</h1>
  <p class="v2-hero__tagline">${site.tagline}</p>
  <p>${site.description}</p>
</section>

<section class="home-section">

## 从哪里开始

<div class="start-entry-grid">
${startCards.map(([title, description, href, action]) => `<a class="start-entry-card" href="${href}"><strong>${title}</strong><span>${description}</span><small>${action} →</small></a>`).join("\n")}
</div>

</section>

<section class="home-section">

## 核心专题

<div class="topic-entry-grid">${homeTopicCards}</div>

<p class="section-more"><a href="/topics">查看全部专题 →</a></p>

</section>

<section class="home-section">

## 推荐阅读

<div class="recommendation-columns">
${recommendationGroups
  .map(
    ([name, slugs]) =>
      `<section><h3>${name}</h3><ol>${slugs
        .map((slug) => articleBySlug.get(slug))
        .filter(isEligibleArticle)
        .map(
          (article) =>
            `<li><a href="/${article.slug}">${article.title}</a></li>`,
        )
        .join("")}</ol></section>`,
  )
  .join("\n")}
</div>

</section>

<section class="home-section">

## 最新文章

${cardGrid(latestArticles)}

<p class="section-more"><a href="/articles">查看全部文章 →</a></p>

</section>

<section class="home-section">

## 核心文档

<div class="publication-grid">
${site.documents.map((doc) => `<section class="publication-card"><p class="resource-label">核心文档</p><h3>${doc.title}</h3><p class="resource-subtitle">${doc.description}</p><small>更新：${doc.updated}</small><a class="resource-button resource-button-primary" href="${doc.href}">阅读或下载</a></section>`).join("\n")}
</div>

</section>

<section class="home-section contact-section">

## 联系与项目说明

本站以政治研究与制度知识整理为主，不设聊天群、社区群或公开投稿入口。严肃交流与资料反馈可通过邮件联系。

<dl class="contact-list"><div><dt>主要联系邮箱</dt><dd><a href="mailto:${site.primaryEmail}">${site.primaryEmail}</a></dd></div><div><dt>备用邮箱</dt><dd><a href="mailto:${site.secondaryEmail}">${site.secondaryEmail}</a></dd></div></dl>

</section>`,
);

writeContent(
  "start.md",
  `${yamlFrontmatter({ title: "开始阅读", description: "按照时间与读者背景进入公民秩序主义知识库。", contentType: "阅读路径" })}

# 开始阅读

第一次来到这里，不需要按发布时间阅读。下面的入口把“现实问题 → 结构解释 → 趋势判断 → 理论回应 → 制度设计”压缩成可执行的阅读路线。

## 只有 10 分钟

${simpleArticleList(readingPaths.tenMinutes)}

## 有 30 分钟

- [《公民秩序主义介绍手册》PDF](/files/civic-orderism-introduction-manual.pdf)
${simpleArticleList(readingPaths.thirtyMinutes.filter((item) => !item.startsWith("/")))}

## 想系统了解

1. 现实问题：从普通人的压力和制度摩擦进入。
2. 中共运行机制：理解组织、官僚和权力结构。
3. 中国未来：判断改革窗口、风险与国家重组可能。
4. 公民秩序主义：理解价值基础与理论回应。
5. 制度设计：检验具体机制是否可执行、可纠错、可追责。

## 推荐阅读路线

<div class="reading-route-grid">
${readingPaths.routes
  .map(
    (route) =>
      `<section class="reading-route-card"><h3>${route.name}</h3><p>${route.description}</p><ol>${route.slugs
        .map((slug) => articleBySlug.get(slug))
        .filter(Boolean)
        .map(
          (article) =>
            `<li><a href="/${article.slug}">${article.title}</a></li>`,
        )
        .join("")}</ol></section>`,
  )
  .join("\n")}
</div>

> 路线中的文章由现有摘要和正文内容匹配；分类不确定的条目已记录在项目的人工复核清单中。`,
);

writeContent(
  "start-here/index.md",
  `${yamlFrontmatter({ title: "从这里开始", description: "旧的新读者入口，保留原 URL 并引导至新版开始阅读页面。", contentType: "兼容入口" })}

# 从这里开始

这是保留的旧版入口。新版阅读路线已经迁移到 [[start|开始阅读]]，原有 URL 继续有效。

- [[start|进入新版开始阅读页面]]
- [阅读介绍手册 PDF](/files/civic-orderism-introduction-manual.pdf)
- [[articles|查看完整阅读地图]]`,
);

for (const topic of topics) {
  const related = articles.filter((article) =>
    article.topics.includes(topic.slug),
  );
  const recommended = topic.recommended
    .map((slug) => articleBySlug.get(slug))
    .filter(isEligibleArticle);
  const topicIsPublic = topic.status === "published";
  writeContent(
    `topics/${topic.slug}.md`,
    `${yamlFrontmatter({ title: topic.name, description: topic.description, contentType: "专题", status: topic.status, listed: topicIsPublic, noindex: !topicIsPublic })}

# ${topic.name}

${topic.description}

<div class="topic-hero-note"><strong>核心判断</strong><p>${topic.coreJudgment}</p><small>${related.length} 篇相关文章 · 最近更新 ${
      related
        .map((article) => article.updated)
        .sort()
        .at(-1) || "待更新"
    }</small></div>

## 推荐阅读顺序

${recommended.length ? recommended.map((article, index) => `${index + 1}. ${mdLink(article)} — ${article.summary || "摘要待补"}`).join("\n") : "推荐顺序待人工完善。"}

## 全部相关文章

${cardGrid(related)}

## 相关核心概念

${topic.concepts
  .map((slug) => conceptBySlug.get(slug))
  .filter((concept) => concept?.status === "published")
  .map(
    (concept) =>
      `- [[concepts/${concept.slug}|${concept.name}]] — ${concept.definition}`,
  )
  .join("\n")}`,
  );
}

writeContent(
  "topics/index.md",
  `${yamlFrontmatter({ title: "专题", description: "围绕持续研究线索组织的专题入口。", contentType: "专题索引" })}

# 专题

专题不是普通标签，而是能够容纳多篇文章并持续更新的研究线索。

<div class="topic-entry-grid">${publicTopics
    .map((topic) => {
      const count = articles.filter((article) =>
        article.topics.includes(topic.slug),
      ).length;
      return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${count} 篇相关文章</small></a>`;
    })
    .join("\n")}</div>`,
);

for (const concept of concepts) {
  const relatedArticles = articles.filter((article) =>
    article.concepts.includes(concept.slug),
  );
  const conceptIsPublic = concept.status === "published";
  writeContent(
    `concepts/${concept.slug}.md`,
    `${yamlFrontmatter({ title: concept.name, description: concept.definition, contentType: "核心概念", status: concept.status, listed: conceptIsPublic, noindex: !conceptIsPublic })}

# ${concept.name}

<p class="concept-definition">${concept.definition}</p>

| 字段 | 内容 |
| --- | --- |
| 首次提出或使用 | ${concept.firstUsed} |
| 更新时间 | 2026-07-19 |
| 发布建议 | ${concept.publicationClass} 类 |
| 完善状态 | ${conceptIsPublic ? "已完成发布复核" : "保留框架，暂不公开"} |

## 完整解释

${concept.explanation ?? concept.publicationReason}

## 形成机制

${concept.mechanism}

## 现实表现

${concept.manifestations.map((item) => `- ${item}`).join("\n")}

## 相关文章

${relatedArticles.length ? cardGrid(relatedArticles.slice(0, 12)) : "相关文章关联待补充。"}

## 相关专题

${concept.topics
  .map((slug) => topicBySlug.get(slug))
  .filter((topic) => topic?.status === "published")
  .map((topic) => `- [[topics/${topic.slug}|${topic.name}]]`)
  .join("\n")}

## 相关概念

${concept.related
  .map((slug) => conceptBySlug.get(slug))
  .filter((item) => item?.status === "published")
  .map((item) => `- [[concepts/${item.slug}|${item.name}]]`)
  .join("\n")}`,
  );
}

writeContent(
  "concepts/index.md",
  `${yamlFrontmatter({ title: "核心概念库", description: "公民秩序主义研究中的核心概念与知识节点。", contentType: "概念索引" })}

# 核心概念库

这里仅收录已经完成发布复核、能够反复用于解释现实并连接专题与制度讨论的知识节点。仍需论证或建议合并的概念保留内部框架，但不在公开索引中显示。

<div class="concept-grid">${publicConcepts.map((concept) => `<a class="concept-card" href="/concepts/${concept.slug}"><strong>${concept.name}</strong><span>${concept.definition}</span><small>已完成发布复核</small></a>`).join("\n")}</div>`,
);

writeContent(
  "about.md",
  `${yamlFrontmatter({ title: "关于", description: "关于公民秩序主义项目、研究方法与联系方式。", contentType: "页面" })}

# 关于

公民秩序主义是一个从中国现实问题出发，连接结构解释、趋势判断、理论回应与制度设计的政治研究与制度知识库。

本站保持专业、审慎、冷静和克制的写作方式。这里不以新闻速度为目标，也不以口号、情绪动员或个人崇拜替代制度分析。

## 研究路径

现实问题 → 结构解释 → 趋势判断 → 理论回应 → 制度设计

## 阅读入口

- [[start|开始阅读]]
- [[topics|专题]]
- [[concepts|核心概念]]
- [[articles|全部文章]]

## 核心文档

${site.documents.map((doc) => `- [${doc.title}](${doc.href}) — ${doc.description}`).join("\n")}

## 联系方式

- 主要联系邮箱：[${site.primaryEmail}](mailto:${site.primaryEmail})
- 备用邮箱：[${site.secondaryEmail}](mailto:${site.secondaryEmail})
- 网站：[civicorderism.com](https://civicorderism.com/)

本站不设聊天群、社区群或公开投稿入口。`,
);

writeContent(
  "theory/index.md",
  `${yamlFrontmatter({ title: "旧秩序失效", description: "保留的旧栏目入口；相关内容已纳入公民秩序主义与中国政治转型专题。", contentType: "兼容入口" })}

# 旧秩序失效

这是保留的旧栏目入口。相关研究已按新的信息架构纳入 [[civic-orderism|公民秩序主义]]、[[topics/political-transition|中国政治转型]]与具体核心概念，原有文章 URL 均保持不变。

${filterPanel(articles.filter((article) => article.slug.startsWith("theory/")))}`,
);

writeContent(
  "china-stage/index.md",
  `${yamlFrontmatter({ title: "中国阶段判断", description: "保留的旧栏目入口；阶段判断已纳入中国未来。", contentType: "兼容入口" })}

# 中国阶段判断

这是保留的旧栏目入口。阶段性预测、改革窗口与未来路径现统一进入 [[china-future|中国未来]]，原有文章 URL 均保持不变。

${filterPanel(articles.filter((article) => article.slug.startsWith("china-stage/")))}`,
);

writeContent(
  "institution/index.md",
  `${yamlFrontmatter({ title: "制度机制", description: "保留的旧栏目入口；制度文章已纳入制度设计。", contentType: "兼容入口" })}

# 制度机制

这是保留的旧栏目入口。委员会、行政、议会、选举、司法与后台系统现统一进入 [[institution-design|制度设计]]，原有文章 URL 均保持不变。

${filterPanel(articles.filter((article) => article.section === "制度设计"))}`,
);

console.log(
  `Generated V2 architecture for ${articles.length} articles, ${topics.length} topics, and ${concepts.length} concepts.`,
);
