import fs from "node:fs";
import path from "node:path";

/**
 * Guard: V6 structural markup must never reach a reader as visible text.
 *
 * A blank line between two top-level HTML blocks in a Markdown page ends the
 * HTML block. The next indented tag is then parsed as an indented code block and
 * is served escaped inside `<pre><code>` — the page shows its own markup instead
 * of rendering it. That is what happened to the homepage research-areas list in
 * PR #35: the editorial figure was inserted between the section head and the
 * `<ol class="v6-areas">`, the blank line that followed the figure closed the
 * block, and the list shipped as source text.
 *
 * Build output is the right place to check, because the defect exists only after
 * Markdown parsing: the source looks like ordinary markup and every other gate
 * passed while production was visibly broken.
 *
 * Deliberately narrow: it fails only when a V6 structural class appears inside a
 * `<pre>`/`<code>` block. Legitimate code samples in articles do not contain
 * these class names.
 */

const root = path.resolve(".");
const publicDir = path.join(root, "public");

/** Structural classes that carry V6 page layout. */
const V6_STRUCTURAL_CLASSES = [
  "v6-areas",
  "v6-section",
  "v6__container",
  "v6-eyebrow",
  "v6-primary-visual",
  "v6-who",
  "v6-org",
  "v6-transition",
  "inst4l-row",
  "inst4l-hero",
  "inst4l-section",
  "inst4l-list",
  "start-page__sections",
  "reading-route",
  "knowledge-browser",
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".html")) return [fullPath];
    return [];
  });
}

if (!fs.existsSync(publicDir)) {
  console.error(
    "Raw markup check needs a build first: `public/` not found. Run `npm run build`.",
  );
  process.exitCode = 1;
} else {
  const htmlFiles = walk(publicDir);
  const errors = [];

  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, "utf8");
    const codeBlocks = html.match(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi) ?? [];
    for (const block of codeBlocks) {
      for (const className of V6_STRUCTURAL_CLASSES) {
        if (block.includes(className)) {
          errors.push(
            `${path.relative(root, filePath)} 把 V6 结构标记渲染成了可见代码块：${className}`,
          );
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Raw markup check passed: no V6 structural markup inside <pre>/<code> across ${htmlFiles.length} HTML pages.`,
    );
  }
}
