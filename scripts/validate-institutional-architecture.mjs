import fs from "node:fs";
import path from "node:path";

/**
 * Guard: the institutional architecture map must keep its six layers, its
 * commitment bindings and its honesty about maturity.
 *
 * `/civic-orderism/institutional-architecture` is a map, not an essay. Its only
 * value is that a reader can see which parts of the system exist, how mature
 * each one is, and which public commitment constrains it. A later edit could
 * quietly destroy that: drop a layer, unlink a commitment, or — the failure
 * this page is most exposed to — let the transition layer start reading as if a
 * concrete plan exists when the site itself says none has been published.
 *
 * Runs against build output, like the other structure guards, because the page
 * can be correct in Markdown and still ship wrong.
 *
 * Deliberately narrow: it asserts presence, never wording. Copy edits stay free.
 */

const root = path.resolve(".");
const publicDir = path.join(root, "public");
const pagePath = path.join(publicDir, "institutional-architecture.html");

/** The six layers the map is built from. Losing one breaks the architecture. */
const LAYERS = [
  ["政治过渡", "01"],
  ["国家连续运行", "02"],
  ["代表与选举", "03A"],
  ["权力制约与责任", "03B"],
  ["法律与司法", "03C"],
  ["过渡权力如何退出", "04"],
];

/**
 * Commitment cross-references. The architecture is only credible if it is
 * visibly bound to the versioned commitments, so these links are structure.
 */
const COMMITMENT_REFS = [
  "PC-001",
  "PC-002",
  "PC-003",
  "PC-005",
  "PC-006",
  "PC-007",
];

/**
 * Sentences that must not disappear. The responsibility distinction is the one
 * most likely to be lost during a rewrite of the justice layer, and losing it
 * would turn "no political settlement" into "no accountability".
 */
const CORE_SEMANTICS = [
  ["责任区分", "不清算，不等于不追责"],
  ["身份不是罪名", "身份本身不能成为罪名"],
  ["退出是设计的一部分", "退出本身必须写进制度设计"],
  ["不存在永久临时机构", "不存在永久临时机构"],
];

/** Coverage the continuity layer claims. Quietly trimming this would weaken PC-003. */
const CONTINUITY_COVERAGE = ["养老金", "银行", "地方政府", "警察", "教育"];

/** Maturity vocabulary. All three levels must be available to readers. */
const MATURITY = ["已公开", "研究中", "待建立"];

/**
 * The page must not claim more than the site supports. These phrases would
 * assert a finished plan where none has been published.
 */
const FORBIDDEN_OVERCLAIMS = ["过渡方案已完成", "制度设计已完成", "最终制度"];

if (!fs.existsSync(publicDir)) {
  console.error(
    "Institutional architecture check needs a build first: `public/` not found. Run `npm run build`.",
  );
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  console.error(
    "Institutional architecture check failed: the map did not build. Expected institutional-architecture.html.",
  );
  process.exit(1);
}

const html = fs.readFileSync(pagePath, "utf8");
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

const missing = [];

for (const [label, num] of LAYERS) {
  if (!text.includes(label)) missing.push(`层级 ${num} ${label}`);
}

for (const ref of COMMITMENT_REFS) {
  if (!text.includes(ref)) missing.push(`公开承诺交叉引用 ${ref}`);
}

for (const [label, needle] of CORE_SEMANTICS) {
  if (!text.includes(needle)) missing.push(`${label} —「${needle}」`);
}

for (const item of CONTINUITY_COVERAGE) {
  if (!text.includes(item)) missing.push(`连续运行覆盖 ${item}`);
}

for (const level of MATURITY) {
  if (!text.includes(level)) missing.push(`成熟度级别 ${level}`);
}

for (const phrase of FORBIDDEN_OVERCLAIMS) {
  if (text.includes(phrase)) missing.push(`不应出现的完成度表述「${phrase}」`);
}

if (missing.length > 0) {
  console.error("Institutional architecture check failed:");
  for (const item of missing) console.error(`  - ${item}`);
  console.error(
    "\nThe map must keep all six layers, its commitment bindings and all three maturity levels. Do not upgrade a layer's maturity without published text behind it.",
  );
  process.exit(1);
}

console.log(
  `Institutional architecture check passed: ${LAYERS.length} layers, ${COMMITMENT_REFS.length} commitment references, ${MATURITY.length} maturity levels present in institutional-architecture.html.`,
);
