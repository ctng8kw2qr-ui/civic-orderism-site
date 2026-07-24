import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const contentDir = path.join(root, "content");
const articleDirectories = new Set([
  "theory",
  "china",
  "china-stage",
  "civic-orderism",
  "institution",
]);
const articleSlugs = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
).map((article) => article.slug);

const forbiddenSourcePatterns = [
  {
    name: "连续 <br>",
    pattern: /<br\s*\/?>(?:\s|&nbsp;)*<br\s*\/?>/gi,
  },
  {
    name: "空 HTML 段落",
    pattern: /<p(?:\s+[^>]*)?>\s*(?:&nbsp;)?\s*<\/p>/gi,
  },
  {
    name: "正文内联间距样式",
    pattern: /style\s*=\s*["'][^"']*(?:margin|line-height)[^"']*["']/gi,
  },
  {
    name: "&nbsp; 间距",
    pattern: /&nbsp;/gi,
  },
  {
    name: "连续多余空行",
    pattern: /\n[\t ]*\n[\t ]*\n/g,
  },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
    return [];
  });
}

function isArticleFile(filePath) {
  const relative = path.relative(contentDir, filePath);
  const [directory] = relative.split(path.sep);
  return (
    articleDirectories.has(directory) && path.basename(relative) !== "index.md"
  );
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split("\n").length;
}

const articleFiles = walk(contentDir).filter(isArticleFile);
const errors = [];
const intentionalBreaks = [];

for (const filePath of articleFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const relative = path.relative(root, filePath);

  for (const { name, pattern } of forbiddenSourcePatterns) {
    for (const match of source.matchAll(pattern)) {
      errors.push(
        `${relative}:${lineNumberFor(source, match.index ?? 0)} 包含${name}`,
      );
    }
  }

  const breakCount = [...source.matchAll(/<br\s*\/?>/gi)].length;
  if (breakCount > 0) {
    intentionalBreaks.push({ file: relative, count: breakCount });
  }

  if (!/^#\s+\S/m.test(source)) {
    errors.push(`${relative} 缺少文章主标题`);
  }
}

const contentComponent = fs.readFileSync(
  path.join(root, "quartz/components/pages/Content.tsx"),
  "utf8",
);
if (
  !contentComponent.includes('class="article-content"') ||
  !contentComponent.includes("isArticleSlug")
) {
  errors.push("Content.tsx 未使用统一文章正文容器");
}

const builtArticles = articleSlugs.map((slug) => ({
  slug,
  file: path.join(root, "public", `${slug}.html`),
}));
const hasBuiltSite = builtArticles.some(({ file }) => fs.existsSync(file));

if (hasBuiltSite) {
  for (const { slug, file } of builtArticles) {
    if (!fs.existsSync(file)) {
      errors.push(`构建产物缺失：public/${slug}.html`);
      continue;
    }

    const html = fs.readFileSync(file, "utf8");
    const articleStart = html.search(
      /<article class="[^"]*\bpopover-hint\b[^"]*">/,
    );
    const titleStart = html.indexOf("<h1", articleStart);
    const titleEnd = html.indexOf("</h1>", titleStart);
    const bodyStart = html.indexOf(
      '<div class="article-content">',
      articleStart,
    );
    if (
      articleStart < 0 ||
      titleStart < articleStart ||
      titleEnd < titleStart ||
      bodyStart < titleEnd
    ) {
      errors.push(`构建页面未使用 article-content：/${slug}`);
    }
  }
}

if (articleFiles.length !== articleSlugs.length) {
  errors.push(
    `文章源文件与索引数量不一致：源文件 ${articleFiles.length}，索引 ${articleSlugs.length}`,
  );
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  const breakCount = intentionalBreaks.reduce(
    (total, entry) => total + entry.count,
    0,
  );
  console.log(
    `Article typography validation passed: ${articleFiles.length} sources; ${hasBuiltSite ? `${builtArticles.length} built pages use article-content` : "built-page check skipped"}; no forbidden spacing markup.`,
  );
  console.log(
    `Intentional single <br> compatibility: ${breakCount} breaks across ${intentionalBreaks.length} articles.`,
  );
}
