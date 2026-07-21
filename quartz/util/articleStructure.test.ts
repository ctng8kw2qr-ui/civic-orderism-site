import assert from "node:assert";
import { describe, test } from "node:test";
import { MAX_CORE_JUDGMENTS, normalizeCoreJudgments } from "./articleStructure";

describe("normalizeCoreJudgments", () => {
  test("normalizes and deduplicates a valid list", () => {
    assert.deepStrictEqual(
      normalizeCoreJudgments([" 第一条 ", "第二条", "第一条"]),
      ["第一条", "第二条"],
    );
  });

  test("uses the first populated field for legacy alias compatibility", () => {
    assert.deepStrictEqual(
      normalizeCoreJudgments(undefined, [], ["旧字段一", "旧字段二"]),
      ["旧字段一", "旧字段二"],
    );
  });

  test("requires at least two judgments", () => {
    assert.strictEqual(normalizeCoreJudgments(["只有一条"]), undefined);
  });

  test("limits the list to the schema maximum", () => {
    const judgments = Array.from(
      { length: MAX_CORE_JUDGMENTS + 2 },
      (_, index) => `判断${index + 1}`,
    );
    assert.strictEqual(
      normalizeCoreJudgments(judgments)?.length,
      MAX_CORE_JUDGMENTS,
    );
  });
});
