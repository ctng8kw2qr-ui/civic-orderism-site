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
const readingSequences = readJson("data/reading-sequences.config.json");
const topicSlugs = new Set(topics.map((item) => item.slug));
const conceptSlugs = new Set(concepts.map((item) => item.slug));
const sectionNames = new Set(sections.map((item) => item.name));
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
  .slice(0, 4)
  .map((article) => article.slug);
assert(
  JSON.stringify(homepageLatestSlugs) === JSON.stringify(expectedLatestSlugs),
  `首页最新文章未按发布日期自动排序：${homepageLatestSlugs.join(", ")}`,
);
assert(
  visiblePageText(homepageHtml).includes("用5分钟建立最小阅读框架"),
  "首页缺少统一的新读者时长说明",
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
assert(startText.includes("3分钟阅读"), "/start 自动阅读时长不再是 3 分钟");
assert(
  !visiblePageText(homepageHtml).includes("约 5 分钟"),
  "首页仍包含人工时长文案",
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
