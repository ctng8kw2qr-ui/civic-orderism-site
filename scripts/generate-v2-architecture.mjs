import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import prettier from "prettier";
import {
  getPrimaryTopicArticles,
  resolveTopicRelations,
} from "./lib/topic-relations.mjs";

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
const readingSequences = readJson("reading-sequences.config.json");
const articleTopicAssignments = readJson("article-topics.config.json");
const existingMigrationMap = fs.existsSync(
  path.join(rootDir, "content-migration-map.json"),
)
  ? readJson("../content-migration-map.json")
  : [];

const sectionByName = new Map(sections.map((item) => [item.name, item]));
const topicBySlug = new Map(topics.map((item) => [item.slug, item]));
const conceptBySlug = new Map(concepts.map((item) => [item.slug, item]));
const publicTopics = topics.filter((item) => item.status === "published");
const conceptPublicationStatus = (concept) =>
  concept.publicationStatus ??
  (concept.status === "published"
    ? "published"
    : concept.publicationClass === "B"
      ? "reviewing"
      : "held");
const formalConcepts = concepts.filter(
  (item) => conceptPublicationStatus(item) === "published",
);
const researchConcepts = concepts.filter(
  (item) => conceptPublicationStatus(item) === "reviewing",
);
const visibleConcepts = [...formalConcepts, ...researchConcepts];
const publicTopicSlugs = new Set(publicTopics.map((item) => item.slug));
const publicConceptSlugs = new Set(visibleConcepts.map((item) => item.slug));
const existingMigrationBySlug = new Map(
  existingMigrationMap.map((item) => [item.slug, item]),
);
const primaryTopicByArticle = new Map(
  articleTopicAssignments.map((item) => [item.slug, item.primaryTopic]),
);
if (primaryTopicByArticle.size !== articleTopicAssignments.length) {
  throw new Error(
    "Article primary topic configuration contains duplicate slugs.",
  );
}
for (const assignment of articleTopicAssignments) {
  if (!publicTopicSlugs.has(assignment.primaryTopic)) {
    throw new Error(
      `Unknown or unpublished primary topic: ${assignment.slug} -> ${assignment.primaryTopic}`,
    );
  }
}
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

function inferredTopicSlugs(article) {
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
  const found = new Set(
    concepts
      .filter((concept) =>
        concept.representativeArticles?.includes(article.slug),
      )
      .map((concept) => concept.slug),
  );
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
    Object.assign(
      article,
      resolveTopicRelations({
        primaryTopic: primaryTopicByArticle.get(article.slug),
        relatedTopics: inferredTopicSlugs(article),
        validTopicSlugs: publicTopicSlugs,
      }),
    );
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
for (const assignment of articleTopicAssignments) {
  if (!articleBySlug.has(assignment.slug)) {
    throw new Error(`Primary topic article does not exist: ${assignment.slug}`);
  }
}
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
  folderListed = listed,
  noindex = false,
  publicationStatus,
}) {
  return `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\nupdated: 2026-07-20\ndescription: ${JSON.stringify(description)}\ncontentType: ${JSON.stringify(contentType)}\nstatus: ${status}\nlisted: ${listed}\nfolderListed: ${folderListed}\nnoindex: ${noindex}\n${publicationStatus ? `publicationStatus: ${publicationStatus}\n` : ""}${aliases.length ? `aliases:\n${aliases.map((item) => `  - ${item}`).join("\n")}\n` : ""}---`;
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
  const topic = article.primaryTopic
    ? topicBySlug.get(article.primaryTopic)
    : undefined;
  const concept = article.concepts
    .map((slug) => conceptBySlug.get(slug))
    .find((item) => item && publicConceptSlugs.has(item.slug));
  const chips = [
    topic ? `专题：${topic.name}` : "",
    concept ? `概念：${concept.name}` : "",
  ].filter(Boolean);
  const summary = article.summary || `${article.title}的结构分析与研究笔记。`;
  return `<article class="knowledge-card" data-knowledge-card data-topics="${article.primaryTopic ?? ""}" data-concepts="${article.concepts.join(" ")}">
  <p class="knowledge-card__meta"><span>${article.date || "日期待补"}</span><span>${article.readingMinutes} 分钟阅读</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
  <p class="knowledge-card__summary">${summary}</p>${
    chips.length
      ? `
  <p class="knowledge-card__chips">${chips.map((item) => `<span>${item}</span>`).join("")}</p>`
      : ""
  }
</article>`;
}

function homeArticleCard(article) {
  const topic = article.primaryTopic
    ? topicBySlug.get(article.primaryTopic)
    : undefined;
  const concept = article.concepts
    .map((slug) => conceptBySlug.get(slug))
    .find((item) => item && publicConceptSlugs.has(item.slug));
  const marker = topic
    ? `专题：${topic.name}`
    : concept
      ? `概念：${concept.name}`
      : "";
  const summary = article.summary || `${article.title}的结构分析与研究笔记。`;
  return `<article class="knowledge-card home-article-card">
  <p class="knowledge-card__meta"><span>${article.date || "日期待补"}</span><span>${article.section}</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
  <p class="knowledge-card__summary">${summary}</p>${
    marker
      ? `
  <p class="knowledge-card__chips"><span>${marker}</span></p>`
      : ""
  }
</article>`;
}

function cardGrid(items, className = "knowledge-grid") {
  return `<div class="${className}">\n${items.filter(Boolean).map(articleCard).join("\n")}\n</div>`;
}

function filterPanel(items) {
  const usedTopics = [
    ...new Set(items.map((item) => item.primaryTopic).filter(Boolean)),
  ]
    .map((slug) => topicBySlug.get(slug))
    .filter((item) => item?.status === "published");
  const usedConcepts = [...new Set(items.flatMap((item) => item.concepts))]
    .map((slug) => conceptBySlug.get(slug))
    .filter((item) => item && publicConceptSlugs.has(item.slug));
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
      article.section === section.name && article.status === "published",
  );
  const recommended = section.recommended
    .map((slug) => articleBySlug.get(slug))
    .filter(isEligibleArticle);
  const sectionTopics = section.topics
    .map((slug) => topicBySlug.get(slug))
    .filter((item) => item?.status === "published");
  const topicCards = sectionTopics
    .map((topic) => {
      const count = getPrimaryTopicArticles(items, topic.slug).length;
      return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${count} 篇相关文章</small></a>`;
    })
    .join("\n");
  const relatedConcepts = [
    ...new Set(items.flatMap((article) => article.concepts)),
  ]
    .map((slug) => conceptBySlug.get(slug))
    .filter((concept) => concept && publicConceptSlugs.has(concept.slug))
    .slice(0, 8);
  return `${yamlFrontmatter({ title: section.name, description: section.description, contentType: "栏目" })}

# ${section.name}

${section.description}

<div class="section-stats"><span>${items.length} 篇已发布文章</span><span>${sectionTopics.length} 个正式专题</span><span>更新至 ${items[0]?.updated || "2026-07-19"}</span></div>

<div class="section-core-judgment"><strong>栏目核心判断</strong><p>${section.coreJudgment}</p></div>

## 推荐文章

${cardGrid(recommended, "knowledge-grid knowledge-grid--recommended")}

## 专题入口

${topicCards ? `<div class="topic-entry-grid${sectionTopics.length === 1 ? " topic-entry-grid--single" : ""}">${topicCards}</div>` : '<p class="section-empty-note">当前栏目尚无独立公开专题，可直接按核心概念浏览全部文章。</p>'}

## 全部文章

可按专题或核心概念筛选。每页显示 10 篇，筛选不会改变文章原有 URL。

${filterPanel(items)}

## 相关核心概念

${relatedConcepts.length ? `<div class="section-concept-links">${relatedConcepts.map((concept) => `<a href="/concepts/${concept.slug}">${concept.name}</a>`).join("\n")}</div>` : "当前暂无已公开的相关核心概念。"}`;
}

for (const section of sections) {
  const route =
    section.slug === "china" || section.slug === "civic-orderism"
      ? `${section.slug}/index.md`
      : `${section.slug}/index.md`;
  writeContent(route, sectionPage(section));
}

const latestArticles = articles.filter(isEligibleArticle).slice(0, 4);

const roadmapSteps = [
  "高脆弱态",
  "官僚系统高压与休克",
  "社会秩序蒸发",
  "旧制度运行成本持续上升",
  "建立低摩擦转轨机制",
  "形成新的制度框架",
  "进入信息化时代治理结构",
];

const newcomerSteps = readingPaths.homepage
  .map((item, index) => {
    return `<a class="onboarding-card" href="${item.href}"><span class="onboarding-card__number">${String(index + 1).padStart(2, "0")}</span><span class="onboarding-card__body"><strong>${item.label}</strong></span><small>继续阅读 →</small></a>`;
  })
  .join("\n");

const homepageTopics = readingPaths.homepageTopics
  .map((slug) => topicBySlug.get(slug))
  .filter((topic) => topic?.status === "published");
if (homepageTopics.length !== 4) {
  throw new Error("Homepage must contain exactly four published core topics.");
}
const homepageTopicCards = homepageTopics
  .map((topic) => {
    const related = getPrimaryTopicArticles(articles, topic.slug);
    const updated = related
      .map((article) => article.updated)
      .sort()
      .at(-1);
    return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${related.length} 篇文章 · 更新至 ${updated || "待更新"}</small></a>`;
  })
  .join("\n");

const theorySystemCards = sections
  .map(
    (section) =>
      `<a class="theory-system-card" href="/${section.slug}"><strong>${section.name}</strong><span>${section.description}</span><small>进入栏目 →</small></a>`,
  )
  .join("\n");

const startReadingSequence = readingSequences.find(
  (sequence) => sequence.id === "civic-orderism-introduction",
);
const startReadingItems = (startReadingSequence?.items ?? [])
  .flatMap((item) => {
    if (item.href) return [{ href: item.href, title: item.title }];
    const article = articleBySlug.get(item.slug);
    return isEligibleArticle(article)
      ? [{ href: `/${article.slug}`, title: article.title }]
      : [];
  })
  .map(
    (item, index) =>
      `<li><a href="${item.href}">${String(index + 1).padStart(2, "0")} · ${item.title}</a></li>`,
  )
  .join("\n");

writeContent(
  "index.md",
  `${yamlFrontmatter({ title: site.name, description: site.description, contentType: "首页", aliases: ["article_priority_index", "article_summaries"] })}

<section class="v2-hero home-platform-hero">
  <p class="home-kicker">${site.englishName}</p>
  <h1><img src="/static/logo.png" alt="" />${site.name}</h1>
  <p class="v2-hero__tagline">从现实痛感进入结构判断，再进入制度回应。</p>
  <div class="home-platform-hero__copy"><p>本站研究中国旧治理结构为何失效，并探索一条保持国家连续性的低摩擦制度转轨路径。</p></div>
  <div class="v2-actions"><a class="v2-button v2-button--primary" href="/start">5分钟了解公民秩序主义</a><a class="v2-button v2-button--secondary" href="/files/civic-orderism-introduction-manual.pdf">阅读介绍手册</a><a class="v2-button v2-button--text" href="#core-topics">按专题阅读</a></div>
</section>

<section class="home-section" id="start-reading">
  <div class="home-section-heading"><div><p class="resource-label">从哪里开始</p><h2>第一次来到本站？</h2><p>用5分钟建立最小阅读框架，再按顺序进入结构分析与制度回应。</p></div><a href="/articles">查看阅读地图 →</a></div>
  <div class="onboarding-list">${newcomerSteps}</div>
</section>

<section class="home-section home-stakeholders">
  <div class="home-section-intro"><p class="resource-label">转轨的现实条件</p><h2>官僚、社会、国家三者诉求的交汇</h2><p>制度转轨不能只表达一种立场，还必须回答不同参与者如何获得稳定预期，以及国家能力如何得到接续。</p></div>
  <div class="stakeholder-grid"><article><strong>官僚系统</strong><p>需要退路、尊严、安全与稳定预期。</p></article><article><strong>社会</strong><p>需要秩序、保障、公平与基本尊严。</p></article><article><strong>国家</strong><p>需要连续性、可治理性与低风险转型。</p></article></div>
  <div class="transition-principles"><p><strong>不是</strong>推翻一切，<span>而是完成转轨。</span></p><p><strong>不是</strong>全面清算，<span>而是明确责任边界。</span></p><p><strong>不是</strong>制造新的恐惧，<span>而是建立新的制度预期。</span></p></div>
  <p class="home-stakeholders__summary">公民秩序主义所追求的，是一条让国家不失控、社会不撕裂、官僚系统不必绝望的转轨道路。<a href="/start#method-difference">理解转轨方法 →</a></p>
</section>

<section class="home-section" id="core-topics">
  <div class="home-section-heading"><div><p class="resource-label">持续研究线索</p><h2>核心专题</h2><p>从四条相互关联的研究线索进入，而不是追逐孤立事件。</p></div><a href="/topics">查看全部专题 →</a></div>
  <div class="topic-entry-grid home-core-topic-grid">${homepageTopicCards}</div>
</section>

<section class="home-section home-method-teaser">
  <div><p class="resource-label">方法差异</p><h2>公民秩序主义关注的，不只是价值，而是转轨如何发生</h2><p>价值主张说明希望抵达哪里，制度路线还要回答谁来承接、风险如何降低、国家能力怎样保持连续。</p></div>
  <a class="v2-button v2-button--secondary" href="/start#method-difference">理解这条路线 →</a>
</section>

<section class="home-section">
  <div class="home-section-heading"><div><p class="resource-label">四个相互衔接的入口</p><h2>理论体系</h2></div><a href="/start">从入门页开始 →</a></div>
  <div class="theory-system-grid">${theorySystemCards}</div>
</section>

<section class="home-section">
  <div class="home-section-heading"><div><p class="resource-label">按发布日期自动更新</p><h2>最新文章</h2></div><a href="/articles">查看全部文章 →</a></div>
  <div class="knowledge-grid home-article-grid">${latestArticles.map(homeArticleCard).join("\n")}</div>
</section>

<section class="home-section home-further-reading">
  <div class="home-section-intro"><p class="resource-label">正式资料与联系</p><h2>组织手册与进一步了解</h2><p>通过正式手册了解理论概览、组织原则与参与边界。本站不设聊天群或公开投稿入口，严肃交流与资料反馈可通过邮件联系。</p></div>
  <div class="publication-grid">${site.documents.map((doc) => `<section class="publication-card"><p class="resource-label">核心文档</p><h3>${doc.title}</h3><p class="resource-subtitle">${doc.description}</p><small>更新：${doc.updated}</small><a class="resource-button resource-button-primary" href="${doc.href}">阅读或下载</a></section>`).join("\n")}</div>
  <dl class="contact-list"><div><dt>主要联系邮箱</dt><dd><a href="mailto:${site.primaryEmail}">${site.primaryEmail}</a></dd></div><div><dt>备用邮箱</dt><dd><a href="mailto:${site.secondaryEmail}">${site.secondaryEmail}</a></dd></div></dl>
</section>`,
);

writeContent(
  "start.md",
  `${yamlFrontmatter({ title: "5分钟了解公民秩序主义", description: "用五分钟理解中国当前的高脆弱处境、公民秩序主义的转轨原则，以及继续阅读这套理论的路径。", contentType: "阅读路径" })}

<div class="start-page">
  <header class="start-page__header"><p class="resource-label">新读者入口</p><h1>5分钟了解公民秩序主义</h1><p>公民秩序主义既是解释国家失灵与公共秩序的理论框架，也是一条降低冲突、保持国家连续性的制度转轨路线。</p></header>
  <div class="start-page__sections">
    <section><span>01</span><div><h2>中国面对的不是单一问题</h2><p>经济、财政、官场、社会信任与治理能力相互叠加，局部压力会沿组织和责任链扩散。</p></div></section>
    <section><span>02</span><div><h2>为什么旧道路越来越难继续</h2><p>增长、地方竞争、官僚激励和外部机会形成的平衡正在失效；治理成本上升，反馈与纠错能力下降。</p></div></section>
    <section><span>03</span><div><h2>公民秩序主义是什么</h2><p>它不是价值口号，而是要在秩序、自由、责任、尊严和国家连续性之间建立可执行的制度平衡。</p></div></section>
    <section><span>04</span><div><h2>公民秩序主义不是什么</h2><ul><li>不是以社会失控换取制度变化。</li><li>不是全面清算和集体恐惧。</li><li>不是照搬西方政党政治。</li><li>不回避转型如何发生。</li></ul></div></section>
  </div>
  <section class="start-method" id="method-difference">
    <div class="home-section-intro"><p class="resource-label">方法差异</p><h2>公民秩序主义关注的，不只是价值，而是转轨如何发生</h2></div>
    <div class="method-comparison-grid"><article><strong>只停留在价值主张</strong><p>说明希望抵达哪里，却未必回答权力如何退出、行政系统由谁承接。</p></article><article><strong>进入制度转轨路线</strong><p>处理责任边界、参与者安全、国家连续与可逆步骤，让价值进入现实。</p></article></div>
  </section>
  <section class="start-roadmap"><div class="home-section-intro"><p class="resource-label">理论路线图</p><h2>从高脆弱态到制度转轨</h2><p>在系统仍有基本组织能力时，提前建立制度接口和承接路径。</p></div><p class="start-roadmap__line">${roadmapSteps.join(" → ")}</p></section>
  <section class="start-sequence"><div class="home-section-intro"><p class="resource-label">建议顺序</p><h2>${startReadingSequence?.name ?? "继续阅读"}</h2></div><ol>${startReadingItems}</ol></section>
  <div class="start-page__actions"><a class="v2-button v2-button--primary" href="/#core-topics">按核心专题继续</a><a class="v2-button v2-button--secondary" href="/files/civic-orderism-organization-manual.pdf">阅读组织手册</a></div>
</div>`,
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
  const related = getPrimaryTopicArticles(articles, topic.slug);
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
  .filter((concept) => concept && publicConceptSlugs.has(concept.slug))
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
      const count = getPrimaryTopicArticles(articles, topic.slug).length;
      return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${count} 篇相关文章</small></a>`;
    })
    .join("\n")}</div>`,
);

for (const concept of concepts) {
  const publicationStatus = conceptPublicationStatus(concept);
  const conceptIsFormal = publicationStatus === "published";
  const conceptIsVisible = conceptIsFormal || publicationStatus === "reviewing";
  const representativeArticles = (concept.representativeArticles ?? [])
    .map((slug) => articleBySlug.get(slug))
    .filter(isEligibleArticle);
  const inferredArticles = articles.filter(
    (article) =>
      isEligibleArticle(article) && article.concepts.includes(concept.slug),
  );
  const relatedArticles = [
    ...representativeArticles,
    ...inferredArticles.filter(
      (article) =>
        !representativeArticles.some(
          (representative) => representative.slug === article.slug,
        ),
    ),
  ];
  const relatedTopics = concept.topics
    .map((slug) => topicBySlug.get(slug))
    .filter((topic) => topic?.status === "published");
  const relatedConcepts = concept.related
    .map((slug) => conceptBySlug.get(slug))
    .filter((item) => item && publicConceptSlugs.has(item.slug));
  const statusLabel = conceptIsFormal ? "正式概念" : "研究概念";
  writeContent(
    `concepts/${concept.slug}.md`,
    `${yamlFrontmatter({ title: concept.name, description: concept.definition, contentType: "核心概念", status: conceptIsVisible ? "published" : "draft", listed: conceptIsFormal, folderListed: conceptIsFormal, noindex: !conceptIsFormal, publicationStatus })}

# ${concept.name}

<p class="concept-status concept-status--${publicationStatus}">${statusLabel}</p>

<p class="concept-definition">${concept.definition}</p>

| 字段 | 内容 |
| --- | --- |
| 更新时间 | 2026-07-20 |
| 知识状态 | ${statusLabel} |

## 完整解释

${concept.explanation ?? concept.publicationReason}

## 形成机制

${concept.mechanism}

## 现实表现

${concept.manifestations.map((item) => `- ${item}`).join("\n")}

${relatedArticles.length ? `## 代表文章\n\n${cardGrid(relatedArticles.slice(0, 12))}` : ""}

${relatedTopics.length ? `## 相关专题\n\n${relatedTopics.map((topic) => `- [[topics/${topic.slug}|${topic.name}]]`).join("\n")}` : ""}

${relatedConcepts.length ? `## 相关概念\n\n${relatedConcepts.map((item) => `- [[concepts/${item.slug}|${item.name}]]`).join("\n")}` : ""}`,
  );
}

writeContent(
  "concepts/index.md",
  `${yamlFrontmatter({ title: "核心概念库", description: "公民秩序主义研究中的核心概念与知识节点。", contentType: "概念索引" })}

# 核心概念库

这里区分已经稳定使用的正式概念与仍在论证中的研究概念。研究概念可以阅读，但暂不进入搜索与站点地图；保留或合并状态的内部框架不在公开索引中显示。

## 正式概念

<div class="concept-grid">${formalConcepts.map((concept) => `<a class="concept-card" href="/concepts/${concept.slug}"><strong>${concept.name}</strong><span>${concept.definition}</span><small>正式概念</small></a>`).join("\n")}</div>

## 研究概念

<p>以下概念已有明确研究方向，但定义边界或机制解释仍在完善。</p>

<div class="concept-grid concept-grid--research">${researchConcepts.map((concept) => `<a class="concept-card concept-card--research" href="/concepts/${concept.slug}"><strong>${concept.name}</strong><span>${concept.definition}</span><small>研究概念 · 暂不索引</small></a>`).join("\n")}</div>`,
);

writeContent(
  "about.md",
  `${yamlFrontmatter({ title: "关于", description: "关于公民秩序主义项目、研究方法与联系方式。", contentType: "页面" })}

# 关于

“公民秩序主义”在本站有四个彼此关联、但不应混为一谈的层次：

- **网站**：一个从中国现实问题出发，连接结构解释、趋势判断、理论回应与制度设计的政治研究与制度知识库。
- **理论**：一套解释国家失灵、公共秩序与制度能力的研究框架。
- **路线**：一条尽量降低冲突、保障参与者预期并保持国家连续性的制度转轨路径。
- **组织**：仍在形成中的早期协作框架，用于探索研究、传播与制度准备如何衔接；它不是已经成熟运行的政治组织。

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
