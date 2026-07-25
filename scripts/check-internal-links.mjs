import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const publicDir = path.join(root, "public");
const siteOrigin = "https://civicorderism.com";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".html")) return [fullPath];
    return [];
  });
}

function pageUrlFor(filePath, html) {
  const canonical = html.match(
    /<link\b[^>]*\brel=(?:"canonical"|'canonical')[^>]*\bhref=(?:"([^"]+)"|'([^']+)')/i,
  );
  const canonicalHref = canonical?.[1] ?? canonical?.[2];
  if (canonicalHref) {
    const canonicalUrl = new URL(canonicalHref, siteOrigin);
    if (canonicalUrl.origin === siteOrigin) return canonicalUrl.href;
  }

  let relative = path.relative(publicDir, filePath).split(path.sep).join("/");
  if (relative === "index.html") return `${siteOrigin}/`;
  if (relative.endsWith("/index.html")) {
    relative = relative.slice(0, -"index.html".length);
  } else {
    relative = relative.slice(0, -".html".length);
  }
  return `${siteOrigin}/${relative}`;
}

function targetExists(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates =
    relative === ""
      ? ["index.html"]
      : [relative, `${relative}.html`, path.join(relative, "index.html")];

  return candidates.some((candidate) =>
    fs.existsSync(path.join(publicDir, candidate)),
  );
}

if (!fs.existsSync(publicDir)) {
  console.error("public/ 不存在；请先运行 npm run build");
  process.exit(1);
}

const htmlFiles = walk(publicDir);
const errors = [];
let checkedLinks = 0;

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const pageUrl = pageUrlFor(filePath, html);

  for (const match of html.matchAll(/\bhref=(?:"([^"]+)"|'([^']+)')/gi)) {
    const href = match[1] ?? match[2];
    if (
      !href ||
      href.startsWith("#") ||
      /^(?:mailto|tel|javascript|data):/i.test(href)
    ) {
      continue;
    }

    let target;
    try {
      target = new URL(href, pageUrl);
    } catch {
      errors.push(`${path.relative(root, filePath)} 包含无效链接：${href}`);
      continue;
    }

    if (target.origin !== siteOrigin) continue;

    checkedLinks += 1;
    if (!targetExists(target.pathname)) {
      errors.push(
        `${path.relative(root, filePath)} → ${target.pathname}（来自 ${href}）`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Internal link check passed: ${checkedLinks} links across ${htmlFiles.length} HTML pages.`,
  );
}
