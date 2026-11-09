import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  contactBoundaryContract,
  institutionArchiveContract,
  elementsByClass,
  elementById,
} from "./release-contracts.mjs";
const read = (p) =>
  fs.readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const contact = read("content/participate.md");
const preparation = read("content/preparation.md");
const directory = read("content/institution-design/index.md");
const sections = JSON.parse(read("data/institution-sections.config.json"));
const extra = JSON.parse(read("data/civic-orderism.config.json"))
  .institutionArchive.extraItems;
const contract = (html) => institutionArchiveContract(html, sections, extra);

test("published contact wording preserves all identity, appointment and authorization boundaries", () => {
  assert.ok(
    Object.values(contactBoundaryContract(contact, preparation)).every(Boolean),
  );
  assert.equal(
    contactBoundaryContract(
      contact.replace("都不产生组织身份", "都产生组织身份"),
      preparation,
    ).contactDoesNotGrantRole,
    false,
  );
  assert.equal(
    contactBoundaryContract(
      contact.replace("法律程序完成后", "开始沟通后"),
      preparation,
    ).contactIsNotAppointment,
    false,
  );
  assert.equal(
    contactBoundaryContract(
      contact.replaceAll("未经正式授权", "已经对外授权"),
      preparation,
    ).authorization,
    false,
  );
  assert.equal(
    contactBoundaryContract(
      contact,
      preparation.replace(
        "不会通过公开报名直接产生董事资格",
        "报名直接产生董事资格",
      ),
    ).noPublicAppointment,
    false,
  );
  assert.equal(
    contactBoundaryContract(
      contact.replaceAll("/preparation/board", "/unrelated-page"),
      preparation,
    ).boardEntry,
    false,
  );
});
test("central archive contains each configured article exactly once with correct filter labels", () => {
  const c = contract(directory);
  assert.ok(c.complete && c.flat && c.knownModules && c.correctAssignments);
  const first = elementsByClass(
    directory,
    "article",
    "knowledge-card--institution",
  )[0];
  assert.equal(contract(directory.replace(first, "")).complete, false);
  assert.equal(contract(directory + first).complete, false);
  assert.equal(
    contract(
      directory.replace(
        'data-institution-section="council"',
        'data-institution-section="parliament"',
      ),
    ).knownModules,
    false,
  );
});
test("archive rejects the original nested-card regression even when all article links remain present", () => {
  const index = directory.lastIndexOf(
    "<article",
    directory.indexOf('href="/civic-orderism/why-weaken-party-politics"'),
  );
  const broken =
    directory.slice(0, index).replace(/<\/article>\s*$/, "") +
    directory.slice(index);
  assert.equal(contract(broken).flat, false);
});
test("structural boundaries ignore earlier repeated status words and retain nested contents", () => {
  const html =
    '<p>筹备不等于已经成立</p><section id="boundaries"><p>法律边界</p><section>嵌套内容</section><p>授权责任</p></section><section>其他</section>';
  const region = elementById(html, "boundaries");
  assert.ok(
    region.includes("授权责任") &&
      region.includes("嵌套内容") &&
      !region.includes("其他"),
  );
  assert.equal(elementById(html, "missing"), "");
});
