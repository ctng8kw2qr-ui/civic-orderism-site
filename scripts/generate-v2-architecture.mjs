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
  const topic = article.topics
    .map((slug) => topicBySlug.get(slug))
    .find((item) => item?.status === "published");
  const concept = article.concepts
    .map((slug) => conceptBySlug.get(slug))
    .find((item) => item?.status === "published");
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
      const count = items.filter((article) =>
        article.topics.includes(topic.slug),
      ).length;
      return `<a class="topic-entry-card" href="/topics/${topic.slug}"><strong>${topic.name}</strong><span>${topic.description}</span><small>${count} 篇相关文章</small></a>`;
    })
    .join("\n");
  const relatedConcepts = [
    ...new Set(items.flatMap((article) => article.concepts)),
  ]
    .map((slug) => conceptBySlug.get(slug))
    .filter((concept) => concept?.status === "published")
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

const transitionArticleSlug = "civic-orderism/peaceful-state-transition";
const transitionArticle = articleBySlug.get(transitionArticleSlug);
if (!isEligibleArticle(transitionArticle)) {
  throw new Error(
    `Homepage transition article is unavailable: ${transitionArticleSlug}`,
  );
}
const latestArticles = articles
  .filter(isEligibleArticle)
  .filter((article) => article.slug !== transitionArticleSlug)
  .slice(0, 6);

const coreJudgments = [
  {
    title: "中国正在进入高脆弱态",
    description:
      "系统仍然能够运行，但局部问题更容易形成跨区域、跨部门和跨层级的连锁反应。",
    href: "/concepts/high-fragility",
  },
  {
    title: "中共统治术正在进入偿债期",
    description:
      "短期控制工具曾经压低显性风险，也在持续累积财政、组织信用与治理成本。",
    href: "/topics/ccp-governance",
  },
  {
    title: "官僚系统正在由高压运转转向官僚休克",
    description:
      "不是所有人都不想做事，而是做事、担责和保持沉默之间的风险关系已经失衡。",
    href: "/concepts/bureaucratic-shock",
  },
  {
    title: "社会正在经历持续性的秩序蒸发",
    description:
      "程序仍然存在，但越来越多具体问题找不到稳定、可信、低成本的解决出口。",
    href: "/concepts/order-evaporation",
  },
  {
    title: "第二次改革开放式的历史机会很难重现",
    description:
      "组织处境、利益结构与外部环境已经改变，局部松动不等于新的系统性改革窗口。",
    href: "/china-stage/ccp-second-reform-opening-possibility",
  },
  {
    title: "信息化时代需要新的国家治理结构",
    description:
      "复杂社会不能只依赖个人判断，而需要能够吸收信息、稳定执行并持续纠错的制度系统。",
    href: "/civic-orderism/state-must-rely-on-systems-not-drivers",
  },
];

const roadmapSteps = [
  "高脆弱态",
  "官僚系统高压与休克",
  "社会秩序蒸发",
  "旧制度运行成本持续上升",
  "建立低摩擦转轨机制",
  "形成新的制度框架",
  "进入信息化时代治理结构",
];

function roadmapMarkup() {
  return `<div class="transition-roadmap" role="list" aria-label="从高脆弱态到制度转轨的七个阶段">
${roadmapSteps
  .map(
    (step, index) =>
      `<div class="transition-roadmap__step" role="listitem"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step}</strong></div>${index < roadmapSteps.length - 1 ? '<span class="transition-roadmap__arrow" aria-hidden="true">→</span>' : ""}`,
  )
  .join("\n")}
</div>`;
}

const onboardingCards = readingPaths.onboarding
  .map((item, index) => {
    const article = item.slug ? articleBySlug.get(item.slug) : undefined;
    if (item.slug && !isEligibleArticle(article)) {
      throw new Error(
        `Homepage onboarding article is unavailable: ${item.slug}`,
      );
    }
    const href = item.href ?? `/${article.slug}`;
    const readingTime =
      item.readingTime ?? `${article.readingMinutes} 分钟阅读`;
    return `<a class="onboarding-card" href="${href}"><span class="onboarding-card__number">${String(index + 1).padStart(2, "0")}</span><span class="onboarding-card__body"><strong>${item.title}</strong><span>${item.description}</span></span><small>${readingTime}</small></a>`;
  })
  .join("\n");

const theorySystemCards = sections
  .map(
    (section) =>
      `<a class="theory-system-card" href="/${section.slug}"><strong>${section.name}</strong><span>${section.description}</span><small>进入栏目 →</small></a>`,
  )
  .join("\n");

writeContent(
  "index.md",
  `${yamlFrontmatter({ title: site.name, description: site.description, contentType: "首页", aliases: ["article_priority_index", "article_summaries"] })}

<section class="v2-hero home-platform-hero">
  <p class="home-kicker">${site.englishName}</p>
  <h1><img src="/static/logo.png" alt="" />${site.name}</h1>
  <p class="v2-hero__tagline">为中国提供一条低摩擦、可预期、有保障的转轨路线</p>
  <div class="home-platform-hero__copy"><p>中国面对的已经不只是经济、财政或官场中的局部问题，而是旧有治理结构正在逐渐失去修复能力。</p><p>公民秩序主义不以革命、清算和社会撕裂为前提，而是尝试在国家、社会与官僚系统之间，建立一条清晰、稳健、可执行的转轨道路。</p></div>
  <div class="v2-actions"><a class="v2-button v2-button--primary" href="/start">5分钟了解公民秩序主义</a><a class="v2-button v2-button--secondary" href="/files/civic-orderism-organization-manual.pdf">阅读组织手册</a><a class="v2-button v2-button--text" href="#core-judgments">查看核心判断</a></div>
</section>

<section class="home-section home-why-now">
  <div class="home-section-intro"><p class="resource-label">现实起点</p><h2>为什么是现在？</h2><p>中国正在进入一个高脆弱阶段。过去依靠增长、财政扩张、地方竞争和官僚激励维持的治理方式，正在进入偿债期。</p></div>
  <div class="home-reality-grid"><article><strong>官僚系统进入高压损耗</strong><p>压力、追责与资源收缩同步出现，稳定执行逐渐让位于风险规避。</p></article><article><strong>社会秩序成本持续上升</strong><p>越来越多问题需要付出更高时间、信任与协调成本，才能得到不稳定的处理。</p></article><article><strong>旧治理结构修复能力下降</strong><p>制度并非突然倒塌，而是在变得更昂贵、迟钝，并逐渐失去自我纠错能力。</p></article></div>
  <p class="home-question">在革命不可取、旧路不可持续的情况下，中国如何完成一次低摩擦转轨？</p>
</section>

<section class="home-section home-stakeholders">
  <div class="home-section-intro"><p class="resource-label">转轨的现实条件</p><h2>官僚、社会、国家三者诉求的交汇</h2><p>制度转轨不能只表达一种立场，还必须回答不同参与者如何获得稳定预期，以及国家能力如何得到接续。</p></div>
  <div class="stakeholder-grid"><article><strong>官僚系统</strong><p>需要退路、尊严、安全与稳定预期。</p></article><article><strong>社会</strong><p>需要秩序、保障、公平与基本尊严。</p></article><article><strong>国家</strong><p>需要连续性、可治理性与低风险转型。</p></article></div>
  <div class="transition-principles"><p><strong>不是</strong>推翻一切，<span>而是完成转轨。</span></p><p><strong>不是</strong>全面清算，<span>而是明确责任边界。</span></p><p><strong>不是</strong>制造新的恐惧，<span>而是建立新的制度预期。</span></p></div>
  <p class="home-stakeholders__summary">公民秩序主义所追求的，是一条让国家不失控、社会不撕裂、官僚系统不必绝望的转轨道路。<a href="/${transitionArticle.slug}">阅读完整转轨判断 →</a></p>
</section>

<section class="home-section" id="core-judgments">
  <div class="home-section-intro"><p class="resource-label">理解现实</p><h2>核心判断</h2><p>理解公民秩序主义，先理解我们对现实的基本判断。</p></div>
  <div class="core-judgment-grid">${coreJudgments.map((item, index) => `<a class="core-judgment-card" href="${item.href}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.title}</strong><p>${item.description}</p><small>继续阅读 →</small></a>`).join("\n")}</div>
</section>

<section class="home-section">
  <div class="home-section-intro"><p class="resource-label">理论路线图</p><h2>从高脆弱态到制度转轨</h2><p>公民秩序主义不是等待旧秩序彻底崩溃，而是在系统仍具有基本组织能力时，提前建立新的制度接口和转轨路径。</p></div>
  ${roadmapMarkup()}
</section>

<section class="home-section">
  <div class="home-section-heading"><div><p class="resource-label">新读者路径</p><h2>第一次来到本站？</h2></div><a href="/articles">查看阅读地图 →</a></div>
  <div class="onboarding-list">${onboardingCards}</div>
</section>

<section class="home-section">
  <div class="home-section-heading"><div><p class="resource-label">四个相互衔接的入口</p><h2>理论体系</h2></div><a href="/start">从入门页开始 →</a></div>
  <div class="theory-system-grid">${theorySystemCards}</div>
</section>

<section class="home-section">
  <div class="home-section-heading"><h2>最新文章</h2><a href="/articles">查看全部文章 →</a></div>
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
  <header class="start-page__header"><p class="resource-label">新读者入口 · 约 5 分钟</p><h1>5分钟了解公民秩序主义</h1><p>这里不展开完整理论，只回答五个最基本的问题：现实发生了什么、旧道路为何失效、公民秩序主义是什么、不是什么，以及接下来应该读什么。</p></header>
  <div class="start-page__sections">
    <section><span>01</span><div><h2>中国面对的不是单一问题</h2><p>经济、财政、官场、社会信任与治理能力问题正在相互叠加。局部压力通过组织和责任链相互传导，使整个系统更容易受到单点失误与资源收缩的影响。</p></div></section>
    <section><span>02</span><div><h2>为什么旧道路越来越难继续</h2><p>过去依靠增长、地方竞争、官僚激励和外部机会形成的平衡正在失效。治理成本不断上升，反馈和纠错能力却在下降，局部调整越来越难恢复长期预期。</p></div></section>
    <section><span>03</span><div><h2>公民秩序主义是什么</h2><p>公民秩序主义不是单纯的价值口号，而是一条制度转轨路线。它试图在秩序、自由、责任、尊严和国家连续性之间建立新的平衡，让公共问题能够进入系统并得到持续处理。</p></div></section>
    <section><span>04</span><div><h2>公民秩序主义不是什么</h2><ul><li>不是革命路线，也不是以社会失控换取制度变化。</li><li>不是全面清算，也不是制造新的集体恐惧。</li><li>不是简单复制西方政党政治。</li><li>不是只谈抽象价值，却不回答转型如何发生。</li></ul></div></section>
    <section><span>05</span><div><h2>建议阅读顺序</h2><ol><li><a href="/china">解析中共：理解旧系统如何运行与失效</a></li><li><a href="/civic-orderism/what-civic-orderism-solves-if-you-read-only-one">公民秩序主义理论总纲</a></li><li><a href="/${transitionArticle.slug}">官僚、社会、国家三者诉求的交汇</a></li><li><a href="/institution-design">制度设计：进入具体机制</a></li><li><a href="/files/civic-orderism-organization-manual.pdf">公民秩序主义组织手册</a></li></ol></div></section>
  </div>
  <div class="start-page__actions"><a class="v2-button v2-button--primary" href="/#core-judgments">继续阅读核心判断</a><a class="v2-button v2-button--secondary" href="/files/civic-orderism-organization-manual.pdf">阅读组织手册</a></div>
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
