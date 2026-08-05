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
const organization = readJson("data/organization.config.json");
const topicSlugs = new Set(topics.map((item) => item.slug));
const conceptSlugs = new Set(concepts.map((item) => item.slug));
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

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const publicHtml = (slug) => path.join(publicDir, `${slug}.html`);
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
const walkHtmlFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  });

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
  const recommendationHrefs = [
    ...articleHtml.matchAll(/<a class="related-card"[^>]*href="([^"]+)"/g),
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
    /article-knowledge__reading-path[\s\S]*?<nav[^>]*>([\s\S]*?)<\/nav>/,
  )?.[1];
  const readingPathSlugs = readingPathBlock
    ? [...readingPathBlock.matchAll(/data-slug="([^"]+)"/g)].map(
        (match) => match[1],
      )
    : [];
  assert(recommendationSlugs.length <= 3, `推荐阅读超过 3 篇：${article.slug}`);
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
      article.concepts.length <= 3,
      `核心概念超过 3 个：${article.slug} -> ${article.concepts.length}`,
    );
  }
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
  "public/files/civic-orderism-introduction-manual.pdf",
  "public/files/civic-orderism-organization-manual.pdf",
  "public/sitemap.xml",
  "public/index.xml",
  "public/robots.txt",
  "public/static/contentIndex.json",
  "public/static/logo.png",
]) {
  assert(fs.existsSync(path.join(root, file)), `缺少构建产物：${file}`);
}

const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
for (const route of [
  "china-future",
  "institution-design",
  "topics",
  "concepts",
  "start",
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
  migration.filter((item) => item.needsReview).length === 14,
  `人工复核文章应为 14 篇，当前为 ${migration.filter((item) => item.needsReview).length}`,
);

const homepageHtml = fs.readFileSync(
  path.join(publicDir, "index.html"),
  "utf8",
);
const homepageLatestSlugs = [
  ...homepageHtml.matchAll(
    /class="knowledge-card home-article-card"[\s\S]*?data-slug="([^"]+)"/g,
  ),
].map((match) => match[1]);
const expectedLatestSlugs = migration
  .filter(
    (article) => article.status === "published" && article.needsReview !== true,
  )
  .slice(0, 3)
  .map((article) => article.slug);
assert(
  JSON.stringify(homepageLatestSlugs) === JSON.stringify(expectedLatestSlugs),
  `首页最新文章未按发布日期自动排序：${homepageLatestSlugs.join(", ")}`,
);
const homepageText = visiblePageText(homepageHtml);
assert(
  homepageText.includes(
    "建设一条低阻力、低风险、能够和平承接中国未来的政治道路",
  ) && homepageText.includes("公民秩序主义官方网站"),
  "首页缺少和平承接未来的核心定位",
);
assert(
  homepageText.includes("不革命、不普遍清算、不让国家停摆") &&
    homepageText.includes("为什么支持公民秩序主义") &&
    homepageText.includes("为什么参与公民秩序主义") &&
    homepageText.includes("北美非营利法人及董事会筹备"),
  "首页缺少品牌价值、参与理由、核心路线或组织筹备说明",
);
assert(
  homepageHtml.includes('href="/participate"') &&
    homepageHtml.includes('href="/preparation"') &&
    homepageHtml.includes('href="/civic-orderism/peaceful-state-transition"'),
  "首页缺少核心路线、法人筹备或参与入口",
);
assert(
  homepageText.includes("任何认同基本理念的人") &&
    homepageText.includes("北美长期居住者可进一步了解法人和董事会筹备"),
  "首页没有区分普通支持者与北美组织筹备参与者",
);
const homepageSectionOrder = [
  "公民秩序主义官方网站",
  "为什么中国需要一条新的政治道路",
  "为什么支持公民秩序主义",
  "不革命、不普遍清算、不让国家停摆",
  "为什么参与公民秩序主义",
  "公民秩序主义正在从理论走向组织",
  "北美非营利法人及董事会筹备",
  "如何参与",
  "最新研究和文章",
  "继续了解或建立联系",
].map((text) => homepageText.indexOf(text));
assert(
  homepageSectionOrder.every(
    (position, index) =>
      position >= 0 &&
      (index === 0 || position > homepageSectionOrder[index - 1]),
  ),
  "首页模块顺序不符合品牌优先的信息结构",
);

const participateHtml = fs.readFileSync(publicHtml("participate"), "utf8");
const participateText = visiblePageText(participateHtml);
for (const requiredText of [
  "支持公民秩序主义",
  "阅读正式文章",
  "长期关注研究进展",
  "提出意见和建议",
  "参与研究与组织建设",
  "法律与法人治理",
  "财务与内部控制",
  "研究与制度设计",
  "技术与信息安全",
  "其他研究、传播与专业协作不受这一地区限制",
  "筹备参与不是治理身份",
  "不人为制造风险",
  "请不要在初次邮件中发送身份证件",
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
assert(
  primaryEmailPosition >= 0 && secondaryEmailPosition > primaryEmailPosition,
  "参与页邮箱缺失或主备顺序错误",
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
  "理论研究",
  "制度设计",
  "选择注册法域",
  "筹备不等于已经成立",
  "不表示已经取得任何法人、慈善或免税资格",
]) {
  assert(
    preparationText.includes(requiredText),
    `法人筹备页缺少内容：${requiredText}`,
  );
}
for (const requiredText of [
  "治理责任，不是荣誉头衔",
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
  ccpArticleHtml.includes("继续了解公民秩序主义") &&
    ccpArticleHtml.includes('href="/start"') &&
    ccpArticleHtml.includes(
      'href="/civic-orderism/peaceful-state-transition"',
    ) &&
    ccpArticleHtml.includes(
      'href="/civic-orderism/possibility-of-peaceful-political-transition-in-china"',
    ) &&
    ccpArticleHtml.includes('href="/participate"'),
  "解析中共文章缺少统一的四个继续了解入口",
);
assert(
  civicArticleHtml.includes("继续了解公民秩序主义") &&
    civicArticleHtml.includes('href="/start"') &&
    civicArticleHtml.includes(
      'href="/civic-orderism/peaceful-state-transition"',
    ) &&
    civicArticleHtml.includes(
      'href="/civic-orderism/possibility-of-peaceful-political-transition-in-china"',
    ) &&
    civicArticleHtml.includes('href="/participate"'),
  "公民秩序主义文章缺少统一的四个继续了解入口",
);
assert(
  !ccpArticleHtml.includes("阅读筹备宣言") &&
    !civicArticleHtml.includes("阅读筹备宣言"),
  "文章底部仍按文章导向组织筹备页面",
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

const startHtml = fs.readFileSync(publicHtml("start"), "utf8");
const startText = visiblePageText(startHtml);
assert(startText.includes("新读者入口"), "/start 缺少新读者入口标签");
assert(!startText.includes("约 5 分钟"), "/start 仍包含人工时长文案");
assert(startText.includes("4分钟阅读"), "/start 自动阅读时长不再是 4 分钟");
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

for (const route of ["index", "start"]) {
  const htmlPath =
    route === "index" ? path.join(publicDir, "index.html") : publicHtml(route);
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
  const pageText = visiblePageText(fs.readFileSync(htmlPath, "utf8"));
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
