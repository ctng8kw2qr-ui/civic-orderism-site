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
const chinaAnalysis = readJson("china-analysis.config.json");
const civicOrderismConfig = readJson("civic-orderism.config.json");
const readingPaths = readJson("reading-paths.config.json");
const readingSequences = readJson("reading-sequences.config.json");
const articleTopicAssignments = readJson("article-topics.config.json");
const coreModelsConfig = readJson("core-models.config.json");
const chinaAnalysisSectionBySlug = new Map();
for (const stage of chinaAnalysis.stages ?? []) {
  for (const slug of [...(stage.featured ?? []), ...(stage.slugs ?? [])]) {
    chinaAnalysisSectionBySlug.set(slug, `${stage.num} ${stage.title}`);
  }
}
for (const topic of chinaAnalysis.topics ?? []) {
  for (const slug of topic.slugs ?? []) {
    if (!chinaAnalysisSectionBySlug.has(slug)) {
      chinaAnalysisSectionBySlug.set(slug, topic.name);
    }
  }
}
if (chinaAnalysis.overview) {
  chinaAnalysisSectionBySlug.set(chinaAnalysis.overview, "总论 / 核心阅读");
}
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
const coreModelSlugs = new Set(
  coreModelsConfig.models.map((model) => model.slug),
);
const coreModelBySlug = new Map(
  coreModelsConfig.models.map((model) => [model.slug, model]),
);
const coreModelAssignmentByArticle = new Map(
  coreModelsConfig.articles.map((item) => [item.slug, item]),
);
if (
  coreModelBySlug.size !== coreModelsConfig.models.length ||
  coreModelAssignmentByArticle.size !== coreModelsConfig.articles.length
) {
  throw new Error("Core model configuration contains duplicate slugs.");
}
for (const model of coreModelsConfig.models) {
  if (!publicConceptSlugs.has(model.slug)) {
    throw new Error(`Unknown or unpublished core model concept: ${model.slug}`);
  }
  if (
    model.representativeArticles.length < 2 ||
    model.representativeArticles.length > 4
  ) {
    throw new Error(
      `Core model must contain 2–4 representative articles: ${model.slug}`,
    );
  }
}
for (const assignment of coreModelsConfig.articles) {
  if (!coreModelSlugs.has(assignment.primaryCoreModel)) {
    throw new Error(
      `Unknown primary core model: ${assignment.slug} -> ${assignment.primaryCoreModel}`,
    );
  }
  for (const slug of assignment.associatedCoreModels) {
    if (!publicConceptSlugs.has(slug)) {
      throw new Error(
        `Unknown associated core model: ${assignment.slug} -> ${slug}`,
      );
    }
    if (slug === assignment.primaryCoreModel) {
      throw new Error(
        `Primary core model repeated as association: ${assignment.slug} -> ${slug}`,
      );
    }
  }
}
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
  if (slug.startsWith("china-stage/")) return "中国未来";
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
  const coreModelAssignment = coreModelAssignmentByArticle.get(article.slug);
  const text =
    `${article.slug} ${article.title} ${article.summary}`.toLowerCase();
  const inferred = new Set(
    concepts
      .filter((concept) =>
        concept.representativeArticles?.includes(article.slug),
      )
      .map((concept) => concept.slug),
  );
  if (manualReviewSlugs.has(article.slug)) {
    for (const slug of existingMigrationBySlug.get(article.slug)?.concepts ??
      []) {
      inferred.add(slug);
    }
  }
  const topicConcepts = article.topics.flatMap(
    (slug) => topicBySlug.get(slug)?.concepts ?? [],
  );
  topicConcepts.forEach((slug) => inferred.add(slug));
  if (includesAny(text, ["高脆弱", "fragility", "靠不住"]))
    inferred.add("high-fragility");
  if (includesAny(text, ["官僚", "避责", "不担责", "躺平", "基层减负"]))
    inferred.add("bureaucratic-shock");
  const ordered = [
    coreModelAssignment?.primaryCoreModel,
    ...(coreModelAssignment?.associatedCoreModels ?? []),
    ...inferred,
  ].filter((slug) => slug && publicConceptSlugs.has(slug));
  return [...new Set(ordered)].slice(0, 6);
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
      chinaAnalysisSection: chinaAnalysisSectionBySlug.get(slug),
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
    const coreModelAssignment = coreModelAssignmentByArticle.get(article.slug);
    article.primaryCoreModel = coreModelAssignment?.primaryCoreModel ?? null;
    article.associatedCoreModels =
      coreModelAssignment?.associatedCoreModels ?? [];
    article.featured =
      parsed.data.featured === true || allFeatured.has(slug);
    article.recommended =
      parsed.data.recommended === true || allRecommended.has(slug);
    article.readingLevel =
      typeof parsed.data.readingLevel === "string"
        ? parsed.data.readingLevel
        : article.section === "制度设计"
          ? "制度"
          : article.section === "公民秩序主义"
            ? "基础"
            : "进阶";
    article.readingOrder =
      typeof parsed.data.readingOrder === "number"
        ? parsed.data.readingOrder
        : Math.min(
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
const chinaStageSlugs = (chinaAnalysis.stages ?? []).flatMap((stage) => [
  ...(stage.featured ?? []),
  ...(stage.slugs ?? []),
]);
const chinaTopicSlugs = (chinaAnalysis.topics ?? []).flatMap(
  (topic) => topic.slugs ?? [],
);
const chinaAnalysisSlugs = [
  ...(chinaAnalysis.overview ? [chinaAnalysis.overview] : []),
  ...chinaStageSlugs,
  ...chinaTopicSlugs,
];
if (chinaAnalysis.stages.length !== 4) {
  throw new Error(
    "China analysis configuration must contain four causal stages.",
  );
}
if (chinaAnalysis.topics.length !== 5) {
  throw new Error(
    "China analysis configuration must contain five research topics.",
  );
}
if (new Set(chinaStageSlugs).size !== chinaStageSlugs.length) {
  throw new Error("China analysis stage slugs must be unique.");
}
for (const stage of chinaAnalysis.stages) {
  if (
    !stage.num ||
    !stage.title ||
    !stage.judgment ||
    !stage.model ||
    !Array.isArray(stage.featured) ||
    !Array.isArray(stage.slugs)
  ) {
    throw new Error(
      `China analysis stage is incomplete: ${stage.num ?? "(missing num)"}`,
    );
  }
  if (stage.featured.length < 2) {
    throw new Error(
      `China analysis stage featured list must contain at least two articles: ${stage.title}`,
    );
  }
}
for (const slug of chinaAnalysisSlugs) {
  const article = articleBySlug.get(slug);
  if (!article) {
    throw new Error(`China analysis article does not exist: ${slug}`);
  }
  if (article.section !== "解析中共") {
    throw new Error(
      `China analysis article is outside 解析中共: ${slug} -> ${article.section}`,
    );
  }
}
for (const topic of chinaAnalysis.topics) {
  if (!topic.name || !topic.href || !Array.isArray(topic.slugs)) {
    throw new Error(
      `China analysis topic is incomplete: ${topic.name ?? "(missing name)"}`,
    );
  }
}
const unclassifiedChinaArticles = articles.filter(
  (article) =>
    article.section === "解析中共" &&
    !chinaAnalysisSlugs.includes(article.slug),
);
if (unclassifiedChinaArticles.length > 0) {
  throw new Error(
    `Unclassified 解析中共 articles: ${unclassifiedChinaArticles.map((article) => article.slug).join(", ")}`,
  );
}
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
for (const assignment of coreModelsConfig.articles) {
  if (!articleBySlug.has(assignment.slug)) {
    throw new Error(`Core model article does not exist: ${assignment.slug}`);
  }
}
for (const model of coreModelsConfig.models) {
  const modelArticleSlugs = [
    model.overviewArticle,
    ...model.representativeArticles.map((item) => item.slug),
    ...model.extendedArticles,
  ].filter(Boolean);
  if (new Set(modelArticleSlugs).size !== modelArticleSlugs.length) {
    throw new Error(`Core model contains duplicate articles: ${model.slug}`);
  }
  for (const slug of modelArticleSlugs) {
    const article = articleBySlug.get(slug);
    if (!article || !isEligibleArticle(article)) {
      throw new Error(
        `Core model article is not published: ${model.slug} -> ${slug}`,
      );
    }
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

/* Indented HTML inside a markdown body can be parsed as a fenced code block.
   Strip leading whitespace from any line that starts with a block-level HTML
   tag so raw markup renders as markup rather than source code. */
function deindentHtml(body) {
  return body
    .split("\n")
    .map((line) =>
      /^ {4,}<(\/?)(section|div|aside|header|nav|footer|ul|ol|li|p|h[1-6]|blockquote|table|details|summary)/u.test(
        line,
      )
        ? line.replace(/^ {2,}/, "")
        : line,
    )
    .join("\n");
}

function writeInstitutionalContent(relativePath, body) {
  writeContent(relativePath, deindentHtml(body));
}

async function writeConceptContent(relativePath, body) {
  const target = path.join(contentDir, relativePath);
  const raw = `${body.trim()}\n`;
  const current = fs.existsSync(target)
    ? fs.readFileSync(target, "utf8")
    : undefined;
  const conceptSlug = path.basename(relativePath, ".md");
  const shouldFormat = coreModelSlugs.has(conceptSlug) || current !== raw;
  const output = shouldFormat
    ? await prettier.format(raw, { parser: "markdown" })
    : raw;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, output, "utf8");
}

function yamlFrontmatter({
  title,
  description,
  date = "2026-07-19",
  updated = "2026-07-20",
  contentType = "页面",
  aliases = [],
  status = "published",
  listed = true,
  folderListed = listed,
  noindex = false,
  publicationStatus,
}) {
  return `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\nupdated: ${updated}\ndescription: ${JSON.stringify(description)}\ncontentType: ${JSON.stringify(contentType)}\nstatus: ${status}\nlisted: ${listed}\nfolderListed: ${folderListed}\nnoindex: ${noindex}\n${publicationStatus ? `publicationStatus: ${publicationStatus}\n` : ""}${aliases.length ? `aliases:\n${aliases.map((item) => `  - ${item}`).join("\n")}\n` : ""}---`;
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

function chinaAnalysisGrid(items, { coreSlug } = {}) {
  return `<div class="knowledge-grid">
${items
  .map(
    (
      article,
    ) => `<article class="knowledge-card${article.slug === coreSlug ? " knowledge-card--core-reading" : ""}">
  <p class="knowledge-card__meta">${article.slug === coreSlug ? "<span>核心阅读</span>" : `<span>${article.date || "日期待补"}</span>`}<span>${article.readingMinutes} 分钟阅读</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
</article>`,
  )
  .join("\n")}
</div>`;
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
  return `<article class="knowledge-card home-article-card">
  <p class="knowledge-card__meta"><span>${article.date || "日期待补"}</span><span>${article.section}</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>${
    marker
      ? `
  <p class="knowledge-card__chips"><span>${marker}</span></p>`
      : ""
  }
</article>`;
}

function homeRecommendedCard(article) {
  const summary = article.summary || `${article.title}的结构分析与研究笔记。`;
  return `<article class="knowledge-card home-recommended-card">
  <p class="knowledge-card__meta"><span>${article.section}</span><span>${article.readingMinutes} 分钟阅读</span></p>
  <h3><a href="/${encodeURI(article.slug)}">${article.title}</a></h3>
  <p class="knowledge-card__summary">${summary}</p>
  <a class="home-recommended-card__link" href="/${encodeURI(article.slug)}">阅读全文 →</a>
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
  if (section.slug === "china") {
    return chinaAnalysisPage(section);
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
  <h2 id="section-route-intro-title">公民秩序主义首先是一条政治与制度路线</h2>
  <p>它面向中国未来，主张通过和平转轨、行政承接、责任区分和制度重组降低政治变化的社会成本；理论研究为路线提供基础，组织建设为路线提供长期承接。</p>
  <div class="section-route-links"><a href="/start-here"><strong>5分钟了解</strong><span>建立完整的基础认识</span></a><a href="/civic-orderism/peaceful-state-transition"><strong>核心路线</strong><span>理解国家连续与低冲突转轨</span></a><a href="/participate"><strong>联系与协作</strong><span>了解传播、专业协作与长期联系</span></a></div>
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

function chinaAnalysisPage(section) {
  const modelCards = chinaAnalysis.models
    .map(
      (model) => `<a class="china-model-card" href="${model.href}">
  <strong>${model.name}</strong>
  <span>${model.description}</span>
  <small>进入模型 →</small>
</a>`,
    )
    .join("\n");
  const structuralJudgments = chinaAnalysis.structuralJudgments
    .map(
      (judgment) => `<a class="china-judgment-card" href="${judgment.href}">
  <strong>${judgment.name}</strong>
  <span>${judgment.description}</span>
</a>`,
    )
    .join("\n");
  const groups = chinaAnalysis.groups.map((group, index) => {
    const featuredSlugs = group.featured ?? group.slugs.slice(0, 5);
    const featuredItems = featuredSlugs
      .map((slug) => articleBySlug.get(slug))
      .filter((article) => article?.status === "published");
    const featuredSet = new Set(featuredSlugs);
    const moreItems = group.slugs
      .filter((slug) => !featuredSet.has(slug))
      .map((slug) => articleBySlug.get(slug))
      .filter((article) => article?.status === "published");
    const number = ["一", "二", "三", "四", "五"][index];
    return `### ${number}、${group.name}

${group.description}

${chinaAnalysisGrid(featuredItems, { coreSlug: group.coreFeatured })}

${
  moreItems.length
    ? `<details class="china-analysis-more">
<summary>更多文章（${moreItems.length}）</summary>
${chinaAnalysisGrid(moreItems)}
</details>`
    : ""
}`;
  });
  const items = chinaAnalysisSlugs
    .map((slug) => articleBySlug.get(slug))
    .filter((article) => article?.status === "published");
  const latestUpdate = [...items].sort(
    (a, b) =>
      b.updated.localeCompare(a.updated) ||
      a.title.localeCompare(b.title, "zh-CN"),
  )[0]?.updated;

  return `${yamlFrontmatter({ title: section.name, description: section.description, contentType: "栏目" })}

# ${section.name}

${section.description}

<div class="section-stats"><span>${items.length} 篇已发布文章</span><span>3 个阅读层级</span><span>更新至 ${latestUpdate || "2026-07-19"}</span></div>

<div class="section-core-judgment"><strong>栏目核心判断</strong><p>${section.coreJudgment}</p></div>

<p class="china-analysis-intro">${chinaAnalysis.readingHint}</p>

<section class="china-analysis-layer china-analysis-layer--models" aria-labelledby="china-models-title">
  <div class="china-analysis-layer__heading"><p class="resource-label">第一层</p><h2 id="china-models-title">核心模型</h2><p>公民秩序主义提出的解释模型，用于理解不同现象背后的共同运行机制。</p></div>
  <div class="china-model-grid">${modelCards}</div>
</section>

<section class="china-analysis-layer china-analysis-layer--judgments" aria-labelledby="china-judgments-title">
  <div class="china-analysis-layer__heading"><p class="resource-label">第二层</p><h2 id="china-judgments-title">结构判断</h2><p>从权力、财政、官僚、央地与国家治理等结构维度，观察中共长期运行中的矛盾。</p></div>
  <div class="china-judgment-grid">${structuralJudgments}</div>
</section>

<section class="china-analysis-layer china-analysis-layer--observations" aria-labelledby="china-observations-title">
  <div class="china-analysis-layer__heading"><p class="resource-label">第三层</p><h2 id="china-observations-title">现实观察与延伸阅读</h2><p>从人物、政策和现实政治信号进入，并按既有分析线索继续阅读。默认只展示代表文章，其余内容可按需展开。</p></div>

${groups.join("\n\n")}
</section>`;
}

for (const section of sections) {
  if (section.slug === "china") {
    // china/index.md is generated separately by the four-stage overview block.
    continue;
  }
  const route = `${section.slug}/index.md`;
  writeContent(route, sectionPage(section));
}

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
  .map(
    (item, index) => `<article class="knowledge-card home-start-card">
  <p class="knowledge-card__meta"><span>${String(index + 1).padStart(2, "0")}</span></p>
  <h3>${item.label}</h3>
  <p class="knowledge-card__summary">${item.description}</p>
  <div class="home-start-card__links"><a href="${item.href}">${item.linkLabel ?? "继续阅读"} →</a>${item.secondaryHref ? `<a href="${item.secondaryHref}">${item.secondaryLabel ?? "更多格式"}</a>` : ""}</div>
</article>`,
  )
  .join("\n");

const homepageRecommendations = (
  readingPaths.homepageRecommendations ?? []
).map((slug) => articleBySlug.get(slug));
if (
  homepageRecommendations.length !== 4 ||
  homepageRecommendations.some((article) => !isEligibleArticle(article))
) {
  throw new Error(
    "Homepage recommendations must contain exactly four published articles.",
  );
}
const homepageRecommendationCards = homepageRecommendations
  .map(homeRecommendedCard)
  .join("\n");

const homepageTheoryLinks = homepageRecommendations
  .slice(0, 3)
  .map(
    (article, index) =>
      `<a href="/${encodeURI(article.slug)}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${article.title}</strong><small>${article.readingMinutes} 分钟阅读</small></a>`,
  )
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

<div class="inst4">

<!-- SECTION 1 / IDENTITY -->
<section class="inst4-hero" id="identity">
  <div class="inst4-hero__grid">
    <div class="inst4-hero__left">
      <p class="inst4-hero__brand">CIVIC ORDERISM <span aria-hidden="true">·</span> 公民秩序主义</p>
      <h1 class="inst4-hero__title">中国政治转轨的<span>和平方案</span></h1>
      <p class="inst4-hero__statement">不革命、不清算，在保持国家连续运行的前提下，为中国未来建立一条低阻力、低风险的政治转轨路径。</p>
      <p class="inst4-hero__en" lang="en">A peaceful political transition framework for China's future.</p>
    </div>
    <div class="inst4-hero__status" aria-label="当前阶段">
      <p class="inst4-hero__status-label">CURRENT PHASE</p>
      <p class="inst4-hero__status-body">North American Nonprofit<br>&amp; Founding Board Preparation</p>
      <p class="inst4-hero__status-year">2026</p>
    </div>
  </div>
</section>

<!-- SECTION 2 / CURRENT WORK -->
<section class="inst4-work" id="current-work">
  <div class="inst4-work__grid">
    <div class="inst4-work__intro">
      <p class="inst4-eyebrow">CURRENT WORK</p>
      <h2 class="inst4-work__title">建立一个能够承接政治信任的组织</h2>
      <div class="inst4-work__points">
        <article class="inst4-work__point">
          <p class="inst4-work__number">01</p>
          <div class="inst4-work__point-body">
            <h3 class="inst4-work__point-title">旧政治秩序需要一个可信的新组织</h3>
            <p class="inst4-work__point-text">只有具备政治信誉、责任能力和承接能力，新的政治力量才能与旧政治秩序建立真正的沟通与信任。</p>
          </div>
        </article>
        <article class="inst4-work__point">
          <p class="inst4-work__number">02</p>
          <div class="inst4-work__point-body">
            <h3 class="inst4-work__point-title">政治转型不能只依靠观点</h3>
            <p class="inst4-work__point-text">组织必须能够承担法律、财务、人员与长期政治责任，才能成为稳定的政治沟通主体。</p>
          </div>
        </article>
      </div>
      <div class="inst4-work__initiative">
        <p class="inst4-work__initiative-label">CURRENT INITIATIVE</p>
        <h3 class="inst4-work__initiative-title">北美非营利法人及首届董事会筹备</h3>
      </div>
    </div>
    <div class="inst4-document">
      <div class="inst4-document__head">
        <p class="inst4-document__label">OFFICIAL DOCUMENT</p>
        <p class="inst4-document__id">CO—2026—002</p>
      </div>
      <div class="inst4-document__cover">
        <p class="inst4-document__org">公民秩序主义</p>
        <h3 class="inst4-document__title"><a href="/files/civic-orderism-founding-board-brief-2026.pdf" target="_blank" rel="noopener">北美非营利法人及<br>首届董事会筹备说明</a></h3>
        <p class="inst4-document__summary">当前组织建设的正式筹备文件</p>
      </div>
      <div class="inst4-document__foot">
        <p class="inst4-document__meta">2026 · PDF · 22 PAGES</p>
        <hr class="inst4-document__divider" aria-hidden="true">
        <p class="inst4-document__cta"><a href="/files/civic-orderism-founding-board-brief-2026.pdf" target="_blank" rel="noopener">阅读正式文件 <span aria-hidden="true">→</span></a></p>
      </div>
    </div>
  </div>
</section>

<!-- SECTION 3 / RESEARCH -->
<section class="inst4-research" id="research">
  <div class="inst4-research__head">
    <p class="inst4-eyebrow">RESEARCH &amp; POLITICAL WORK</p>
    <h2 class="inst4-research__title">从理解旧秩序，到准备新的政治秩序</h2>
    <p class="inst4-research__bridge">组织承接政治责任，研究提供判断基础。</p>
  </div>
  <div class="inst4-research__list">
    <a class="inst4-research__row" href="/china">
      <span class="inst4-research__num" aria-hidden="true">01</span>
      <span class="inst4-research__cell">
        <span class="inst4-research__phase">理解现在</span>
        <span class="inst4-research__col-title">解析中共</span>
      </span>
      <span class="inst4-research__desc">理解现有政治系统为什么正在逐渐失去持续提供利益、预期与共识的能力。</span>
      <span class="inst4-research__arrow" aria-hidden="true">→</span>
    </a>
    <a class="inst4-research__row" href="/civic-orderism">
      <span class="inst4-research__num" aria-hidden="true">02</span>
      <span class="inst4-research__cell">
        <span class="inst4-research__phase">准备转轨</span>
        <span class="inst4-research__col-title">政治路线</span>
      </span>
      <span class="inst4-research__desc">研究如何降低政治变化的阻力、风险与社会成本，并建立新旧政治力量之间可信的沟通路径。</span>
      <span class="inst4-research__arrow" aria-hidden="true">→</span>
    </a>
    <a class="inst4-research__row" href="/china-future">
      <span class="inst4-research__num" aria-hidden="true">03</span>
      <span class="inst4-research__cell">
        <span class="inst4-research__phase">准备未来</span>
        <span class="inst4-research__col-title">中国未来</span>
      </span>
      <span class="inst4-research__desc">讨论政治变化之后国家如何继续运行，以及新的政治秩序如何建立。</span>
      <span class="inst4-research__arrow" aria-hidden="true">→</span>
    </a>
  </div>
  <p class="inst4-research__all"><a href="/theory">浏览全部研究与出版 <span aria-hidden="true">→</span></a></p>
</section>

</div>`,
);

writeContent(
  "start-here/index.md",
  `${yamlFrontmatter({ title: "5分钟了解公民秩序主义", description: "用五分钟了解公民秩序主义是什么、为什么提出、核心政治路线，以及当前组织建设阶段。", contentType: "新读者入口", aliases: ["start"] })}

<div class="start-page start-here-page">
  <header class="start-page__header"><p class="resource-label">新读者入口</p><h1>5分钟了解公民秩序主义</h1><p>用五个问题建立基础认识：这是什么、为什么提出、坚持什么、现在正在做什么，以及接下来从哪里继续了解。</p></header>
  <div class="start-page__sections">
    <section><span>01</span><div><h2>公民秩序主义是什么？</h2><p>公民秩序主义不是普通政治评论项目，也不是只提供文章和观点的内容平台。它是一条面向中国未来政治转型的组织与政治路线，目标是在降低冲突和社会代价的前提下，为国家秩序、公共服务和政治制度的和平转换建立现实承接能力。</p></div></section>
    <section><span>02</span><div><h2>为什么提出这条路线？</h2><p>工业时代形成的政治制度、政党组织和官僚治理方式，正在面对信息化社会带来的结构性失配。信息传播、社会协作和公共问题已经高度复杂化，旧有政治通道却越来越难以形成稳定反馈、明确责任和长期判断。中国需要的不是另一轮情绪动员，而是一种适应新时代的政治组织方式。</p><p class="start-roadmap__line">信息化时代 → 工业时代制度失配 → 需要新的政治组织方式</p></div></section>
    <section><span>03</span><div><h2>核心政治路线是什么？</h2><p>公民秩序主义主张不以社会崩溃换取政治变化，不按政治身份实施普遍追责，也不把国家行政系统整体推向对立面。</p><ul><li><strong>不革命：</strong>不以暴力和社会失控作为转型方法。</li><li><strong>不清算：</strong>责任依据具体行为、证据和法律认定。</li><li><strong>和平承接：</strong>为不同社会群体提供可理解、可预期的制度出口。</li><li><strong>国家连续：</strong>保持行政体系、公共服务与基本社会秩序。</li><li><strong>依法治理：</strong>以程序、授权、监督和责任边界约束权力。</li><li><strong>长期建设：</strong>通过持续的理论、组织和制度准备形成现实能力。</li></ul></div></section>
    <section><span>04</span><div><h2>现在正在做什么？</h2><p>公民秩序主义已经从理论建设进入组织建设阶段。当前工作集中在北美非营利法人筹备、首届董事会筹备、理论体系整理和长期组织基础建设。现阶段不追求快速扩大人数，而是先建立规则、责任、治理边界和稳定协作关系。</p></div></section>
    <section><span>05</span><div><h2>下一步从哪里开始？</h2><p>已经建立基础认识后，可以依次理解核心政治路线、按问题进入阅读地图，再了解当前董事会筹备工作。</p><div class="start-page__actions"><a class="v2-button v2-button--primary" href="/civic-orderism/peaceful-state-transition">阅读核心政治路线</a><a class="v2-button v2-button--secondary" href="/articles">阅读地图</a><a class="v2-button v2-button--secondary" href="/preparation">董事会筹备</a></div></div></section>
  </div>
</div>`,
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
  const coreModel = coreModelBySlug.get(concept.slug);
  const configuredRepresentativeSlugs = coreModel
    ? coreModel.representativeArticles.map((item) => item.slug)
    : (concept.representativeArticles ?? []);
  const representativeArticles = configuredRepresentativeSlugs
    .map((slug) => articleBySlug.get(slug))
    .filter(isEligibleArticle);
  const overviewArticle = coreModel?.overviewArticle
    ? articleBySlug.get(coreModel.overviewArticle)
    : undefined;
  const extendedArticles = (coreModel?.extendedArticles ?? [])
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
    "organizational-credit",
    "party-state-stress",
    "political-control-governance-divergence",
    "political-debt",
    "security-purge-recentralization-cycle",
    "security-recentralization",
    "three-cleans-era",
  ].includes(concept.slug);
  const conceptStatusTable = usesAlignedStatusTable
    ? `| 字段     | 内容       |\n| -------- | ---------- |\n| 更新时间 | 2026-07-20 |\n| 知识状态 | ${statusLabel}   |`
    : `| 字段 | 内容 |\n| --- | --- |\n| 更新时间 | 2026-07-20 |\n| 知识状态 | ${statusLabel} |`;
  const representativeArticleSection = coreModel
    ? coreModel.representativeArticles.some((item) => item.stage)
      ? coreModel.representativeArticles
          .map((item) => {
            const article = articleBySlug.get(item.slug);
            if (!isEligibleArticle(article)) return "";
            return item.stage
              ? `### ${item.stage}\n\n${cardGrid([article])}`
              : cardGrid([article]);
          })
          .filter(Boolean)
          .join("\n\n")
      : cardGrid(representativeArticles)
    : relatedArticles.length
      ? cardGrid(relatedArticles.slice(0, 12))
      : "";
  const modelReadingSections = coreModel
    ? `## 模型总论

${overviewArticle ? cardGrid([overviewArticle]) : "**当前暂无专门总论。**"}

## 代表文章

${representativeArticleSection}

${extendedArticles.length ? `<details class="concept-model-more">\n<summary>查看延伸阅读（${extendedArticles.length}）</summary>\n\n${cardGrid(extendedArticles)}\n\n</details>` : ""}`
    : relatedArticles.length
      ? `## 代表文章\n\n${representativeArticleSection}`
      : "";
  await writeConceptContent(
    `concepts/${concept.slug}.md`,
    `${yamlFrontmatter({ title: concept.name, description: concept.definition, contentType: "核心概念", status: conceptIsVisible ? "published" : "draft", listed: conceptIsFormal, folderListed: conceptIsFormal, noindex: !conceptIsFormal, publicationStatus })}

# ${concept.name}

<p class="concept-status concept-status--${publicationStatus}">${statusLabel}</p>

<p class="concept-definition">${concept.definition}</p>

${conceptStatusTable}

## ${coreModel ? "核心判断" : "完整解释"}

${concept.explanation ?? concept.publicationReason}

## 形成机制

${concept.mechanism}

## 现实表现

${concept.manifestations.map((item) => `- ${item}`).join("\n")}

${concept.boundaryTitle && concept.boundary ? `## ${concept.boundaryTitle}\n\n${concept.boundary}\n\n` : ""}${modelReadingSections}

${relatedTopics.length ? `## 相关专题\n\n${relatedTopics.map((topic) => `- [[topics/${topic.slug}|${topic.name}]]`).join("\n")}` : ""}

${relatedConcepts.length ? `## 相关概念\n\n${relatedConcepts.map((item) => `- [[concepts/${item.slug}|${item.name}]]`).join("\n")}` : ""}`,
  );
}

const conceptDomain = (concept) => {
  if (concept.domain) return concept.domain;
  return concept.topics.some((slug) =>
    ["political-transition", "institutional-mechanisms"].includes(slug),
  )
    ? "civic-orderism"
    : "china-analysis";
};
const conceptCard = (concept, { extended = false } = {}) => {
  const status = conceptPublicationStatus(concept);
  const research = status === "reviewing";
  return `<a class="concept-card${research ? " concept-card--research" : ""}${extended ? " concept-card--extended" : ""}" href="/concepts/${concept.slug}"><strong>${concept.name}</strong><span>${concept.definition}</span><small>${research ? "研究概念" : "正式概念"}</small></a>`;
};
const chinaConcepts = visibleConcepts.filter(
  (concept) => conceptDomain(concept) === "china-analysis",
);
const coreChinaConceptSlugs = [
  "party-state-stress",
  "bureaucratic-shock",
  "order-evaporation",
  "organizational-credit",
  "security-purge-recentralization-cycle",
  "political-control-governance-divergence",
];
const coreChinaConceptSet = new Set(coreChinaConceptSlugs);
const coreChinaConcepts = coreChinaConceptSlugs
  .map((slug) => chinaConcepts.find((concept) => concept.slug === slug))
  .filter(Boolean);
const extendedChinaConcepts = chinaConcepts.filter(
  (concept) => !coreChinaConceptSet.has(concept.slug),
);
const civicConcepts = visibleConcepts.filter(
  (concept) => conceptDomain(concept) === "civic-orderism",
);

writeContent(
  "concepts/index.md",
  `${yamlFrontmatter({ title: "核心概念词典", description: "按解析中共与公民秩序主义两条主线浏览全站核心概念。", contentType: "概念索引" })}

# 核心概念词典

这里汇集全站持续使用的解释模型与政治路线概念。正式概念已经形成稳定定义；研究概念仍在完善边界，但可以作为继续阅读的知识节点。

## 解析中共类

<p>从党国结构、官僚系统、组织信用与安全逻辑理解中共运行方式。</p>

### 核心概念

<p>用于解释不同政治现象背后共同运行机制的稳定模型。</p>

<div class="concept-grid concept-grid--core">${coreChinaConcepts.map((concept) => conceptCard(concept)).join("\n")}</div>

### 延伸研究概念

<p>用于查询具体判断、政策机制与辅助分析术语。</p>

<details class="concept-research-more">
<summary>查看延伸研究概念（${extendedChinaConcepts.length}）</summary>
<div class="concept-grid concept-grid--extended">${extendedChinaConcepts.map((concept) => conceptCard(concept, { extended: true })).join("\n")}</div>
</details>

## 公民秩序主义类

<p>从和平转轨、国家连续、低阻力治理与政治路线理解公民秩序主义的方案。</p>

<div class="concept-grid">${civicConcepts.map(conceptCard).join("\n")}</div>`,
);

writeInstitutionalContent(
  "preparation.md",
  `${yamlFrontmatter({ title: "北美非营利法人及首届董事会筹备", description: "了解公民秩序主义北美非营利法人及首届董事会筹备的目的、当前阶段、治理责任、候选人方向与联系方式。", contentType: "筹备页面", date: "2026-07-19", updated: "2026-08-11" })}

<div class="preparation-page">
<header class="preparation-hero">
  <p class="resource-label">政治路线的长期组织承接</p>
  <h1>北美非营利法人及首届董事会筹备</h1>
  <p>公民秩序主义正在为正式出版、政治与治理研究、公共传播、人才协作和数字资产保护建立依法运行的承接结构。现阶段同时推进北美非营利法人和首届董事会的前期准备。</p>
  <p class="preparation-status-note">当前处于北美非营利法人及首届董事会前期筹备阶段，${organization.statusLabels.registration}，${organization.statusLabels.board}。</p>
</header>

<section class="preparation-overview" aria-labelledby="preparation-overview-title">
  <div class="home-section-intro"><p class="resource-label">结构化摘要</p><h2 id="preparation-overview-title">当前筹备事项</h2><p>以下信息用于快速说明目前在做什么、为什么需要这套组织结构，以及如何进一步联系。</p></div>
  <div class="preparation-overview-grid">
    <article><span>正在筹备什么</span><strong>北美非营利法人 + 首届董事会</strong><p>为理论、研究、出版、传播与公共资产建立长期承接结构。</p></article>
    <article><span>为什么需要法人</span><strong>让公共事业不依赖个人</strong><p>以章程、授权、财务与档案制度明确责任并保护公共资产。</p></article>
    <article><span>为什么需要董事会</span><strong>建立监督与治理责任</strong><p>对使命、法律义务、重大决策、财务和组织资产承担集体责任。</p></article>
    <article><span>当前阶段</span><strong>前期筹备、沟通与框架建设</strong><p>正在完善组织框架、职责边界，并开展潜在候选人沟通。</p></article>
    <article><span>希望联系的人</span><strong>能够承担长期责任的专业参与者</strong><p>当前正在识别并接触潜在首届董事候选人，同时建立其他专业协作联系。</p></article>
    <article><span>进一步了解或联系</span><strong><a href="mailto:${organization.primaryEmail}">${organization.primaryEmail}</a></strong><p>备用邮箱：<a href="mailto:${organization.secondaryEmail}">${organization.secondaryEmail}</a></p></article>
  </div>
  <div class="preparation-overview-actions"><a class="v2-button v2-button--primary" href="${organization.routes.boardPreparation}">了解首届董事会筹备</a><a class="v2-button v2-button--secondary" href="#preparation-contact">查看联系方式</a></div>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">为什么需要法人</p><h2>让公共事业不再依赖个人意志和临时协作</h2><p>理论需要制度承载，制度需要组织实践。法人不是目的，而是明确责任、保护公共资产、建立持续治理和依法开展工作的基础设施。</p></div>
  <div class="preparation-principle-grid"><article><strong>治理可持续</strong><p>以章程、董事会、授权和记录制度代替个人化管理。</p></article><article><strong>责任可识别</strong><p>明确谁能够决策、谁承担监督、谁对财务和公共资产负责。</p></article><article><strong>资产可保护</strong><p>长期管理理论成果、品牌、域名、网站、账号、档案与出版物。</p></article></div>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">为什么需要首届董事会</p><h2>让方向、责任与公共资产受到明确监督</h2><p>董事会不是象征性头衔，而是非营利法人的治理机构。首届董事需要共同建立组织最初的责任边界和工作规则。</p></div>
  <div class="preparation-principle-grid"><article><strong>守护公共使命</strong><p>确保研究、出版与组织工作持续服务于公民秩序主义的长期公共目的。</p></article><article><strong>承担法定责任</strong><p>依照最终注册法域的法律要求，对重大决策、合规与监督承担责任。</p></article><article><strong>保护组织资产</strong><p>监督财务、知识产权、域名、网站、账号、档案和其他公共资产。</p></article></div>
</section>

<section class="preparation-section preparation-candidates">
  <div class="home-section-intro"><p class="resource-label">希望联系的人</p><h2>正在识别潜在首届董事候选人</h2><p>现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格。</p></div>
  <ul class="preparation-work-list"><li><strong>长期治理责任</strong><span>能够投入稳定时间，并对组织使命、风险与公共资产承担持续责任。</span></li><li><strong>基本路线理解</strong><span>对公民秩序主义的基本路线有充分理解，能够区分公共使命与个人立场。</span></li><li><strong>规则与程序约束</strong><span>能够接受章程、授权、利益冲突、记录、监督和集体决策规则。</span></li><li><strong>专业能力</strong><span>具备治理、法律、财务、研究、出版、技术或组织管理等专业能力之一。</span></li><li><strong>长期合作意愿</strong><span>能够进行稳定、克制、可靠的长期合作，并审慎处理敏感信息与风险。</span></li></ul>
  <div class="preparation-actions"><a class="v2-button v2-button--primary" href="mailto:${organization.primaryEmail}">通过邮件建立联系</a><a class="v2-button v2-button--secondary" href="${organization.routes.boardPreparation}">查看董事责任与候选人条件</a></div>
</section>

<section class="preparation-section preparation-contact" id="preparation-contact">
  <div><p class="resource-label">联系方式</p><h2>进一步了解或建立联系</h2><p>如果希望了解法人筹备、首届董事会责任或专业协作边界，请通过电子邮件联系。现阶段不设置即时社群入口。</p></div>
  <dl><div><dt>主联系邮箱</dt><dd><a href="mailto:${organization.primaryEmail}">${organization.primaryEmail}</a></dd></div><div><dt>备用邮箱</dt><dd><a href="mailto:${organization.secondaryEmail}">${organization.secondaryEmail}</a></dd></div></dl>
</section>

<section class="preparation-framework" aria-labelledby="preparation-framework-title">
  <div class="preparation-framework__intro"><p class="resource-label">深入阅读</p><h2 id="preparation-framework-title">进一步了解筹备框架</h2><p>以下内容说明拟承担的公共工作、当前筹备步骤与组织治理原则。</p></div>
  <div class="preparation-framework__body">
    <div class="preparation-section">
      <div class="home-section-intro"><p class="resource-label">拟承担的公共工作</p><h2>研究、出版、制度建设与人才培养</h2><p>具体业务范围将根据最终注册法域、章程和法律意见确定。现阶段的筹备方向包括：</p></div>
      <ul class="preparation-work-list"><li><strong>理论研究</strong><span>持续研究中国政治、财政、社会、官僚体系与国家治理。</span></li><li><strong>政治与治理研究</strong><span>研究和平转轨、行政承接、责任区分和公共权力约束问题。</span></li><li><strong>出版与传播</strong><span>维护网站，出版研究成果，建立稳定、克制的公共传播平台。</span></li><li><strong>组织治理</strong><span>建立章程、附例、财务、档案、隐私、知识产权与信息安全制度。</span></li><li><strong>人才培养</strong><span>识别并培养能够承担研究、专业与长期治理责任的人。</span></li></ul>
    </div>
    <div class="preparation-section">
      <div class="home-section-intro"><p class="resource-label">当前筹备事项</p><h2>先建立规则，再扩大参与</h2></div>
      <ol class="preparation-steps"><li><span>01</span><div><strong>明确宗旨与业务范围</strong><p>研究适合的法人定位、公共目的和合规边界。</p></div></li><li><span>02</span><div><strong>选择注册法域</strong><p>比较加拿大及北美相关法律环境；目前尚未确定具体法域。</p></div></li><li><span>03</span><div><strong>制定章程与组织附例</strong><p>明确董事会、法定成员、授权、监督和利益冲突规则。</p></div></li><li><span>04</span><div><strong>建立内部制度</strong><p>准备财务、档案、隐私、信息安全和知识产权制度。</p></div></li><li><span>05</span><div><strong>识别首届董事候选人</strong><p>以真实治理责任、专业能力和长期合作可能为标准。</p></div></li><li><span>06</span><div><strong>完成法律程序</strong><p>在制度和人员准备成熟后，再依法申请注册并产生治理机构。</p></div></li></ol>
    </div>
    <div class="preparation-section preparation-governance">
      <div><p class="resource-label">治理原则</p><h2>克制、程序、责任与安全</h2></div>
      <ul><li>先有制度，再扩大参与；</li><li>先有责任，再授予权力；</li><li>组织资产服务公共使命，不归个人所有；</li><li>未经授权，任何人不得代表组织；</li><li>采用分级授权、最小权限和可追溯的决策记录；</li><li>重要法律、财务和信息安全事项必须经过专业审查。</li></ul>
    </div>
  </div>
</section>

<section class="preparation-section preparation-legal-note">
  <p class="resource-label">重要状态说明</p>
  <h2>筹备不等于已经成立</h2>
  <p>截至目前，北美非营利法人尚未依法成立，具体注册法域尚未确定，首届董事会尚未依法产生。本站所称“法人筹备”和“董事会筹备”仅描述正在进行的准备工作，不表示已经取得任何法人、慈善或免税资格。</p>
  <p><strong>参与筹备不自动产生董事身份或治理权限。</strong>董事、法定成员、官方代表及其他正式治理职务，均须在制度准备完成后，依照适用法律、章程与正式程序产生。</p>
  <div class="preparation-actions"><a class="v2-button v2-button--primary" href="${organization.routes.boardPreparation}">了解董事会筹备</a><a class="v2-button v2-button--secondary" href="${organization.routes.manifesto}">阅读筹备宣言</a><a class="v2-button v2-button--secondary" href="${organization.routes.participate}">参与筹备</a></div>
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
  <p class="preparation-status-note">当前处于首届董事会前期筹备阶段，${organization.statusLabels.registration}，${organization.statusLabels.board}。</p>
</header>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">董事会是什么</p><h2>承担长期治理和法律责任的机构</h2><p>董事不是项目支持者的高级称号，也不是对早期参与的奖励。董事需要对组织使命、合规、财务、风险和公共资产承担持续的受托责任。</p></div>
  <div class="preparation-principle-grid"><article><strong>守护使命</strong><p>保证组织工作持续服务于和平转轨、制度研究和公共建设。</p></article><article><strong>监督治理</strong><p>审议重大政策、预算、授权、风险和管理层履职。</p></article><article><strong>保护资产</strong><p>防止品牌、知识成果、资金、账号和数字资产被个人控制或挪用。</p></article></div>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">候选人标准</p><h2>潜在候选人需要具备什么</h2><p>现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格。公民秩序主义希望联系能够长期承担治理责任、理解基本政治路线，并具备稳定合作意愿的人。</p></div>
  <ul class="participate-checklist"><li>理解和平转轨、行政承接与国家连续；</li><li>认同不革命、不清算、不以报复为目的；</li><li>尊重程序、授权、组织纪律与集体决策；</li><li>具备独立判断、事实意识和处理分歧的能力；</li><li>能够保护组织信息、成员隐私和敏感资料；</li><li>愿意投入稳定时间并承担法定治理责任；</li><li>能够识别并披露利益冲突；</li><li>具备法律、财务、公共管理、技术、传播、研究或运营能力之一。</li></ul>
</section>

<section class="preparation-section">
  <div class="home-section-intro"><p class="resource-label">产生程序</p><h2>不会通过公开报名直接任命</h2><p>首届董事会的产生将以法律要求、章程设计、背景核验、长期合作观察和正式决议为基础。</p></div>
  <ol class="preparation-steps"><li><span>01</span><div><strong>初步联系</strong><p>了解路线认同、专业背景、居住法域与参与意愿。</p></div></li><li><span>02</span><div><strong>任务协作</strong><p>通过小规模、具体工作观察责任感、判断力与协作稳定性。</p></div></li><li><span>03</span><div><strong>治理沟通</strong><p>讨论董事义务、利益冲突、保密、安全和时间投入。</p></div></li><li><span>04</span><div><strong>合规审查</strong><p>结合最终注册法域核对董事资格和法律要求。</p></div></li><li><span>05</span><div><strong>依法产生</strong><p>在法人程序中依章程完成提名、同意、决议与记录。</p></div></li></ol>
</section>

<section class="preparation-section preparation-legal-note">
  <p class="resource-label">身份边界</p><h2>筹备联系不构成任命或承诺</h2>
  <p>提交意向、参与会议、提供建议或完成协作任务，都不当然产生董事候选人、董事、法定成员、共同创始人或官方代表身份。任何治理身份都必须在制度准备和法律程序完成后，以正式文件确认。</p>
  <div class="preparation-actions"><a class="v2-button v2-button--primary" href="${organization.routes.participate}#contact">了解参与方式</a><a class="v2-button v2-button--secondary" href="${organization.routes.manifesto}">阅读筹备宣言</a></div>
</section>
</div>`,
);

writeContent(
  "participate.md",
  `${yamlFrontmatter({ title: "参与公民秩序主义", description: "了解如何通过正式阅读、公共传播、专业协作与长期联系支持公民秩序主义，以及北美组织筹备的适用边界。", contentType: "参与" })}

<div class="participate-page">
<header class="participate-hero">
  <p class="resource-label">了解、协作与长期联系</p>
  <h1>参与公民秩序主义</h1>
  <p>参与不等于立即加入组织。无论身处何地，都可以先从了解政治路线、传播正式材料、提供专业协作或建立长期联系开始。</p>
</header>

<section class="participate-section" id="communication" aria-labelledby="participation-communication">
  <div class="home-section-intro"><p class="resource-label">不限地区</p><h2 id="participation-communication">了解与传播</h2><p>阅读正式材料，理解和平转轨、国家连续和责任区分，并向愿意理性讨论中国未来的人介绍公民秩序主义。</p></div>
  <div class="participate-support-grid"><span>阅读公民秩序主义正式材料</span><span>介绍公民秩序主义的政治路线</span><span>分享网站、手册与正式文章</span><span>参与克制、基于事实的公共讨论</span></div>
  <p class="participate-support-note">了解与传播不限制居住地，不要求公开身份，也不构成组织加入或治理身份。</p>
</section>

<section class="participate-section" id="collaboration" aria-labelledby="participation-collaboration">
  <div class="home-section-intro"><p class="resource-label">按专业能力参与</p><h2 id="participation-collaboration">专业协作</h2><p>公民秩序主义需要能够承担具体工作的人，以专业成果而不是口号和声势推进长期建设。</p></div>
  <div class="participate-support-grid"><span>研究</span><span>编辑</span><span>翻译</span><span>设计</span><span>技术</span><span>法律</span><span>财务</span><span>项目管理</span></div>
  <p class="participate-support-note">专业协作可从小规模、明确边界的任务开始，不要求立即承担组织治理责任。</p>
</section>

<section class="participate-section" id="long-term-contact" aria-labelledby="participation-long-term-contact">
  <div class="home-section-intro"><p class="resource-label">低风险参与</p><h2 id="participation-long-term-contact">长期联系</h2><p>对于暂时不方便公开参与的人，可以通过电子邮件建立长期联系，在保护身份和现实安全的前提下持续了解项目进展。</p></div>
  <p class="participate-support-note">可以使用化名或只提供必要的联系方式；初次联系不需要发送身份证件、详细住址或单位内部资料。</p>
</section>

<section class="participate-section" id="north-america" aria-labelledby="participation-north-america">
  <div class="home-section-intro"><p class="resource-label">第二部分 · 加拿大及北美</p><h2 id="participation-north-america">参与北美组织筹备</h2><p>面向长期居住于加拿大或北美、愿意承担当地法律责任和长期治理工作的人。当前工作以小规模、具体任务和长期合作观察为主。</p></div>
  <div class="participate-path-grid"><article><span>01</span><h3>法人筹备</h3><p>注册法域、法人宗旨、业务范围、章程与组织附例研究。</p></article><article><span>02</span><h3>董事会筹备</h3><p>董事责任、候选人识别、利益冲突与依法产生程序。</p></article><article><span>03</span><h3>法律与合规</h3><p>当地非营利法律、政策文件、档案和公共活动边界。</p></article><article><span>04</span><h3>财务与内部控制</h3><p>预算、记账、审批、审计准备和组织资产管理制度。</p></article><article><span>05</span><h3>治理制度建设</h3><p>授权、监督、责任、隐私、信息安全与决策记录。</p></article><article><span>06</span><h3>长期组织运营</h3><p>任务协调、人才联系、出版支持和稳定的组织基础维护。</p></article></div>
  <p class="participate-region-boundary"><strong>适用范围：</strong>北美居住要求不适用于普通支持、传播、翻译、研究和技术协作，只适用于当地法人、董事会候选人识别以及需要承担当地法律责任的治理工作。</p>
</section>

<section class="participate-section participate-fit" aria-labelledby="participation-fit">
  <div class="home-section-intro"><p class="resource-label">责任与稳定性优先</p><h2 id="participation-fit">公民秩序主义希望与什么样的人建立联系</h2></div>
  <ul class="participate-checklist"><li>理解和平转轨与行政承接；</li><li>认同不革命、不清算、不以报复为目的；</li><li>能够长期、稳定地参与公共事务；</li><li>尊重程序、授权、组织纪律与事实；</li><li>能够保护组织信息和成员隐私；</li><li>愿意承担真实工作和明确责任；</li><li>具备独立思考和处理分歧的能力；</li><li>拥有法律、财务、管理、技术、传播、设计、研究或运营能力之一。</li></ul>
</section>

<section class="participate-section participate-boundaries" aria-labelledby="participation-boundaries">
  <div><p class="resource-label">组织扩展原则</p><h2 id="participation-boundaries">公民秩序主义不以人数、头衔和情绪扩大组织</h2><p>公民秩序主义不建立个人崇拜，不依靠口号、互相攻击和敌我动员维持活跃度，不建立失控的大规模公开群组，也不允许任何人未经授权代表组织。</p><p>公民秩序主义不以公开暴露身份、激进言论或不必要的冒险作为忠诚证明，不以内部热闹代替真实建设。</p></div>
</section>

<section class="participate-section participate-security" aria-labelledby="participation-security">
  <div class="home-section-intro"><p class="resource-label">参与者保护</p><h2 id="participation-security">不人为制造风险</h2><p>未来将逐步建立信息最小化、化名参与、身份保护、分级授权、最小权限、内部资料访问控制和敏感工作独立风险评估机制。</p></div>
  <p>公民秩序主义无法承诺政治参与完全没有风险，但不会鼓励无意义的牺牲，也不会要求任何人以个人或家庭安全换取组织认可。</p>
</section>

<section class="participate-section preparation-legal-note" aria-labelledby="participation-status-boundary">
  <p class="resource-label">身份边界</p><h2 id="participation-status-boundary">筹备参与不是治理身份</h2>
  <p>提交邮件、参加沟通、提供建议或完成任务，均不当然产生董事资格、法定成员资格、共同创始人身份、官方代表资格、项目治理权或项目资产所有权。</p>
</section>

<section class="participate-section participate-contact" id="contact" aria-labelledby="participation-contact">
  <div class="home-section-intro"><p class="resource-label">建立联系</p><h2 id="participation-contact">通过邮件说明参与方向</h2><p>普通支持者可以直接提出建议或提供专业意见；希望参与具体协作的人，可以在邮件中说明可承担的工作方向。涉及北美法人或董事会筹备时，请说明所在国家、州或省。</p></div>
  <div class="participate-contact-grid"><div><h3>邮件可以包括</h3><ul><li>你对公民秩序主义基本路线的理解；</li><li>希望支持或参与的方式；</li><li>专业背景和可以提供的意见；</li><li>能够投入的大致时间；</li><li>如涉及法人或董事会筹备，说明所在国家、州或省；</li><li>希望采用的称呼和联系方式。</li></ul></div><div class="participate-contact-card"><p class="resource-label">主联系邮箱</p><a href="mailto:${organization.primaryEmail}?subject=${encodeURIComponent("支持与参与公民秩序主义")}">${organization.primaryEmail}</a><p class="resource-label">备用邮箱</p><a href="mailto:${organization.secondaryEmail}?subject=${encodeURIComponent("支持与参与公民秩序主义")}">${organization.secondaryEmail}</a><small>请不要在初次邮件中发送身份证件、详细住址、护照号码、单位内部资料或其他不必要的敏感个人信息。可以先使用化名并说明希望采用的联系方式。</small></div></div>
</section>
</div>`,
);

writeInstitutionalContent(
  "about.md",
  `${yamlFrontmatter({ title: "关于", description: "了解公民秩序主义的政治与制度路线、官方网站使命、当前组织阶段与公共工作。", contentType: "页面" })}

# 关于

## 公民秩序主义是什么

公民秩序主义首先是一条面向中国未来的政治与制度路线。它主张通过和平转轨、行政承接、责任区分和制度重组，降低政治变化的社会成本，保持国家与公共服务连续，并建立能够限制权力、明确责任和持续纠错的新秩序。

理论是这条路线的基础，用于解释国家失灵、公共秩序和制度能力；组织建设是长期承接结构，使路线能够被持续研究、传播、完善和实践。

## 为什么建立这个网站

本站是公民秩序主义的正式出版、理论沉淀、政治与治理研究及公共传播平台。它负责保存正式文本、呈现核心政治路线、建立稳定阅读入口，并记录组织建设的准确状态。

本站不是新闻信息流，也不以高频更新、情绪动员或社交平台内容归档作为主要功能。网站服务于一条长期政治路线，而不是把公民秩序主义缩减为单纯的内容集合。

## 当前组织阶段

截至目前，${organization.statusLabels.registration}，${organization.statusLabels.jurisdiction}，${organization.statusLabels.board}。公民秩序主义尚不是一个成熟运行的政党，也不声称已经取得法人、慈善或免税资格。

公民秩序主义正在从理论建设进入组织基础建设阶段。现阶段重点是理论建设、公共传播、专业协作网络建设和北美非营利组织筹备，而不是追求短期声势或迅速扩张成员。

北美非营利法人将作为公共研究、出版、资产管理和组织治理的承接结构，不等同于已经成立的政党或成熟政治组织。有关注册、董事会、治理身份和地区要求的程序性说明，统一在 [[preparation|组织筹备页面]] 公开。

## 网站承担哪些功能

- **正式出版**：发布公民秩序主义的正式文章、手册与路线说明。
- **理论沉淀**：保存对中国现实、政治转轨和国家秩序的系统研究。
- **制度研究**：持续完善和平转轨、行政承接、责任区分和公共权力约束方案。
- **公共传播**：围绕核心路线、制度方案和正式出版建立长期公共认知。

政治路线是主体，网站是载体，理论是基础，组织是长期承接结构。

本站重视事实、逻辑、责任边界与制度可执行性，不以新闻速度、情绪动员或个人崇拜替代制度分析。

## 阅读入口

  - [[start-here|5分钟了解公民秩序主义]]
  - [[articles|进入阅读地图]]
  - [[civic-orderism/peaceful-state-transition|阅读核心政治路线]]
  - [[preparation|了解组织筹备]]
  - [[participate|了解参与方式]]

## 研究入口

  - [[topics|专题]]
  - [[concepts|核心概念]]
  - [[articles/all|全部文章]]

## 核心文档

${site.documents.map((doc) => `- [${doc.title}](${doc.href}) — ${doc.description}`).join("\n")}

## 联系方式

- 主联系邮箱：[${organization.primaryEmail}](mailto:${organization.primaryEmail})
- 备用邮箱：[${organization.secondaryEmail}](mailto:${organization.secondaryEmail})
- 网站：[civicorderism.com](https://civicorderism.com/)

本站不设公开成员名册、失控的公开群聊、支付或募款入口。无论身处何地，只要认同基本路线，都可以阅读 [[participate|参与说明]]；北美长期居住者还可以进一步了解法人和董事会筹备。`,
);

writeInstitutionalContent(
  "theory/index.md",
  `${yamlFrontmatter({ title: "旧秩序失效", description: "从政党政治、工业型治理与程序问责的结构性局限，理解信息化时代的政治转型问题。", contentType: "研究归档" })}

# 旧秩序失效

本页汇集关于政党政治、工业型治理、程序问责与信息化社会结构变化的研究。第一次访问本站，建议先从 [[articles|阅读地图]] 选择阅读路线；已经明确研究方向的读者，可以直接浏览以下文章。

${filterPanel(articles.filter((article) => article.slug.startsWith("theory/")))}`,
);

writeContent(
  "china-stage/index.md",
  `${yamlFrontmatter({ title: "中国阶段判断", description: "围绕财政、改革窗口、社会压力与政治转型，理解中国正在进入的现实阶段。", contentType: "研究归档" })}

# 中国阶段判断

本页汇集关于财政压力、改革窗口、社会心理与未来路径的阶段性研究。第一次访问本站，建议先从 [[articles|阅读地图]] 建立整体认识；希望继续研究未来秩序的读者，可以进入 [[china-future|中国未来]]。

${filterPanel(articles.filter((article) => article.slug.startsWith("china-stage/")))}`,
);

writeContent(
  "institution/index.md",
  `${yamlFrontmatter({ title: "制度机制", description: "浏览委员会、行政、选举、司法、监督与后台系统等进阶制度研究。", contentType: "研究归档" })}

# 制度机制

本页汇集委员会、行政、议会、选举、司法、监督与后台系统等进阶制度研究。建议先完成 [[articles#route-civic-orderism|公民秩序主义政治路线]]，再按具体问题浏览以下文章。

${filterPanel(articles.filter((article) => article.section === "制度设计"))}`,
);

/* __PHASE2A_BLOCK__ */
/* ================================================================
   Phase 2A — institutional landing pages.
   About / Research / Political Route / Founding Board share the
   V4 institutional design shell (inst4l-*).
   ================================================================ */

function inst4lRow({ href, meta, title, desc }) {
  return `<a class="inst4l-row" href="${href}">
  <span class="inst4l-row__cell"><span class="inst4l-row__meta">${meta}</span><span class="inst4l-row__title">${title}</span></span>
  <span class="inst4l-row__desc">${desc}</span>
  <span class="inst4l-row__arrow" aria-hidden="true">→</span>
</a>`;
}

function inst4lRows(rows) {
  return `<div class="inst4l-list">\n${rows.map(inst4lRow).join("\n")}\n</div>`;
}

function inst4lSection(label, title, body, desc = "") {
  return `<section class="inst4l-section">
  <div class="inst4l-section__head">
    <p class="inst4-eyebrow">${label}</p>
    <h2 class="inst4l-section__title">${title}</h2>
    ${desc ? `<p class="inst4l-section__desc">${desc}</p>` : ""}
  </div>
  ${body}
</section>`;
}

const inst4lAxes = [
  {
    num: "01",
    phase: "理解现在",
    title: "解析中共",
    desc: "解析中共如何运行、为何失灵，以及正在发生什么变化。完整研究程序见「解析中共」。",
    href: "/china/",
  },
  {
    num: "02",
    phase: "准备转轨",
    title: "政治路线",
    desc: "理解旧秩序本身并不能产生新秩序。政治路线研究现实可执行、低阻力、保持国家连续性的和平转轨路径。",
    href: "/civic-orderism/",
  },
  {
    num: "03",
    phase: "准备未来",
    title: "中国未来",
    desc: "政治转型最终必须回答国家如何继续运行，以及新的政治秩序如何建立。",
    href: "/china-future/",
  },
];

function inst4lAxesBlock() {
  return `<div class="inst4l-axes">\n${inst4lAxes
    .map(
      (axis) => `<a class="inst4l-axis" href="${axis.href}">
  <span class="inst4l-axis__num" aria-hidden="true">${axis.num}</span>
  <span class="inst4l-axis__cell"><span class="inst4l-axis__phase">${axis.phase}</span><span class="inst4l-axis__title">${axis.title}</span></span>
  <span class="inst4l-axis__desc">${axis.desc}</span>
  <span class="inst4l-axis__arrow" aria-hidden="true">→</span>
</a>`,
    )
    .join("\n")}\n</div>`;
}

function inst4lContactBlock() {
  return `<div class="inst4l-contact">
  <p class="inst4l-contact__entry"><span>主联系邮箱</span><a href="mailto:${organization.primaryEmail}">${organization.primaryEmail}</a></p>
  <p class="inst4l-contact__entry"><span>备用邮箱</span><a href="mailto:${organization.secondaryEmail}">${organization.secondaryEmail}</a></p>
</div>`;
}

function inst4lDocBlock() {
  return `<div class="inst4l-doc">
  <p class="inst4l-doc__label">OFFICIAL DOCUMENT <span aria-hidden="true">·</span> CO—2026—002</p>
  <h3 class="inst4l-doc__title"><a href="/files/civic-orderism-founding-board-brief-2026.pdf" target="_blank" rel="noopener">公民秩序主义<br>北美非营利法人及<br>首届董事会筹备说明</a></h3>
  <p class="inst4l-doc__meta">2026 · PDF · 22 PAGES</p>
  <p class="inst4l-doc__cta"><a href="/files/civic-orderism-founding-board-brief-2026.pdf" target="_blank" rel="noopener">阅读正式文件 <span aria-hidden="true">→</span></a></p>
</div>`;
}

writeInstitutionalContent(
  "about.md",
  `${yamlFrontmatter({ title: "关于", description: "了解公民秩序主义的政治与制度路线、当前组织阶段与正式文件。", contentType: "页面" })}

<div class="inst4 inst4l inst4l-about">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">ABOUT</p>
    <h1 class="inst4l-title">关于公民秩序主义</h1>
    <p class="inst4l-lead">公民秩序主义是一条面向中国未来的政治与制度路线：通过和平转轨、行政承接、责任区分与制度重组，降低政治变化的社会成本，保持国家与公共服务连续，并建立能够限制权力、明确责任与持续纠错的新秩序。</p>
  </section>

  <div class="inst4l-body">
    <div class="inst4l-main">
      ${inst4lSection(
        "定位",
        "公民秩序主义是什么",
        `<p>公民秩序主义首先是一条面向中国未来的政治与制度路线。它主张通过和平转轨、行政承接、责任区分和制度重组，降低政治变化的社会成本，保持国家与公共服务连续，并建立能够限制权力、明确责任和持续纠错的新秩序。</p>
<p>理论是这条路线的基础，用于解释国家失灵、公共秩序和制度能力；组织建设是长期承接结构，使路线能够被持续研究、传播、完善和实践。</p>`,
      )}

      ${inst4lSection(
        "为什么存在",
        "为什么存在",
        `<p>中国正在进入政治、财政与社会结构变化的长期过程。公民秩序主义认为，政治变化不应当以摧毁国家和集体报复为代价，而应当通过接管、纠偏、重组与再解释，在保持国家连续性的同时建立新秩序。</p>
<p>本站不是新闻信息流，也不以高频更新或情绪动员作为主要功能。网站服务于一条长期政治路线，而不是把公民秩序主义缩减为单纯的内容集合。</p>`,
      )}

      ${inst4lSection(
        "路线",
        "政治路线",
        `<p>政治转型的目标不是摧毁国家，而是改变政治。公民秩序主义主张一条不依赖革命、不以清算为目，并保持国家连续性的和平转轨路线。</p>
<p class="inst4l-link"><a href="/civic-orderism/">阅读政治路线 <span aria-hidden="true">→</span></a></p>`,
      )}

      ${inst4lSection("研究体系", "从理解旧秩序，到准备新的政治秩序", inst4lAxesBlock(), "研究围绕三个方向展开：理解现在、准备转轨、准备未来。")}

      ${inst4lSection(
        "正式文件",
        "正式出版与筹备文件",
        inst4lRows([
          {
            href: "/files/civic-orderism-introduction-manual.pdf",
            meta: "PDF · 入门手册",
            title: "公民秩序主义介绍手册",
            desc: "第一次理解公民秩序主义的基础文本；也可以在线阅读 HTML 版。",
          },
          {
            href: "/files/civic-orderism-founding-board-brief-2026.pdf",
            meta: "PDF · CO—2026—002",
            title: "北美非营利法人及首届董事会筹备说明",
            desc: "说明公民秩序主义为什么需要从理论表达进入组织建设，以及筹备所承担的功能。",
          },
        ]),
      )}

      ${inst4lSection("联系方式", "联系方式", inst4lContactBlock(), "本站不设公开成员名册、失控的公开群聊、支付或募款入口。")}
    </div>

    <aside class="inst4l-side">
      <div class="inst4l-status">
        <p class="inst4-eyebrow">CURRENT PHASE</p>
        <h2>当前阶段</h2>
        <p>北美非营利法人及<br>首届董事会前期筹备</p>
        <p class="inst4l-status__year">2026</p>
      </div>
      <nav class="inst4l-quicklinks" aria-label="快速入口">
        <a href="/start-here/">5分钟了解 <span aria-hidden="true">→</span></a>
        <a href="/articles/">阅读地图 <span aria-hidden="true">→</span></a>
        <a href="/preparation/">董事会筹备 <span aria-hidden="true">→</span></a>
        <a href="/introduction-manual">在线阅读介绍手册 <span aria-hidden="true">→</span></a>
      </nav>
    </aside>
  </div>
</div>`,
);
const researchLandingTopicSlugs = [
  "political-transition",
  "bureaucratic-system",
  "order-evaporation",
  "second-reform",
];
const researchLandingConceptSlugs = [
  "party-state-stress",
  "bureaucratic-shock",
  "order-evaporation",
  "high-fragility",
  "security-purge-recentralization-cycle",
  "organizational-credit",
];
const researchFocusItems = [
  "theory/party-state-structural-failure",
  "china/xi-power-centralization",
  "civic-orderism/peaceful-state-transition",
  "china-stage/ccp-second-reform-opening-possibility",
  "china-stage/china-manufacturing-cannot-stop",
]
  .map((slug) => articleBySlug.get(slug))
  .filter((article) => article?.status === "published");

writeInstitutionalContent(
  "theory/index.md",
  `${yamlFrontmatter({ title: "研究", description: "公民秩序主义的研究体系：理解现在、准备转轨、准备未来。", contentType: "栏目" })}

<div class="inst4 inst4l inst4l-research">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">RESEARCH &amp; POLITICAL WORK</p>
    <h1 class="inst4l-title">研究</h1>
    <p class="inst4l-lead">公民秩序主义研究中国政治为什么正在变化、变化可以如何发生，以及变化之后国家如何继续运行。研究不是为评论而评论，而是为一条可执行的政治路线与制度建设建立认识基础。</p>
  </section>

  ${inst4lSection("研究框架", "从理解旧秩序，到准备新的政治秩序", inst4lAxesBlock(), "三个方向构成研究的核心阅读逻辑：理解现在，准备转轨，准备未来。")}

  ${inst4lSection(
    "精选研究",
    "当前重点",
    inst4lRows(
      researchFocusItems.map((article) => ({
        href: `/${article.slug}`,
        meta: article.section,
        title: article.title,
        desc: article.summary || "",
      })),
    ),
    "当前正在推进的重点研究。",
  )}

  ${inst4lSection(
    "专题",
    "研究专题",
    inst4lRows(
      researchLandingTopicSlugs
        .map((slug) => topicBySlug.get(slug))
        .filter((topic) => topic?.status === "published")
        .map((topic) => {
          const count = getPrimaryTopicArticles(articles, topic.slug).length;
          return {
            href: `/topics/${topic.slug}`,
            meta: `专题 · ${count} 篇研究`,
            title: topic.name,
            desc: topic.description || "",
          };
        }),
    ),
    "围绕持续性政治问题组织长期研究，而不是按照新闻事件分类。",
  )}

  <div class="inst4l-index-links">
    <p class="inst4l-link"><a href="/topics/">浏览全部研究专题 <span aria-hidden="true">→</span></a></p>
  </div>

  ${inst4lSection(
    "核心概念",
    "核心概念",
    inst4lRows(
      researchLandingConceptSlugs
        .map((slug) => conceptBySlug.get(slug))
        .filter(
          (concept) =>
            concept &&
            (conceptPublicationStatus(concept) === "published" ||
              conceptPublicationStatus(concept) === "reviewing"),
        )
        .map((concept) => ({
          href: `/concepts/${concept.slug}`,
          meta: "",
          title: concept.name,
          desc: concept.definition || "",
        })),
    ),
    "公民秩序主义使用这些概念理解中国政治变化与国家秩序。",
  )}

  <div class="inst4l-index-links">
    <p class="inst4l-link"><a href="/concepts/">浏览全部核心概念 <span aria-hidden="true">→</span></a></p>
  </div>

  ${inst4lSection(
    "阅读",
    "继续阅读",
    inst4lRows([
      {
        href: "/articles/",
        meta: "阅读路线",
        title: "阅读地图",
        desc: "第一次来到这里，选择一条适合自己的阅读路线。",
      },
      {
        href: "/articles/all",
        meta: "索引",
        title: "全部文章",
        desc: "按栏目浏览全部已发布研究。",
      },
      {
        href: "/china-future/",
        meta: "研究",
        title: "中国未来",
        desc: "政治转型之后，国家如何继续运行，以及新的政治秩序如何建立。",
      },
    ]),
  )}
</div>`,
);
const civicOrderismSection = sectionByName.get("公民秩序主义");
const civicOverviewArticle = civicOrderismConfig.overview
  ? articleBySlug.get(civicOrderismConfig.overview)
  : undefined;
const civicChinaOverviewArticle = civicOrderismConfig.chinaOverview
  ? articleBySlug.get(civicOrderismConfig.chinaOverview)
  : undefined;
const civicReadingStages = (civicOrderismConfig.readingStages ?? []).map(
  (stage) => {
    const repItems = (stage.representative ?? [])
      .map((slug) => articleBySlug.get(slug))
      .filter((article) => article?.status === "published");
    const extItems = (stage.extended ?? [])
      .map((slug) => articleBySlug.get(slug))
      .filter((article) => article?.status === "published");
    return { ...stage, repItems, extItems };
  },
);

writeInstitutionalContent(
  "civic-orderism/index.md",
  `${yamlFrontmatter({ title: "公民秩序主义", description: "一条面向中国未来的低阻力、低风险和平政治转型路线：保留国家，改变政治；承接秩序，重建规则。", contentType: "栏目" })}

<div class="inst4 inst4l inst4l-route">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">CIVIC ORDERISM · 政治路线</p>
    <h1 class="inst4l-title">公民秩序主义</h1>
    <p class="inst4-route__en">Civic Orderism</p>
    <p class="inst4-route__judgment">${civicOrderismConfig.hero?.judgment ?? ""}</p>
    <p class="inst4l-lead">${civicOrderismConfig.hero?.description ?? ""}</p>
    <p class="inst4-route__intro">${civicOrderismConfig.hero?.intro ?? ""}</p>
    <div class="inst4-route__cta">
      <a href="${civicOverviewArticle ? `/${civicOverviewArticle.slug}` : "/civic-orderism/civic-orderism-overview"}">阅读《公民秩序主义总论》 <span aria-hidden="true">→</span></a>
      <a href="#route">了解政治转型路线 <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">THE QUESTION</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.question?.title ?? ""}</h2>
    </div>
    <p class="inst4-route__statement">旧政治秩序仍然拥有强大的控制能力，但正在失去：</p>
    <ul class="inst4-route__list">
      ${(civicOrderismConfig.question?.points ?? []).map((point) => `<li>${point}</li>`).join("\n")}
    </ul>
    <p class="inst4-route__quote">${civicOrderismConfig.question?.judgment ?? ""}</p>
    ${civicChinaOverviewArticle ? `<p class="inst4l-link"><a href="/china/what-is-the-ccp-becoming">为什么旧秩序正在失去能力 · 解析中共总论 <span aria-hidden="true">→</span></a></p>` : ""}
  </section>

  <section class="inst4l-section" id="route">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">THE ROUTE</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.route?.title ?? ""}</h2>
    </div>
    <div class="inst4-route__options">
      ${(civicOrderismConfig.route?.options ?? [])
        .map(
          (option, index) => `<div class="inst4-route__option${index === 2 ? " inst4-route__option--chosen" : ""}">
        <h3>${option.name}</h3>
        <p>${option.desc}</p>
      </div>`,
        )
        .join("\n")}
    </div>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">FOUR PRINCIPLES</p>
      <h2 class="inst4l-section__title">四个基本原则</h2>
    </div>
    <div class="inst4-route__principles">
      ${(civicOrderismConfig.principles ?? [])
        .map(
          (principle) => `<div class="inst4-route__principle"><span class="inst4-route__principle-num">${principle.num}</span><h3>${principle.name}</h3><p>${principle.desc}</p></div>`,
        )
        .join("\n")}
    </div>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">TRANSITION LOGIC</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.transition?.title ?? ""}</h2>
    </div>
    <ol class="inst4-route__chain">
      ${(civicOrderismConfig.transition?.chain ?? [])
        .map(
          (node, index) => `<li><span>${index + 1}</span><p>${node}</p></li>`,
        )
        .join("\n")}
    </ol>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">WHY LOW RESISTANCE</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.lowResistance?.title ?? ""}</h2>
    </div>
    <p class="inst4-route__statement">${civicOrderismConfig.lowResistance?.judgment ?? ""}</p>
    <p class="inst4-route__actor-line">官僚、企业、地方政府、军警系统、普通家庭、既有利益群体 —— 他们都会判断：改变以后，我会失去什么？</p>
    <ul class="inst4-route__chips">
      ${(civicOrderismConfig.lowResistance?.actors ?? []).map((actor) => `<li>${actor}</li>`).join("")}
    </ul>
    <p class="inst4-route__quote">${civicOrderismConfig.lowResistance?.conclusion ?? ""}</p>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">ORGANIZATION</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.organization?.title ?? ""}</h2>
    </div>
    <p class="inst4-route__statement">${civicOrderismConfig.organization?.judgment ?? ""}</p>
    <ul class="inst4-route__list">
      ${(civicOrderismConfig.organization?.capabilities ?? []).map((capability) => `<li>${capability}</li>`).join("\n")}
    </ul>
    <p class="inst4l-link"><a href="${civicOrderismConfig.organization?.entryHref ?? ""}">${civicOrderismConfig.organization?.entryLabel ?? "了解当前组织工作"} <span aria-hidden="true">→</span></a></p>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">WHAT KIND OF STATE</p>
      <h2 class="inst4l-section__title">${civicOrderismConfig.state?.title ?? ""}</h2>
    </div>
    <div class="inst4-route__state-grid">
      ${(civicOrderismConfig.state?.principles ?? [])
        .map(
          (principle) => `<div class="inst4-route__state-item"><h3>${principle.name}</h3><p>${principle.desc}</p></div>`,
        )
        .join("\n")}
    </div>
    <p class="inst4-route__closing">${civicOrderismConfig.state?.closing ?? ""}</p>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">READING MAP</p>
      <h2 class="inst4l-section__title">从哪里开始理解公民秩序主义？</h2>
      <p class="inst4l-section__desc">围绕总论，按五个阅读阶段组织全部正式文章。每一阶段只展示代表文章，其余进入“查看这一主题的全部研究”。</p>
    </div>
    ${civicReadingStages
      .map(
        (stage) => `<div class="inst4-route__readstage">
      <div class="inst4-route__readstage-head">
        <p class="inst4-eyebrow">${stage.num}</p>
        <h3 class="inst4-route__readstage-title">${stage.name}</h3>
        <p class="inst4-route__readstage-desc">${stage.desc}</p>
      </div>
      ${inst4lRows(
        stage.repItems.map((article) => ({
          href: `/${article.slug}`,
          meta: "代表文章",
          title: article.title,
          desc: article.summary || "",
        })),
      )}
      ${
        stage.extItems.length
          ? `<details class="china-analysis-more"><summary>查看这一主题的全部研究（${stage.extItems.length}）</summary>${inst4lRows(
              stage.extItems.map((article) => ({
                href: `/${article.slug}`,
                meta: "延伸阅读",
                title: article.title,
                desc: article.summary || "",
              })),
            )}</details>`
          : ""
      }
    </div>`,
      )
      .join("\n")}
  </section>

  <section class="inst4l-section inst4-route__final">
    <p class="inst4-route__statement">${civicOrderismConfig.final?.statement ?? ""}</p>
    <p class="inst4-route__big">${civicOrderismConfig.final?.big ?? ""}</p>
    <p class="inst4-route__final-line">公民秩序主义选择提前准备。</p>
    ${(civicOrderismConfig.final?.closing ?? []).map((line) => `<p class="inst4-route__final-line">${line}</p>`).join("\n")}
    <div class="inst4-route__cta">
      <a href="${civicOverviewArticle ? `/${civicOverviewArticle.slug}` : "/civic-orderism/civic-orderism-overview"}">阅读总论 <span aria-hidden="true">→</span></a>
      <a href="${civicOrderismConfig.organization?.entryHref ?? ""}">了解组织工作 <span aria-hidden="true">→</span></a>
    </div>
  </section>
</div>`,
);

writeInstitutionalContent(
  "preparation.md",
  `${yamlFrontmatter({ title: "北美非营利法人及首届董事会筹备", description: "公民秩序主义正在为正式出版、政治与治理研究、公共传播、人才协作和数字资产保护建立依法运行的承接结构。", contentType: "筹备页面", date: "2026-07-19", updated: "2026-08-11" })}

<div class="inst4 inst4l inst4l-work">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">CURRENT WORK</p>
    <h1 class="inst4l-title">北美非营利法人及<br>首届董事会筹备</h1>
    <p class="inst4l-lead">公民秩序主义正在为正式出版、政治与治理研究、公共传播、人才协作和数字资产保护建立依法运行的承接结构。现阶段同时推进北美非营利法人和首届董事会的前期准备。</p>
    <p class="inst4l-status">当前处于北美非营利法人及首届董事会前期筹备阶段，${organization.statusLabels.registration}，${organization.statusLabels.board}。</p>
  </section>

  ${inst4lSection(
    "为什么现在",
    "为什么现在进入组织建设",
    `<p>政治转型不仅需要观点，也需要能够承担法律、财务、人员与长期政治责任的组织。公民秩序主义当前正在推进北美非营利法人及首届董事会筹备，从理论表达进入组织基础建设阶段。</p>
<p>现阶段重点是理论建设、公共传播、专业协作网络建设和北美非营利组织筹备，而不是追求短期声势或迅速扩张成员。</p>`,
  )}

  <div class="inst4l-grid2">
    ${inst4lSection(
      "为什么需要法人",
      "让公共事业不依赖个人",
      `<p>法人不是目的，而是明确责任、保护公共资产、建立持续治理和依法开展工作的基础设施。</p>
<ul class="inst4l-checklist"><li><strong>治理可持续</strong><span>以章程、董事会、授权和记录制度代替个人化管理。</span></li><li><strong>责任可识别</strong><span>明确谁能够决策、谁承担监督、谁对财务和公共资产负责。</span></li><li><strong>资产可保护</strong><span>长期管理理论成果、品牌、域名、网站、账号、档案与出版物。</span></li></ul>`,
    )}

    ${inst4lSection(
      "为什么需要董事会",
      "让方向与责任受到明确监督",
      `<p>董事会不是象征性头衔，而是非营利法人的治理机构。首届董事需要共同建立组织最初的责任边界和工作规则。</p>
<ul class="inst4l-checklist"><li><strong>守护公共使命</strong><span>确保研究、出版与组织工作持续服务于长期公共目的。</span></li><li><strong>承担法定责任</strong><span>依照最终注册法域的法律要求，对重大决策、合规与监督承担责任。</span></li><li><strong>保护组织资产</strong><span>监督财务、知识产权、域名、网站、账号、档案和其他公共资产。</span></li></ul>`,
      "治理责任，不是荣誉头衔。",
    )}
  </div>

  ${inst4lSection(
    "当前工作",
    "先建立规则，再扩大参与",
    `<ol class="inst4l-steps">
<li><span>01</span><div><strong>明确宗旨与业务范围</strong><p>研究适合的法人定位、公共目的和合规边界。</p></div></li>
<li><span>02</span><div><strong>选择注册法域</strong><p>比较加拿大及北美相关法律环境；目前尚未确定具体法域。</p></div></li>
<li><span>03</span><div><strong>制定章程与组织附例</strong><p>明确董事会、法定成员、授权、监督和利益冲突规则。</p></div></li>
<li><span>04</span><div><strong>建立内部制度</strong><p>准备财务、档案、隐私、信息安全和知识产权制度。</p></div></li>
<li><span>05</span><div><strong>识别首届董事候选人</strong><p>现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格。</p></div></li>
<li><span>06</span><div><strong>完成法律程序</strong><p>在制度和人员准备成熟后，再依法申请注册并产生治理机构。</p></div></li>
</ol>`,
    "当前处于前期筹备、沟通与框架建设阶段。",
  )}

  ${inst4lSection(
    "组织边界",
    "筹备不等于已经成立",
    `<p>截至目前，北美非营利法人尚未依法成立，具体注册法域尚未确定，首届董事会尚未依法产生。本站所称“法人筹备”和“董事会筹备”仅描述正在进行的准备工作，不表示已经取得任何法人、慈善或免税资格。</p>
<p><strong>参与筹备不自动产生董事身份或治理权限。</strong>董事、法定成员、官方代表及其他正式治理职务，均须在制度准备完成后，依照适用法律、章程与正式程序产生。</p>`,
  )}

  ${inst4lSection("正式筹备文件", "正式文件", inst4lDocBlock())}

  ${inst4lSection(
    "建立联系",
    "进一步了解或建立联系",
    `<p>如果希望了解法人筹备、首届董事会责任或专业协作边界，请通过电子邮件联系。现阶段不设置即时社群入口。</p>
${inst4lContactBlock()}`,
    "当前正在识别潜在首届董事候选人，并建立专业协作联系。",
  )}
</div>`,
);

/* Phase 2A.5 — 解析中共 editorial research index prototype */
const chinaSectionConfig = sectionByName.get("解析中共");
const chinaCoreJudgment = chinaSectionConfig?.coreJudgment ?? "";
const chinaOverviewArticle = chinaAnalysis.overview
  ? articleBySlug.get(chinaAnalysis.overview)
  : undefined;
if (chinaAnalysis.overview && !chinaOverviewArticle) {
  throw new Error(
    `China analysis overview article does not exist: ${chinaAnalysis.overview}`,
  );
}
const chinaOverviewRows = chinaOverviewArticle
  ? [
      {
        meta: "总论",
        title: chinaOverviewArticle.title,
        desc: chinaOverviewArticle.summary,
        href: `/${chinaOverviewArticle.slug}`,
      },
    ]
  : [];
const chinaModelRows = (chinaAnalysis.models ?? []).map((model) => ({
  href: model.href ?? `/${model.article}`,
  meta: "",
  title: model.name,
  desc: model.description || "",
}));
const chinaStageBlocks = (chinaAnalysis.stages ?? []).map((stage) => {
  const featuredItems = (stage.featured ?? [])
    .map((slug) => articleBySlug.get(slug))
    .filter((article) => article?.status === "published");
  const moreItems = (stage.slugs ?? [])
    .map((slug) => articleBySlug.get(slug))
    .filter((article) => article?.status === "published");
  return {
    num: stage.num,
    title: stage.title,
    judgment: stage.judgment,
    model: stage.model,
    finalModel: stage.finalModel ?? "",
    featuredRows: featuredItems.map((article) => ({
      href: `/${article.slug}`,
      meta: "代表研究",
      title: article.title,
      desc: article.summary || "",
    })),
    moreRows: moreItems.map((article) => ({
      href: `/${article.slug}`,
      meta: "本阶段研究",
      title: article.title,
      desc: article.summary || "",
    })),
  };
});
const chinaTopicBlocks = (chinaAnalysis.topics ?? []).map((topic) => {
  const items = (topic.slugs ?? [])
    .map((slug) => articleBySlug.get(slug))
    .filter((article) => article?.status === "published");
  return {
    name: topic.name,
    desc: topic.description || "",
    href: topic.href,
    count: items.length,
    rows: items.slice(0, 3).map((article) => ({
      href: `/${article.slug}`,
      meta: "",
      title: article.title,
      desc: article.summary || "",
    })),
  };
});
function inst4lStageSection(stage) {
  const featured = inst4lRows(stage.featuredRows);
  const more = stage.moreRows.length
    ? `<details class="china-analysis-more"><summary>查看这一阶段的全部研究（${stage.moreRows.length}）</summary>${inst4lRows(stage.moreRows)}</details>`
    : `<p class="inst4l-link"><a href="/articles/all">浏览全部解析中共研究 <span aria-hidden="true">→</span></a></p>`;
  const model = stage.finalModel
    ? `<p class="inst4l-stage__model">${stage.model}</p><p class="inst4l-stage__model inst4l-stage__model--final">${stage.finalModel}</p>`
    : `<p class="inst4l-stage__model">${stage.model}</p>`;
  return `<section class="inst4l-section inst4l-stage" id="china-stage-${stage.num}">
  <div class="inst4l-section__head">
    <p class="inst4-eyebrow">${stage.num}</p>
    <h2 class="inst4l-section__title">${stage.title}</h2>
  </div>
  <p class="inst4l-stage__judgment">${stage.judgment}</p>
  ${model}
  ${featured}
  ${more}
</section>`;
}
const chinaItems = [...new Set(chinaAnalysisSlugs)]
  .map((slug) => articleBySlug.get(slug))
  .filter((article) => article?.status === "published");
const chinaLatest = [...chinaItems].sort(
  (a, b) =>
    b.updated.localeCompare(a.updated) ||
    a.title.localeCompare(b.title, "zh-CN"),
)[0]?.updated;

writeInstitutionalContent(
  "china/index.md",
  `${yamlFrontmatter({ title: "解析中共", description: chinaSectionConfig?.description ?? "", contentType: "栏目" })}

<div class="inst4 inst4l inst4l-china">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">UNDERSTANDING THE PRESENT</p>
    <h1 class="inst4l-title">解析中共</h1>
    <p class="inst4l-lead">${chinaSectionConfig?.description ?? ""}</p>
    <div class="inst4l-hero__judgments">
      <p class="inst4l-statement">${chinaAnalysis.heroJudgment ?? ""}</p>
      <p class="inst4l-statement inst4l-statement--result">${chinaAnalysis.resultJudgment ?? ""}</p>
    </div>
    <p class="inst4l-status">${chinaItems.length} 篇研究 · 更新至 ${chinaLatest || "2026-07-19"}</p>
  </section>

  ${chinaOverviewRows.length ? `<section class="inst4l-section inst4l-pillar">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">总论 / 核心阅读</p>
      <h2 class="inst4l-section__title"><a href="${chinaOverviewRows[0].href}">${chinaOverviewRows[0].title}</a></h2>
      <p class="inst4l-section__desc">公民秩序主义关于中共的总论</p>
    </div>
    <p class="inst4l-pillar__summary">${chinaOverviewRows[0].desc}</p>
    <p class="inst4l-pillar__cta"><a href="${chinaOverviewRows[0].href}">阅读总论 <span aria-hidden="true">→</span></a></p>
  </section>` : ""}

  ${chinaStageBlocks.map(inst4lStageSection).join("\n")}

  <section class="inst4l-section inst4l-tools">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">分析工具</p>
      <h2 class="inst4l-section__title">进一步理解的工具箱</h2>
      <p class="inst4l-section__desc">以下概念用于进一步理解中共具体政治现象。它们不是与总论平行的另一套理论，而是总论模型中的分析工具。</p>
    </div>
    <div class="inst4l-tools">${chinaModelRows
      .map(
        (model) => `<a class="inst4l-tool" href="${model.href}"><strong>${model.title}</strong><span>${model.desc}</span></a>`,
      )
      .join("\n")}</div>
  </section>

  <section class="inst4l-section inst4l-research-topics">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">专题研究</p>
      <h2 class="inst4l-section__title">按领域深入</h2>
      <p class="inst4l-section__desc">四阶段回答“如何理解中共”，专题研究回答“我想研究某个具体领域”。这是次级研究索引。</p>
    </div>
    <div class="inst4l-topic-grid">
      ${chinaTopicBlocks
        .map(
          (topic) => `<a class="inst4l-topic" href="${topic.href}"><strong>${topic.name}</strong><span>${topic.desc}</span><small>${topic.count} 篇研究</small></a>`,
        )
        .join("\n")}
    </div>
  </section>

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">全部研究</p>
      <h2 class="inst4l-section__title">浏览全部解析中共文章</h2>
      <p class="inst4l-section__desc">进入独立文章索引，按专题与概念继续筛选阅读。</p>
    </div>
    <p class="inst4l-link"><a href="/articles/all">进入文章索引 <span aria-hidden="true">→</span></a></p>
  </section>
</div>`,
);

/* Phase 2B — 中国未来 landing */
const chinaFutureSectionConfig = sectionByName.get("中国未来");
const chinaFutureArticles = articles.filter(
  (article) =>
    article.section === "中国未来" && article.status === "published",
);
const chinaFutureLatest = [...chinaFutureArticles].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)[0]?.updated;
const chinaFutureIssues = [
  {
    name: "政治经济收缩",
    desc: "政治整肃与财政、经济、文化收缩相互推进，正在压缩中国继续扩张的空间。",
    slugs: ["china-stage/three-cleans-era-political-economic-cultural-contraction"],
  },
  {
    name: "改革窗口与二次改开",
    desc: "中国是否还有第二次改革开放的可能，取决于政治平衡能否承受新一轮改革。",
    slugs: ["china-stage/ccp-second-reform-opening-possibility"],
  },
  {
    name: "产业、财政与国家能力",
    desc: "制造业与财政体系的运行惯性，决定国家在收缩中仍然维持运转的能力边界。",
    slugs: ["china-stage/china-manufacturing-cannot-stop"],
  },
].map((issue, index) => ({
  ...issue,
  num: String(index + 1).padStart(2, "0"),
  rows: issue.slugs
    .map((slug) => articleBySlug.get(slug))
    .filter((article) => article?.status === "published")
    .map((article) => ({
      href: `/${article.slug}`,
      meta: "代表研究",
      title: article.title,
      desc: article.summary || "",
    })),
}));

writeInstitutionalContent(
  "china-future/index.md",
  `${yamlFrontmatter({ title: "中国未来", description: "如果旧政治秩序发生变化，中国接下来如何继续运行？讨论政治转型之后的国家连续性、治理秩序与长期政治稳定。", contentType: "栏目" })}

<div class="inst4 inst4l inst4l-future">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">PREPARING THE FUTURE</p>
    <h1 class="inst4l-title">中国未来</h1>
    <p class="inst4l-lead">如果旧政治秩序发生变化，中国接下来如何继续运行？这里讨论的不是新闻预测，而是政治转型之后的国家连续性、治理秩序、制度安排与长期政治稳定。</p>
    <p class="inst4l-status">${chinaFutureArticles.length} 篇研究 · ${chinaFutureIssues.length} 个核心议题 · 更新至 ${chinaFutureLatest || "2026-08-23"}</p>
  </section>

  ${inst4lSection("CORE JUDGMENT", "核心判断", `<p class="inst4l-statement">${chinaFutureSectionConfig?.coreJudgment ?? ""}</p>`)}

  ${chinaFutureIssues
    .map((issue) =>
      inst4lSection(
        issue.num,
        issue.name,
        inst4lRows(issue.rows) +
          `<p class="inst4l-link"><a href="/articles/all">查看该议题全部研究 <span aria-hidden="true">→</span></a></p>`,
        issue.desc,
      ),
    )
    .join("\n")}

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">全部研究</p>
      <h2 class="inst4l-section__title">浏览全部中国未来研究</h2>
      <p class="inst4l-section__desc">进入独立文章索引，继续浏览转型窗口与国家治理研究。</p>
    </div>
    <p class="inst4l-link"><a href="/articles/all">进入文章索引 <span aria-hidden="true">→</span></a></p>
  </section>
</div>`,
);
/* Phase 2B — Topic Index */
const topicIndexRows = publicTopics.map((topic, index) => ({
  href: "/topics/" + topic.slug,
  meta:
    "专题 " +
    String(index + 1).padStart(2, "0") +
    " · " +
    getPrimaryTopicArticles(articles, topic.slug).length +
    " 篇研究",
  title: topic.name,
  desc: topic.coreJudgment || topic.description || "",
}));
const topicsIndexBody = inst4lSection(
  "专题索引",
  "正在研究的持续性政治问题",
  inst4lRows(topicIndexRows),
  "研究专题组织的是问题本身，而不是文章分类。",
);

writeInstitutionalContent(
  "topics/index.md",
  `${yamlFrontmatter({ title: "研究专题", description: "围绕持续性政治问题组织的长期研究线索。", contentType: "专题索引" })}

<div class="inst4 inst4l inst4l-topics">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">RESEARCH TOPICS</p>
    <h1 class="inst4l-title">研究专题</h1>
    <p class="inst4l-lead">围绕持续性政治问题组织长期研究，而不是按照新闻事件分类文章。每个专题对应一组正在被持续研究的问题。</p>
  </section>

  ${topicsIndexBody}
</div>`,
);

/* Phase 2B — Topic Prototype: 官僚系统 */
const bureauTopicConfig = topicBySlug.get("bureaucratic-system");
const bureauTopicArticles = getPrimaryTopicArticles(
  articles,
  "bureaucratic-system",
);
const bureauTopicRecommended = (bureauTopicConfig?.recommended ?? [])
  .map((slug) => articleBySlug.get(slug))
  .filter(isEligibleArticle)
  .slice(0, 5);
const bureauTopicConcepts = (bureauTopicConfig?.concepts ?? [])
  .map((slug) => conceptBySlug.get(slug))
  .filter((concept) => concept && publicConceptSlugs.has(concept.slug))
  .slice(0, 3);
const bureauTopicLatest = [...bureauTopicArticles].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)[0]?.updated;

writeInstitutionalContent(
  "topics/bureaucratic-system.md",
  `${yamlFrontmatter({ title: "官僚系统", description: bureauTopicConfig?.description ?? "", contentType: "专题" })}

<div class="inst4 inst4l inst4l-topic">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">RESEARCH TOPIC</p>
    <h1 class="inst4l-title">官僚系统</h1>
    <p class="inst4l-lead">${bureauTopicConfig?.description ?? ""}</p>
    <p class="inst4l-status">${bureauTopicArticles.length} 篇研究 · 更新至 ${bureauTopicLatest || "2026-08-23"}</p>
  </section>

  ${inst4lSection("CORE JUDGMENT", "专题核心判断", `<p class="inst4l-statement">${bureauTopicConfig?.coreJudgment ?? ""}</p>`)}

  ${inst4lSection("为什么重要", "官僚系统是理解中共治理的核心切面", `<p>整肃、问责、避责与多头治理相互叠加，使官僚系统的行为持续偏离公共任务：责任被层层下压，授权却同步收缩，主动决策的个人成本高于等待、请示和留痕。</p>
<p>当这种风险结构覆盖整个体系时，官僚系统会从执行转向自保，形成系统性休克。理解这一机制，是理解中共治理能力为何与组织规模脱节的关键。</p>`)}

  ${inst4lSection(
    "关键研究",
    "代表研究",
    inst4lRows(
      bureauTopicRecommended.map((article) => ({
        href: `/${article.slug}`,
        meta: "关键研究",
        title: article.title,
        desc: article.summary || "",
      })),
    ),
    "最能说明官僚系统行为变化的核心研究。",
  )}

  ${inst4lSection(
    "相关概念",
    "相关概念",
    inst4lRows(
      bureauTopicConcepts.map((concept) => ({
        href: `/concepts/${concept.slug}`,
        meta: "概念",
        title: concept.name,
        desc: concept.definition || "",
      })),
    ),
    "用于理解官僚系统行为的核心概念。",
  )}

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">全部研究</p>
      <h2 class="inst4l-section__title">浏览全部官僚系统研究</h2>
      <p class="inst4l-section__desc">进入独立文章索引，继续筛选与阅读。</p>
    </div>
    <p class="inst4l-link"><a href="/articles/all">浏览该专题全部文章 <span aria-hidden="true">→</span></a></p>
  </section>
</div>`,
);

/* Phase 2B.1 — Concept Taxonomy */
const conceptTypeBySlug = {
  "party-state-stress": "FRAMEWORK",
  "bureaucratic-shock": "STATE",
  "order-evaporation": "PROCESS",
  "organizational-credit": "CONCEPT",
  "political-control-governance-divergence": "RELATION",
  "high-fragility": "STATE",
  "security-purge-recentralization-cycle": "MODEL",
  "security-recentralization": "PROCESS",
  "three-cleans-era": "PERIOD",
  "fiscal-debt": "PROCESS",
  "political-debt": "PROCESS",
  "second-reform": "CONCEPT",
  "state-system-upgrade": "CONCEPT",
  "low-friction-governance": "CONCEPT",
};
const conceptGroups = [
  {
    label: "A",
    title: "组织诊断",
    desc: "回答现有政治组织发生了什么：结构状态与组织反应。",
    slugs: [
      "party-state-stress",
      "bureaucratic-shock",
      "order-evaporation",
      "organizational-credit",
      "political-control-governance-divergence",
      "high-fragility",
    ],
  },
  {
    label: "B",
    title: "阶段与循环",
    desc: "回答这些变化如何演进：政治周期与运行阶段。",
    slugs: [
      "security-purge-recentralization-cycle",
      "security-recentralization",
      "three-cleans-era",
      "fiscal-debt",
      "political-debt",
    ],
  },
  {
    label: "C",
    title: "转型与治理",
    desc: "回答政治转型与未来治理如何被理解。",
    slugs: ["second-reform", "state-system-upgrade", "low-friction-governance"],
  },
];
const conceptGroupBodies = conceptGroups.map((group) =>
  inst4lSection(
    group.label,
    group.title,
    inst4lRows(
      group.slugs
        .map((slug) => conceptBySlug.get(slug))
        .filter(Boolean)
        .map((concept) => ({
          href: "/concepts/" + concept.slug,
          meta: conceptTypeBySlug[concept.slug] ?? "CONCEPT",
          title: concept.name,
          desc: concept.definition || "",
        })),
    ),
    group.desc,
  ),
);
const supportingConceptRows = [
  { slug: "political-route", type: "ROUTE" },
  { slug: "nonviolent-transition", type: "PRINCIPLE" },
  { slug: "ruling-techniques", type: "TOPIC" },
  { slug: "crisis-management", type: "SUPPORTING" },
]
  .map((item) => ({ item, concept: conceptBySlug.get(item.slug) }))
  .filter(({ concept }) => concept)
  .map(({ item, concept }) => ({
    href: "/concepts/" + concept.slug,
    meta: item.type,
    title: concept.name,
    desc: concept.definition || "",
  }));
const supportingConceptsBody = inst4lSection(
  "其他",
  "保留页面、退出核心概念索引的对象",
  inst4lRows(supportingConceptRows),
  "以下对象保留独立页面，但属于路线、原则、专题或辅助概念，不再作为核心分析概念平铺。",
);

writeInstitutionalContent(
  "concepts/index.md",
  `${yamlFrontmatter({ title: "核心概念", description: "公民秩序主义使用什么概念理解中国政治变化与国家秩序。", contentType: "概念索引" })}

<div class="inst4 inst4l inst4l-concepts">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">CORE CONCEPTS</p>
    <h1 class="inst4l-title">核心概念</h1>
    <p class="inst4l-lead">研究专题回答正在研究什么问题；核心概念回答公民秩序主义使用什么概念理解这些问题。概念按分析功能分组，而不是全部平铺为同一层级。</p>
  </section>

  ${conceptGroupBodies.join("\n")}

  ${supportingConceptsBody}
</div>`,
);

/* Phase 2B — Concept Prototype: 官僚系统休克 */
const bureauShockConfig = conceptBySlug.get("bureaucratic-shock");
const bureauShockArticles = (bureauShockConfig?.representativeArticles ?? [])
  .map((slug) => articleBySlug.get(slug))
  .filter(isEligibleArticle)
  .slice(0, 4);
const bureauShockRelated = (bureauShockConfig?.related ?? [])
  .map((slug) => conceptBySlug.get(slug))
  .filter((concept) => concept && publicConceptSlugs.has(concept.slug));
const bureauShockManifestationRows = (bureauShockConfig?.manifestations ?? []).map(
  (item, index) => ({
    href: "/articles/all",
    meta: "表现 " + String(index + 1).padStart(2, "0"),
    title: item,
    desc: "",
  }),
);
const bureauShockRelatedRows = bureauShockRelated.map((concept) => ({
  href: "/concepts/" + concept.slug,
  meta: "概念",
  title: concept.name,
  desc: concept.definition || "",
}));
const bureauShockArticleRows = bureauShockArticles.map((article) => ({
  href: "/" + article.slug,
  meta: "代表研究",
  title: article.title,
  desc: article.summary || "",
}));

writeInstitutionalContent(
  "concepts/bureaucratic-shock.md",
  `${yamlFrontmatter({ title: "官僚系统休克", description: bureauShockConfig?.definition ?? "", contentType: "概念" })}

<div class="inst4 inst4l inst4l-concept">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">CORE CONCEPT</p>
    <h1 class="inst4l-title">官僚系统休克</h1>
    <p class="inst4l-lead">${bureauShockConfig?.definition ?? ""}</p>
  </section>

  ${inst4lSection("核心定义", "它是什么", `<p class="inst4l-statement">${bureauShockConfig?.definition ?? ""}</p>
<p>官僚休克描述的不是个别干部懒惰，而是组织激励共同把行动导向最低风险：责任持续下压，必要授权却同步收缩，主动决策的个人成本高于等待、请示和留痕。结果是每个成员都可能作出理性自保选择，系统整体却失去处理现实问题的能力。</p>`)}

  ${inst4lSection("形成机制", "它为什么发生", `<p class="inst4l-statement">${bureauShockConfig?.mechanism ?? ""}</p>
<p>${bureauShockConfig?.explanation ?? ""}</p>`)}

  ${inst4lSection(
    "如何识别",
    "它的现实表现",
    inst4lRows(bureauShockManifestationRows),
    "这些表现共同构成官僚系统从执行转向自保的信号。",
  )}

  ${inst4lSection(
    "相关概念",
    "与其他概念的关系",
    inst4lRows(bureauShockRelatedRows),
    "依据现有概念关系配置，不预设因果链条。",
  )}

  ${inst4lSection(
    "代表研究",
    "相关研究",
    inst4lRows(bureauShockArticleRows),
    "最能体现官僚系统休克机制的研究。",
  )}

  <section class="inst4l-section">
    <div class="inst4l-section__head">
      <p class="inst4-eyebrow">全部研究</p>
      <h2 class="inst4l-section__title">浏览全部相关研究</h2>
      <p class="inst4l-section__desc">进入独立文章索引，继续筛选与阅读。</p>
    </div>
    <p class="inst4l-link"><a href="/articles/all">查看全部相关研究 <span aria-hidden="true">→</span></a></p>
  </section>
</div>`,
);
/* Phase 2B — Reading Map (articles.md): three routes */
const readingMapFiveRows = [
  { href: "/start-here/", meta: "入口", title: "5分钟了解公民秩序主义", desc: "用五个问题建立基础认识。" },
  { href: "/introduction-manual", meta: "入门文本", title: "公民秩序主义介绍手册（在线版）", desc: "系统了解整体框架的简短文本。" },
  { href: "/civic-orderism/peaceful-state-transition", meta: "核心文章", title: "国家如何平稳转轨", desc: "公民秩序主义最核心的一篇路线说明。" },
];
const readingMapThirtyRows = [
  {
    meta: "理解现在",
    title: "解析中共",
    desc: "理解旧政治秩序为什么正在失去持续提供利益、预期与共识的能力。",
    href: "/theory/party-state-structural-failure",
  },
  {
    meta: "准备转轨",
    title: "政治路线",
    desc: "理解为什么和平转轨可能发生，以及如何保持国家连续性。",
    href: "/civic-orderism/peaceful-state-transition",
  },
  {
    meta: "准备未来",
    title: "中国未来",
    desc: "理解政治变化之后国家如何继续运行。",
    href: "/china-stage/ccp-second-reform-opening-possibility",
  },
];
const readingMapDeepRows = [
  { href: "/china/", meta: "研究框架", title: "核心模型与研究框架", desc: "进入解析中共的研究程序。" },
  { href: "/topics/", meta: "研究专题", title: "研究专题", desc: "围绕持续性政治问题组织的研究线索。" },
  { href: "/concepts/", meta: "核心概念", title: "核心概念", desc: "公民秩序主义使用的解释概念。" },
  { href: "/articles/all", meta: "完整研究", title: "全部研究", desc: "按栏目浏览全部已发布文章。" },
];

writeInstitutionalContent(
  "articles.md",
  `${yamlFrontmatter({ title: "阅读地图", description: "第一次来到这里，应该怎么读？三条阅读路线：5分钟、30分钟、深度阅读。", contentType: "索引" })}

<div class="inst4 inst4l inst4l-reading-map">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">READING MAP</p>
    <h1 class="inst4l-title">阅读地图</h1>
    <p class="inst4l-lead">这里不是完整文章目录，而是为第一次来到本站的读者准备的阅读入口。选择一条适合你的路线。</p>
  </section>

  ${inst4lSection(
    "01 · 5分钟",
    "快速知道公民秩序主义是什么",
    inst4lRows(readingMapFiveRows),
    "只提供最少必要入口。",
  )}

  ${inst4lSection(
    "02 · 30分钟",
    "理解完整基本逻辑",
    inst4lRows(readingMapThirtyRows),
    "理解现在 → 准备转轨 → 准备未来。每一步只推荐极少数代表内容。",
  )}

  ${inst4lSection(
    "03 · 深度阅读",
    "进入研究体系",
    inst4lRows(readingMapDeepRows),
    "已经建立基础认识后，按研究框架继续深入。",
  )}
</div>`,
);

/* Phase 2B — Archive Template (articles/all.md) */
const archiveGroups = ["解析中共", "公民秩序主义", "中国未来", "制度设计"]
  .map((name, index) => ({
    num: String(index + 1).padStart(2, "0"),
    name,
    items: articles.filter(
      (article) => article.section === name && article.status === "published",
    ),
  }))
  .filter((group) => group.items.length);
const publishedCount = articles.filter(
  (article) => article.status === "published",
).length;
const archiveSectionBodies = archiveGroups.map((group) =>
  inst4lSection(
    group.num,
    group.name,
    inst4lRows(
      group.items.map((article) => ({
        href: "/" + article.slug,
        meta: article.date || "日期待补",
        title: article.title,
        desc: (article.summary || "").slice(0, 60),
      })),
    ),
    group.items.length + " 篇研究",
  ),
);

writeInstitutionalContent(
  "articles/all.md",
  `${yamlFrontmatter({ title: "全部文章", description: "按栏目浏览公民秩序主义全部已发布研究。", contentType: "文章索引" })}

<div class="inst4 inst4l inst4l-archive">
  <section class="inst4l-hero">
    <p class="inst4-eyebrow">RESEARCH ARCHIVE</p>
    <h1 class="inst4l-title">全部研究</h1>
    <p class="inst4l-lead">按栏目浏览全部已发布研究。需要按问题搜索时，可以使用页面上方的搜索入口。</p>
    <p class="inst4l-status">${publishedCount} 篇研究 · 4 个研究栏目</p>
  </section>

  ${archiveSectionBodies.join("\n")}
</div>`,
);

console.log(
  `Generated V2 architecture for ${articles.length} articles, ${topics.length} topics, and ${concepts.length} concepts.`,
);
