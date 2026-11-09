#!/usr/bin/env node
/**
 * Article registry checks.
 *
 * Two different contracts:
 *   1. The 105 historical articles are frozen in
 *      data/historical-articles-baseline.json: URL, title and primary section
 *      may not silently change or disappear.
 *   2. New editorial articles (source=editorial) are allowed, but need a
 *      unique slug/URL, a legal primary classification, a built page, and
 *      coverage in /articles/all, sitemap and search.
 *
 * The three primary counts are dynamic: their sum must equal the current
 * number of articles. The historical split 27/55/23 remains protected.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const baseline = JSON.parse(
  fs.readFileSync(
    path.join(root, "data/historical-articles-baseline.json"),
    "utf8",
  ),
).articles;
const current = JSON.parse(
  fs.readFileSync(path.join(root, "data/phase2-content-map.json"), "utf8"),
).articles;
const migration = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
);
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const baselineBySlug = new Map(baseline.map((item) => [item.article_id, item]));
const currentBySlug = new Map(current.map((item) => [item.slug, item]));
const migrationSlugs = new Set(migration.map((item) => item.slug));
const currentSlugs = new Set(current.map((item) => item.slug));

check(
  baseline.length === 105,
  `historical baseline must have 105 articles, got ${baseline.length}`,
);
check(
  baselineBySlug.size === baseline.length,
  "historical baseline contains duplicate article_id",
);
check(
  currentBySlug.size === current.length,
  "current content map contains duplicate slug",
);
check(
  migrationSlugs.size === baseline.length &&
    [...migrationSlugs].every((slug) => baselineBySlug.has(slug)),
  "historical migration map and baseline article sets differ",
);

const allowedSections = new Set(["政治路线", "政治经济观察", "理论与制度"]);
for (const item of baseline) {
  const now = currentBySlug.get(item.article_id);
  check(Boolean(now), `historical article disappeared: ${item.article_id}`);
  if (!now) continue;
  check(
    now.url === item.canonical_url,
    `historical URL changed: ${item.article_id}`,
  );
  check(
    now.title === item.title,
    `historical title changed: ${item.article_id}`,
  );
  check(
    now.primary_section === item.primary_section,
    `historical primary section changed: ${item.article_id}`,
  );
  check(
    now.source === "content-migration-map.json",
    `historical article must keep source=content-migration-map.json: ${item.article_id}`,
  );
}

for (const item of current) {
  check(Boolean(item.slug), "current article missing slug");
  check(Boolean(item.title), `${item.slug}: missing title`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(item.date), `${item.slug}: invalid date`);
  check(
    allowedSections.has(item.primary_section),
    `${item.slug}: invalid primary section`,
  );
  check(item.url === `/${item.slug}`, `${item.slug}: URL must equal /slug`);
  check(
    fs.existsSync(path.join(publicDir, `${item.slug}.html`)),
    `${item.slug}: article page was not built`,
  );
  if (baselineBySlug.has(item.slug)) {
    check(
      migrationSlugs.has(item.slug),
      `${item.slug}: historical article missing from migration map`,
    );
  } else {
    check(
      item.source === "editorial",
      `${item.slug}: new article must use source=editorial`,
    );
    check(
      !migrationSlugs.has(item.slug),
      `${item.slug}: new article must not be added to historical migration map`,
    );
  }
}

const counts = current.reduce((acc, item) => {
  acc[item.primary_section] = (acc[item.primary_section] ?? 0) + 1;
  return acc;
}, {});
check(
  Object.values(counts).reduce((sum, count) => sum + count, 0) ===
    current.length,
  "primary-section counts do not sum to total article count",
);
for (const section of allowedSections) {
  check(
    (counts[section] ?? 0) >=
      baseline.filter((item) => item.primary_section === section).length,
    `primary section lost historical articles: ${section}`,
  );
}

// /articles/all must contain exactly the current article URL set, once each.
const allPagePath = [
  path.join(publicDir, "articles", "all", "index.html"),
  path.join(publicDir, "articles", "all.html"),
].find((file) => fs.existsSync(file));
check(Boolean(allPagePath), "/articles/all was not built");
let allPageLinks = [];
if (allPagePath) {
  const html = fs.readFileSync(allPagePath, "utf8");
  allPageLinks = [...html.matchAll(/href="([^"]+)"/g)]
    .map((match) => {
      try {
        return new URL(
          match[1],
          "https://civicorderism.com/articles/all",
        ).pathname
          .replace(/^\//, "")
          .replace(/\.html$/, "")
          .replace(/\/$/, "");
      } catch {
        return "";
      }
    })
    .filter((slug) => currentSlugs.has(slug));
  const allSet = new Set(allPageLinks);
  check(
    allSet.size === allPageLinks.length,
    "/articles/all contains duplicate article URL",
  );
  for (const slug of currentSlugs) {
    check(allSet.has(slug), `/articles/all missing: ${slug}`);
  }
}

// Sitemap and search index must cover every current article.
const sitemap = fs.readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
const search = JSON.parse(
  fs.readFileSync(path.join(publicDir, "static/contentIndex.json"), "utf8"),
);
for (const slug of currentSlugs) {
  check(
    sitemap.includes(`https://civicorderism.com/${slug}`),
    `sitemap missing article: ${slug}`,
  );
  check(Boolean(search[slug]), `search index missing article: ${slug}`);
}

const historicalCounts = baseline.reduce((acc, item) => {
  acc[item.primary_section] = (acc[item.primary_section] ?? 0) + 1;
  return acc;
}, {});
check(historicalCounts["政治路线"] === 27, "historical route count must be 27");
check(
  historicalCounts["政治经济观察"] === 55,
  "historical observation count must be 55",
);
check(
  historicalCounts["理论与制度"] === 23,
  "historical theory count must be 23",
);

if (failures.length) {
  console.error(`Article registry validation FAILED (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Article registry passed: ${current.length} articles; historical 105 protected; route ${counts["政治路线"]} / observation ${counts["政治经济观察"]} / theory ${counts["理论与制度"]}; all page, sitemap and search cover every article.`,
);
