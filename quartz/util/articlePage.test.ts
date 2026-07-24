import assert from "node:assert/strict";
import test from "node:test";
import { getContentArticleClasses, isArticleSlug } from "./articlePage";

test("recognizes article slugs across every article collection", () => {
  for (const slug of [
    "theory/example",
    "china/example",
    "china-stage/example",
    "civic-orderism/example",
    "institution/example",
  ]) {
    assert.equal(isArticleSlug(slug), true, slug);
  }
});

test("excludes home, archive, and collection index pages", () => {
  for (const slug of [
    "index",
    "articles",
    "china/index",
    "china",
    "institution-design",
    "topics/example",
  ]) {
    assert.equal(isArticleSlug(slug), false, slug);
  }
});

test("adds the shared article-content class without dropping frontmatter classes", () => {
  assert.deepEqual(getContentArticleClasses("china/example", ["legacy-copy"]), [
    "popover-hint",
    "article-content",
    "legacy-copy",
  ]);

  assert.deepEqual(getContentArticleClasses("china/index", ["archive"]), [
    "popover-hint",
    "archive",
  ]);
});
