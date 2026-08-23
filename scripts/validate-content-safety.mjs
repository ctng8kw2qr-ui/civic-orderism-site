import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const root = path.resolve(".");
const migration = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
);
const institutionSections = JSON.parse(
  fs.readFileSync(
    path.join(root, "data/institution-sections.config.json"),
    "utf8",
  ),
);
const institutionArticleSlugs = new Set(
  institutionSections.flatMap((section) => section.articles),
);
const reclassifiedArticleSlug = "institution/despotism-cancer-ming-1566";
const retitledArticleSlug = "china/security-led-governance-model";
const retitledArticle = {
  title: "安全化、再集中与治理边界",
  subtitle: "理解后改革时代中共政治运行的一套模型",
};
const approvedRelatedArticleChanges = new Set([
  "china/party-state-stress-neither-party-nor-state",
  "china/route-transition-why-ccp-keeps-purging-officials",
  "china/security-is-redefining-china",
  "china/security-led-governance-model",
  "china/supply-side-reform-state-can-scale-not-discover-future",
  "china/what-happens-when-security-becomes-the-top-priority",
]);
const approvedCopyNormalizations = new Map([
  [
    "china-stage/three-cleans-era-political-economic-cultural-contraction",
    ["不按政治身份实施普遍追责"],
  ],
  ["civic-orderism/why-civic-orderism", ["不必然意味着按政治身份实施普遍追责"]],
  [
    "civic-orderism/north-america-nonprofit-board-preparation-manifesto",
    ["不以政治身份实施普遍追责", "认同不革命、不清算、不以报复为目的"],
  ],
  [
    "civic-orderism/possibility-of-peaceful-political-transition-in-china",
    ["政治责任、历史责任和依法确认的犯罪责任"],
  ],
  [
    "civic-orderism/peaceful-state-transition",
    ["政治责任、历史责任与依法确认的犯罪责任"],
  ],
  [
    "civic-orderism/why-civic-orderism-is-easier-to-succeed",
    ["不追究任何依法确认的犯罪责任", "按政治身份实施普遍追责"],
  ],
]);
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const historicalArticles = migration.filter((article) => {
  const relative = `content/${article.slug}.md`;
  try {
    execFileSync("git", ["cat-file", "-e", `HEAD:${relative}`], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
});

const sampleIndexes = Array.from({ length: 20 }, (_, index) =>
  Math.floor((index * historicalArticles.length) / 20),
);
const sample = [
  ...new Set(sampleIndexes.map((index) => historicalArticles[index])),
];

for (const article of sample) {
  const relative = `content/${article.slug}.md`;
  const current = fs.readFileSync(path.join(root, relative));
  const committed = execFileSync("git", ["show", `HEAD:${relative}`], {
    cwd: root,
  });
  if (approvedCopyNormalizations.has(article.slug)) {
    const currentArticle = matter(current.toString("utf8"));
    const committedArticle = matter(committed.toString("utf8"));
    if (article.slug === "civic-orderism/peaceful-state-transition") {
      delete currentArticle.data.summary;
      delete committedArticle.data.summary;
    }
    assert(
      JSON.stringify(currentArticle.data) ===
        JSON.stringify(committedArticle.data),
      `责任与品牌表述统一不应修改文章元数据：${relative}`,
    );
    for (const requiredText of approvedCopyNormalizations.get(article.slug)) {
      assert(
        currentArticle.content.includes(requiredText),
        `责任与品牌表述统一缺少目标文案：${relative} -> ${requiredText}`,
      );
    }
  } else if (article.slug === retitledArticleSlug) {
    const currentArticle = matter(current.toString("utf8"));
    const committedArticle = matter(committed.toString("utf8"));
    const subtitlePattern = /<p class="subtitle">.*?<\/p>/;
    const currentSubtitle = currentArticle.content.match(subtitlePattern)?.[0];
    const currentBody = currentArticle.content
      .replace(/^# .*$/m, "")
      .replace(subtitlePattern, "");
    const committedBody = committedArticle.content
      .replace(/^# .*$/m, "")
      .replace(subtitlePattern, "");
    committedArticle.data.title = currentArticle.data.title;
    assert(
      currentArticle.data.title === retitledArticle.title,
      `文章标题没有更新为指定文案：${relative}`,
    );
    assert(
      currentSubtitle === `<p class="subtitle">${retitledArticle.subtitle}</p>`,
      `文章副标题没有更新为指定文案：${relative}`,
    );
    assert(
      currentBody === committedBody,
      `标题调整不应修改文章正文：${relative}`,
    );
    assert(
      JSON.stringify(currentArticle.data) ===
        JSON.stringify(committedArticle.data),
      `标题调整包含未授权的元数据变化：${relative}`,
    );
  } else if (
    institutionArticleSlugs.has(article.slug) ||
    article.slug === reclassifiedArticleSlug ||
    approvedRelatedArticleChanges.has(article.slug)
  ) {
    const currentArticle = matter(current.toString("utf8"));
    const committedArticle = matter(committed.toString("utf8"));
    const allowedKeys = approvedRelatedArticleChanges.has(article.slug)
      ? ["relatedArticles"]
      : institutionArticleSlugs.has(article.slug)
        ? ["institutionSection", "summary"]
        : ["category", "topics"];
    for (const key of allowedKeys) {
      delete currentArticle.data[key];
      delete committedArticle.data[key];
    }
    assert(
      currentArticle.content === committedArticle.content,
      `历史文章正文发生变化：${relative}`,
    );
    assert(
      JSON.stringify(currentArticle.data) ===
        JSON.stringify(committedArticle.data),
      `历史文章包含未授权的元数据变化：${relative}`,
    );
  } else {
    assert(current.equals(committed), `历史文章发生字节级变化：${relative}`);
  }
}

for (const [slug, requiredTexts] of approvedCopyNormalizations) {
  const relative = `content/${slug}.md`;
  const currentArticle = matter(
    fs.readFileSync(path.join(root, relative), "utf8"),
  );
  const committedArticle = matter(
    execFileSync("git", ["show", `HEAD:${relative}`], { cwd: root }).toString(
      "utf8",
    ),
  );
  if (slug === "civic-orderism/peaceful-state-transition") {
    delete currentArticle.data.summary;
    delete committedArticle.data.summary;
  }
  assert(
    JSON.stringify(currentArticle.data) ===
      JSON.stringify(committedArticle.data),
    `责任与品牌表述统一不应修改文章元数据：${relative}`,
  );
  for (const requiredText of requiredTexts) {
    assert(
      currentArticle.content.includes(requiredText),
      `责任与品牌表述统一缺少目标文案：${relative} -> ${requiredText}`,
    );
  }
}

const documents = [
  "civic-orderism-founding-board-brief-2026.pdf",
  "civic-orderism-introduction-manual.pdf",
];
for (const filename of documents) {
  const source = path.join(root, "quartz/static/files", filename);
  const built = path.join(root, "public/files", filename);
  assert(fs.existsSync(source), `源 PDF 不存在：${source}`);
  assert(fs.existsSync(built), `构建 PDF 不存在：${built}`);
  if (fs.existsSync(source) && fs.existsSync(built)) {
    assert(
      fs.readFileSync(source).equals(fs.readFileSync(built)),
      `构建后的 PDF 与源文件不一致：${filename}`,
    );
  }
}

const requiredDocumentLinks = new Map([
  ["content/index.md", ["civic-orderism-founding-board-brief-2026.pdf"]],
  ["content/about.md", documents],
]);
for (const [page, filenames] of requiredDocumentLinks) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  for (const filename of filenames) {
    assert(
      source.includes(`/files/${filename}`),
      `${page} 缺少 PDF 入口：${filename}`,
    );
  }
}

if (errors.length) {
  console.error(errors.map((item) => `- ${item}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Historical content safety passed: ${sample.length} sampled articles retain byte-identical bodies (allowing approved metadata migrations); ${documents.length} PDF sources and public copies match.`,
  );
  console.log(sample.map((article) => `- ${article.slug}`).join("\n"));
}
