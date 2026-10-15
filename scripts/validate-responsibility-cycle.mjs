import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";

const slug = "china/bureaucratic-responsibility-cycle";
const html = fs.readFileSync(`public/${slug}.html`, "utf8");
const title = "官场“文革”：从增长政治到责任政治";
const social =
  "https://civicorderism.com/static/assets/v6/social/social-bureaucratic-responsibility-cycle.webp";
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.ok(html.includes(title));
assert.ok(html.includes("2026年10月15日"));
assert.ok(html.includes("<strong>“终身问责、倒查责任”</strong>"));
assert.ok(!html.includes("**"));
assert.ok(!/<pre\b/.test(html));
for (const property of ["og:image", "twitter:image"]) {
  assert.ok(
    html.includes(`content="${social}"`),
    `${property} uses dedicated social image`,
  );
}
assert.ok(html.includes('content="summary_large_image"'));
assert.ok(html.includes(`href="https://civicorderism.com/${slug}"`));
for (const file of [
  "public/sitemap.xml",
  "public/index.xml",
  "public/index.html",
  "public/articles/all.html",
  "public/china/index.html",
]) {
  assert.ok(
    fs.readFileSync(file, "utf8").includes(slug),
    `article present in ${file}`,
  );
}
for (let i = 1; i <= 6; i++) {
  assert.ok(html.includes(`id="source-${i}"`));
  assert.ok(html.includes(`href="#source-${i}"`));
}
for (const [path, width, height, budget] of [
  [
    "editorial/source/editorial-bureaucratic-responsibility-cycle.png",
    2000,
    800,
    Infinity,
  ],
  [
    "editorial/editorial-bureaucratic-responsibility-cycle.webp",
    1600,
    842,
    180 * 1024,
  ],
  [
    "social/social-bureaucratic-responsibility-cycle.webp",
    1200,
    630,
    120 * 1024,
  ],
]) {
  const file = `quartz/static/assets/v6/${path}`;
  const meta = await sharp(file).metadata();
  assert.equal(meta.width, width);
  assert.equal(meta.height, height);
  assert.ok(fs.statSync(file).size <= budget);
}
assert.ok(
  html.includes(
    'alt="抽象圆形会议桌上，多双手沿环形方向传递文件，中央放着黑色档案盒和成叠纸张。"',
  ),
);
assert.ok(
  fs.readFileSync("public/articles/all.html", "utf8").includes("103 篇研究"),
);
console.log(
  "Responsibility cycle PASS: article, date, typography, sources, canonical, sitemap, RSS, indexes, dedicated social crop, alt and image budgets.",
);
