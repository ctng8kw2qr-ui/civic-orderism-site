import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const version = "/static/assets/v6/brand/icons-e7b4c91a/";
const root = "public";
const digest = (file) =>
  createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const html = walk(root).filter((file) => file.endsWith(".html"));
let pages = 0;
for (const file of html) {
  const content = fs.readFileSync(file, "utf8");
  const links = [...content.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => /rel="(?:icon|apple-touch-icon|manifest)"/.test(tag));
  // Redirect aliases immediately navigate to a canonical page; static report
  // artifacts likewise do not use the Quartz page template.
  if (
    links.length === 0 &&
    (/http-equiv="refresh"/.test(content) || !/rel="canonical"/.test(content))
  )
    continue;
  pages++;
  assert.equal(links.length, 6, `${file}: expected complete icon declarations`);
  for (const link of links) {
    const href = link.match(/href="([^"]+)"/)?.[1];
    assert.ok(href?.startsWith(version), `${file}: stale icon URL ${href}`);
    assert.ok(fs.existsSync(path.join(root, href)), `${file}: missing ${href}`);
  }
}
for (const manifest of [
  "public/site.webmanifest",
  `public${version}site-icons.webmanifest`,
]) {
  for (const icon of JSON.parse(fs.readFileSync(manifest, "utf8")).icons) {
    assert.ok(icon.src.startsWith(version), `${manifest}: stale icon`);
    assert.ok(
      fs.existsSync(path.join(root, icon.src)),
      `${manifest}: missing icon`,
    );
  }
}
for (const [alias, source] of [
  ["favicon.ico", "icon-mark.ico"],
  ["favicon-16x16.png", "icon-mark-16x16.png"],
  ["favicon-32x32.png", "icon-mark-32x32.png"],
  ["apple-touch-icon.png", "icon-mark-180x180.png"],
  ["apple-touch-icon-precomposed.png", "icon-mark-180x180.png"],
])
  assert.equal(
    digest(`public/${alias}`),
    digest(`public${version}${source}`),
    `root alias mismatch: ${alias}`,
  );
for (const file of fs.readdirSync(
  `quartz/static${version.replace(/^\/static/, "")}`,
)) {
  if (file === "site-icons.webmanifest") continue;
  assert.equal(
    digest(`public${version}${file}`),
    digest(`quartz/static/assets/v6/brand/${file}`),
    `approved icon changed: ${file}`,
  );
}
console.log(
  `Favicon URL validation PASS: ${pages} templated pages, both manifests, root aliases and approved icon hashes.`,
);
