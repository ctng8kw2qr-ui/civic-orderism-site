import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";

const imagePath = "/static/assets/v6/social/civic-orderism-home-social-v1.webp";
const imageUrl = `https://civicorderism.com${imagePath}`;
const home = fs.readFileSync("public/index.html", "utf8");
const meta = (html, key) =>
  html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`),
  )?.[1];
assert.equal(meta(home, "og:image"), imageUrl);
assert.equal(meta(home, "twitter:image"), imageUrl);
assert.equal(meta(home, "twitter:card"), "summary_large_image");
assert.equal(meta(home, "og:title"), "公民秩序主义 · Civic Orderism");
assert.equal(meta(home, "twitter:title"), meta(home, "og:title"));
assert.equal(meta(home, "og:image:width"), "1600");
assert.equal(meta(home, "og:image:height"), "840");
assert.match(home, /rel="canonical" href="https:\/\/civicorderism.com\/"/);
const size = await sharp(`public${imagePath}`).metadata();
assert.equal(size.width, 1600);
assert.equal(size.height, 840);
assert.equal(size.format, "webp");
assert.ok(fs.statSync(`public${imagePath}`).size < 120_000);
// The displayed editorial artwork must remain present in the homepage body.
assert.match(
  home.split("<body")[1],
  /src="\.?\/static\/assets\/v6\/editorial\/editorial-research-areas.webp"/,
);
const article = fs.readFileSync(
  "public/china/what-is-the-ccp-becoming.html",
  "utf8",
);
assert.notEqual(meta(article, "og:image"), imageUrl);
assert.equal(meta(article, "og:image"), meta(article, "twitter:image"));
for (const file of ["public/og-image.png", "public/static/og-image.png"]) {
  assert.ok(fs.existsSync(file));
}
console.log(
  "Homepage social card PASS: metadata, canonical, dimensions, budget, in-page cover, article isolation and retained fallback.",
);
