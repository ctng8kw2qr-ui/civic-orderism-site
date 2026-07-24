import assert from "node:assert/strict";
import test from "node:test";
import { isArticleSlug } from "./articlePage";

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
