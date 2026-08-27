import fs from "node:fs";
import path from "node:path";
import { getPrimaryTopicArticles } from "./lib/topic-relations.mjs";

const root = path.resolve(".");
const publicDir = path.join(root, "public");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const migration = readJson("content-migration-map.json");
const topics = readJson("data/topics.config.json");
const concepts = readJson("data/concepts.config.json");
const sections = readJson("data/sections.config.json");
const institutionSections = readJson("data/institution-sections.config.json");
const readingSequences = readJson("data/reading-sequences.config.json");
const coreModelsConfig = readJson("data/core-models.config.json");
const organization = readJson("data/organization.config.json");
const navigation = readJson("data/navigation.config.json");
const site = readJson("data/site.config.json");
const topicSlugs = new Set(topics.map((item) => item.slug));
const conceptSlugs = new Set(concepts.map((item) => item.slug));
const coreModelSlugs = new Set(
  coreModelsConfig.models.map((item) => item.slug),
);
const coreModelAssignmentByArticle = new Map(
  coreModelsConfig.articles.map((item) => [item.slug, item]),
);
const sectionNames = new Set(sections.map((item) => item.name));
const institutionSectionIds = new Set(
  institutionSections.map((item) => item.id),
);
const migrationBySlug = new Map(migration.map((item) => [item.slug, item]));
const corePoliticalStatements = migration.filter(
  (item) => item.corePoliticalStatement === true,
);
const INSTITUTIONAL_PROTOTYPE_SLUGS = new Set([
  "china/security-led-governance-model",
  "civic-orderism/peaceful-state-transition",
  "china/what-happens-when-security-becomes-the-top-priority",
  "china/xi-power-centralization",
  "china-stage/ccp-second-reform-opening-possibility",
]);

// All formal articles are now inside the Institutional Article System.
const ALL_ARTICLES_INSTITUTIONAL = true;
const errors = [];
const publicTopics = topics.filter((item) => item.status === "published");
const hiddenTopics = topics.filter((item) => item.status !== "published");
const conceptPublicationStatus = (concept) => concept.publicationStatus;
const formalConcepts = concepts.filter(
  (item) => conceptPublicationStatus(item) === "published",
);
const researchConcepts = concepts.filter(
  (item) => conceptPublicationStatus(item) === "reviewing",
);
const hiddenConcepts = concepts.filter((item) =>
  ["merged", "held"].includes(conceptPublicationStatus(item)),
);
const developmentPlaceholderPatterns = [
  /待人工复核/i,
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bPlaceholder\b/i,
  /Lorem Ipsum/i,
  /Coming Soon/i,
  /临时文本/i,
  /测试文字/i,
];
const legacyEnglishBrands = [["Citizen", "Orderism"].join(" ")];

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
assert(
  corePoliticalStatements.length === 1 &&
    corePoliticalStatements[0]?.slug === site.corePoliticalStatement?.slug &&
    corePoliticalStatements[0]?.articleRole === "core-political-statement",
  "核心政治总论必须唯一，并与站点固定 slug / articleRole 一致",
);
const publicHtml = (slug) => path.join(publicDir, `${slug}.html`);
const publicRouteHtml = (slug) => {
  const flatPath = publicHtml(slug);
  return fs.existsSync(flatPath)
    ? flatPath
    : path.join(publicDir, slug, "index.html");
};
const publicRouteExists = (slug) =>
  slug === "index"
    ? fs.existsSync(path.join(publicDir, "index.html"))
    : fs.existsSync(publicHtml(slug)) ||
      fs.existsSync(path.join(publicDir, slug, "index.html"));
const publicPathExists = (pathname) => {
  const decoded = decodeURI(pathname).replace(/^\//, "").replace(/\/$/, "");
  if (!decoded) return fs.existsSync(path.join(publicDir, "index.html"));
  if (path.extname(decoded)) {
    return fs.existsSync(path.join(publicDir, decoded));
  }
  return publicRouteExists(decoded);
};
const visiblePageText = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

const overviewArticleSource = fs.readFileSync(
  path.join(
    root,
    "content/civic-orderism/what-civic-orderism-solves-if-you-read-only-one.md",
  ),
  "utf8",
);
for (const requiredText of [
  "制度必须具备的基本能力",
  "问题能够进入系统",
  "权力必须留下责任链",
  "行政必须保持执行能力",
  "公民必须拥有持续反馈渠道",
  "制度必须具备纠错与责任更替能力",
]) {
  assert(
    overviewArticleSource.includes(requiredText),
    `入门文章缺少抽象化制度能力：${requiredText}`,
  );
}
for (const forbiddenText of ["委员会", "秘书处", "大议会"]) {
  assert(
    !overviewArticleSource.includes(forbiddenText),
    `入门文章仍包含具体机构设计：${forbiddenText}`,
  );
}
const walkHtmlFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  });

const chinaAnalysisConfig = JSON.parse(
  fs.readFileSync(path.join(root, "data/china-analysis.config.json"), "utf8"),
);
const chinaPageHtml = fs.readFileSync(publicRouteHtml("china"), "utf8");
const chinaPageSource = fs.readFileSync(
  path.join(root, "content/china/index.md"),
  "utf8",
);
const expectedChinaStageCounts = [2, 3, 3, 3];
for (const [index, stage] of chinaAnalysisConfig.stages.entries()) {
  const sectionStart = chinaPageSource.indexOf(
    `inst4l-section__title">${stage.title}`,
  );
  assert(
    sectionStart !== -1,
    `解析中共缺少四阶段区块：${stage.title}`,
  );
  const sectionEnd =
    chinaPageSource.indexOf('inst4l-section__title">', sectionStart + 1) === -1
      ? chinaPageSource.length
      : chinaPageSource.indexOf('inst4l-section__title">', sectionStart + 1);
  const sectionSource = chinaPageSource.slice(sectionStart, sectionEnd);
  assert(
    chinaPageSource.includes(`id="china-stage-${stage.num}"`) &&
      chinaPageSource.includes(`class="inst4-eyebrow">${stage.num}`),
    `解析中共四阶段编号异常：${stage.title}`,
  );
  assert(
    sectionSource.includes(stage.judgment),
    `解析中共四阶段缺少核心判断：${stage.title}`,
  );
  assert(
    sectionSource.includes(stage.model),
    `解析中共四阶段缺少模型链：${stage.title}`,
  );
  const renderedFeatured = [
    ...sectionSource.matchAll(/<a class="inst4l-row" href="\/([^"]+)">/g),
  ]
    .map((match) => match[1])
    .filter((slug) => (stage.featured ?? []).includes(slug));
  assert(
    JSON.stringify(renderedFeatured) === JSON.stringify(stage.featured ?? []),
    `解析中共四阶段代表作顺序与配置不一致：${stage.title}`,
  );
  assert(
    (stage.featured ?? []).length === expectedChinaStageCounts[index],
    `解析中共四阶段代表作数量不符合定型配置：${stage.title}`,
  );
}
for (const model of chinaAnalysisConfig.models) {
  assert(
    chinaPageSource.includes(`href="${model.href}"`) &&
      chinaPageSource.includes(model.name) &&
      chinaPageSource.includes(model.description),
    `解析中共缺少分析工具：${model.name}`,
  );
}
assert(
  JSON.stringify(chinaAnalysisConfig.models.map((model) => model.name)) ===
    JSON.stringify([
      "党国应力",
      "官僚系统休克",
      "秩序蒸发",
      "组织信用",
      "安全化—清洗—再集中—再失灵模型",
      "政治控制—治理效能背离",
    ]),
  "解析中共分析工具未保持六个相互独立的概念",
);
for (const topic of chinaAnalysisConfig.topics) {
  assert(
    chinaPageSource.includes(`inst4l-topic" href="${topic.href}"`) &&
      chinaPageSource.includes(topic.name) &&
      chinaPageSource.includes(topic.description),
    `解析中共缺少专题研究入口：${topic.name}`,
  );
}
assert(
  chinaPageSource.includes(chinaAnalysisConfig.heroJudgment) &&
    chinaPageSource.includes(chinaAnalysisConfig.resultJudgment),
  "解析中共 Hero 未包含主判断与结果判断",
);
assert(
  chinaPageSource.includes("inst4l-pillar") &&
    chinaPageSource.includes("阅读总论"),
  "解析中共总论 Pillar 入口缺失",
);
assert(
  chinaPageHtml.includes("inst4l") &&
    !chinaPageHtml.includes("china-model-grid") &&
    !chinaPageHtml.includes("china-judgment-card") &&
    !chinaPageHtml.includes("knowledge-card"),
  "解析中共仍使用旧 Card Grid 结构",
);
assert(
  chinaPageSource.includes("浏览全部解析中共文章") &&
    chinaPageSource.includes('href="/articles/all"'),
  "解析中共页面未保留全部文章入口",
);
assert(
  chinaPageSource.includes("分析工具") &&
    chinaPageSource.includes("专题研究"),
  "解析中共未明确区分分析工具与专题研究",
);

assert(
  new Set(migration.map((item) => item.slug)).size === migration.length,
  "迁移映射存在重复 slug",
);
for (const article of migration) {
  const isInstitutionalPrototype = ALL_ARTICLES_INSTITUTIONAL;
  const isCorePoliticalStatement = article.corePoliticalStatement === true;
  assert(
    fs.existsSync(publicHtml(article.slug)),
    `原文章 URL 未生成：/${article.slug}`,
  );
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(article.date),
    `文章发布日期不是标准日期：${article.slug} -> ${article.date}`,
  );
  const articleHtml = fs.readFileSync(publicHtml(article.slug), "utf8");
  const relatedReadingPosition = articleHtml.indexOf(
    "data-article-continuation=",
  );
  const knowledgeContextPosition = articleHtml.indexOf(
    'class="article-knowledge"',
  );
  const endingCtaPosition = articleHtml.indexOf('class="article-cta"');
  const recommendationHrefs = [
    ...articleHtml.matchAll(
      /<a class="article-continuation-card"[^>]*href="([^"]+)"/g,
    ),
  ].map((match) => match[1]);
  const recommendationSlugs = recommendationHrefs.map((href) =>
    decodeURI(
      new URL(
        href,
        `https://civicorderism.com/${article.slug}`,
      ).pathname.replace(/^\//, ""),
    ),
  );
  const readingPathBlock = articleHtml.match(
    /continue-reading__nav[^>]*>([\s\S]*?)<\/nav>/,
  )?.[1];
  const readingPathSlugs = readingPathBlock
    ? [...readingPathBlock.matchAll(/data-slug="([^"]+)"/g)].map(
        (match) => match[1],
      )
    : [];
  const hasCoreModelRecommendations = articleHtml.includes(
    "article-continuation--model",
  );
  const recommendationLimit = hasCoreModelRecommendations ? 4 : 3;
  assert(recommendationSlugs.length <= 3, `推荐阅读超过 3 篇：${article.slug}`);
  assert(
    recommendationSlugs.length === 0 || recommendationSlugs.length >= 1,
    `推荐阅读少于 1 篇：${article.slug}`,
  );
  // Regression: a Related Research heading must never render without at
  // least one valid related article, and cards never render without the
  // heading. This keeps the whole section conditional on valid data.
  const hasContinuationHeading = articleHtml.includes(
    'class="article-continuation__heading"',
  );
  const relatedCardCount =
    (articleHtml.match(/class="article-continuation-card"/g) ?? []).length;
  assert(
    hasContinuationHeading === (relatedCardCount > 0),
    `Related Research 标题与文章数量不一致（空 Section）：${article.slug}`,
  );
  assert(
    new Set(recommendationSlugs).size === recommendationSlugs.length,
    `推荐阅读出现重复：${article.slug}`,
  );
  assert(
    !recommendationSlugs.includes(article.slug),
    `推荐阅读包含当前文章：${article.slug}`,
  );
  assert(
    !articleHtml.includes("上一篇：无") && !articleHtml.includes("下一篇：无"),
    `文章阅读路径显示空边界：${article.slug}`,
  );
  assert(
    (articleHtml.includes('aria-label="继续阅读"') ||
      (isCorePoliticalStatement &&
        articleHtml.includes('aria-label="核心政治总论阅读路径"')) ||
      (isInstitutionalPrototype && articleHtml.includes("继续研究"))) &&
      (articleHtml.includes("相关文章") ||
        isInstitutionalPrototype ||
        (articleHtml.includes("继续理解这个模型") &&
          articleHtml.includes("从判断进入路线"))) &&
      articleHtml.includes("分钟阅读"),
    `文章缺少统一继续阅读、相关文章或预计阅读时间：${article.slug}`,
  );
  assert(
    isInstitutionalPrototype
      ? relatedReadingPosition > -1 &&
          knowledgeContextPosition > -1 &&
          knowledgeContextPosition < relatedReadingPosition
      : relatedReadingPosition > -1 &&
          relatedReadingPosition < knowledgeContextPosition &&
          knowledgeContextPosition < endingCtaPosition,
    `文章尾部顺序不是继续阅读 → 知识关联 → 组织 CTA：${article.slug}`,
  );
  assert(
    (articleHtml.includes('aria-label="继续阅读"') ||
      (isCorePoliticalStatement &&
        articleHtml.includes('aria-label="核心政治总论阅读路径"'))) &&
      articleHtml.includes('class="article-knowledge"'),
    `文章尾部未同时生成继续阅读与知识关联：${article.slug}`,
  );
  assert(
    isInstitutionalPrototype ||
      (!articleHtml.includes("article-continuation-card__summary") &&
        !articleHtml.includes("article-continuation-card__meta")),
    `文章相关推荐仍包含长摘要或文章元信息：${article.slug}`,
  );
  assert(
    readingPathSlugs.every((slug) => !recommendationSlugs.includes(slug)),
    `继续阅读与相邻阅读路径重复：${article.slug}`,
  );
  for (const recommendedSlug of recommendationSlugs) {
    const target = migrationBySlug.get(recommendedSlug);
    assert(
      Boolean(target),
      `推荐阅读目标未知：${article.slug} -> ${recommendedSlug}`,
    );
    assert(
      target?.status === "published" && !target?.needsReview,
      `推荐阅读包含未确认、草稿或归档文章：${article.slug} -> ${recommendedSlug}`,
    );
  }
  assert(
    sectionNames.has(article.section) || isCorePoliticalStatement,
    `未知一级栏目：${article.slug} -> ${article.section}`,
  );
  if (article.section === "制度设计") {
    assert(
      article.institutionSection === undefined ||
        institutionSectionIds.has(article.institutionSection),
      `制度设计文章包含未知制度模块：${article.slug} -> ${article.institutionSection}`,
    );
  }
  if (!article.needsReview) {
    assert(
      article.topics.length <= 2,
      `专题超过 2 个：${article.slug} -> ${article.topics.length}`,
    );
    assert(
      article.concepts.length <= 6,
      `核心概念超过 6 个：${article.slug} -> ${article.concepts.length}`,
    );
  }
  const coreModelAssignment = coreModelAssignmentByArticle.get(article.slug);
  assert(
    article.primaryCoreModel ===
      (coreModelAssignment?.primaryCoreModel ?? null),
    `文章主模型与配置不一致：${article.slug}`,
  );
  assert(
    JSON.stringify(article.associatedCoreModels) ===
      JSON.stringify(coreModelAssignment?.associatedCoreModels ?? []),
    `文章关联模型与配置不一致：${article.slug}`,
  );
  if (article.primaryCoreModel) {
    assert(
      coreModelSlugs.has(article.primaryCoreModel),
      `文章包含未知主模型：${article.slug} -> ${article.primaryCoreModel}`,
    );
    assert(
      article.concepts[0] === article.primaryCoreModel,
      `文章主模型未排在概念兼容字段首位：${article.slug}`,
    );
  }
  assert(
    new Set(article.associatedCoreModels).size ===
      article.associatedCoreModels.length,
    `文章关联模型重复：${article.slug}`,
  );
  assert(
    article.primaryTopic === null || topicSlugs.has(article.primaryTopic),
    `未知主专题：${article.slug} -> ${article.primaryTopic}`,
  );
  assert(
    !article.primaryTopic ||
      !article.relatedTopics.includes(article.primaryTopic),
    `主专题同时出现在关联专题：${article.slug} -> ${article.primaryTopic}`,
  );
  assert(
    new Set(article.relatedTopics).size === article.relatedTopics.length,
    `关联专题重复：${article.slug}`,
  );
  assert(
    JSON.stringify(article.topics) ===
      JSON.stringify(
        [article.primaryTopic, ...article.relatedTopics].filter(Boolean),
      ),
    `专题关系兼容字段不一致：${article.slug}`,
  );
  article.topics.forEach((slug) =>
    assert(topicSlugs.has(slug), `未知专题：${article.slug} -> ${slug}`),
  );
  article.concepts.forEach((slug) =>
    assert(conceptSlugs.has(slug), `未知概念：${article.slug} -> ${slug}`),
  );
}

const configuredInstitutionSlugs = institutionSections.flatMap(
  (section) => section.articles,
);
assert(
  institutionSectionIds.size === institutionSections.length,
  "制度模块配置存在重复 id",
);
assert(
  new Set(configuredInstitutionSlugs).size ===
    configuredInstitutionSlugs.length,
  "制度模块配置存在重复文章",
);
for (const section of institutionSections) {
  assert(section.number?.trim(), `制度模块缺少编号：${section.id}`);
  assert(section.name?.trim(), `制度模块缺少名称：${section.id}`);
  assert(section.description?.trim(), `制度模块缺少说明：${section.id}`);
  for (const slug of section.articles) {
    const article = migrationBySlug.get(slug);
    assert(Boolean(article), `制度模块文章不存在：${section.id} -> ${slug}`);
    assert(
      article?.institutionSection === section.id,
      `制度模块与文章字段不一致：${slug} -> ${article?.institutionSection}/${section.id}`,
    );
  }
}

const partyStateStressHtml = fs.readFileSync(
  publicHtml("china/party-state-stress-neither-party-nor-state"),
  "utf8",
);
const partyStateRecommendationSlugs = [
  ...partyStateStressHtml.matchAll(
    /<a class="article-continuation-card"[^>]*href="([^"]+)"/g,
  ),
].map((match) =>
  decodeURI(
    new URL(
      match[1],
      "https://civicorderism.com/china/party-state-stress-neither-party-nor-state",
    ).pathname.replace(/^\//, ""),
  ),
);
assert(
  partyStateStressHtml.includes("article-continuation--model") &&
    partyStateStressHtml.includes("继续理解这个模型") &&
    partyStateRecommendationSlugs.length >= 2 &&
    partyStateRecommendationSlugs.length <= 3,
  "党国应力文章未按已确认的模型推荐结构渲染三篇继续研究",
);
assert(
  migration.filter((article) => article.section === "制度设计").length === 16,
  "制度设计栏目应包含 16 篇文章",
);
const despotismCancer = migrationBySlug.get(
  "institution/despotism-cancer-ming-1566",
);
assert(despotismCancer?.section === "解析中共", "《专制之癌》未移入解析中共");
assert(
  despotismCancer?.primaryTopic === "bureaucratic-system",
  "《专制之癌》未归入官僚系统专题",
);

for (let index = 1; index < migration.length; index += 1) {
  const previous = migration[index - 1];
  const current = migration[index];
  assert(
    previous.date > current.date ||
      (previous.date === current.date &&
        previous.title.localeCompare(current.title, "zh-CN") <= 0),
    `迁移映射日期排序不稳定：${previous.slug} -> ${current.slug}`,
  );
}

for (const article of migration) {
  const articleHtml = fs.readFileSync(publicHtml(article.slug), "utf8");
  for (const concept of hiddenConcepts) {
    assert(
      !articleHtml.includes(`/concepts/${concept.slug}`),
      `文章页显示未公开概念：${article.slug} -> ${concept.slug}`,
    );
  }
  for (const topic of hiddenTopics) {
    assert(
      !articleHtml.includes(`/topics/${topic.slug}`),
      `文章页显示未公开专题：${article.slug} -> ${topic.slug}`,
    );
  }
}

const requiredRoutes = [
  "index",
  "start",
  "start-here",
  "china",
  "china-future",
  "civic-orderism",
  "institution-design",
  "about",
  "topics",
  "concepts",
  "theory",
  "china-stage",
  "institution",
];
requiredRoutes.forEach((slug) =>
  assert(publicRouteExists(slug), `缺少路由：/${slug === "index" ? "" : slug}`),
);
const conceptsPageHtml = fs.readFileSync(publicRouteHtml("concepts"), "utf8");
const coreChinaConceptSlugs = [
  "party-state-stress",
  "bureaucratic-shock",
  "order-evaporation",
  "organizational-credit",
  "security-purge-recentralization-cycle",
  "political-control-governance-divergence",
];
assert(
  JSON.stringify(coreModelsConfig.models.map((model) => model.slug)) ===
    JSON.stringify(coreChinaConceptSlugs),
  "核心模型配置未保持已确认的六模型顺序",
);
assert(
  coreModelAssignmentByArticle.size === coreModelsConfig.articles.length,
  "核心模型文章配置存在重复 slug",
);
const overviewArticles = coreModelsConfig.models
  .map((model) => model.overviewArticle)
  .filter(Boolean);
assert(
  new Set(overviewArticles).size === overviewArticles.length,
  "同一文章被配置为多个模型总论",
);
const representativeUsage = new Map();
for (const model of coreModelsConfig.models) {
  assert(
    model.representativeArticles.length >= 2 &&
      model.representativeArticles.length <= 4,
    `核心模型代表文章数量异常：${model.slug}`,
  );
  const conceptHtml = fs.readFileSync(
    publicHtml(`concepts/${model.slug}`),
    "utf8",
  );
  if (model.slug === "bureaucratic-shock") {
    assert(
      conceptHtml.includes("inst4l") &&
        conceptHtml.includes("核心定义") &&
        conceptHtml.includes("形成机制") &&
        conceptHtml.includes("代表研究"),
      `核心模型页未进入 institutional 结构：${model.slug}`,
    );
    continue;
  }
  assert(
    conceptHtml.includes("核心判断") &&
      conceptHtml.includes("模型总论") &&
      conceptHtml.includes("代表文章"),
    `核心模型页缺少统一阅读层级：${model.slug}`,
  );
  if (model.overviewArticle) {
    assert(
      conceptHtml.includes(`data-slug="${model.overviewArticle}"`),
      `核心模型页缺少模型总论：${model.slug}`,
    );
  } else {
    assert(
      conceptHtml.includes("当前暂无专门总论"),
      `无总论模型未显示状态说明：${model.slug}`,
    );
  }
  for (const item of model.representativeArticles) {
    assert(
      conceptHtml.includes(`data-slug="${item.slug}"`),
      `核心模型页缺少代表文章：${model.slug} -> ${item.slug}`,
    );
    representativeUsage.set(
      item.slug,
      (representativeUsage.get(item.slug) ?? 0) + 1,
    );
  }
  assert(
    conceptHtml.includes("concept-model-more") ===
      model.extendedArticles.length > 0,
    `核心模型延伸阅读折叠状态异常：${model.slug}`,
  );
}
for (const [slug, count] of representativeUsage) {
  assert(count <= 2, `文章在超过两个模型中作为代表文章：${slug}`);
}
assert(
  conceptsPageHtml.includes("inst4l") &&
    conceptsPageHtml.includes("CORE CONCEPTS") &&
    conceptsPageHtml.includes("组织诊断") &&
    conceptsPageHtml.includes("阶段与循环") &&
    conceptsPageHtml.includes("转型与治理") &&
    conceptsPageHtml.includes("退出核心概念索引") &&
    conceptsPageHtml.includes(">FRAMEWORK<") &&
    conceptsPageHtml.includes(">STATE<") &&
    conceptsPageHtml.includes(">PROCESS<") &&
    conceptsPageHtml.includes(">RELATION<") &&
    conceptsPageHtml.includes(">PERIOD<") &&
    conceptsPageHtml.includes(">MODEL<") &&
    conceptsPageHtml.includes(">CONCEPT<") &&
    coreChinaConceptSlugs.every((slug) =>
      conceptsPageHtml.includes(`concepts/${slug}"`),
    ) &&
    conceptsPageHtml.includes('concepts/security-recentralization"') &&
    conceptsPageHtml.includes('concepts/three-cleans-era"') &&
    conceptsPageHtml.includes('concepts/political-route"') &&
    conceptsPageHtml.includes('concepts/ruling-techniques"') &&
    conceptsPageHtml.includes('concepts/crisis-management"') &&
    conceptsPageHtml.includes('concepts/nonviolent-transition"') &&
    !conceptsPageHtml.includes("concept-grid") &&
    !conceptsPageHtml.includes("concept-research-more"),
  "核心概念索引未进入 institutional taxonomy 结构",
);
const securityRecentralizationHtml = fs.readFileSync(
  publicHtml("concepts/security-recentralization"),
  "utf8",
);
assert(
  securityRecentralizationHtml.includes("安全化循环中的关键阶段") &&
    securityRecentralizationHtml.includes(
      "安全化—清洗—再集中—再失灵循环中的关键阶段",
    ),
  "安全再集中概念页未说明其循环阶段定位",
);
const governanceDivergenceHtml = fs.readFileSync(
  publicHtml("concepts/political-control-governance-divergence"),
  "utf8",
);
assert(
  governanceDivergenceHtml.includes(
    "一个系统可以越来越有能力控制人，却越来越没有能力解决问题",
  ) &&
    governanceDivergenceHtml.includes("与安全化循环的区别") &&
    governanceDivergenceHtml.includes("动态过程模型") &&
    governanceDivergenceHtml.includes("能力分离模型") &&
    governanceDivergenceHtml.includes("当前暂无专门总论"),
  "政治控制—治理效能背离概念页未明确能力分离模型及其与安全化循环的边界",
);
topics.forEach((topic) =>
  assert(
    fs.existsSync(publicHtml(`topics/${topic.slug}`)),
    `缺少专题页：${topic.slug}`,
  ),
);
assert(
  publicTopics.length >= 6 && publicTopics.length <= 8,
  `正式公开专题应为 6 至 8 个，当前为 ${publicTopics.length}`,
);
for (const topic of publicTopics) {
  const related = getPrimaryTopicArticles(migration, topic.slug);
  const relatedCount = related.length;
  assert(relatedCount >= 2, `公开专题相关文章不足 2 篇：${topic.slug}`);
  assert(
    related.every((article) => article.primaryTopic === topic.slug),
    `专题主列表包含其他主专题文章：${topic.slug}`,
  );
  const topicHtml = fs.readFileSync(publicHtml(`topics/${topic.slug}`), "utf8");
  if (topic.slug === "bureaucratic-system") {
    assert(
      topicHtml.includes("inst4l") &&
        topicHtml.includes("RESEARCH TOPIC") &&
        topicHtml.includes("专题核心判断") &&
        topicHtml.includes("关键研究") &&
        topic.recommended.every((slug) =>
          topicHtml.includes(`data-slug="${slug}"`),
        ),
      `专题 Prototype 未进入 institutional 结构：${topic.slug}`,
    );
    continue;
  }
  const renderedCards = [
    ...topicHtml.matchAll(
      /<article class="knowledge-card"[\s\S]*?<\/article>/g,
    ),
  ].map((match) => match[0]);
  const mainList = renderedCards;
  assert(
    mainList.length === relatedCount,
    `专题页显示数量与主专题数量不一致：${topic.slug} -> ${mainList.length}/${relatedCount}`,
  );
  assert(
    mainList.every((card) => card.includes(`专题：${topic.name}`)),
    `专题页文章卡片显示的主专题不一致：${topic.slug}`,
  );
  assert(topic.description?.trim(), `公开专题缺少简介：${topic.slug}`);
  assert(topic.coreJudgment?.trim(), `公开专题缺少核心判断：${topic.slug}`);
  assert(
    topic.recommended?.length >= 2,
    `公开专题推荐阅读不足 2 篇：${topic.slug}`,
  );
}
concepts.forEach((concept) =>
  assert(
    fs.existsSync(publicHtml(`concepts/${concept.slug}`)),
    `缺少概念页：${concept.slug}`,
  ),
);
for (const concept of concepts) {
  assert(
    ["published", "reviewing", "merged", "held"].includes(
      conceptPublicationStatus(concept),
    ),
    `概念缺少有效 publicationStatus：${concept.slug}`,
  );
  assert(
    Array.isArray(concept.representativeArticles),
    `概念缺少代表文章配置：${concept.slug}`,
  );
  for (const slug of concept.representativeArticles ?? []) {
    assert(
      migrationBySlug.has(slug),
      `概念代表文章不存在：${concept.slug} -> ${slug}`,
    );
  }
}
for (const sequence of readingSequences) {
  assert(sequence.id?.trim(), "阅读顺序缺少 id");
  assert(sequence.name?.trim(), `阅读顺序缺少名称：${sequence.id}`);
  for (const item of sequence.items ?? []) {
    if (item.slug) {
      assert(
        migrationBySlug.has(item.slug),
        `阅读顺序文章不存在：${sequence.id} -> ${item.slug}`,
      );
    } else {
      assert(
        item.href?.startsWith("/"),
        `阅读顺序入口无效：${sequence.id} -> ${item.href}`,
      );
    }
  }
}

for (const file of [
  "public/files/civic-orderism-founding-board-brief-2026.pdf",
  "public/files/civic-orderism-founding-board-brief-2026-cover.png",
  "public/files/civic-orderism-introduction-manual.pdf",
  "public/sitemap.xml",
  "public/index.xml",
  "public/robots.txt",
  "public/static/contentIndex.json",
  "public/static/logo.png",
]) {
  assert(fs.existsSync(path.join(root, file)), `缺少构建产物：${file}`);
}

const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
const orgManualPath = publicHtml("organization-manual");
const orgManualHtml = fs.existsSync(orgManualPath)
  ? fs.readFileSync(orgManualPath, "utf8")
  : "";
assert(
  orgManualHtml.includes('rel="canonical" href="/preparation"') &&
    orgManualHtml.includes("http-equiv=\"refresh\"") &&
    !orgManualHtml.includes("inst4l"),
  "organization-manual 未正确作为重定向 stub（应指向 /preparation，且不应包含内容页结构）",
);
assert(
  !fs.existsSync(
    path.join(publicDir, "files/civic-orderism-organization-manual.pdf"),
  ) &&
    !fs.existsSync(
      path.join(publicDir, "files/civic-orderism-organization-manual.html"),
    ),
  "已删除的组织建设旧文档仍有构建产物",
);
assert(
  !sitemap.includes("organization-manual"),
  "已删除页面仍进入 sitemap：/organization-manual",
);
const redirects = fs.readFileSync(path.join(publicDir, "_redirects"), "utf8");
assert(
  /^\/organization-manual\s+\/preparation\s+301$/m.test(redirects),
  "旧页面缺少 301 重定向：/organization-manual -> /preparation",
);
for (const route of [
  "china-future",
  "institution-design",
  "topics",
  "concepts",
  "start-here",
  "preparation",
  "preparation/board",
  "participate",
  "civic-orderism/north-america-nonprofit-board-preparation-manifesto",
]) {
  assert(
    sitemap.includes(`civicorderism.com/${route}`),
    `站点地图缺少：/${route}`,
  );
}
for (const item of [
  ...hiddenTopics.map((item) => `topics/${item.slug}`),
  ...researchConcepts.map((item) => `concepts/${item.slug}`),
  ...hiddenConcepts.map((item) => `concepts/${item.slug}`),
]) {
  assert(
    !sitemap.includes(`civicorderism.com/${item}`),
    `隐藏页面进入 sitemap：/${item}`,
  );
  const html = fs.readFileSync(publicHtml(item), "utf8");
  assert(
    html.includes('name="robots" content="noindex,follow"'),
    `隐藏页面缺少 noindex：/${item}`,
  );
}
assert(!sitemap.includes("civicorderism.com/tags"), "低价值标签页进入 sitemap");
assert(!sitemap.includes("civicorderism.com/404"), "404 页面进入 sitemap");
const rss = fs.readFileSync(path.join(publicDir, "index.xml"), "utf8");
assert(rss.includes("<rss") && rss.includes("<item>"), "RSS 结构不完整");
assert(!rss.includes("<title>核心概念库"), "RSS 混入非文章页面");
const searchIndex = readJson("public/static/contentIndex.json");
assert(
  !("organization-manual" in searchIndex) &&
    !JSON.stringify(searchIndex).includes("organization-manual"),
  "已删除页面仍进入搜索索引：/organization-manual",
);
assert(
  Object.values(searchIndex).some((item) => item.contentType === "专题"),
  "搜索索引缺少专题类型",
);
assert(
  Object.values(searchIndex).some((item) => item.contentType === "核心概念"),
  "搜索索引缺少核心概念类型",
);
for (const item of [
  ...hiddenTopics.map((item) => `topics/${item.slug}`),
  ...researchConcepts.map((item) => `concepts/${item.slug}`),
  ...hiddenConcepts.map((item) => `concepts/${item.slug}`),
]) {
  assert(!(item in searchIndex), `隐藏页面进入搜索索引：/${item}`);
}
assert(
  migration.filter((item) => item.needsReview).length === 13,
  `人工复核文章应为 13 篇，当前为 ${migration.filter((item) => item.needsReview).length}`,
);

const homepageHtml = fs.readFileSync(
  path.join(publicDir, "index.html"),
  "utf8",
);
const homepageText = visiblePageText(homepageHtml);
const homepageMainHtml =
  homepageHtml.match(
    /<article class="popover-hint">([\s\S]*?)<\/article><hr/,
  )?.[1] ?? homepageHtml;
const homepageMainText = visiblePageText(homepageMainHtml);
const homepageSectionIds = [
  'id="identity"',
  'id="core-political-statement"',
  'id="current-work"',
  'id="research"',
];
let previousHomepageSectionPosition = -1;
for (const marker of homepageSectionIds) {
  const position = homepageMainHtml.indexOf(marker);
  assert(
    position > previousHomepageSectionPosition,
    `首页机构章节顺序错误或缺少：${marker}`,
  );
  previousHomepageSectionPosition = position;
}
// V4 home is a continuous institutional landing page, not a numbered report.
assert(
  !homepageMainHtml.includes('id="approach"') &&
    !homepageMainHtml.includes('id="organization"') &&
    !homepageMainHtml.includes('id="contact"') &&
    (homepageMainHtml.match(/<section class="inst4-/g) ?? []).length === 4 &&
    !homepageMainHtml.includes("home-institution-") &&
    (homepageMainHtml.match(/<img/g) ?? []).length === 0,
  "首页未保持为连续机构 landing page（四区域、无编号章节、无图片）",
);
// SECTION 1 / IDENTITY
const heroHtml =
  homepageMainHtml.match(
    /<section class="inst4-hero"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  visiblePageText(heroHtml).includes("CIVIC ORDERISM") &&
    visiblePageText(heroHtml).includes("公民秩序主义") &&
    visiblePageText(heroHtml).includes("中国政治转轨的 和平方案") &&
    visiblePageText(heroHtml).includes(
      "不革命、不清算，在保持国家连续运行的前提下，为中国未来建立一条低阻力、低风险的政治转轨路径。",
    ) &&
    heroHtml.includes("CURRENT PHASE") &&
    heroHtml.includes("North American Nonprofit") &&
    heroHtml.includes("Founding Board Preparation") &&
    visiblePageText(heroHtml).includes("2026"),
  "首页首屏机构定位（IDENTITY）或当前阶段状态块缺失",
);
// Permanent Core Political Statement — fixed between identity and current work.
const coreStatementHomepageHtml =
  homepageMainHtml.match(
    /<section class="inst4-core-statement"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  coreStatementHomepageHtml.includes(
    site.corePoliticalStatement.englishLabel,
  ) &&
    visiblePageText(coreStatementHomepageHtml).includes(
      site.corePoliticalStatement.label,
    ) &&
    visiblePageText(coreStatementHomepageHtml).includes(
      site.corePoliticalStatement.title,
    ) &&
    visiblePageText(coreStatementHomepageHtml).includes(
      site.corePoliticalStatement.question,
    ) &&
    visiblePageText(coreStatementHomepageHtml).includes(
      site.corePoliticalStatement.judgment,
    ) &&
    coreStatementHomepageHtml.includes(
      `data-slug="${site.corePoliticalStatement.slug}"`,
    ) &&
    visiblePageText(coreStatementHomepageHtml).includes("阅读核心政治总论"),
  "首页缺少固定核心政治总论入口或其正式文案",
);
// SECTION 2 / CURRENT WORK + official document
const workHtml =
  homepageMainHtml.match(
    /<section class="inst4-work"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  workHtml.includes("CURRENT WORK") &&
    visiblePageText(workHtml).includes("建立一个能够承接政治信任的组织") &&
    visiblePageText(workHtml).includes(
      "政治信任",
    ) &&
    visiblePageText(workHtml).includes(
      "新的政治力量必须具备能够被识别、被验证、被追责的政治信誉与承接能力。",
    ) &&
    visiblePageText(workHtml).includes("组织责任") &&
    visiblePageText(workHtml).includes(
      "法律、财务、人员与长期政治责任必须由正式组织承担。",
    ) &&
    workHtml.includes("inst4-work__number\">01") &&
    workHtml.includes("inst4-work__number\">02") &&
    workHtml.includes("CURRENT INITIATIVE") &&
    visiblePageText(workHtml).includes("北美非营利法人及首届董事会筹备") &&
    !visiblePageText(workHtml).includes(
      "公民秩序主义当前正在推进北美非营利法人及首届董事会筹备。",
    ) &&
    workHtml.includes("OFFICIAL DOCUMENT") &&
    workHtml.includes("CO—2026—002") &&
    workHtml.includes("2026 · PDF · 22 PAGES") &&
    visiblePageText(workHtml).includes(
      "公民秩序主义 北美非营利法人及 首届董事会筹备说明",
    ) &&
    workHtml.includes("阅读正式文件") &&
    visiblePageText(workHtml).includes("当前组织建设的正式筹备文件") &&
    workHtml.includes("civic-orderism-founding-board-brief-2026.pdf") &&
    !workHtml.includes("<img"),
  "首页当前工作（CURRENT WORK）或正式文件焦点不符合要求",
);
// SECTION 3 / RESEARCH
const researchHtml =
  homepageMainHtml.match(
    /<section class="inst4-research"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  researchHtml.includes("RESEARCH &amp; POLITICAL WORK") &&
    visiblePageText(researchHtml).includes(
      "从理解旧秩序，到准备新的政治秩序",
    ) &&
    visiblePageText(researchHtml).includes(
      "组织承接政治责任，研究提供判断基础。",
    ) &&
    (researchHtml.match(/inst4-research__row/g) ?? []).length === 3 &&
    researchHtml.includes('class="inst4-research__row') &&
    (researchHtml.match(/inst4-research__num/g) ?? []).length === 3 &&
    visiblePageText(researchHtml).includes("理解现在") &&
    visiblePageText(researchHtml).includes("准备转轨") &&
    visiblePageText(researchHtml).includes("准备未来") &&
    visiblePageText(researchHtml).includes("解析中共") &&
    visiblePageText(researchHtml).includes("政治路线") &&
    visiblePageText(researchHtml).includes("中国未来") &&
    visiblePageText(researchHtml).includes(
      "理解现有政治系统为什么正在逐渐失去持续提供利益、预期与共识的能力",
    ) &&
    visiblePageText(researchHtml).includes(
      "研究如何降低政治变化的阻力、风险与社会成本",
    ) &&
    visiblePageText(researchHtml).includes(
      "讨论政治变化之后国家如何继续运行",
    ) &&
    researchHtml.includes("浏览全部研究与出版") &&
    !researchHtml.includes("进入解析中共") &&
    !researchHtml.includes("了解政治路线") &&
    !researchHtml.includes("进入中国未来") &&
    !researchHtml.includes("<article"),
  "首页研究与出版（RESEARCH 三行编辑索引）未按要求组织",
);
for (const removedHomepageText of [
  "信任 × 能力 × 人才",
  "街头动员组织",
  "网络情绪共同体",
  "党国应力",
  "安全化循环",
  "当前组织工作",
  "CURRENT STATUS / 当前阶段",
]) {
  assert(
    !homepageMainText.includes(removedHomepageText),
    `首页仍保留应收束的内容：${removedHomepageText}`,
  );
}
assert(
  homepageHtml.includes(
    'name="description" content="公民秩序主义正在为中国和平政治转轨建设政治承接能力，推进北美非营利法人及首届董事会筹备。"',
  ),
  "首页 metadata description 未同步当前组织阶段",
);
const instNavHtml =
  homepageHtml.match(/<nav class="inst4-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
assert(
  instNavHtml.includes("Civic Orderism") &&
    instNavHtml.includes('href="/about"') &&
    instNavHtml.includes('href="/theory"') &&
    instNavHtml.includes('href="/civic-orderism"') &&
    instNavHtml.includes('href="/preparation"') &&
    instNavHtml.includes('class="inst4-nav__toggle"') &&
    instNavHtml.includes('id="inst4-nav-links"') &&
    visiblePageText(instNavHtml).includes("关于") &&
    visiblePageText(instNavHtml).includes("研究") &&
    visiblePageText(instNavHtml).includes("政治路线") &&
    visiblePageText(instNavHtml).includes("董事会筹备") &&
    !instNavHtml.includes("About") &&
    !instNavHtml.includes("Founding Board") &&
    !instNavHtml.includes('class="inst4-nav__lang"') &&
    !instNavHtml.includes(">EN<"),
  "机构 Header（inst4-nav）一级导航未统一为中文或仍残留语言切换",
);
const footerHtml = homepageHtml.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
assert(
  footerHtml.includes("inst4-footer") &&
    visiblePageText(footerHtml).includes("CIVIC ORDERISM") &&
    visiblePageText(footerHtml).includes("公民秩序主义") &&
    visiblePageText(footerHtml).includes("北美非营利法人及首届董事会筹备中") &&
    visiblePageText(footerHtml).includes("CONTACT") &&
    visiblePageText(footerHtml).includes("联系方式") &&
    visiblePageText(footerHtml).includes("OFFICIAL CHANNELS") &&
    visiblePageText(footerHtml).includes("官方平台") &&
    visiblePageText(footerHtml).includes("主联系邮箱") &&
    visiblePageText(footerHtml).includes("备用邮箱") &&
    visiblePageText(footerHtml).includes("关于") &&
    visiblePageText(footerHtml).includes("研究") &&
    visiblePageText(footerHtml).includes("政治路线") &&
    visiblePageText(footerHtml).includes("董事会筹备") &&
    footerHtml.includes("mailto:civicorderism@gmail.com") &&
    footerHtml.includes("mailto:citizenorder@proton.me") &&
    footerHtml.includes("https://x.com/CivicOrderism") &&
    footerHtml.includes("https://www.youtube.com/@CivicOrderism") &&
    !footerHtml.includes("Articles") &&
    !footerHtml.includes("English") &&
    !footerHtml.includes("Independent political research") &&
    visiblePageText(footerHtml).includes("© 2026 Civic Orderism"),
  "页脚机构化收尾（inst4-footer）不符合要求",
);
for (const forbidden of [
  "X 短贴",
  "X 长文系列",
  "X 每日更新",
  "社交平台互动数据",
  "公民秩序主义Ⅰ",
]) {
  assert(
    !homepageMainText.includes(forbidden),
    `首页混入 X 内容归档：${forbidden}`,
  );
}

// Reading Map (articles.md): three routes
const articlesHtml = fs.readFileSync(publicHtml("articles"), "utf8");
const articlesText = visiblePageText(articlesHtml);
assert(
  articlesText.includes("阅读地图") &&
    articlesText.includes("路线 A") &&
    articlesText.includes("第一次认识公民秩序主义") &&
    articlesText.includes("路线 B") &&
    articlesText.includes("为什么认为中共正在失去治理能力") &&
    articlesText.includes("路线 C") &&
    articlesText.includes("如果政治变化发生，中国怎么办") &&
    /href="[^"]*start-here/.test(articlesHtml) &&
    /href="[^"]*this-time-let-china-be-your-pride/.test(articlesHtml) &&
    /href="[^"]*preparation/.test(articlesHtml) &&
    /href="[^"]*what-is-the-ccp-becoming/.test(articlesHtml) &&
    /href="[^"]*peaceful-state-transition/.test(articlesHtml) &&
    /href="[^"]*china-future/.test(articlesHtml) &&
    !articlesHtml.includes('class="content-meta"'),
  "阅读地图缺少三条阅读路线（A/B/C）或混入文章元信息",
);

// Complete articles archive (articles/all.md)
const completeArticlesHtml = fs.readFileSync(
  publicHtml("articles/all"),
  "utf8",
);
const completeArticlesText = visiblePageText(completeArticlesHtml);
const publishedCount = migration.filter(
  (item) => item.status === "published" && item.corePoliticalStatement !== true,
).length;
assert(
  completeArticlesText.includes("全部研究") &&
    completeArticlesHtml.includes("RESEARCH ARCHIVE") &&
    completeArticlesText.includes(`${publishedCount} 篇研究`) &&
    completeArticlesText.includes("解析中共") &&
    completeArticlesText.includes("公民秩序主义") &&
    completeArticlesText.includes("中国未来") &&
    completeArticlesText.includes("制度设计") &&
    completeArticlesHtml.includes(
      'data-slug="china/party-state-stress-neither-party-nor-state"',
    ) &&
    completeArticlesHtml.includes(
      'data-slug="civic-orderism/peaceful-state-transition"',
    ) &&
    !completeArticlesText.includes(site.corePoliticalStatement.title) &&
    !completeArticlesText.includes("一、旧世界为什么失效") &&
    !completeArticlesHtml.includes('class="content-meta"'),
  "独立完整文章索引缺少栏目分组、文章列表或混入文章元信息",
);

const coreStatementHtml = fs.readFileSync(
  publicHtml(site.corePoliticalStatement.slug),
  "utf8",
);
const coreStatementText = visiblePageText(coreStatementHtml);
assert(
  coreStatementHtml.includes('data-core-political-statement="true"') &&
    coreStatementHtml.includes("CORE POLITICAL STATEMENT") &&
    coreStatementText.includes("核心政治总论") &&
    coreStatementText.includes(site.corePoliticalStatement.title) &&
    coreStatementText.includes(site.corePoliticalStatement.question) &&
    coreStatementText.includes(
      "不只是人民证明自己热爱中国。 也让中国证明，它值得人民热爱。",
    ) &&
    coreStatementText.includes("这一次，让中国成为你的骄傲。") &&
    coreStatementHtml.includes(
      'data-article-continuation="core-political-statement"',
    ) &&
    coreStatementText.includes("理解现实") &&
    coreStatementText.includes("理解路线") &&
    coreStatementHtml.includes('href="../china/what-is-the-ccp-becoming"') &&
    coreStatementHtml.includes('href="../civic-orderism/civic-orderism-overview"'),
  "核心政治总论文章身份、正文或分层阅读路径不完整",
);
assert(
  coreStatementHtml.includes(
    `<link rel="canonical" href="https://civicorderism.com/${site.corePoliticalStatement.slug}"`,
  ) &&
    coreStatementHtml.includes(
      `<meta property="og:url" content="https://civicorderism.com/${site.corePoliticalStatement.slug}"`,
    ) &&
    coreStatementHtml.includes('property="og:type" content="article"') &&
    coreStatementHtml.includes(
      'name="twitter:card" content="summary_large_image"',
    ) &&
    coreStatementHtml.includes('"articleSection":"Core Political Statement"') &&
    fs
      .readFileSync(path.join(publicDir, "sitemap.xml"), "utf8")
      .includes(
        `https://civicorderism.com/${site.corePoliticalStatement.slug}`,
      ),
  "核心政治总论的 canonical、分享元数据、结构化数据或 sitemap 不完整",
);

const participateHtml = fs.readFileSync(publicHtml("participate"), "utf8");
const participateText = visiblePageText(participateHtml);
for (const requiredText of [
  "建立联系",
  "建立联系不等于加入组织",
  "提供意见不产生组织身份",
  "未经正式授权，任何人不得代表公民秩序主义进行对外沟通、表态、联络或建立政治关系",
  "了解与传播",
  "建立长期联系",
  "建立联系不构成成员、志愿者、工作人员、组织代表或任何正式身份",
  "北美非营利法人及首届董事会筹备",
  "了解董事会筹备",
  "董事不会通过公开报名直接产生",
  "筹备接触不构成任命",
]) {
  assert(
    participateText.includes(requiredText),
    `建立联系页缺少内容：${requiredText}`,
  );
}
const primaryEmailPosition = participateHtml.indexOf(
  "mailto:civicorderism@gmail.com",
);
const secondaryEmailPosition = participateHtml.indexOf(
  "mailto:citizenorder@proton.me",
);
assert(
  primaryEmailPosition >= 0 && secondaryEmailPosition > primaryEmailPosition,
  "建立联系页邮箱缺失或主备顺序错误",
);

const preparationHtml = fs.readFileSync(publicHtml("preparation"), "utf8");
const preparationText = visiblePageText(preparationHtml);
const boardHtml = fs.readFileSync(publicHtml("preparation/board"), "utf8");
const boardText = visiblePageText(boardHtml);
const manifestoHtml = fs.readFileSync(
  publicHtml(
    "civic-orderism/north-america-nonprofit-board-preparation-manifesto",
  ),
  "utf8",
);
const manifestoText = visiblePageText(manifestoHtml);
for (const [label, html, text] of [
  ["法人筹备页", preparationHtml, preparationText],
  ["董事会筹备页", boardHtml, boardText],
  ["筹备宣言", manifestoHtml, manifestoText],
]) {
  assert(
    html.includes('property="og:title"') &&
      html.includes('name="twitter:description"') &&
      html.includes('rel="canonical"'),
    `${label}缺少 OG、X 或 canonical 元数据`,
  );
  assert(
    text.includes(organization.statusLabels.registration) &&
      text.includes(organization.statusLabels.board),
    `${label}缺少法人或董事会状态说明`,
  );
  assert(!text.includes("法人已完成注册"), `${label}误称法人已经注册`);
  assert(!text.includes("首届董事会已经依法产生"), `${label}误称董事会已产生`);
}
for (const requiredText of [
  "北美非营利法人及首届董事会筹备",
  "为什么现在进入组织建设",
  "政治转型不仅需要观点，也需要能够承担法律、财务、人员与长期政治责任的组织",
  "为什么需要法人",
  "让公共事业不依赖个人",
  "为什么需要董事会",
  "让方向与责任受到明确监督",
  "治理责任，不是荣誉头衔",
  "先建立规则，再扩大参与",
  "前期筹备、沟通与框架建设",
  "选择注册法域",
  "识别首届董事候选人",
  "现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格",
  "筹备不等于已经成立",
  "北美非营利法人尚未依法成立",
  "不表示已经取得任何法人、慈善或免税资格",
  "参与筹备不自动产生董事身份或治理权限",
  "其他正式治理职务，均须在制度准备完成后，依照适用法律、章程与正式程序产生",
  "OFFICIAL DOCUMENT",
  "CO—2026—002",
  "2026 · PDF · 22 PAGES",
  "阅读正式文件",
  "进一步了解或建立联系",
  "civicorderism@gmail.com",
  "citizenorder@proton.me",
]) {
  assert(
    preparationText.includes(requiredText),
    `法人筹备页缺少内容：${requiredText}`,
  );
}
assert(
  preparationText.includes(
    "当前处于北美非营利法人及首届董事会前期筹备阶段，法人尚未完成注册，首届董事会尚未依法产生",
  ),
  "法人筹备页顶部状态说明未收紧",
);
const whyNowPosition = preparationHtml.indexOf("为什么现在进入组织建设");
const whyLegalPosition = preparationHtml.indexOf("为什么需要法人");
const whyBoardPosition = preparationHtml.indexOf("为什么需要董事会");
const workPosition = preparationHtml.indexOf("先建立规则，再扩大参与");
const boundaryPosition = preparationHtml.indexOf("筹备不等于已经成立");
const docPosition = preparationHtml.indexOf("OFFICIAL DOCUMENT");
const contactPosition = preparationHtml.indexOf("进一步了解或建立联系");
assert(
  whyLegalPosition > whyNowPosition &&
    whyBoardPosition > whyLegalPosition &&
    workPosition > whyBoardPosition &&
    boundaryPosition > workPosition &&
    docPosition > boundaryPosition &&
    contactPosition > docPosition,
  "法人筹备页未按核心信息、当前工作、组织边界、正式文件、建立联系分层",
);
// Phase 2A — institutional landing pages share the V4 shell
for (const [label, pageFile, expectTitle, expectLabel] of [
  ["about", "about", "关于公民秩序主义", "CURRENT PHASE"],
  ["research", "theory/index", "研究", "RESEARCH &amp; POLITICAL WORK"],
  ["route", "civic-orderism/index", "公民秩序主义", "CIVIC ORDERISM"],
  [
    "preparation",
    "preparation",
    "北美非营利法人及首届董事会筹备",
    "CURRENT WORK",
  ],
]) {
  const html = fs.readFileSync(publicHtml(pageFile), "utf8");
  const text = visiblePageText(html);
  assert(
    html.includes("inst4l") &&
      text.includes(expectTitle) &&
      html.includes(expectLabel),
    `一级页面 ${label} 未进入 V4 institutional shell`,
  );
  assert(
    !html.includes('class="breadcrumbs"') ||
      /display:\s*none/i.test(
        html.match(/\.breadcrumbs\s*\{[^}]*\}/)?.[0] ?? "",
      ),
    `一级页面 ${label} 仍显示 Quartz breadcrumbs`,
  );
}
for (const requiredText of [
  "治理责任，不是荣誉头衔",
  "现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格",
  "不会通过公开报名直接任命",
  "筹备联系不构成任命或承诺",
]) {
  assert(
    boardText.includes(requiredText),
    `董事会筹备页缺少内容：${requiredText}`,
  );
}

const ccpArticleHtml = fs.readFileSync(
  publicHtml("china/route-transition-why-ccp-keeps-purging-officials"),
  "utf8",
);
const civicArticleHtml = fs.readFileSync(
  publicHtml("civic-orderism/peaceful-state-transition"),
  "utf8",
);
assert(
  ALL_ARTICLES_INSTITUTIONAL ||
    (ccpArticleHtml.includes("进一步了解公民秩序主义") &&
      ccpArticleHtml.includes(
        "公民秩序主义目前正在推进北美非营利法人及首届董事会筹备工作",
      ) &&
      ccpArticleHtml.includes('href="/preparation"') &&
      ccpArticleHtml.includes('href="/start-here"') &&
      ccpArticleHtml.includes("了解董事会筹备") &&
      ccpArticleHtml.includes("5分钟了解公民秩序主义")),
  "解析中共文章缺少统一的筹备与理论入口",
);
assert(
  ALL_ARTICLES_INSTITUTIONAL ||
    (civicArticleHtml.includes("进一步了解公民秩序主义") &&
      civicArticleHtml.includes(
        "公民秩序主义目前正在推进北美非营利法人及首届董事会筹备工作",
      ) &&
      civicArticleHtml.includes('href="/preparation"') &&
      civicArticleHtml.includes('href="/start-here"') &&
      civicArticleHtml.includes("了解董事会筹备") &&
      civicArticleHtml.includes("5分钟了解公民秩序主义")),
  "公民秩序主义文章缺少统一的筹备与理论入口",
);
assert(
  !ccpArticleHtml.includes("阅读筹备宣言") &&
    !civicArticleHtml.includes("阅读筹备宣言"),
  "文章底部仍包含过强的筹备宣言入口",
);

const conceptIndexHtml = fs.readFileSync(
  path.join(publicDir, "concepts", "index.html"),
  "utf8",
);
const conceptIndexText = visiblePageText(conceptIndexHtml);
assert(
  formalConcepts.every((concept) =>
    conceptIndexHtml.includes(`/concepts/${concept.slug}`),
  ),
  "概念索引缺少正式概念",
);
assert(
  researchConcepts.every((concept) =>
    conceptIndexHtml.includes(`/concepts/${concept.slug}`),
  ),
  "概念索引缺少研究概念",
);
assert(
  hiddenConcepts.every(
    (concept) => !conceptIndexHtml.includes(`/concepts/${concept.slug}`),
  ),
  "概念索引显示了保留或合并概念",
);
assert(
  !conceptIndexText.includes("本栏目全部文章"),
  "概念索引重复渲染通用文件夹列表",
);

const startHtml = fs.readFileSync(publicRouteHtml("start-here"), "utf8");
const startText = visiblePageText(startHtml);
assert(startText.includes("新读者入口"), "/start-here 缺少新读者入口标签");
assert(!startText.includes("分钟阅读"), "/start-here 仍包含文章阅读时长");
for (const requiredText of [
  "公民秩序主义是什么？",
  "为什么提出这条路线？",
  "核心政治路线是什么？",
  "现在正在做什么？",
  "下一步从哪里开始？",
  "不革命",
  "不清算",
  "和平承接",
  "国家连续",
  "依法治理",
  "长期建设",
]) {
  assert(
    startText.includes(requiredText),
    `/start-here 缺少内容：${requiredText}`,
  );
}
assert(
  startHtml.includes("civic-orderism/peaceful-state-transition") &&
    /href="[^"]*articles/.test(startHtml) &&
    /href="[^"]*preparation/.test(startHtml) &&
    !startText.includes("旧入口") &&
    !startText.includes("迁移"),
  "/start-here 下一步入口或正式页面文案不正确",
);

const legacyStartHtml = fs.readFileSync(publicHtml("start"), "utf8");
assert(
  legacyStartHtml.includes("start-here") &&
    legacyStartHtml.includes('http-equiv="refresh"'),
  "/start 没有兼容重定向至 /start-here",
);

for (const route of [
  "start-here",
  "preparation",
  "preparation/board",
  "participate",
  "about",
]) {
  const html = fs.readFileSync(publicRouteHtml(route), "utf8");
  assert(
    !html.includes('class="content-meta"'),
    `组织基础页面仍显示文章元信息：/${route}`,
  );
}

const aboutHtml = fs.readFileSync(publicHtml("about"), "utf8");
const aboutText = visiblePageText(aboutHtml);
for (const requiredText of [
  "关于公民秩序主义",
  "公民秩序主义是什么",
  "为什么存在",
  "政治路线",
  "研究体系",
  "从理解旧秩序，到准备新的政治秩序",
  "解析中共",
  "政治路线",
  "中国未来",
  "正式出版与筹备文件",
  "公民秩序主义介绍手册",
  "北美非营利法人及首届董事会筹备说明",
  "联系方式",
  "本站不设公开成员名册、失控的公开群聊、支付或募款入口",
  "主联系邮箱",
  "备用邮箱",
  "civicorderism@gmail.com",
  "citizenorder@proton.me",
]) {
  assert(aboutText.includes(requiredText), `关于页缺少内容：${requiredText}`);
}
assert(
  !aboutText.includes("专业、审慎、冷静和克制"),
  "关于页仍包含直接的自我评价措辞",
);
assert(
  !homepageMainText.includes(["专业协作者", "识别"].join("")) &&
    !aboutText.includes(["专业协作者", "识别"].join("")),
  "首页或关于页仍使用旧的协作者筛选措辞",
);
assert(
  !visiblePageText(homepageHtml).includes("约 5 分钟"),
  "首页仍包含人工时长文案",
);

const institutionHtml = fs.readFileSync(
  path.join(publicDir, "institution-design", "index.html"),
  "utf8",
);
const institutionText = visiblePageText(institutionHtml);
assert(
  institutionText.includes("制度运行地图") &&
    institutionText.includes("第一次阅读") &&
    institutionText.includes("按照制度模块阅读"),
  "制度设计页缺少制度地图、第一次阅读或模块阅读区域",
);
assert(
  institutionSections.every(
    (section) =>
      institutionHtml.includes(`id="institution-module-${section.id}"`) &&
      institutionHtml.includes(`data-filter-section="${section.id}"`),
  ),
  "制度设计页缺少模块卡片或一级筛选",
);
assert(
  [...institutionHtml.matchAll(/data-institution-section="([^"]+)"/g)].every(
    (match) => institutionSectionIds.has(match[1]),
  ),
  "制度设计页文章卡片包含未知制度模块",
);
assert(
  !institutionHtml.includes('href="/institution/despotism-cancer-ming-1566"'),
  "《专制之癌》仍出现在制度设计页",
);

for (const route of ["index", "start-here"]) {
  const htmlPath =
    route === "index"
      ? path.join(publicDir, "index.html")
      : publicRouteHtml(route);
  const html = fs.readFileSync(htmlPath, "utf8");
  assert(
    (html.match(/<h1\b/g) ?? []).length === 1,
    `页面应只有一个 h1：/${route === "index" ? "" : route}`,
  );
  assert(
    html.includes('rel="canonical" href="https://civicorderism.com/'),
    `页面 canonical 不正确：/${route === "index" ? "" : route}`,
  );
  assert(
    html.includes('property="og:title"') &&
      html.includes('property="og:description"') &&
      html.includes('property="og:image"'),
    `页面 Open Graph 信息不完整：/${route === "index" ? "" : route}`,
  );
  assert(
    html.includes('name="twitter:card"') &&
      html.includes('name="twitter:title"') &&
      html.includes('name="twitter:description"'),
    `页面 X Card 信息不完整：/${route === "index" ? "" : route}`,
  );
}

for (const htmlPath of walkHtmlFiles(publicDir)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const relative = path.relative(publicDir, htmlPath).split(path.sep).join("/");
  const route = relative
    .replace(/index\.html$/, "")
    .replace(/\.html$/, "")
    .replace(/\/$/, "");
  const pageUrl = `https://civicorderism.com/${route}`;
  const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map(
    (match) => match[1],
  );
  for (const href of hrefs) {
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("javascript:")
    )
      continue;
    const target = new URL(href, pageUrl);
    if (target.hostname !== "civicorderism.com") continue;
    assert(
      publicPathExists(target.pathname),
      `内部链接目标不存在：${relative} -> ${target.pathname}`,
    );
  }
}

for (const file of ["sitemap.xml", "index.xml", "robots.txt"]) {
  const source = fs.readFileSync(path.join(publicDir, file), "utf8");
  assert(!/localhost|trycloudflare/i.test(source), `${file} 包含临时预览地址`);
}

for (const htmlPath of walkHtmlFiles(publicDir)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const pageText = visiblePageText(html);
  const relativeHtmlPath = path.relative(publicDir, htmlPath);
  for (const legacyBrand of legacyEnglishBrands) {
    const approvedHomepageStageLabel =
      relativeHtmlPath === "index.html" &&
      legacyBrand === "CIVIC ORDERISM" &&
      html.includes("CIVIC ORDERISM") &&
      html.includes("中国政治转轨的") &&
      (html.match(/CIVIC ORDERISM/g) ?? []).length === 1;
    assert(
      approvedHomepageStageLabel || !html.includes(legacyBrand),
      `公开页面仍包含旧英文品牌：${relativeHtmlPath} -> ${legacyBrand}`,
    );
  }
  for (const pattern of developmentPlaceholderPatterns) {
    assert(
      !pattern.test(pageText),
      `公开页面包含开发占位文本：${path.relative(publicDir, htmlPath)} -> ${pattern}`,
    );
  }
}

if (errors.length) {
  console.error(errors.map((item) => `- ${item}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `V2 validation passed: ${migration.length} articles, ${topics.length} topics, ${concepts.length} concepts, ${migration.filter((item) => item.needsReview).length} review items.`,
  );
}
