#!/usr/bin/env node
/**
 * Phase 3 content-classification standard.
 *
 * Every formal article must have exactly one primary section, one category,
 * one subcategory, a real date, a unique URL, and an explicit map entry.
 * `primaryTopic` remains an optional cross-cutting topic, not a substitute
 * for the primary classification.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schema = JSON.parse(
  fs.readFileSync(
    path.join(root, "data/phase3-classification.schema.json"),
    "utf8",
  ),
);
const map = JSON.parse(
  fs.readFileSync(path.join(root, "data/phase2-content-map.json"), "utf8"),
).articles;
const migration = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
);
const baseline = JSON.parse(
  fs.readFileSync(
    path.join(root, "data/historical-articles-baseline.json"),
    "utf8",
  ),
).articles;
const migrationBySlug = new Map(migration.map((item) => [item.slug, item]));
const baselineBySlug = new Map(baseline.map((item) => [item.article_id, item]));
const reviewSlugs = new Set(
  migration
    .filter((item) => item.needsReview === true)
    .map((item) => item.slug),
);
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const allowedSections = Object.keys(schema.primarySections);
const allowedTopics = new Set(schema.primaryTopic.allowed);
const slugSet = new Set();
for (const item of map) {
  check(Boolean(item.slug), "article missing slug");
  check(!slugSet.has(item.slug), `duplicate article map entry: ${item.slug}`);
  slugSet.add(item.slug);
  for (const field of schema.requiredFields) {
    check(
      typeof item[field] === "string" && item[field].trim() !== "",
      `${item.slug || "(unknown)"} missing required field: ${field}`,
    );
  }
  check(
    allowedSections.includes(item.primary_section),
    `${item.slug}: invalid primary_section: ${item.primary_section}`,
  );
  const categories =
    schema.primarySections[item.primary_section]?.categories ?? {};
  check(
    Object.prototype.hasOwnProperty.call(categories, item.category),
    `${item.slug}: invalid category ${item.category} under ${item.primary_section}`,
  );
  check(
    (categories[item.category] ?? []).includes(item.subcategory),
    `${item.slug}: invalid subcategory ${item.subcategory} under ${item.category}`,
  );
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(item.date),
    `${item.slug}: invalid publication date format`,
  );
  check(
    item.url === `/${item.slug}`,
    `${item.slug}: URL must be exactly the historical slug path`,
  );
  if (item.primary_topic) {
    check(
      allowedTopics.has(item.primary_topic),
      `${item.slug}: unknown primary_topic ${item.primary_topic}`,
    );
  }
  check(
    item.phase3_reviewed === (reviewSlugs.has(item.slug) || undefined),
    `${item.slug}: phase3_reviewed flag must match the 13 historical review items`,
  );
  const historical = baselineBySlug.get(item.slug);
  if (historical) {
    check(
      item.source === "content-migration-map.json",
      `${item.slug}: historical article must use source=content-migration-map.json`,
    );
    check(
      item.title === historical.title,
      `${item.slug}: title differs from frozen historical baseline`,
    );
    check(
      item.date === historical.date,
      `${item.slug}: date differs from frozen historical baseline`,
    );
    check(
      item.url === historical.canonical_url,
      `${item.slug}: URL differs from frozen historical baseline`,
    );
    check(
      item.primary_section === historical.primary_section,
      `${item.slug}: primary section differs from frozen historical baseline`,
    );
    check(
      Boolean(migrationBySlug.get(item.slug)),
      `${item.slug}: historical article missing from migration map`,
    );
  } else {
    check(
      item.source === "editorial",
      `${item.slug}: new article must use source=editorial`,
    );
    check(
      !migrationBySlug.has(item.slug),
      `${item.slug}: new article must not be added to historical migration map`,
    );
    check(
      item.phase3_reviewed === undefined,
      `${item.slug}: new article must not carry historical phase3_reviewed`,
    );
  }
}

// Detect article-shaped Markdown files that silently lack a map entry.
const articlePrefixes = [
  "content/theory/",
  "content/china/",
  "content/china-stage/",
  "content/civic-orderism/",
  "content/institution/",
];
const landingSuffixes = ["/index.md"];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return entry.name.endsWith(".md") ? [file] : [];
  });
}
for (const file of walk(path.join(root, "content"))) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (!articlePrefixes.some((prefix) => rel.startsWith(prefix))) continue;
  if (landingSuffixes.some((suffix) => rel.endsWith(suffix))) continue;
  const slug = rel
    .replace(/^content\//, "")
    .replace(/\.md$/, "")
    .replace(/\s+/g, "-");
  if (slug === "china/index" || slug === "theory/index") continue;
  check(
    slugSet.has(slug),
    `formal article lacks classification map entry: ${slug}`,
  );
}

if (failures.length) {
  console.error(`Phase 3 content standard FAILED (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Phase 3 content standard passed: ${map.length} articles; one primary section/category/subcategory each; optional primaryTopic validated.`,
);
