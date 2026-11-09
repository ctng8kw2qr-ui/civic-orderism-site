import test from "node:test";
import assert from "node:assert/strict";
import { selectHomepageResearch } from "./homepageResearch";
import { QuartzPluginData } from "../plugins/vfile";
const page = (slug: string, date: string, extra = {}) =>
  ({
    slug,
    frontmatter: { title: slug, date, status: "published", ...extra },
  }) as unknown as QuartzPluginData;
test("editorial lead overrides newest; newest list excludes lead, drafts and core statement", () => {
  const result = selectHomepageResearch([
    page("china/old", "2025-01-01", { homepageLead: true }),
    page("china/latest", "2026-11-01"),
    page("china/next", "2026-10-01"),
    page("china/draft", "2027-01-01", { draft: true }),
    page("civic-orderism/manifesto", "2028-01-01", {
      corePoliticalStatement: true,
    }),
    page("topics/example", "2029-01-01"),
  ]);
  assert.equal(result.lead?.slug, "china/old");
  assert.deepEqual(
    result.secondary.map((p) => p.slug),
    ["china/latest", "china/next"],
  );
});
test("fallback and multiple markers use date then slug without mutating input", () => {
  const files = [page("china/z", "2026-01-01"), page("china/a", "2026-01-01")];
  assert.equal(selectHomepageResearch(files).lead?.slug, "china/a");
  assert.equal(files[0].slug, "china/z");
  assert.equal(
    selectHomepageResearch(
      files.map((p) => ({
        ...p,
        frontmatter: { ...p.frontmatter!, homepageLead: "true" },
      })),
    ).markedCount,
    2,
  );
  assert.equal(selectHomepageResearch([]).lead, undefined);
});
