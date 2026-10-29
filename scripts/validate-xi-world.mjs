import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import sharp from "sharp";

const slug = "china/the-world-xi-jinping-sees";
const source = matter(fs.readFileSync(`content/${slug}.md`, "utf8"));
const body = source.content
  .split("\n## 资料与说明")[0]
  .replace(/^# .*$/m, "")
  .replace(/^## /gm, "")
  .replace(/\s/g, "");
assert.equal(
  createHash("sha256").update(body).digest("hex"),
  "985db39a439daed3308d050c7ed5d4094cc8d2b9aaf6816dad86400fa1124f55",
);
assert.equal(source.data.coreJudgments.length, 4);
assert.equal(source.data.relatedArticles.length, 3);
const html = fs.readFileSync(`public/${slug}.html`, "utf8");
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((html.match(/class="article-inst-judgment"/g) || []).length, 1);
assert.ok(html.includes("2026年10月29日"));
assert.ok(html.includes(source.data.subtitle));
assert.ok(html.includes(`href="https://civicorderism.com/${slug}"`));
assert.ok(html.includes('content="article"'));
assert.ok(html.includes('content="summary_large_image"'));
const image = `https://civicorderism.com${source.data.cover}`;
for (const key of ["og:image", "twitter:image"]) {
  const actual = html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`),
  )?.[1];
  assert.equal(actual, image);
}
assert.ok(!/<pre\b/.test(html));
assert.equal((source.content.match(/^## /gm) || []).length, 14);
for (const file of [
  "public/sitemap.xml",
  "public/index.xml",
  "public/index.html",
  "public/articles/all.html",
  "public/china/index.html",
  "public/topics/xi-era.html",
]) {
  assert.ok(
    fs.readFileSync(file, "utf8").includes(slug),
    `missing ${slug} in ${file}`,
  );
}
const file = `quartz/static${source.data.cover.replace(/^\/static/, "")}`;
const meta = await sharp(file).metadata();
assert.equal(meta.width, 1600);
assert.equal(meta.height, 842);
assert.ok(fs.statSync(file).size <= 180000);
assert.ok(html.includes(`alt="${source.data.coverAlt}"`));
console.log(
  "Xi world PASS: exact original body, 12 sections and conclusion, title/subtitle/date, core judgments, links, indexes, RSS/sitemap, cover/OG identity and image budget.",
);
