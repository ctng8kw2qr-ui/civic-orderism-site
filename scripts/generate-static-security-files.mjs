import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve("public");

if (!fs.existsSync(outputDir)) {
  throw new Error(
    "public directory does not exist. Run the Quartz build before generating static security files.",
  );
}

const files = {
  "robots.txt": `User-agent: *
Allow: /

Sitemap: https://civicorderism.com/sitemap.xml
`,
  _headers: `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
`,
  _redirects: `/article_priority_index  /  301
/article_summaries       /  301
/start                   /start-here  301
/organization-manual     /preparation  301
`,
};

for (const [filename, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(outputDir, filename), body, "utf8");
}

const articlesHtml = path.join(outputDir, "articles.html");
if (fs.existsSync(articlesHtml)) {
  const articlesDir = path.join(outputDir, "articles");
  fs.mkdirSync(articlesDir, { recursive: true });
  fs.copyFileSync(articlesHtml, path.join(articlesDir, "index.html"));
}

/* Two pages are published both as /page and /page/index.html:
   - articles: the copy made above (the flat page is generated at the root);
   - preparation: Quartz uses preparation.md as the folder index for the
     preparation/ directory, and stamps the folder-index slug on it.
   Both artifacts are served one level deeper, so their relative "./" asset and
   link references must be re-rooted to "../" or stylesheets, scripts and body
   links resolve one directory too deep. */
const depthCorrectedPages = [
  path.join(outputDir, "articles", "index.html"),
  path.join(outputDir, "preparation", "index.html"),
];
for (const pagePath of depthCorrectedPages) {
  if (!fs.existsSync(pagePath)) continue;
  const html = fs.readFileSync(pagePath, "utf8");
  const corrected = html.replace(
    /(\b(?:href|src)=")\.\//g,
    "$1../",
  ).replace(/(fetch\(")\.\//g, "$1../");
  fs.writeFileSync(pagePath, corrected, "utf8");
}

console.log("Generated static security files.");
