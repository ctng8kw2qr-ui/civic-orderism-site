import fs from "node:fs";
import path from "node:path";

/**
 * Guard: the published Public Commitments page must keep its structure.
 *
 * `/about/commitments` is not an article — it is a versioned institutional
 * record. Its value depends on every commitment keeping a stable ID and on the
 * version machinery staying visible. Those are exactly the things a later edit
 * could quietly drop: renumber the IDs, trim the change log, or soften the
 * clause that forbids silent edits.
 *
 * This check runs against build output, not source, for the same reason the raw
 * markup guard does: a page can look right in Markdown and still ship wrong.
 *
 * Deliberately narrow. It asserts presence, never wording style, so ordinary
 * copy edits stay free. What it will catch is a commitment disappearing, an ID
 * being renumbered, the status field being dropped, or the version rules and
 * change log being removed.
 */

const root = path.resolve(".");
const publicDir = path.join(root, "public");
const pagePath = path.join(publicDir, "about", "commitments.html");

/** Stable IDs. Once published these are permanent and must never be reassigned. */
const COMMITMENT_IDS = [
  "PC-001",
  "PC-002",
  "PC-003",
  "PC-004",
  "PC-005",
  "PC-006",
  "PC-007",
  "PC-008",
];

/**
 * Core sentences that carry the meaning of specific commitments. Losing any of
 * these would change what was promised, so they are treated as structure rather
 * than as prose.
 */
const CORE_SEMANTICS = [
  ["PC-002 责任区分", "不清算，不等于不追责"],
  ["PC-002 身份不是罪名", "身份本身不能成为罪名"],
  ["PC-005 过渡机构必须解散", "临时机构必须解散"],
  ["PC-006 权力边界", "个人可以推动制度建立，但不能让制度最终依赖个人存在"],
  ["PC-008 禁止静默修改", "不得被静默修改"],
];

/** Version machinery that makes the record auditable. */
const VERSION_MACHINERY = [
  ["版本号", "版本 1.0"],
  ["生效日期", "生效日期"],
  ["状态字段", "状态"],
  ["首次发布字段", "首次发布"],
  ["最近实质修订字段", "最近实质修订"],
  ["实质修改定义", "实质修改"],
  ["变更记录", "变更记录"],
];

if (!fs.existsSync(publicDir)) {
  console.error(
    "Public commitments check needs a build first: `public/` not found. Run `npm run build`.",
  );
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  console.error(
    "Public commitments check failed: /about/commitments did not build. Expected public/about/commitments.html.",
  );
  process.exit(1);
}

const html = fs.readFileSync(pagePath, "utf8");
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

const missing = [];

for (const id of COMMITMENT_IDS) {
  if (!text.includes(id)) missing.push(`承诺编号 ${id}`);
}

for (const [label, needle] of CORE_SEMANTICS) {
  if (!text.includes(needle)) missing.push(`${label} —「${needle}」`);
}

for (const [label, needle] of VERSION_MACHINERY) {
  if (!text.includes(needle)) missing.push(`${label} —「${needle}」`);
}

if (missing.length > 0) {
  console.error(
    "Public commitments check failed. Missing from the built page:",
  );
  for (const item of missing) console.error(`  - ${item}`);
  console.error(
    "\nCommitment IDs are permanent. If a commitment was intentionally retired, keep its ID and record the change in the change log rather than deleting it.",
  );
  process.exit(1);
}

console.log(
  `Public commitments check passed: ${COMMITMENT_IDS.length} stable IDs, ${CORE_SEMANTICS.length} core semantics and ${VERSION_MACHINERY.length} version fields present in public/about/commitments.html.`,
);
