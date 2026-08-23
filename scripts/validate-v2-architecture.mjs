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
const legacyEnglishBrands = [
  ["Citizen", "Orderism"].join(" "),
  "Civic Orderism".toUpperCase(),
];

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
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
const expectedChinaFeaturedCounts = [4, 5, 5, 5, 4];
for (const [index, group] of chinaAnalysisConfig.groups.entries()) {
  const heading = `### ${["一", "二", "三", "四", "五"][index]}、${group.name}`;
  const groupSource = chinaPageSource.split(heading)[1]?.split("### ")[0] ?? "";
  const featuredSource = groupSource.split(
    '<details class="china-analysis-more">',
  )[0];
  const renderedFeatured = [
    ...featuredSource.matchAll(/<a href="\/([^"]+)">/g),
  ].map((match) => match[1]);
  assert(
    JSON.stringify(renderedFeatured) === JSON.stringify(group.featured),
    `解析中共首屏代表作顺序与配置不一致：${group.name}`,
  );
  assert(
    group.featured.length === expectedChinaFeaturedCounts[index],
    `解析中共首屏代表作数量不符合定型配置：${group.name}`,
  );
  if (group.coreFeatured) {
    const coreArticle = migrationBySlug.get(group.coreFeatured);
    assert(
      coreArticle &&
        featuredSource.includes(
          `<a href="/${group.coreFeatured}">${coreArticle.title}</a>`,
        ),
      `解析中共核心阅读标题未直接使用文章 metadata：${group.coreFeatured}`,
    );
  }
}
for (const model of chinaAnalysisConfig.models) {
  assert(
    chinaPageSource.includes(`href="${model.href}"`) &&
      chinaPageSource.includes(`<strong>${model.name}</strong>`) &&
      chinaPageSource.includes(model.description),
    `解析中共缺少核心模型：${model.name}`,
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
  "解析中共核心模型未保持六个相互独立的模型",
);
for (const judgment of chinaAnalysisConfig.structuralJudgments) {
  assert(
    chinaPageSource.includes(`href="${judgment.href}"`) &&
      chinaPageSource.includes(`<strong>${judgment.name}</strong>`),
    `解析中共缺少结构判断：${judgment.name}`,
  );
}
assert(
  JSON.stringify(
    chinaAnalysisConfig.structuralJudgments.map((judgment) => judgment.name),
  ) ===
    JSON.stringify([
      "党国关系",
      "官僚体系",
      "中央与地方",
      "财政与利益分配",
      "组织成员",
      "安全治理",
      "权力集中",
      "政治责任",
      "国家治理能力",
    ]),
  "解析中共结构判断未保持九个观察维度",
);
assert(
  chinaPageSource.includes(
    "公民秩序主义提出的解释模型，用于理解不同现象背后的共同运行机制",
  ) &&
    chinaPageSource.includes(
      "从权力、财政、官僚、央地与国家治理等结构维度，观察中共长期运行中的矛盾",
    ),
  "解析中共未明确区分核心模型与结构判断",
);
assert(
  chinaPageSource.indexOf('id="china-models-title"') <
    chinaPageSource.indexOf('id="china-judgments-title"') &&
    chinaPageSource.indexOf('id="china-judgments-title"') <
      chinaPageSource.indexOf('id="china-observations-title"'),
  "解析中共的核心模型、结构判断与现实观察顺序异常",
);
assert(
  (chinaPageHtml.match(/<details class="china-analysis-more">/g) ?? [])
    .length === chinaAnalysisConfig.groups.length,
  "解析中共各子栏缺少默认折叠的更多文章",
);
assert(
  !/<details class="china-analysis-more"[^>]*\sopen(?:[\s=>])/i.test(
    chinaPageHtml,
  ),
  "解析中共更多文章不应默认展开",
);
assert(
  chinaPageHtml.includes(
    `查看全部解析中共文章（${migration.filter((article) => article.section === "解析中共" && article.status === "published").length}）`,
  ),
  "解析中共完整索引缺少动态文章数量",
);
assert(
  !/<details class="page-listing section-archive"[^>]*\sopen(?:[\s=>])/i.test(
    chinaPageHtml,
  ) && chinaPageHtml.includes("data-section-archive-collapse"),
  "解析中共完整索引必须默认收起并提供收起操作",
);
assert(
  chinaAnalysisConfig.groups
    .flatMap((group) => group.slugs)
    .every((slug) => chinaPageHtml.includes(`data-slug="${slug}"`)),
  "解析中共页面未保留全部文章入口",
);

assert(
  new Set(migration.map((item) => item.slug)).size === migration.length,
  "迁移映射存在重复 slug",
);
for (const article of migration) {
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
  assert(
    recommendationSlugs.length <= recommendationLimit,
    `推荐阅读超过 ${recommendationLimit} 篇：${article.slug}`,
  );
  assert(recommendationSlugs.length >= 2, `推荐阅读少于 2 篇：${article.slug}`);
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
    articleHtml.includes('aria-label="继续阅读"') &&
      (articleHtml.includes("相关文章") ||
        (articleHtml.includes("继续理解这个模型") &&
          articleHtml.includes("从判断进入路线"))) &&
      articleHtml.includes("分钟阅读"),
    `文章缺少统一继续阅读、相关文章或预计阅读时间：${article.slug}`,
  );
  assert(
    relatedReadingPosition > -1 &&
      relatedReadingPosition < knowledgeContextPosition &&
      knowledgeContextPosition < endingCtaPosition,
    `文章尾部顺序不是继续阅读 → 知识关联 → 组织 CTA：${article.slug}`,
  );
  assert(
    articleHtml.includes('aria-label="继续阅读"') &&
      articleHtml.includes('class="article-knowledge"'),
    `文章尾部未同时生成继续阅读与知识关联：${article.slug}`,
  );
  assert(
    !articleHtml.includes("article-continuation-card__summary") &&
      !articleHtml.includes("article-continuation-card__meta"),
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
    sectionNames.has(article.section),
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
    partyStateStressHtml.includes("从判断进入路线") &&
    JSON.stringify(partyStateRecommendationSlugs) ===
      JSON.stringify([
        "theory/party-state-structural-failure",
        "china/party-power-logic-and-ccp-goal-vacuum",
        "china/xi-solved-organization-not-reality",
        "civic-orderism/possibility-of-peaceful-political-transition-in-china",
      ]),
  "党国应力文章未按已确认的同模型代表作与政治路线渲染四篇继续阅读",
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
const coreChinaConceptGrid =
  conceptsPageHtml.match(
    /<div class="concept-grid concept-grid--core">([\s\S]*?)<\/div>/,
  )?.[1] ?? "";
assert(
  conceptsPageHtml.includes("concept-grid--core") &&
    conceptsPageHtml.includes("concept-grid--extended") &&
    conceptsPageHtml.includes("查看延伸研究概念") &&
    !/<details class="concept-research-more"[^>]*\sopen(?:[\s=>])/i.test(
      conceptsPageHtml,
    ) &&
    coreChinaConceptSlugs.every((slug) =>
      coreChinaConceptGrid.includes(`concepts/${slug}"`),
    ) &&
    !coreChinaConceptGrid.includes('concepts/security-recentralization"'),
  "核心概念词典未区分核心概念与默认收起的延伸研究概念",
);
const extendedChinaConceptGrid =
  conceptsPageHtml.match(
    /<div class="concept-grid concept-grid--extended">([\s\S]*?)<\/div>/,
  )?.[1] ?? "";
assert(
  extendedChinaConceptGrid.includes('concepts/security-recentralization"'),
  "安全再集中未降为延伸研究概念",
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
assert(
  !publicRouteExists("organization-manual"),
  "已删除页面仍有构建产物：/organization-manual",
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
const homepageHeroHtml =
  homepageMainHtml.match(
    /<section class="home-focus-hero"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  visiblePageText(homepageHeroHtml).includes(
    "CIVIC ORDERISM · CURRENT STAGE 从政治判断 走向组织建设",
  ) &&
    visiblePageText(homepageHeroHtml).includes(
      "公民秩序主义正在筹备北美非营利组织及首届董事会",
    ) &&
    visiblePageText(homepageHeroHtml).includes(
      "公民秩序主义正在从公共理论表达进入组织建设阶段，为未来可能出现的和平政治转轨，准备一个可以被识别、可以沟通、能够承担承诺并履行责任的长期组织主体",
    ),
  "首页首屏没有在五秒内明确当前组织建设阶段",
);
assert(
  homepageHeroHtml.includes(
    'data-slug="files/civic-orderism-founding-board-brief-2026.pdf"',
  ) &&
    homepageHeroHtml.includes('data-slug="preparation"') &&
    !homepageHeroHtml.includes('data-slug="participate"') &&
    (homepageHeroHtml.match(/<a class="home-focus-button /g) ?? []).length ===
      2 &&
    visiblePageText(homepageHeroHtml).includes("阅读正式文件") &&
    visiblePageText(homepageHeroHtml).includes("董事会筹备"),
  "首页首屏没有收束为正式文件与董事会筹备两个 CTA",
);
assert(
  homepageHeroHtml.includes(
    'src="./files/civic-orderism-founding-board-brief-2026-cover.png"',
  ) &&
    !visiblePageText(homepageHeroHtml).includes("Version 1.0 · 2026") &&
    !visiblePageText(homepageHeroHtml).includes("Document ID") &&
    !homepageHeroHtml.includes("home-brief-status"),
  "首页首屏封面没有保持为单一、无附加卡片的视觉主体",
);
const expectedHomepageSections = [
  'id="current-stage"',
  'id="official-document"',
  'id="board-preparation"',
  'id="theory-and-research"',
];
let previousHomepageSectionPosition = -1;
for (const marker of expectedHomepageSections) {
  const position = homepageMainHtml.indexOf(marker);
  assert(
    position > previousHomepageSectionPosition,
    `首页模块顺序错误或缺少：${marker}`,
  );
  previousHomepageSectionPosition = position;
}
assert(
  (homepageMainHtml.match(/<section class="home-focus-/g) ?? []).length === 4,
  "首页主要内容不是严格的四区域结构",
);
const officialDocumentHtml =
  homepageMainHtml.match(
    /<section class="home-focus-document"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  officialDocumentHtml.includes(
    'data-slug="files/civic-orderism-founding-board-brief-2026.pdf"',
  ) &&
    visiblePageText(officialDocumentHtml).includes("打开正式文件") &&
    visiblePageText(officialDocumentHtml).includes(
      "OFFICIAL DOCUMENT · CO-2026-002",
    ) &&
    visiblePageText(officialDocumentHtml).includes(
      "为和平政治转轨建立信任、能力与人才",
    ) &&
    visiblePageText(officialDocumentHtml).includes("Version 1.0 · 2026") &&
    visiblePageText(officialDocumentHtml).includes(
      "Document ID · CO-2026-002",
    ) &&
    officialDocumentHtml.includes('data-slug="preparation"') &&
    !officialDocumentHtml.includes("<img"),
  "首页正式文件区没有成为独立核心入口",
);
const homepagePreparationHtml =
  homepageMainHtml.match(
    /<section class="home-focus-preparation"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  visiblePageText(homepagePreparationHtml).includes("首届董事会筹备") &&
    homepagePreparationHtml.includes('data-slug="preparation"') &&
    homepagePreparationHtml.includes('data-slug="participate"') &&
    !visiblePageText(homepagePreparationHtml).includes(
      "董事会存在的第一个意义",
    ),
  "首页董事会筹备区没有保持简洁行动导流",
);
const theoryHtml =
  homepageMainHtml.match(
    /<section class="home-focus-theory"[\s\S]*?<\/section>/,
  )?.[0] ?? "";
assert(
  (theoryHtml.match(/home-focus-research-link/g) ?? []).length === 3 &&
    theoryHtml.includes('data-slug="civic-orderism"') &&
    theoryHtml.includes('data-slug="china"') &&
    theoryHtml.includes('data-slug="china-future"') &&
    theoryHtml.includes('data-slug="introduction-manual"') &&
    visiblePageText(theoryHtml).includes(
      "第一次了解公民秩序主义？阅读《公民秩序主义介绍手册》 →",
    ) &&
    !theoryHtml.includes("<article") &&
    !theoryHtml.includes("<img") &&
    !theoryHtml.includes("<li>"),
  "首页理论与研究没有保持为三条纯文字入口",
);
for (const removedHomepageText of [
  "为什么需要组织",
  "信任 × 能力 × 人才",
  "为什么需要首届董事会",
  "董事会存在的第一个意义",
  "建立什么样的组织",
  "与什么样的人建立长期联系",
  "当前发展路径",
  "CURRENT STATUS / 当前阶段",
  "街头动员组织",
  "网络情绪共同体",
  "党国应力",
  "安全化循环",
  "中国是否存在新的转型窗口",
  "中国和平政治转型的可能性",
]) {
  assert(
    !homepageMainText.includes(removedHomepageText),
    `首页仍保留应收束的内容：${removedHomepageText}`,
  );
}
assert(
  homepageMainHtml.includes("mailto:civicorderism@gmail.com") &&
    homepageMainHtml.includes("mailto:citizenorder@proton.me") &&
    homepageMainHtml.includes('class="home-focus-contact"') &&
    !homepageMainHtml.includes('id="contact"') &&
    !homepageMainText.includes("立即加入") &&
    !homepageMainText.includes("马上报名"),
  "首页 Footer 前联系方式缺失、过重或出现强招募表达",
);
assert(
  (
    homepageMainHtml.match(
      /civic-orderism-founding-board-brief-2026-cover.png/g,
    ) ?? []
  ).length === 1,
  "首页 PDF 封面应只作为 Hero 的单一品牌视觉资产出现",
);
assert(
  homepageHtml.includes(
    'name="description" content="公民秩序主义正在为中国和平政治转轨建设政治承接能力，推进北美非营利组织及首届董事会筹备。"',
  ),
  "首页 metadata description 未同步当前组织阶段",
);
assert(
  navigation.map((item) => item.label).join("/") ===
    "首页/董事会筹备/公民秩序主义/解析中共/中国未来/关于",
  "主导航没有采用董事会筹备与三条内容主线优先的结构",
);
assert(
  homepageHtml.includes('class="primary-navigation__toggle"') &&
    homepageHtml.includes('aria-controls="primary-navigation-links"') &&
    homepageHtml.includes('id="primary-navigation-links"') &&
    homepageHtml.includes(
      'href="/preparation" class="primary-navigation__priority"',
    ),
  "桌面端或移动端主导航结构不完整，或董事会筹备未保持重点入口",
);
const secondaryNavigationHtml =
  homepageHtml.match(
    /<div class="primary-navigation__secondary"[\s\S]*?<\/div>/,
  )?.[0] ?? "";
assert(
  visiblePageText(secondaryNavigationHtml).trim() ===
    "5分钟了解 阅读地图 核心政治路线 参与方式" &&
    !secondaryNavigationHtml.includes("筹备宣言"),
  "顶部快捷导航未与一级导航分工",
);
assert(
  homepageText.includes("内容目录") &&
    homepageText.includes("5分钟了解") &&
    homepageText.includes("阅读地图") &&
    !homepageText.includes("制度设计"),
  "侧边栏标题或阅读入口未统一",
);
const footerHtml = homepageHtml.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
assert(
  visiblePageText(footerHtml).includes(
    "5分钟了解 阅读地图 董事会筹备 核心路线 参与方式 关于",
  ) &&
    !visiblePageText(footerHtml).includes("法人筹备") &&
    !visiblePageText(footerHtml).includes("核心概念"),
  "页脚链接未按路线与组织层级统一",
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

const articlesHtml = fs.readFileSync(publicHtml("articles"), "utf8");
const articlesText = visiblePageText(articlesHtml);
const readingRoutes = [
  {
    id: "route-system-failure",
    title: "中共为什么正在失去原有运行能力",
    count: 4,
    nextHref: "#route-transition-conditions",
    slugs: [
      "china/party-state-stress-neither-party-nor-state",
      "china/ccp-bureaucracy-double-deadlock",
      "theory/organizational-collapse-begins-with-loss-of-institutional-trust",
      "china/security-led-governance-model",
    ],
  },
  {
    id: "route-transition-conditions",
    title: "为什么中国存在政治转轨条件",
    count: 4,
    nextHref: "#route-peaceful-transition",
    slugs: [
      "civic-orderism/possibility-of-peaceful-political-transition-in-china",
      "china/supply-side-reform-state-can-scale-not-discover-future",
      "china-stage/china-manufacturing-cannot-stop",
      "civic-orderism/state-must-rely-on-systems-not-drivers",
    ],
  },
  {
    id: "route-peaceful-transition",
    title: "为什么应当选择和平转轨",
    count: 3,
    nextHref: "#route-civic-orderism",
    slugs: [
      "civic-orderism/peaceful-state-transition",
      "civic-orderism/why-civic-orderism-is-easier-to-succeed",
      "theory/internal-change-external-change",
    ],
  },
  {
    id: "route-civic-orderism",
    title: "公民秩序主义提出什么路线",
    count: 4,
    nextHref: "#route-organization-preparation",
    slugs: [
      "civic-orderism/why-civic-orderism",
      "civic-orderism/what-civic-orderism-solves-if-you-read-only-one",
      "civic-orderism/what-civic-orderism-ultimately-solves",
      "start-here",
    ],
  },
  {
    id: "route-organization-preparation",
    title: "为什么现在开始组织准备",
    count: 3,
    nextHref: "#all-articles",
    slugs: ["preparation", "preparation/board", "participate"],
  },
];
let previousReadingRoutePosition = -1;
const allReadingRouteSlugs = [];
for (const [index, route] of readingRoutes.entries()) {
  const routePosition = articlesHtml.indexOf(`id="${route.id}"`);
  const nextRouteId = readingRoutes[index + 1]?.id;
  const routeEnd = nextRouteId
    ? articlesHtml.indexOf(`id="${nextRouteId}"`)
    : articlesHtml.indexOf('id="all-articles"');
  const routeBlock = articlesHtml.slice(routePosition, routeEnd);
  const recommendedBlock =
    routeBlock.match(/<ol class="reading-route__list">([\s\S]*?)<\/ol>/)?.[1] ??
    "";
  const recommendedCount = (recommendedBlock.match(/<li>/g) ?? []).length;
  const recommendedSlugs = [
    ...recommendedBlock.matchAll(/data-slug="([^"]+)"/g),
  ].map((match) => match[1]);
  const hasExpectedMoreLink =
    index === readingRoutes.length - 1
      ? !routeBlock.includes("reading-route__more")
      : routeBlock.includes("reading-route__more");
  allReadingRouteSlugs.push(...recommendedSlugs);
  assert(
    routePosition > previousReadingRoutePosition &&
      routeEnd > routePosition &&
      visiblePageText(routeBlock).includes(route.title) &&
      recommendedCount === route.count &&
      recommendedSlugs.join("|") === route.slugs.join("|") &&
      recommendedCount >= 2 &&
      recommendedCount <= 4 &&
      hasExpectedMoreLink &&
      routeBlock.includes("reading-route__completion") &&
      routeBlock.includes(`href="${route.nextHref}"`) &&
      visiblePageText(routeBlock).includes("继续这条判断路线"),
    `阅读地图路线结构或推荐数量异常：${route.title}`,
  );
  previousReadingRoutePosition = routePosition;
}
assert(
  new Set(allReadingRouteSlugs).size === allReadingRouteSlugs.length,
  "五步阅读地图存在重复推荐入口",
);
const articleLibraryPosition = articlesHtml.indexOf('id="all-articles"');
assert(
  articlesText.includes("这里不是完整文章目录") &&
    articlesText.includes("从现实判断走向政治路线与组织准备") &&
    articleLibraryPosition > previousReadingRoutePosition &&
    !articlesHtml.includes('class="reading-library-index"') &&
    !articlesText.includes("一、旧世界为什么失效") &&
    !articlesText.includes("九、后台系统、司法与执行底座") &&
    !articlesHtml.includes('class="content-meta"') &&
    articlesText.includes("浏览全部文章") &&
    articlesText.includes("旧专题索引均保留在独立页面") &&
    articlesHtml.includes('data-slug="civic-orderism"') &&
    articlesHtml.includes('data-slug="china"') &&
    articlesHtml.includes('data-slug="china-future"') &&
    articlesHtml.includes('data-slug="articles/all"') &&
    articlesHtml.includes('data-slug="preparation"') &&
    articlesHtml.includes('data-slug="participate"') &&
    articlesText.includes("政治组织失灵不等于国家能力消失") &&
    !articlesHtml.includes('data-slug="institution-design"'),
  "阅读地图缺少新读者引导、完整索引入口，或重新突出制度设计",
);

const completeArticlesHtml = fs.readFileSync(
  publicHtml("articles/all"),
  "utf8",
);
const completeArticlesText = visiblePageText(completeArticlesHtml);
for (const legacySection of [
  "一、旧世界为什么失效",
  "二、中共这个组织为什么走向失灵",
  "三、中国正在进入什么阶段",
  "四、外部误判、国际风险与历史案例",
  "五、为什么需要新的制度通道",
  "六、公民秩序主义的基本理论",
  "七、委员会与公共判断机制",
  "八、选举、授权与责任更替",
  "九、后台系统、司法与执行底座",
  "十、近期文章",
]) {
  assert(
    completeArticlesText.includes(legacySection),
    `完整文章索引缺少旧专题：${legacySection}`,
  );
}
assert(
  completeArticlesText.includes(`本站共收录 ${migration.length} 篇文章`) &&
    completeArticlesHtml.includes('data-slug="articles"') &&
    completeArticlesHtml.includes('data-slug="civic-orderism"') &&
    completeArticlesHtml.includes('data-slug="china"') &&
    completeArticlesHtml.includes('data-slug="china-future"') &&
    completeArticlesHtml.includes('data-slug="topics"') &&
    !completeArticlesHtml.includes('class="content-meta"'),
  "独立完整文章索引缺少栏目入口、阅读地图返回入口或混入文章元信息",
);

const participateHtml = fs.readFileSync(publicHtml("participate"), "utf8");
const participateText = visiblePageText(participateHtml);
for (const requiredText of [
  "参与公民秩序主义",
  "参与不等于立即加入组织",
  "了解与传播",
  "阅读公民秩序主义正式材料",
  "介绍公民秩序主义的政治路线",
  "专业协作",
  "研究",
  "编辑",
  "翻译",
  "设计",
  "技术",
  "法律",
  "财务",
  "项目管理",
  "长期联系",
  "参与北美组织筹备",
  "法人筹备",
  "董事会筹备",
  "法律与合规",
  "财务与内部控制",
  "治理制度建设",
  "北美居住要求不适用于普通支持、传播、翻译、研究和技术协作",
  "筹备参与不是治理身份",
  "不人为制造风险",
  "请不要在初次邮件中发送身份证件",
  "公民秩序主义希望与什么样的人建立联系",
  "公民秩序主义不以人数、头衔和情绪扩大组织",
  "通过邮件说明参与方向",
]) {
  assert(
    participateText.includes(requiredText),
    `参与页缺少内容：${requiredText}`,
  );
}
const primaryEmailPosition = participateHtml.indexOf(
  "mailto:civicorderism@gmail.com",
);
const secondaryEmailPosition = participateHtml.indexOf(
  "mailto:citizenorder@proton.me",
);
for (const anchor of ["communication", "collaboration", "contact"]) {
  assert(
    participateHtml.includes(`id="${anchor}"`),
    `参与页缺少稳定锚点：#${anchor}`,
  );
}
assert(
  primaryEmailPosition >= 0 && secondaryEmailPosition > primaryEmailPosition,
  "参与页邮箱缺失或主备顺序错误",
);
assert(
  !participateText.includes("我们"),
  "参与页仍包含可改为机构名称表述的第一人称文案",
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
  "北美非营利法人 + 首届董事会",
  "为什么需要法人",
  "为什么需要董事会",
  "前期筹备、沟通与框架建设",
  "希望联系的人",
  "civicorderism@gmail.com",
  "citizenorder@proton.me",
  "理论研究",
  "政治与治理研究",
  "选择注册法域",
  "筹备不等于已经成立",
  "不表示已经取得任何法人、慈善或免税资格",
  "现阶段正在识别并接触潜在首届董事候选人，但不会通过公开报名直接产生董事资格",
  "进一步了解筹备框架",
  "北美非营利法人尚未依法成立",
  "参与筹备不自动产生董事身份或治理权限",
  "其他正式治理职务，均须在制度准备完成后，依照适用法律、章程与正式程序产生",
]) {
  assert(
    preparationText.includes(requiredText),
    `法人筹备页缺少内容：${requiredText}`,
  );
}
assert(
  preparationText.includes(
    "当前处于北美非营利法人及首届董事会前期筹备阶段，法人尚未完成注册，首届董事会尚未依法产生",
  ) && !preparationHtml.includes("preparation-boundary"),
  "法人筹备页顶部状态说明未收紧，或正文仍重复状态提醒",
);
const candidatesPosition = preparationHtml.indexOf(
  'class="preparation-section preparation-candidates"',
);
const contactPosition = preparationHtml.indexOf(
  'class="preparation-section preparation-contact"',
);
const frameworkPosition = preparationHtml.indexOf(
  'class="preparation-framework"',
);
const legalNotePosition = preparationHtml.indexOf(
  'class="preparation-section preparation-legal-note"',
);
assert(
  candidatesPosition >= 0 &&
    contactPosition > candidatesPosition &&
    frameworkPosition > contactPosition &&
    legalNotePosition > frameworkPosition,
  "法人筹备页未按核心信息、深入框架、底部状态说明分层",
);
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
  ccpArticleHtml.includes("进一步了解公民秩序主义") &&
    ccpArticleHtml.includes(
      "公民秩序主义目前正在推进北美非营利法人及首届董事会筹备工作",
    ) &&
    ccpArticleHtml.includes('href="/preparation"') &&
    ccpArticleHtml.includes('href="/start-here"') &&
    ccpArticleHtml.includes("了解董事会筹备") &&
    ccpArticleHtml.includes("5分钟了解公民秩序主义"),
  "解析中共文章缺少统一的筹备与理论入口",
);
assert(
  civicArticleHtml.includes("进一步了解公民秩序主义") &&
    civicArticleHtml.includes(
      "公民秩序主义目前正在推进北美非营利法人及首届董事会筹备工作",
    ) &&
    civicArticleHtml.includes('href="/preparation"') &&
    civicArticleHtml.includes('href="/start-here"') &&
    civicArticleHtml.includes("了解董事会筹备") &&
    civicArticleHtml.includes("5分钟了解公民秩序主义"),
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
  startHtml.includes('href="/civic-orderism/peaceful-state-transition"') &&
    startHtml.includes('href="/articles"') &&
    startHtml.includes('href="/preparation"') &&
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
  "公民秩序主义是什么",
  "为什么建立这个网站",
  "当前组织阶段",
  "网站承担哪些功能",
  "本站是公民秩序主义的正式出版、理论沉淀、政治与治理研究及公共传播平台",
  "政治路线是主体，网站是载体，理论是基础，组织是长期承接结构",
  "本站重视事实、逻辑、责任边界与制度可执行性，不以新闻速度、情绪动员或个人崇拜替代制度分析",
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
      html.includes("CIVIC ORDERISM · CURRENT STAGE") &&
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
