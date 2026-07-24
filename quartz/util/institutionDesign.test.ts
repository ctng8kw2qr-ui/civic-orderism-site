import assert from "node:assert/strict";
import test from "node:test";
import institutionSections from "../../data/institution-sections.config.json";

const expectedIds = [
  "overview",
  "committee",
  "administration",
  "election",
  "council",
  "rule-of-law",
];

test("institution modules keep the public reading order", () => {
  assert.deepEqual(
    institutionSections.map((section) => section.id),
    expectedIds,
  );
  assert.deepEqual(
    institutionSections.map((section) => section.number),
    ["01", "02", "03", "04", "05", "06"],
  );
});

test("institution module assignments are complete and unique", () => {
  const slugs = institutionSections.flatMap((section) => section.articles);
  assert.equal(slugs.length, 16);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(
    institutionSections.every(
      (section) =>
        section.name.trim() !== "" &&
        section.description.trim() !== "" &&
        section.articles.length > 0,
    ),
  );
});
