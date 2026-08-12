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
const articleSourceBySlug = new Map();
const errors = [];
const intentionalBreaks = [];
const localCoreJudgmentLabels = [];

for (const filePath of articleFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const relative = path.relative(root, filePath);
  const sourceSlug = source.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  const fallbackSlug = path
    .relative(contentDir, filePath)
    .replaceAll(path.sep, "/")
    .replace(/\.md$/, "");
  articleSourceBySlug.set(sourceSlug || fallbackSlug, source);

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

  const localLabelPatterns = [
    /^#{2,4}\s+核心判断\s*$/gm,
    /^>\s+(?:\*\*)?核心判断(?:\*\*)?\s*[：:]/gm,
  ];
  for (const pattern of localLabelPatterns) {
    for (const match of source.matchAll(pattern)) {
      localCoreJudgmentLabels.push({
        file: relative,
        line: lineNumberFor(source, match.index ?? 0),
      });
    }
  }
}

const contentComponent = fs.readFileSync(
  path.join(root, "quartz/components/pages/Content.tsx"),
  "utf8",
);
const articleHeaderComponent = fs.readFileSync(
  path.join(root, "quartz/components/ArticleHeader.tsx"),
  "utf8",
);
const articleTypography = fs.readFileSync(
  path.join(root, "quartz/styles/articleTypography.scss"),
  "utf8",
);
const articleLayout = fs.readFileSync(
  path.join(root, "quartz.layout.ts"),
  "utf8",
);
if (
  !contentComponent.includes('class="article-content"') ||
  !contentComponent.includes("isArticleSlug") ||
  !contentComponent.includes("article-page")
) {
  errors.push("Content.tsx 未使用统一文章正文容器");
}
if (
  !articleHeaderComponent.includes('class="article-header"') ||
  !articleHeaderComponent.includes('class="article-header__title"') ||
  !articleHeaderComponent.includes('class="article-header__subtitle"') ||
  !articleLayout.includes("Component.ArticleHeader()")
) {
  errors.push("文章页未使用统一 ArticleHeader");
}

const requiredTypographyTokens = [
  "--article-reading-width: 760px",
  "--article-font-size: 17px",
  "--article-line-height: 1.9",
  "--article-paragraph-spacing: 1.25em",
  "--article-font-size: 16px",
  "--article-line-height: 1.85",
];
for (const token of requiredTypographyTokens) {
  if (!articleTypography.includes(token)) {
    errors.push(`统一文章排版缺少 token：${token}`);
  }
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
    const pageKind = html.includes('data-page-kind="article"');
    const headerStart = html.indexOf('<header class="article-header">');
    const titleStart = html.indexOf(
      '<h1 class="article-header__title">',
      headerStart,
    );
    const articleStart = html.search(
      /<article class="[^"]*\barticle-page\b[^"]*">/,
    );
    const bodyStart = html.indexOf(
      '<div class="article-content">',
      articleStart,
    );
    const bodyEnd = html.indexOf("</article>", bodyStart);
    const articleBody = html.slice(bodyStart, bodyEnd);
    const coreJudgmentCards = (
      html.match(/class="article-core-judgments key-points-card"/g) ?? []
    ).length;
    const hasCoreJudgments =
      /^(?:coreJudgments|core_judgments|keyPoints|key_points):\s*\n\s+-\s+/m.test(
        articleSourceBySlug.get(slug) ?? "",
      );
    if (
      !pageKind ||
      headerStart < 0 ||
      titleStart < headerStart ||
      articleStart < 0 ||
      bodyStart < articleStart ||
      html.slice(bodyStart).includes('<p class="subtitle">')
    ) {
      errors.push(`构建页面未使用统一文章头部与正文容器：/${slug}`);
    }
    if (
      coreJudgmentCards > 1 ||
      coreJudgmentCards !== Number(hasCoreJudgments)
    ) {
      errors.push(`本文核心判断模块数量异常：/${slug}`);
    }
    if (/>(?:\s|<[^>]+>)*核心判断(?:\s|<[^>]+>)*[：:]?/.test(articleBody)) {
      errors.push(`正文仍显示全文级“核心判断”标签：/${slug}`);
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
    `Article typography validation passed: ${articleFiles.length} sources; ${hasBuiltSite ? `${builtArticles.length} built pages use ArticleHeader + article-content` : "built-page check skipped"}; centralized typography tokens present; no forbidden spacing markup.`,
  );
  console.log(
    `Intentional single <br> compatibility: ${breakCount} breaks across ${intentionalBreaks.length} articles.`,
  );
  console.log(
    `Legacy local judgment labels normalized at render time: ${localCoreJudgmentLabels.length} labels across ${new Set(localCoreJudgmentLabels.map((entry) => entry.file)).size} articles.`,
  );
}
