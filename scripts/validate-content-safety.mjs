import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(".");
const migration = JSON.parse(
  fs.readFileSync(path.join(root, "content-migration-map.json"), "utf8"),
);
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
  assert(current.equals(committed), `历史文章发生字节级变化：${relative}`);
}

const documents = [
  "civic-orderism-introduction-manual.pdf",
  "civic-orderism-organization-manual.pdf",
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

for (const page of ["content/index.md", "content/about.md"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  for (const filename of documents) {
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
    `Historical content safety passed: ${sample.length} sampled articles are byte-identical to HEAD; ${documents.length} PDF sources and public copies match.`,
  );
  console.log(sample.map((article) => `- ${article.slug}`).join("\n"));
}
