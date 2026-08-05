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
const organization = readJson("organization.config.json");
const sections = readJson("sections.config.json");
const topics = readJson("topics.config.json");
const concepts = readJson("concepts.config.json");
const institutionSections = readJson("institution-sections.config.json");
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
const institutionSectionById = new Map(
  institutionSections.map((item) => [item.id, item]),
);
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
  if (slug === "institution/despotism-cancer-ming-1566") return "解析中共";
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
      institutionSection:
        typeof parsed.data.institutionSection === "string"
          ? parsed.data.institutionSection
          : undefined,
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
const configuredInstitutionSlugs = institutionSections.flatMap(
  (section) => section.articles,
);
if (
  institutionSectionById.size !== institutionSections.length ||
  new Set(configuredInstitutionSlugs).size !== configuredInstitutionSlugs.length
) {
  throw new Error(
    "Institution section configuration contains duplicate ids or article slugs.",
  );
}
for (const section of institutionSections) {
  for (const slug of section.articles) {
    const article = articleBySlug.get(slug);
    if (!article) {
      throw new Error(`Institution section article does not exist: ${slug}`);
    }
    if (article.section !== "制度设计") {
      throw new Error(
        `Institution section article is outside 制度设计: ${slug} -> ${article.section}`,
      );
    }
    if (article.institutionSection !== section.id) {
      throw new Error(
        `Institution section frontmatter mismatch: ${slug} -> ${article.institutionSection ?? "missing"} (expected ${section.id})`,
      );
    }
  }
}
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

function articleCard(article, options = {}) {
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
  const institutionSection = options.showInstitutionSection
    ? institutionSectionById.get(article.institutionSection)
    : undefined;
  const summary = article.summary || `${article.title}的结构分析与研究笔记。`;
  if (!institutionSection) {
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
  return `<article class="knowledge-card knowledge-card--institution" data-knowledge-card data-topics="${article.primaryTopic ?? ""}" data-concepts="${article.concepts.join(" ")}" data-institution-section="${article.institutionSection}">
  <p class="knowledge-card__section">制度模块：<strong>${institutionSection.name}</strong></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
  <p class="knowledge-card__summary">${summary}</p>
  <p class="knowledge-card__meta"><span>${article.date || "日期待补"}</span><span>${article.readingMinutes} 分钟阅读</span></p>${
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

function cardGrid(items, className = "knowledge-grid", options = {}) {
  return `<div class="${className}">\n${items
    .filter(Boolean)
    .map((article) => articleCard(article, options))
    .join("\n")}\n</div>`;
}

function filterPanel(items, options = {}) {
  const sectionFilters = options.institutionSections ?? [];
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
  ${
    sectionFilters.length
      ? `<fieldset class="knowledge-section-filters"><legend>制度模块</legend><div role="group" aria-label="按制度模块筛选"><button type="button" data-filter-section="" aria-pressed="true">全部</button>${sectionFilters.map((item) => `<button type="button" data-filter-section="${item.id}" aria-pressed="false">${item.name}</button>`).join("")}</div></fieldset>`
      : `<label>专题<select data-filter-topic><option value="">全部专题</option>${usedTopics.map((item) => `<option value="${item.slug}">${item.name}</option>`).join("")}</select></label>`
  }
  <label${sectionFilters.length ? ' class="knowledge-filter--secondary"' : ""}>核心概念<select data-filter-concept><option value="">全部概念</option>${usedConcepts.map((item) => `<option value="${item.slug}">${item.name}</option>`).join("")}</select></label>
  <button type="button" data-filter-reset>重置</button>
</div>
${cardGrid(items, "knowledge-grid", {
  showInstitutionSection: sectionFilters.length > 0,
})}
<div class="knowledge-pagination" aria-label="文章分页"><button type="button" data-page-prev>上一页</button><span data-page-status></span><button type="button" data-page-next>下一页</button></div>
</div>`;
}

const institutionFlow = [
  "社会问题与公共需求",
  "前端机构与秘书处整理",
  "委员会判断、监督与纠偏",
  "政治官员统合与授权",
  "行政系统执行",
  "司法、透明与责任系统纠错",
];

const institutionFirstReadingSlugs = [
  "civic-orderism/state-operation-process-under-civic-orderism",
  "civic-orderism/why-dual-track-committee-administration",
  "civic-orderism/what-is-committee-system",
  "civic-orderism/committee-administration-opposite-incentives",
  "civic-orderism/election-logic-under-civic-orderism",
  "civic-orderism/why-not-simple-separation-of-powers",
  "civic-orderism/top-level-power-structure-under-civic-orderism",
];

function institutionModuleArticle(article) {
  return `<li><a href="/${encodeURI(article.slug)}"><span>${article.title}</span><small>${article.date || "日期待补"} · ${article.readingMinutes} 分钟阅读</small></a></li>`;
}

function institutionDesignPage(section) {
  const configuredItems = institutionSections.flatMap((institutionSection) =>
    institutionSection.articles.map((slug) => articleBySlug.get(slug)),
  );
  const configuredSlugs = new Set(
    configuredItems.map((article) => article.slug),
  );
  const legacyItems = articles.filter(
    (article) =>
      article.section === "制度设计" &&
      article.status === "published" &&
      !configuredSlugs.has(article.slug),
  );
  const items = [...configuredItems, ...legacyItems];
  const firstReading = institutionFirstReadingSlugs.map((slug) => {
    const article = articleBySlug.get(slug);
    if (!article) {
      throw new Error(
        `Institution first-reading article does not exist: ${slug}`,
      );
    }
    return article;
  });
  const latestUpdate = items
    .map((article) => article.updated)
    .filter(Boolean)
    .sort()
    .at(-1);
  const relatedConcepts = [
    ...new Set(items.flatMap((article) => article.concepts)),
  ]
    .map((slug) => conceptBySlug.get(slug))
    .filter((concept) => concept && publicConceptSlugs.has(concept.slug))
    .slice(0, 8);
  const modules = institutionSections
    .map((institutionSection) => {
      const moduleArticles = institutionSection.articles.map((slug) =>
        articleBySlug.get(slug),
      );
      return `<section class="institution-module" id="institution-module-${institutionSection.id}">
  <header class="institution-module__header"><p>${institutionSection.number}</p><div><h3>${institutionSection.name}</h3><p>${institutionSection.description}</p></div></header>
  <ol class="institution-module__articles">${moduleArticles.map(institutionModuleArticle).join("\n")}</ol>
  <a class="institution-module__all" href="#all-articles" data-institution-filter-link="${institutionSection.id}">查看本模块全部文章 →</a>
</section>`;
    })
    .join("\n");

  return `${yamlFrontmatter({ title: section.name, description: section.description, contentType: "栏目" })}

<div class="institution-page">
<header class="institution-hero">
  <p class="resource-label">制度地图</p>
  <h1>${section.name}</h1>
  <p class="institution-hero__description">${section.description}</p>
  <div class="section-stats"><span>${items.length} 篇已发布文章</span><span>${institutionSections.length} 个制度模块</span><span>更新至 ${latestUpdate || "2026-07-20"}</span></div>
  <div class="section-core-judgment"><strong>栏目核心判断</strong><p>${section.coreJudgment}</p></div>
</header>

<section class="institution-map" aria-labelledby="institution-map-title">
  <div class="institution-section-heading"><p class="resource-label">从输入到纠错</p><h2 id="institution-map-title">制度运行地图</h2></div>
  <ol>${institutionFlow.map((step) => `<li>${step}</li>`).join("\n")}</ol>
</section>

<section class="institution-first-reading" aria-labelledby="institution-first-reading-title">
  <div class="institution-section-heading"><p class="resource-label">新读者路径</p><h2 id="institution-first-reading-title">第一次阅读</h2><p>如果这是你第一次了解公民秩序主义的制度结构，建议按照以下顺序阅读。</p></div>
  <ol>${firstReading.map((article, index) => `<li><a href="/${encodeURI(article.slug)}"><span class="institution-first-reading__number">${String(index + 1).padStart(2, "0")}</span><span>${article.title}</span>${index < 3 ? "<small>推荐起点</small>" : ""}</a></li>`).join("\n")}</ol>
</section>

<section class="institution-modules" aria-labelledby="institution-modules-title">
  <div class="institution-section-heading"><p class="resource-label">六个制度模块</p><h2 id="institution-modules-title">按照制度模块阅读</h2><p>从整体结构进入具体机制，理解每一组制度安排承担的功能与边界。</p></div>
  <div class="institution-module-list">${modules}</div>
</section>

<section class="institution-all-articles" id="all-articles" aria-labelledby="institution-all-articles-title">
  <div class="institution-section-heading"><p class="resource-label">完整索引</p><h2 id="institution-all-articles-title">全部文章</h2><p>先按制度模块筛选，再按核心概念缩小范围。筛选和分页不会改变任何文章 URL。</p></div>
  ${filterPanel(items, { institutionSections })}
</section>

<section class="institution-related-concepts">
  <div class="institution-section-heading"><p class="resource-label">辅助线索</p><h2>相关核心概念</h2></div>
  ${relatedConcepts.length ? `<div class="section-concept-links">${relatedConcepts.map((concept) => `<a href="/concepts/${concept.slug}">${concept.name}</a>`).join("\n")}</div>` : "当前暂无已公开的相关核心概念。"}
</section>
</div>`;
}

function sectionPage(section) {
  if (section.slug === "institution-design") {
    return institutionDesignPage(section);
  }
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
  const civicRouteIntro =
    section.slug === "civic-orderism"
      ? `<section class="section-route-intro" aria-labelledby="section-route-intro-title">
  <p class="resource-label">从这里理解路线</p>
  <h2 id="section-route-intro-title">公民秩序主义不只是理论，也是一项政治准备</h2>
  <p>它为中国准备一条不依赖革命、不以清算为目的和平政治转轨道路，并通过理论传播、路线推广、支持者识别与制度准备，逐步建立早期协作基础。</p>
  <div class="section-route-links"><a href="/start"><strong>5分钟了解</strong><span>建立最小理解框架</span></a><a href="/civic-orderism/peaceful-state-transition"><strong>核心路线</strong><span>理解国家连续与低冲突转轨</span></a><a href="/participate"><strong>参与说明</strong><span>了解传播、研究与早期协作</span></a></div>
</section>`
      : "";
  return `${yamlFrontmatter({ title: section.name, description: section.description, contentType: "栏目" })}

# ${section.name}

${section.description}

<div class="section-stats"><span>${items.length} 篇已发布文章</span><span>${sectionTopics.length} 个正式专题</span><span>更新至 ${items[0]?.updated || "2026-07-19"}</span></div>

<div class="section-core-judgment"><strong>栏目核心判断</strong><p>${section.coreJudgment}</p></div>${civicRouteIntro ? `\n\n${civicRouteIntro}` : ""}

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
  <h1>建设一条低阻力、低风险、能够和平承接中国未来的政治道路</h1>
  <p class="v2-hero__tagline">公民秩序主义正在从理论走向制度化筹备。</p>
  <div class="home-platform-hero__copy"><p>我们正在进入北美非营利法人、董事会治理和长期组织基础的筹备阶段。目标不是追求短期声势，而是依法建立一个稳定、克制、具有明确责任和治理结构的公共研究与制度建设平台。</p></div>
  <div class="v2-actions"><a class="v2-button v2-button--primary" href="/start">了解公民秩序主义</a><a class="v2-button v2-button--secondary" href="${organization.routes.manifesto}">阅读筹备宣言</a><a class="v2-button v2-button--text" href="${organization.routes.participate}">参与筹备</a></div>
  <p class="home-preparation-note">${organization.statusLabels.registration}；${organization.statusLabels.board}。</p>
</section>

<section class="home-section home-organization-rationale" id="why-organization">
  <div class="home-section-intro"><p class="resource-label">从理论走向组织</p><h2>为什么需要从理论走向组织</h2><p>一种真正希望影响国家未来的政治思想，不能永远依靠个人维护，也不能只停留在文章、观点和公共讨论之中。</p></div>
  <div class="organization-logic"><span>理论需要制度承载</span><i>→</i><span>制度需要组织实践</span><i>→</i><span>组织需要合法、稳定的运行基础</span></div>
  <p class="home-organization-rationale__summary">启动北美非营利法人及董事会筹备，是为了长期保存理论、验证制度、积累人才、保护数字资产并承担公共责任。<a href="${organization.routes.nonprofitPreparation}">了解筹备范围 →</a></p>
</section>

<section class="home-section home-stakeholders" id="transition-principles">
  <div class="home-section-intro"><p class="resource-label">我们的政治路线</p><h2>不革命、不普遍清算、不让国家停摆</h2><p>我们不以报复作为组织手段，不因身份对体制内人员实施集体追责，而是通过协商、谈判、授权转换和制度重组完成和平政治转轨。</p></div>
  <div class="stakeholder-grid"><article><strong>不革命</strong><p>不以社会崩溃和国家解体换取政治变化。</p></article><article><strong>不普遍清算</strong><p>区分政治、历史与刑事责任，拒绝集体报复。</p></article><article><strong>不让国家停摆</strong><p>保障财政、教育、医疗、交通、治安和基层治理不断档。</p></article></div>
  <p class="home-stakeholders__summary">我们希望推动的，不是一次权力争夺，而是一次治理方式与国家秩序的和平转换。<a href="/civic-orderism/peaceful-state-transition">阅读核心路线 →</a></p>
</section>

<section class="home-section home-route-need">
  <div class="home-section-intro"><p class="resource-label">提前准备</p><h2>为什么现在需要提前准备</h2><p>财政压力、人口老龄化、地方债务、社会保障、基层治理、官僚体系风险和国际环境变化，正在持续传导至整个国家运行体系。</p></div>
  <p class="home-question">如果旧秩序无法继续，新的秩序由谁承接？</p>
  <p class="home-route-need__summary">如果没有提前形成理论、制度、组织、人才和社会信任，旧秩序的失效就可能演变为社会失序。我们不希望在危机发生以后寻找答案。</p>
</section>

<section class="home-section home-build" id="what-we-build">
  <div class="home-section-intro"><p class="resource-label">长期组织基础</p><h2>我们正在建设什么</h2><p>法人不是目的。它是长期公共建设和制度实践的基础设施。</p></div>
  <div class="home-build-grid"><article><span>01</span><strong>理论与制度平台</strong><p>持续研究中国政治、财政、官僚体系、社会治理与和平转轨。</p></article><article><span>02</span><strong>合法组织基础</strong><p>在加拿大及北美法律环境下筹备稳定、可持续的非营利法人。</p></article><article><span>03</span><strong>董事会治理结构</strong><p>建立明确的授权、监督、责任和治理边界。</p></article><article><span>04</span><strong>信息与隐私制度</strong><p>拟建立信息最小化、最小权限、分级访问和身份保护。</p></article><article><span>05</span><strong>品牌与数字资产保护</strong><p>长期管理网站、理论成果、出版物、账号、域名与档案。</p></article><article><span>06</span><strong>人才与信任积累</strong><p>识别能够长期承担研究、法律、财务、技术和组织治理责任的人。</p></article></div>
</section>

<section class="home-section home-method-teaser">
  <div><p class="resource-label">低阻力的政治逻辑</p><h2>为什么这条路线具有更低的政治阻力</h2><p>公民秩序主义不进入革命、社会崩溃和普遍清算的传统敌我逻辑。它反对的是失效的制度，而不是国家本身；它也不把体制内人员整体定义为敌人。</p><strong>真正的战略优势，不是谁拥有更强的惩罚能力，而是谁能够为更多人提供一个成本更低、风险更小、值得相信的未来。</strong></div>
  <a class="v2-button v2-button--secondary" href="${organization.routes.manifesto}">阅读完整论证 →</a>
</section>

<section class="home-section home-preparation-overview" id="preparation">
  <div class="home-section-intro"><p class="resource-label">当前阶段</p><h2>北美非营利法人与首届董事会筹备</h2><p>目前的工作是明确法人宗旨、业务范围和治理结构，建立财务、隐私、知识产权与信息安全制度，梳理公共资产，并识别能够承担长期治理责任的候选人。</p></div>
  <div class="preparation-status-grid"><a href="${organization.routes.nonprofitPreparation}"><span>${organization.statusLabels.nonprofit}</span><strong>法人筹备</strong><p>了解法人定位、拟承担的公共工作、当前筹备事项和治理原则。</p><small>了解筹备状态 →</small></a><a href="${organization.routes.boardPreparation}"><span>${organization.statusLabels.board}</span><strong>首届董事会筹备</strong><p>董事会是承担治理、监督、法律责任与资产保护的责任机构，不是荣誉头衔。</p><small>了解责任与边界 →</small></a></div>
  <p class="preparation-boundary"><strong>身份边界：</strong>参与筹备不自动产生董事资格、法定成员资格、共同创始人身份、官方代表资格、项目治理权或项目资产所有权。</p>
</section>

<section class="home-section home-participate">
  <div class="home-section-intro"><p class="resource-label">少量、长期、责任导向</p><h2>我们希望与什么样的人建立联系</h2><p>现阶段的重点不是普通会员扩张，而是与少量长期居住于加拿大或北美、能够承担真实制度和治理工作的人建立联系。</p></div>
  <div class="participation-levels"><span>法律与法人治理</span><span>财务与内部控制</span><span>研究与制度设计</span><span>技术、信息安全与运营</span></div>
  <div class="home-participate__action"><p>我们不以学历、知名度、粉丝数量或激烈立场作为主要标准，更重视品格、责任、稳定性、专业能力和长期合作的可能。</p><a class="v2-button v2-button--primary" href="${organization.routes.participate}">阅读参与筹备说明</a></div>
</section>

<section class="home-section" id="core-route">
  <div class="home-section-heading"><div><p class="resource-label">核心路线与筹备文件</p><h2>从理论进入组织准备</h2><p>先理解这条政治道路，再理解为什么需要建立长期组织基础。</p></div><a href="/civic-orderism">查看系列全文 →</a></div>
  <div class="core-judgment-grid"><a class="core-judgment-card" href="/start"><span>01 · 快速了解</span><strong>5分钟了解公民秩序主义</strong><p>从中国的现实处境、转轨原则与制度方向建立基本框架。</p><small>开始阅读 →</small></a><a class="core-judgment-card" href="/civic-orderism/peaceful-state-transition"><span>02 · 和平转轨</span><strong>国家如何在不停摆的条件下完成转轨</strong><p>让社会、国家与体制内成员获得可信的安全预期。</p><small>阅读核心路线 →</small></a><a class="core-judgment-card" href="${organization.routes.manifesto}"><span>03 · 组织筹备</span><strong>公民秩序主义北美非营利法人及董事会筹备宣言</strong><p>了解从理论到组织的阶段转变、治理原则与参与边界。</p><small>阅读筹备宣言 →</small></a><a class="core-judgment-card" href="/institution-design"><span>04 · 制度准备</span><strong>把政治主张转化为可讨论的国家制度</strong><p>进入问题入口、公共判断、行政执行、纠错与问责机制。</p><small>进入制度设计 →</small></a></div>
</section>

<section class="home-section">
  <div class="home-section-heading"><div><p class="resource-label">按发布日期自动更新</p><h2>最新研究和文章</h2></div><a href="/articles">查看全部文章 →</a></div>
  <div class="knowledge-grid home-article-grid">${latestArticles.map(homeArticleCard).join("\n")}</div>
</section>

<section class="home-section home-further-reading">
  <div class="home-section-intro"><p class="resource-label">正式资料与联系</p><h2>手册与筹备联系</h2><p>本站不设公开成员名册、群聊、支付或募款入口。现阶段通过电子邮件建立初步联系。</p></div>
  <div class="publication-grid">${site.documents.map((doc) => `<section class="publication-card"><p class="resource-label">核心文档</p><h3>${doc.title}</h3><p class="resource-subtitle">${doc.description}</p><small>更新：${doc.updated}</small><a class="resource-button resource-button-primary" href="${doc.href}">阅读或下载</a></section>`).join("\n")}</div>
  <dl class="contact-list"><div><dt>主联系邮箱</dt><dd><a href="mailto:${organization.primaryEmail}">${organization.primaryEmail}</a></dd></div><div><dt>备用邮箱</dt><dd><a href="mailto:${organization.secondaryEmail}">${organization.secondaryEmail}</a></dd></div></dl>
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
  const usesAlignedStatusTable = [
    "fiscal-debt",
    "political-debt",
    "three-cleans-era",
  ].includes(concept.slug);
  const conceptStatusTable = usesAlignedStatusTable
    ? `| 字段     | 内容       |\n| -------- | ---------- |\n| 更新时间 | 2026-07-20 |\n| 知识状态 | ${statusLabel}   |`
    : `| 字段 | 内容 |\n| --- | --- |\n| 更新时间 | 2026-07-20 |\n| 知识状态 | ${statusLabel} |`;
  writeContent(
    `concepts/${concept.slug}.md`,
    `${yamlFrontmatter({ title: concept.name, description: concept.definition, contentType: "核心概念", status: conceptIsVisible ? "published" : "draft", listed: conceptIsFormal, folderListed: conceptIsFormal, noindex: !conceptIsFormal, publicationStatus })}

# ${concept.name}

<p class="concept-status concept-status--${publicationStatus}">${statusLabel}</p>

<p class="concept-definition">${concept.definition}</p>

${conceptStatusTable}

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
  "preparation.md",
  `${yamlFrontmatter({ title: "北美非营利法人筹备", description: "了解公民秩序主义筹备北美非营利法人的目的、当前状态、拟承担的公共工作、治理原则与参与边界。", contentType: "筹备页面" })}

<div class="preparation-page">
<header class="preparation-hero">
  <p class="resource-label">长期公共建设的组织基础</p>
  <h1>北美非营利法人筹备</h1>
  <p>公民秩序主义正在为理论研究、制度设计、公共传播、人才培养与数字资产保护建立一个长期、稳定、克制的组织基础。</p>
  <div class="preparation-status"><span>${organization.statusLabels.nonprofit}</span><span>${organization.statusLabels.registration}</span><span>${organization.statusLabels.jurisdiction}</span></div>
</header>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">为什么需要法人</p><h2>让公共事业不再依赖个人意志和临时协作</h2><p>理论需要制度承载，制度需要组织实践。法人不是目的，而是明确责任、保护公共资产、建立持续治理和依法开展工作的基础设施。</p></div>
  <div class="preparation-principle-grid"><article><strong>治理可持续</strong><p>以章程、董事会、授权和记录制度代替个人化管理。</p></article><article><strong>责任可识别</strong><p>明确谁能够决策、谁承担监督、谁对财务和公共资产负责。</p></article><article><strong>资产可保护</strong><p>长期管理理论成果、品牌、域名、网站、账号、档案与出版物。</p></article></div>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">拟承担的公共工作</p><h2>研究、出版、制度建设与人才培养</h2><p>具体业务范围将根据最终注册法域、章程和法律意见确定。现阶段的筹备方向包括：</p></div>
  <ul class="preparation-work-list"><li><strong>理论研究</strong><span>持续研究中国政治、财政、社会、官僚体系与国家治理。</span></li><li><strong>制度设计</strong><span>完善和平转轨、行政承接、责任区分和公共权力约束方案。</span></li><li><strong>出版与传播</strong><span>维护网站，出版研究成果，建立稳定、克制的公共传播平台。</span></li><li><strong>组织治理</strong><span>建立章程、附例、财务、档案、隐私、知识产权与信息安全制度。</span></li><li><strong>人才培养</strong><span>识别并培养能够承担研究、专业与长期治理责任的人。</span></li></ul>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">当前筹备事项</p><h2>先建立规则，再扩大参与</h2></div>
  <ol class="preparation-steps"><li><span>01</span><div><strong>明确宗旨与业务范围</strong><p>研究适合的法人定位、公共目的和合规边界。</p></div></li><li><span>02</span><div><strong>选择注册法域</strong><p>比较加拿大及北美相关法律环境；目前尚未确定具体法域。</p></div></li><li><span>03</span><div><strong>制定章程与组织附例</strong><p>明确董事会、法定成员、授权、监督和利益冲突规则。</p></div></li><li><span>04</span><div><strong>建立内部制度</strong><p>准备财务、档案、隐私、信息安全和知识产权制度。</p></div></li><li><span>05</span><div><strong>识别首届董事候选人</strong><p>以真实治理责任、专业能力和长期合作可能为标准。</p></div></li><li><span>06</span><div><strong>完成法律程序</strong><p>在制度和人员准备成熟后，再依法申请注册并产生治理机构。</p></div></li></ol>
</section>

<section class="preparation-section preparation-governance">
  <div><p class="resource-label">治理原则</p><h2>克制、程序、责任与安全</h2></div>
  <ul><li>先有制度，再扩大参与；</li><li>先有责任，再授予权力；</li><li>组织资产服务公共使命，不归个人所有；</li><li>未经授权，任何人不得代表组织；</li><li>采用分级授权、最小权限和可追溯的决策记录；</li><li>重要法律、财务和信息安全事项必须经过专业审查。</li></ul>
</section>

<section class="preparation-section preparation-legal-note">
  <p class="resource-label">重要状态说明</p>
  <h2>筹备不等于已经成立</h2>
  <p>截至目前，${organization.statusLabels.registration}，${organization.statusLabels.jurisdiction}，${organization.statusLabels.board}。本站使用“北美非营利法人筹备”和“董事会筹备”，仅描述正在进行的准备工作，不表示已经取得任何法人、慈善或免税资格。</p>
  <p><strong>参与筹备不自动产生</strong>董事资格、法定成员资格、共同创始人身份、官方代表资格、项目治理权或项目资产所有权。</p>
  <div class="preparation-actions"><a class="v2-button v2-button--primary" href="${organization.routes.boardPreparation}">了解董事会筹备</a><a class="v2-button v2-button--secondary" href="${organization.routes.participate}">参与筹备</a></div>
</section>
</div>`,
);

writeContent(
  "preparation/board.md",
  `${yamlFrontmatter({ title: "首届董事会筹备", description: "了解公民秩序主义首届董事会的定位、责任、候选人标准、产生程序与当前法律状态。", contentType: "筹备页面" })}

<div class="preparation-page board-preparation-page">
<header class="preparation-hero">
  <p class="resource-label">治理责任，不是荣誉头衔</p>
  <h1>首届董事会筹备</h1>
  <p>董事会将承担组织方向、合规监督、财务责任、公共资产保护和管理层问责。首届董事会将在法人制度准备和法律程序完成后依法产生。</p>
  <div class="preparation-status"><span>${organization.statusLabels.board}</span><span>${organization.statusLabels.registration}</span></div>
</header>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">董事会是什么</p><h2>承担长期治理和法律责任的机构</h2><p>董事不是项目支持者的高级称号，也不是对早期参与的奖励。董事需要对组织使命、合规、财务、风险和公共资产承担持续的受托责任。</p></div>
  <div class="preparation-principle-grid"><article><strong>守护使命</strong><p>保证组织工作持续服务于和平转轨、制度研究和公共建设。</p></article><article><strong>监督治理</strong><p>审议重大政策、预算、授权、风险和管理层履职。</p></article><article><strong>保护资产</strong><p>防止品牌、知识成果、资金、账号和数字资产被个人控制或挪用。</p></article></div>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">候选人标准</p><h2>我们重视什么</h2><p>现阶段希望与少量长期居住于加拿大或北美、理解基本政治路线并愿意承担真实治理责任的人建立联系。</p></div>
  <ul class="participate-checklist"><li>理解和平转轨、行政承接与国家连续；</li><li>认同不革命、不普遍清算、不以报复为目的；</li><li>尊重程序、授权、组织纪律与集体决策；</li><li>具备独立判断、事实意识和处理分歧的能力；</li><li>能够保护组织信息、成员隐私和敏感资料；</li><li>愿意投入稳定时间并承担法定治理责任；</li><li>能够识别并披露利益冲突；</li><li>具备法律、财务、公共管理、技术、传播、研究或运营能力之一。</li></ul>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">产生程序</p><h2>不会通过公开报名直接任命</h2><p>首届董事会的产生将以法律要求、章程设计、背景核验、长期合作观察和正式决议为基础。</p></div>
  <ol class="preparation-steps"><li><span>01</span><div><strong>初步联系</strong><p>了解路线认同、专业背景、居住法域与参与意愿。</p></div></li><li><span>02</span><div><strong>任务协作</strong><p>通过小规模、具体工作观察责任感、判断力与协作稳定性。</p></div></li><li><span>03</span><div><strong>治理沟通</strong><p>讨论董事义务、利益冲突、保密、安全和时间投入。</p></div></li><li><span>04</span><div><strong>合规审查</strong><p>结合最终注册法域核对董事资格和法律要求。</p></div></li><li><span>05</span><div><strong>依法产生</strong><p>在法人程序中依章程完成提名、同意、决议与记录。</p></div></li></ol>
</section>

<section class="preparation-section preparation-legal-note">
  <p class="resource-label">身份边界</p><h2>筹备联系不构成任命或承诺</h2>
  <p>提交意向、参与会议、提供建议或完成协作任务，都不当然产生董事候选人、董事、法定成员、共同创始人或官方代表身份。任何治理身份都必须在制度准备和法律程序完成后，以正式文件确认。</p>
  <div class="preparation-actions"><a class="v2-button v2-button--primary" href="${organization.routes.participate}#contact">提交筹备意向</a><a class="v2-button v2-button--secondary" href="${organization.routes.manifesto}">阅读筹备宣言</a></div>
</section>
</div>`,
);

writeContent(
  "participate.md",
  `${yamlFrontmatter({ title: "参与筹备", description: "了解如何参与公民秩序主义北美非营利法人、首届董事会及相关制度建设，并安全提交筹备意向。", contentType: "参与筹备" })}

<div class="participate-page">
<header class="participate-hero">
  <p class="resource-label">少量、长期、任务制协作</p>
  <h1>参与公民秩序主义筹备</h1>
  <p>当前不是普通会员招募，也不是建立大规模公开群组。我们希望与少量长期居住于加拿大或北美、认同基本路线并愿意承担真实制度建设工作的人建立联系。</p>
  <p class="participate-status-note">${organization.statusLabels.registration}；${organization.statusLabels.board}。</p>
</header>

<section class="participate-section" aria-labelledby="participation-paths">
  <div class="home-section-intro"><p class="resource-label">六个工作方向</p><h2 id="participation-paths">你可以参与什么</h2><p>早期协作以小规模、具体任务为主，并根据必要性采用最小权限和分级访问。</p></div>
  <div class="participate-path-grid"><article><span>01</span><h3>法律与法人治理</h3><p>注册法域研究、章程和附例、董事义务、政策与合规文件。</p></article><article><span>02</span><h3>财务与内部控制</h3><p>预算、记账、报销、审批、审计准备和资产管理制度。</p></article><article><span>03</span><h3>研究与制度设计</h3><p>政治、财政、社会治理、官僚体系、和平转轨与行政承接研究。</p></article><article><span>04</span><h3>技术与信息安全</h3><p>网站、档案、访问控制、数字资产、隐私保护和风险评估。</p></article><article><span>05</span><h3>出版与公共传播</h3><p>编辑、翻译、视觉设计、出版流程和克制、准确的公共表达。</p></article><article><span>06</span><h3>组织运营与人才联系</h3><p>任务协调、会议记录、流程建设、专业网络和长期合作维护。</p></article></div>
</section>

<section class="participate-section participate-fit" aria-labelledby="participation-fit">
  <div class="home-section-intro"><p class="resource-label">责任与稳定性优先</p><h2 id="participation-fit">我们希望与什么样的人建立联系</h2></div>
  <ul class="participate-checklist"><li>理解和平转轨与行政承接；</li><li>认同不革命、不普遍清算、不以报复为目的；</li><li>能够长期、稳定地参与公共事务；</li><li>尊重程序、授权、组织纪律与事实；</li><li>能够保护组织信息和成员隐私；</li><li>愿意承担真实工作和明确责任；</li><li>具备独立思考和处理分歧的能力；</li><li>拥有法律、财务、管理、技术、传播、设计、研究或运营能力之一。</li></ul>
</section>

<section class="participate-section participate-boundaries" aria-labelledby="participation-boundaries">
  <div><p class="resource-label">我们不希望建立什么</p><h2 id="participation-boundaries">不以人数、头衔和情绪制造组织</h2><p>我们不建立个人崇拜，不依靠口号、互相攻击和敌我动员维持活跃度，不建立失控的大规模公开群组，也不允许任何人未经授权代表组织。</p><p>我们不以公开暴露身份、激进言论或不必要的冒险作为忠诚证明，不以内部热闹代替真实建设。</p></div>
</section>

<section class="participate-section participate-security" aria-labelledby="participation-security">
  <div class="home-section-intro"><p class="resource-label">参与者保护</p><h2 id="participation-security">不人为制造风险</h2><p>未来将逐步建立信息最小化、化名参与、身份保护、分级授权、最小权限、内部资料访问控制和敏感工作独立风险评估机制。</p></div>
  <p>我们无法承诺政治参与完全没有风险，但不会鼓励无意义的牺牲，也不会要求任何人以个人或家庭安全换取组织认可。</p>
</section>

<section class="participate-section preparation-legal-note" aria-labelledby="participation-status-boundary">
  <p class="resource-label">身份边界</p><h2 id="participation-status-boundary">筹备参与不是治理身份</h2>
  <p>提交邮件、参加沟通、提供建议或完成任务，均不当然产生董事资格、法定成员资格、共同创始人身份、官方代表资格、项目治理权或项目资产所有权。</p>
</section>

<section class="participate-section participate-contact" id="contact" aria-labelledby="participation-contact">
  <div class="home-section-intro"><p class="resource-label">筹备联系</p><h2 id="participation-contact">提交参与意向</h2><p>如果你长期居住于加拿大或北美，认同基本方向并愿意承担长期制度建设工作，可以通过电子邮件建立初步联系。</p></div>
  <div class="participate-contact-grid"><div><h3>邮件建议包括</h3><ul><li>所在国家、州或省；</li><li>对公民秩序主义基本路线的理解；</li><li>专业背景和可参与方向；</li><li>能够投入的大致时间；</li><li>希望参与法人、董事会或哪一类制度筹备；</li><li>是否接受小规模、任务制和长期观察式协作。</li></ul></div><div class="participate-contact-card"><p class="resource-label">主联系邮箱</p><a href="mailto:${organization.primaryEmail}?subject=${encodeURIComponent("公民秩序主义北美筹备参与意向")}">${organization.primaryEmail}</a><p class="resource-label">备用邮箱</p><a href="mailto:${organization.secondaryEmail}?subject=${encodeURIComponent("公民秩序主义北美筹备参与意向")}">${organization.secondaryEmail}</a><small>请不要在初次邮件中发送身份证件、详细住址、护照号码、单位内部资料或其他不必要的敏感个人信息。可以先使用化名并说明希望采用的联系方式。</small></div></div>
</section>
</div>`,
);

writeContent(
  "about.md",
  `${yamlFrontmatter({ title: "关于", description: "了解公民秩序主义作为网站、理论、政治与制度路线以及北美组织筹备项目的准确定位。", contentType: "页面" })}

# 关于

“公民秩序主义”在本站有四个彼此关联、但不应混为一谈的层次：

- **网站**：公民秩序主义的正式门户、理论与路线说明中心，也是北美非营利法人及首届董事会筹备的公开信息入口。
- **理论**：一套解释国家失灵、公共秩序与制度能力的研究框架。
- **政治与制度路线**：一条以低阻力、低风险方式推动和平转轨、行政承接和国家连续的道路，不以革命、普遍清算或报复为主要手段。
- **组织筹备项目**：为理论研究、制度设计、公共传播、人才培养和长期治理建立合法、稳定、可持续的组织基础。

**公民秩序主义已经从单纯的理论建设，进入北美非营利法人、董事会治理和长期组织基础的筹备阶段。**

截至目前，${organization.statusLabels.registration}，${organization.statusLabels.jurisdiction}，${organization.statusLabels.board}。公民秩序主义尚不是一个成熟运行的政党，也不声称已经取得法人、慈善或免税资格。

现阶段的目标，不是追求短期声势或迅速扩张成员，而是建立清晰的治理、授权、财务、隐私、知识产权和信息安全制度，并识别能够承担长期责任的人。

本站保持专业、审慎、冷静和克制的写作方式。这里不以新闻速度为目标，也不以口号、情绪动员或个人崇拜替代制度分析。

## 研究路径

现实问题 → 结构解释 → 趋势判断 → 理论回应 → 制度设计

## 阅读入口

- [[start|开始阅读]]
- [[civic-orderism/north-america-nonprofit-board-preparation-manifesto|阅读筹备宣言]]
- [[preparation|了解法人筹备]]
- [[preparation/board|了解首届董事会筹备]]
- [[participate|参与筹备]]
- [[topics|专题]]
- [[concepts|核心概念]]
- [[articles|全部文章]]

## 核心文档

${site.documents.map((doc) => `- [${doc.title}](${doc.href}) — ${doc.description}`).join("\n")}

## 联系方式

- 主联系邮箱：[${organization.primaryEmail}](mailto:${organization.primaryEmail})
- 备用邮箱：[${organization.secondaryEmail}](mailto:${organization.secondaryEmail})
- 网站：[civicorderism.com](https://civicorderism.com/)

本站不设公开成员名册、失控的公开群聊、支付或募款入口。如果你长期居住在加拿大或北美，认同基本路线并愿意承担制度建设工作，请阅读 [[participate|参与筹备说明]]。`,
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
