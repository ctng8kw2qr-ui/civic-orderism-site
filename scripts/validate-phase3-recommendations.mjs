#!/usr/bin/env node
/**
 * Phase 3 recommendation integrity.
 * The visual card system is unchanged; this checks the data that feeds it.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const map = JSON.parse(
  fs.readFileSync(path.join(root, "data/phase2-content-map.json"), "utf8"),
).articles;
const bySlug = new Map(map.map((item) => [item.slug, item]));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const clean = (value) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const resolveSlug = (href, base) => {
  try {
    const url = new URL(href, `https://civicorderism.com${base}`);
    return decodeURI(url.pathname)
      .replace(/^\//, "")
      .replace(/\.html$/, "")
      .replace(/\/$/, "");
  } catch {
    return "";
  }
};
let articlesWithRecommendations = 0;
let totalCards = 0;
for (const article of map) {
  const file = path.join(publicDir, `${article.slug}.html`);
  check(fs.existsSync(file), `article page missing: ${article.slug}`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  const sectionMatch = html.match(
    /<section class="article-continuation[\s\S]*?<\/section>/,
  );
  if (!sectionMatch) continue;
  articlesWithRecommendations += 1;
  const section = sectionMatch[0];
  const cards = [
    ...section.matchAll(
      /<a[^>]*class="article-continuation-card"[^>]*href="([^"]+)"[\s\S]*?<span class="article-continuation-card__title">([\s\S]*?)<\/span>/g,
    ),
  ].map((match) => ({
    target: resolveSlug(match[1], `/${article.slug}`),
    title: clean(match[2]),
  }));
  check(
    cards.length > 0,
    `recommendation section has no cards: ${article.slug}`,
  );
  const seen = new Set();
  for (const card of cards) {
    totalCards += 1;
    check(
      card.target !== article.slug,
      `recommendation points to itself: ${article.slug}`,
    );
    check(
      Boolean(card.target),
      `recommendation href is invalid: ${article.slug}`,
    );
    check(
      !seen.has(card.target),
      `duplicate recommendation: ${article.slug} -> ${card.target}`,
    );
    seen.add(card.target);
    const target = bySlug.get(card.target);
    check(
      Boolean(target),
      `recommendation target missing from map: ${article.slug} -> ${card.target}`,
    );
    if (target) {
      check(
        card.title === target.title,
        `recommendation title mismatch: ${article.slug} -> ${card.target}`,
      );
      if (
        article.primary_section === "政治路线" &&
        article.section !== "核心政治总论"
      ) {
        check(
          target.primary_section === "政治路线",
          `route article recommends non-route article: ${article.slug} -> ${card.target}`,
        );
      }
    }
  }
}

if (failures.length) {
  console.error(
    `Phase 3 recommendation validation FAILED (${failures.length})`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Phase 3 recommendations passed: ${articlesWithRecommendations} article sections; ${totalCards} cards; no self/duplicate/broken/title-mismatch/route-cross recommendations.`,
);
