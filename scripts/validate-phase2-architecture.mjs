#!/usr/bin/env node
/**
 * Phase 2 information-architecture checks.
 * These are deliberately separate from the historical v2 editorial checks:
 * v2 protects the old article pages; this script protects the new hub/list
 * ownership and the preserved article set.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const migration = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
);
const phase2 = JSON.parse(
  fs.readFileSync(path.join(root, "data/phase2-content-map.json"), "utf8"),
).articles;
const baseline = JSON.parse(
  fs.readFileSync(
    path.join(root, "data/historical-articles-baseline.json"),
    "utf8",
  ),
).articles;
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (url) => {
  const clean = url.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    path.join(publicDir, clean, "index.html"),
    path.join(publicDir, `${clean}.html`),
  ];
  const found = candidates.find((file) => fs.existsSync(file));
  if (!found) throw new Error(`missing public page: ${url}`);
  return fs.readFileSync(found, "utf8");
};
const text = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
const links = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const resolve = (href, base) => {
  try {
    return new URL(href, `https://civicorderism.com${base}`).pathname;
  } catch {
    return href;
  }
};
const pageLinks = (url) =>
  new Set(links(read(url)).map((href) => resolve(href, url)));
const articleSet = new Set(baseline.map((item) => item.article_id));
const phase2Set = new Set(phase2.map((item) => item.slug));
const bySlug = new Map(phase2.map((item) => [item.slug, item]));

check(
  baseline.length === 105,
  `historical baseline must contain 105 articles, got ${baseline.length}`,
);
check(
  migration.length === baseline.length,
  "historical migration map length changed",
);
check(
  phase2Set.size === phase2.length,
  "phase2 map contains duplicate article slug",
);
check(
  [...articleSet].every((slug) => phase2Set.has(slug)),
  "phase2 map must contain every historical article exactly once",
);

const primaryCounts = phase2.reduce(
  (acc, item) => (
    (acc[item.primary_section] = (acc[item.primary_section] ?? 0) + 1),
    acc
  ),
  {},
);
const historicalCounts = baseline.reduce(
  (acc, item) => (
    (acc[item.primary_section] = (acc[item.primary_section] ?? 0) + 1),
    acc
  ),
  {},
);
check(historicalCounts["政治路线"] === 27, "historical route count must be 27");
check(
  historicalCounts["政治经济观察"] === 55,
  "historical observation count must be 55",
);
check(
  historicalCounts["理论与制度"] === 23,
  "historical theory count must be 23",
);
check(
  Object.values(primaryCounts).reduce((sum, count) => sum + count, 0) ===
    phase2.length,
  "primary section counts must sum to the current article total",
);

for (const item of phase2) {
  const file = path.join(publicDir, `${item.slug}.html`);
  check(fs.existsSync(file), `article URL missing: /${item.slug}`);
}

const latest = read("/china/latest/");
const latestLinks = pageLinks("/china/latest/");
const observation = phase2.filter(
  (item) => item.primary_section === "政治经济观察",
);
for (const item of observation) {
  check(
    latestLinks.has(item.url),
    `latest observation list missing: ${item.slug}`,
  );
}

const routeResearch = read("/civic-orderism/research/");
const routeLinks = pageLinks("/civic-orderism/research/");
const routeArticles = phase2.filter(
  (item) => item.primary_section === "政治路线",
);
for (const item of routeArticles) {
  check(routeLinks.has(item.url), `route research list missing: ${item.slug}`);
}

const categories = {
  中共政治: { path: "/china/ccp-politics/" },
  中国经济: { path: "/china/china-economy/" },
  官僚体系: { path: "/china/bureaucracy/" },
};
for (const [category, spec] of Object.entries(categories)) {
  const categoryLinks = pageLinks(spec.path);
  const items = phase2.filter((item) => item.category === category);
  check(items.length >= 1, `${category} has no articles`);
  for (const item of items) {
    check(
      categoryLinks.has(item.url),
      `${category} page missing: ${item.slug}`,
    );
  }
}

const chinaHome = read("/china/");
const chinaText = text(chinaHome);
check(chinaHome.includes("<h1"), "china home missing H1");
check(
  chinaText.includes("中国政治经济观察"),
  "china home must present 中国政治经济观察",
);
const chinaHomeLinks = pageLinks("/china/");
for (const href of [
  "/china/latest/",
  "/china/ccp-politics/",
  "/china/china-economy/",
  "/china/bureaucracy/",
  "/china/analysis/",
]) {
  check(chinaHomeLinks.has(href), `china home missing link: ${href}`);
}
const analysis = read("/china/analysis/");
check(
  text(analysis).includes("解析中共"),
  "analysis page must preserve 解析中共",
);
check(
  analysis.includes('id="china-stage-01"'),
  "analysis page missing stage 01",
);

const economic = read("/civic-orderism/economic-redemption/");
const economicText = text(economic);
for (const phrase of [
  "经济赎买是一种以政治协商和资产合法化安排为核心的和平政治转轨机制",
  "不能仅凭实际占有就被视为具有正当产权",
  "不承认这些资产天然属于现有占有人",
  "降低和平政治转轨的阻力",
  "不革命",
  "不清算",
  "和平政治转轨",
  "国家连续运行",
  "无条件免除刑事责任",
]) {
  check(
    economicText.includes(phrase),
    `economic-redemption missing: ${phrase}`,
  );
}
const route = read("/civic-orderism/");
const routePageLinks = pageLinks("/civic-orderism/");
check(
  routePageLinks.has("/civic-orderism/economic-redemption/"),
  "route page missing economic redemption link",
);

const theory = read("/theory/");
const theoryText = text(theory);
for (const phrase of [
  "理论与制度",
  "理论总论",
  "国家权力结构",
  "行政与监督",
  "司法与宪政",
  "制度研究档案",
  "延伸研究",
]) {
  check(theoryText.includes(phrase), `theory hub missing: ${phrase}`);
}
const theoryLinks = pageLinks("/theory/");
for (const href of [
  "/institution-design/",
  "/institution/",
  "/institutional-architecture",
  "/china/analysis/",
]) {
  check(theoryLinks.has(href), `theory hub missing link: ${href}`);
}

const institution = read("/institution/");
const institutionText = text(institution);
check(institutionText.includes("制度机制"), "institution page missing H1 text");
check(
  institutionText.includes("19 篇制度研究文章"),
  "institution page must state 19 total (16+3)",
);
check(
  pageLinks("/institution/").has("/institution-design/"),
  "institution page missing main entry",
);
check(
  !institution.includes('class="knowledge-card"'),
  "institution page must not duplicate article cards",
);

const design = read("/institution-design/");
const designText = text(design);
check(
  designText.includes("19 篇制度研究文章"),
  "institution-design must state 19 total (16+3)",
);
for (const slug of [
  "civic-orderism/why-weaken-party-politics",
  "civic-orderism/why-emphasize-reciprocity-and-equality",
  "civic-orderism/why-focus-on-invisible-power-nodes",
]) {
  check(
    design.includes(`/${slug}`),
    `institution-design missing extension item: ${slug}`,
  );
}
check(
  route.includes("16 设计 + 3 延伸"),
  "route page must explain 19 = 16 design + 3 extension",
);

const theoryEntries = phase2.filter(
  (item) => item.primary_section === "理论与制度",
);
for (const item of theoryEntries.filter(
  (entry) => entry.category === "制度设计",
)) {
  check(
    design.includes(`/${item.slug}`),
    `institution-design missing design article: ${item.slug}`,
  );
}
const theoryHome = read("/theory/");
for (const item of theoryEntries.filter(
  (entry) => entry.category === "理论总论" || entry.category === "司法与宪政",
)) {
  check(
    theoryHome.includes(`/${item.slug}`),
    `theory hub missing reclassified article: ${item.slug}`,
  );
}

for (const [url, label] of [
  ["/china/", "中国政治经济观察"],
  ["/china/latest/", "最新观察"],
  ["/china/ccp-politics/", "中共政治"],
  ["/china/china-economy/", "中国经济"],
  ["/china/bureaucracy/", "官僚体系"],
  ["/china/analysis/", "解析中共"],
  ["/civic-orderism/economic-redemption/", "经济赎买"],
  ["/theory/", "理论与制度"],
]) {
  const html = read(url);
  check(text(html).includes(label), `${url} missing visible label ${label}`);
  check(
    (html.match(/<h1\b/g) ?? []).length === 1,
    `${url} must have exactly one H1`,
  );
  check(/rel="canonical"/.test(html), `${url} missing canonical`);
}

if (failures.length) {
  console.error(`Phase 2 validation FAILED (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Phase 2 validation passed: ${phase2.length} articles; route ${primaryCounts["政治路线"]} / observation ${primaryCounts["政治经济观察"]} / theory ${primaryCounts["理论与制度"]}; 7 new pages checked.`,
);
